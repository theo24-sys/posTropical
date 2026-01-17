
import React, { useState } from 'react';
import { MenuItem, Category } from '../types';
import { CURRENCY } from '../constants';
import { Plus, Coffee, UtensilsCrossed, Pizza, CakeSlice, Sandwich, GlassWater, Salad, Check } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd }) => {
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    setIsAdded(true);
    onAdd(item);
    setTimeout(() => setIsAdded(false), 500);
  };

  const getCategoryIcon = (cat: Category) => {
    switch(cat) {
      case Category.HOT_DRINKS: return <Coffee size={28} className="text-stone-400" />;
      case Category.COLD_DRINKS: return <GlassWater size={28} className="text-blue-400" />;
      case Category.SOFT_DRINKS: return <GlassWater size={28} className="text-blue-400" />;
      case Category.PIZZA: return <Pizza size={28} className="text-orange-400" />;
      case Category.DESSERTS:
      case Category.BAKERY: return <CakeSlice size={28} className="text-pink-400" />;
      case Category.APPETIZERS: return <Salad size={28} className="text-green-400" />;
      case Category.BURGERS: return <Sandwich size={28} className="text-amber-600" />;
      default: return <UtensilsCrossed size={28} className="text-stone-400" />;
    }
  };

  return (
    <div 
      onClick={handleAdd}
      className={`group bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer overflow-hidden flex flex-row sm:flex-col h-24 sm:h-auto active:scale-[0.98] relative
        ${isAdded ? 'border-tropical-500 ring-2 ring-tropical-200' : 'border-stone-100 hover:shadow-md hover:border-tropical-200'}
      `}
    >
      {/* Image Container */}
      <div className="w-24 sm:w-full sm:h-36 shrink-0 relative bg-stone-100 flex items-center justify-center overflow-hidden">
        {imageError || !item.image ? (
          <div className="flex flex-col items-center justify-center gap-1 opacity-40">
            {getCategoryIcon(item.category)}
          </div>
        ) : (
          <img 
            src={item.image} 
            alt={item.name} 
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Overlay on Desktop hover */}
        <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors items-center justify-center">
           <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300
             ${isAdded ? 'bg-tropical-500 text-white scale-110 opacity-100' : 'bg-white/90 text-tropical-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0'}
           `}>
              {isAdded ? <Check size={20} /> : <Plus size={20} />}
           </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col flex-grow justify-between min-w-0">
        <div>
          <h3 className="font-sans font-semibold text-stone-800 text-sm sm:text-base leading-tight line-clamp-2 mb-1">{item.name}</h3>
          {item.description && (
             <p className="text-[10px] text-stone-500 leading-tight line-clamp-2 hidden sm:block mb-2">{item.description}</p>
          )}
        </div>
        
        <div className="flex justify-between items-end mt-1">
          <span className="font-bold text-tropical-700 text-sm sm:text-base bg-tropical-50 px-2 py-0.5 rounded-md">
            {CURRENCY} {item.price.toLocaleString()}
          </span>
          
          {/* Mobile Only Add Button */}
          <button className={`sm:hidden p-1.5 rounded-lg transition-colors ${isAdded ? 'bg-tropical-600 text-white' : 'bg-tropical-100 text-tropical-700'}`}>
            {isAdded ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
