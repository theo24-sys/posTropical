import { CountItem } from '../types';

// Seeded from the inventory documents:
//   Kitchen   — "Chefs Inventory.docx" (latest revision, 47 items)
//   Bar       — "Barista's Inventory.docx" (46 bar items, Received labels)
//   Front     — "Waitress and Steward's Inventory.docx" (29 items)
//   Supplier  — "Home Inventory Main.docx" — Silas' home/store stock
// Admin can extend/remove in the admin console once live; these are just the
// starting lists.

// Bump this string whenever the lists below change: the one-time seed sync
// (DB.syncCountItemsSeed) runs again for every device, pushes the lists to
// Supabase and retires the ids in RETIRED_COUNT_ITEM_IDS.
export const COUNT_SEED_VERSION = 'home-inventory-v1';

export const SEED_COUNT_ITEMS: CountItem[] = [
  // ── Chef / Kitchen — Chefs Inventory.docx (latest) ──
  ...[
    'Beef Sausages', 'Eggs', 'Bacon', 'Baking Beans', 'Corn-Beans',
    'Whole Fish', 'Fish Fillet', 'Coconut Cream', 'Whole Chicken',
    'Chicken Breast', 'Chicken Thighs', 'Chicken Wings', 'Fillet Steak 250g',
    'Stir Fried 200g', 'Burrito 150g', 'Rice', 'Spaghetti', 'Burger Buns',
    'Burger Mince', 'Croissants', 'Cupcakes', 'Cake Slice', 'Burger Cheese',
    'Mozzarella Cheese', 'Parmesan Cheese', 'Wheat Flour', 'Maize Flour',
    'Cooking Oil', 'Samosas', 'Dark Sauce', 'Light Sauce', 'Oyster',
    'Maple Syrup', 'BBQ Sauce', 'Mustard Sauce', 'Mayonnaise', 'Sunflower',
    'Red/Green/Yellow Pepper', 'Potatoes', 'Tomatoes', 'Carrots', 'Onions',
    'Cucumber', 'Zucchini', 'Broccoli', 'Cauliflower', 'Red Cabbage',
  ].map(n => makeChefItem(n, 'pcs')),

  // Barista's Inventory.docx — 46 bar items, counted with Received labels.
  ...[
    'Bananas', 'Passion', 'Watermelon', 'Pineapples', 'Mangoes', 'Oranges',
    'Apples', 'Beetroot', 'Kiwi', 'Lemon', 'Ginger', 'Mint', 'Strawberries',
    'Orange Juice', 'Peanut Butter', 'Nuts (Box)', 'Coconut Milk', 'Sprite',
    'Yoghurt', 'Oreo Biscuits', 'Cookies', 'Milk Pieces',
    'Strawberry Ice Cream', 'Vanilla Ice Cream', 'Chocolate Ice Cream',
    'Drinking Chocolate', 'Cocoa', 'Coffee', 'Grenadine', 'Blue Curacao',
    'Hazelnut', 'Vanilla Syrup', 'Caramel', 'Kiwi Crush', 'Passion Crush',
    'Strawberry Crush', 'Mango Crush', 'Matcha', 'Chocolate Sauce',
    'Strawberry Sauce', 'Fudge Sauce', 'Sugar', 'Tea Bags', 'Tea Leaves',
    'Water Refill', 'Whipping Cream',
  ].map(n => makeBarItem(n, 'pcs')),

  ...[
    'Water', 'Sparkling Water', 'Heinz Tomato Ketchup', 'Tabasco Chilli',
    'Serviettes', 'Maccane Sugar', 'Straws', 'Gloves', 'Tissue',
    'Kitchen Towel', 'Liquid Soap', 'Handwash', 'Hand Paper Towel',
    'Coffee Cups', 'Coffee Cups Lids', 'Coffee Cups Holders',
    'Juices/Shakes Cups', 'Juice/Shakes Lids', 'Carrier Bag 5',
    'Carrier Bag 8', 'Carrier Bag 10', '5x7 White Pouch', '7x9 White Pouch',
    'Small Take Away Plates', 'Big Take Away Plates', 'Burger Box',
    'Medium Pizza Boxes', 'Large Pizza Boxes', 'Sauce Take Away Tins',
  ].map(n => makeFrontItem(n, 'pcs')),

  // ── Supplier / Home Inventory — Home Inventory Main.docx (Silas) ──
  ...([
    ['Cocoa 300g', 'pcs'],
    ['Drinking Chocolate 400g', 'pcs'],
    ['Bamboo Skewers-8inch', 'pcs'],
    ['Salt 1kg', 'pcs'],
    ['Strawberry crush', 'pcs'],
    ['Kiwi Crush', 'pcs'],
    ['Passion Crush', 'pcs'],
    ['Tomato Paste 900g', 'pcs'],
    ['Fudge Sauce', 'pcs'],
    ['Strawberry Sauce', 'pcs'],
    ['Chocolate Sauce', 'pcs'],
    ['Oyster Sauce 710g', 'pcs'],
    ['BBQ Sauce 510g', 'pcs'],
    ['Oreo (24 pkts per Box)-40g', 'packs'],
    ['Whipping cream-1L', 'pcs'],
    ['Tabasco 60ML', 'pcs'],
    ['Heinz Tomato Ketchup 295g', 'pcs'],
    ['Mustard Sauce 245g', 'pcs'],
    ['Coconut Milk', 'pcs'],
    ['Coconut Cream', 'pcs'],
    ['Baked Beans', 'pcs'],
    ['Sweetcorn', 'pcs'],
    ['Peanut Butter', 'pcs'],
    ['Aluminum Foil', 'pcs'],
    ['Cling Film', 'pcs'],
    ['Brown Coffee Holders', 'pcs'],
    ['Coffee Cups', 'pcs'],
    ['Coffee Lids', 'pcs'],
    ['Take Away Forks', 'pcs'],
    ['Take Away Juice Cups', 'pcs'],
    ['Take Away Juice Lids', 'pcs'],
    ['Take Away Sauce Tin and Lids', 'pcs'],
    ['Take Away Spoons', 'pcs'],
    ['Take Away Tins Small', 'pcs'],
    ['Take Away Tins Large', 'pcs'],
    ['Cookies', 'packs'],
    ['Sesame Seeds 500g', 'pcs'],
    ['Garlic Powder 500g', 'pcs'],
    ['Cinnamon Powder 500g/1kg', 'pcs'],
    ['Tea Masala 500g', 'pcs'],
    ['Tea Leaves 500g', 'pcs'],
    ['Mayonnaise 100g', 'pcs'],
    ['Toothpick 100pcs', 'packs'],
    ['Peeled Tomato (Castello)2500g', 'pcs'],
    ['Strawberry Jam 250g', 'pcs'],
    ['Light Sauce 623ml', 'pcs'],
    ['Grenadine Syrup 750m', 'pcs'],
    ['Vanilla Syrup', 'pcs'],
    ['Hazelnut Syrup', 'pcs'],
    ['Caramel Syrup', 'pcs'],
    ['Dark Soy Sauce', 'pcs'],
    ['Icing Sugar 500g', 'pcs'],
    ['Carrier Bag Size 5(Brown Bag)', 'pcs'],
    ['Carrier Bag Size 8', 'pcs'],
    ['Carrier Bag Size 10', 'pcs'],
    ['5x6 White Pouch', 'pcs'],
    ['7x8 White Pouch', 'pcs'],
    ['Nuts (Peeled) 0.5kg', 'pcs'],
    ['Tomato Ketchup 5L', 'pcs'],
    ['Tomato Sauce 5L', 'pcs'],
    ['Handwash Cream 5L', 'pcs'],
    ['Gloves', 'pcs'],
    ['Serviettes', 'pcs'],
    ['Kitchen Towel', 'pcs'],
    ['Straws 100pcs', 'pcs'],
    ['Sunrise Basmati Rice 5kg', 'pcs'],
    ['Tissues', 'pcs'],
    ['Coffee Beans 1kg', 'pcs'],
    ['Hand Paper Towel', 'packs'],
    ['Prestige 10kgs', 'pcs'],
    ['Maccane Sugar', 'pcs'],
    ['Pizza Boxes Medium', 'boxes'],
    ['Pizza Boxes Large', 'boxes'],
    ['Sparkling Water', 'boxes'],
    ['Water', 'pcs'],
    ['Cooking Oil 10L', 'pcs'],
    ['Vanilla Ice Cream', 'pcs'],
    ['Strawberry Ice Cream', 'pcs'],
    ['Chocolate Ice Cream', 'pcs'],
    ['Burger Cheese Slices @10pcs', 'pcs'],
    ['Mozzarella Cheese', 'pcs'],
    ['Parmesan Cheese', 'pcs'],
    ['Bacon', 'packs'],
    ['White Pepper Spice', 'kgs'],
  ] as [string, string][]).map(([n, u]) => makeSupplierItem(n, u)),
];

