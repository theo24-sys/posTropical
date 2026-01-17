
import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { CURRENCY, LOGO_URL } from '../constants';
import { CheckCircle, Printer, X, Sparkles, MapPin, Phone, User, Coffee, Utensils, Clock, ShoppingBasket } from 'lucide-react';

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
  
  const docTitle = isPending ? "BILL / INVOICE" : isSettled ? "SETTLED BILL" : "RECEIPT";

  const handlePrint = () => {
    setIsPrinting(true);

    const printWindow = window.open('', 'ReceiptPrint', 'height=600,width=400,toolbar=no,scrollbars=yes');

    if (!printWindow) {
      alert("Pop-up blocked! Please allow pop-ups for this site to print receipts.");
      setIsPrinting(false);
      return;
    }

    const orderDateStr = new Date(data.date).toLocaleDateString();
    const orderTimeStr = new Date(data.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let settledInfoHtml = '';
    if (isSettled && data.updatedAt) {
        const sDate = new Date(data.updatedAt).toLocaleDateString();
        const sTime = new Date(data.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        settledInfoHtml = `
            <div class="center" style="margin: 5px 0; font-size: 10px; color: #444;">
                <p class="bold">PAID ON: ${sDate} ${sTime}</p>
            </div>
        `;
    }

    const itemsHtml = data.items.map(item => `
      <tr>
        <td class="qty top">${item.quantity}</td>
        <td class="name top">
          ${item.name}
          ${item.quantity > 1 ? `<div class="sub">@ ${item.price.toLocaleString()}</div>` : ''}
        </td>
        <td class="price top">${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    // Friendly note to discourage cash
    const cashlessNote = `
      <div class="cashless-note">
        <p>🌿 <b>Go Green, Go Cashless!</b> 🌿</p>
        <p>Help us stay breezy and secure. We prefer M-Pesa for a faster, touch-free experience. Asante sana!</p>
      </div>
    `;

    const mpesaBox = `
      <div class="mpesa-container">
        <p class="bold">LIPA NA M-PESA</p>
        <p>Paybill: <span class="large bold">${PAYBILL_NO}</span></p>
        <p>Account: <span class="large bold">${ACCOUNT_NO}</span></p>
      </div>
    `;

    let paymentDetailsHtml = '';
    
    if (isPending) {
      // For bills/invoices, show M-Pesa details and the note
      paymentDetailsHtml = `
        <div class="divider"></div>
        <div class="row bold" style="color:#d97706; margin-bottom: 8px;"><span>STATUS</span><span>UNPAID BILL</span></div>
        ${mpesaBox}
        ${cashlessNote}
      `;
    } else {
      // For completed receipts
      if (data.paymentMethod === 'Cash' && data.amountTendered !== undefined) {
        paymentDetailsHtml = `
          <div class="row"><span>Cash Paid</span><span>${data.amountTendered.toLocaleString()}</span></div>
          <div class="row bold large"><span>CHANGE</span><span>${(data.change || 0).toLocaleString()}</span></div>
          ${cashlessNote}
        `;
      } else if (data.paymentMethod === 'M-Pesa') {
        paymentDetailsHtml = `
          <div class="row"><span>M-Pesa Reference</span><span>VERIFIED</span></div>
        `;
      } else if (data.paymentMethod === 'Card') {
        paymentDetailsHtml = `
          <div class="row"><span>Card Payment</span><span>AUTHORIZED</span></div>
        `;
      }
    }

    const aiSection = data.aiMessage 
      ? `<div class="ai-message">"${data.aiMessage}"</div>` 
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docTitle} #${data.orderId}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 72mm;
            margin: 0 auto;
            padding: 4mm;
            color: black;
            background: white;
            font-size: 12px;
            line-height: 1.2;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header { margin-bottom: 10px; }
          .header img.logo { 
            width: 40px; 
            height: 40px; 
            object-fit: contain; 
            margin: 0 auto 5px auto; 
            display: block; 
          }
          .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; }
          .header p { margin: 2px 0; font-size: 10px; }
          .divider { border-bottom: 1px dashed black; margin: 5px 0; }
          .meta { font-size: 10px; display: flex; justify-content: space-between; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
          th { text-align: left; font-size: 10px; border-bottom: 1px dashed black; padding-bottom: 2px; }
          td { font-size: 11px; padding: 4px 0; vertical-align: top; }
          .price { text-align: right; }
          .qty { font-weight: bold; width: 15%; }
          .name { width: 60%; }
          .sub { font-size: 9px; color: #444; margin-top: 1px; }
          .totals { margin-top: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .large { font-size: 14px; }
          .mpesa-container {
            margin: 10px 0;
            padding: 8px;
            border: 1.5px solid #000;
            text-align: center;
          }
          .cashless-note {
            margin: 12px 0;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 4px;
            font-size: 9px;
            text-align: center;
            font-style: italic;
            border: 0.5px solid #eee;
          }
          .ai-message { 
            margin: 10px 0; 
            text-align: center; 
            font-style: italic; 
            font-size: 10px; 
            color: #333;
          }
          .footer { text-align: center; margin-top: 10px; font-size: 10px; }
          .footer p { margin: 2px 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header center">
          <img src="${LOGO_URL}" class="logo" />
          <h1>Tropical Dreams</h1>
          <p class="bold">Coffee House</p>
          <p>${SHOP_LOCATION}</p>
        </div>
        
        <div class="divider"></div>
        
        <div class="center bold" style="margin-bottom: 5px; font-size: 14px;">*** ${docTitle} ***</div>

        <div class="meta">
          <span>Order: #${data.orderId}</span>
          <span class="bold">${data.orderType === 'Take Away' ? 'TAKE AWAY' : `Table: ${data.tableNumber || '-'}`}</span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width:15%">QTY</th>
              <th style="width:60%">ITEM</th>
              <th style="width:25%; text-align:right">AMT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div class="totals">
          <div class="row bold large" style="margin-top:5px"><span>TOTAL</span><span>${CURRENCY} ${data.total.toLocaleString()}</span></div>
          <div class="divider"></div>
          ${!isPending ? `<div class="row"><span>Pay Method</span><span>${data.paymentMethod}</span></div>` : ''}
          ${paymentDetailsHtml}
          ${settledInfoHtml}
        </div>
        
        ${aiSection}
        
        <div class="footer">
          <div class="divider"></div>
          <p>Served by: ${data.cashierName}</p>
          <p>Time: ${orderDateStr} ${orderTimeStr}</p>
          <p>Contact: ${SHOP_PHONE}</p>
          <div class="divider"></div>
          ${!isPending ? `
            <p class="bold" style="font-size:14px; margin-top:5px">THANK YOU!</p>
            <p>Karibu Tena</p>
          ` : `
            <p class="bold" style="font-size:12px; margin-top:5px">ASANTE SANA</p>
          `}
        </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-beige-50 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-coffee-200 relative">
          
          <div className="absolute inset-0 pointer-events-none opacity-5" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234B3621' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
          ></div>

          <div className={`${isPending ? 'bg-orange-600' : isSettled ? 'bg-green-700' : 'bg-coffee-800'} p-6 text-center text-white relative overflow-hidden shrink-0 transition-colors duration-500`}>
            <div className={`absolute -bottom-8 -right-8 ${isPending ? 'text-orange-500' : isSettled ? 'text-green-600' : 'text-coffee-700'} opacity-30 rotate-12`}>
               <Coffee size={120} />
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white rounded-full p-1 transition-colors z-10"
            >
              <X size={24} />
            </button>
            
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/20 relative z-10">
              {isPending ? <Clock size={32} className="text-white" /> : <CheckCircle size={32} className="text-white" />}
            </div>
            <h2 className="font-serif text-2xl font-bold relative z-10">{docTitle}</h2>
            <p className="text-white opacity-90 text-sm font-mono mt-1 relative z-10">#{data.orderId} • {data.status}</p>
            
            {!isPending && (
                <div className="absolute top-8 left-[-30px] rotate-[-45deg] bg-white/20 text-white font-black text-[10px] py-1 px-10 tracking-[3px] pointer-events-none">
                    PAID
                </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto flex-1 relative z-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-coffee-100 relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Coffee size={200} className="text-coffee-900" />
               </div>

              <div className="text-center mb-6 border-b-2 border-dashed border-coffee-100 pb-6">
                <div className="flex justify-center mb-2">
                   <img src={LOGO_URL} alt="Logo" className="h-12 object-contain" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-coffee-900 uppercase tracking-wider leading-none mb-2">Tropical Dreams</h3>
                <p className="text-xs font-bold text-coffee-600 uppercase tracking-widest mb-3">Coffee House</p>
                <div className={`text-center mb-2 font-bold text-sm inline-block px-3 py-1 rounded border uppercase ${isPending ? 'bg-orange-50 text-orange-700 border-orange-200' : isSettled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-coffee-50 text-coffee-800 border-coffee-100'}`}>
                    {docTitle}
                </div>
                
                <div className="flex flex-col items-center gap-1 text-coffee-500 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{SHOP_LOCATION}</span>
                  </div>
                </div>
              </div>

              {isPending && (
                <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                   <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Pay via M-Pesa</p>
                   <div className="space-y-1">
                     <p className="text-sm font-bold text-coffee-900">Paybill: <span className="text-green-700">{PAYBILL_NO}</span></p>
                     <p className="text-sm font-bold text-coffee-900">Acc: <span className="text-green-700">{ACCOUNT_NO}</span></p>
                   </div>
                   <div className="mt-3 p-2 bg-white rounded-lg border border-green-200">
                      <p className="text-[10px] italic text-coffee-600">Please settle your bill before leaving. Asante!</p>
                   </div>
                </div>
              )}

              {data.aiMessage && (
                <div className="mb-6 bg-beige-100 p-4 rounded-lg border border-beige-200 relative overflow-hidden">
                  <div className="flex gap-3 items-start relative z-10">
                    <Sparkles size={16} className="text-coffee-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-coffee-700 uppercase tracking-wide mb-1">A Note for You</p>
                      <p className="text-coffee-800 italic text-sm font-serif leading-relaxed">"{data.aiMessage}"</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-4 flex justify-center">
                 {data.orderType === 'Take Away' ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tropical-100 text-tropical-800 rounded-full font-bold text-sm">
                        <ShoppingBasket size={14} />
                        Take Away
                    </div>
                 ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-coffee-100 text-coffee-800 rounded-full font-bold text-sm">
                        <Utensils size={14} />
                        Table {data.tableNumber || '-'}
                    </div>
                 )}
              </div>

              <div className="space-y-3 mb-6">
                {data.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-coffee-700 items-start">
                    <div className="flex gap-3 items-start">
                      <span className="font-bold text-coffee-900 bg-coffee-100 border border-coffee-200 px-2 py-0.5 rounded text-xs min-w-[24px] text-center shrink-0 mt-0.5">
                        {item.quantity}x
                      </span>
                      <div className="flex flex-col">
                        <span className="leading-snug">{item.name}</span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-coffee-400">@ {CURRENCY} {item.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium leading-snug whitespace-nowrap">{CURRENCY} {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="bg-coffee-50 p-4 rounded-lg border border-coffee-100 space-y-2 text-sm">
                <div className="border-t border-coffee-200 my-2"></div>
                <div className="flex justify-between font-bold text-xl text-coffee-900">
                  <span>Total</span>
                  <span>{CURRENCY} {data.total.toLocaleString()}</span>
                </div>
                
                 <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between text-xs text-coffee-700 font-medium">
                      <span>{isPending ? 'Status' : `Paid via ${data.paymentMethod}`}</span>
                      {isPending ? (
                         <span className="text-orange-600 font-bold">UNPAID</span>
                      ) : data.paymentMethod === 'Cash' && data.amountTendered ? (
                        <span>Change: {CURRENCY} {data.change?.toLocaleString()}</span>
                      ) : (
                        <CheckCircle size={14} className="text-green-600" />
                      )}
                  </div>
                  {isSettled && data.updatedAt && (
                      <div className="text-[10px] text-green-600 font-bold flex items-center justify-between mt-1 border-t border-green-100 pt-1">
                          <span>SETTLED AT:</span>
                          <span>{new Date(data.updatedAt).toLocaleDateString()} {new Date(data.updatedAt).toLocaleTimeString()}</span>
                      </div>
                  )}
                 </div>
              </div>
              
              <div className="mt-6 text-center border-t-2 border-dashed border-coffee-100 pt-6 space-y-1">
                 <p className="text-xs text-coffee-600 font-bold">Served by: {data.cashierName}</p>
                 <p className="text-xs text-coffee-500">Contact: {SHOP_PHONE}</p>
                 <div className="flex justify-center gap-2 text-[10px] text-coffee-400 font-mono mt-2">
                   <span>Order Time: {new Date(data.date).toLocaleDateString()} {new Date(data.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 
                 <div className="mt-4 pt-4 text-center">
                    <p className={`font-bold ${isPending ? 'text-orange-600' : 'text-coffee-800'}`}>{isPending ? 'PLEASE SETTLE VIA M-PESA' : 'THANK YOU!'}</p>
                    {!isPending && <p className="text-xs text-coffee-600">Karibu Tena</p>}
                 </div>
              </div>

            </div>
          </div>

          <div className="p-4 bg-white border-t border-coffee-100 flex gap-3 shrink-0 relative z-10">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-coffee-50 border border-coffee-200 rounded-xl font-semibold text-coffee-700 hover:bg-coffee-100 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex-1 py-3 ${isPending ? 'bg-orange-600 hover:bg-orange-700' : isSettled ? 'bg-green-700 hover:bg-green-800' : 'bg-coffee-800 hover:bg-coffee-900'} text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95`}
            >
              <Printer size={18} />
              {isPrinting ? 'Pop-up Opened...' : isSettled ? 'Print Receipt' : `Print ${isPending ? 'Bill' : 'Receipt'}`}
            </button>
          </div>
        </div>
    </div>
  );
};
