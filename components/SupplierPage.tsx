import React, { useMemo, useState } from 'react';
import { Expense, User } from '../types';
import { ChefHat, Clock3, LogOut, Plus, ReceiptText, Store, Truck, Warehouse, Trash2, PlusCircle, X, History } from 'lucide-react';

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

const sourceMeta: Record<SupplierSource, { icon: React.ReactNode; label: string }> = {
  Supermarket: { icon: <Store size={20} />, label: 'Supermarket' },
  Town: { icon: <Truck size={20} />, label: 'Town' },
  Butchery: { icon: <ChefHat size={20} />, label: 'Butchery' },
  Market: { icon: <Warehouse size={20} />, label: 'Market' },
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
  const [showHistory, setShowHistory] = useState(false);

  const myExpenses = useMemo(() => {
    return expenses
      .filter(exp => exp.recordedBy === currentUser.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, currentUser.name]);

  const todayExpenses = useMemo(() => {
    return myExpenses.filter(exp => exp.date.slice(0, 10) === today);
  }, [myExpenses, today]);

  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);
  const totalCost = groups.reduce((sum, group) => {
    return sum + group.items.reduce((itemSum, item) => itemSum + (item.subtotal || 0), 0);
  }, 0);

  const addNewGroup = (source: SupplierSource) => {
    const newGroup: PurchaseGroup = { id: `group-${Date.now()}`, source, items: [] };
    setGroups([...groups, newGroup]);
  };

  const addItemToGroup = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          items: [...group.items, {
            id: `item-${Date.now()}`,
            itemName: '',
            quantity: 0,
            quantityUnit: 'Pieces',
            unitCost: 0,
            subtotal: 0
          }]
        };
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
            if (updated.quantity !== undefined && updated.unitCost !== undefined) {
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
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, items: group.items.filter(item => item.id !== itemId) };
      }
      return group;
    }));
  };

  const removeGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
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

    setGroups([]);
    setNote('');
    setExpenseDate(today);
    setIsSaving(false);
  };

  const clearAll = () => setGroups([]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef7ed,_#fff_42%,_#f8fafc_100%)] text-[#3f2b1c]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Supplier intake</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Silas Purchases</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500 hover:bg-amber-50">
                <History size={16} /> History
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500 hover:bg-red-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            {/* Header Banner */}
            <div className="overflow-hidden rounded-[32px] bg-[#3f2b1c] p-6 text-white shadow-lg">
              <h2 className="text-3xl font-black">Batch Entry</h2>
              <p className="text-white/75 mt-1">Add many items at once</p>
            </div>

            {/* Category Buttons - Mobile Optimized */}
            <div className="rounded-3xl bg-white border border-white/60 p-5">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-amber-500">Select Category</p>
              <div className="grid grid-cols-2 gap-3">
                {SOURCES.map(source => (
                  <button
                    key={source}
                    onClick={() => addNewGroup(source)}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-gray-100 py-6 hover:border-amber-300 active:bg-amber-50 transition-all"
                  >
                    {sourceMeta[source].icon}
                    <span className="mt-2 font-black text-base">{source}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Batch Form */}
            <div className="rounded-[32px] border border-white/60 bg-white p-5 shadow-xl flex flex-col h-[calc(100vh-220px)] lg:h-auto lg:max-h-[calc(100vh-160px)] overflow-hidden">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-xs font-black uppercase text-amber-500">CURRENT BATCH</p>
                  <h3 className="font-black text-2xl">Items</h3>
                </div>
                <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className="rounded-xl border px-4 py-3 text-sm" />
              </div>

              <div className="mb-5 bg-gradient-to-r from-amber-50 to-emerald-50 p-4 rounded-2xl flex justify-between items-center font-black text-lg">
                <div>Items: {totalItems}</div>
                <div className="text-emerald-700 text-xl">KES {totalCost.toLocaleString()}</div>
              </div>

              {/* Scrollable Area - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-8 overscroll-y-contain touch-pan-y custom-scroll">
                {groups.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <PlusCircle size={60} className="mx-auto mb-4 text-amber-200" />
                    <p className="text-lg">Tap a category above to start</p>
                  </div>
                )}

                {groups.map((group, index) => (
                  <div key={group.id} className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        {sourceMeta[group.source].icon}
                        <span className="font-black text-lg">{group.source} — Group {index + 1}</span>
                      </div>
                      <button onClick={() => removeGroup(group.id)} className="text-red-500 p-2">
                        <Trash2 size={22} />
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white pb-2">
                      <table className="w-full min-w-[680px]">
                        <thead>
                          <tr className="text-xs font-black text-gray-400 border-b">
                            <th className="pl-5 pr-3 py-4 text-left">ITEM NAME</th>
                            <th className="px-3 py-4 w-24">QTY</th>
                            <th className="px-3 py-4 w-28">UNIT</th>
                            <th className="px-3 py-4 w-32">UNIT COST</th>
                            <th className="px-5 py-4 text-right">SUBTOTAL</th>
                            <th className="w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map(item => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="pl-5 pr-3 py-4">
                                <input
                                  value={item.itemName}
                                  onChange={(e) => updateItem(group.id, item.id, { itemName: e.target.value })}
                                  placeholder="e.g. AneeK Coconut Cream"
                                  className="w-full rounded-2xl border border-gray-200 px-5 py-5 text-base font-medium focus:border-amber-400"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateItem(group.id, item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                  className="w-full rounded-2xl border border-gray-200 px-5 py-5 text-center text-base font-medium"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <select
                                  value={item.quantityUnit}
                                  onChange={(e) => updateItem(group.id, item.id, { quantityUnit: e.target.value as QuantityUnit })}
                                  className="w-full rounded-2xl border border-gray-200 px-5 py-5 text-base font-medium"
                                >
                                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-4">
                                <input
                                  type="number"
                                  value={item.unitCost || ''}
                                  onChange={(e) => updateItem(group.id, item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                                  className="w-full rounded-2xl border border-gray-200 px-5 py-5 text-base font-medium"
                                />
                              </td>
                              <td className="px-5 py-4 text-right font-black text-emerald-600 text-lg">
                                KES {(item.subtotal || 0).toLocaleString()}
                              </td>
                              <td className="py-4">
                                <button onClick={() => removeItem(group.id, item.id)} className="p-2 text-gray-400 hover:text-red-500">
                                  <Trash2 size={22} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={() => addItemToGroup(group.id)}
                      className="mt-5 w-full py-5 rounded-2xl border border-dashed border-gray-300 text-base font-black flex items-center justify-center gap-3 hover:bg-white"
                    >
                      <PlusCircle size={24} /> Add Another Item
                    </button>

                    <div className="mt-5 text-right text-2xl font-black text-emerald-700">
                      Group Total: KES {group.items.reduce((sum, i) => sum + (i.subtotal || 0), 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-6 flex gap-3 pt-6 border-t border-gray-100">
                <button onClick={clearAll} className="flex-1 py-5 rounded-2xl border border-gray-300 font-black text-gray-600 active:bg-gray-100">Clear</button>
                <button
                  onClick={handleSubmit}
                  disabled={groups.length === 0 || isSaving}
                  className="flex-[2] py-5 rounded-2xl bg-[#3f2b1c] text-white font-black disabled:opacity-60 active:scale-95 transition"
                >
                  {isSaving ? 'Saving...' : `SAVE ALL (${totalItems})`}
                </button>
              </div>
            </div>
          </section>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-4">
            {/* Your existing sidebar */}
          </aside>
        </main>
      </div>

      {/* Mobile History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end lg:hidden">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black">Purchase History</h2>
              <button onClick={() => setShowHistory(false)}><X size={28} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {myExpenses.map(exp => (
                <div key={exp.id} className="border-b py-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-black text-lg">{exp.itemName}</p>
                      <p className="text-gray-500">{exp.supplierSource} • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-black text-xl text-emerald-600">KES {exp.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPage;
