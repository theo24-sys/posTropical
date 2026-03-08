import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { LOGO_URL } from '../constants';
import { Printer, X, ReceiptText, ShieldCheck } from 'lucide-react';

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
    timeZone: 'Africa/Nairobi', day: '2-digit', month: '2-digit'
  }).format(now);
  const isWomensDay = eatDate === "08/03"; 

  const SHOP_PHONE = "0748027790";
  const isPending = data.status === 'Pending';
  const docTitle = isPending ? "GUEST BILL" : "OFFICIAL RECEIPT";

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', 'ReceiptPrint', 'height=600,width=450');
    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      setIsPrinting(false);
      return;
    }

    const itemsHtml = data.items
      .map(item => `
        <tr>
          <td style="padding: 5px 0;">${item.quantity} x ${item.name}</td>
          <td style="padding: 5px 0; text-align: right;">${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>Print Receipt</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 72mm; /* Standard printable width for 80mm paper */
            margin: 0 auto; 
            padding: 5mm;
            font-size: 12px;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { font-size: 16px; font-weight: bold; }
          .footer { margin-top: 15px; text-align: center; font-size: 11px; }
          .womens-day {
            margin-top: 15px;
            border: 1px dashed #000;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <strong style="font-size: 18px;">TROPICAL DREAMS</strong><br/>
          Coffee House - Lodwar<br/>
          Tel: ${SHOP_PHONE}
        </div>

        <div class="divider"></div>
        <div class="center bold">*** ${docTitle} ***</div>
        <div style="margin: 5px 0;">
          Order: #${data.orderId}<br/>
          Date: ${new Date(data.date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}<br/>
          Cashier: ${data.cashierName}
        </div>
        <div class="divider"></div>

        <table>
          ${itemsHtml}
          <tr><td colspan="2" style="border-top: 1px solid #000; padding-top: 5px;"></td></tr>
          <tr>
            <td class="bold">Subtotal</td>
            <td style="text-align: right;">KES ${data.subtotal?.toLocaleString()}</td>
          </tr>
          ${data.discountAmount ? `
            <tr>
              <td class="bold italic">Discount (${data.discountPercent}%)</td>
              <td style="text-align: right;">-KES ${data.discountAmount.toLocaleString()}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td style="padding-top: 10px;">TOTAL</td>
            <td style="padding-top: 10px; text-align: right;">KES ${data.total.toLocaleString()}</td>
          </tr>
        </table>

        <div class="divider"></div>
        
        <div class="footer">
          ${data.aiMessage ? `<p><i>"${data.aiMessage}"</i></p>` : ''}
          <p class="bold" style="font-size: 14px;">KARIBU TENA!</p>
        </div>

        ${isWomensDay ? `
          <div class="womens-day">
            Happy International<br/>Women's Day!
          </div>
        ` : ''}

        <div style="height: 20mm;"></div> </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#4B3621]/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Modal UI Header */}
        <div className={`${isPending ? 'bg-orange-500' : 'bg-[#4B3621]'} p-8 text-center text-white shrink-0`}>
          <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white p-2">
            <X size={24} />
          </button>
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            {isPending ? <ReceiptText size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h2 className="font-serif text-2xl font-black uppercase tracking-tight">{docTitle}</h2>
          <p className="text-white/80 text-xs font-bold mt-1 uppercase">Order #{data.orderId}</p>
        </div>

        {/* Modal UI Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <img src={LOGO_URL} alt="Logo" className="h-12 mx-auto mb-2" />
              <h3 className="font-serif text-xl font-bold text-[#4B3621]">Tropical Dreams</h3>
            </div>

            <div className="space-y-3 mb-6">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="font-bold">{item.quantity}x {item.name}</span>
                  <span className="font-black text-[#4B3621]">KES {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200">
               <div className="flex justify-between text-xl font-black text-[#4B3621]">
                <span>Total</span>
                <span>KES {data.total.toLocaleString()}</span>
              </div>
            </div>

            {isWomensDay && (
              <div className="mt-6 p-3 bg-pink-50 border border-pink-200 rounded-xl text-pink-700 text-center text-xs font-black uppercase tracking-wider">
                International Women's Day Edition
              </div>
            )}
          </div>
        </div>

        {/* Modal UI Footer */}
        <div className="p-6 bg-white border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500 uppercase text-xs">
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`flex-[2] py-4 ${isPending ? 'bg-orange-600' : 'bg-[#4B3621]'} text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2`}
          >
            <Printer size={18} />
            {isPrinting ? 'Printing...' : 'Print 80mm Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
