import React, { useState } from 'react';
import { ReceiptData, PaymentMethod, PAYMENT_METHODS } from '../types';
import { LOGO_URL, isTestItem } from '../constants';
import { Printer, X, ReceiptText, ShieldCheck, Check, FlaskConical, Banknote, Layers } from 'lucide-react';

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  // Pressing Complete calls this with the payment label (e.g. "Cash" or
  // "Cash + M-Pesa") to close the sale (marks it Paid, deducts stock,
  // triggers eTIMS sync).
  onSettlePaymentMethod?: (methodLabel: string) => Promise<void>;
  // Test receipts are print-only: never saved, never settled.
  isTestOrder?: boolean;
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

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose, onSettlePaymentMethod, isTestOrder }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  // Multi-select: an order can be paid with more than one method.
  const [selected, setSelected] = useState<Set<PaymentMethod>>(new Set());
  // 'single' is the everyday default; 'multi' unlocks split payments with
  // per-method amounts.
  const [payMode, setPayMode] = useState<'single' | 'multi'>('single');
  // Amount tendered per method; for 2+ methods the amounts must add up to
  // the bill total before Complete unlocks.
  const [amounts, setAmounts] = useState<Partial<Record<PaymentMethod, string>>>({});
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
  // A printed test receipt: all items are system-test items. It must never be
  // settled or recorded, even though it looks like a Pending guest bill.
  const isTest = !!isTestOrder || data.items.every(i => isTestItem(i.id) || isTestItem(i.name));
  const showCompleteFlow = isPending && !isTest && !!onSettlePaymentMethod;
  const docTitle = isTest ? "TEST TICKET — NOT A SALE" : (isPending ? "GUEST BILL" : "OFFICIAL RECEIPT");

  // --- ETIMS STATUS ---
  const etimsStatus = data.etimsSyncStatus; // 'success' | 'failed' | 'pending' | undefined
  const hasEtims = etimsStatus === 'success' && !!data.etimsInvoiceNumber;
  const etimsFailed = etimsStatus === 'failed';

  const toggleMethod = (m: PaymentMethod) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
    // Drop the amount of any method that gets unticked.
    setAmounts(prev => {
      if (!(m in prev)) return prev;
      const next = { ...prev };
      delete next[m];
      return next;
    });
  };

  // Single-pay mode: tapping a method selects it and deselects the rest.
  const pickSingle = (m: PaymentMethod) => setSelected(new Set([m]));

  // Switching back to single-pay keeps one method (the first ticked) and
  // drops any per-method amounts.
  const switchMode = (mode: 'single' | 'multi') => {
    setPayMode(mode);
    if (mode === 'single') {
      setSelected(prev => (prev.size <= 1 ? prev : new Set([Array.from(prev)[0]])));
      setAmounts({});
    }
  };

  // Amount inputs only appear in multi-pay with 2+ methods ticked. Amounts
  // are custom: a mismatch only warns, it never blocks Complete.
  const needsAmounts = payMode === 'multi' && selected.size > 1;
  const totalCents = Math.round(data.total * 100);
  const enteredCents = Array.from(selected).reduce((sum, m) => {
    const v = parseFloat((amounts[m] || '').replace(/,/g, ''));
    return sum + (isFinite(v) && v >= 0 ? Math.round(v * 100) : 0);
  }, 0);
  const remainingCents = totalCents - enteredCents;

  // Helper: divide the bill evenly across ticked methods (the last method
  // absorbs any rounding remainder).
  const splitEvenly = () => {
    const list = Array.from(selected);
    if (list.length < 2) return;
    const each = Math.floor(totalCents / list.length);
    const fmt = (c: number) => (c / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    const next: Partial<Record<PaymentMethod, string>> = {};
    list.forEach((m, i) => { next[m] = fmt(i === list.length - 1 ? totalCents - each * (list.length - 1) : each); });
    setAmounts(next);
  };

  // Label saved with the sale, e.g. "Cash" or "Cash 300 + M-Pesa 200".
  const finalLabel = selected.size === 0 ? '' : Array.from(selected)
    .map(m => (needsAmounts ? `${m} ${(amounts[m] || '').trim()}`.trim() : m))
    .join(' + ');

  // Closes the transaction with the ticked payment method(s). The bill stays
  // Pending until this runs — ticking alone is not enough.
  const handleComplete = async () => {
    if (selected.size === 0 || !onSettlePaymentMethod || isSettling) return;
    setIsSettling(true);
    try {
      await onSettlePaymentMethod(finalLabel);
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

    const womensDayPrintHtml = isWomensDay ? `
      <div style="margin-top: 16px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; text-align: center; font-weight: bold; font-size: 17px; text-transform: uppercase; letter-spacing: 0.6px;">
        *** HAPPY INTERNATIONAL WOMEN'S DAY ***
      </div>
    ` : '';

    // --- PAYMENT METHOD CHECKBOXES (printed on every copy) ---
    // Pending bill: empty boxes for the cashier to tick by hand.
    // Official receipt: the settled method's box is pre-ticked (■).
    // Official receipt: pre-tick every method that was used. Labels may
    // embed amounts ("Cash 300 + M-Pesa 200") — show them next to the box.
    const paidParts = !isPending
      ? data.paymentMethod.split('+').map(s => s.trim()).filter(Boolean).map(p => {
          const match = p.match(/^(.*?)(?:\s+(\d[\d.,]*))?$/);
          return { method: (match?.[1] || p).trim(), amount: match?.[2] };
        })
      : [];
    const paymentBoxesHtml = isTest ? '' : `
      <div class="divider"></div>
      <div class="center" style="margin-top: 4px;">
        <p style="font-size: 15px; font-weight: bold; letter-spacing: 0.4px; margin: 6px 0 2px 0;">
          ${isPending ? 'PAYMENT METHOD (TICK ALL THAT APPLY)' : 'PAYMENT METHOD'}
        </p>
        <div style="margin-top: 6px;">
          ${PAYMENT_METHODS.map(m => {
            const part = paidParts.find(p => p.method === m);
            const amountLabel = part?.amount ? ` <span style="font-weight:normal">(KES ${Number(part.amount.replace(/,/g, '')).toLocaleString()})</span>` : '';
            return `
            <span style="display: inline-block; margin: 4px 7px; font-size: 16px; font-weight: bold; white-space: nowrap;">
              <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #000; vertical-align: middle; margin-right: 4px; ${part ? 'background:#000; box-shadow: inset 0 0 0 3px #fff;' : ''}"></span>${m}${amountLabel}
            </span>
          `;
          }).join('')}
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
        ${discountHtml}
        <tr>
          <td style="padding: 12px 0 8px 0; font-weight: bold; font-size: 22px; letter-spacing: 0.5px;">${isTest ? 'TEST TOTAL' : `TOTAL ${isPending ? 'DUE' : 'PAID'}`}</td>
          <td style="padding: 12px 0 8px 0; text-align: right; font-weight: bold; font-size: 22px; letter-spacing: 0.5px;">KES ${data.total.toLocaleString()}</td>
        </tr>
      </table>
      ${isTest ? '<div class="center bold" style="margin-top: 10px; font-size: 16px;">* TEST TICKET — NOT RECORDED *</div>' : paymentBoxesHtml}
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
      <div className="bg-white w-full max-w-md lg:max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] lg:max-h-[94vh] border border-gray-100 relative">
        {/* Header */}
          <div className={`${isTest ? 'bg-gray-700' : isPending ? 'bg-orange-500' : 'bg-[#4B3621]'} p-8 text-center text-white relative shrink-0 transition-colors`}>
            <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white rounded-full p-2 hover:bg-white/10 z-10">
              <X size={24} />
            </button>
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 relative z-10">
              {isTest ? <FlaskConical size={40} /> : isPending ? <ReceiptText size={40} /> : <ShieldCheck size={40} />}
            </div>
          <h2 className="font-serif text-3xl font-black uppercase tracking-tighter">{docTitle}</h2>
          <p className="text-white opacity-80 text-sm font-black tracking-widest mt-2">
            ORDER #{data.orderId} • {isTest ? 'TEST MODE — NOTHING SAVED' : isPending ? 'PAYMENT REQUIRED' : 'SETTLED'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8 overflow-y-auto flex-1 bg-gray-50/30">
          {/* Laptop: bill on the left, payment on the right; mobile: stacked */}
          <div className="bg-white p-6 lg:p-10 rounded-[32px] shadow-sm border border-gray-100 relative block lg:grid lg:grid-cols-2 lg:gap-10">
            <div>
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
             
            {data.discountAmount && data.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-black italic">
                  <span>Promo Discount ({data.discountPercent}%)</span>
                  <span>-KES {data.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className={`p-8 rounded-[32px] text-center font-black ${isTest ? 'bg-gray-100 text-gray-600' : isPending ? 'bg-orange-50 text-orange-800' : 'bg-teal-50 text-[#4B3621]'}`}>
              <span className="text-2xl">{isTest ? 'TEST TOTAL (NOT RECORDED)' : isPending ? 'TOTAL DUE' : 'TOTAL PAID'}</span>
              <span className="text-5xl block mt-2">KES {data.total.toLocaleString()}</span>
              {!isPending && (
                <span className="block mt-2 text-sm font-black uppercase tracking-widest">
                  Paid via {data.paymentMethod}
                </span>
              )}
            </div>
            </div>

            <div className="lg:border-l lg:border-gray-100 lg:pl-10 flex flex-col">
            {/* --- PAYMENT (screen): single-pay default + multi-pay section --- */}
            {showCompleteFlow && (
              <div className="mt-8">
                {/* Mode toggle: single (default) vs multi-pay */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl mb-4">
                  <button
                    onClick={() => switchMode('single')}
                    disabled={isSettling}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      payMode === 'single' ? 'bg-white text-[#4B3621] shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Banknote size={14} /> Single Pay
                  </button>
                  <button
                    onClick={() => switchMode('multi')}
                    disabled={isSettling}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      payMode === 'multi' ? 'bg-white text-[#4B3621] shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Layers size={14} /> Multi Pay
                  </button>
                </div>

                {payMode === 'single' ? (
                  /* --- SINGLE PAY: tap one method, press Complete --- */
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 text-center">
                      Tap the method used
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(m => {
                        const active = selected.has(m);
                        return (
                          <button
                            key={m}
                            onClick={() => pickSingle(m)}
                            disabled={isSettling}
                            className={`p-4 rounded-2xl border-2 text-sm font-black uppercase tracking-widest transition-all ${
                              active
                                ? 'bg-[#4B3621] text-white border-[#4B3621] shadow-lg'
                                : isSettling
                                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-wait'
                                  : 'bg-white text-[#4B3621] border-gray-100 hover:border-[#4B3621] hover:shadow-md active:scale-[0.98]'
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* --- MULTI-PAY: tick methods + adjust amounts --- */
                  <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
                      Tick every method used, then split the bill
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => {
                    const checked = selected.has(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMethod(m)}
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
                    {needsAmounts && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Bill total KES {data.total.toLocaleString()}
                          </p>
                          <button
                            onClick={splitEvenly}
                            disabled={isSettling}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          >
                            Split evenly
                          </button>
                        </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from(selected).map(m => (
                        <div key={m} className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">KES</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="any"
                            value={amounts[m] ?? ''}
                            onChange={e => setAmounts(prev => ({ ...prev, [m]: e.target.value }))}
                            disabled={isSettling}
                            placeholder={m}
                            className="w-full pl-11 pr-3 py-3 rounded-2xl border-2 border-gray-100 focus:border-[#4B3621] focus:outline-none text-sm font-bold text-[#4B3621] bg-white disabled:opacity-50"
                          />
                        </div>
                      ))}
                    </div>
                    <p className={`text-center text-[10px] font-black uppercase tracking-widest mt-2 ${
                      remainingCents === 0 ? 'text-green-600' : 'text-amber-500'
                    }`}>
                      {remainingCents === 0
                        ? 'Adds up to the bill ✓'
                        : remainingCents > 0
                          ? `⚠ Short by KES ${(remainingCents / 100).toLocaleString()} — check before completing`
                          : `⚠ KES ${(-remainingCents / 100).toLocaleString()} more than the bill — check before completing`}
                    </p>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={handleComplete}
                  disabled={selected.size === 0 || isSettling}
                  className={`w-full mt-5 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selected.size > 0 && !isSettling
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={18} />
                  {isSettling ? 'Completing...' : selected.size > 0 ? `Complete — Paid via ${finalLabel}` : 'Complete'}
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
        </div>

        {/* Action Buttons */}
        <div className="p-6 lg:p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
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
