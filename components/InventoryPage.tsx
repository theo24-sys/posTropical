
import React, { useState } from 'react';
import { InventoryItem, InventoryCategory } from '../types';
import { Search, Plus, Minus, AlertTriangle, Package, Beef, Egg, Wheat, Carrot, RefreshCw, Layers, GlassWater, Cake, Utensils } from 'lucide-react';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onUpdateStock: (id: string, newQuantity: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onUpdateStock, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'All'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories: (InventoryCategory | 'All')[] = [
    'All', 'Beverages', 'Bakery & Pastries', 'Meat & Poultry', 'Dairy & Eggs', 'Vegetables', 'Dry Goods', 'Oils & Spices'
  ];

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

  const getCategoryIcon = (cat: InventoryCategory) => {
    switch(cat) {
      case 'Meat & Poultry': return <Beef size={20} />;
      case 'Dairy & Eggs': return <Egg size={20} />;
      case 'Beverages': return <GlassWater size={20} />;
      case 'Bakery & Pastries': return <Cake size={20} />;
      case 'Dry Goods': return <Wheat size={20} />;
      case 'Vegetables': return <Carrot size={20} />;
      default: return <Layers size={20} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-beige-50 font-sans overflow-hidden">
      <header className="bg-coffee-900 text-white p-6 shadow-lg shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Inventory Control</h1>
            <p className="text-coffee-300 text-sm">Essential Staff Stock & Kitchen Management</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
              <input 
                type="text" 
                placeholder="Search stock..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-tropical-400 outline-none text-white placeholder:text-coffee-400"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 bg-white border-b border-coffee-100 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
              ${activeCategory === cat ? 'bg-coffee-800 text-white shadow-md' : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-coffee-300">
               <Package size={64} className="opacity-20 mb-4" />
               <p className="text-xl font-bold">No stock items found</p>
            </div>
          ) : (
            filteredInventory.map(item => {
              const isLow = item.quantity <= item.lowStockThreshold;
              const isOut = item.quantity <= 0;
              
              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md relative overflow-hidden group
                    ${isOut ? 'border-red-200 bg-red-50/10' : isLow ? 'border-orange-200' : 'border-coffee-50'}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl transition-colors ${isOut ? 'bg-red-100 text-red-600' : 'bg-coffee-50 text-coffee-700 group-hover:bg-coffee-100'}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                    {isLow && (
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase
                        ${isOut ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'}
                      `}>
                        <AlertTriangle size={12} />
                        {isOut ? 'Empty' : 'Low'}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                  </div>

                  <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">In Stock</span>
                      <span className={`text-2xl font-black ${isOut ? 'text-red-600' : 'text-coffee-900'}`}>
                        {parseFloat(item.quantity.toFixed(2))} <span className="text-sm font-bold text-gray-400 uppercase">{item.unit}</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onUpdateStock(item.id, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm active:scale-90"
                        title="Reduce Stock"
                      >
                        <Minus size={18} />
                      </button>
                      <button 
                        onClick={() => onUpdateStock(item.id, 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-coffee-800 text-white hover:bg-coffee-900 transition-all shadow-md active:scale-90"
                        title="Add Stock"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${isOut ? 'w-0' : isLow ? 'bg-orange-500' : 'bg-tropical-500'}`}
                        style={{ width: `${Math.min(100, (item.quantity / (item.lowStockThreshold * 3)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Alert: {item.lowStockThreshold}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      
      <footer className="p-4 bg-beige-100 border-t border-coffee-100 text-center">
        <p className="text-[10px] font-bold text-coffee-400 uppercase tracking-widest">
          Tropical Dreams POS • Inventory Station • {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
};
