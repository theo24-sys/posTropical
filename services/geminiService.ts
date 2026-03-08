import { CartItem } from "../types";

/**
 * Generates a clean, professional receipt text string.
 * This version removes the repeated/messy middle block.
 */
export const generateReceiptMessage = async (
  items: CartItem[],
  cashierName: string = "Staff",
  discountPercent: number = 0,
  discountAmount: number = 0,
  finalTotal: number = 0,
  orderId: string = "" // Pass the real transaction ID here
): Promise<string> => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const displayId = orderId || Math.random().toString().slice(2, 8);
  const dateStr = new Date().toLocaleString('en-KE', { 
    timeZone: 'Africa/Nairobi',
    hour12: false
  });

  // Start building the string
  let receipt = `Tropical Dreams\n`;
  receipt += `Coffee House - Lodwar\n`;
  receipt += `0748027790\n`;
  receipt += `---------------------------------------\n`;
  receipt += `*** OFFICIAL RECEIPT ***\n\n`;
  receipt += `Order #TD-${displayId}\n`;
  receipt += `${dateStr}\n`;
  receipt += `---------------------------------------\n\n`;

  // Item List with Column Alignment
  items.forEach(item => {
    const qtyName = `${item.quantity} × ${item.name}`;
    const price = `KES ${(item.price * item.quantity).toLocaleString()}`;
    // Fills space between name and price to keep the right side straight
    receipt += qtyName.padEnd(28, ' ') + price.padStart(11, ' ') + `\n`;
  });

  receipt += `\n---------------------------------------\n`;
  
  // Totals Section
  const labelSub = `Subtotal:`;
  const valSub = `KES ${subtotal.toLocaleString()}`;
  receipt += labelSub.padEnd(28, ' ') + valSub.padStart(11, ' ') + `\n`;

  if (discountPercent > 0) {
    const labelDisc = `Promo Discount (${discountPercent}%):`;
    const valDisc = `-KES ${discountAmount.toLocaleString()}`;
    receipt += labelDisc.padEnd(28, ' ') + valDisc.padStart(11, ' ') + `\n`;
  }

  receipt += `\nTOTAL PAID`.padEnd(28, ' ') + `KES ${finalTotal.toLocaleString()}`.padStart(11, ' ') + `\n`;
  receipt += `---------------------------------------\n\n`;
  
  receipt += `Served by: ${cashierName}\n\n`;
  receipt += `"Asante sana! We hope your day is as\nbright as the Lodwar sun."\n\n`;
  receipt += `Karibu Tena!`;

  return receipt.trim();
};
