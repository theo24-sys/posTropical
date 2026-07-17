export enum Category {
  BREAKFAST = 'BREAKFAST',
  SOUP_SALADS = 'SOUP & SALADS',
  BITINGS = 'BITINGS',
  HOT_DRINKS = 'COFFEE (DOUBLE)',
  TEAS = 'TEAS',
  SOFT_DRINKS = 'SOFT DRINKS',
  ICED_COFFEE = 'ICED COFFEE',
  SHAKES = 'SHAKES',
  SMOOTHIES = 'SMOOTHIES',
  FRESH_JUICES = 'FRESH JUICES',
  LEMONADES = 'LEMONADES',
  MOCKTAILS = 'MOCKTAILS',
  BAKERY = 'BAKERY & PASTRIES',
  MAINS = 'MAIN COURSES',
  BURGERS = 'BURGERS / BURRITOS & SANDWICHES',
  SANDWICHES = 'SANDWICHES',
  DESSERTS = 'DESSERTS',
  SIDES = 'SIDES',
  PIZZA = 'PIZZA'
}

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Card' | 'Pay Later';
export type UserRole = 'Admin' | 'Cashier' | 'Waiter' | 'Chef' | 'Barista' | 'Supplier';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description?: string;
  stock: number;
  lowStockThreshold: number;
  // eTIMS / KRA fields
  digitax_item_id?: string;
  item_class_code?: string;
  package_unit_code?: string;
  quantity_unit_code?: string;
  tax_type_code?: string;
}

export type InventoryCategory =
  | 'BREAKFAST'
  | 'SOUP & SALADS'
  | 'BITINGS'
  | 'COFFEE (DOUBLE)'
  | 'TEAS'
  | 'SOFT DRINKS'
  | 'ICED COFFEE'
  | 'SHAKES'
  | 'SMOOTHIES'
  | 'FRESH JUICES'
  | 'LEMONADES'
  | 'MOCKTAILS'
  | 'BAKERY & PASTRIES'
  | 'MAIN COURSES'
  | 'BURGERS / BURRITOS & SANDWICHES'
  | 'SANDWICHES'
  | 'SIDES'
  | 'PIZZA'
  | 'DESSERTS';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: InventoryCategory;
  lowStockThreshold: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface HeldOrder {
  id: string;
  customerName?: string;
  items: CartItem[];
  total: number;
  date: string;
  tableNumber?: number;
}

// --- ETIMS SYNC STATUS (shared shape) ---
export type EtimsSyncStatus = 'success' | 'failed' | 'pending';

export interface ReceiptData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountTendered?: number;
  change?: number;
  date: string;
  updatedAt?: string;
  aiMessage?: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  cashierName: string;
  tableNumber?: number;
  orderType?: 'Dine-in' | 'Take Away';
  status: 'Paid' | 'Pending';
  discountAmount?: number;
  discountPercent?: number;
  // eTIMS / DigiTax fields
  etimsInvoiceNumber?: string;
  etimsControlNumber?: string;
  etimsQrUrl?: string;
  etimsSyncStatus?: EtimsSyncStatus;
}

export interface SaleTransaction {
  id: string;
  date: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'Paid' | 'Pending';
  cashierName: string;
  tableNumber?: number;
  orderType?: 'Dine-in' | 'Take Away';
  items: { id: string; name: string; quantity: number; price: number }[];
  updatedBy?: string;
  updatedAt?: string;
  // eTIMS / DigiTax fields
  etimsInvoiceNumber?: string;
  etimsControlNumber?: string;
  etimsQrUrl?: string;
  etimsSignature?: string;
  etimsSyncStatus?: EtimsSyncStatus;
  etimsSyncedAt?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Rent' | 'Utilities' | 'Inventory Restock' | 'Salaries' | 'Wastage/Loss' | 'Maintenance' | 'Other';
  recordedBy: string;
  supplierSource?: 'Supermarket' | 'Town' | 'Butchery' | 'Market';
  itemName?: string;
  quantity?: number;
  quantityUnit?: 'Litres' | 'Kgs' | 'Pieces' | 'Bottles' | 'Dozens' | 'Bunches' | 'Sacks' | 'Cans' | 'Boxes' | 'Packets' | 'Cartons' | 'Other';
  unitCost?: number;
  note?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'SALE' | 'VOID_ITEM' | 'CLEAR_CART' | 'SETTLE_PAYMENT' | 'EXPENSE_ADD' | 'STOCK_UPDATE';
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Promotion {
  id: string;
  name: string;
  discount_percent: number;
  start_datetime: string;
  end_datetime: string;
  is_active: boolean;
}

// --- KRA eTIMS Types ---
export interface KraItemPayload {
  itemSeq: number;
  itemCd: string;       // maps to item_class_code
  itemNm: string;       // maps to item_name
  pkgUnitCd: string;    // maps to package_unit_code
  qtyUnitCd: string;    // maps to quantity_unit_code
  unitPrice: number;    // maps to default_unit_price
  qty: number;          // transactional quantity
  totAmt: number;       // total price before tax validations
  taxTyCd: string;      // maps to tax_type_code (e.g., 'D')
}

export interface eTimsInvoicePayload {
  trnsNo: number;
  docNo: string;
  customerPin?: string;
  receiptTypeCode: 'S' | 'R'; // S = Sale, R = Refund
  paymentTypeCode: string;     // '01' = Cash, '02' = M-Pesa/Mobile, etc.
  totItemCnt: number;
  totTaxblAmt: number;
  totTaxAmt: number;
  totAmt: number;
  itemList: KraItemPayload[];
}

