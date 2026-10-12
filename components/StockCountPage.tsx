import React, { useMemo, useState } from 'react';
import { CountItem, InventoryItem, StockCount, StockCountEntry, User } from '../types';
import { ArrowLeft, Check, ClipboardList, Package, Plus, Save, Search } from 'lucide-react';

interface StockCountPageProps {
  currentUser: User;
  countItems: CountItem[];
  inventory: InventoryItem[];
  onSubmit: (count: StockCount) => Promise<void>;
  onLogout: () => void;
}

const nairobiToday = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });

export const StockCountPage: React.FC<StockCountPageProps> = ({ currentUser, countItems, inventory, onSubmit, onLogout }) => {
  const role = (currentUser.role || '').trim().toLowerCase();
  const [search, setSearch] = useState('');
  const [values, setValues] = useState<Record<string, { opening: string; purchased: string; sold: string; closing: string }>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isChefSide = role === 'chef';
  const isBaristaSide = role === 'barista';
  const isFrontSide = role === 'waiter' || role === 'steward';

  const myItems = useMemo(() => {
    return countItems
      .filter(i => i.active && i.roles.some(r => r.toLowerCase() === role))
      .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [countItems, role, search]);

  const invByName = useMemo(() => {
    // Master inventory uses lowercase names — match count items to master rows
    // loosely so a submitted count adjusts the right master stock row.
    const map = new Map<string, InventoryItem>();
    inventory.forEach(i => map.set((i.name || '').trim().toLowerCase(), i));
    return map;
  }, [inventory]);

  const setValue = (itemId: string, field: 'opening' | 'purchased' | 'sold' | 'closing', value: string) => {
    setValues(prev => {
      const existing = prev[itemId] || { opening: '', purchased: '', sold: '', closing: '' };
      return { ...prev, [itemId]: { ...existing, [field]: value } };
    });
  };

  const filledCount = myItems.filter(i => values[i.id] && Object.values(values[i.id]).some(v => v !== '')).length;

  const handleSubmit = async () => {
    const entries: StockCountEntry[] = [];
    for (const item of myItems) {
      const v = values[item.id];
      if (!v) continue;
      const opening = Number(v.opening || 0);
      const purchased = Number(v.purchased || 0);
      const sold = Number(v.sold || 0);
      const closing = Number(v.closing || 0);
      if (!opening && !purchased && !sold && !closing) continue;
      entries.push({ itemId: item.id, itemName: item.name, unit: item.unit, opening, purchased, sold, closing });
    }

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
    : { opening: 'Opening', purchased: 'Received', sold: 'Used', closing: 'Remaining' };

  const roleTitle = isChefSide
    ? 'Kitchen Count'
    : isBaristaSide
      ? 'Bar Count'
      : isFrontSide
        ? 'Front of House Count'
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
              <h1 className="text-lg font-black tracking-tight leading-tight truncate">{roleTitle}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">
                {currentUser.name} · {currentUser.role}
              </p>
            </div>
          </div>
          <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#4B3621] shrink-0">
            Sign Out
          </button>
        </div>
      </header>

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
            const master = invByName.get(item.name.trim().toLowerCase());
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
                        value={v[field]}
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
