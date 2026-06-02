import React, { useMemo, useState } from 'react';
import { Expense, User } from '../types';
import { ChefHat, Clock3, LogOut, Plus, ReceiptText, Store, Truck, Warehouse, Trash2, PlusCircle } from 'lucide-react';

interface SupplierPageProps {
  currentUser: User;
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => Promise<void>;
  onLogout: () => void;
}

type SupplierSource = 'Supermarket' | 'Town' | 'Butchery' | 'Market';
type QuantityUnit = 'Litres' | 'Kgs' | 'Pieces' | 'Bottles' | 'Dozens' | 'Bunches' | 'Sacks' | 'Cans' | 'Boxes' | 'Packets' | 'Cartons' | 'Other';

const SOURCES: SupplierSource[] = ['Supermarket', 'Town', 'Butchery', 'Market'];
const UNITS: QuantityUnit[] = ['Pieces', 'Litres', 'Kgs', 'Bottles', 'Dozens', 'Bunches', 'Sacks', 'Cans', 'Boxes', 'Packets', 'Cartons', 'Other'];

const sourceMeta: Record<SupplierSource, { icon: React.ReactNode; label: string; accent: string }> = {
  Supermarket: { icon: <Store size={18} />, label: 'Supermarket', accent: 'from-emerald-500 to-teal-500' },
  Town: { icon: <Truck size={18} />, label: 'Town', accent: 'from-sky-500 to-cyan-500' },
  Butchery: { icon: <ChefHat size={18} />, label: 'Butchery', accent: 'from-rose-500 to-red-500' },
  Market: { icon: <Warehouse size={18} />, label: 'Market', accent: 'from-amber-500 to-orange-500' },
};

interface PurchaseItem {
  id: string;
  itemName: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  unitCost: number;
  subtotal: number;
}

interface PurchaseGroup {
  id: string;
  source: SupplierSource;
  items: PurchaseItem[];
}

export const SupplierPage: React.FC<SupplierPageProps> = ({ currentUser, expenses, onSaveExpense, onLogout }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [expenseDate, setExpenseDate] = useState(today);
  const [note, setNote] = useState('');
  const [groups, setGroups] = useState<PurchaseGroup[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const myExpenses = useMemo(() => {
    return expenses
      .filter(exp => exp.recordedBy === currentUser.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, currentUser.name]);

  const todayExpenses = useMemo(() => {
    return myExpenses.filter(exp => exp.date.slice(0, 10) === today);
  }, [myExpenses, today]);

  // Calculate totals
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);
  const totalCost = groups.reduce((sum, group) => {
    return sum + group.items.reduce((itemSum, item) => itemSum + item.subtotal, 0);
  }, 0);

  const addNewGroup = (source: SupplierSource) => {
    const newGroup: PurchaseGroup = {
      id: `group-${Date.now()}`,
      source,
      items: []
    };
    setGroups([...groups, newGroup]);
  };

  const addItemToGroup = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        const newItem: PurchaseItem = {
          id: `item-${Date.now()}`,
          itemName: '',
          quantity: 0,
          quantityUnit: 'Pieces',
          unitCost: 0,
          subtotal: 0
        };
        return { ...group, items: [...group.items, newItem] };
      }
      return group;
    }));
  };

  const updateItem = (groupId: string, itemId: string, updates: Partial<PurchaseItem>) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        const updatedItems = group.items.map(item => {
          if (item.id === itemId) {
            const updated = { ...item, ...updates };
            if (updated.quantity && updated.unitCost) {
              updated.subtotal = updated.quantity * updated.unitCost;
            }
            return updated;
          }
          return item;
        });
        return { ...group, items: updatedItems };
      }
      return group;
    }));
  };

  const removeItem = (groupId: string, itemId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return { ...group, items: group.items.filter(item => item.id !== itemId) };
      }
      return group;
    })).filter(group => group.items.length > 0 || true); // Allow empty groups for now
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const handleSubmit = async () => {
    if (groups.length === 0) return;

    setIsSaving(true);

    for (const group of groups) {
      for (const item of group.items) {
        if (!item.itemName.trim() || item.quantity <= 0 || item.unitCost <= 0) continue;

        const total = item.quantity * item.unitCost;
        const purchaseDate = new Date(`${expenseDate}T12:00:00.000Z`).toISOString();

        await onSaveExpense({
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: purchaseDate,
          description: `${group.source} • ${item.itemName.trim()}`,
          amount: total,
          category: 'Inventory Restock',
          recordedBy: currentUser.name,
          supplierSource: group.source,
          itemName: item.itemName.trim(),
          quantity: item.quantity,
          quantityUnit: item.quantityUnit,
          unitCost: item.unitCost,
          note: note.trim() || undefined,
        });
      }
    }

    // Reset form
    setGroups([]);
    setNote('');
    setExpenseDate(today);
    setIsSaving(false);
  };

  const clearAll = () => {
    setGroups([]);
    setNote('');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef7ed,_#fff_42%,_#f8fafc_100%)] text-[#3f2b1c]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Supplier intake</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Silas Purchases</h1>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-[3px] text-gray-500 hover:bg-red-50 hover:text-red-600">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Batch Form */}
          <section className="space-y-
