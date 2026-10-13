import React, { useMemo, useState } from 'react';
import { CountItem, InventoryItem, StockCount, StockCountEntry, User } from '../types';
import { ArrowLeft, Check, ClipboardList, Clock, Package, Plus, Save, Search, Store } from 'lucide-react';

interface StockCountPageProps {
  currentUser: User;
  countItems: CountItem[];
  inventory: InventoryItem[];
  stockCounts: StockCount[];
  onSubmit: (count: StockCount) => Promise<void>;
  onLogout: () => void;
  /** Supplier only: opens the purchases screen (SupplierPage). */
  onOpenPurchases?: () => void;
}

const nairobiToday = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });

export type CountValues = Record<
  string,
  { opening: string; purchased: string; sold: string; closing: string }
>;
export type PrevClosing = { byId: Map<string, number>; byName: Map<string, number> };

/**
 * Carry-forward source: for a role, each item's most recent Remaining
 * (closing) recorded on a day before `today`. Newest submission wins; ids
 * first with a name fallback so a re-created checklist row still finds its
 * previous remaining. Today's own sheet never seeds the opening.
 */
export function collectPreviousClosings(
  stockCounts: StockCount[],
  role: string,
  today: string
): PrevClosing {
  const wanted = (role || '').trim().toLowerCase();
  const byId = new Map<string, number>();
  const byName = new Map<string, number>();
  stockCounts
    .filter(c => (c.role || '').trim().toLowerCase() === wanted)
    .map(c => ({ c, d: c.countDate || c.date.slice(0, 10) }))
    .filter(x => x.d < today)
    .sort((a, b) => new Date(b.c.date).getTime() - new Date(a.c.date).getTime())
    .forEach(({ c }) => {
      for (const e of c.entries) {
        const closing = Number(e.closing);
        if (!Number.isFinite(closing) || closing < 0) continue;
        if (e.itemId && !byId.has(e.itemId)) byId.set(e.itemId, closing);
        const name = (e.itemName || '').trim().toLowerCase();
        if (name && !byName.has(name)) byName.set(name, closing);
      }
    });
  return { byId, byName };
}

/** Opening = whatever the staff typed, otherwise the carried-over remaining. */
export function resolveOpening(
  typed: string | undefined,
  item: { id: string; name: string },
  prev: PrevClosing
): string {
  if (typed) return typed;
  const carried =
    prev.byId.get(item.id) ??
    prev.byName.get((item.name || '').trim().toLowerCase());
  return carried === undefined ? '' : String(carried);
}

/**
 * Rows submitted for one sheet. Untouched items are skipped (their carried
 * remaining simply stays the latest one on record); for touched items the
 * opening comes from the carry-forward and a blank Remaining is finished with
 * the standard equation (opening + received − sales) instead of recording a
 * zero that would wipe the item's master stock row.
 */
export function buildCountEntries(
  items: CountItem[],
  values: CountValues,
  prev: PrevClosing
): StockCountEntry[] {
  const entries: StockCountEntry[] = [];
  for (const item of items) {
    const v = values[item.id];
    if (!v) continue;
    const opening = Number(resolveOpening(v.opening, item, prev) || 0);
    const purchased = Number(v.purchased || 0);
    const sold = Number(v.sold || 0);
    const closing =
      v.closing === ''
        ? Math.max(0, opening + purchased - sold)
        : Number(v.closing || 0);
    if (![opening, purchased, sold, closing].every(Number.isFinite)) {
      throw new Error(`Enter valid numbers for ${item.name}.`);
    }
    if ([opening, purchased, sold, closing].some(value => value < 0)) {
      throw new Error(`Stock values cannot be negative for ${item.name}.`);
    }
    if (!opening && !purchased && !sold && !closing) continue;
    entries.push({ itemId: item.id, inventoryId: item.inventoryId, itemName: item.name, unit: item.unit, opening, purchased, sold, closing });
  }
  return entries;
}