// Items from an earlier seed that the latest documents dropped (fruits, soft
// drinks, refill water etc. are no longer on Chefs Inventory). Retired once
// by the seed sync so the chef's phone list matches the document exactly.
export const RETIRED_COUNT_ITEM_IDS: string[] = [
  'kc-water', 'kc-sparkling', 'kc-water-refill', 'kc-banana',
  'kc-pineapples', 'kc-mangoes', 'kc-apples', 'kc-oranges',
  'kc-peanut-butter', 'kc-nuts', 'kc-sprite', 'kc-yoghurt', 'kc-milk',
  'kc-oreo', 'kc-vanilla-ice-cream', 'kc-strawberry-ice-cream',
  'kc-chocolate-ice-cream',
];

function makeBarItem(name: string, unit: string): CountItem {
  return {
    id: `bc-${slug(name)}`,
    name,
    unit,
    roles: ['Barista'],
    section: 'Bar',
    active: true,
  };
}

function makeChefItem(name: string, unit: string): CountItem {
  return {
    id: `kc-${slug(name)}`,
    name,
    unit,
    roles: ['Chef'],
    section: 'Kitchen',
    active: true,
  };
}

function makeFrontItem(name: string, unit: string): CountItem {
  return {
    id: `fc-${slug(name)}`,
    name,
    unit,
    roles: ['Waiter', 'Steward'],
    section: 'Front of House',
    active: true,
  };
}

function makeSupplierItem(name: string, unit: string): CountItem {
  return {
    id: `hc-${slug(name)}`,
    name,
    unit,
    roles: ['Supplier'],
    section: 'Home Inventory',
    active: true,
  };
}

export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
