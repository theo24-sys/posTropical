
import React, { useState } from 'react';
import { CartItem, PaymentMethod, UserRole, SaleTransaction } from '../types';
import { CURRENCY } from '../constants';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Banknote, Smartphone, Utensils, AlertCircle, ReceiptText, ChevronRight, Clock } from 'lucide-react';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: (paymentMethod: PaymentMethod, orderType: 'Dine-in' | 'Take Away', amountTendered?: number, change?: number, tableNumber?: number) => void;
  onHold: (customerName?: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  isProcessing: boolean;
  userRole: UserRole;
  onLogAction: (action: any, details: string) => void;
  isEditing?: boolean;
  prefilledTable?: number;
  prefilledOrderType?: 'Dine-in' | 'Take Away';
  pendingTransactions?: SaleTransaction[];
  onResumeOrder?: (transaction: SaleTransaction) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  total,
  isProcessing,
  userRole,
  prefilledTable,
  prefilledOrderType,
  pendingTransactions = [],
  onResumeOrder
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-Pesa');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Take Away'>(prefilledOrderType || 'Dine-in');
  const [selectedTable, setSelectedTable] = useState<number | undefined>(prefilledTable);
  
  const isWaiter = userRole === 'Waiter';

  const handleCheckoutClick = () => {
    if (isWaiter) return;
    if (orderType === 'Dine-in' && !selectedTable) {
      alert("Please select a table number.");
      return;
    }
    onCheckout(paymentMethod, orderType, undefined, undefined, orderType === 'Dine-in' ? selectedTable : undefined);
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFBF8] border-l border-gray-100 font-sans shadow-inner">
      <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-5">
           <div className="bg-[#F9F6F3] p-4 rounded-2xl border border-gray-50 shadow-sm">
              <ShoppingBag size={32} className="text-[#4B3621]" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-[#4B3621]">Current Order</h2>
             <p className="text-sm text-gray-400 font-bold">{cart.length} Items</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        {isWaiter && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3 text-orange-700 font-bold text-sm">
             <AlertCircle size={18} />
             <span>Waiter Mode: Order editing restricted.</span>
          </div>
        )}
        
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center opacity-10 space-y-4 text-center">
              <ShoppingBag size={80} />
              <p className="font-black text-xl text-[#4B3621]">Cart is empty</p>
              <p className="text-xs font-bold uppercase tracking-widest">Select items to begin</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-5 items-center group animate-in slide-in-from-right-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md bg-gray-50">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base truncate text-[#4B3621]">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                       <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-transform active:scale-90"><Minus size={14}/></button>
                       <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                       <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-transform active:scale-90"><Plus size={14}/></button>
                    </div>
                    <span className="text-sm font-black text-teal-700">{CURRENCY} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20}/></button>
              </div>
            ))
          )}
        </div>

        {/* Active Bills Section */}
        {pendingTransactions.length > 0 && (
          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-black text-gray-300 uppercase tracking-[2px] flex items-center gap-2">
                <Clock size={14} className="text-orange-400" /> ACTIVE STATION BILLS
              </p>
              <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black">{pendingTransactions.length}</span>
            </div>
            <div className="space-y-3">
              {pendingTransactions.map(tx => (
                <button 
                  key={tx.id}
                  onClick={() => onResumeOrder?.(tx)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black">
                      {tx.tableNumber || 'TA'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#4B3621]">Table {tx.tableNumber || 'Take Away'}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{tx.items.length} items • {new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#4B3621]">{CURRENCY} {tx.total.toLocaleString()}</span>
                    <ChevronRight size={16} className="text-gray-200 group-hover:text-orange-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-gray-100 space-y-8 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        {/* Dine-in / Take Away Toggle */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
           <button onClick={() => setOrderType('Dine-in')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all ${orderType === 'Dine-in' ? 'bg-white text-[#4B3621] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <Utensils size={18} /> Dine-In
           </button>
           <button onClick={() => setOrderType('Take Away')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all ${orderType === 'Take Away' ? 'bg-white text-[#4B3621] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <ShoppingBag size={18} /> Take Away
           </button>
        </div>

        {orderType === 'Dine-in' && (
          <div>
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[2px] mb-4 flex items-center gap-2"><Utensils size={14} /> SELECT TABLE</p>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <button 
                  key={num} 
                  onClick={() => setSelectedTable(num)} 
                  className={`py-4 rounded-xl text-lg font-black border-2 transition-all ${selectedTable === num ? 'bg-[#4B3621] text-white border-[#4B3621] shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[11px] font-black text-gray-300 uppercase tracking-[2px] mb-4">PAYMENT METHOD</p>
          <div className="grid grid-cols-2 gap-3">
             {(['Cash', 'M-Pesa', 'Card', 'Pay Later'] as PaymentMethod[]).map(method => (
               <button 
                 key={method} 
                 onClick={() => setPaymentMethod(method)} 
                 className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method ? 'bg-gray-50 border-[#4B3621] text-[#4B3621] shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'} ${method === 'Pay Later' ? 'border-dashed border-orange-200 hover:border-orange-400' : ''}`}
               >
                  {method === 'Cash' && <Banknote size={20} />}
                  {method === 'M-Pesa' && <Smartphone size={20} />}
                  {method === 'Card' && <CreditCard size={20} />}
                  {method === 'Pay Later' && <ReceiptText size={20} className={paymentMethod === 'Pay Later' ? 'text-orange-500' : ''} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">{method === 'Pay Later' ? 'Create Bill' : method}</span>
               </button>
             ))}
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6">
           <span className="text-base font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
           <div className="text-right">
              <span className="text-xs font-black text-gray-400 uppercase mr-2">{CURRENCY}</span>
              <span className="text-4xl font-black text-[#4B3621] tracking-tighter">{total.toLocaleString()}</span>
           </div>
        </div>

        <button 
           onClick={handleCheckoutClick} 
           disabled={cart.length === 0 || isProcessing || isWaiter} 
           className={`w-full py-6 rounded-[24px] font-black text-lg shadow-2xl transition-all uppercase tracking-[2px] ${isWaiter ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : paymentMethod === 'Pay Later' ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/10' : 'bg-[#4B3621] text-white hover:bg-[#3e2d1e]'} hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3`}
        >
          {isProcessing ? 'Processing...' : isWaiter ? 'Order Locked' : paymentMethod === 'Pay Later' ? <><ReceiptText size={22} /> Print Bill Only</> : 'Process Payment'}
        </button>
      </div>
    </div>
  );
};
