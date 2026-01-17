
export enum Category {
  BREAKFAST = 'BREAKFAST',
  HEALTH_KICK = 'HEALTH KICK',
  APPETIZERS = 'SOUP & SALADS', 
  BITINGS = 'BITINGS',
  HOT_DRINKS = 'COFFEE (Double)',
  TEAS = 'TEAS',
  SOFT_DRINKS = 'SOFT DRINKS',
  ICED_COFFEE = 'ICED COFFEE',
  COLD_DRINKS = 'COLD BEVERAGES',
  SHAKES = 'SHAKES',
  SMOOTHIES = 'SMOOTHIES',
  FRESH_JUICES = 'FRESH JUICES',
  LEMONADES = 'LEMONADES',
  MOJITOS = 'MOJITOS',
  BAKERY = 'BAKERY & PASTRIES',
  MAINS = 'MAIN COURSES',
  BURGERS = 'BURGERS / BURRITOS & SANDWICHES',
  PIZZA = 'Pizza',
  SIDES = 'Sides',
  DESSERTS = 'DESSERTS'
}

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Card' | 'Pay Later';

export type UserRole = 'Admin' | 'Cashier' | 'Waiter' | 'Chef' | 'Barista';

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
}

// Comprehensive Inventory Categories
export type InventoryCategory = 
  | 'Meat & Poultry' 
  | 'Dairy & Eggs' 
  | 'Beverages' 
  | 'Bakery & Pastries' 
  | 'Dry Goods' 
  | 'Vegetables' 
  | 'Oils & Spices';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., 'Kgs', 'Units', 'Trays', 'Liters', 'Pcs'
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
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Rent' | 'Utilities' | 'Inventory Restock' | 'Salaries' | 'Wastage/Loss' | 'Maintenance' | 'Other';
  recordedBy: string;
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
