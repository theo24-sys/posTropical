
import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { CURRENCY, LOGO_URL } from '../constants';
import { CheckCircle, Printer, X, Sparkles, MapPin, Smartphone, User, Coffee, Utensils, Clock, ShoppingBasket, ReceiptText, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !data) return null;

  const SHOP_PHONE = "0748027790";
  const SHOP_LOCATION = "Lodwar, Turkana County";
  const PAYBILL_NO = "522533";
  const ACCOUNT_NO = "8043412";
  
  const isPending = data.status === 'Pending';
  const isSettled = !isPending && data.updatedAt !== undefined;
  
  const docTitle = isPending ? "GUEST BILL" : "OFFICIAL RECEIPT";

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', 'ReceiptPrint', 'height=600,width=400');

    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      setIsPrinting(false);
      return;
    }

    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 4px 0;">${item.quantity}x ${item.name}</td>
        <td style="padding: 4px 0; text-align: right;">${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>${docTitle} #${data.orderId}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 72mm; margin: 0 auto; padding: 10px; font-size: 12px; line-height: 1.2; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .mpesa-box { border: 1.5px solid #000; padding: 10px; margin: 10px 0; text-align: center; }
          .mpesa-title { font-weight: bold; font-size: 12px; margin-bottom: 4px; }
          .footer { font-size: 10px; margin-top: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0;">Tropical Dreams</h2>
          <p style="margin: 2px 0;">Coffee House - Lodwar</p>
        </div>
        <div class="divider"></div>
        <div class="center bold" style="font-size: 14px;">*** ${docTitle} ***</div>
        <p style="font-size: 10px; margin: 4px 0;">Order #${data.orderId}</p>
        <p style="font-size: 9px;">Table: ${data.tableNumber || 'TA'} • ${new Date(data.date).toLocaleString()}</p>
        <div class="divider"></div>
        <table>${itemsHtml}</table>
        <div class="divider"></div>
        <div style="display: flex; justify-content: space-between; font-size: 14px;" class="bold">
          <span>TOTAL</span>
          <span>KES ${data.total.toLocaleString()}</span>
        </div>
        <div class="divider"></div>
        <div class="mpesa-box">
          <div class="mpesa-title">LIPA NA M-PESA</div>
          <p>Paybill: <span class="bold">${PAYBILL_NO}</span></p>
          <p>Account: <span class="bold">${ACCOUNT_NO}</span></p>
        </div>
        <div class="footer">
          <p>Served by: ${data.cashierName}</p>
          <p style="margin-top: 10px;" class="bold italic">"${data.aiMessage || 'Thank you for choosing Tropical Dreams!'}"</p>
          <p style="margin-top: 8px;" class="bold uppercase">Karibu Tena</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); setIsPrinting(false); }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#4B3621]/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 relative">
          
          <div className={`${isPending ? 'bg-orange-500' : 'bg-[#4B3621]'} p-8 text-center text-white relative overflow-hidden shrink-0 transition-colors duration-500`}>
            <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white rounded-full p-2 hover:bg-white/10 transition-all z-10"><X size={24} /></button>
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 relative z-10">
              {isPending ? <ReceiptText size={40} /> : <ShieldCheck size={40} />}
            </div>
            <h2 className="font-serif text-3xl font-black relative z-10 uppercase tracking-tighter">{docTitle}</h2>
            <p className="text-white opacity-80 text-xs font-black tracking-widest mt-2 relative z-10">ORDER #{data.orderId} • {isPending ? 'WAITING FOR PAYMENT' : 'SETTLED'}</p>
          </div>

          <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative">
              <div className="text-center mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-center mb-4"><img src={LOGO_URL} alt="Logo" className="h-16 object-contain" /></div>
                <h3 className="font-serif text-2xl font-black text-[#4B3621] uppercase tracking-tighter mb-1">Tropical Dreams</h3>
                <div className="flex flex-col items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1"><MapPin size={10} /><span>{SHOP_LOCATION}</span></div>
                </div>
              </div>

              {/* High-visibility Payment Block for Bills */}
              <div className={`mb-8 p-6 rounded-[24px] border-2 text-center transition-all ${isPending ? 'bg-orange-50 border-orange-100 scale-[1.02] shadow-lg shadow-orange-900/5' : 'bg-teal-50 border-teal-100'}`}>
                   <div className="flex items-center justify-center gap-2 mb-4">
                      <Smartphone size={18} className={isPending ? 'text-orange-600' : 'text-teal-600'} />
                      <p className={`text-[10px] font-black uppercase tracking-[3px] ${isPending ? 'text-orange-700' : 'text-teal-700'}`}>Lipa Na M-Pesa</p>
                   </div>
                   <div className="space-y-3">
                     <p className="text-lg font-black text-[#4B3621]">Business No: <span className={isPending ? 'text-orange-600' : 'text-[#4B3621]'}>{PAYBILL_NO}</span></p>
                     <p className="text-lg font-black text-[#4B3621]">Account No: <span className={isPending ? 'text-orange-600' : 'text-[#4B3621]'}>{ACCOUNT_NO}</span></p>
                   </div>
                   <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                        {isPending ? 'Please show this screen or print-out to the cashier once paid' : 'Payment successful - Asante!'}
                      </p>
                   </div>
              </div>

              {data.aiMessage && (
                <div className="mb-8 bg-amber-50/50 p-6 rounded-[24px] border border-amber-100 relative">
                    <div className="flex gap-4 items-start">
                      <Sparkles size={18} className="text-amber-600 mt-1 shrink-0" />
                      <p className="text-[#4B3621] italic text-base font-serif leading-relaxed">"{data.aiMessage}"</p>
                    </div>
                </div>
              )}
              
              <div className="mb-8 flex justify-center">
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gray-50 text-[#4B3621] rounded-full font-black text-xs uppercase tracking-widest border border-gray-100">
                    {data.orderType === 'Take Away' ? <><ShoppingBasket size={16} /> Take Away</> : <><Utensils size={16} /> Table {data.tableNumber || 'TA'}</>}
                 </div>
              </div>

              <div className="space-y-4 mb-10">
                {data.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <span className="font-black text-[#4B3621] bg-gray-100 px-3 py-1 rounded-xl text-xs">{item.quantity}x</span>
                      <span className="text-sm font-bold text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-black text-sm text-[#4B3621]">{CURRENCY} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-[24px] text-white transition-colors duration-500 ${isPending ? 'bg-orange-600' : 'bg-[#4B3621]'}`}>
                <div className="flex justify-between items-center font-black text-2xl tracking-tighter uppercase">
                  <span>{isPending ? 'Total Due' : 'Amount Paid'}</span>
                  <span>{CURRENCY} {data.total.toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Settlement Status</span>
                   <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[2px] ${isPending ? 'bg-white/20 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
                      {isPending ? 'Unpaid' : 'Succeeded'}
                   </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0 relative z-10">
            <button onClick={onClose} className="flex-1 py-5 bg-gray-50 border border-gray-100 rounded-[22px] font-black text-[10px] uppercase tracking-[3px] text-gray-400 hover:text-gray-900 transition-all">Dismiss</button>
            <button onClick={handlePrint} disabled={isPrinting} className={`flex-[2] py-5 ${isPending ? 'bg-orange-600' : 'bg-[#4B3621]'} text-white rounded-[22px] font-black text-[10px] uppercase tracking-[3px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3`}><Printer size={20} /> {isPrinting ? 'Processing...' : isPending ? 'Print Station Bill' : 'Print Receipt'}</button>
          </div>
        </div>
    </div>
  );
};
