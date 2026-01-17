
import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMethod, UserRole } from '../types';
import { CURRENCY } from '../constants';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Banknote, Smartphone, XCircle, Calculator, Utensils, Clock, ShoppingBasket, Edit3 } from 'lucide-react';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: (paymentMethod: PaymentMethod, orderType: 'Dine-in' | 'Take Away', amountTendered?: number, change?: number, tableNumber?: number) => void;
  subtotal: number;
  tax: number;
  total: number;
  isProcessing: boolean;
  userRole: UserRole;
  onLogAction: (action: 'VOID_ITEM' | 'CLEAR_CART', details: string) => void;
  isEditing?: boolean;
  prefilledTable?: number;
  prefilledOrderType?: 'Dine-in' | 'Take Away';
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
  total,
  isProcessing,
  onLogAction,
  isEditing = false,
  prefilledTable,
  prefilledOrderType
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-Pesa');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  const [selectedTable, setSelectedTable] = useState<number | undefined>(undefined);
  const [orderType, setOrderType] = useState<'Dine-in' | 'Take Away'>('Dine-in');
  
  useEffect(() => {
      if (isEditing) {
          if (prefilledTable) setSelectedTable(prefilledTable);
          if (prefilledOrderType) setOrderType(prefilledOrderType);
          setPaymentMethod('Pay Later'); 
      }
  }, [isEditing, prefilledTable, prefilledOrderType]);

  useEffect(() => {
    if (paymentMethod !== 'Cash') {
      setAmountTendered('');
      setChange(0);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (paymentMethod === 'Cash' && amountTendered) {
      const tendered = parseFloat(amountTendered);
      if (!isNaN(tendered)) {
        setChange(tendered - total);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [amountTendered, total, paymentMethod]);

  const handleCheckoutClick = () => {
    if (orderType === 'Dine-in' && !selectedTable) {
      alert("Please select a table number.");
      return;
    }
    const tenderedNum = parseFloat(amountTendered);
    onCheckout(
      paymentMethod, 
      orderType, 
      paymentMethod === 'Cash' ? (!isNaN(tenderedNum) ? tenderedNum : 0) : undefined, 
      paymentMethod === 'Cash' ? change : undefined, 
      selectedTable
    );
  };

  const handleRemove = (item: CartItem) => {
    onLogAction('VOID_ITEM', `Removed ${item.quantity}x ${item.name} from active cart`);
    onRemove(item.id);
  };

  const handleClear = () => {
    if(confirm("Are you sure you want to clear the entire order?")) {
      const details = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
      onLogAction('CLEAR_CART', `Cleared items: ${details}`);
      onClear();
    }
  };

  const isCashInsufficient = paymentMethod === 'Cash' && (parseFloat(amountTendered) || 0) < total;
  const isOrderInvalid = cart.length === 0 || isProcessing || isCashInsufficient || (orderType === 'Dine-in' && !selectedTable);

  return (
    <div className={`flex flex-col h-full bg-beige-50 border-l border-coffee-200 shadow-2xl relative z-30 font-sans ${isEditing ? 'ring-2 ring-orange-400 ring-inset' : ''}`}>
      <div className={`p-5 border-b border-coffee-200 flex justify-between items-center shrink-0 ${isEditing ? 'bg-orange-50' : 'bg-beige-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`${isEditing ? 'bg-orange-100 text-orange-700' : 'bg-coffee-100 text-coffee-800'} p-2 rounded-lg`}>
             {isEditing ? <Edit3 size={20} /> : <ShoppingBag size={20} />}
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-coffee-900 leading-tight">
                {isEditing ? 'Editing Order' : 'Current Order'}
            </h2>
            <p className="text-xs text-coffee-500 font-medium">{cart.reduce((acc, item) => acc + item.quantity, 0)} Items</p>
          </div>
        </div>
        {cart.length > 0 && (
          <button onClick={handleClear} className="text-coffee-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors group" title="Clear Cart">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-beige-50/50">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-coffee-300 space-y-4 opacity-60">
            <div className="bg-coffee-100 p-8 rounded-full border border-coffee-200">
              <ShoppingBag size={40} className="opacity-50" />
            </div>
            <div className="text-center">
              <p className="font-bold text-coffee-600">Cart is empty</p>
              <p className="text-sm">Select items from the menu</p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="group flex gap-3 items-center bg-white p-2 pr-3 rounded-xl border border-coffee-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 shrink-0 rounded-lg bg-coffee-50 overflow-hidden">
                 <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-semibold text-coffee-900 text-sm leading-tight line-clamp-1">{item.name}</h4>
                  <span className="font-bold text-coffee-800 text-sm">{CURRENCY} {(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-medium text-coffee-400 bg-coffee-50 px-1.5 py-0.5 rounded border border-coffee-100">@{CURRENCY} {item.price}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-coffee-100 text-coffee-600 hover:bg-red-100 hover:text-red-600" disabled={item.quantity <= 1}><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm font-bold text-coffee-700">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-coffee-100 text-coffee-600 hover:bg-coffee-200"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
              <button onClick={() => handleRemove(item)} className="self-center text-coffee-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><XCircle size={18} /></button>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border-t border-coffee-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 shrink-0 space-y-4 z-10">
        <div className="bg-coffee-50 p-1 rounded-xl flex gap-1">
            <button onClick={() => setOrderType('Dine-in')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${orderType === 'Dine-in' ? 'bg-white text-coffee-900 shadow-sm' : 'text-coffee-500 hover:text-coffee-800'}`}><Utensils size={14} /> Dine-In</button>
            <button onClick={() => { setOrderType('Take Away'); setSelectedTable(undefined); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${orderType === 'Take Away' ? 'bg-white text-coffee-900 shadow-sm' : 'text-coffee-500 hover:text-coffee-800'}`}><ShoppingBasket size={14} /> Take Away</button>
        </div>

        {orderType === 'Dine-in' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
             <p className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Utensils size={12} /> Select Table</p>
             <div className="grid grid-cols-4 gap-2">
               {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                 <button key={num} onClick={() => setSelectedTable(num)} className={`py-2 rounded-lg text-sm font-bold transition-all border ${selectedTable === num ? 'bg-coffee-800 text-white border-coffee-800' : 'bg-white text-coffee-600 border-coffee-200 hover:bg-coffee-50'}`}>{num}</button>
               ))}
             </div>
          </div>
        )}

        <div>
           <p className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-2">Payment Method</p>
           <div className="grid grid-cols-2 gap-2">
              {(['M-Pesa', 'Cash', 'Card', 'Pay Later'] as PaymentMethod[]).map((method) => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  disabled={cart.length === 0}
                  className={`flex items-center justify-center gap-2 py-2.5 px-1 rounded-lg border text-xs font-bold transition-all
                    ${paymentMethod === method ? (method === 'Pay Later' ? 'bg-orange-600 text-white border-orange-600' : 'bg-coffee-900 text-white border-coffee-900') : 'border-coffee-200 text-coffee-500 hover:bg-coffee-50 bg-white'}
                    ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {method === 'Cash' && <Banknote size={16} />}
                  {method === 'M-Pesa' && <Smartphone size={16} />}
                  {method === 'Card' && <CreditCard size={16} />}
                  {method === 'Pay Later' && <Clock size={16} />}
                  {method === 'Pay Later' ? 'Pending Order' : method}
                </button>
              ))}
           </div>
        </div>

        {paymentMethod === 'Cash' && cart.length > 0 && (
          <div className="bg-coffee-50 rounded-xl p-3 border border-coffee-200">
             <div className="flex items-center gap-2 mb-2 text-coffee-700">
                <Calculator size={14} />
                <span className="text-xs font-bold uppercase">Cash Calculator</span>
             </div>
             <div className="flex gap-3">
               <div className="flex-1">
                  <label className="block text-[10px] text-coffee-500 mb-1">Tendered</label>
                  <input type="number" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-coffee-300 text-sm font-bold outline-none" placeholder="0" />
               </div>
               <div className="flex-1">
                  <label className="block text-[10px] text-coffee-500 mb-1">Change</label>
                  <div className={`w-full px-3 py-2 rounded-lg border text-sm font-bold flex items-center justify-between ${change < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    <span>{CURRENCY}</span><span>{Math.max(0, change).toLocaleString()}</span>
                  </div>
               </div>
             </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-dashed border-coffee-200">
           <span className="font-bold text-coffee-700">Total</span>
           <span className="font-serif font-bold text-2xl text-coffee-900">{CURRENCY} {total.toLocaleString()}</span>
        </div>

        <button
          onClick={handleCheckoutClick}
          disabled={isOrderInvalid}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${isOrderInvalid ? 'bg-coffee-300' : paymentMethod === 'Pay Later' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-coffee-800 hover:bg-coffee-900'}`}
        >
          {isProcessing ? 'Processing...' : isEditing ? `Update ${paymentMethod === 'Pay Later' ? 'Pending' : 'Paid'}` : paymentMethod === 'Pay Later' ? 'Pending Order' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};
