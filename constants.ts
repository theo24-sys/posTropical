
import { MenuItem, Category, User, SaleTransaction, InventoryItem } from './types';
 
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
  { id: 'u6', name: 'Silas', role: 'Supplier', pin: '8888' },
];
 
// --- NECESSARY STAFF & KITCHEN INVENTORY ---
export const INITIAL_KITCHEN_INVENTORY: InventoryItem[] = [
  // ── Protein & Meat ────────────────────────────────────────
  {
    id: 'inv_samosa_pieces',
    name: 'Samosa Pieces (raw/frozen)',
    quantity: 300,
    unit: 'pcs',
    category: 'BITINGS',
    lowStockThreshold: 80
  },
  {
    id: 'inv_beef_fillet',
    name: 'Beef Fillet Portions',
    quantity: 40,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 8
  },
  {
    id: 'inv_beef_portions',
    name: 'Beef Portions (curry / stir fried / burrito)',
    quantity: 60,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 12
  },
  {
    id: 'inv_beef_patties',
    name: 'Beef Burger Patties',
    quantity: 80,
    unit: 'pcs',
    category: 'BURGERS / BURRITOS & SANDWICHES',
    lowStockThreshold: 20
  },
  {
    id: 'inv_chicken_breast',
    name: 'Chicken Breast Portions',
    quantity: 50,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 10
  },
  {
    id: 'inv_chicken_portions',
    name: 'Chicken Portions (curry / stir fried / burger / burrito)',
    quantity: 90,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 18
  },
  {
    id: 'inv_bbq_chicken_legs',
    name: 'Barbeque Chicken Legs',
    quantity: 45,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 9
  },
  {
    id: 'inv_chicken_wings',
    name: 'Chicken Wings (raw/marinated)',
    quantity: 150,
    unit: 'pcs',
    category: 'BITINGS',
    lowStockThreshold: 40
  },
  {
    id: 'inv_lamb_chops',
    name: 'Lamb Chops Portions',
    quantity: 30,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 6
  },
  {
    id: 'inv_fish_fillet',
    name: 'Fish Fillet Portions',
    quantity: 30,
    unit: 'portions',
    category: 'MAIN COURSES',
    lowStockThreshold: 6
  },
  {
    id: 'inv_whole_fish',
    name: 'Whole Fish / Tilapia',
    quantity: 25,
    unit: 'pcs',
    category: 'MAIN COURSES',
    lowStockThreshold: 5
  },
  {
    id: 'inv_sausage',
    name: 'Sausage (beef / chicken)',
    quantity: 200,
    unit: 'pcs',
    category: 'BREAKFAST',
    lowStockThreshold: 50
  },
 
  // ── Drinks & Powders ─────────────────────────────────────
  {
    id: 'inv_keringet_water',
    name: 'Keringet Water 1L',
    quantity: 150,
    unit: 'pcs',
    category: 'SOFT DRINKS',
    lowStockThreshold: 40
  },
  {
    id: 'inv_sparkling_water',
    name: 'Sparkling Water',
    quantity: 100,
    unit: 'pcs',
    category: 'SOFT DRINKS',
    lowStockThreshold: 20
  },
  {
    id: 'inv_matcha_powder',
    name: 'Matcha Powder',
    quantity: 5000,
    unit: 'g',
    category: 'TEAS',
    lowStockThreshold: 500
  },
 
  // ── Fresh Produce / Soko ─────────────────────────────────
  {
    id: 'inv_spring_onions',
    name: 'Spring Onions',
    quantity: 10,
    unit: 'bunches',
    category: 'MAIN COURSES',
    lowStockThreshold: 3
  },
  {
    id: 'inv_cabbage',
    name: 'Cabbage',
    quantity: 8,
    unit: 'heads',
    category: 'MAIN COURSES',
    lowStockThreshold: 2
  },
  {
    id: 'inv_onions',
    name: 'Onions',
    quantity: 10,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 2
  },
  {
    id: 'inv_tomatoes',
    name: 'Tomatoes',
    quantity: 10,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 3
  },
  {
    id: 'inv_viazi_debe',
    name: 'Viazi Debe (Potatoes)',
    quantity: 1,
    unit: 'debe',
    category: 'SIDES',
    lowStockThreshold: 1
  },
  {
    id: 'inv_ginger',
    name: 'Ginger',
    quantity: 2,
    unit: 'kg',
    category: 'TEAS',
    lowStockThreshold: 1
  },
  {
    id: 'inv_garlic',
    name: 'Garlic / Saumu',
    quantity: 2,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 1
  },
  {
    id: 'inv_pineapple',
    name: 'Pineapple',
    quantity: 6,
    unit: 'pcs',
    category: 'FRESH JUICES',
    lowStockThreshold: 2
  },
  {
    id: 'inv_green_pepper',
    name: 'Green Pepper',
    quantity: 3,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 1
  },
  {
    id: 'inv_red_pepper',
    name: 'Red Pepper',
    quantity: 3,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 1
  },
  {
    id: 'inv_yellow_pepper',
    name: 'Yellow Pepper',
    quantity: 3,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 1
  },
  {
    id: 'inv_carrots',
    name: 'Carrots',
    quantity: 5,
    unit: 'kg',
    category: 'MAIN COURSES',
    lowStockThreshold: 1
  },
  {
    id: 'inv_lemon',
    name: 'Lemon',
    quantity: 20,
    unit: 'pcs',
    category: 'FRESH JUICES',
    lowStockThreshold: 5
  },
  {
    id: 'inv_watermelon',
    name: 'Water Melon',
    quantity: 4,
    unit: 'pcs',
    category: 'FRESH JUICES',
    lowStockThreshold: 1
  },
];
 
