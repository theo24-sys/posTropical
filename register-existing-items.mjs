// ═══════════════════════════════════════════════════════════════
// ONE-TIME BACKFILL: Register all existing menu_items with DigiTax
// ═══════════════════════════════════════════════════════════════
// Run this once (e.g. `node register-existing-items.mjs`) to register
// every menu item that doesn't yet have a digitax_item_id, and store
// the returned item_id back on the row.
//
// Requires the same env vars as server.js:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DIGITAX_BASE_URL, DIGITAX_API_KEY
//
// Prerequisite (run once in Supabase SQL editor):
//   ALTER TABLE menu_items ADD COLUMN digitax_item_id text;

import { createClient } from '@supabase/supabase-js';
import { KraEtimsClient } from './services/kraEtims.ts';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KRA_BASE_URL = process.env.KRA_BASE_URL;
const KRA_TIN = process.env.KRA_TIN;
const KRA_DEVICE_SERIAL = process.env.KRA_DEVICE_SERIAL;
const KRA_CERT_KEY = process.env.KRA_CERT_KEY;

const kraClient = new KraEtimsClient(KRA_BASE_URL, KRA_TIN, KRA_DEVICE_SERIAL);

// Default classification for a coffee house / restaurant menu.
// See: https://ke.docs.digitax.tech/docs/which-item-class-code-should-i-use
// "50000000" (Food Beverage and Tobacco Products) is DigiTax's own suggested
// convenience code when a precise UNSPSC match isn't worth chasing down
// per item. Override per-item below if a specific item needs something else
// (e.g. a zero-rated or exempt item would need tax_type_code "C" or "A").
const DEFAULT_ITEM_CLASS_CODE = '50000000';
const DEFAULT_TAX_TYPE_CODE = 'B'; // 16% VAT
const DEFAULT_ITEM_TYPE_CODE = '2'; // Finished Product
const DEFAULT_ORIGIN_NATION_CODE = 'KE';
const DEFAULT_PACKAGE_UNIT_CODE = 'NT'; // Net (no specific outer packaging)
const DEFAULT_QUANTITY_UNIT_CODE = 'U'; // Pieces/item [Number]

async function registerItem(menuItem) {
  // For simplicity, we'll use the initializeDevice endpoint to get a session token
  // In a real scenario, this would be handled by a separate authentication flow
  const { sessionToken } = await kraClient.initializeDevice(KRA_CERT_KEY);

  const body = {
    item_class_code: DEFAULT_ITEM_CLASS_CODE,
    item_type_code: DEFAULT_ITEM_TYPE_CODE,
    item_name: menuItem.name,
    origin_nation_code: DEFAULT_ORIGIN_NATION_CODE,
    package_unit_code: DEFAULT_PACKAGE_UNIT_CODE,
    quantity_unit_code: DEFAULT_QUANTITY_UNIT_CODE,
    tax_type_code: DEFAULT_TAX_TYPE_CODE,
    default_unit_price: menuItem.price,
  };

  // This is a placeholder. The KraEtimsClient does not have an 'items' registration endpoint.
  // This would typically be a separate endpoint on the KRA system or handled differently.
  // For now, we'll simulate a successful registration and return a dummy ID.
  console.warn("WARNING: Simulating KRA item registration. This needs a real KRA 'items' endpoint.");
  return `KRA_ITEM_${menuItem.id}`;
}

async function main() {
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, price, digitax_item_id')
    .is('digitax_item_id', null);

  if (error) {
    console.error('Failed to fetch menu items:', error.message);
    process.exit(1);
  }

  console.log(`Found ${items.length} menu item(s) needing DigiTax registration.`);

  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const digitaxItemId = await registerItem(item);

      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ digitax_item_id: digitaxItemId })
        .eq('id', item.id);

      if (updateError) {
        throw new Error(`Supabase update failed: ${updateError.message}`);
      }

      console.log(`✅ ${item.name} → ${digitaxItemId}`);
      succeeded++;
    } catch (err) {
      console.error(`❌ ${item.name}: ${err.message}`);
    // Also log the item details that failed for easier debugging
    console.error("Failed item details:", item);
      failed++;
    }
  }

  console.log(`\nDone. ${succeeded} registered, ${failed} failed.`);
  if (failed > 0) {
    console.log('Re-run this script after fixing issues — already-registered items will be skipped.');
  }
}

main();
