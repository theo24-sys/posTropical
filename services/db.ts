
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MenuItem, SaleTransaction, User, Expense, InventoryItem } from '../types';

interface TropicalDB extends DBSchema {
  menu_items: { key: string; value: MenuItem; };
  users: { key: string; value: User; };
  offline_orders: { key: string; value: SaleTransaction; };
  sales_history: { key: string; value: SaleTransaction; };
  expenses: { key: string; value: Expense; };
  inventory: { key: string; value: InventoryItem; };
}

const DB_NAME = 'tropical-pos-db';
const DB_VERSION = 3;

export const LocalDB = {
  async getDB(): Promise<IDBPDatabase<TropicalDB>> {
    return openDB<TropicalDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('menu_items')) db.createObjectStore('menu_items', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('offline_orders')) db.createObjectStore('offline_orders', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('sales_history')) db.createObjectStore('sales_history', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('inventory')) db.createObjectStore('inventory', { keyPath: 'id' });
      },
    });
  },

  async saveInventory(items: InventoryItem[]) {
    const db = await this.getDB();
    const tx = db.transaction('inventory', 'readwrite');
    const store = tx.objectStore('inventory');
    for (const item of items) { 
      await store.put(item); 
    }
    await tx.done;
  },

  async getInventory(): Promise<InventoryItem[]> {
    const db = await this.getDB();
    return db.getAll('inventory');
  },

  async updateInventoryItem(item: InventoryItem) {
    const db = await this.getDB();
    await db.put('inventory', item);
  },

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
