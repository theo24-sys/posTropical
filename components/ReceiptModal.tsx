import React, { useState } from 'react';
import { ReceiptData, PaymentMethod, PAYMENT_METHODS } from '../types';
import { LOGO_URL } from '../constants';
import { Printer, X, ReceiptText, ShieldCheck, Check } from 'lucide-react';

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  // Ticking a payment method on a pending bill calls this to close the sale
  // (marks it Paid with that method, deducts stock, triggers eTIMS sync).
  onSettlePaymentMethod?: (method: PaymentMethod) => Promise<void>;
}

const SHOP_PHONE = "0748027790";
const SHOP_LOCATION = "Lodwar, Turkana County";

const PRINT_STYLES = `
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 18px;
    line-height: 1.4;
    color: #000;
    letter-spacing: 0.3px;
    margin: 0;
  }
  .receipt {
    width: 72mm;
    margin: 0 auto;
    padding: 4mm 2mm;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; }
  .footer { font-size: 16px; margin-top: 16px; text-align: center; letter-spacing: 0.3px; }
  h2 { font-size: 26px; letter-spacing: 0.5px; margin: 4px 0; }
`;

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose, onSettlePaymentMethod }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  if (!isOpen || !data) return null;

  // --- 24-HOUR WOMEN'S DAY CHECK (EAT) ---
  const now = new Date();
  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(now);
  const isWomensDay = eatDate === "08/03";

  const isPending = data.status === 'Pending';
  const docTitle = isPending ? "GUEST BILL" : "OFFICIAL RECEIPT";

  // --- ETIMS STATUS ---
  const etimsStatus = data.etimsSyncStatus; // 'success' | 'failed' | 'pending' | undefined
  const hasEtims = etimsStatus === 'success' && !!data.etimsInvoiceNumber;
  const etimsFailed = etimsStatus === 'failed';

  // Closes the transaction with the ticked payment method. The bill stays
  // Pending until this runs — ticking alone is not enough.
  const handleComplete = async () => {
    if (!selectedMethod || !onSettlePaymentMethod || isSettling) return;
    setIsSettling(true);
    try {
      await onSettlePaymentMethod(selectedMethod);
    } catch (e) {
      console.error('Failed to settle from receipt:', e);
    } finally {
      setIsSettling(false);
    }
  };

  // --- SINGLE PRINT: one receipt with payment-method checkboxes for staff
  // to tick by hand once the customer has paid. ---
  const handlePrint = () => {
    setIsPrinting(true);
    const win = window.open('', 'ReceiptPrint', 'height=700,width=420');
    if (!win) {
      alert("Please allow pop-ups to print.");
      setIsPrinting(false);
      return;
    }

    win.document.write(`
      <html>
      <head>
        <title>${docTitle} #${data.orderId}</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <div class="receipt">${buildReceiptBodyHtml()}</div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
      setIsPrinting(false);
    }, 500);
  };

  const buildReceiptBodyHtml = () => {
    const itemsHtml = data.items
      .map(item => `
        <tr>
          <td style="padding: 6px 0; font-size: 18px; letter-spacing: 0.3px;">${item.quantity} × ${item.name}</td>
          <td style="padding: 6px 0; text-align: right; font-size: 18px; letter-spacing: 0.3px;">KES ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `)
      .join('');

    const discountHtml = data.discountAmount && data.discountAmount > 0 ? `
      <tr>
        <td style="padding: 10px 0 6px 0; font-size: 18px; font-style: italic; font-weight: bold; letter-spacing: 0.4px;">Promo Discount (${data.discountPercent}%)</td>
        <td style="padding: 10px 0 6px 0; text-align: right; font-size: 18px; font-style: italic; font-weight: bold; letter-spacing: 0.4px;">-KES ${data.discountAmount.toLocaleString()}</td>
      </tr>
    ` : '';

    const subtotalHtml = `
      <tr>
        <td style="padding: 10px 0 6px 0; font-size: 20px; font-weight: bold; letter-spacing: 0.4px;">Subtotal</td>
        <td style="padding: 10px 0 6px 0; text-align: right; font-size: 20px; font-weight: bold; letter-spacing: 0.4px;">KES ${(data.subtotal || data.total + (data.discountAmount || 0)).toLocaleString()}</td>
      </tr>
    `;

    const womensDayPrintHtml = isWomensDay ? `
      <div style="margin-top: 16px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; text-align: center; font-weight: bold; font-size: 17px; text-transform: uppercase; letter-spacing: 0.6px;">
        *** HAPPY INTERNATIONAL WOMEN'S DAY ***
      </div>
    ` : '';

    // --- PAYMENT METHOD CHECKBOXES (printed on every copy) ---
    // Pending bill: empty boxes for the cashier to tick by hand.
    // Official receipt: the settled method's box is pre-ticked (■).
    const tickedMethod = !isPending && PAYMENT_METHODS.includes(data.paymentMethod)
      ? data.paymentMethod
      : undefined;
    const paymentBoxesHtml = `
      <div class="divider"></div>
      <div class="center" style="margin-top: 4px;">
        <p style="font-size: 15px; font-weight: bold; letter-spacing: 0.4px; margin: 6px 0 2px 0;">
          ${isPending ? 'PAYMENT METHOD (TICK ONE)' : 'PAYMENT METHOD'}
        </p>
        <div style="margin-top: 6px;">
          ${PAYMENT_METHODS.map(m => `
            <span style="display: inline-block; margin: 4px 7px; font-size: 16px; font-weight: bold; white-space: nowrap;">
              <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #000; vertical-align: middle; margin-right: 4px; ${tickedMethod === m ? 'background:#000; box-shadow: inset 0 0 0 3px #fff;' : ''}"></span>${m}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    // --- ETIMS PRINT BLOCK ---
    const etimsPrintHtml = !isPending ? (
      hasEtims ? `
        <div class="divider"></div>
        <div class="center" style="margin-top: 8px;">
          <p style="font-size: 16px; font-weight: bold; letter-spacing: 0.4px; margin: 4px 0;">KRA eTIMS VERIFIED</p>
          <p style="font-size: 15px; margin: 2px 0;">Invoice No: ${data.etimsInvoiceNumber}</p>
          ${data.etimsControlNumber ? `<p style="font-size: 15px; margin: 2px 0;">Control No: ${data.etimsControlNumber}</p>` : ''}
          ${data.etimsQrUrl ? `<img src="${data.etimsQrUrl}" alt="KRA QR" style="width: 120px; height: 120px; margin-top: 8px;" />` : ''}
        </div>
      ` : etimsFailed ? `
        <div class="divider"></div>
        <div class="center" style="margin-top: 8px;">
          <p style="font-size: 15px; font-weight: bold;">eTIMS verification pending — retry sync before filing</p>
        </div>
      ` : ''
    ) : '';

    return `
      <div class="center">
        <h2 style="margin: 0; font-size: 26px; letter-spacing: 0.6px;">Tropical Dreams</h2>
        <p style="margin: 4px 0; font-size: 18px; letter-spacing: 0.4px;">Coffee House - Lodwar</p>
        <p style="margin: 2px 0; font-size: 18px; letter-spacing: 0.4px;">${SHOP_PHONE}</p>
      </div>
      <div class="divider"></div>
      <div class="center bold" style="font-size: 20px; letter-spacing: 0.5px;">*** ${docTitle} ***</div>
      <p style="margin: 6px 0; font-size: 18px;">Order #${data.orderId}</p>
      <p style="font-size: 18px;">${new Date(data.date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>
      <div class="divider"></div>
      <table>
        ${itemsHtml}
        ${subtotalHtml}
        ${discountHtml}
        <tr>
          <td style="padding: 12px 0 8px 0; font-weight: bold; font-size: 22px; letter-spacing: 0.5px;">TOTAL ${isPending ? 'DUE' : 'PAID'}</td>
          <td style="padding: 12px 0 8px 0; text-align: right; font-weight: bold; font-size: 22px; letter-spacing: 0.5px;">KES ${data.total.toLocaleString()}</td>
        </tr>
      </table>
      ${paymentBoxesHtml}
      ${etimsPrintHtml}
      <div class="divider"></div>
      <div class="footer">
        <p style="font-size: 18px;">Served by: ${data.cashierName}</p>
        ${data.aiMessage ? `<p style="margin-top: 12px; font-style: italic; font-size: 18px; letter-spacing: 0.3px;">"${data.aiMessage}"</p>` : ''}
        <p style="margin-top: 16px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Karibu Tena!</p>
      </div>
      ${womensDayPrintHtml}
    `;
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
                <span>KES {(data.subtotal || data.total + (data.discountAmount || 0)).toLocaleString()}</span>
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
              {!isPending && (
                <span className="block mt-2 text-sm font-black uppercase tracking-widest">
                  Paid via {data.paymentMethod}
                </span>
              )}
            </div>

            {/* --- PAYMENT METHOD CHECKBOXES (screen) --- */}
            {isPending && onSettlePaymentMethod && (
              <div className="mt-8">
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-[2px] mb-4 text-center">
                  Tick the method used, then press Complete
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => {
                    const checked = selectedMethod === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setSelectedMethod(checked ? null : m)}
                        disabled={isSettling}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                          checked
                            ? 'border-[#4B3621] bg-gray-50 shadow-md'
                            : isSettling
                              ? 'opacity-50 cursor-wait border-gray-100 bg-gray-50'
                              : 'border-gray-100 bg-white hover:border-[#4B3621] hover:bg-gray-50 hover:shadow-md active:scale-[0.98]'
                        }`}
                      >
                        <span className={`w-6 h-6 shrink-0 border-2 rounded-md flex items-center justify-center transition-colors ${
                          checked ? 'border-[#4B3621] bg-[#4B3621]' : 'border-[#4B3621] bg-white'
                        }`}>
                          <Check size={16} className={`transition-opacity ${checked ? 'text-white opacity-100' : 'text-[#4B3621] opacity-0'}`} />
                        </span>
                        <span className="text-sm font-black uppercase tracking-widest text-[#4B3621]">{m}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleComplete}
                  disabled={!selectedMethod || isSettling}
                  className={`w-full mt-5 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selectedMethod && !isSettling
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={18} />
                  {isSettling ? 'Completing...' : selectedMethod ? `Complete — Paid via ${selectedMethod}` : 'Complete'}
                </button>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">
                  Bill stays Pending until Complete is pressed
                </p>
              </div>
            )}

            {/* --- ETIMS SECTION --- */}
            {!isPending && (
              <div className="mt-8">
                {hasEtims ? (
                  <div className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-[#4B3621] mb-3">KRA eTIMS Verified</p>
                    {data.etimsQrUrl && (
                      <img src={data.etimsQrUrl} alt="KRA verification QR" className="w-28 h-28 mx-auto mb-3" />
                    )}
                    <p className="text-sm font-bold text-gray-700">Invoice: {data.etimsInvoiceNumber}</p>
                    {data.etimsControlNumber && (
                      <p className="text-sm text-gray-500">Control No: {data.etimsControlNumber}</p>
                    )}
                  </div>
                ) : etimsFailed ? (
                  <div className="p-4 rounded-[20px] bg-yellow-50 border border-yellow-200 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-yellow-800">
                      eTIMS verification pending — retry sync before filing
                    </p>
                  </div>
                ) : null}
              </div>
            )}

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
            {isPrinting ? 'Printing x2...' : isPending ? 'Print Guest Bill (x2)' : 'Print Receipt (x2)'}
          </button>
        </div>
      </div>
    </div>
  );
};
