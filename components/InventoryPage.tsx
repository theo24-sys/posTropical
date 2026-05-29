import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, InventoryCategory } from '../types';
import {
  Search, Plus, Minus, Package, Beef, Egg, Cake,
  GlassWater, RefreshCw, Layers, Edit3, Trash2, X, Save,
  AlertTriangle, Zap, ChevronRight
} from 'lucide-react';
import { DB } from '../services/supabase';
import { LocalDB } from '../services/db';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onUpdateStock: (id: string, delta: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onUpdateStock, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [recentlyDeducted, setRecentlyDeducted] = useState<Set<string>>(new Set());
  const prevInventory = useRef<Map<string, number>>(new Map());

  // Detect deductions by comparing previous quantities
  useEffect(() => {
    const deducted = new Set<string>();
    inventory.forEach(item => {
      const prev = prevInventory.current.get(item.id);
      if (prev !== undefined && item.quantity < prev) {
        deducted.add(item.id);
      }
      prevInventory.current.set(item.id, item.quantity);
    });
    if (deducted.size > 0) {
      setRecentlyDeducted(deducted);
      const timer = setTimeout(() => setRecentlyDeducted(new Set()), 4000);
      return () => clearTimeout(timer);
    }
  }, [inventory]);

  const categories: (InventoryCategory | 'All')[] = [
    'All', 'BREAKFAST', 'SOUP & SALADS', 'BITINGS', 'COFFEE (DOUBLE)', 'TEAS',
    'SOFT DRINKS', 'ICED COFFEE', 'SHAKES', 'SMOOTHIES', 'FRESH JUICES',
    'LEMONADES', 'MOCKTAILS', 'BAKERY & PASTRIES', 'MAIN COURSES',
    'BURGERS / BURRITOS & SANDWICHES', 'SANDWICHES', 'SIDES', 'DESSERTS'
  ];

  const lowStockItems = inventory.filter(i => i.quantity <= i.lowStockThreshold && i.quantity > 0);
  const outOfStockItems = inventory.filter(i => i.quantity <= 0);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleRestock = async () => {
    if (!restockItem || !restockAmount) return;
    const delta = Number(restockAmount);
    if (isNaN(delta) || delta <= 0) return;
    setIsSaving(true);
    await onUpdateStock(restockItem.id, delta);
    setIsRestockOpen(false);
    setRestockItem(null);
    setRestockAmount('');
    setIsSaving(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const item: InventoryItem = {
      id: editingItem?.id || `inv-${Date.now()}`,
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      category: formData.get('category') as InventoryCategory,
      lowStockThreshold: Number(formData.get('threshold'))
    };
    try {
      if (navigator.onLine) await DB.saveInventoryItem(item);
      await LocalDB.updateInventoryItem(item);
      await onRefresh();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      if (navigator.onLine) await DB.deleteInventoryItem(id);
      const db = await LocalDB.getDB();
      await db.delete('inventory', id);
      await onRefresh();
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  const getInventoryIcon = (item: InventoryItem) => {
    const label = `${item.name} ${item.category}`.toLowerCase();

    if (/(tomato|tomatoes|onion|onions|carrot|carrots|spring onion|spring onions|cabbage|pepper|garlic|lemon|pineapple|water melon|watermelon)/.test(label)) {
      return <Leaf size={20} />;
    }

    if (/(fish|tilapia|fillet)/.test(label)) {
      return <Fish size={20} />;
    }

    if (/(matcha|coffee|tea|latte|espresso|cappuccino|americano|mocha|dawa)/.test(label)) {
      return <Coffee size={20} />;
    }

    if (/(wheat|bread|toast|pancake|waffle|bakery|pastr|sandwich|burger|burrito|samosa)/.test(label)) {
      return <Wheat size={20} />;
    }

    if (/(egg|breakfast)/.test(label)) {
      return <Egg size={20} />;
    }

    if (/(cake|dessert|sweet|pastr)/.test(label)) {
      return <Cake size={20} />;
    }

    if (/(drink|juice|smoothie|shake|mocktail|lemonade|water|soft)/.test(label)) {
      return <GlassWater size={20} />;
    }

    if (/(biting|meat|beef|chicken|lamb|sausage|patties|fillet|wings|breast|portions)/.test(label)) {
      return <Beef size={20} />;
    }

    if (/(sandwich|sides)/.test(label)) {
      return <Layers size={20} />;
    }

    return <Layers size={20} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-coffee-900 text-white p-8 shadow-lg shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="font-serif text-3xl font-bold">Inventory Station</h1>
            <p className="text-coffee-300 text-sm">Manage assets and kitchen supplies</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              className="bg-[#14b8a6] hover:bg-[#0d9488] text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={18} /> New Item
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Alert Banners ── */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="shrink-0 px-6 pt-4 space-y-3 max-w-7xl mx-auto w-full">
          {outOfStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-xl shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-2">
                  {outOfStockItems.length} Item{outOfStockItems.length > 1 ? 's' : ''} Out of Stock
                </p>
                <div className="flex flex-wrap gap-2">
                  {outOfStockItems.map(i => (
                    <button
                      key={i.id}
                      onClick={() => { setRestockItem(i); setIsRestockOpen(true); }}
                      className="flex items-center gap-1.5 bg-white border border-red-200 px-3 py-1.5 rounded-full text-xs font-black text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    >
                      {i.name} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-2 bg-orange-100 rounded-xl shrink-0">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-orange-700 uppercase tracking-widest mb-2">
                  {lowStockItems.length} Item{lowStockItems.length > 1 ? 's' : ''} Running Low
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(i => (
                    <button
                      key={i.id}
                      onClick={() => { setRestockItem(i); setIsRestockOpen(true); }}
                      className="flex items-center gap-1.5 bg-white border border-orange-200 px-3 py-1.5 rounded-full text-xs font-black text-orange-600 hover:bg-orange-600 hover:text-white transition-all"
                    >
                      {i.name} ({i.quantity} {i.unit}) <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category filters + search */}
      <div className="p-4 bg-white border-b border-coffee-100 flex items-center justify-between gap-4 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeCategory === cat ? 'bg-coffee-800 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-72 hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map(item => {
            const isLow = item.quantity <= item.lowStockThreshold;
            const isOut = item.quantity <= 0;
            const wasDeducted = recentlyDeducted.has(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all hover:shadow-xl group relative overflow-hidden
                  ${wasDeducted ? 'border-teal-400 ring-2 ring-teal-200' : isOut ? 'border-red-100 bg-red-50/5' : isLow ? 'border-orange-100' : 'border-transparent'}
                `}
              >
                {wasDeducted && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-teal-500 text-white px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse z-10">
                    <Zap size={10} /> Deducted
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl transition-colors ${isOut ? 'bg-red-50 text-red-600' : wasDeducted ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:shadow-md group-hover:text-teal-600'}`}>
                    {getInventoryIcon(item)}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-black">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-black text-lg text-gray-900 leading-tight mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.category}</span>
                    {isLow && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isOut ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {isOut ? 'Out' : 'Low'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current</p>
                      <p className={`text-2xl font-black ${isOut ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.quantity} <span className="text-xs font-bold text-gray-400 uppercase">{item.unit}</span>
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onUpdateStock(item.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 shadow-sm active:scale-90">
                        <Minus size={16} />
                      </button>
                      <button onClick={() => onUpdateStock(item.id, 1)} className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-black shadow-md active:scale-90">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Restock shortcut */}
                <button
                  onClick={() => { setRestockItem(item); setIsRestockOpen(true); }}
                  className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all mb-4"
                >
                  + Restock
                </button>

                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Alert Threshold</span>
                    <span>{item.lowStockThreshold} {item.unit}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${isOut ? 'w-0' : isLow ? 'bg-orange-500' : 'bg-[#14b8a6]'}`}
                      style={{ width: `${Math.min(100, (item.quantity / (item.lowStockThreshold * 3)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Restock Modal */}
      {isRestockOpen && restockItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsRestockOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900">
              <X size={28} />
            </button>
            <div className="mb-8">
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Restock Item</p>
              <h3 className="font-serif text-2xl font-black text-gray-900">{restockItem.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Current: <span className="font-black text-gray-700">{restockItem.quantity} {restockItem.unit}</span>
              </p>
            </div>
            <div className="mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                Add Quantity ({restockItem.unit})
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={restockAmount}
                onChange={e => setRestockAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-2xl focus:ring-4 focus:ring-teal-50 focus:border-teal-200 outline-none transition-all"
                autoFocus
              />
              {restockAmount && !isNaN(Number(restockAmount)) && (
                <p className="text-xs text-gray-400 mt-2 font-bold">
                  New total: <span className="text-teal-600 font-black">{restockItem.quantity + Number(restockAmount)} {restockItem.unit}</span>
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsRestockOpen(false)} className="flex-1 py-4 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400">
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={isSaving || !restockAmount}
                className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Package size={16} /> {isSaving ? 'Saving...' : 'Confirm Restock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900">
              <X size={32} />
            </button>
            <h3 className="font-serif text-3xl font-black mb-8 text-gray-900">
              {editingItem ? 'Edit Asset SKU' : 'New Stock Asset'}
            </h3>
            <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Item Name</label>
                <input name="name" defaultValue={editingItem?.name} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Quantity</label>
                <input name="quantity" type="number" step="0.01" defaultValue={editingItem?.quantity} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Unit (e.g. Kgs)</label>
                <input name="unit" defaultValue={editingItem?.unit} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
                <select name="category" defaultValue={editingItem?.category || 'MAIN COURSES'} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest">
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Low Stock Alert</label>
                <input name="threshold" type="number" defaultValue={editingItem?.lowStockThreshold} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-red-600" required />
              </div>
              <div className="md:col-span-2 pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Commit Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};