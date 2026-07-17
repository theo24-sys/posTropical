import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { KraEtimsClient } from './services/kraEtims.js';

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

const KRA_BASE_URL = process.env.KRA_BASE_URL;
const KRA_TIN = process.env.KRA_TIN;
const KRA_DEVICE_SERIAL = process.env.KRA_DEVICE_SERIAL;
const KRA_CERT_KEY = process.env.KRA_CERT_KEY;

const kraClient = new KraEtimsClient(KRA_BASE_URL, KRA_TIN, KRA_DEVICE_SERIAL);

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

async function getKraPayload(txn) {
  const { data: dbItems, error } = await supabase
    .from('menu_items')
    .select('id, name, item_class_code, package_unit_code, quantity_unit_code, price, tax_type_code, digitax_item_id')
    .in('id', txn.items.map(i => i.id));

  if (error || !dbItems) throw new Error('Failed to fetch menu items for KRA mapping');

  const kraItemList = txn.items.map((item, index) => {
    const dbItem = dbItems.find(db => db.id === item.id);
    const lineTotal = item.price * item.quantity;

    return {
      itemSeq: index + 1,
      itemCd: dbItem?.digitax_item_id || dbItem?.item_class_code || '50000000',
      itemNm: item.name,
      pkgUnitCd: dbItem?.package_unit_code || 'NT',
      qtyUnitCd: dbItem?.quantity_unit_code || 'U',
      unitPrice: item.price,
      qty: item.quantity,
      totAmt: lineTotal,
      taxTyCd: dbItem?.tax_type_code || 'B'
    };
  });

  const totAmt = kraItemList.reduce((sum, item) => sum + item.totAmt, 0);
  const totTaxblAmt = totAmt / 1.16;
  const totTaxAmt = totAmt - totTaxblAmt;

  return {
    trnsNo: Date.now(),
    docNo: `INV-${txn.id}`,
    receiptTypeCode: 'S',
    paymentTypeCode: mapPaymentTypeCode(txn.paymentMethod),
    totItemCnt: kraItemList.length,
    totTaxblAmt: parseFloat(totTaxblAmt.toFixed(2)),
    totTaxAmt: parseFloat(totTaxAmt.toFixed(2)),
    totAmt: parseFloat(totAmt.toFixed(2)),
    itemList: kraItemList
  };
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
    // Use the KRA payload builder
    const payload = await getKraPayload(txn);

    // 3. Call KRA eTIMS
    // First, initialize device to get a session token (in a real scenario, this would be cached/managed)
    const { sessionToken } = await kraClient.initializeDevice(KRA_CERT_KEY);

    const kraRes = await kraClient.transmitInvoice(payload, sessionToken);

    // Assuming kraRes contains a success indicator or throws on failure
    // For now, we'll check for a specific field that indicates success
    if (!kraRes || kraRes.responseCode !== '00') {
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
          etims_invoice_number: kraRes.invoiceNo,
          etims_control_number: kraRes.controlCode,
          etims_qr_url: kraRes.qrCodeUrl,
          etims_signature: kraRes.signature,
          etims_sync_status: 'success',
          etims_synced_at: new Date().toISOString(),
          etims_sync_error: null,
        })
        .eq('id', transaction_id);

    if (updateError) {
      return res.status(500).json({ error: 'Synced to KRA eTIMS but failed to update transaction row', detail: updateError.message });
    }

    return res.json({
      success: true,
      invoice_number: kraRes.invoiceNo,
      qr_code_url: kraRes.qrCodeUrl,
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
