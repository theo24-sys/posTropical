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
const DIGITAX_BUSINESS_ID = process.env.DIGITAX_BUSINESS_ID;

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
    // Matches the real SaleTransaction shape: items = { id, name, quantity, price }[]
    // total_amount is on `total`, not `total_amount`; date is on `date`, not `created_at`.
    const payload = {
      business_id: DIGITAX_BUSINESS_ID,
      transaction_date: txn.date,
      customer_pin: 'P000000000Z', // generic KRA pin — SaleTransaction has no customer_pin field
      customer_name: 'Walk-in Customer',
      items: (txn.items || []).map((item) => ({
        id: item.id, // required by DigiTax's SalesPostReq schema — was previously omitted, causing 400s
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_amount: item.price * item.quantity,
        tax_rate: 16, // VAT — adjust here if any items are zero-rated/exempt
      })),
      total_amount: txn.total,
      payment_method: (txn.paymentMethod || 'CASH').toUpperCase().replace('-', ''),
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
