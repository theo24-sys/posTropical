
import React, { useState } from 'react';
import { MenuItem } from '../types';
import { CURRENCY } from '../constants';
import { Plus, Check, UtensilsCrossed } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdded(true);
    onAdd(item);
    setTimeout(() => setIsAdded(false), 600);
  };

  return (
    <div 
      onClick={handleAdd}
      className={`group bg-white rounded-[24px] border-2 border-transparent overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl active:scale-[0.98] h-full shadow-sm
        ${isAdded ? 'ring-4 ring-teal-100 border-teal-500' : ''}
      `}
    >
      {/* Reduced image container size to aspect-[2/1] */}
      <div className="aspect-[2/1] bg-gray-50 relative overflow-hidden shrink-0">
        {!imgError ? (
          <img 
            src={item.image} 
            alt={item.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
             <UtensilsCrossed size={32} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-transform ${isAdded ? 'bg-[#14b8a6] text-white scale-110' : 'bg-white text-[#14b8a6] scale-100'}`}>
              {isAdded ? <Check size={24} /> : <Plus size={24} />}
           </div>
        </div>
      </div>
      
      {/* More generous padding for text visibility */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-[#4B3621] text-base leading-tight line-clamp-2 mb-3 h-10 overflow-hidden">
          {item.name}
        </h3>
        <div className="mt-auto flex justify-start">
          <div className="bg-[#ccfbf1] text-[#0d9488] px-3 py-1.5 rounded-xl border border-[#99f6e4]/20 flex items-center gap-1 shrink-0">
             <span className="text-[10px] font-black uppercase tracking-wider">{CURRENCY}</span>
             <span className="text-base font-black">{item.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
