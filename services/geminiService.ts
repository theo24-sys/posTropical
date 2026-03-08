import { CartItem } from "../types";

export const generateReceiptMessage = async (
  items: CartItem[], 
  cashierName: string = "Staff",
  discountPercent: number = 0,
  discountAmount: number = 0,
  finalTotal: number = 0,
  orderId: string = ""
): Promise<string> => {

  // 24-hour check for International Women's Day
  const now = new Date();
  const isWomensDay = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit'
  }).format(now) === "08/03";

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
    "Brewed with love in Lodwar. Thank you for being a valued guest!"
  ];

  const pool = isWomensDay ? womensDayMessages : standardMessages;
  return pool[Math.floor(Math.random() * pool.length)];
};
