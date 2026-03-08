import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { CURRENCY, LOGO_URL } from '../constants';
import { Printer, X, ReceiptText, ShieldCheck, MapPin, Coffee } from 'lucide-react';

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !data) return null;

  // --- 24-HOUR WOMEN'S DAY CHECK (EAT) ---
  const now = new Date();
  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(now);
  const isWomensDay = eatDate === "08/03"; 

  const SHOP_PHONE = "0748027790";
  const SHOP_LOCATION = "Lodwar, Turkana County";
  const isPending = data.status === 'Pending';
  const docTitle = isPending ? "GUEST BILL" : "OFFICIAL RECEIPT";

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', 'ReceiptPrint', 'height=600,width=400');
    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      setIsPrinting(false);
      return;
    }

    const itemsHtml = data.items
      .map(item => `
        <tr>
          <td style="padding: 8px 0; font-size: 16px;">${item.quantity} × ${item.name}</td>
          <td style="padding: 8px 0; text-align: right; font-size: 16px;">KES ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `)
      .join('');

    const discountHtml = data.discountAmount && data.discountAmount > 0 ? `
      <tr>
        <td style="padding: 12px 0 8px 0; font-size: 16px; font-style: italic; font-weight: bold;">Promo Discount (${data.discountPercent}%)</td>
        <td style="padding: 12px 0 8px 0; text-align: right; font-size: 16px; font-style: italic; font-weight: bold;">-KES ${data.discountAmount.toLocaleString()}</td>
      </tr>
    ` : '';

    const subtotalHtml = `
      <tr>
        <td style="padding: 12px 0 8px 0; font-size: 16px; font-weight: bold;">Subtotal</td>
        <td style="padding: 12px 0 8px 0; text-align: right; font-size: 16px; font-weight: bold;">KES ${(data.subtotal || data.total + (data.discountAmount || 0)).toLocaleString()}</td>
      </tr>
    `;

    const womensDayPrintHtml = isWomensDay ? `
      <div style="margin-top: 20px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0; text-align: center; font-weight: bold; font-size: 14px; text-transform: uppercase;">
        *** HAPPY INTERNATIONAL WOMEN'S DAY ***
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
      <head>
        <title>${docTitle} #${data.orderId}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 14px; line-height: 1.5; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; }
          .footer { font-size: 12px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0; font-size: 24px;">Tropical Dreams</h2>
          <p style="margin: 4px 0; font-size: 14px;">Coffee House - Lodwar</p>
          <p style="margin: 2px 0; font-size: 12px;">${SHOP_PHONE}</p>
        </div>
        <div class="divider"></div>
        <div class="center bold">*** ${docTitle} ***</div>
        <p style="margin: 6px 0;">Order #${data.orderId}</p>
        <p style="font-size: 12px;">${new Date(data.date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>
        <div class="divider"></div>
        <table>
          ${itemsHtml}
          ${subtotalHtml}
          ${discountHtml}
          <tr>
            <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">TOTAL ${isPending ? 'DUE' : 'PAID'}</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px;">KES ${data.total.toLocaleString()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="footer">
          <p>Served by: ${data.cashierName}</p>
          ${data.aiMessage ? `<p style="margin-top: 12px; font-style: italic;">"${data.aiMessage}"</p>` : ''}
          <p style="margin-top: 16px; font-weight: bold; font-size: 14px;">Karibu Tena!</p>
        </div>
        ${womensDayPrintHtml}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#4B3621]/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 relative">
        {/* Header */}
        <div className={`${isPending ? 'bg-orange-500' : 'bg-[#4B3621]'} p-8 text-center text-white relative shrink-0 transition-colors`}>
          <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white rounded-full p-2 hover:bg-white/10 z-10">
            <X size={24} />
          </button>
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 relative z-10">
            {isPending ? <ReceiptText size={40} /> : <ShieldCheck size={40} />}
          </div>
          <h2 className="font-serif text-3xl font-black uppercase tracking-tighter">{docTitle}</h2>
          <p className="text-white opacity-80 text-sm font-black tracking-widest mt-2">
            ORDER #{data.orderId} • {isPending ? 'PAYMENT REQUIRED' : 'SETTLED'}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative">
            <div className="text-center mb-8 border-b border-gray-100 pb-8">
              <img src={LOGO_URL} alt="Logo" className="h-16 object-contain mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-black text-[#4B3621] uppercase tracking-tighter">Tropical Dreams</h3>
              <p className="text-gray-500 text-sm font-medium">{SHOP_LOCATION} | {SHOP_PHONE}</p>
            </div>

            <div className="space-y-4 mb-8">
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg font-bold text-gray-800">{item.quantity}x {item.name}</span>
                  <span className="font-black text-xl text-[#4B3621]">KES {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="flex justify-between pt-4 border-t border-gray-100 font-bold text-gray-600">
                <span>Subtotal</span>
                <span>KES ${(data.subtotal || data.total + (data.discountAmount || 0)).toLocaleString()}</span>
              </div>

              {data.discountAmount && data.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-black italic">
                  <span>Promo Discount ({data.discountPercent}%)</span>
                  <span>-KES {data.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className={`p-8 rounded-[32px] text-center font-black ${isPending ? 'bg-orange-50 text-orange-800' : 'bg-teal-50 text-[#4B3621]'}`}>
              <span className="text-2xl">{isPending ? 'TOTAL DUE' : 'TOTAL PAID'}</span>
              <span className="text-5xl block mt-2">KES {data.total.toLocaleString()}</span>
            </div>

            <div className="text-center mt-10">
              <p className="font-medium text-lg">Served by: {data.cashierName}</p>
              {data.aiMessage && <p className="italic mt-4 text-gray-600">"{data.aiMessage}"</p>}
              <p className="font-black mt-6 text-xl uppercase tracking-widest">Karibu Tena!</p>
              
              {/* --- WOMEN'S DAY MESSAGE --- */}
              {isWomensDay && (
                <div className="mt-8 p-4 bg-pink-100 border-2 border-dashed border-pink-400 text-pink-700 font-black text-lg uppercase">
                  Happy International Women's Day
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-5 bg-gray-100 rounded-[28px] font-black text-xs uppercase text-gray-500 hover:bg-gray-200 transition-all">
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`flex-[2] py-5 ${isPending ? 'bg-orange-600' : 'bg-[#4B3621]'} text-white rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2`}
          >
            <Printer size={18} />
            {isPrinting ? 'Printing...' : isPending ? 'Print Guest Bill' : 'Print Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
