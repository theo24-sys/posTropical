import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MenuItem, SaleTransaction, User, Expense, InventoryItem } from '../types';
import { KITCHEN_RECIPES } from '../constants';
import { supabase } from './supabase'; // ← FIXED: Added this import!

interface TropicalDB extends DBSchema {
  menu_items: { key: string; value: MenuItem };
  users: { key: string; value: User };
  offline_orders: { key: string; value: SaleTransaction };
  sales_history: { key: string; value: SaleTransaction };
  expenses: { key: string; value: Expense };
  inventory: { key: string; value: InventoryItem };
}

const DB_NAME = 'tropical-pos-db';
const DB_VERSION = 4;

export const LocalDB = {
  async getDB(): Promise<IDBPDatabase<TropicalDB>> {
    return openDB<TropicalDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading IndexedDB from v${oldVersion} to v${newVersion}`);
        if (!db.objectStoreNames.contains('menu_items')) {
          db.createObjectStore('menu_items', { keyPath: 'id' });
          console.log('Created store: menu_items');
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
          console.log('Created store: users');
        }
        if (!db.objectStoreNames.contains('offline_orders')) {
          db.createObjectStore('offline_orders', { keyPath: 'id' });
          console.log('Created store: offline_orders');
        }
        if (!db.objectStoreNames.contains('sales_history')) {
          db.createObjectStore('sales_history', { keyPath: 'id' });
          console.log('Created store: sales_history');
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: 'id' });
          console.log('Created store: expenses');
        }
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' });
          console.log('Created store: inventory');
        }
      },
      blocked() {
        console.warn('IndexedDB blocked - another tab has it open');
      },
      blocking() {
        console.warn('IndexedDB blocking - closing old connection');
      },
      terminated() {
        console.error('IndexedDB connection terminated');
      }
    });
  },

  async resetLocalDB() {
    try {
      indexedDB.deleteDatabase(DB_NAME);
      console.log('LocalDB deleted. Reload page to recreate.');
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete local DB:', err);
    }
  },

  // ────────────────────────────────────────────────
  // Inventory
  // ────────────────────────────────────────────────
  async saveInventoryItem(item: InventoryItem) {
    console.log('Attempting Supabase save:', item);

    const { data, error } = await supabase
      .from('inventory')
      .upsert({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        low_stock_threshold: item.lowStockThreshold // snake_case!
      })
      .select();

    if (error) {
      console.error('Supabase SAVE ERROR:', error.message, error.details, error.hint);
      throw error;
    }

    console.log('Supabase save SUCCESS:', data);
    return data;
  },

  async getInventory(): Promise<InventoryItem[]> {
    const db = await this.getDB();
    return db.getAll('inventory');
  },

  async updateInventoryItem(item: InventoryItem) {
    const db = await this.getDB();
    await db.put('inventory', item);
  },

  async deductKitchenInventory(saleItems: { id: string; quantity: number }[]) {
    const db = await this.getDB();
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    for (const item of saleItems) {
      const recipes = KITCHEN_RECIPES[item.id] || [];
      for (const rec of recipes) {
        const deductQty = rec.amount * item.quantity;
        if (deductQty <= 0) continue;
        const current = await store.get(rec.invId);
        if (current) {
          current.quantity = Math.max(0, current.quantity - deductQty);
          await store.put(current);
        }
      }
    }
    await tx.done;
    console.log('Local inventory deducted');
    return { success: true };
  },

  // ────────────────────────────────────────────────
  // Menu Items
  // ────────────────────────────────────────────────
  async saveMenu(items: MenuItem[]) {
    const db = await this.getDB();
    const tx = db.transaction('menu_items', 'readwrite');
    const store = tx.objectStore('menu_items');
    await store.clear();
    for (const item of items) {
      await store.put(item);
    }
    await tx.done;
  },

  async getMenu(): Promise<MenuItem[]> {
    const db = await this.getDB();
    return db.getAll('menu_items');
  },

  // ────────────────────────────────────────────────
  // Users
  // ────────────────────────────────────────────────
  async saveUsers(users: User[]) {
    const db = await this.getDB();
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    await store.clear();
    for (const user of users) {
      await store.put(user);
    }
    await tx.done;
  },

  async getUsers(): Promise<User[]> {
    const db = await this.getDB();
    return db.getAll('users');
  },

  // ────────────────────────────────────────────────
  // Offline / Pending Orders
  // ────────────────────────────────────────────────
  async queueOrder(order: SaleTransaction) {
    const db = await this.getDB();
    await db.put('offline_orders', order);
  },

  async getPendingOrders(): Promise<SaleTransaction[]> {
    const db = await this.getDB();
    return db.getAll('offline_orders');
  },

  async removeOrderFromQueue(id: string) {
    const db = await this.getDB();
    await db.delete('offline_orders', id);
  },

  // ────────────────────────────────────────────────
  // Sales History
  // ────────────────────────────────────────────────
  async saveSalesHistory(transactions: SaleTransaction[]) {
    const db = await this.getDB();
    const tx = db.transaction('sales_history', 'readwrite');
    const store = tx.objectStore('sales_history');
    await store.clear();
    for (const t of transactions) {
      await store.put(t);
    }
    await tx.done;
  },

  async getSalesHistory(): Promise<SaleTransaction[]> {
    const db = await this.getDB();
    return db.getAll('sales_history');
  },

  // ────────────────────────────────────────────────
  // Expenses
  // ────────────────────────────────────────────────
  async saveExpenses(expenses: Expense[]) {
    const db = await this.getDB();
    const tx = db.transaction('expenses', 'readwrite');
    const store = tx.objectStore('expenses');
    await store.clear();
    for (const e of expenses) {
      await store.put(e);
    }
    await tx.done;
  },

  async getExpenses(): Promise<Expense[]> {
    const db = await this.getDB();
    return db.getAll('expenses');
  }
};
