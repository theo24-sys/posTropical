import React, { useState } from 'react';
import { ReceiptData } from '../types';           // adjust path if needed
import { Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, isOpen, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !data) return null;

  // Check if today is March 8 in EAT (Women's Day)
  const now = new Date();
  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit',
  }).format(now);
  const isWomensDay = eatDate === '08/03';

  const SHOP_PHONE = '0748027790';
  const SHOP_LOCATION = 'Lodwar, Turkana County';
  const isPending = data.status === 'Pending';
  const docTitle = isPending ? 'GUEST BILL' : 'OFFICIAL RECEIPT';

  const handlePrint = () => {
    setIsPrinting(true);

    const printWindow = window.open('', 'ReceiptPrint', 'height=700,width=450');
    if (!printWindow) {
      alert('Please allow pop-ups to print.');
      setIsPrinting(false);
      return;
    }

    // Build clean HTML for printing (monospace-like receipt style)
    const itemsHtml = data.items
      .map(
        (item) => `
          <div style="display:flex;justify-content:space-between;">
            <span>${item.quantity} × ${item.name}</span>
            <span>KES ${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        `
      )
      .join('');

    const discountHtml =
      data.discountAmount && data.discountAmount > 0
        ? `
          <div style="display:flex;justify-content:space-between;">
            <span>Promo Discount (${data.discountPercent}%)</span>
            <span>-KES ${data.discountAmount.toLocaleString()}</span>
          </div>
        `
        : '';

    const subtotal = data.subtotal ?? data.total + (data.discountAmount || 0);

    const womensDayHtml = isWomensDay
      ? `
        <div style="text-align:center; margin-top:12px; font-weight:bold;">
          *** HAPPY INTERNATIONAL WOMEN'S DAY ***
        </div>
      `
      : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            body { font-family: monospace; margin: 12px; font-size: 14px; }
            h1, h2 { text-align: center; margin: 4px 0; }
            hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
            .center { text-align: center; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <h2>Tropical Dreams</h2>
          <div class="center">Coffee House - Lodwar</div>
          <div class="center">${SHOP_PHONE}</div>
          <hr />
          <h3 class="center">*** ${docTitle} ***</h3>
          <div>Order #${data.orderId}</div>
          <div>${new Date(data.date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</div>
          <hr />
          ${itemsHtml}
          <hr />
          <div style="display:flex;justify-content:space-between;">
            <span>Subtotal</span>
            <span>KES ${subtotal.toLocaleString()}</span>
          </div>
          ${discountHtml}
          <hr style="border-top: 2px solid #000;" />
          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;">
            <span>${isPending ? 'TOTAL DUE' : 'TOTAL PAID'}</span>
            <span>KES ${data.total.toLocaleString()}</span>
          </div>
          <hr />
          <div>Served by: ${data.cashierName}</div>
          ${
            data.aiMessage
              ? `<div style="margin-top:8px;">${data.aiMessage}</div>`
              : ''
          }
          <div class="center" style="margin-top:12px;">Karibu Tena!</div>
          ${womensDayHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      setIsPrinting(false);
    }, 600);
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>
          {isPending ? 'Guest Bill' : 'Official Receipt'}
        </h2>

        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.4' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Tropical Dreams</div>
          <div style={{ textAlign: 'center' }}>
            {SHOP_LOCATION} | {SHOP_PHONE}
          </div>
          <hr style={{ border: 'none', borderTop: '1px dashed #666', margin: '12px 0' }} />

          <div style={{ fontWeight: 'bold', textAlign: 'center' }}>*** {docTitle} ***</div>
          <div>Order #{data.orderId}</div>
          <div>
            {new Date(data.date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
          </div>
          <hr />

          {data.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.quantity}× {item.name}</span>
              <span>KES {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>KES {(data.subtotal ?? data.total + (data.discountAmount || 0)).toLocaleString()}</span>
          </div>

          {data.discountAmount && data.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Promo Discount ({data.discountPercent}%)</span>
              <span>-KES {data.discountAmount.toLocaleString()}</span>
            </div>
          )}

          <hr style={{ borderTop: '2px solid #000' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
            <span>{isPending ? 'TOTAL DUE' : 'TOTAL PAID'}</span>
            <span>KES {data.total.toLocaleString()}</span>
          </div>

          <hr />
          <div>Served by: {data.cashierName}</div>
          {data.aiMessage && <div style={{ marginTop: '8px' }}>{data.aiMessage}</div>}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>Karibu Tena!</div>

          {isWomensDay && (
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '12px' }}>
              *** HAPPY INTERNATIONAL WOMEN'S DAY ***
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            style={{
              flex: 1,
              padding: '12px',
              background: '#2f855a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isPrinting ? 'not-allowed' : 'pointer',
              opacity: isPrinting ? 0.7 : 1,
            }}
          >
            {isPrinting
              ? 'Printing...'
              : isPending
              ? 'Print Guest Bill'
              : 'Print Receipt'}
            <Printer size={16} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
