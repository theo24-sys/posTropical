-- TDs July Menu Update
-- Clears existing menu items and inserts the new July menu

DELETE FROM public.menu_items;

INSERT INTO public.menu_items (id, name, price, category, description, stock, low_stock_threshold, image) VALUES

-- BREAKFAST
('bf_full', 'TDs Full Breakfast', 1100, 'BREAKFAST', 'Two eggs (fried/poached/scrambled), toast/pancake, home fries, baked beans, choice of beef sausage/bacon. Served with coffee, tea or juice + fruit.', 50, 10, 'https://images.unsplash.com/photo-1544517175-98e4cc2b461b?auto=format&fit=crop&w=600&q=80'),
('bf_pan_combo', 'Pancakes Combo', 950, 'BREAKFAST', 'Three medium pancakes, 2 beef sausages, fresh fruit, hot beverage or juice.', 50, 10, 'https://images.unsplash.com/photo-1528198622811-0842b4e54791?auto=format&fit=crop&w=600&q=80'),
('bf_waf', 'Classic Waffles', 800, 'BREAKFAST', 'Two waffles with 2 beef sausages and 2 eggs (scrambled/fried/poached).', 50, 10, 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80'),
('bf_extras', 'Extras (Breakfast)', 200, 'BREAKFAST', 'Baked Beans, Toast, Fried Eggs, Bacon (+100 = 300), Beef Sausages, Home Fries, Sautéed Vegetables', 100, 20, 'https://images.unsplash.com/photo-1598511796318-7b825662bbf6?auto=format&fit=crop&w=600&q=80'),

-- COFFEE BAR (DOUBLE)
('cf_esp_s', 'Espresso Single Shot', 200, 'COFFEE (DOUBLE)', 'Bold, concentrated single shot.', 500, 50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80'),
('cf_amer', 'Americano', 250, 'COFFEE (DOUBLE)', 'Espresso diluted with hot water.', 500, 50, 'https://images.unsplash.com/photo-1551030173-122f525e675f?auto=format&fit=crop&w=600&q=80'),
('cf_cap', 'Cappuccino', 300, 'COFFEE (DOUBLE)', 'Espresso, steamed milk, milk foam.', 500, 50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80'),
('cf_lat', 'Café Latte', 400, 'COFFEE (DOUBLE)', 'Espresso and steamed milk with light foam.', 500, 50, 'https://images.unsplash.com/photo-1556484687-30636164638a?auto=format&fit=crop&w=600&q=80'),
('cf_moc', 'Mocha', 400, 'COFFEE (DOUBLE)', 'Espresso, chocolate, steamed milk.', 200, 20, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80'),
('cf_latmac', 'Latte Macchiato', 400, 'COFFEE (DOUBLE)', 'Steamed milk layered with espresso and foam.', 200, 20, 'https://images.unsplash.com/photo-1593443320739-97f8732d4a38?auto=format&fit=crop&w=600&q=80'),
('cf_flavmac', 'Flavored Latte Macchiato', 450, 'COFFEE (DOUBLE)', 'Latte Macchiato with Caramel, Hazelnut, or Vanilla syrup.', 200, 20, 'https://images.unsplash.com/photo-1485808191679-5f8c7c8f31e7?auto=format&fit=crop&w=600&q=80'),

-- TEAS
('cf_hotc', 'Hot Chocolate', 300, 'TEAS', 'Premium cocoa and steamed milk.', 200, 30, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80'),
('t_afrmas', 'African/Masala Tea', 250, 'TEAS', 'Black tea simmered with milk and aromatic spices.', 500, 50, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600&q=80'),
('t_pot', 'Tea Pot/Masala', 450, 'TEAS', 'A full pot of freshly brewed premium tea.', 50, 10, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'),
('t_herb', 'Herbal Tea', 250, 'TEAS', 'Green/Ginger/Lemon/Hibiscus/Peppermint', 100, 10, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80'),
('t_dawa', 'Dawa', 300, 'TEAS', 'Lemon, ginger, and natural honey.', 100, 10, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80'),

-- SOFT DRINKS
('sd_wat', 'Water - Keringet 1L', 200, 'SOFT DRINKS', 'Still mineral water.', 100, 20, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80'),
('sd_spark', 'Sparkling Water 500ML', 150, 'SOFT DRINKS', 'Chilled carbonated mineral water.', 100, 20, 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?auto=format&fit=crop&w=600&q=80'),
('sd_spark1', 'Sparkling Water 1L', 250, 'SOFT DRINKS', 'Chilled carbonated mineral water.', 100, 20, 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?auto=format&fit=crop&w=600&q=80'),

-- ICED COFFEE
('ice_cof', 'Iced Coffee', 300, 'ICED COFFEE', 'Chilled coffee served over ice.', 50, 10, 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80'),
('ice_lat', 'Iced Latte', 400, 'ICED COFFEE', 'Espresso and chilled milk over ice.', 50, 10, 'https://images.unsplash.com/photo-1553909489-cd47e3b4430f?auto=format&fit=crop&w=600&q=80'),
('ice_flav', 'Iced Vanilla/Caramel/Hazelnut Latte', 450, 'ICED COFFEE', 'Iced latte with Vanilla, Caramel, or Hazelnut syrup.', 50, 10, 'https://images.unsplash.com/photo-1461023058943-48dbf1399f98?auto=format&fit=crop&w=600&q=80'),
('ice_moc', 'Iced Mocha', 450, 'ICED COFFEE', 'Espresso, chocolate, chilled milk over ice.', 50, 10, 'https://images.unsplash.com/photo-1499377193864-82682aefed04?auto=format&fit=crop&w=600&q=80'),
('ice_mat_cla', 'Classic Iced Matcha Latte', 450, 'ICED COFFEE', 'Cold milk blended with premium matcha over ice.', 50, 10, 'https://images.unsplash.com/photo-1536555198118-21915ea621fa?auto=format&fit=crop&w=600&q=80'),
('ice_mat_frap', 'Mango/Strawberry Matcha Latte', 500, 'ICED COFFEE', 'Matcha latte with fresh mango or strawberry.', 50, 10, 'https://images.unsplash.com/photo-1536555198118-21915ea621fa?auto=format&fit=crop&w=600&q=80'),

-- SHAKES
('sh_flav', 'Vanilla/Strawberry/Chocolate Shake', 450, 'SHAKES', 'Ice-cream flavors blended with chilled milk.', 40, 10, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80'),
('sh_ore', 'Oreo Shake', 500, 'SHAKES', 'Crushed Oreo cookies, vanilla ice cream, chilled milk.', 40, 10, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80'),
('sh_esp', 'Espresso Shake', 500, 'SHAKES', 'Espresso, vanilla ice cream, chilled milk.', 40, 10, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'),

-- SMOOTHIES
('sm_man', 'Mango Crush Smoothie', 400, 'SMOOTHIES', 'Ripe mangoes, yoghurt, and ice.', 30, 5, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80'),
('sm_ban', 'Banana Buzz', 400, 'SMOOTHIES', 'Ripe bananas, yoghurt, chilled milk.', 30, 5, 'https://images.unsplash.com/photo-1619684617498-8aa07d6d7a46?auto=format&fit=crop&w=600&q=80'),
('sm_coffee', 'Creamy Coffee Smoothie', 500, 'SMOOTHIES', 'Espresso, creamy milk, and ice.', 30, 5, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'),
('sm_pro', 'TDs Protein Smoothie', 500, 'SMOOTHIES', 'Peanut Butter Banana blend.', 30, 5, 'https://images.unsplash.com/photo-1598284912132-3ca1f3151d89?auto=format&fit=crop&w=600&q=80'),

-- FRESH JUICES
('ju_mint', 'Mint Pineapple', 350, 'FRESH JUICES', 'Pineapple and fresh mint, chilled.', 30, 5, 'https://images.unsplash.com/photo-1536980630732-c7247a83d719?auto=format&fit=crop&w=600&q=80'),
('ju_man', 'Mango', 300, 'FRESH JUICES', 'Ripe juicy mangoes, chilled.', 50, 10, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80'),
('ju_pas', 'Passion', 350, 'FRESH JUICES', 'Fresh passion fruit, chilled.', 50, 10, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80'),
('ju_beet', 'Beetroot', 350, 'FRESH JUICES', 'Fresh beetroot juice packed with nutrients.', 30, 5, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'),
('ju_trop', 'Tropical Juice', 400, 'FRESH JUICES', 'Mango, Passion, Beetroot (max 3).', 40, 5, 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80'),

-- LEMONADES
('lem_straw', 'Flavored Strawberry Lemonade', 450, 'LEMONADES', 'Ripe strawberry and lemon.', 30, 5, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
('lem_kiwi', 'Flavored Kiwi Lemonade', 450, 'LEMONADES', 'Citrusy kiwi and lemonade.', 30, 5, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
('lem_pass', 'Flavored Passion Lemonade', 450, 'LEMONADES', 'Passion fruit and lemonade.', 30, 5, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),

-- MOCKTAILS
('moc_moj', 'Virgin Mojito', 350, 'MOCKTAILS', 'Mint, lime, and soda water over ice.', 30, 5, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32d?auto=format&fit=crop&w=600&q=80'),
('moc_blue', 'Blue Lagoon', 400, 'MOCKTAILS', 'Citrus and lemonade blend.', 30, 5, 'https://images.unsplash.com/photo-1536935338213-94c41263ef3b?auto=format&fit=crop&w=600&q=80'),
('moc_sun', 'Virgin Sunrise', 400, 'MOCKTAILS', 'Orange juice and grenadine, layered.', 30, 5, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80'),

-- BITINGS
('bit_sam', 'Beef Samosa (2 Pieces)', 200, 'BITINGS', 'Crispy, filled with seasoned minced beef and spices.', 100, 20, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
('bit_saus', 'Sausages (2 Pieces)', 200, 'BITINGS', 'Juicy fried sausages with dipping sauce.', 100, 20, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
('bit_w8', 'TDs Chicken Wings (8 Pieces)', 1000, 'BITINGS', 'BBQ, Honey/Garlic, or Sweet Chili sauce, sesame seeds.', 30, 10, 'https://images.unsplash.com/photo-1527477396000-64ca9c00173f?auto=format&fit=crop&w=600&q=80'),
('bit_nug', 'Chicken Nuggets', 600, 'BITINGS', 'Seasoned breadcrumb-coated chicken bites.', 30, 5, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'),
('bit_fish', 'Breaded Fish Fingers', 900, 'BITINGS', 'Crispy fish strips with tartar sauce, salad, and choice of side.', 20, 5, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80'),

-- BAKERY & PASTRIES
('bk_lemon', 'Lemon Cake Slice', 400, 'BAKERY & PASTRIES', 'Moist vanilla sponge with lemon glaze.', 12, 4, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80'),
('bk_for', 'Black Forest Cake', 400, 'BAKERY & PASTRIES', 'Chocolate sponge, whipped cream, chocolate flakes.', 12, 4, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'),
('bk_croissant', 'Croissants', 250, 'BAKERY & PASTRIES', 'Freshly baked, buttery, flaky pastry.', 20, 5, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'),
('bk_cinnamon', 'Cinnamon Roll (Pair)', 250, 'BAKERY & PASTRIES', 'Soft pastry rolled with cinnamon sugar.', 20, 5, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80'),
('bk_cupcake', 'Cupcakes (Pair)', 100, 'BAKERY & PASTRIES', 'Soft, moist mini cakes.', 20, 5, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80'),

-- MAIN COURSES - BEEF
('mn_fil', 'Grilled Fillet Steak', 1000, 'MAIN COURSES', 'Herb-seasoned beef fillet, flame-grilled. Rare/Medium/Well-done.', 15, 5, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80'),
('mn_sbeef', 'Stir Fried Beef', 950, 'MAIN COURSES', 'Beef strips with onions, peppers, garlic, soy-based sauce.', 20, 5, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80'),

-- MAIN COURSES - CHICKEN
('mn_gbreast', 'Grilled Chicken Breast', 1000, 'MAIN COURSES', 'Herb, garlic, and lemon marinated, grilled.', 20, 5, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'),
('mn_ccur_sp', 'TDs Special Chicken Curry', 900, 'MAIN COURSES', 'Chicken simmered in aromatic curry sauce.', 20, 5, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'),
('mn_bbq', 'BBQ Roast Chicken', 950, 'MAIN COURSES', 'Oven-roasted, smoky BBQ glaze.', 20, 5, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80'),
('mn_ctik', 'Spicy Chicken Tikka', 900, 'MAIN COURSES', 'Yogurt and tikka-spice marinated, grilled. Served with salad.', 20, 5, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80'),

-- SIDES
('sd_mash', 'Mashed Potatoes', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'),
('sd_fries', 'Fries', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=600&q=80'),
('sd_rice', 'Rice', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80'),
('sd_chap', 'Chapati', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80'),
('sd_ugali', 'Ugali', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80'),
('sd_vrice', 'Vegetable Rice', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'),
('sd_saute', 'Sauteed Vegetables', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'),

-- BURGERS / BURRITOS
('bg_beef', 'Beef Burger', 800, 'BURGERS / BURRITOS & SANDWICHES', 'Grilled beef patty, lettuce, tomato, onions, cheese, house sauce.', 30, 5, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'),
('bg_chick', 'Chicken Burger', 800, 'BURGERS / BURRITOS & SANDWICHES', 'Crispy or grilled chicken fillet, lettuce, tomato, onions, cheese.', 30, 5, 'https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=600&q=80'),
('bur_beef', 'Beef Burrito', 800, 'BURGERS / BURRITOS & SANDWICHES', 'Seasoned beef, rice, vegetables, cheese, salsa.', 20, 5, 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80'),
('bur_chick', 'Chicken Burrito', 800, 'BURGERS / BURRITOS & SANDWICHES', 'Grilled chicken, rice, vegetables, cheese, house sauce.', 20, 5, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80'),
('bur_veg', 'Vegetable Burrito', 600, 'BURGERS / BURRITOS & SANDWICHES', 'Sauteed vegetables, sweetcorn, rice, fresh salsa.', 20, 5, 'https://images.unsplash.com/photo-1511285229362-bf5a3717208d?auto=format&fit=crop&w=600&q=80'),
('bg_extras', 'Cheese/Bacon', 300, 'BURGERS / BURRITOS & SANDWICHES', 'Add cheese or bacon to any burger/burrito.', 50, 10, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'),

-- PIZZA
('pz_margherita_m', 'Margherita Pizza (Medium)', 1300, 'PIZZA', 'Tomato sauce, mozzarella cheese, fresh herbs.', 20, 5, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'),
('pz_margherita_l', 'Margherita Pizza (Large)', 1600, 'PIZZA', 'Tomato sauce, mozzarella cheese, fresh herbs.', 20, 5, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'),
('pz_bbq_beef_m', 'BBQ Beef Pizza (Medium)', 1300, 'PIZZA', 'Pizza sauce, mozzarella, BBQ beef strips, onions, herbs.', 20, 5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'),
('pz_bbq_beef_l', 'BBQ Beef Pizza (Large)', 1600, 'PIZZA', 'Pizza sauce, mozzarella, BBQ beef strips, onions, herbs.', 20, 5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'),
('pz_bbq_chick_m', 'BBQ Chicken Pizza (Medium)', 1300, 'PIZZA', 'Pizza sauce, mozzarella, grilled chicken, onions, BBQ sauce.', 20, 5, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'),
('pz_bbq_chick_l', 'BBQ Chicken Pizza (Large)', 1600, 'PIZZA', 'Pizza sauce, mozzarella, grilled chicken, onions, BBQ sauce.', 20, 5, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'),
('pz_hawaiian_m', 'Hawaiian Pizza (Medium)', 1300, 'PIZZA', 'Pizza sauce, mozzarella, chicken or beef, pineapple chunks.', 20, 5, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80'),
('pz_hawaiian_l', 'Hawaiian Pizza (Large)', 1600, 'PIZZA', 'Pizza sauce, mozzarella, chicken or beef, pineapple chunks.', 20, 5, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80'),
('pz_veg_m', 'Vegetable Pizza (Medium)', 1300, 'PIZZA', 'Pizza sauce, mozzarella, onions, bell peppers, sweetcorn.', 20, 5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'),
('pz_veg_l', 'Vegetable Pizza (Large)', 1600, 'PIZZA', 'Pizza sauce, mozzarella, onions, bell peppers, sweetcorn.', 20, 5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'),

-- DESSERTS
('dst_ban', 'Banana Split', 550, 'DESSERTS', '3 scoops ice cream, split banana, sundae sauce, nuts.', 15, 5, 'https://images.unsplash.com/photo-1567324216289-97c6c1e44894?auto=format&fit=crop&w=600&q=80'),
('dst_sun', 'Classic Sundae', 500, 'DESSERTS', '3 scoops ice cream, topped with nuts/cookies.', 15, 4, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80'),
('dst_fruit', 'Signature TDs Fruit Salad', 500, 'DESSERTS', 'Served with yoghurt, honey, and nuts.', 30, 5, 'https://images.unsplash.com/photo-1490474504059-bf6eb9dae980?auto=format&fit=crop&w=600&q=80');
