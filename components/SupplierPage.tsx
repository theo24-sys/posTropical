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
  Supermarket: { icon: <Store size={18} />, label: 'Supermarket' },
  Town: { icon: <Truck size={18} />, label: 'Town' },
  Butchery: { icon: <ChefHat size={18} />, label: 'Butchery' },
  Market: { icon: <Warehouse size={18} />, label: 'Market' },
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
        <header className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Supplier intake</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Silas Purchases</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-[3px] text-gray-500 hover:bg-amber-50 hover:text-amber-600"
              >
                <History size={16} /> History
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-[3px] text-gray-500 hover:bg-red-50 hover:text-red-600">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="grid flex-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ==================== BATCH FORM ==================== */}
          <section className="space-y-4">
            <div className="overflow-hidden rounded-[32px] bg-[#3f2b1c] p-6 text-white shadow-[0_26px_70px_-24px_rgba(63,43,28,0.5)] sm:p-8">
              <h2 className="text-3xl font-black">Batch Purchase Entry</h2>
              <p className="mt-2 text-white/75">Add multiple items per category</p>
            </div>

            {/* Category Buttons - Always Visible */}
            <div className="rounded-3xl border border-white/60 bg-white p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[4px] text-amber-500">CHOOSE CATEGORY</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOURCES.map(source => (
                  <button
                    key={source}
                    onClick={() => addNewGroup(source)}
                    className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 hover:border-amber-300 hover:shadow transition-all active:scale-95"
                  >
                    {sourceMeta[source].icon}
                    <span className="mt-2 text-sm font-black">{source}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form */}
            <div className="rounded-[32px] border border-white/60 bg-white p-6 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.18)] flex flex-col max-h-[calc(100vh-180px)] overflow-hidden">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">CURRENT BATCH</p>
                  <h3 className="text-2xl font-black">Items to Record</h3>
                </div>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium"
                />
              </div>

              <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 p-5 text-lg font-black flex justify-between items-center">
                <div>Total Items: <span className="text-amber-600">{totalItems}</span></div>
                <div className="text-2xl text-emerald-700">KES {totalCost.toLocaleString()}</div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scroll">
                {groups.length === 0 && (
                  <div className="py-16 text-center text-gray-400">
                    <PlusCircle size={48} className="mx-auto mb-4 text-amber-300" />
                    Tap a category above to begin
                  </div>
                )}

                {groups.map((group, index) => (
                  <div key={group.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        {sourceMeta[group.source].icon}
                        <span className="text-lg font-black">{group.source} — Group {index + 1}</span>
                      </div>
                      <button onClick={() => removeGroup(group.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b bg-gray-50 text-xs font-black uppercase text-gray-400">
                            <th className="pb-4 pl-6 pr-4 text-left w-[40%]">Item Name</th>
                            <th className="pb-4 px-4">Qty</th>
                            <th className="pb-4 px-4">Unit</th>
                            <th className="pb-4 px-4">Unit Cost</th>
                            <th className="pb-4 px-6 text-right">Subtotal</th>
                            <th className="pb-4 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {group.items.map(item => (
                            <tr key={item.id}>
                              <td className="py-4 pl-6 pr-4">
                                <input
                                  value={item.itemName}
                                  onChange={(e) => updateItem(group.id, item.id, { itemName: e.target.value })}
                                  placeholder="Item name..."
                                  className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-base font-medium"
                                />
                              </td>
                              <td className="py-4 px-4">
                                <input type="number" value={item.quantity || ''} onChange={(e) => updateItem(group.id, item.id, { quantity: parseFloat(e.target.value) || 0 })} className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-center" />
                              </td>
                              <td className="py-4 px-4">
                                <select value={item.quantityUnit} onChange={(e) => updateItem(group.id, item.id, { quantityUnit: e.target.value as QuantityUnit })} className="w-full rounded-2xl border border-gray-200 px-5 py-4">
                                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                              </td>
                              <td className="py-4 px-4">
                                <input type="number" value={item.unitCost || ''} onChange={(e) => updateItem(group.id, item.id, { unitCost: parseFloat(e.target.value) || 0 })} className="w-full rounded-2xl border border-gray-200 px-5 py-4" />
                              </td>
                              <td className="py-4 px-6 text-right font-black text-emerald-600">
                                KES {(item.subtotal || 0).toLocaleString()}
                              </td>
                              <td className="py-4">
                                <button onClick={() => removeItem(group.id, item.id)}><Trash2 size={20} className="text-gray-400 hover:text-red-500" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button onClick={() => addItemToGroup(group.id)} className="mt-5 w-full py-4 rounded-2xl border border-dashed border-gray-300 hover:border-amber-400 font-black text-gray-600 flex items-center justify-center gap-2">
                      <PlusCircle size={20} /> Add Item
                    </button>

                    <div className="mt-6 text-right font-black text-xl text-emerald-700">
                      Group Total: KES {group.items.reduce((sum, i) => sum + (i.subtotal || 0), 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t flex gap-3">
                <button onClick={clearAll} className="flex-1 py-4 rounded-2xl border border-gray-300 font-black text-gray-600">Clear All</button>
                <button onClick={handleSubmit} disabled={groups.length === 0 || isSaving} className="flex-[2] py-4 rounded-2xl bg-[#3f2b1c] text-white font-black disabled:opacity-60">
                  {isSaving ? 'Saving...' : `Save All (${totalItems})`}
                </button>
              </div>
            </div>
          </section>

          {/* Desktop Sidebar Only */}
          <aside className="hidden lg:block space-y-4">
            {/* Your original sidebar content */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-gray-300"><ReceiptText size={14} /> Today</div>
                <p className="mt-3 text-3xl font-black text-[#3f2b1c]">{todayExpenses.length}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-gray-300">Purchases</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)]">
              <h3 className="text-xl font-black mb-4">Recent Purchases</h3>
              {/* ... existing recent purchases list ... */}
              <div className="space-y-3">
                {myExpenses.slice(0, 6).map(expense => (
                  <div key={expense.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                    <p className="font-black">{expense.itemName}</p>
                    <p className="text-xs text-gray-500">{expense.supplierSource} • {expense.quantity} {expense.quantityUnit}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* Mobile History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end lg:hidden">
          <div className="bg-white w-full max-h-[90vh] rounded-t-3xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-2xl font-black">Purchase History</h2>
              <button onClick={() => setShowHistory(false)}><X size={28} /></button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              {myExpenses.length === 0 ? (
                <p className="text-center py-10 text-gray-400">No purchases yet</p>
              ) : (
                myExpenses.map(exp => (
                  <div key={exp.id} className="border-b py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-black">{exp.itemName}</p>
                        <p className="text-sm text-gray-500">{exp.supplierSource} • {new Date(exp.date).toLocaleDateString('en-GB')}</p>
                      </div>
                      <p className="font-black text-emerald-600">KES {exp.amount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPage;
