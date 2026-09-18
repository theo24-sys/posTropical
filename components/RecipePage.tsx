import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, Clock, Search, X } from 'lucide-react';

interface Recipe {
  name: string;
  time?: string;
  ingredients: string[];
}

const RECIPES: Record<string, Recipe[]> = {
  Coffees: [
    { name: 'Espresso', time: '2 mins', ingredients: ['Single: 30ml espresso / 18g coffee', 'Double: 60ml espresso / 21g coffee', '21g ground coffee into portafilter; brew for 2 minutes.'] },
    { name: 'Americano', time: '2 mins', ingredients: ['Single: 30ml espresso + 190ml hot water', 'Double: 60ml espresso + 190ml hot water'] },
    { name: 'Cappuccino', time: '3 mins', ingredients: ['Single: 30ml espresso / 18g coffee / 220ml milk', 'Double: 60ml espresso / 21g coffee / 190ml milk'] },
    { name: 'Cafe Latte', time: '3 mins', ingredients: ['Single: 30ml espresso / 18g coffee / 220ml milk', 'Double: 60ml espresso / 21g coffee / 190ml milk'] },
    { name: 'Mocha', ingredients: ['Espresso: single 30ml / double 60ml', 'Chocolate: 2 teaspoons', 'Milk: single 220ml / double 190ml'] },
    { name: 'Latte Macchiato', time: '5 mins', ingredients: ['Espresso: single 30ml / double 60ml', 'Coffee: 18g / 21g', 'Milk: 180ml', 'Flavoured: add 15ml syrup at bottom of glass before other contents.'] },
    { name: 'Iced Coffee', time: '5 mins', ingredients: ['Espresso: single 30ml / double 60ml', 'Milk: 300ml', 'Ice cubes: 2 full scoops', 'Flavoured: add 15ml syrup into empty glass before other contents.'] },
    { name: 'Iced Mocha', time: '5 mins', ingredients: ['Espresso: single 30ml / double 60ml', 'Chocolate: 2 teaspoons', 'Milk: 300ml', 'Ice cubes: 2 full scoops'] },
    { name: 'Classic Matcha Latte', time: '5 mins', ingredients: ['Matcha: 2g', 'Milk: 300ml', 'Ice cubes: 2 scoops', 'Hot water: 30ml at 60°–80°', 'Flavoured matcha: add 15ml syrup.'] },
  ],
  Lemonades: [
    { name: 'Flavoured Strawberry Lemonade', time: '5 mins', ingredients: ['30ml lemon juice', '6 mint leaves', '200ml Sprite soda', '2.5 scoops ice', '30ml strawberry crush', '4 strawberry pieces', '4 lemon slices'] },
    { name: 'Mint Pinade', time: '3 mins', ingredients: ['8 mint leaves', '¼ pineapple slice', '10–30ml sugar syrup', '2 scoops ice', '300ml water'] },
    { name: 'Flavoured Kiwi Lemonade', time: '5 mins', ingredients: ['30ml lemon juice', '6 mint leaves', '200ml Sprite', '2.5 scoops ice', '30ml kiwi crush', '3 kiwi pieces + 2 lemon slices'] },
    { name: 'Flavoured Passion Lemonade', time: '5 mins', ingredients: ['50ml lemon juice', '8 mint leaves', '150ml Sprite', '2.5 scoops ice', '50ml passion juice', '30ml passion crush', '4 lemon slices'] },
    { name: 'Virgin Mojito', time: '5 mins', ingredients: ['8 mint leaves', '200ml Sprite', '4 lemon slices', '2.5 scoops ice'] },
    { name: 'Blue Lagoon', time: '5 mins', ingredients: ['45ml blue curacao syrup', '2.5 scoops ice', '30ml lemon juice', '250ml Sprite'] },
    { name: 'Virgin Sunrise', time: '5 mins', ingredients: ['3 orange pieces', '190ml passion juice', '3.5 scoops ice', '30ml grenadine', '2 orange pieces for garnish'] },
  ],
  Teas: [
    { name: 'African Tea', time: '5 mins', ingredients: ['Milk: 330ml', 'Tea leaves: 2 teaspoons'] },
    { name: 'Masala Tea', time: '5 mins', ingredients: ['Milk: 330ml', 'Masala: 1 teaspoon', 'Tea leaves: 2 teaspoons'] },
    { name: 'Dawa', ingredients: ['30ml lemon', '2 pieces ginger', '30ml natural honey', '1 teaspoon tea leaves', '400ml hot water'] },
    { name: 'Herbal Tea', time: '3 mins', ingredients: ['Boiled water: 300ml', '1 or 2 tea bags of hibiscus or peppermint'] },
    { name: 'African Milk Tea Pot', ingredients: ['2 cups tea water', 'Masala', '4 tablespoons tea leaves', 'Milk'] },
  ],
  Chocolate: [
    { name: 'Hot Chocolate', time: '5 mins', ingredients: ['2 teaspoons chocolate powder', '15ml chocolate syrup', 'Milk: 350ml'] },
  ],
  Shakes: [
    { name: 'Vanilla Shake', time: '3 mins', ingredients: ['3 scoops vanilla ice cream', '170ml cold milk', 'Sprinkles topping (2 × 85ml)'] },
    { name: 'Strawberry Shake', time: '3 mins', ingredients: ['3 scoops strawberry ice cream', '170ml cold milk'] },
    { name: 'Oreo Shake', time: '5 mins', ingredients: ['3 scoops ice cream', '170ml cold milk', '2 Oreo biscuits blended', '1 Oreo for topping'] },
    { name: 'Chocolate Shake', time: '3 mins', ingredients: ['2 scoops chocolate ice cream', '170ml cold milk', 'Sprinkles topping'] },
  ],
  Smoothies: [
    { name: 'Mango Crush Smoothie', time: '5 mins', ingredients: ['1 mango fruit', '2 scoops ice cubes', '300ml yoghurt'] },
    { name: 'Banana Buzz', time: '5 mins', ingredients: ['1 banana', '200ml yoghurt', '100ml chilled milk', '2 scoops ice'] },
    { name: 'TD’s Protein Smoothie', time: '5 mins', ingredients: ['1 banana', '2 tablespoons peanut butter', '2 scoops ice', '300ml yoghurt'] },
  ],
  Desserts: [
    { name: 'Classic Sundae', time: '2 mins', ingredients: ['3 scoops ice cream', '1 cookie or nuts for topping'] },
  ],
};

