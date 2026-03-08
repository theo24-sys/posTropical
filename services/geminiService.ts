import { CartItem } from "../types";

/**
 * Generates a clean, tropical-themed receipt text string.
 */
export const generateReceiptMessage = async (
  items: CartItem[],
  cashierName: string = "Staff",
  discountPercent: number = 0,
  discountAmount: number = 0,
  finalTotal: number = 0
): Promise<string> => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderId = Math.random().toString().slice(2, 8);
  const dateStr = new Date().toLocaleString('en-KE', { 
    timeZone: 'Africa/Nairobi',
    dateStyle: 'short',
    timeStyle: 'short'
  });

  return `
Tropical Dreams Coffee House
Lodwar | 0748027790
---------------------------------------
*** OFFICIAL RECEIPT ***
Order: #TD-${orderId}
Date: ${dateStr}
Served by: ${cashierName}
---------------------------------------
${items.map(item => {
  const line = `${item.quantity} x ${item.name}`;
  const price = `KES ${(item.price * item.quantity).toLocaleString()}`;
  // This pads the space between name and price
  return line.padEnd(28, ' ') + price.padStart(11, ' ');
}).join('\n')}

Subtotal:                   KES ${subtotal.toLocaleString()}
${discountPercent > 0 ? `Promo (${discountPercent}%):            -KES ${discountAmount.toLocaleString()}` : ''}
---------------------------------------
TOTAL PAID:                 KES ${finalTotal.toLocaleString()}
---------------------------------------

"Asante sana! We hope your day is as 
bright as the Lodwar sun."

Karibu Tena!
`.trim();
};
