
import { CartItem } from "../types";

/**
 * Generates a warm, tropical-themed thank you message.
 * No API key required.
 */
export const generateReceiptMessage = async (items: CartItem[], customerName: string = "Friend"): Promise<string> => {
  const messages = [
   "Celebrating the incredible women who brew your dreams today!",
    "Empowered women, empowering your coffee experience. Asante sana!",
  ];

  // Return a random message from the pool
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