const CHEF_RECIPES: Record<string, Recipe[]> = {
  'Chicken & Fish': [
    { name: 'Chicken Curry 500g', time: '30 mins', ingredients: ['Chicken 500g, onion, 2 tomatoes, garlic 4, ginger', 'Curry powder, turmeric, oil 3 tbsp, water 200ml, coriander', 'Method: fry onion, garlic and ginger; brown chicken; add tomatoes and spices for 5 mins; add water and simmer 15 mins; thicken 10 mins.'] },
    { name: 'BBQ Roast Chicken 500g', time: '35–40 mins', ingredients: ['Chicken leg 500g, BBQ sauce 3 tbsp, oil 2 tbsp, garlic 3', 'Paprika, pepper, salt, lemon', 'Method: marinate 1 hour; roast at 200°C for 35–40 mins; baste every 15 mins; serve with fries and coleslaw.'] },
    { name: 'Spicy Chicken Tikka', time: '15–20 mins', ingredients: ['Chicken 500g cubes, yoghurt 100g, tikka masala 2 tbsp', 'Garlic, ginger, lemon, oil, chilli', 'Method: marinate in yoghurt and spices for 2 hours; skewer and grill 15–20 mins; serve with mint chutney.'] },
    { name: 'Grilled Fish Fillet 500g', time: '10 mins', ingredients: ['Fish fillet 500g, lemon, garlic 3, pepper, salt, paprika', 'Oil, butter', 'Method: marinate 30 mins; grill 4–5 mins per side; baste with butter.'] },
    { name: 'Whole Fish Tomato Sauce 500g', time: '20 mins', ingredients: ['Whole fish 500g, 3 blended tomatoes, onion, garlic, oil', 'Tomato paste, Royco', 'Method: fry fish lightly; fry onion, garlic and tomato puree; add fish and simmer 12 mins.'] },
    { name: 'Whole Fish Dry Fry 500g', time: '10 mins', ingredients: ['Whole fish 500g, garlic, ginger, lemon, salt, pepper, paprika', 'Oil, flour 2 tbsp', 'Method: score and marinate 30 mins; coat with flour; deep fry 8–10 mins until golden.'] },
    { name: 'Whole Fish Coconut Oil 500g', time: '12 mins', ingredients: ['Whole fish 500g, coconut oil 4 tbsp, garlic, ginger', 'Turmeric, salt, lime', 'Method: marinate with lime and garlic; fry in coconut oil for 10–12 mins.'] },
    { name: 'Grilled Chicken Breast 150g', time: '12–17 mins', ingredients: ['Chicken breasts 4 (600g), oil 3 tbsp, lemon, garlic 4', 'Paprika, pepper, salt, rosemary, honey', 'Method: marinate 30 mins–2 hours; grill 6–7 mins per side at 75°C; rest 5 mins and finish with butter garlic.'] },
    { name: 'Grilled Fillet Steak 250g', time: '15 mins', ingredients: ['Fillet 400g (2 × 200g), salt, pepper, garlic 2, rosemary', 'Butter 20g, oil 2 tbsp', 'Method: bring to room temperature 20 mins; season; sear in a hot pan 2–3 mins per side; butter baste 1 min; rest 5–7 mins.', 'Temperatures: rare 50°C, medium-rare 55°C, medium 60°C, well-done 70°C.'] },
  ],
  'Pasta, Burgers & Burritos': [
    { name: 'Spaghetti Bolognese 500g', time: '20 mins', ingredients: ['Spaghetti 250g, beef mince 250g, onion, garlic', '3 tomatoes, tomato paste, Italian herbs', 'Method: boil pasta; brown mince with onion and garlic; add tomatoes and simmer 15 mins; mix.'] },
    { name: 'Beef Burger 250g', time: '12 mins', ingredients: ['Beef mince 250g, bun, onion, tomato, lettuce, cheese', 'Salt, pepper, ketchup, mayonnaise', 'Method: season 250g patty; grill 5–6 mins per side; assemble in bun.'] },
    { name: 'Grilled Chicken Burger 250g', time: '15 mins', ingredients: ['Chicken breast 250g, bun, lettuce, tomato', 'Garlic powder, paprika, salt, pepper', 'Method: butterfly and season chicken; grill 6–7 mins per side; assemble.'] },
    { name: 'Beef Burrito 150g', time: '15 mins', ingredients: ['Tortilla, beef mince 150g, beans 80g, rice 80g', 'Cheese 30g, taco seasoning', 'Method: cook beef with seasoning; fill tortilla with rice, beans and cheese; roll and grill.'] },
    { name: 'Chicken Burrito 150g', time: '15 mins', ingredients: ['Tortilla, chicken 150g, rice 80g, beans 80g', 'Cheese, cumin', 'Method: sauté chicken; fill tortilla; roll and toast.'] },
    { name: 'Vegetable Burrito 150g', time: '15 mins', ingredients: ['Tortilla, mixed vegetables 150g, beans 80g, rice 80g', 'Cheese, guacamole', 'Method: stir-fry vegetables; assemble burrito; grill.'] },
    { name: 'Stir-Fried Beef 500g', time: '15 mins', ingredients: ['Beef 500g sliced, soy sauce 2 tbsp, oil 2 tbsp, garlic 3, ginger', 'Onion, bell pepper, pepper, oyster sauce', 'Method: marinate 10 mins; sear in hot wok in batches 2–3 mins; stir-fry vegetables 2 mins; combine.'] },
  ],
  Pizza: [
    { name: 'Margherita Pizza 250g', time: '10–12 mins', ingredients: ['Dough 150g, tomato sauce 50g, mozzarella 80g', 'Basil, olive oil', 'Method: roll to 7–8 inches; add sauce and cheese; bake at 220°C for 10–12 mins.'] },
    { name: 'BBQ Beef Pizza 250g', time: '12 mins', ingredients: ['Dough 150g, BBQ sauce 50g, beef 80g', 'Mozzarella 80g, onion', 'Method: add BBQ base, beef, cheese and onion; bake at 220°C for 12 mins.'] },
    { name: 'Chicken BBQ Pizza 250g', time: '12 mins', ingredients: ['Dough 150g, BBQ sauce, chicken 80g', 'Mozzarella 80g, capsicum', 'Method: assemble and bake at 220°C for 12 mins.'] },
    { name: 'Hawaiian Pizza 250g', time: '10–12 mins', ingredients: ['Dough 150g, tomato sauce, ham 50g, pineapple 50g', 'Mozzarella 80g', 'Method: top and bake at 220°C for 10–12 mins.'] },
    { name: 'Vegetable Pizza 250g', time: '12 mins', ingredients: ['Dough 150g, sauce 50g, mozzarella 80g', 'Bell pepper, onion and mushroom 80g', 'Method: sauté vegetables lightly; top pizza; bake for 12 mins.'] },
  ],
  'Bitings & Bakery': [
    { name: 'Chicken Nuggets 500g', time: '3–4 mins', ingredients: ['Chicken 500g minced, egg 1, flour 1 cup, breadcrumbs 1.5 cups', 'Garlic, paprika, Royco', 'Method: mince, season and shape 18–20g pieces; coat in flour, egg and breadcrumbs; fry at 170°C for 3–4 mins to 75°C.'] },
    { name: 'Breaded Fish Fingers 500g', time: '3–4 mins', ingredients: ['Fish 500g, flour 1 cup, eggs 2, breadcrumbs 1.5 cups', 'Garlic, paprika, salt, lemon', 'Method: cut into 3-inch pieces; marinate 10 mins; bread and fry at 170°C for 3–4 mins to 63°C.'] },
    { name: 'Chicken Nuggets 250g', time: '3–4 mins', ingredients: ['Chicken 250g, egg ½, flour ½ cup, breadcrumbs ¾ cup', 'Garlic, paprika, Royco', 'Method: shape 12–14 nuggets; double-coat for crunch; fry 3–4 mins.'] },
    { name: 'Fish Fingers 250g', time: '3–4 mins', ingredients: ['Fish 250g, flour ½ cup, egg 1, breadcrumbs ¾ cup', 'Garlic, paprika, lemon', 'Method: cut 8–10 fingers of 25g each; marinate, bread and fry 3–4 mins.'] },
    { name: 'Croissants 500g', time: '18–20 mins plus proofing', ingredients: ['Flour 500g, cold butter 300g, milk 150ml, water 150ml', 'Sugar 60g, salt 10g, yeast 7g', 'Method: knead and chill 1 hour; laminate 3 folds with 30-min chills; shape triangles; proof 1.5–2 hours; bake at 200°C for 18–20 mins.'] },
    { name: 'Cinnamon Rolls 500g', time: '20–25 mins plus proofing', ingredients: ['Flour 500g, milk 300ml, butter 80g + 60g', 'Sugar 80g + 100g brown, yeast 7g, cinnamon 2 tbsp, cream cheese icing', 'Method: knead and proof 1 hour; roll 40 × 30cm; spread filling; roll, cut 6–8; proof 45 mins; bake at 180°C for 20–25 mins; ice.'] },
  ],
};

