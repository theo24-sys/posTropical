
import React from 'react';
import { HeldOrder } from '../types';
import { CURRENCY } from '../constants';
import { X, Play, Trash2, Clock, User } from 'lucide-react';

interface HoldOrdersModalProps {
  heldOrders: HeldOrder[];
  onClose: () => void;
  onResume: (order: HeldOrder) => void;
  onDelete: (id: string) => void;
}

export const HoldOrdersModal: React.FC<HoldOrdersModalProps> = ({ heldOrders, onClose, onResume, onDelete }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-coffee-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-coffee-100 flex justify-between items-center bg-beige-50">
          <div className="flex items-center gap-3">
            <Clock className="text-coffee-800" size={24} />
            <h2 className="text-xl font-bold text-coffee-900">Held Orders</h2>
          </div>
          <button onClick={onClose} className="text-coffee-400 hover:text-coffee-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {heldOrders.length === 0 ? (
            <div className="text-center py-12 text-coffee-300">
              <p className="italic">No held orders currently.</p>
            </div>
          ) : (
            heldOrders.map((order) => (
              <div key={order.id} className="bg-beige-50 border border-coffee-100 p-4 rounded-xl flex items-center justify-between hover:border-coffee-300 transition-all group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-coffee-400" />
                    <span className="font-bold text-coffee-900">{order.customerName || 'Walk-in'}</span>
                  </div>
                  <div className="text-xs text-coffee-500 flex gap-2 items-center">
                    <span>{order.items.length} items</span>
                    <span>•</span>
                    <span className="font-bold text-coffee-700">{CURRENCY} {order.total.toLocaleString()}</span>
                    <span>•</span>
                    <span>{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onDelete(order.id)}
                    className="p-2 text-coffee-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Discard Order"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => onResume(order)}
                    className="bg-coffee-800 text-white p-2 rounded-lg hover:bg-coffee-900 transition-colors flex items-center gap-2 px-4 font-bold text-sm"
                  >
                    <Play size={16} fill="currentColor" />
                    Resume
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-beige-50 border-t border-coffee-100">
           <p className="text-[10px] text-center text-coffee-400 font-bold uppercase tracking-widest">
             Orders held locally on this device
           </p>
        </div>
      </div>
    </div>
  );
};