// --- RECIPE MAPPING (Deduction Logic) ---
// NOTE: ids below now match the July MENU_ITEMS ids exactly.
export const KITCHEN_RECIPES: Record<string, { invId: string; amount: number }[]> = {
  'bit_sam':      [{ invId: 'inv_samosa_pieces', amount: 2 }],
  'mn_fil':       [{ invId: 'inv_beef_fillet', amount: 1 }],
  'mn_sbeef':     [{ invId: 'inv_beef_portions', amount: 1 }],
  'bur_beef':     [{ invId: 'inv_beef_portions', amount: 1 }],
  'bg_beef':      [{ invId: 'inv_beef_patties', amount: 1 }],
  'mn_gbreast':   [{ invId: 'inv_chicken_breast', amount: 1 }],
  'mn_ccur_sp':   [{ invId: 'inv_chicken_portions', amount: 1 }],
  'mn_ctik':      [{ invId: 'inv_bbq_chicken_legs', amount: 1 }],
  'mn_bbq':       [{ invId: 'inv_bbq_chicken_legs', amount: 1 }],
  'bg_chick':     [{ invId: 'inv_chicken_portions', amount: 1 }],
  'bur_chick':    [{ invId: 'inv_chicken_portions', amount: 1 }],
  'bit_w8':       [{ invId: 'inv_chicken_wings', amount: 8 }],
  'bit_fish':     [{ invId: 'inv_fish_fillet', amount: 1 }],
  'bf_extras':    [{ invId: 'inv_sausage', amount: 2 }],
  'bf_pan_combo': [{ invId: 'inv_sausage', amount: 2 }],
  'bit_saus':     [{ invId: 'inv_sausage', amount: 2 }],
  'sd_wat':       [{ invId: 'inv_keringet_water', amount: 1 }],
  'sd_spark':     [{ invId: 'inv_sparkling_water', amount: 1 }],
  'ice_mat_cla':  [{ invId: 'inv_matcha_powder', amount: 15 }],
  'ice_mat_frap': [{ invId: 'inv_matcha_powder', amount: 20 }],
 
  // Fresh produce deductions
  'ju_mint':      [{ invId: 'inv_pineapple', amount: 0.25 }, { invId: 'inv_lemon', amount: 1 }],
  'ju_trop':      [{ invId: 'inv_pineapple', amount: 0.25 }],
  'lem_straw':    [{ invId: 'inv_lemon', amount: 2 }],
  'lem_kiwi':     [{ invId: 'inv_lemon', amount: 2 }],
  'lem_pass':     [{ invId: 'inv_lemon', amount: 2 }],
  'moc_moj':      [{ invId: 'inv_lemon', amount: 1 }],
  'sd_fries':     [{ invId: 'inv_viazi_debe', amount: 0.05 }],
  'sd_mash':      [{ invId: 'inv_viazi_debe', amount: 0.05 }],
  't_afrmas':     [{ invId: 'inv_ginger', amount: 0.01 }],
  't_dawa':       [{ invId: 'inv_ginger', amount: 0.01 }, { invId: 'inv_lemon', amount: 0.5 }],
  'dst_fruit':    [{ invId: 'inv_watermelon', amount: 0.1 }, { invId: 'inv_pineapple', amount: 0.1 }],
};
 
