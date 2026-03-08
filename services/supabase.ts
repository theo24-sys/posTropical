import { createClient } from '@supabase/supabase-js';
import { MenuItem, SaleTransaction, User, Expense, AuditLog, InventoryItem } from '../types';
import { KITCHEN_RECIPES } from '../constants'; // needed for deduction logic

// === YOUR REAL CONFIG - HARDCODED FOR RELIABILITY ===
const supabaseUrl = 'https://wmkefywbmydjnyqhvepv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indta2VmeXdibXlkam55cWh2ZXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODAwMjMsImV4cCI6MjA3OTI1NjAyM30.Hp53NUqr0NPE8KuAGwiBYE0UwDX_AdeJXiy_x4p4BSE';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Safe wrapper for Supabase queries - returns [] on error or no data
 */
const safeFetch = async <T>(query: any): Promise<T[]> => {
  try {
    const { data, error, status } = await query;
    if (error) {
      if (error.code === '42P01' || status === 404) return [];
      console.warn("Supabase Fetch Error:", error.message);
      return []; // Return empty instead of throwing to stop loops
    }
    return data || [];
  } catch (e: any) {
    console.warn("Supabase Exception:", e.message);
    return [];
  }
};

/**
 * Simple type for active promotion
 */
interface Promotion {
  discount_percent: number;
}

