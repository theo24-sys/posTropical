
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
  }
];

// --- RECIPE MAPPING (Deduction Logic) ---
export const KITCHEN_RECIPES: Record<string, { invId: string; amount: number }[]> = {
  // --- RECIPE MAPPING (Deduction Logic) ---
  // Samosa Pieces ─ from BITINGS
  'bit_sam': [
    { invId: 'inv_samosa_pieces', amount: 2 },   // pair = 2 pieces
  ],

  // Beef items ─ from MAINS + BURGERS
  'mn_fil': [
    { invId: 'inv_beef_fillet', amount: 1 },
  ],
  'mn_bcur': [
    { invId: 'inv_beef_portions', amount: 1 },
  ],
  'mn_sbeef': [
    { invId: 'inv_beef_portions', amount: 1 },
  ],
  'bur_beef': [
    { invId: 'inv_beef_portions', amount: 1 },
  ],
  'bg_beef': [
    { invId: 'inv_beef_patties', amount: 1 },
  ],

  // Chicken items ─ from MAINS + BURGERS
  'mn_gbreast': [
    { invId: 'inv_chicken_breast', amount: 1 },
  ],
  'mn_ccur': [
    { invId: 'inv_chicken_portions', amount: 1 },
  ],
  'mn_schick': [
    { invId: 'inv_chicken_portions', amount: 1 },
  ],
  'mn_ctik': [
    { invId: 'inv_bbq_chicken_legs', amount: 1 },
  ],
  'bg_chick': [
    { invId: 'inv_chicken_portions', amount: 1 },
  ],
  'bur_chick': [
    { invId: 'inv_chicken_portions', amount: 1 },
  ],

  // Chicken Wings ─ from BITINGS
  'bit_w6': [
    { invId: 'inv_chicken_wings', amount: 6 },
  ],
  'bit_w12': [
    { invId: 'inv_chicken_wings', amount: 12 },
  ],

  // Lamb Chops ─ from MAINS
  'mn_lamb': [
    { invId: 'inv_lamb_chops', amount: 1 },
  ],

  // Fish items ─ from MAINS
  'mn_gfish': [
    { invId: 'inv_fish_fillet', amount: 1 },
  ],
  'mn_fcoc': [
    { invId: 'inv_whole_fish', amount: 1 },
  ],
  'mn_til': [
    { invId: 'inv_whole_fish', amount: 1 },
  ],

  // Sausage ─ from BREAKFAST + BITINGS
  'bf_eng': [
    { invId: 'inv_sausage', amount: 2 },
  ],
  'bf_toast': [
    { invId: 'inv_sausage', amount: 2 },
  ],
  'bf_pan': [
    { invId: 'inv_sausage', amount: 2 },
  ],
  'bit_saus': [
    { invId: 'inv_sausage', amount: 2 },   // Sausage (Pair) in BITINGS
  ],

  // Keringet Water ─ from SOFT DRINKS
  'sd_wat': [
    { invId: 'inv_keringet_water', amount: 1 },
  ],
  'sd_spark': [
    { invId: 'inv_sparkling_water', amount: 1 },
  ],
};
// --- MENU ITEMS WITH STOCK ---
export const MENU_ITEMS: MenuItem[] = [
  // ================= BREAKFAST =================
  {
    id: 'bf_full',
    name: 'TDs Full Breakfast',
    price: 900,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1544517175-98e4cc2b461b?auto=format&fit=crop&w=600&q=80',
    description: 'Two eggs with toast, home fries, baked beans, choice of bacon/sausage. Served with coffee, tea or juice.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_combo',
    name: 'TDs Breakfast Combo',
    price: 1050,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1533089862017-5614a9579cf4?auto=format&fit=crop&w=600&q=80',
    description: 'Coffee/Tea, Two Eggs, Sausage/Bacon, home fries, pancake/Toast, Grilled tomatoes, fresh fruits/Juice',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'bf_pan_combo',
    name: 'Pancakes Combo',
    price: 950,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1528198622811-0842b4e54791?auto=format&fit=crop&w=600&q=80',
    description: 'Three medium pancakes, beef sausage, freshly cut fruit and hot beverage or juice.',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_fr_combo',
    name: 'French Toast Combo',
    price: 800,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1639744186596-3c224328222f?auto=format&fit=crop&w=600&q=80',
    description: 'French toast, two scrambled eggs, hot beverage or juice, 2 beef sausages.',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'bf_waf',
    name: 'Classic Waffles',
    price: 750,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80',
    description: 'Two waffles, served with bacon or sausages and 2 eggs (scrambled/fried/omelet)',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_span',
    name: 'Spanish Omelette',
    price: 300,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d4ec?auto=format&fit=crop&w=600&q=80',
    description: 'Eggs, Bell Pepper, Onions, Tomatoes',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'bf_extras',
    name: 'Extras (Breakfast)',
    price: 200,
    category: Category.BREAKFAST,
    image: 'https://images.unsplash.com/photo-1598511796318-7b825662bbf6?auto=format&fit=crop&w=600&q=80',
    description: 'Baked Beans, Toast, Fried Eggs, Bacon, Beef Sausages, Home Fries, Sautéed Vegetables',
    stock: 100, lowStockThreshold: 20
  },

  // ================= COFFEE BAR =================
  {
    id: 'cf_esp_s',
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
    id: 'cf_amer',
    name: 'Americano',
    price: 250,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1551030173-122f525e675f?auto=format&fit=crop&w=600&q=80',
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
    price: 450,
    category: Category.HOT_DRINKS,
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 20
  },
  {
    id: 'cf_latmac',
    name: 'Latte Macchiato',
    price: 400,
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

  // ================= TEAS =================
  {
    id: 'cf_hotc',
    name: 'Hot Chocolate',
    price: 300,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
    stock: 200, lowStockThreshold: 30
  },
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
    id: 't_herb',
    name: 'Herbal Tea',
    price: 200,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
    description: 'Green/Chamomile/Lemon/Hibiscus/Peppermint',
    stock: 100, lowStockThreshold: 10
  },
  {
    id: 't_dawa',
    name: 'Dawa',
    price: 300,
    category: Category.TEAS,
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80',
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
    id: 'sd_spark',
    name: 'Sparkling Water',
    price: 150,
    category: Category.SOFT_DRINKS,
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?auto=format&fit=crop&w=600&q=80',
    stock: 100, lowStockThreshold: 20
  },

  // ================= ICED COFFEE =================
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
    id: 'sh_mnt',
    name: 'Mint Shake',
    price: 550,
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
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80',
    stock: 40, lowStockThreshold: 10
  },
  {
    id: 'sh_chc',
    name: 'Chocolate Shake',
    price: 450,
    category: Category.SHAKES,
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80',
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

  // ================= SMOOTHIES =================
  {
    id: 'sm_trop',
    name: 'Tropical Blend Smoothie',
    price: 500,
    category: Category.SMOOTHIES,
    image: 'https://images.unsplash.com/photo-1618557219665-350711912952?auto=format&fit=crop&w=600&q=80',
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
    price: 500,
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
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'ju_man',
    name: 'Mango',
    price: 300,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ju_pas',
    name: 'Passion',
    price: 350,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'ju_beet',
    name: 'Beetroot',
    price: 350,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'ju_trop',
    name: 'Tropical Juice',
    price: 400,
    category: Category.FRESH_JUICES,
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80',
    description: 'Mango, Passion, Beetroot (Max 3)',
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

  // ================= MOCKTAILS =================
  {
    id: 'moc_moj',
    name: 'Virgin Mojito',
    price: 350,
    category: Category.MOCKTAILS,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32d?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_rain',
    name: 'Rainbow Paradise',
    price: 500,
    category: Category.MOCKTAILS,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_sun',
    name: 'Sunrise',
    price: 450,
    category: Category.MOCKTAILS,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_blue',
    name: 'Blue Lagoon',
    price: 450,
    category: Category.MOCKTAILS,
    image: 'https://images.unsplash.com/photo-1536935338213-94c41263ef3b?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'moc_psun',
    name: 'Passion Sunrise',
    price: 450,
    category: Category.MOCKTAILS,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },

  // ================= SOUP & SALADS =================
  {
    id: 'sp_nut',
    name: 'Spicy African Butternut Soup',
    price: 350,
    category: Category.SOUP_SALADS,
    image: 'https://images.unsplash.com/photo-1547592166-23acbe3b624b?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'sp_beef',
    name: 'Beef Consommé soup',
    price: 350,
    category: Category.SOUP_SALADS,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'sld_hse',
    name: 'House Salad',
    price: 500,
    category: Category.SOUP_SALADS,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    description: 'Lettuce, Red Cabbage, Carrots, Onions, cucumber, tomatoes',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'sld_cjn',
    name: 'Cajun Chicken Salad',
    price: 600,
    category: Category.SOUP_SALADS,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80',
    description: 'House salad topped with spiced chicken',
    stock: 25, lowStockThreshold: 5
  },

  // ================= BITINGS =================
  {
    id: 'bit_sam',
    name: 'Beef Samosa (Pair)',
    price: 200,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
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
    id: 'bit_fish',
    name: 'Breaded Fish Fingers',
    price: 800,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
    description: 'Served with tartar sauce',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bit_nug',
    name: 'Chicken Nuggets',
    price: 600,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'bit_saus',
    name: 'Sausage (Pair)',
    price: 200,
    category: Category.BITINGS,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    stock: 100, lowStockThreshold: 20
  },

  // ================= BAKERY & PASTRIES =================
  {
    id: 'bk_cake',
    name: 'Cake Slice (Lemon/Marble)',
    price: 300,
    category: Category.BAKERY,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
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
    id: 'mn_med',
    name: 'Beef Medallion Steak',
    price: 1050,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    stock: 12, lowStockThreshold: 3
  },
  {
    id: 'mn_pep',
    name: 'Pepper Steak',
    price: 900,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'mn_sbeef',
    name: 'Stir Fried Beef',
    price: 700,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
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
    id: 'mn_lrib',
    name: 'Lamb Ribs',
    price: 800,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    stock: 10, lowStockThreshold: 3
  },
  {
    id: 'mn_gbreast',
    name: 'Grilled Chicken Breast',
    price: 1000,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_ccur_sp',
    name: 'TDs Special Chicken Curry',
    price: 850,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_cpep',
    name: 'Chicken Pepper Steak',
    price: 900,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_bbq',
    name: 'BBQ Roast Chicken',
    price: 800,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_ctik',
    name: 'Chicken Tikka',
    price: 900,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'mn_gfish',
    name: 'Grilled Fish Fillet',
    price: 1000,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a277d?auto=format&fit=crop&w=600&q=80',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'mn_til',
    name: 'Whole Fish (Tomato Gravy/Dry)',
    price: 950,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1535914254981-9663acf426da?auto=format&fit=crop&w=600&q=80',
    stock: 10, lowStockThreshold: 3
  },
  {
    id: 'mn_fcoc',
    name: 'Fish in Coconut',
    price: 950,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=600&q=80',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'mn_spag_bol',
    name: 'Spaghetti Bolognese',
    price: 950,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=600&q=80',
    description: 'Spaghetti topped with a rich, slow simmered meat-based sauce',
    stock: 25, lowStockThreshold: 5
  },
  {
    id: 'mn_spag_pom',
    name: 'Spaghetti Pomodoro',
    price: 800,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    stock: 25, lowStockThreshold: 5
  },

  // ================= BURGERS & BURRITOS =================
  {
    id: 'bg_beef',
    name: 'Beef Burger',
    price: 700,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    description: 'Served with fries or salad',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'bg_chick',
    name: 'Chicken Burger',
    price: 750,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=600&q=80',
    description: 'Served with fries or salad',
    stock: 30, lowStockThreshold: 5
  },
  {
    id: 'bur_beef',
    name: 'Beef Burrito',
    price: 600,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80',
    description: 'Served with fries or salad',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bur_chick',
    name: 'Chicken Burrito',
    price: 700,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    description: 'Served with fries or salad',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bur_veg',
    name: 'Vegetable Burrito',
    price: 500,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1511285229362-bf5a3717208d?auto=format&fit=crop&w=600&q=80',
    description: 'Served with fries or salad',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'bg_extras',
    name: 'Burger Extras',
    price: 200,
    category: Category.BURGERS,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    description: 'Cheese, Bacon, Coated Onion rings/Fries',
    stock: 50, lowStockThreshold: 10
  },

  // ================= SANDWICHES =================
  {
    id: 'snd_stk',
    name: 'Steak Sandwich',
    price: 700,
    category: Category.SANDWICHES,
    image: 'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=600&q=80',
    description: 'Thinly sliced steak, caramelized onion, tomatoes, mustard, lettuce. Served with fries or salad',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'snd_club',
    name: 'Clubhouse Sandwich',
    price: 850,
    category: Category.SANDWICHES,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: '3 layers consisting of three slices of bread, chicken, fried bacon, lettuce, tomatoes, cucumber and mayonnaise. Served with fries or salad',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'snd_chick',
    name: 'Chicken Sandwich',
    price: 800,
    category: Category.SANDWICHES,
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=600&q=80',
    description: 'Boneless chicken, lettuce, tomatoes. Served with fries or salad',
    stock: 20, lowStockThreshold: 5
  },
  {
    id: 'snd_extras',
    name: 'Sandwich Extras',
    price: 200,
    category: Category.SANDWICHES,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    description: 'Cheese, Bacon, Coated Onion rings/Fries',
    stock: 50, lowStockThreshold: 10
  },

  // ================= SIDES =================
  {
    id: 'sd_mash',
    name: 'Mashed Potatoes',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'sd_fries',
    name: 'Fries',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'sd_rice',
    name: 'Rice',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'sd_chap',
    name: 'Chapati',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'sd_ugali',
    name: 'Ugali',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'sd_vrice',
    name: 'Vegetable Rice',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },
  {
    id: 'sd_saute',
    name: 'Sauteed Vegetables',
    price: 200,
    category: Category.SIDES,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    stock: 50, lowStockThreshold: 10
  },

  // ================= DESSERTS =================
  {
    id: 'dst_ban',
    name: 'Banana Split',
    price: 550,
    category: Category.DESSERTS,
    image: 'https://images.unsplash.com/photo-1567324216289-97c6c1e44894?auto=format&fit=crop&w=600&q=80',
    description: '3 scoops of ice cream served with split Banana, sundae sauce and Nuts',
    stock: 15, lowStockThreshold: 5
  },
  {
    id: 'dst_sun',
    name: 'Classic Sundae',
    price: 500,
    category: Category.DESSERTS,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    description: '3 scoops of ice cream piled high, topped with nuts/Cookies',
    stock: 15, lowStockThreshold: 4
  },
  {
    id: 'dst_fruit',
    name: 'TDs Fruit Salad',
    price: 400,
    category: Category.DESSERTS,
    image: 'https://images.unsplash.com/photo-1490474504059-bf6eb9dae980?auto=format&fit=crop&w=600&q=80',
    description: 'Served with yoghurt, honey and nuts',
    stock: 30, lowStockThreshold: 5
  }
];

export const MOCK_TRANSACTIONS: SaleTransaction[] = [];