export const StockCountPage: React.FC<StockCountPageProps> = ({ currentUser, countItems, inventory, stockCounts, onSubmit, onLogout, onOpenPurchases }) => {
  const role = (currentUser.role || '').trim().toLowerCase();
  const [showLog, setShowLog] = useState(false);
  const [search, setSearch] = useState('');
  const [values, setValues] = useState<Record<string, { opening: string; purchased: string; sold: string; closing: string }>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isChefSide = role === 'chef';
  const isBaristaSide = role === 'barista';
  const isFrontSide = role === 'waiter' || role === 'steward';
  const isSupplierSide = role === 'supplier';

  const myItems = useMemo(() => {
    return countItems
      .filter(i => i.active && i.roles.some(r => r.toLowerCase() === role))
      .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [countItems, role, search]);

  const invById = useMemo(() => new Map(inventory.map(item => [item.id, item])), [inventory]);

  const setValue = (itemId: string, field: 'opening' | 'purchased' | 'sold' | 'closing', value: string) => {
    setValues(prev => {
      const existing = prev[itemId] || { opening: '', purchased: '', sold: '', closing: '' };
      return { ...prev, [itemId]: { ...existing, [field]: value } };
    });
  };

  const filledCount = myItems.filter(i => values[i.id] && Object.values(values[i.id]).some(v => v !== '')).length;

  // Daily log: this role's submissions, newest first (deduped by date).
  const myCountDate = nairobiToday();
  const myLogs = useMemo(() =>
    stockCounts
      .filter(c => (c.role || '').trim().toLowerCase() === role)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30),
  [stockCounts, role]);
  const submittedToday = myLogs.some(c => c.countDate === myCountDate || c.date.slice(0, 10) === myCountDate);

  // Carry-forward source: every item's most recent Remaining from an earlier
  // day is the Opening of the next day's sheet — all roles, all items.
  const prevClosing = useMemo(
    () => collectPreviousClosings(stockCounts, role, myCountDate),
    [stockCounts, role, myCountDate]
  );

  const openingFor = (item: CountItem): string =>
    resolveOpening(values[item.id]?.opening, item, prevClosing);

  const handleSubmit = async () => {
    const entries = buildCountEntries(myItems, values, prevClosing);

    if (entries.length === 0) {
      setError('Enter at least one item before submitting.');
      return;
    }

    setSaving(true);
    setError(null);

    const count: StockCount = {
      id: `sc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      countDate: nairobiToday(),
      role: currentUser.role,
      staffId: currentUser.id,
      staffName: currentUser.name,
      entries,
      note: note || undefined,
    };

    try {
      await onSubmit(count);
      setSavedId(count.id);
      setValues({});
      setNote('');
    } catch (e: any) {
      setError(e?.message || 'Could not save the count. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldLabel = isChefSide
    ? { opening: 'Opening', purchased: 'Purchased', sold: 'Sold', closing: 'Closing' }
    : isSupplierSide
      ? { opening: 'Opening', purchased: 'Received', sold: 'Sent', closing: 'Closing' }
      : { opening: 'Opening', purchased: 'Received', sold: 'Sales', closing: 'Remaining' };

  const roleTitle = isChefSide
    ? 'Kitchen Count'
    : isBaristaSide
      ? 'Bar Count'
      : isFrontSide
        ? 'Front of House Count'
        : isSupplierSide
          ? 'Home Inventory'
          : 'Stock Count';

  return (
    <div className="min-h-screen bg-[#F5F4EF] font-sans text-[#4B3621] pb-28">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#4B3621] text-white flex items-center justify-center shrink-0">
              <ClipboardList size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight leading-tight truncate">{roleTitle}</h1>
                {submittedToday && (
                  <span className="shrink-0 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-200">Logged today</span>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">
                {currentUser.name} · {currentUser.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenPurchases && (
              <button
                onClick={onOpenPurchases}
                className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1.5"
                title="Record purchases"
              >
                <Store size={14} /> Purchases
              </button>
            )}
            <button
              onClick={() => setShowLog(s => !s)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 ${showLog ? 'bg-[#4B3621] text-white' : 'bg-gray-50 text-gray-400 hover:text-[#4B3621]'}`}
              title="Daily log"
            >
              <Clock size={14} /> Log
            </button>
            <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#4B3621]">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {showLog && (
        <div className="max-w-3xl mx-auto px-4 pt-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Daily Log · last 30 sheets</span>
              <button onClick={() => setShowLog(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#4B3621]">Close</button>
            </div>
            {myLogs.length === 0 && (
              <div className="px-4 py-8 text-center text-sm font-bold text-gray-300">No counts submitted yet.</div>
            )}
            {myLogs.map(c => (
              <div key={c.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${c.countDate === myCountDate || c.date.slice(0, 10) === myCountDate ? 'text-green-600' : 'text-gray-400'}`}>
                    {new Date(c.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} · {new Date(c.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-black text-gray-300">{c.staffName}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.entries.map(e => (
                    <span key={e.itemId} className="rounded-full bg-gray-50 border border-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {e.itemName}: {e.closing}
                    </span>
                  ))}
                </div>
                {c.note && <p className="mt-1.5 text-xs font-bold text-gray-400">“{c.note}”</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {savedId && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Check size={16} />
            </div>
            <div className="text-sm font-bold text-green-700">Count submitted. Admin can see it in the console now.</div>
          </div>
        )}

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search item..."
            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-[#4B3621] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{myItems.length} items</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#4B3621]">{filledCount} filled</span>
        </div>

        <div className="space-y-3">
          {myItems.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm font-bold text-gray-400">
              No items assigned to your role yet. Ask the admin to add them.
            </div>
          )}
          {myItems.map(item => {
            const v = values[item.id] || { opening: '', purchased: '', sold: '', closing: '' };
            const master = item.inventoryId ? invById.get(item.inventoryId) : undefined;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={14} className="text-gray-300 shrink-0" />
                    <span className="font-black text-sm truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 shrink-0">{item.unit}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(['opening', 'purchased', 'sold', 'closing'] as const).map(field => (
                    <div key={field}>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-300 mb-1">{fieldLabel[field]}</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={field === 'opening' ? openingFor(item) : v[field]}
                        onChange={e => setValue(item.id, field, e.target.value)}
                        className="w-full bg-gray-50 rounded-xl px-2 py-2 text-sm font-black text-center outline-none focus:bg-white border border-transparent focus:border-[#4B3621] transition-colors"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>

                {master && (
                  <p className="mt-2 text-[10px] font-bold text-gray-300">
                    Master stock: {master.quantity} {master.unit}
                  </p>
                )}
                {!master && <p className="mt-2 text-[10px] font-bold text-amber-600">Not linked to master inventory</p>}
              </div>
            );
          })}
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note for admin (optional) — e.g. wastage, spoilage, breakages"
          rows={2}
          className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#4B3621] transition-colors"
        />
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-30">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-xs font-bold text-red-500 mb-2">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={saving || filledCount === 0}
            className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${saving || filledCount === 0 ? 'bg-gray-100 text-gray-300' : 'bg-[#4B3621] text-white shadow-xl hover:bg-[#3a2a1a]'}`}
          >
            {saving ? <ArrowLeft size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Submitting…' : `Submit Count (${filledCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockCountPage;
