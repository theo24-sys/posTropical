
import { MenuItem, Category, User, SaleTransaction,InventoryItem } from './types';
// constants.ts (add this near the other imports)


export const CURRENCY = 'KES';

// --- BRANDING ---
export const LOGO_URL = "https://i.ibb.co/9mh7YqNf/logo-png.png";
export const FALLBACK_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/751/751621.png";

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', role: 'Admin', pin: '1234', avatar: LOGO_URL },
  { id: 'u2', name: 'John Cashier', role: 'Cashier', pin: '0000' },
  { id: 'u3', name: 'Sarah Waiter', role: 'Waiter', pin: '1111' },
  { id: 'u4', name: 'Gordon Chef', role: 'Chef', pin: '2222' },
  { id: 'u5', name: 'Barry Barista', role: 'Barista', pin: '3333' },
];

// --- NECESSARY STAFF & KITCHEN INVENTORY ---
export const INITIAL_KITCHEN_INVENTORY: InventoryItem[] = [
  // Beverages
  { id: 'inv_water_500', name: 'Mineral Water 500ml', quantity: 48, unit: 'Pcs', category: 'Beverages', lowStockThreshold: 12 },
  { id: 'inv_water_1l', name: 'Mineral Water 1L', quantity: 24, unit: 'Pcs', category: 'Beverages', lowStockThreshold: 6 },
  { id: 'inv_milk_500', name: 'Milk 500ml', quantity: 20, unit: 'Pcs', category: 'Dairy & Eggs', lowStockThreshold: 5 },
  { id: 'inv_milk_1l', name: 'Milk 1L', quantity: 15, unit: 'Pcs', category: 'Dairy & Eggs', lowStockThreshold: 4 },
  
  // Bakery & Pastries
  { id: 'inv_cake_slice', name: 'Cake Slices (Assorted)', quantity: 12, unit: 'Slices', category: 'Bakery & Pastries', lowStockThreshold: 3 },
  { id: 'inv_muffins', name: 'Muffins', quantity: 10, unit: 'Pcs', category: 'Bakery & Pastries', lowStockThreshold: 4 },
  { id: 'inv_croissants', name: 'Croissants', quantity: 8, unit: 'Pcs', category: 'Bakery & Pastries', lowStockThreshold: 2 },
  
  // Meat Portions
  { id: 'inv_beef_portion', name: 'Beef Portions (250g)', quantity: 40, unit: 'Units', category: 'Meat & Poultry', lowStockThreshold: 10 },
  { id: 'inv_chicken_portion', name: 'Chicken Portions', quantity: 30, unit: 'Units', category: 'Meat & Poultry', lowStockThreshold: 8 },
  { id: 'inv_goat_portion', name: 'Goat Meat Portions', quantity: 20, unit: 'Units', category: 'Meat & Poultry', lowStockThreshold: 5 },
  
  // Kitchen Essentials
  { id: 'inv_eggs', name: 'Eggs', quantity: 10, unit: 'Trays', category: 'Dairy & Eggs', lowStockThreshold: 2 },
  { id: 'inv_potatoes', name: 'Potatoes', quantity: 4, unit: 'Sacks', category: 'Vegetables', lowStockThreshold: 1 },
  { id: 'inv_cooking_oil', name: 'Cooking Oil', quantity: 20, unit: 'Liters', category: 'Oils & Spices', lowStockThreshold: 5 },
];