// --- MENU ITEMS WITH STOCK (JULY MENU — matches Supabase menu_items table) ---
export const MENU_ITEMS: MenuItem[] = [
  // ================= BREAKFAST =================
  { id: 'bf_full', name: 'TDs Full Breakfast', price: 1100, category: Category.BREAKFAST, image: 'https://images.unsplash.com/photo-1544517175-98e4cc2b461b?auto=format&fit=crop&w=600&q=80', description: 'Two eggs (fried/poached/scrambled), toast/pancake, home fries, baked beans, choice of beef sausage/bacon. Served with coffee, tea or juice + fruit.', stock: 50, lowStockThreshold: 10 },
  { id: 'bf_pan_combo', name: 'Pancakes Combo', price: 950, category: Category.BREAKFAST, image: 'https://images.unsplash.com/photo-1528198622811-0842b4e54791?auto=format&fit=crop&w=600&q=80', description: 'Three medium pancakes, 2 beef sausages, fresh fruit, hot beverage or juice.', stock: 50, lowStockThreshold: 10 },
  { id: 'bf_waf', name: 'Classic Waffles', price: 800, category: Category.BREAKFAST, image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80', description: 'Two waffles with 2 beef sausages and 2 eggs (scrambled/fried/poached).', stock: 50, lowStockThreshold: 10 },
  { id: 'bf_extras', name: 'Extras (Breakfast)', price: 200, category: Category.BREAKFAST, image: 'https://images.unsplash.com/photo-1598511796318-7b825662bbf6?auto=format&fit=crop&w=600&q=80', description: 'Baked Beans, Toast, Fried Eggs, Bacon (+100 = 300), Beef Sausages, Home Fries, Sautéed Vegetables', stock: 100, lowStockThreshold: 20 },
 
  // ================= COFFEE BAR =================
  { id: 'cf_esp_s', name: 'Espresso Single Shot', price: 200, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80', stock: 500, lowStockThreshold: 50 },
  { id: 'cf_amer', name: 'Americano', price: 250, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1551030173-122f525e675f?auto=format&fit=crop&w=600&q=80', stock: 500, lowStockThreshold: 50 },
  { id: 'cf_cap', name: 'Cappuccino', price: 300, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80', stock: 500, lowStockThreshold: 50 },
  { id: 'cf_lat', name: 'Café Latte', price: 400, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1556484687-30636164638a?auto=format&fit=crop&w=600&q=80', stock: 500, lowStockThreshold: 50 },
  { id: 'cf_moc', name: 'Mocha', price: 400, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80', stock: 200, lowStockThreshold: 20 },
  { id: 'cf_latmac', name: 'Latte Macchiato', price: 400, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1593443320739-97f8732d4a38?auto=format&fit=crop&w=600&q=80', stock: 200, lowStockThreshold: 20 },
  { id: 'cf_flavmac', name: 'Flavored Latte Macchiato', price: 450, category: Category.HOT_DRINKS, image: 'https://images.unsplash.com/photo-1485808191679-5f8c7c8f31e7?auto=format&fit=crop&w=600&q=80', description: 'Caramel, Hazelnut, or Vanilla syrup', stock: 200, lowStockThreshold: 20 },
 
  // ================= TEAS =================
  { id: 'cf_hotc', name: 'Hot Chocolate', price: 300, category: Category.TEAS, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80', stock: 200, lowStockThreshold: 30 },
  { id: 't_afrmas', name: 'African/Masala Tea', price: 250, category: Category.TEAS, image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600&q=80', stock: 500, lowStockThreshold: 50 },
  { id: 't_pot', name: 'Tea Pot/Masala', price: 450, category: Category.TEAS, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 't_herb', name: 'Herbal Tea', price: 250, category: Category.TEAS, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80', description: 'Green/Ginger/Lemon/Hibiscus/Peppermint', stock: 100, lowStockThreshold: 10 },
  { id: 't_dawa', name: 'Dawa', price: 300, category: Category.TEAS, image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80', stock: 100, lowStockThreshold: 10 },
 
  // ================= SOFT DRINKS =================
  { id: 'sd_wat', name: 'Water - Keringet 1L', price: 200, category: Category.SOFT_DRINKS, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80', stock: 100, lowStockThreshold: 20 },
  { id: 'sd_spark', name: 'Sparkling Water 500ML', price: 150, category: Category.SOFT_DRINKS, image: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?auto=format&fit=crop&w=600&q=80', stock: 100, lowStockThreshold: 20 },
  { id: 'sd_spark1', name: 'Sparkling Water 1L', price: 250, category: Category.SOFT_DRINKS, image: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?auto=format&fit=crop&w=600&q=80', stock: 100, lowStockThreshold: 20 },
 
  // ================= ICED COFFEE =================
  { id: 'ice_cof', name: 'Iced Coffee', price: 300, category: Category.ICED_COFFEE, image: 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ice_lat', name: 'Iced Latte', price: 400, category: Category.ICED_COFFEE, image: 'https://images.unsplash.com/photo-1553909489-cd47e3b4430f?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ice_flav', name: 'Iced Vanilla/Caramel/Hazelnut Latte', price: 450, category: Category.ICED_COFFEE, image: 'https://images.unsplash.com/photo-1461023058943-48dbf1399f98?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ice_moc', name: 'Iced Mocha', price: 450, category: Category.ICED_COFFEE, image: 'https://images.unsplash.com/photo-1499377193864-82682aefed04?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ice_mat_cla', name: 'Classic Iced Matcha Latte', price: 450, category: Category.ICED_COFFEE, image: 'https://images.unsplash.com/photo-1536555198118-21915ea621fa?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ice_mat_frap', name: 'Mango/Strawberry Matcha Latte', price: 500, category: Category.ICED_COFFEE, image: 'https://images.unsplash.com/photo-1536555198118-21915ea621fa?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
 
  // ================= SHAKES =================
  { id: 'sh_flav', name: 'Vanilla/Strawberry/Chocolate Shake', price: 450, category: Category.SHAKES, image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80', stock: 40, lowStockThreshold: 10 },
  { id: 'sh_ore', name: 'Oreo Shake', price: 500, category: Category.SHAKES, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', stock: 40, lowStockThreshold: 10 },
  { id: 'sh_esp', name: 'Espresso Shake', price: 500, category: Category.SHAKES, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', stock: 40, lowStockThreshold: 10 },
 
  // ================= SMOOTHIES =================
  { id: 'sm_man', name: 'Mango Crush Smoothie', price: 400, category: Category.SMOOTHIES, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'sm_ban', name: 'Banana Buzz', price: 400, category: Category.SMOOTHIES, image: 'https://images.unsplash.com/photo-1619684617498-8aa07d6d7a46?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'sm_coffee', name: 'Creamy Coffee Smoothie', price: 500, category: Category.SMOOTHIES, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'sm_pro', name: 'TDs Protein Smoothie', price: 500, category: Category.SMOOTHIES, image: 'https://images.unsplash.com/photo-1598284912132-3ca1f3151d89?auto=format&fit=crop&w=600&q=80', description: 'Peanut Butter Banana', stock: 30, lowStockThreshold: 5 },
 
  // ================= FRESH JUICES =================
  { id: 'ju_mint', name: 'Mint Pineapple', price: 350, category: Category.FRESH_JUICES, image: 'https://images.unsplash.com/photo-1536980630732-c7247a83d719?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'ju_man', name: 'Mango', price: 300, category: Category.FRESH_JUICES, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ju_pas', name: 'Passion', price: 350, category: Category.FRESH_JUICES, image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'ju_beet', name: 'Beetroot', price: 350, category: Category.FRESH_JUICES, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'ju_trop', name: 'Tropical Juice', price: 400, category: Category.FRESH_JUICES, image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80', description: 'Mango, Passion, Beetroot (Max 3)', stock: 40, lowStockThreshold: 5 },
 
  // ================= LEMONADES =================
  { id: 'lem_straw', name: 'Flavored Strawberry Lemonade', price: 450, category: Category.LEMONADES, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'lem_kiwi', name: 'Flavored Kiwi Lemonade', price: 450, category: Category.LEMONADES, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'lem_pass', name: 'Flavored Passion Lemonade', price: 450, category: Category.LEMONADES, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
 
  // ================= MOCKTAILS =================
  { id: 'moc_moj', name: 'Virgin Mojito', price: 350, category: Category.MOCKTAILS, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32d?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'moc_blue', name: 'Blue Lagoon', price: 400, category: Category.MOCKTAILS, image: 'https://images.unsplash.com/photo-1536935338213-94c41263ef3b?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'moc_sun', name: 'Virgin Sunrise', price: 400, category: Category.MOCKTAILS, image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
 
  // ================= BITINGS =================
  { id: 'bit_sam', name: 'Beef Samosa (2 Pieces)', price: 200, category: Category.BITINGS, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', stock: 100, lowStockThreshold: 20 },
  { id: 'bit_saus', name: 'Sausages (2 Pieces)', price: 200, category: Category.BITINGS, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', stock: 100, lowStockThreshold: 20 },
  { id: 'bit_w8', name: 'TDs Chicken Wings (8 Pieces)', price: 1000, category: Category.BITINGS, image: 'https://images.unsplash.com/photo-1527477396000-64ca9c00173f?auto=format&fit=crop&w=600&q=80', description: 'BBQ, Honey/Garlic, or Sweet Chili sauce, sesame seeds', stock: 30, lowStockThreshold: 10 },
  { id: 'bit_nug', name: 'Chicken Nuggets', price: 600, category: Category.BITINGS, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', stock: 30, lowStockThreshold: 5 },
  { id: 'bit_fish', name: 'Breaded Fish Fingers', price: 900, category: Category.BITINGS, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80', description: 'Served with tartar sauce, salad, and choice of side', stock: 20, lowStockThreshold: 5 },
 
  // ================= BAKERY & PASTRIES =================
  { id: 'bk_lemon', name: 'Lemon Cake Slice', price: 400, category: Category.BAKERY, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80', stock: 12, lowStockThreshold: 4 },
  { id: 'bk_for', name: 'Black Forest Cake', price: 400, category: Category.BAKERY, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', stock: 12, lowStockThreshold: 4 },
  { id: 'bk_croissant', name: 'Croissants', price: 250, category: Category.BAKERY, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
  { id: 'bk_cinnamon', name: 'Cinnamon Roll (Pair)', price: 250, category: Category.BAKERY, image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
  { id: 'bk_cupcake', name: 'Cupcakes (Pair)', price: 100, category: Category.BAKERY, image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
 
  // ================= MAIN COURSES =================
  { id: 'mn_fil', name: 'Grilled Fillet Steak', price: 1000, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80', description: 'Rare/Medium/Well-done', stock: 15, lowStockThreshold: 5 },
  { id: 'mn_sbeef', name: 'Stir Fried Beef', price: 950, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
  { id: 'mn_gbreast', name: 'Grilled Chicken Breast', price: 1000, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
  { id: 'mn_ccur_sp', name: 'TDs Special Chicken Curry', price: 900, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
  { id: 'mn_bbq', name: 'BBQ Roast Chicken', price: 950, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', stock: 20, lowStockThreshold: 5 },
  { id: 'mn_ctik', name: 'Spicy Chicken Tikka', price: 900, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80', description: 'Served with salad', stock: 20, lowStockThreshold: 5 },
 
  // ================= BURGERS & BURRITOS =================
  { id: 'bg_beef', name: 'Beef Burger', price: 800, category: Category.BURGERS, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', description: 'Served with fries or salad', stock: 30, lowStockThreshold: 5 },
  { id: 'bg_chick', name: 'Chicken Burger', price: 800, category: Category.BURGERS, image: 'https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=600&q=80', description: 'Served with fries or salad', stock: 30, lowStockThreshold: 5 },
  { id: 'bur_beef', name: 'Beef Burrito', price: 800, category: Category.BURGERS, image: 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80', description: 'Served with fries or salad', stock: 20, lowStockThreshold: 5 },
  { id: 'bur_chick', name: 'Chicken Burrito', price: 800, category: Category.BURGERS, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80', description: 'Served with fries or salad', stock: 20, lowStockThreshold: 5 },
  { id: 'bur_veg', name: 'Vegetable Burrito', price: 600, category: Category.BURGERS, image: 'https://images.unsplash.com/photo-1511285229362-bf5a3717208d?auto=format&fit=crop&w=600&q=80', description: 'Served with fries or salad', stock: 20, lowStockThreshold: 5 },
  { id: 'bg_extras', name: 'Cheese/Bacon', price: 300, category: Category.BURGERS, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', description: 'Add to any burger/burrito', stock: 50, lowStockThreshold: 10 },
 
  // ================= SIDES =================
  { id: 'sd_mash', name: 'Mashed Potatoes', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'sd_fries', name: 'Fries', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'sd_rice', name: 'Rice', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'sd_chap', name: 'Chapati', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'sd_ugali', name: 'Ugali', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'sd_vrice', name: 'Vegetable Rice', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
  { id: 'sd_saute', name: 'Sauteed Vegetables', price: 200, category: Category.SIDES, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', stock: 50, lowStockThreshold: 10 },
 
  // ================= DESSERTS =================
  { id: 'dst_ban', name: 'Banana Split', price: 550, category: Category.DESSERTS, image: 'https://images.unsplash.com/photo-1567324216289-97c6c1e44894?auto=format&fit=crop&w=600&q=80', description: '3 scoops of ice cream served with split Banana, sundae sauce and Nuts', stock: 15, lowStockThreshold: 5 },
  { id: 'dst_sun', name: 'Classic Sundae', price: 500, category: Category.DESSERTS, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', description: '3 scoops of ice cream piled high, topped with nuts/Cookies', stock: 15, lowStockThreshold: 4 },
  { id: 'dst_fruit', name: 'Signature TDs Fruit Salad', price: 500, category: Category.DESSERTS, image: 'https://images.unsplash.com/photo-1490474504059-bf6eb9dae980?auto=format&fit=crop&w=600&q=80', description: 'Served with yoghurt, honey and nuts', stock: 30, lowStockThreshold: 5 },
 
  // ================= PIZZA =================
  { id: 'pz_margherita_m', name: 'Margherita Pizza (Medium)', price: 1300, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', description: 'Tomato sauce, mozzarella cheese, fresh herbs', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_margherita_l', name: 'Margherita Pizza (Large)', price: 1600, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', description: 'Tomato sauce, mozzarella cheese, fresh herbs', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_bbq_beef_m', name: 'BBQ Beef Pizza (Medium)', price: 1300, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, BBQ beef strips, onions, herbs', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_bbq_beef_l', name: 'BBQ Beef Pizza (Large)', price: 1600, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, BBQ beef strips, onions, herbs', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_bbq_chick_m', name: 'BBQ Chicken Pizza (Medium)', price: 1300, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, grilled chicken, onions, BBQ sauce', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_bbq_chick_l', name: 'BBQ Chicken Pizza (Large)', price: 1600, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, grilled chicken, onions, BBQ sauce', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_hawaiian_m', name: 'Hawaiian Pizza (Medium)', price: 1300, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, chicken or beef, pineapple chunks', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_hawaiian_l', name: 'Hawaiian Pizza (Large)', price: 1600, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, chicken or beef, pineapple chunks', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_veg_m', name: 'Vegetable Pizza (Medium)', price: 1300, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, onions, bell peppers, sweetcorn', stock: 20, lowStockThreshold: 5 },
  { id: 'pz_veg_l', name: 'Vegetable Pizza (Large)', price: 1600, category: Category.PIZZA, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', description: 'Pizza sauce, mozzarella, onions, bell peppers, sweetcorn', stock: 20, lowStockThreshold: 5 },
];
 
export const MOCK_TRANSACTIONS: SaleTransaction[] = [];
