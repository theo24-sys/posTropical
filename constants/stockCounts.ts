import { CountItem } from '../types';

// Seeded from "Chefs Inventory Main.docx" and
// "Waitress and Steward's Inventory.docx". Admin can extend/remove in the
// admin console once live; these are just the starting lists.
export const SEED_COUNT_ITEMS: CountItem[] = [
  ...[
    'Beef Sausages', 'Eggs', 'Bacon', 'Whole Fish', 'Fish Fillet',
    'Chicken Breast', 'Chicken Thighs', 'Chicken Wings', 'Fillet Steak 250g',
    'Stir Fried 200g', 'Burrito 150g', 'Burger Buns', 'Burger Mince',
    'Croissants', 'Cupcakes', 'Cake Slice', 'Burger Cheese', 'Mozzarella Cheese',
    'Wheat Flour', 'Maize Flour', 'Samosas', 'Water', 'Sparkling',
    'Water Refill', 'Banana', 'Pineapples', 'Mangoes', 'Apples', 'Oranges',
    'Peanut Butter', 'Nuts', 'Sprite', 'Yoghurt', 'Milk', 'Oreo',
    'Vanilla Ice Cream', 'Strawberry Ice Cream', 'Chocolate Ice Cream',
  ].map(n => makeChefItem(n, 'pcs')),

  // Barista's Inventory.docx — 46 bar items, counted with Received labels.
  ...[
    'Bananas', 'Passion', 'Watermelon', 'Pineapples', 'Mangoes', 'Oranges',
    'Apples', 'Beetroot', 'Kiwi', 'Lemon', 'Ginger', 'Mint', 'Strawberries',
    'Orange Juice', 'Peanut Butter', 'Nuts (Box)', 'Coconut Milk', 'Sprite',
    'Yoghurt', 'Oreo Biscuits', 'Cookies', 'Milk Pieces',
    'Strawberry Ice Cream', 'Vanilla Ice Cream', 'Chocolate Ice Cream',
    'Drinking Chocolate', 'Cocoa', 'Coffee', 'Grenadine', 'Blue Curacao',
    'Hazelnut', 'Vanilla Syrup', 'Caramel', 'Kiwi Crush', 'Passion Crush',
    'Strawberry Crush', 'Mango Crush', 'Matcha', 'Chocolate Sauce',
    'Strawberry Sauce', 'Fudge Sauce', 'Sugar', 'Tea Bags', 'Tea Leaves',
    'Water Refill', 'Whipping Cream',
  ].map(n => makeBarItem(n, 'pcs')),

  ...[
    'Water', 'Sparkling Water', 'Heinz Tomato Ketchup', 'Tabasco Chilli',
    'Serviettes', 'Maccane Sugar', 'Straws', 'Gloves', 'Tissue',
    'Kitchen Towel', 'Liquid Soap', 'Handwash', 'Hand Paper Towel',
    'Coffee Cups', 'Coffee Cups Lids', 'Coffee Cups Holders',
    'Juices/Shakes Cups', 'Juice/Shakes Lids', 'Carrier Bag 5',
    'Carrier Bag 8', 'Carrier Bag 10', '5x7 White Pouch', '7x9 White Pouch',
    'Small Take Away Plates', 'Big Take Away Plates', 'Burger Box',
    'Medium Pizza Boxes', 'Large Pizza Boxes', 'Sauce Take Away Tins',
  ].map(n => makeFrontItem(n, 'pcs')),
];

function makeBarItem(name: string, unit: string): CountItem {
  return {
    id: `bc-${slug(name)}`,
    name,
    unit,
    roles: ['Barista'],
    section: 'Bar',
    active: true,
  };
}

function makeChefItem(name: string, unit: string): CountItem {
  return {
    id: `kc-${slug(name)}`,
    name,
    unit,
    roles: ['Chef'],
    section: 'Kitchen',
    active: true,
  };
}

function makeFrontItem(name: string, unit: string): CountItem {
  return {
    id: `fc-${slug(name)}`,
    name,
    unit,
    roles: ['Waiter', 'Steward'],
    section: 'Front of House',
    active: true,
  };
}

export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
