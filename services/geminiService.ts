
import { CartItem } from "../types";

/**
 * Generates a warm, tropical-themed thank you message.
 * No API key required.
 */
export const generateReceiptMessage = async (items: CartItem[], customerName: string = "Friend"): Promise<string> => {
  const messages = [
   "Celebrating the incredible women who brew your dreams today!",
    "Served with power and grace by the women of Tropical Dreams.",
    "Happy International Women's Day from our hardworking lady staff!",
    "Today we celebrate the strength and spirit of women in Lodwar!",
    "Empowered women, empowering your coffee experience. Asante sana!",
    "Cheers to the women who make Tropical Dreams special every day!"
  ];

  // Return a random message from the pool
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
