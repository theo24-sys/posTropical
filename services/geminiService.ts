import { CartItem } from "../types";

/**
 * Generates a clean, tropical-themed receipt text string.
 * Now includes discount if present.
 */
export const generateReceiptMessage = async (
  items: CartItem[],
  customerName: string = "Friend",
  discountPercent: number = 0,
  discountAmount: number = 0,
  finalTotal: number = 0
): Promise<string> => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const receiptText = `
Tropical Dreams
Coffee House - Lodwar
0748027790

*** OFFICIAL RECEIPT ***

Order #${Math.random().toString().slice(2, 8)}  // Replace with real ID in App.tsx if needed
Served by: ${customerName}
${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}

---------------------------------------

${items.map(item => `${item.quantity} × ${item.name}                  KES ${(item.price * item.quantity).toLocaleString()}`).join('\n')}

${discountPercent > 0 ? `
Promo Discount (${discountPercent}%)          -KES ${discountAmount.toLocaleString()}
` : ''}

---------------------------------------
TOTAL PAID
KES ${finalTotal.toLocaleString()}

---------------------------------------
Served by: ${customerName}
"Asante sana! We hope your day is as bright as the Lodwar sun."
Karibu Tena!
  `;

  return receiptText.trim();
};
