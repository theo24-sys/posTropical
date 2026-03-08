import { CartItem } from "../types";

/**
 * Generates a clean, professional plain-text receipt.
 * Includes automated 24-hour International Women's Day branding.
 */
export const generateReceiptMessage = async (
  items: CartItem[],
  cashierName: string = "Staff",
  discountPercent: number = 0,
  discountAmount: number = 0,
  finalTotal: number = 0,
  orderId: string = ""
): Promise<string> => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const displayId = orderId || Math.random().toString().slice(2, 8);
  
  // --- 24-HOUR WOMEN'S DAY CHECK (EAT) ---
  const now = new Date();
  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(now);
  
  const isWomensDay = eatDate === "08/03"; 

  const dateStr = now.toLocaleString('en-KE', { 
    timeZone: 'Africa/Nairobi',
    hour12: false
  });

  // Build the receipt string
  let receipt = `TROPICAL DREAMS\n`;
  receipt += `Coffee House - Lodwar\n`;
  receipt += `0748027790\n`;
  receipt += `---------------------------------------\n`;
  receipt += `*** OFFICIAL RECEIPT ***\n\n`;
  receipt += `Order #TD-${displayId}\n`;
  receipt += `Date: ${dateStr}\n`;
  receipt += `---------------------------------------\n\n`;

  // Item List with Column Alignment (39 chars wide)
  items.forEach(item => {
    const qtyName = `${item.quantity} × ${item.name}`;
    const price = `KES ${(item.price * item.quantity).toLocaleString()}`;
    receipt += qtyName.padEnd(28, ' ') + price.padStart(11, ' ') + `\n`;
  });

  receipt += `\n---------------------------------------\n`;
  
  // Totals Section
  receipt += `Subtotal:`.padEnd(28, ' ') + `KES ${subtotal.toLocaleString()}`.padStart(11, ' ') + `\n`;

  if (discountPercent > 0) {
    receipt += `Promo Discount (${discountPercent}%):`.padEnd(28, ' ') + `-KES ${discountAmount.toLocaleString()}`.padStart(11, ' ') + `\n`;
  }

  receipt += `\nTOTAL PAID`.padEnd(28, ' ') + `KES ${finalTotal.toLocaleString()}`.padStart(11, ' ') + `\n`;
  receipt += `---------------------------------------\n\n`;
  
  receipt += `Served by: ${cashierName}\n\n`;
  receipt += `"Asante sana! We hope your day is as\nbright as the Lodwar sun."\n\n`;
  receipt += `Karibu Tena!\n`;

  // --- AUTOMATED WOMEN'S DAY FOOTER ---
  if (isWomensDay) {
    receipt += `=======================================\n`;
    receipt += `*** HAPPY INTERNATIONAL WOMEN'S DAY ***\n`;
    receipt += `=======================================\n`;
  }

  return receipt.trim();
};
