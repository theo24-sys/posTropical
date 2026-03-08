import React, { useState } from "react";
import { ReceiptData } from "../types";
import { LOGO_URL } from "../constants";
import { Printer, X } from "lucide-react";

interface ReceiptModalProps {
  data: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  data,
  isOpen,
  onClose
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !data) return null;

  const SHOP_PHONE = "0748027790";
  const SHOP_NAME = "Tropical Dreams";
  const SHOP_LOCATION = "Coffee House - Lodwar";

  const handlePrint = () => {
    setIsPrinting(true);

    const printWindow = window.open("", "PRINT", "height=700,width=420");

    if (!printWindow) {
      alert("Allow popups to print");
      setIsPrinting(false);
      return;
    }

    const itemsHtml = data.items
      .map(
        (item) => `
        <div class="item">
            <div>${item.quantity} x ${item.name}</div>
            <div>KES ${(item.price * item.quantity).toLocaleString()}</div>
        </div>
      `
      )
      .join("");

    const subtotal = data.subtotal || data.total + (data.discountAmount || 0);

    const discountLine =
      data.discountAmount && data.discountAmount > 0
        ? `
      <div class="row">
        Promo (${data.discountPercent}%)
        <span>-KES ${data.discountAmount.toLocaleString()}</span>
      </div>`
        : "";

    printWindow.document.write(`
<html>
<head>
<title>Receipt</title>

<style>

body{
    font-family: monospace;
    width:72mm;
    margin:0 auto;
    padding:5mm;
    text-align:center;
    font-size:18px;
    line-height:1.6;
}

.logo{
    margin-bottom:8px;
}

.shop{
    font-size:26px;
    font-weight:bold;
}

.info{
    font-size:18px;
}

.divider{
    border-top:2px dashed black;
    margin:10px 0;
}

.item{
    margin:10px 0;
}

.row{
    display:flex;
    justify-content:space-between;
    margin:8px 0;
}

.total{
    font-size:28px;
    font-weight:bold;
    margin-top:10px;
}

.footer{
    margin-top:15px;
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

<img src="${LOGO_URL}" width="80" class="logo"/>

<div class="shop">${SHOP_NAME}</div>

<div class="info">${SHOP_LOCATION}</div>
<div class="info">${SHOP_PHONE}</div>

<div class="divider"></div>

<div style="font-size:22px;font-weight:bold;">
OFFICIAL RECEIPT
</div>

<div>Order #${data.orderId}</div>

<div>
${new Date(data.date).toLocaleString("en-KE", {
  timeZone: "Africa/Nairobi"
})}
</div>

<div class="divider"></div>

${itemsHtml}

<div class="divider"></div>

<div class="row">
Subtotal
<span>KES ${subtotal.toLocaleString()}</span>
</div>

${discountLine}

<div class="divider"></div>

<div class="total">
TOTAL KES ${data.total.toLocaleString()}
</div>

<div class="divider"></div>

<div class="footer">
Served by ${data.cashierName}
</div>

<div class="footer">
Karibu Tena!
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl">

        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Receipt</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-6 text-center">
          <img src={LOGO_URL} className="h-16 mx-auto mb-3"/>
          <h3 className="text-xl font-bold">Tropical Dreams</h3>
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
            className="flex-1 bg-[#4B3621] text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            {isPrinting ? "Printing..." : "Print"}
          </button>
        </div>

      </div>
    </div>
  );
};
