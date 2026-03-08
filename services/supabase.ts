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
      throw error;
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
  // 1. PROMOTIONS (Fixed Timezone & Loop Protection)
  // ────────────────────────────────────────────────
  async getActivePromotion(): Promise<Promotion | null> {
    try {
      // Primary: RPC call (fastest if it works)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_active_discount_percent');

      if (rpcError) {
        console.error('RPC call failed:', rpcError.message, rpcError.details, rpcError.hint);
      } else if (typeof rpcData === 'number' && rpcData > 0) {
        console.log('Active promo loaded via RPC:', rpcData, '%');
        return { discount_percent: rpcData };
      } else {
        console.log('RPC returned no active promo:', rpcData);
      }

      // Fallback: direct table query using EAT time
      const now = new Date();
      const eatNow = now.toLocaleString('en-GB', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6');

      console.log('Frontend querying promotions with EAT time:', eatNow);

      const { data: tableData, error: tableError } = await supabase
        .from('promotions')
        .select('discount_percent')
        .eq('is_active', true)
        .lte('start_datetime', eatNow)
        .gte('end_datetime', eatNow)
        .order('start_datetime', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tableError) {
        console.error('Table fallback query failed:', tableError.message, tableError.details, tableError.hint);
        return null;
      }

      if (!tableData) {
        console.log('No promo row matched with time string:', eatNow);

        // === DEBUG: SHOW ALL PROMO ROWS ===
        const { data: debugRows } = await supabase
          .from('promotions')
          .select('id, name, discount_percent, start_datetime, end_datetime, is_active')
          .limit(5);
        console.log('Debug: all promo rows in DB:', debugRows);

        return null;
      }

      console.log('Promo FOUND in frontend query:', tableData.discount_percent);
      return { discount_percent: tableData.discount_percent };
    } catch (err: any) {
      console.error('getActivePromotion crashed:', err.message);
      return null;
    }
  },

  // ────────────────────────────────────────────────
  // 2. INVENTORY (Batch Upsert to prevent IDB Crashes)
  // ────────────────────────────────────────────────
  async getInventory(): Promise<InventoryItem[]> {
    const data = await safeFetch<any[]>(supabase.from('inventory').select('*'));
    return data.map((i: any) => ({
      ...i,
      lowStockThreshold: i.low_stock_threshold || 0
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
   * Optimized: Fetches current stock once, calculates all changes, then sends ONE update.
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
            invMap.set(rec.invId, newQty); // Support multiple menu items using same ingredient
          }
        }
      }
      if (updates.length > 0) {
        const { error } = await supabase.from('inventory').upsert(updates);
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Inventory deduction failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ────────────────────────────────────────────────
  // 3. MENU ITEMS
  // ────────────────────────────────────────────────
  async getMenuItems(): Promise<MenuItem[]> {
    const data = await safeFetch<any[]>(supabase.from('menu_items').select('*'));
    return data.map((item: any) => ({
      ...item,
      lowStockThreshold: item.low_stock_threshold || 0
    }));
  },

  async saveMenuItem(item: MenuItem) {
    await supabase.from('menu_items').upsert({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description,
      stock: item.stock,
      low_stock_threshold: item.lowStockThreshold
    });
  },

  async deleteMenuItem(id: string) {
    await supabase.from('menu_items').delete().eq('id', id);
  },

  // ────────────────────────────────────────────────
  // 4. USERS
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
  // 5. TRANSACTIONS (EAT Time Handling)
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
    await supabase.from('transactions').upsert({
      id: transaction.id,
      date: transaction.date, // Frontend passes the EAT string
      total: transaction.total,
      payment_method: transaction.paymentMethod,
      status: transaction.status,
      cashier_name: transaction.cashierName,
      table_number: transaction.tableNumber,
      order_type: transaction.orderType,
      items: transaction.items,
      updated_by: transaction.updatedBy,
      updated_at: transaction.updatedAt
    });
  },

  // ────────────────────────────────────────────────
  // 6. EXPENSES & AUDIT
  // ────────────────────────────────────────────────
  async getExpenses(): Promise<Expense[]> {
    const data = await safeFetch<any[]>(supabase.from('expenses').select('*').order('date', { ascending: false }));
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
