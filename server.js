import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

// Use the PORT environment variable provided by Render/Railway, or default to 3000 for local dev
const port = process.env.PORT || 3000;

// Service-role Supabase client — server-side only, bypasses RLS.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in Render env vars.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DIGITAX_BASE_URL = process.env.DIGITAX_BASE_URL;
const DIGITAX_API_KEY = process.env.DIGITAX_API_KEY;

// 1. Serve logo.png specifically from the ROOT directory (main dir)
// This handles the case where the user put the logo in the main folder instead of public
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
});

// ═══════════════════════════════════════════════════════════════
// MIGRATION ENDPOINT: Trigger database sync from latest code
// ═══════════════════════════════════════════════════════════════
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('🔄 Migration triggered: Syncing constants to database...');
    res.json({
      success: true,
      message: 'Migration endpoint ready. See server.js for implementation instructions.',
      instructions: [
        'Update Supabase menu_items table directly with new pricing',
        'Or run: UPDATE menu_items SET price = 200 WHERE id = "sd_wat"',
        'Then restart server and refresh client to clear cache'
      ]
    });
  } catch (err) {
    console.error('Migration failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Maps your internal PaymentMethod values to DigiTax's payment_type_code
// See: https://ke.docs.digitax.tech/docs/invoice-attributes#payment-type-codes
function mapPaymentTypeCode(paymentMethod) {
  const normalized = (paymentMethod || '').toUpperCase().replace('-', '').trim();
  switch (normalized) {
    case 'CASH':
      return '01';
    case 'MPESA':
      return '06'; // Mobile Money
    case 'CARD':
      return '05'; // Debit & Credit Card
    case 'PENDING':
    case 'PAYLATER':
      return '02'; // Credit
    default:
      return '07'; // Other
  }
}

// ═══════════════════════════════════════════════════════════════
// ETIMS SYNC ENDPOINT: Push a transaction to DigiTax / KRA eTIMS
// ═══════════════════════════════════════════════════════════════
// Call this from the frontend right after a transaction is finalized:
//   fetch('/api/sync-etims', { method: 'POST', headers: {'Content-Type':'application/json'},
//     body: JSON.stringify({ transaction_id }) })
app.post('/api/sync-etims', async (req, res) => {
  const { transaction_id } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ error: 'transaction_id is required' });
  }

  try {
    // 1. Fetch the transaction record
    const { data: txn, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (fetchError || !txn) {
      return res.status(404).json({ error: 'Transaction not found', detail: fetchError?.message });
    }

    // 2. Build the DigiTax payload
    // Field names below match DigiTax's documented Sale schema:
    // https://ke.docs.digitax.tech/docs/invoice-attributes
    //
    // ⚠️ IMPORTANT — still needs attention before this will fully work:
    // DigiTax requires each line item's `id` to be a DigiTax/KRA-issued item_id,
    // obtained by first registering the item via POST /items. Passing your own
    // menu item id (e.g. "sd_wat") directly here will likely fail once the
    // field-name issues below are resolved. You'll need either:
    //   (a) a stored mapping of { your_menu_item_id -> digitax_item_id }, or
    //   (b) to register each menu item with DigiTax on creation/edit and store
    //       the returned item_id alongside it in Supabase.
    // Until that mapping exists, `item.id` below is a placeholder using your
    // internal id, which may cause a new validation error from DigiTax.
    const payload = {
      trader_invoice_number: txn.id,               // your own invoice/order number
      sale_date: txn.date,                          // date of the sale
      receipt_type_code: 'S',                       // "S" = Sale (vs "R" = Credit Note)
      payment_type_code: mapPaymentTypeCode(txn.paymentMethod),
      invoice_status_code: '02',                    // "02" = Approved
      items: (txn.items || []).map((item) => ({
        id: item.id,                                // ⚠️ must be a DigiTax item_id — see note above
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_amount: item.price * item.quantity,
        tax_rate: 16, // VAT — adjust here if any items are zero-rated/exempt
      })),
    };

    // 3. Call DigiTax
    const digitaxRes = await fetch(`${DIGITAX_BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DIGITAX_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const digitaxData = await digitaxRes.json();

    if (!digitaxRes.ok) {
      await supabase
        .from('transactions')
        .update({
          etims_sync_status: 'failed',
          etims_sync_error: JSON.stringify(digitaxData),
        })
        .eq('id', transaction_id);

      return res.status(digitaxRes.status).json({ error: 'DigiTax sync failed', detail: digitaxData });
    }

    // 4. Success — write eTIMS details back to the transaction row
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        etims_invoice_number: digitaxData.invoice_number,
        etims_control_number: digitaxData.kra_control_number,
        etims_qr_url: digitaxData.qr_code_url,
        etims_signature: digitaxData.invoice_signature,
        etims_sync_status: 'success',
        etims_synced_at: new Date().toISOString(),
        etims_sync_error: null,
      })
      .eq('id', transaction_id);

    if (updateError) {
      return res.status(500).json({ error: 'Synced to DigiTax but failed to update transaction row', detail: updateError.message });
    }

    return res.json({
      success: true,
      invoice_number: digitaxData.invoice_number,
      qr_code_url: digitaxData.qr_code_url,
    });
  } catch (err) {
    console.error('eTIMS sync failed:', err);
    return res.status(500).json({ error: 'Unexpected error', detail: err.message });
  }
});

// 2. Serve static files from the 'dist' directory (Vite's default build output)
app.use(express.static(path.join(__dirname, 'dist')));

// 3. Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