// --- RECIPE MAPPING (Deduction Logic) ---
export const KITCHEN_RECIPES: Record<string, { invId: string; amount: number }[]> = {
  'bf_eng': [
    { invId: 'inv_eggs', amount: 0.06 }, 
    { invId: 'inv_milk_500', amount: 0.1 },
  ],
  'mn_fil': [
    { invId: 'inv_beef_portion', amount: 1 },
    { invId: 'inv_potatoes', amount: 0.05 },
  ],
};
// --- MENU ITEMS WITH STOCK ---
export const MENU_ITEMS: MenuItem[] = [
  // ================= BREAKFAST =================
  {
    id: 'bf_eng',
    name: 'English Breakfast',
    price: 900,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1544517175-98e4cc2b461b?auto=format&fit=crop&w=600&q=80',
    description: 'Toasted bread, home fries, 2 sausages/bacon, 2 eggs, baked beans, single hot beverage or juice.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_td',
    name: 'TDs Breakfast Combo',
    price: 1000,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1533089862017-5614a9579cf4?auto=format&fit=crop&w=600&q=80',
    description: 'Coffee/Tea, two eggs, sausage/bacon, golden home fries, pancake, grilled tomatoes, fresh fruits or juice.',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'bf_oat',
    name: 'Steel-Cut Oatmeal',
    price: 500,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80',
    description: 'With yoghurt, raisins, cinnamon, banana slices/berries or nuts, sweetened with honey or maple syrup.',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'bf_scram',
    name: 'The Scrambler',
    price: 650,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
    description: 'Three scrambled eggs with onions, green peppers, diced chicken, sausage.',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'bf_toast',
    name: 'Classic Toast',
    price: 700,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    description: 'Toast served with 2 eggs (scrambled/fried/omelet), bacon or 2 sausages.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_pan',
    name: 'Classic Pancakes',
    price: 700,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1528198622811-0842b4e54791?auto=format&fit=crop&w=600&q=80',
    description: 'Served with bacon or sausages and eggs.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_waf',
    name: 'Classic Waffles',
    price: 750,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80',
    description: 'Served with bacon or sausages and eggs.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_prem',
    name: 'Pancakes/Waffles/French Toast',
    price: 800,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1639744186596-3c224328222f?auto=format&fit=crop&w=600&q=80',
    description: 'Topped with chocolate, strawberries/bananas, whipped cream, honey/maple syrup.',
    stock: 40, lowStockThreshold: 5
  },
  {
    id: 'bf_add',
    name: 'Add Ons',
    price: 200,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1598511796318-7b825662bbf6?auto=format&fit=crop&w=600&q=80',
    description: 'Fried eggs, bacon, beef/chicken sausages, home fries, sautéed vegetables.',
    stock: 100, lowStockThreshold: 20
  },
  {
    id: 'hk_fs',
    name: 'Fruit Salad',
    price: 250,
    category: Category.HEALTH_KICK,
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'hk_tdfs',
    name: 'TDs Fruit Salad',
    price: 350,
    category: Category.HEALTH_KICK,
    image: 'https://images.unsplash.com/photo-1490474504059-bf6eb9dae980?auto=format&fit=crop&w=600&q=80',
    description: 'Served with yoghurt, honey and nuts.',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'hk_gran',
    name: 'Homemade Granola',
    price: 400,
    category: Category.HEALTH_KICK,
    image: 'https://images.unsplash.com/photo-1517093725452-6c556e4452ac?auto=format&fit=crop&w=600&q=80',
    description: 'With yoghurt, honey/maple syrup, berries, banana slices, apple, mango chunks.',
    stock: 25, lowStockThreshold: 5
  },

  // ================= APPETIZERS (Soups, Salads) =================
  {
    id: 'sp_nut',
    name: 'Spicy African Butternut Soup',
    price: 400,
    category: Category.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1547592166-23acbe3b624b?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'sp_tom',
    name: 'Creamy Tomato Basil Soup',
    price: 400,
    category: Category.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'sld_hse',
    name: 'House Salad',
    price: 450,
    category: Category.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    description: 'Lettuce, red cabbage, carrots, pickled onions, cucumber, tomatoes.',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sld_cjn',
    name: 'Cajun Chicken Salad',
    price: 600,
    category: Category.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80',
    description: 'House salad topped with spiced chicken.',
    stock: 25, lowStockThreshold: 5
  },

  // ================= BITINGS =================
  {
    id: 'bit_fries',
    name: 'Fries (Plate)',
    price: 300,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy golden fries',
    stock: 100, lowStockThreshold: 20
  },
  {
    id: 'bit_sam',
    name: 'Beef Samosa (Pair)',
    price: 200,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    stock: 100, lowStockThreshold: 20
  },
  {
    id: 'bit_saus',
    name: 'Sausage (Pair)',
    price: 200,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    description: 'Two grilled beef or chicken sausages.',
    stock: 100, lowStockThreshold: 20
  },
  {
    id: 'bit_w6',
    name: 'Chicken Wings (6pcs)',
    price: 700,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'bit_w12',
    name: 'Chicken Wings (12pcs)',
    price: 1100,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1527477396000-64ca9c00173f?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bit_chi',
    name: 'Dry Chilli Chicken',
    price: 600,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1562967960-f09c683b538e?auto=format&fit=crop&w=600&q=80',
    description: 'Boneless Chicken, onions, garlic, chili and oyster sauce',
    stock: 25, lowStockThreshold: 5
  },
  {
    id: 'bit_fish',
    name: 'Breaded Fish Fingers',
    price: 800,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
    description: 'Served with tartar sauce',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bit_sat',
    name: 'Chicken Satay',
    price: 550,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1533738096181-2292023a854d?auto=format&fit=crop&w=600&q=80',
    description: 'Marinated grilled chicken skewers with peanut sauce',
    stock: 20, lowStockThreshold: 5
  },

  // ================= HOT BEVERAGES =================
  {
    id: 'cf_esp',
    name: 'Espresso (Single)',
    price: 200,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
    stock: 500, lowStockThreshold: 50
  },
  {
    id: 'cf_cap',
    name: 'Cappuccino',
    price: 300,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    stock: 500, lowStockThreshold: 50
  },
  {
    id: 'cf_lat',
    name: 'Café Latte',
    price: 400,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1556484687-30636164638a?auto=format&fit=crop&w=600&q=80',
    stock: 500, lowStockThreshold: 50
  },
  {
    id: 'cf_moc',
    name: 'Mocha',
    price: 400,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 'cf_latmac',
    name: 'Latte Macchiato',
    price: 350,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1593443320739-97f8732d4a38?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 'cf_carmac',
    name: 'Caramel Macchiato',
    price: 450,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1485808191679-5f8c7c8f31e7?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 'cf_amer',
    name: 'Americano',
    price: 300,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1551030173-122f525e675f?auto=format&fit=crop&w=600&q=80',
    stock: 500, lowStockThreshold: 50
  },
  {
    id: 'cf_hotc',
    name: 'Hot Chocolate',
    price: 300,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 30
  },

  // Teas
  {
    id: 't_afr',
    name: 'African Tea',
    price: 200,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600&q=80',
    stock: 500, lowStockThreshold: 50
  },
  {
    id: 't_mas',
    name: 'Masala Tea',
    price: 250,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 't_grn',
    name: 'Green Tea',
    price: 200,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1564890369478-c5f3a85f3463?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 't_lem',
    name: 'Lemon Tea',
    price: 200,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 't_herb',
    name: 'Herbal Tea',
    price: 200,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
    description: 'Chamomile, Lemon, Hibiscus, or Peppermint.',
    stock: 100, lowStockThreshold: 10
  },
  {
    id: 't_pot',
    name: 'Tea Pot',
    price: 400,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 't_maspot',
    name: 'Masala Tea Pot',
    price: 450,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1596710629170-16e93229370d?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 't_dawa',
    name: 'Dawa',
    price: 300,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80',
    description: 'Hot water, ginger, lemon, and honey.',
    stock: 100, lowStockThreshold: 10
  },

  // ================= SOFT DRINKS =================
  {
    id: 'sd_wat',
    name: 'Water - Keringet 1L',
    price: 150,
    category: Category.SOFT_DRINKS,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80',
    stock: 100, lowStockThreshold: 20
  },
  {
    id: 'sd_soda300',
    name: 'Soda (300ml)',
    price: 100,
    category: Category.SOFT_DRINKS,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    description: 'Coke, Fanta, Sprite, Stoney',
    stock: 100, lowStockThreshold: 20
  },

  // ================= COLD BEVERAGES =================
  {
    id: 'ice_cof',
    name: 'Iced Coffee',
    price: 350,
    category: Category.ICED_COFFEE,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ice_lat',
    name: 'Iced Latte',
    price: 400,
    category: Category.ICED_COFFEE,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e3b4430f?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ice_moc',
    name: 'Iced Mocha',
    price: 450,
    category: Category.ICED_COFFEE,
    image: 'https://images.unsplash.com/photo-1499377193864-82682aefed04?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ice_van',
    name: 'Iced Vanilla Latte',
    price: 450,
    category: Category.ICED_COFFEE,
    image: 'https://images.unsplash.com/photo-1461023058943-48dbf1399f98?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ice_car',
    name: 'Iced Caramel Latte',
    price: 450,
    category: Category.ICED_COFFEE,
    image: 'https://images.unsplash.com/photo-1574914569527-38e9c9c855a0?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ice_haz',
    name: 'Iced Hazelnut Latte',
    price: 450,
    category: Category.ICED_COFFEE,
    image: 'https://images.unsplash.com/photo-1629899321523-a1288219c623?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },

  // ================= SHAKES =================
  {
    id: 'sh_salt',
    name: 'Salted Caramel',
    price: 600,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sh_mnt',
    name: 'Mint Shake',
    price: 500,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_van',
    name: 'Vanilla Shake',
    price: 450,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_str',
    name: 'Strawberry Shake',
    price: 450,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1579954115563-e72a806950ae?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_chc',
    name: 'Chocolate Shake',
    price: 450,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_ore',
    name: 'Oreo Shake',
    price: 500,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_esp',
    name: 'Espresso Shake',
    price: 500,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_frt',
    name: 'Fruit Shake (Mango, Banana)',
    price: 450,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_trop',
    name: 'Tropical Blend shake',
    price: 550,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
    description: 'Mango, Pineapple, Banana, Coconut milk',
    stock: 30, lowStockThreshold: 5
  },

  // ================= SMOOTHIES =================
  {
    id: 'sm_str',
    name: 'Strawberry Smoothie',
    price: 450,
    category: Category.SMOOTHIES,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sm_trop',
    name: 'Tropical Blend Smoothie',
    price: 500,
    category: Category.SMOOTHIES,
    image: 'https://images.unsplash.com/photo-1618557219665-350711912952?auto=format&fit=crop&w=600&q=80',
    description: 'Classic, creamy, sweet tropical fruit (Mango, Banana, Pineapple, Coconut milk)',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sm_man',
    name: 'Mango Crush Smoothie',
    price: 400,
    category: Category.SMOOTHIES,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sm_ban',
    name: 'Banana Bash',
    price: 400,
    category: Category.SMOOTHIES,
    image: 'https://images.unsplash.com/photo-1619684617498-8aa07d6d7a46?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sm_pro',
    name: 'TDs Protein Smoothie',
    price: 550,
    category: Category.SMOOTHIES,
    image: 'https://images.unsplash.com/photo-1598284912132-3ca1f3151d89?auto=format&fit=crop&w=600&q=80',
    description: 'Peanut Butter Banana',
    stock: 30, lowStockThreshold: 5
  },

  // ================= FRESH JUICES =================
  {
    id: 'ju_mint',
    name: 'Minty Pinade',
    price: 350,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1536980630732-c7247a83d719?auto=format&fit=crop&w=600&q=80',
    description: 'Pineapple Chunks, Mint leaves',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'ju_man',
    name: 'Mango /Passion /Pineapple',
    price: 300,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ju_org',
    name: 'Orange Juice',
    price: 400,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 5
  },
  {
    id: 'ju_tropmix',
    name: 'Tropical Juice',
    price: 400,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80',
    description: 'Pineapple, Mango, Passion, Orange (Max 3)',
    stock: 40, lowStockThreshold: 5
  },

  // ================= LEMONADES =================
  {
    id: 'lem_flav',
    name: 'Flavored Lemonades',
    price: 400,
    category: Category.LEMONADES,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    description: 'Strawberry/Kiwi/Passion',
    stock: 30, lowStockThreshold: 5
  },

  // ================= MOJITOS =================
  {
    id: 'moc_moj',
    name: 'Virgin Mojito',
    price: 350,
    category: Category.MOJITOS,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32d?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_pina',
    name: 'Virgin Pina colada',
    price: 450,
    category: Category.MOJITOS,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_dd',
    name: 'Drink and Drive',
    price: 450,
    category: Category.MOJITOS,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
    description: 'Passion, Orange, Pineapple, Syrup',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_str',
    name: 'Strawberry Mocktail',
    price: 450,
    category: Category.MOJITOS,
    image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e073?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },

  // ================= BAKERY & PASTRIES =================
  {
    id: 'bk_muf_asst',
    name: 'Assorted Muffins (Plain)',
    price: 100,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80',
    stock: 24, lowStockThreshold: 5
  },
  {
    id: 'bk_muf_nr',
    name: 'Assorted Muffins (Nuts/Raisins)',
    price: 150,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?auto=format&fit=crop&w=600&q=80',
    stock: 24, lowStockThreshold: 5
  },
  {
    id: 'bk_don_pl',
    name: 'Donuts (Plain)',
    price: 100,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1551024601-56296352f962?auto=format&fit=crop&w=600&q=80',
    stock: 36, lowStockThreshold: 12
  },
  {
    id: 'bk_don_ch',
    name: 'Donuts (Chocolate)',
    price: 150,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
    stock: 36, lowStockThreshold: 12
  },
  {
    id: 'bk_cro_pl',
    name: 'Croissants (Plain)',
    price: 200,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bk_cro_ch',
    name: 'Croissants (Chocolate)',
    price: 250,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bk_cake',
    name: 'Cake Slice (Lemon/Marble/Vanilla)',
    price: 300,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    description: 'Lemon / Marble / Vanilla',
    stock: 12, lowStockThreshold: 4
  },
  {
    id: 'bk_for',
    name: 'Black/White Forest Cake',
    price: 400,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    stock: 12, lowStockThreshold: 4
  },
  {
    id: 'bk_cin',
    name: 'Cinnamon Roll',
    price: 150,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1623947447721-a53d39545465?auto=format&fit=crop&w=600&q=80',
    stock: 24, lowStockThreshold: 8
  },
  {
    id: 'bk_ban',
    name: 'Banana Bread',
    price: 300,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=600&q=80',
    stock: 12, lowStockThreshold: 4
  },

  // ================= MAIN COURSES =================
  {
    id: 'mn_fil',
    name: 'Grilled Fillet Steak',
    price: 950,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'mn_tbone',
    name: 'T-Bone Steak',
    price: 1500,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
    stock: 10, lowStockThreshold: 3
  },
  {
    id: 'mn_lamb',
    name: 'Lamb Chops',
    price: 1200,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&w=600&q=80',
    stock: 10, lowStockThreshold: 3
  },
  {
    id: 'mn_med',
    name: 'Grilled Beef Medallion',
    price: 1100,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    description: 'Grilled fillet steak in creamy sauce.',
    stock: 12, lowStockThreshold: 3
  },
  {
    id: 'mn_bcur',
    name: 'Beef Curry',
    price: 800,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_ccur',
    name: 'Chicken Curry',
    price: 900,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_ctik',
    name: 'Chicken Tikka',
    price: 900,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
    description: 'Marinated grilled boneless chicken.',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_sbeef',
    name: 'Stir-Fried Beef',
    price: 700,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_schick',
    name: 'Stir-Fried Chicken',
    price: 850,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb74b?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_gbreast',
    name: 'Grilled Chicken Breast',
    price: 1100,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_fcoc',
    name: 'Fish in Coconut',
    price: 1000,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=600&q=80',
    description: 'Deep fried whole fish in coconut sauce.',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'mn_gfish',
    name: 'Grilled Fish Fillet',
    price: 1100,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a277d?auto=format&fit=crop&w=600&q=80',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'mn_til',
    name: 'Whole Tilapia',
    price: 950,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1535914254981-9663acf426da?auto=format&fit=crop&w=600&q=80',
    description: 'Wet or Dry.',
    stock: 10, lowStockThreshold: 3
  },
  {
    id: 'mn_spag',
    name: 'Spaghetti Bolognese',
    price: 950,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=600&q=80',
    description: 'Slow-simmered meat sauce.',
    stock: 25, lowStockThreshold: 5
  },

  // ================= BURGERS & SANDWICHES =================
  {
    id: 'bg_beef',
    name: 'Beef Burger',
    price: 700,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'bg_chick',
    name: 'Chicken Burger',
    price: 850,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'bg_tikka',
    name: 'Chicken Tikka Burger',
    price: 900,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
    stock: 25, lowStockThreshold: 5
  },
  {
    id: 'bg_extra',
    name: 'Burger Extras',
    price: 100,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    description: 'Cheese, bacon, avocado, or coated onion rings.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'snd_stk',
    name: 'Steak Sandwich',
    price: 700,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=600&q=80',
    description: 'Steak, caramelized onion, tomatoes, mustard, lettuce.',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'snd_club',
    name: 'Clubhouse Sandwich',
    price: 600,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: '3-layered sandwich: chicken, bacon, lettuce, tomatoes, cucumber, mayonnaise.',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'snd_chick',
    name: 'Chicken Sandwich',
    price: 800,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=600&q=80',
    description: 'Boneless chicken, lettuce, tomatoes.',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bur_chick',
    name: 'Chicken Burrito',
    price: 600,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bur_beef',
    name: 'Beef Burrito',
    price: 500,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bur_veg',
    name: 'Vegetable Burrito',
    price: 400,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1511285229362-bf5a3717208d?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },

  // ================= SIDES =================
  {
    id: 'acc_pot',
    name: 'Mashed Potatoes',
    price: 0,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'acc_fries',
    name: 'Fries',
    price: 0,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'acc_rice',
    name: 'Rice',
    price: 0,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'acc_chap',
    name: 'Chapati',
    price: 0,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'acc_ugali',
    name: 'Ugali',
    price: 0,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'acc_vrice',
    name: 'Vegetable Rice',
    price: 150,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },

  // ================= DESSERTS =================
  {
    id: 'dst_ban',
    name: 'Banana Split',
    price: 550,
    category: Category.DESSERTS,
    image: 'https://images.unsplash.com/photo-1567324216289-97c6c1e44894?auto=format&fit=crop&w=600&q=80',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'dst_sun',
    name: 'Classic Sundae',
    price: 500,
    category: Category.DESSERTS,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    description: '3 scoops of ice cream topped with nuts/cookies.',
    stock: 15, lowStockThreshold: 4
  },
  {
    id: 'dst_waf',
    name: 'Strawberry/Chocolate Waffle',
    price: 250,
    category: Category.DESSERTS,
    image: 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  }
];

export const MOCK_TRANSACTIONS: SaleTransaction[] = [];
