import React, { useMemo, useState } from 'react';
import { Expense, User } from '../types';
import { CURRENCY } from '../constants';
import { Bell, ChefHat, Clock3, LogOut, Plus, ReceiptText, Store, Truck, Warehouse } from 'lucide-react';

interface SupplierPageProps {
  currentUser: User;
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => Promise<void>;
  onLogout: () => void;
}

const SOURCES: Expense['supplierSource'][] = ['Supermarket', 'Town', 'Butchery', 'Market'];

const sourceMeta: Record<NonNullable<Expense['supplierSource']>, { icon: React.ReactNode; label: string; accent: string }> = {
  Supermarket: { icon: <Store size={18} />, label: 'Supermarket', accent: 'from-emerald-500 to-teal-500' },
  Town: { icon: <Truck size={18} />, label: 'Town', accent: 'from-sky-500 to-cyan-500' },
  Butchery: { icon: <ChefHat size={18} />, label: 'Butchery', accent: 'from-rose-500 to-red-500' },
  Market: { icon: <Warehouse size={18} />, label: 'Market', accent: 'from-amber-500 to-orange-500' },
};

export const SupplierPage: React.FC<SupplierPageProps> = ({ currentUser, expenses, onSaveExpense, onLogout }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [supplierSource, setSupplierSource] = useState<NonNullable<Expense['supplierSource']>>('Supermarket');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(today);
  const [isSaving, setIsSaving] = useState(false);

  const myExpenses = useMemo(() => {
    return expenses
      .filter(exp => exp.recordedBy === currentUser.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, currentUser.name]);

  const todayExpenses = useMemo(() => myExpenses.filter(exp => exp.date.slice(0, 10) === today), [myExpenses, today]);
  const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const grandTotal = myExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const totalsBySource = useMemo(() => {
    return SOURCES.map(source => ({
      source,
      amount: myExpenses.filter(exp => exp.supplierSource === source).reduce((sum, exp) => sum + exp.amount, 0),
    }));
  }, [myExpenses]);

  const resetForm = () => {
    setItemName('');
    setQuantity('');
    setUnitCost('');
    setNote('');
    setSupplierSource('Supermarket');
    setExpenseDate(today);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    const cost = Number(unitCost);
    if (!itemName.trim() || !supplierSource || !qty || !cost || qty <= 0 || cost <= 0) return;

    setIsSaving(true);
    const total = qty * cost;
    const purchaseDate = expenseDate ? new Date(`${expenseDate}T12:00:00.000Z`).toISOString() : new Date().toISOString();

    await onSaveExpense({
      id: `exp-${Date.now()}`,
      date: purchaseDate,
      description: `${supplierSource} • ${itemName.trim()}`,
      amount: total,
      category: 'Inventory Restock',
      recordedBy: currentUser.name,
      supplierSource,
      itemName: itemName.trim(),
      quantity: qty,
      unitCost: cost,
      note: note.trim() || undefined,
    });

    resetForm();
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef7ed,_#fff_42%,_#f8fafc_100%)] text-[#3f2b1c]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Supplier intake</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Silas Purchases</h1>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-[3px] text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-[32px] bg-[#3f2b1c] p-6 text-white shadow-[0_26px_70px_-24px_rgba(63,43,28,0.5)] sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-200">Mobile purchase log</p>
                  <h2 className="mt-3 max-w-md text-3xl font-black leading-tight sm:text-4xl">Record stock buys from any source, fast.</h2>
                  <p className="mt-3 max-w-xl text-sm text-white/75 sm:text-base">Use the four source buckets to separate purchases from Supermarket, Town, Butchery, and Market. Every entry flows into the system expense reports with your name attached.</p>
                </div>
                <div className="hidden rounded-[24px] bg-white/10 p-4 text-amber-200 sm:block">
                  <ReceiptText size={28} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {totalsBySource.map(card => (
                  <div key={card.source} className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-white/70">
                      {sourceMeta[card.source].icon}
                      {card.source}
                    </div>
                    <p className="mt-3 text-lg font-black">{CURRENCY} {card.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/60 bg-white p-5 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">New expense</p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight">Add a purchase</h3>
                </div>
                <div className="rounded-full bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-[3px] text-amber-700">{currentUser.name}</div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SOURCES.map(source => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setSupplierSource(source)}
                    className={`rounded-[20px] border p-4 text-left transition-all ${supplierSource === source ? 'border-transparent bg-[#3f2b1c] text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px]">
                      {sourceMeta[source].icon}
                      {sourceMeta[source].label}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-300">Item</span>
                  <input
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    placeholder="e.g. Tomatoes"
                    className="w-full rounded-[22px] border-2 border-gray-100 bg-gray-50 px-5 py-4 text-base font-black outline-none transition-all focus:border-amber-200 focus:bg-white"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-300">Quantity</span>
                  <input
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0"
                    className="w-full rounded-[22px] border-2 border-gray-100 bg-gray-50 px-5 py-4 text-base font-black outline-none transition-all focus:border-amber-200 focus:bg-white"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-300">Unit Cost</span>
                  <input
                    value={unitCost}
                    onChange={e => setUnitCost(e.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0"
                    className="w-full rounded-[22px] border-2 border-gray-100 bg-gray-50 px-5 py-4 text-base font-black outline-none transition-all focus:border-amber-200 focus:bg-white"
                    required
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-300">Date lodged</span>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full rounded-[22px] border-2 border-gray-100 bg-gray-50 px-5 py-4 text-base font-black outline-none transition-all focus:border-amber-200 focus:bg-white"
                    required
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-300">Note</span>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder="Optional extra details"
                    className="w-full rounded-[22px] border-2 border-gray-100 bg-gray-50 px-5 py-4 text-base font-medium outline-none transition-all focus:border-amber-200 focus:bg-white"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-[24px] bg-amber-50 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Batch total</p>
                <p className="mt-1 text-3xl font-black text-[#3f2b1c]">
                  {CURRENCY} {(Number(quantity || 0) * Number(unitCost || 0)).toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-[24px] bg-[#3f2b1c] px-6 py-5 text-sm font-black uppercase tracking-[4px] text-white shadow-[0_22px_50px_-18px_rgba(63,43,28,0.6)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                <Plus size={18} /> {isSaving ? 'Saving...' : 'Save purchase'}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-gray-300"><Bell size={14} /> Today</div>
                <p className="mt-3 text-3xl font-black text-[#3f2b1c]">{CURRENCY} {todayTotal.toLocaleString()}</p>
              </div>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-gray-300"><Clock3 size={14} /> Entries</div>
                <p className="mt-3 text-3xl font-black text-[#3f2b1c]">{todayExpenses.length}</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Recent purchases</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight">Your latest entries</h3>
                </div>
                <div className="rounded-full bg-gray-50 px-3 py-2 text-[10px] font-black uppercase tracking-[3px] text-gray-400">{myExpenses.length}</div>
              </div>

              <div className="space-y-3">
                {myExpenses.slice(0, 8).map(expense => (
                  <div key={expense.id} className="rounded-[22px] border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#3f2b1c]">{expense.itemName || expense.description}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-gray-300">
                          {expense.supplierSource || 'Inventory'} · {expense.quantity ?? '—'} pcs
                        </p>
                        {expense.note && <p className="mt-2 text-xs font-medium text-gray-500">{expense.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-rose-500">{CURRENCY} {expense.amount.toLocaleString()}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-gray-300">{new Date(expense.date).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {myExpenses.length === 0 && (
                  <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-sm italic text-gray-300">
                    No purchases recorded yet.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default SupplierPage;
