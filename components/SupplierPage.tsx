import React, { useMemo, useState } from 'react';
import { Expense, User } from '../types';
import {
  ChefHat,
  LogOut,
  Plus,
  Store,
  Truck,
  Warehouse,
  Trash2,
  PlusCircle,
  X,
  History,
  ChevronDown,
} from 'lucide-react';

interface SupplierPageProps {
  currentUser: User;
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => Promise<void>;
  onLogout: () => void;
}

type SupplierSource = 'Supermarket' | 'Town' | 'Butchery' | 'Market';
type QuantityUnit =
  | 'Litres'
  | 'Kgs'
  | 'Pieces'
  | 'Bottles'
  | 'Dozens'
  | 'Bunches'
  | 'Sacks'
  | 'Cans'
  | 'Boxes'
  | 'Packets'
  | 'Cartons'
  | 'Other';

const SOURCES: SupplierSource[] = ['Supermarket', 'Town', 'Butchery', 'Market'];
const UNITS: QuantityUnit[] = [
  'Pieces',
  'Litres',
  'Kgs',
  'Bottles',
  'Dozens',
  'Bunches',
  'Sacks',
  'Cans',
  'Boxes',
  'Packets',
  'Cartons',
  'Other',
];

const sourceMeta: Record<SupplierSource, { icon: React.ReactNode; color: string; bg: string }> = {
  Supermarket: {
    icon: <Store size={22} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  Town: {
    icon: <Truck size={22} />,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
  Butchery: {
    icon: <ChefHat size={22} />,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
  Market: {
    icon: <Warehouse size={22} />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
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

/* ─── Reusable mobile-friendly input ─────────────────────────────────────── */
const MobileInput: React.FC<{
  label: string;
  value: string | number;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  onChange: (val: string) => void;
  className?: string;
}> = ({ label, value, type = 'text', placeholder, inputMode, onChange, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
    <input
      type={type}
      inputMode={inputMode}
      value={value === 0 ? '' : value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-semibold text-[#3f2b1c] placeholder-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all min-h-[54px]"
    />
  </div>
);

/* ─── Reusable mobile-friendly select ────────────────────────────────────── */
const MobileSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
}> = ({ label, value, options, onChange, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-4 pr-10 text-base font-semibold text-[#3f2b1c] focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all min-h-[54px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  </div>
);

/* ─── Single item card (mobile-first, no table) ───────────────────────────── */
const ItemCard: React.FC<{
  item: PurchaseItem;
  groupId: string;
  index: number;
  onUpdate: (groupId: string, itemId: string, updates: Partial<PurchaseItem>) => void;
  onRemove: (groupId: string, itemId: string) => void;
}> = ({ item, groupId, index, onUpdate, onRemove }) => {
  return (
    <div className="relative rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Item number badge + delete */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
          Item #{index + 1}
        </span>
        <button
          onClick={() => onRemove(groupId, item.id)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-400 active:bg-red-100 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Item name — full width */}
      <MobileInput
        label="Item Name"
        value={item.itemName}
        placeholder="e.g. AneeK Coconut Cream"
        onChange={(v) => onUpdate(groupId, item.id, { itemName: v })}
        className="mb-3"
      />

      {/* Quantity + Unit — side by side */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <MobileInput
          label="Quantity"
          value={item.quantity}
          type="number"
          inputMode="decimal"
          placeholder="0"
          onChange={(v) =>
            onUpdate(groupId, item.id, { quantity: parseFloat(v) || 0 })
          }
        />
        <MobileSelect
          label="Unit"
          value={item.quantityUnit}
          options={UNITS}
          onChange={(v) => onUpdate(groupId, item.id, { quantityUnit: v as QuantityUnit })}
        />
      </div>

      {/* Unit cost — full width */}
      <MobileInput
        label="Unit Cost (KES)"
        value={item.unitCost}
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        onChange={(v) =>
          onUpdate(groupId, item.id, { unitCost: parseFloat(v) || 0 })
        }
        className="mb-4"
      />

      {/* Subtotal pill */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Subtotal</span>
        <span className="text-xl font-black text-emerald-700">
          KES {(item.subtotal || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────────────── */
export const SupplierPage: React.FC<SupplierPageProps> = ({
  currentUser,
  expenses,
  onSaveExpense,
  onLogout,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [expenseDate, setExpenseDate] = useState(today);
  const [note, setNote] = useState('');
  const [groups, setGroups] = useState<PurchaseGroup[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const myExpenses = useMemo(
    () =>
      expenses
        .filter((exp) => exp.recordedBy === currentUser.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses, currentUser.name]
  );

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const totalCost = groups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + (i.subtotal || 0), 0),
    0
  );

  const addNewGroup = (source: SupplierSource) => {
    setGroups((prev) => [
      ...prev,
      {
        id: `group-${Date.now()}`,
        source,
        items: [
          {
            id: `item-${Date.now()}`,
            itemName: '',
            quantity: 0,
            quantityUnit: 'Pieces',
            unitCost: 0,
            subtotal: 0,
          },
        ],
      },
    ]);
    setShowCategoryPicker(false);
  };

  const addItemToGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: [
                ...g.items,
                {
                  id: `item-${Date.now()}`,
                  itemName: '',
                  quantity: 0,
                  quantityUnit: 'Pieces',
                  unitCost: 0,
                  subtotal: 0,
                },
              ],
            }
          : g
      )
    );
  };

  const updateItem = (groupId: string, itemId: string, updates: Partial<PurchaseItem>) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((item) => {
            if (item.id !== itemId) return item;
            const updated = { ...item, ...updates };
            updated.subtotal = (updated.quantity || 0) * (updated.unitCost || 0);
            return updated;
          }),
        };
      })
    );
  };

  const removeItem = (groupId: string, itemId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g
      )
    );
  };

  const removeGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef7ed,_#fff_42%,_#f8fafc_100%)] text-[#3f2b1c]">
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[4px] text-amber-500">
              Supplier Intake
            </p>
            <h1 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
              Silas Purchases
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex h-11 items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 text-xs font-black text-gray-500 active:bg-amber-50 sm:px-4"
            >
              <History size={15} />
              <span className="hidden xs:inline">History</span>
            </button>
            <button
              onClick={onLogout}
              className="flex h-11 items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 text-xs font-black text-gray-500 active:bg-red-50 sm:px-4"
            >
              <LogOut size={15} />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-4 pb-36 pt-4 sm:px-6">

        {/* Hero banner */}
        <div className="mb-4 overflow-hidden rounded-[28px] bg-[#3f2b1c] px-6 py-5 text-white shadow-lg">
          <h2 className="text-2xl font-black sm:text-3xl">Batch Entry</h2>
          <p className="mt-0.5 text-sm text-white/70">Add many items at once across categories</p>
        </div>

        {/* Date + Note row */}
        <div className="mb-4 rounded-3xl border border-white/60 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Purchase Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-semibold text-[#3f2b1c] focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 min-h-[54px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Weekly restock"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-semibold text-[#3f2b1c] placeholder-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 min-h-[54px]"
              />
            </div>
          </div>
        </div>

        {/* Running totals bar */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total Items
            </p>
            <p className="text-2xl font-black text-[#3f2b1c]">{totalItems}</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total Cost
            </p>
            <p className="text-2xl font-black text-emerald-700">
              KES {totalCost.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-5">
          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/40 py-16 text-center">
              <PlusCircle size={52} className="mb-3 text-amber-300" />
              <p className="text-base font-black text-gray-500">No items yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Tap <strong>+ Add Category</strong> below to start
              </p>
            </div>
          )}

          {groups.map((group, gIdx) => {
            const meta = sourceMeta[group.source];
            const groupTotal = group.items.reduce((s, i) => s + (i.subtotal || 0), 0);

            return (
              <div
                key={group.id}
                className={`rounded-3xl border-2 p-4 ${meta.bg}`}
              >
                {/* Group header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${meta.color}`}>
                    {meta.icon}
                    <span className="text-base font-black">
                      {group.source}
                      <span className="ml-1 text-xs font-bold text-gray-400">
                        — Group {gIdx + 1}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-red-400 shadow-sm active:bg-red-50"
                    aria-label="Remove group"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Item cards */}
                <div className="space-y-3">
                  {group.items.map((item, iIdx) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      groupId={group.id}
                      index={iIdx}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* Add item button */}
                <button
                  onClick={() => addItemToGroup(group.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 py-4 text-sm font-black text-gray-500 active:bg-white transition-colors"
                >
                  <Plus size={18} />
                  Add Another Item
                </button>

                {/* Group total */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/70 px-5 py-3">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Group Total
                  </span>
                  <span className={`text-xl font-black ${meta.color}`}>
                    KES {groupTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Floating bottom action bar ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white/95 px-4 pb-safe pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <button
            onClick={() => setShowCategoryPicker(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 py-4 text-base font-black text-amber-700 active:bg-amber-100 transition-colors"
          >
            <Plus size={20} />
            Add Category
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setGroups([])}
              className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm font-black text-gray-600 active:bg-gray-100 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleSubmit}
              disabled={groups.length === 0 || isSaving}
              className="flex h-14 flex-[2] items-center justify-center rounded-2xl bg-[#3f2b1c] text-base font-black text-white shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {isSaving ? 'Saving…' : `Save All (${totalItems})`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category picker bottom sheet ──────────────────────────────────── */}
      {showCategoryPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          onClick={() => setShowCategoryPicker(false)}
        >
          <div
            className="w-full rounded-t-[32px] bg-white p-5 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Select Category</h2>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SOURCES.map((source) => {
                const meta = sourceMeta[source];
                return (
                  <button
                    key={source}
                    onClick={() => addNewGroup(source)}
                    className={`flex flex-col items-center justify-center rounded-3xl border-2 py-7 transition-all active:scale-95 ${meta.bg} ${meta.color}`}
                  >
                    {meta.icon}
                    <span className="mt-2 text-base font-black">{source}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── History bottom sheet ───────────────────────────────────────────── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="flex max-h-[88vh] w-full flex-col rounded-t-[32px] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-xl font-black">Purchase History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable list */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-3"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {myExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                  <History size={44} className="mb-3 text-gray-200" />
                  <p className="font-black">No history yet</p>
                </div>
              ) : (
                myExpenses.map((exp) => {
                  const src = exp.supplierSource as SupplierSource | undefined;
                  const meta = src ? sourceMeta[src] : null;
                  return (
                    <div
                      key={exp.id}
                      className="flex items-start justify-between border-b border-gray-100 py-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        {meta && (
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
                          >
                            {meta.icon}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-[#3f2b1c]">{exp.itemName}</p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {exp.supplierSource} •{' '}
                            {new Date(exp.date).toLocaleDateString('en-KE', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          {exp.quantity && exp.quantityUnit && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {exp.quantity} {exp.quantityUnit} @ KES {exp.unitCost}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="ml-4 shrink-0 text-base font-black text-emerald-600">
                        KES {Number(exp.amount).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPage;