export const DB = {
  // ────────────────────────────────────────────────
  // Users
  // ────────────────────────────────────────────────
  async getUsers(): Promise<User[]> {
    return await safeFetch(supabase.from('users').select('*'));
  },

  async saveUser(user: User) {
    await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      role: user.role,
      pin: user.pin,
      avatar: user.avatar
    });
  },

  async deleteUser(id: string) {
    await supabase.from('users').delete().eq('id', id);
  },

  // ────────────────────────────────────────────────
  // Active Promotion (FIXED MATCHING LOGIC)
  // ────────────────────────────────────────────────
  async getActivePromotion(): Promise<Promotion | null> {
    try {
      // FIX: Use ISO string. PostgreSQL understands this globally.
      // Your previous format (08/03/2026) was being rejected by the DB comparison.
      const now = new Date();
      const eatNowIso = now.toISOString(); 

      console.log('Frontend querying promotions with ISO time:', eatNowIso);

      const { data, error } = await supabase
        .from('promotions')
        .select('discount_percent')
        .eq('is_active', true)
        .lte('start_datetime', eatNowIso)
        .gte('end_datetime', eatNowIso)
        .order('start_datetime', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Promo table query failed:', error.message);
        return null;
      }

      if (!data) {
        // Logging the raw data to see why the match failed
        const { data: debugRows } = await supabase.from('promotions').select('*').limit(3);
        console.log('No promo match. DB contents:', debugRows);
        return null;
      }

      console.log('Promo FOUND:', data.discount_percent);
      return { discount_percent: data.discount_percent };
    } catch (err: any) {
      console.error('getActivePromotion crashed:', err.message);
      return null;
    }
  },

  // ────────────────────────────────────────────────
  // Menu Items
  // ────────────────────────────────────────────────
  async getMenuItems(): Promise<MenuItem[]> {
    const data = await safeFetch<any[]>(supabase.from('menu_items').select('*'));
    return data.map((item: any) => ({
      ...item,
      lowStockThreshold: item.low_stock_threshold || item.lowStockThreshold || 0
    }));
  },

  async saveMenuItem(item: MenuItem) {
    const dbItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description,
      stock: item.stock,
      low_stock_threshold: item.lowStockThreshold
    };
    await supabase.from('menu_items').upsert(dbItem);
  },

  async deleteMenuItem(id: string) {
    await supabase.from('menu_items').delete().eq('id', id);
  },

  // ────────────────────────────────────────────────
  // Inventory
  // ────────────────────────────────────────────────
  async getInventory(): Promise<InventoryItem[]> {
    const data = await safeFetch<any[]>(supabase.from('inventory').select('*'));
    return data.map((i: any) => ({
      ...i,
      lowStockThreshold: i.low_stock_threshold || i.lowStockThreshold || 0
    }));
  },

  async saveInventoryItem(item: InventoryItem) {
    await supabase.from('inventory').upsert({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      low_stock_threshold: item.lowStockThreshold
    });
  },

  async deleteInventoryItem(id: string) {
    await supabase.from('inventory').delete().eq('id', id);
  },

  /**
   * Deducts stock from inventory based on KITCHEN_RECIPES mapping
   * BATCH UPDATED for reliability.
   */
  async deductKitchenInventory(saleItems: { id: string; quantity: number }[]) {
    try {
      const { data: currentInv } = await supabase.from('inventory').select('id, quantity');
      if (!currentInv) return { success: false };

      const updates: { id: string; quantity: number }[] = [];
      const invMap = new Map(currentInv.map(i => [i.id, i.quantity]));

      for (const item of saleItems) {
        const recipes = KITCHEN_RECIPES[item.id] || [];
        for (const rec of recipes) {
          const deductQty = rec.amount * item.quantity;
          const currentQty = invMap.get(rec.invId) ?? 0;
          if (deductQty > 0) {
            const newQty = Math.max(0, currentQty - deductQty);
            updates.push({ id: rec.invId, quantity: newQty });
            invMap.set(rec.invId, newQty); 
          }
        }
      }

      if (updates.length > 0) {
        const { error } = await supabase.from('inventory').upsert(updates);
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Supabase deduction failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ────────────────────────────────────────────────
  // Transactions
  // ────────────────────────────────────────────────
  async getTransactions(): Promise<SaleTransaction[]> {
    const data = await safeFetch<any[]>(
      supabase.from('transactions').select('*').order('date', { ascending: false }).limit(1000)
    );
    return data.map((t: any) => ({
      id: t.id,
      date: t.date,
      total: t.total,
      paymentMethod: t.payment_method,
      status: t.status || 'Paid',
      cashierName: t.cashier_name,
      tableNumber: t.table_number,
      orderType: t.order_type,
      items: t.items,
      updatedBy: t.updated_by,
      updatedAt: t.updated_at
    }));
  },

  async saveTransaction(transaction: SaleTransaction) {
    const dbTx: any = {
      id: transaction.id,
      date: transaction.date,
      total: transaction.total,
      payment_method: transaction.paymentMethod,
      status: transaction.status,
      cashier_name: transaction.cashierName,
      table_number: transaction.tableNumber,
      order_type: transaction.orderType,
      items: transaction.items,
      updated_by: transaction.updatedBy,
      updated_at: transaction.updatedAt
    };
    await supabase.from('transactions').upsert(dbTx);
  },

  async updateTransactionDate(id: string, newDate: string) {
    await supabase.from('transactions').update({ date: newDate }).eq('id', id);
  },

  // ────────────────────────────────────────────────
  // Expenses
  // ────────────────────────────────────────────────
  async getExpenses(): Promise<Expense[]> {
    const data = await safeFetch<any[]>(
      supabase.from('expenses').select('*').order('date', { ascending: false })
    );
    return data.map((e: any) => ({
      id: e.id,
      date: e.date,
      description: e.description,
      amount: e.amount,
      category: e.category,
      recordedBy: e.recorded_by
    }));
  },

  async saveExpense(expense: Expense) {
    await supabase.from('expenses').insert({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      recorded_by: expense.recordedBy
    });
  },

  async deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
  },

  // ────────────────────────────────────────────────
  // Audit Logs
  // ────────────────────────────────────────────────
  async getAuditLogs(): Promise<AuditLog[]> {
    const data = await safeFetch<any[]>(
      supabase.from('audit_logs').select('*').order('date', { ascending: false }).limit(500)
    );
    return data.map((l: any) => ({
      id: l.id,
      date: l.date,
      userId: l.user_id,
      userName: l.user_name,
      action: l.action,
      details: l.details,
      severity: l.severity
    }));
  },

  async saveAuditLog(log: AuditLog) {
    await supabase.from('audit_logs').insert({
      id: log.id,
      date: log.date,
      user_id: log.userId,
      user_name: log.userName,
      action: log.action,
      details: log.details,
      severity: log.severity
    });
  }
};