const CATEGORY_STYLES: Record<string, string> = {
  Coffees: 'bg-[#ead9c3] text-[#6f4220]', Lemonades: 'bg-[#f6e3a3] text-[#72531a]', Teas: 'bg-[#dce8d3] text-[#406044]',
  Chocolate: 'bg-[#e7d0c1] text-[#704126]', Shakes: 'bg-[#f0d7d8] text-[#82454c]', Smoothies: 'bg-[#d5e5d5] text-[#356044]', Desserts: 'bg-[#ead7ea] text-[#73466f]',
  'Chicken & Fish': 'bg-[#f0d5c4] text-[#81421f]', 'Pasta, Burgers & Burritos': 'bg-[#e8d7c3] text-[#70451f]', Pizza: 'bg-[#f6dfb0] text-[#7a5219]', 'Bitings & Bakery': 'bg-[#e6d9c9] text-[#674a32]'
};

const RecipePage: React.FC = () => {
  const [recipeBook, setRecipeBook] = useState<'barista' | 'chef'>('barista');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);
  const recipeData = recipeBook === 'barista' ? RECIPES : CHEF_RECIPES;
  const categories = Object.keys(recipeData);
  const filtered = useMemo(() => categories.flatMap(category => recipeData[category].map(recipe => ({ ...recipe, category }))).filter(recipe =>
    (activeCategory === 'All' || recipe.category === activeCategory) &&
    `${recipe.name} ${recipe.category} ${recipe.ingredients.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  ), [activeCategory, query, recipeBook, recipeData]);

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8 bg-[#F5F4EF]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-7">
          <div>
            <div className="flex items-center gap-3 text-[#14b8a6] mb-2"><BookOpen size={22} /><span className="text-xs font-black uppercase tracking-[3px]">Kitchen handbook</span></div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#4B3621]">Recipes</h2>
            <p className="mt-2 text-sm text-[#8b7661] max-w-xl">A quick reference for consistent portions, preparation times, and service standards.</p>
          </div>
          <div className="text-left md:text-right"><p className="text-3xl font-black text-[#4B3621]">{filtered.length}</p><p className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">recipes shown</p></div>
        </div>
        <div className="inline-flex p-1.5 bg-white rounded-2xl border border-[#eadfd2] shadow-sm mb-5">
          {([['barista', 'Barista Recipes'], ['chef', 'Chef Recipes']] as const).map(([key, label]) => <button key={key} onClick={() => { setRecipeBook(key); setActiveCategory('All'); setOpenRecipe(null); }} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${recipeBook === key ? 'bg-[#4B3621] text-white shadow-md' : 'text-gray-400 hover:text-[#4B3621]'}`}>{label}</button>)}
        </div>
        <div className="relative mb-5 max-w-2xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search recipes, ingredients, or categories..." className="w-full pl-12 pr-11 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#14b8a6] focus:ring-4 focus:ring-teal-50 shadow-sm font-medium" />{query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#4B3621]"><X size={17} /></button>}</div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-hide">{['All', ...categories].map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeCategory === category ? 'bg-[#4B3621] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#d8c5af]'}`}>{category}</button>)}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
          {filtered.map(recipe => { const key = `${recipe.category}-${recipe.name}`; const isOpen = openRecipe === key; return <article key={key} className="bg-white rounded-[24px] border border-[#eadfd2] shadow-sm overflow-hidden hover:shadow-md transition-shadow"><button onClick={() => setOpenRecipe(isOpen ? null : key)} className="w-full text-left p-5"><div className="flex items-start justify-between gap-3"><div><span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${CATEGORY_STYLES[recipe.category]}`}>{recipe.category}</span><h3 className="mt-3 text-xl font-black text-[#4B3621]">{recipe.name}</h3></div><ChevronDown size={20} className={`mt-1 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></div><div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400"><Clock size={15} className="text-[#14b8a6]" /> {recipe.time || 'Follow standard preparation'} </div></button>{isOpen && <div className="border-t border-[#f0e8df] bg-[#fffaf5] px-5 py-4"><p className="text-[10px] font-black uppercase tracking-[2px] text-[#a1876e] mb-3">Ingredients & method</p><ul className="space-y-2">{recipe.ingredients.map((ingredient, index) => <li key={index} className="flex gap-2 text-sm leading-relaxed text-[#665344]"><span className="text-[#14b8a6] font-black">•</span><span>{ingredient}</span></li>)}</ul></div>}</article> })}
        </div>
        {filtered.length === 0 && <div className="bg-white rounded-[24px] p-12 text-center border border-gray-100"><BookOpen className="mx-auto text-gray-200 mb-3" size={42} /><p className="font-black text-[#4B3621]">No recipes found</p><p className="text-sm text-gray-400 mt-1">Try another recipe name or ingredient.</p></div>}
      </div>
    </main>
  );
};

export default RecipePage;
