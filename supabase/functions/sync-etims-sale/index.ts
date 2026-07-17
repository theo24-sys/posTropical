// supabase/functions/sync-etims-sale/index.ts
// Deploy: supabase functions deploy sync-etims-sale
// Secrets: supabase secrets set DIGITAX_API_KEY=... DIGITAX_BUSINESS_ID=... DIGITAX_BASE_URL=...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DIGITAX_BASE_URL = Deno.env.get("DIGITAX_BASE_URL")!;
const DIGITAX_API_KEY = Deno.env.get("DIGITAX_API_KEY")!;
const DIGITAX_BUSINESS_ID = Deno.env.get("DIGITAX_BUSINESS_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaleItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate?: number; // default to 16% VAT if not provided
}

interface TransactionRecord {
  id: string;
  items: SaleItem[];
  total_amount: number;
  customer_pin?: string;
  customer_name?: string;
  branch_id?: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return jsonResponse({ error: "transaction_id is required" }, 400);
    }

    // 1. Fetch the transaction record
    const { data: sale, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .single<TransactionRecord>();

    if (fetchError || !sale) {
      return jsonResponse({ error: "Transaction not found", detail: fetchError?.message }, 404);
    }

    // 2. Build the DigiTax payload
    const payload = {
      business_id: DIGITAX_BUSINESS_ID,
      transaction_date: sale.created_at,
      customer_pin: sale.customer_pin || "P000000000Z", // KRA generic/unregistered buyer PIN
      customer_name: sale.customer_name || "Walk-in Customer",
      items: sale.items.map((item) => ({
        name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total,
        tax_rate: item.tax_rate ?? 16,
      })),
      total_amount: sale.total_amount,
      payment_method: "CASH", // adjust if you track payment type
    };

    // 3. Call DigiTax
    const digitaxRes = await fetch(`${DIGITAX_BASE_URL}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": DIGITAX_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const digitaxData = await digitaxRes.json();

    if (!digitaxRes.ok) {
      // 4a. Mark as failed, store error for retry/debugging
      await supabase
        .from("transactions")
        .update({
          etims_sync_status: "failed",
          etims_sync_error: JSON.stringify(digitaxData),
        })
        .eq("id", transaction_id);

      return jsonResponse(
        { error: "DigiTax sync failed", detail: digitaxData },
        digitaxRes.status
      );
    }

    // 4b. Success — write eTIMS details back to the sale row
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        etims_invoice_number: digitaxData.invoice_number,
        etims_control_number: digitaxData.kra_control_number,
        etims_qr_url: digitaxData.qr_code_url,
        etims_signature: digitaxData.invoice_signature,
        etims_sync_status: "success",
        etims_synced_at: new Date().toISOString(),
        etims_sync_error: null,
      })
      .eq("id", transaction_id);

    if (updateError) {
      return jsonResponse(
        { error: "Synced to DigiTax but failed to update sale row", detail: updateError.message },
        500
      );
    }

    return jsonResponse({
      success: true,
      invoice_number: digitaxData.invoice_number,
      qr_code_url: digitaxData.qr_code_url,
    });
  } catch (err) {
    return jsonResponse({ error: "Unexpected error", detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
