```tsx
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
  const SHOP_LOCATION = "Coffee House - Lodwar";

  const isPending = data.status === 'Pending';
  const docTitle = isPending ? "GUEST BILL" : "OFFICIAL RECEIPT";

  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date());

  const isWomensDay = eatDate === "08/03";

  const handlePrint = () => {

    setIsPrinting(true);

    const printWindow = window.open('', 'ReceiptPrint', 'height=600,width=420');

    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      setIsPrinting(false);
      return;
    }

    printWindow.document.write(`
    <html>
    <head>
    <title>${docTitle} #${data.orderId}</title>

<style>

body{
  font-family:"Courier New", monospace;
  width:72mm;
  margin:0 auto;
  padding:6mm 4mm;
  font-size:18px;
  line-height:1.45;
  color:#000;
}

.center{
  text-align:center;
}

.header{
  font-size:30px;
  font-weight:900;
}

.sub{
  font-size:18px;
}

.meta{
  font-size:16px;
}

.divider{
  border-top:2px dashed #000;
  margin:10px 0;
}

table{
  width:100%;
  border-collapse:collapse;
}

td{
  padding:6px 0;
  font-size:18px;
}

td.item{
  width:70%;
}

td.price{
  width:30%;
  text-align:right;
}

.total-row td{
  font-size:24px;
  font-weight:900;
}

.footer{
  margin-top:14px;
  font-size:18px;
}

@media print{
  body{
    width:72mm;
  }
}

</style>
</head>

<body>

<div class="center header">Tropical Dreams</div>
<div class="center sub">${SHOP_LOCATION}</div>
<div class="center meta">${SHOP_PHONE}</div>

<div class="divider"></div>

<div class="center" style="font-size:20px;font-weight:bold;">
*** ${docTitle} ***
</div>

<div class="center meta">Order #${data.orderId}</div>

<div class="center meta">
${new Date(data.date).toLocaleString('en-KE',{timeZone:'Africa/Nairobi'})}
</div>

<div class="divider"></div>

<table>

${data.items.map(item => `
<tr>
<td class="item">${item.quantity}x ${item.name}</td>
<td class="price">${(item.price * item.quantity).toLocaleString()}</td>
</tr>
`).join('')}

<tr>
<td class="item"><b>Subtotal</b></td>
<td class="price"><b>${(data.subtotal || data.total + (data.discountAmount || 0)).toLocaleString()}</b></td>
</tr>

${data.discountAmount ? `
<tr>
<td class="item"><i>Promo ${data.discountPercent}%</i></td>
<td class="price"><i>-${data.discountAmount.toLocaleString()}</i></td>
</tr>
` : ""}

</table>

<div class="divider"></div>

<table>
<tr class="total-row">
<td class="item">TOTAL ${isPending ? 'DUE' : 'PAID'}</td>
<td class="price">${data.total.toLocaleString()}</td>
</tr>
</table>

<div class="divider"></div>

<div class="footer center">
Served by ${data.cashierName}
</div>

${data.aiMessage ? `
<div class="footer center"><i>${data.aiMessage}</i></div>
` : ""}

<div class="footer center" style="font-weight:bold;">
Karibu Tena!
</div>

${isWomensDay ? `
<div class="divider"></div>
<div class="center" style="font-size:16px;font-weight:bold;">
HAPPY INTERNATIONAL WOMEN'S DAY
</div>
` : ""}

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
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">

        <div className={`${isPending ? 'bg-orange-500' : 'bg-[#4B3621]'} p-8 text-center text-white relative`}>
          <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white">
            <X size={24} />
          </button>

          <div className="flex justify-center mb-4">
            {isPending ? <ReceiptText size={40} /> : <ShieldCheck size={40} />}
          </div>

          <h2 className="text-2xl font-bold uppercase">{docTitle}</h2>

          <p className="text-sm opacity-80 mt-2">
            ORDER #{data.orderId}
          </p>
        </div>

        <div className="p-8 text-center">
          <img src={LOGO_URL} alt="logo" className="h-16 mx-auto mb-4"/>
          <h3 className="text-xl font-bold">Tropical Dreams</h3>
          <p className="text-sm text-gray-500">{SHOP_LOCATION} | {SHOP_PHONE}</p>
        </div>

        <div className="p-8 border-t flex gap-4">
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
            {isPrinting ? 'Printing...' : 'Print Receipt'}
          </button>
        </div>

      </div>
    </div>
  );
};
```
