import { CartItem } from "../types";

/**
 * Generates a warm, tropical-themed thank you message.
 * Updated to accept 6 arguments to match App.tsx calls and resolve TS2554.
 */
export const generateReceiptMessage = async (
  items: CartItem[], 
  cashierName: string = "Staff",
  discountPercent: number = 0,
  discountAmount: number = 0,
  finalTotal: number = 0,
  orderId: string = ""
): Promise<string> => {

  // --- 24-HOUR WOMEN'S DAY CHECK (EAT) ---
  const now = new Date();
  const eatDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(now);
  
  const isWomensDay = eatDate === "08/03"; 

  const womensDayMessages = [
    "Celebrating the incredible women who brew your dreams today!",
    "Served with power and grace by the women of Tropical Dreams.",
    "Happy International Women's Day from our hardworking lady staff!",
    "Today we celebrate the strength and spirit of women in Lodwar!",
    "Empowered women, empowering your coffee experience. Asante sana!"
  ];

  const standardMessages = [
    "Asante sana! We hope your day is as bright as the Lodwar sun.",
    "Karibu tena! Enjoy your tropical treat from Tropical Dreams.",
    "Thank you for visiting! Your support keeps our dreams brewing.",
    "Brewed with love in Lodwar. Thank you for being a valued guest!"
  ];

  // Logic to select the right message pool
  const messages = isWomensDay ? womensDayMessages : standardMessages;

  // Return a random message from the selected pool
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
