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

  const SHOP_PHONE = "0748027790";
  const SHOP_LOCATION = "Lodwar, Turkana County";

  const isPending = data.status === 'Pending';
  const docTitle = isPending ? "GUEST BILL" : "OFFICIAL RECEIPT";

  // Women's day check
  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date());

  const isWomensDay = eatDate === "08/03";

  const handlePrint = () => {
    setIsPrinting(true);

    const printWindow = window.open('', 'PRINT', 'height=650,width=400');

    if (!printWindow) {
      alert("Please allow popups for printing.");
      setIsPrinting(false);
      return;
    }

    const MAX_CHARS = 32;

    const formatLine = (left: string, right: string) => {
      const maxLeft = MAX_CHARS - right.length - 1;

      let l = left;

      if (l.length > maxLeft) {
        l = l.substring(0, maxLeft - 2) + "..";
      }

      const spaces = MAX_CHARS - (l.length + right.length);

      return l + " ".repeat(spaces) + right;
    };

    const itemsHtml = data.items.map(item => {
      const left = `${item.quantity}x ${item.name}`;
      const right = `${(item.price * item.quantity).toLocaleString()}`;
      return `<div class="row">${formatLine(left, right)}</div>`;
    }).join("");

    const subtotal = data.subtotal || data.total + (data.discountAmount || 0);

    const subtotalLine = formatLine(
      "Subtotal",
      subtotal.toLocaleString()
    );

    const discountLine = data.discountAmount
      ? `<div class="row">${formatLine(
          `Promo ${data.discountPercent}%`,
          "-" + data.discountAmount.toLocaleString()
        )}</div>`
      : "";

    const totalLine = formatLine(
      isPending ? "TOTAL DUE" : "TOTAL PAID",
      data.total.toLocaleString()
    );

    const womensDayHtml = isWomensDay
      ? `<div class="divider"></div>
         <div class="center small">HAPPY INTERNATIONAL WOMEN'S DAY</div>`
      : "";

    printWindow.document.write(`
      <html>
      <head>
      <title>Receipt</title>

      <style>

      body{
        font-family: monospace;
        width:72mm;
        margin:0;
        padding:4mm;
        font-size:15px;
        line-height:1.4;
      }

      .center{
        text-align:center;
      }

      .title{
        font-size:18px;
        font-weight:bold;
      }

      .divider{
        border-top:1px dashed #000;
        margin:6px 0;
      }

      .row{
        white-space:pre;
      }

      .total{
        font-weight:bold;
        font-size:17px;
      }

      .small{
        font-size:13px;
      }

      @media print{
        body{
          width:72mm;
        }
      }

      </style>
      </head>

      <body>

      <div class="center title">Tropical Dreams</div>
      <div class="center small">Coffee House - Lodwar</div>
      <div class="center small">${SHOP_PHONE}</div>

      <div class="divider"></div>

      <div class="center title">${docTitle}</div>
      <div class="center small">Order #${data.orderId}</div>
      <div class="center small">
      ${new Date(data.date).toLocaleString('en-KE',{ timeZone:'Africa/Nairobi'})}
      </div>

      <div class="divider"></div>

      ${itemsHtml}

      <div class="divider"></div>

      <div class="row">${subtotalLine}</div>

      ${discountLine}

      <div class="divider"></div>

      <div class="row total">${totalLine}</div>

      <div class="divider"></div>

      <div class="center small">Served by ${data.cashierName}</div>

      ${data.aiMessage ? `<div class="center small">${data.aiMessage}</div>` : ""}

      <div class="center">Karibu Tena!</div>

      ${womensDayHtml}

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
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className={`${isPending ? 'bg-orange-500' : 'bg-[#4B3621]'} p-8 text-center text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="flex justify-center mb-4">
            {isPending ? <ReceiptText size={40}/> : <ShieldCheck size={40}/>}
          </div>

          <h2 className="text-2xl font-bold">{docTitle}</h2>

          <p className="text-sm opacity-80 mt-2">
            ORDER #{data.orderId}
          </p>
        </div>

        <div className="p-8 overflow-y-auto">

          <div className="text-center mb-6">
            <img src={LOGO_URL} className="h-14 mx-auto mb-2"/>
            <p className="text-sm text-gray-500">
              {SHOP_LOCATION} | {SHOP_PHONE}
            </p>
          </div>

          <div className="space-y-3">

            {data.items.map(item => (
              <div key={item.id} className="flex justify-between border-b pb-2">
                <span>{item.quantity}x {item.name}</span>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}

          </div>

          <div className="mt-6 text-right font-bold text-xl">
            KES {data.total.toLocaleString()}
          </div>

        </div>

        <div className="p-6 border-t flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-3 rounded-lg"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 bg-[#4B3621] text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Printer size={18}/>
            {isPrinting ? "Printing..." : "Print"}
          </button>
        </div>

      </div>
    </div>
  );
};
