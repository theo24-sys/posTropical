
import { CartItem } from "../types";

/**
 * Generates a warm, tropical-themed thank you message.
 * No API key required.
 */
export const generateReceiptMessage = async (items: CartItem[], customerName: string = "Friend"): Promise<string> => {
  const messages = [
    "Asante sana! We hope your day is as bright as the Lodwar sun.",
    "Karibu tena! Enjoy your tropical treat from Tropical Dreams.",
    "Thank you for visiting! Your support keeps our dreams brewing.",
    "Sending you tropical vibes and a huge thank you! See you soon.",
    "Brewed with love in Lodwar. Thank you for being a valued guest!",
    "Fresh flavors, warm smiles. Thank you for choosing Tropical Dreams!"
  ];

  // Return a random message from the pool
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
