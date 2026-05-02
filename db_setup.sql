-- Clear existing menu items first to avoid duplicates
DELETE FROM public.menu_items;

-- Insert all menu items from the new updated menu
INSERT INTO public.menu_items (id, name, price, category, description, stock, low_stock_threshold, image) VALUES

-- BREAKFAST
('bf_full', 'TDs Full Breakfast', 900, 'BREAKFAST', 'Two eggs with toast, home fries, baked beans, choice of bacon/sausage. Served with coffee, tea or juice.', 50, 10, 'https://images.unsplash.com/photo-1544517175-98e4cc2b461b?auto=format&fit=crop&w=600&q=80'),
('bf_combo', 'TDs Breakfast Combo', 1050, 'BREAKFAST', 'Coffee/Tea, Two Eggs, Sausage/Bacon, home fries, pancake/Toast, Grilled tomatoes, fresh fruits/Juice', 40, 10, 'https://images.unsplash.com/photo-1533089862017-5614a9579cf4?auto=format&fit=crop&w=600&q=80'),
('bf_pan_combo', 'Pancakes Combo', 950, 'BREAKFAST', 'Three medium pancakes, beef sausage, freshly cut fruit and hot beverage or juice.', 50, 10, 'https://images.unsplash.com/photo-1528198622811-0842b4e54791?auto=format&fit=crop&w=600&q=80'),
('bf_fr_combo', 'French Toast Combo', 800, 'BREAKFAST', 'French toast, two scrambled eggs, hot beverage or juice, 2 beef sausages.', 40, 10, 'https://images.unsplash.com/photo-1639744186596-3c224328222f?auto=format&fit=crop&w=600&q=80'),
('bf_waf', 'Classic Waffles', 750, 'BREAKFAST', 'Two waffles, served with bacon or sausages and 2 eggs (scrambled/fried/omelet)', 50, 10, 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80'),
('bf_span', 'Spanish Omelette', 300, 'BREAKFAST', 'Eggs, Bell Pepper, Onions, Tomatoes', 50, 10, 'https://images.unsplash.com/photo-1510629954389-c1e0da47d4ec?auto=format&fit=crop&w=600&q=80'),
('bf_extras', 'Extras (Breakfast)', 200, 'BREAKFAST', 'Baked Beans, Toast, Fried Eggs, Bacon, Beef Sausages, Home Fries, Sautéed Vegetables', 100, 20, 'https://images.unsplash.com/photo-1598511796318-7b825662bbf6?auto=format&fit=crop&w=600&q=80'),

-- COFFEE BAR (COFFEE (DOUBLE))
('cf_esp_s', 'Espresso (Single)', 200, 'COFFEE (DOUBLE)', '', 500, 50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80'),
('cf_cap', 'Cappuccino', 300, 'COFFEE (DOUBLE)', '', 500, 50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80'),
('cf_amer', 'Americano', 250, 'COFFEE (DOUBLE)', '', 500, 50, 'https://images.unsplash.com/photo-1551030173-122f525e675f?auto=format&fit=crop&w=600&q=80'),
('cf_lat', 'Café Latte', 400, 'COFFEE (DOUBLE)', '', 500, 50, 'https://images.unsplash.com/photo-1556484687-30636164638a?auto=format&fit=crop&w=600&q=80'),
('cf_moc', 'Mocha', 450, 'COFFEE (DOUBLE)', '', 200, 20, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80'),
('cf_latmac', 'Latte Macchiato', 400, 'COFFEE (DOUBLE)', '', 200, 20, 'https://images.unsplash.com/photo-1593443320739-97f8732d4a38?auto=format&fit=crop&w=600&q=80'),
('cf_carmac', 'Caramel Macchiato', 450, 'COFFEE (DOUBLE)', '', 200, 20, 'https://images.unsplash.com/photo-1485808191679-5f8c7c8f31e7?auto=format&fit=crop&w=600&q=80'),

-- TEAS
('cf_hotc', 'Hot Chocolate', 300, 'TEAS', '', 200, 30, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80'),
('t_afr', 'African Tea', 200, 'TEAS', '', 500, 50, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600&q=80'),
('t_mas', 'Masala Tea', 250, 'TEAS', '', 200, 20, 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=600&q=80'),
('t_pot', 'Tea Pot', 400, 'TEAS', '', 50, 10, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'),
('t_maspot', 'Masala Tea Pot', 450, 'TEAS', '', 50, 10, 'https://images.unsplash.com/photo-1596710629170-16e93229370d?auto=format&fit=crop&w=600&q=80'),
('t_herb', 'Herbal Tea', 200, 'TEAS', 'Green/Chamomile/Lemon/Hibiscus/Peppermint', 100, 10, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80'),
('t_dawa', 'Dawa', 300, 'TEAS', '', 100, 10, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80'),

-- SOFT DRINKS
('sd_wat', 'Water - Keringet 1L', 150, 'SOFT DRINKS', '', 100, 20, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80'),
('sd_spark', 'Sparkling Water', 150, 'SOFT DRINKS', '', 100, 20, 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?auto=format&fit=crop&w=600&q=80'),

-- ICED COFFEE
('ice_cof', 'Iced Coffee', 350, 'ICED COFFEE', '', 50, 10, 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80'),
('ice_lat', 'Iced Latte', 400, 'ICED COFFEE', '', 50, 10, 'https://images.unsplash.com/photo-1553909489-cd47e3b4430f?auto=format&fit=crop&w=600&q=80'),
('ice_moc', 'Iced Mocha', 450, 'ICED COFFEE', '', 50, 10, 'https://images.unsplash.com/photo-1499377193864-82682aefed04?auto=format&fit=crop&w=600&q=80'),
('ice_van', 'Iced Vanilla Latte', 450, 'ICED COFFEE', '', 50, 10, 'https://images.unsplash.com/photo-1461023058943-48dbf1399f98?auto=format&fit=crop&w=600&q=80'),
('ice_car', 'Iced Caramel Latte', 450, 'ICED COFFEE', '', 50, 10, 'https://images.unsplash.com/photo-1574914569527-38e9c9c855a0?auto=format&fit=crop&w=600&q=80'),
('ice_haz', 'Iced Hazelnut Latte', 450, 'ICED COFFEE', '', 50, 10, 'https://images.unsplash.com/photo-1629899321523-a1288219c623?auto=format&fit=crop&w=600&q=80'),

-- SHAKES
('sh_mnt', 'Mint Shake', 550, 'SHAKES', '', 40, 10, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80'),
('sh_van', 'Vanilla Shake', 450, 'SHAKES', '', 40, 10, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80'),
('sh_str', 'Strawberry Shake', 450, 'SHAKES', '', 40, 10, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80'),
('sh_chc', 'Chocolate Shake', 450, 'SHAKES', '', 40, 10, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80'),
('sh_ore', 'Oreo Shake', 500, 'SHAKES', '', 40, 10, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80'),
('sh_esp', 'Espresso Shake', 500, 'SHAKES', '', 40, 10, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'),

-- SMOOTHIES
('sm_trop', 'Tropical Blend Smoothie', 500, 'SMOOTHIES', '', 30, 5, 'https://images.unsplash.com/photo-1618557219665-350711912952?auto=format&fit=crop&w=600&q=80'),
('sm_man', 'Mango Crush Smoothie', 400, 'SMOOTHIES', '', 30, 5, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80'),
('sm_ban', 'Banana Bash', 400, 'SMOOTHIES', '', 30, 5, 'https://images.unsplash.com/photo-1619684617498-8aa07d6d7a46?auto=format&fit=crop&w=600&q=80'),
('sm_pro', 'TDs Protein Smoothie', 500, 'SMOOTHIES', 'Peanut Butter Banana', 30, 5, 'https://images.unsplash.com/photo-1598284912132-3ca1f3151d89?auto=format&fit=crop&w=600&q=80'),

-- FRESH JUICES
('ju_mint', 'Minty Pinade', 350, 'FRESH JUICES', '', 30, 5, 'https://images.unsplash.com/photo-1536980630732-c7247a83d719?auto=format&fit=crop&w=600&q=80'),
('ju_man', 'Mango', 300, 'FRESH JUICES', '', 50, 10, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80'),
('ju_pas', 'Passion', 350, 'FRESH JUICES', '', 50, 10, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80'),
('ju_beet', 'Beetroot', 350, 'FRESH JUICES', '', 30, 5, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'),
('ju_trop', 'Tropical Juice', 400, 'FRESH JUICES', 'Mango, Passion, Beetroot (Max 3)', 40, 5, 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80'),

-- LEMONADES
('lem_flav', 'Flavored Lemonades', 400, 'LEMONADES', 'Strawberry/Kiwi/Passion', 30, 5, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),

-- MOCKTAILS
('moc_moj', 'Virgin Mojito', 350, 'MOCKTAILS', '', 30, 5, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32d?auto=format&fit=crop&w=600&q=80'),
('moc_rain', 'Rainbow Paradise', 500, 'MOCKTAILS', '', 30, 5, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
('moc_sun', 'Sunrise', 450, 'MOCKTAILS', '', 30, 5, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80'),
('moc_blue', 'Blue Lagoon', 450, 'MOCKTAILS', '', 30, 5, 'https://images.unsplash.com/photo-1536935338213-94c41263ef3b?auto=format&fit=crop&w=600&q=80'),
('moc_psun', 'Passion Sunrise', 450, 'MOCKTAILS', '', 30, 5, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80'),

-- SOUP & SALADS
('sp_nut', 'Spicy African Butternut Soup', 350, 'SOUP & SALADS', '', 20, 5, 'https://images.unsplash.com/photo-1547592166-23acbe3b624b?auto=format&fit=crop&w=600&q=80'),
('sp_beef', 'Beef Consommé soup', 350, 'SOUP & SALADS', '', 20, 5, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('sld_hse', 'House Salad', 500, 'SOUP & SALADS', 'Lettuce, Red Cabbage, Carrots, Onions, cucumber, tomatoes', 30, 5, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'),
('sld_cjn', 'Cajun Chicken Salad', 600, 'SOUP & SALADS', 'House salad topped with spiced chicken', 25, 5, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80'),

-- BITINGS
('bit_sam', 'Beef Samosa (Pair)', 200, 'BITINGS', '', 100, 20, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
('bit_w6', 'Chicken Wings (6pcs)', 700, 'BITINGS', '', 40, 10, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80'),
('bit_w12', 'Chicken Wings (12pcs)', 1100, 'BITINGS', '', 20, 5, 'https://images.unsplash.com/photo-1527477396000-64ca9c00173f?auto=format&fit=crop&w=600&q=80'),
('bit_fish', 'Breaded Fish Fingers', 800, 'BITINGS', 'Served with tartar sauce', 20, 5, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80'),
('bit_nug', 'Chicken Nuggets', 600, 'BITINGS', '', 30, 5, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'),
('bit_saus', 'Sausage (Pair)', 200, 'BITINGS', '', 100, 20, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),

-- BAKERY & PASTRIES
('bk_cake', 'Cake Slice (Lemon/Marble)', 300, 'BAKERY & PASTRIES', '', 12, 4, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80'),
('bk_for', 'Black/White Forest Cake', 400, 'BAKERY & PASTRIES', '', 12, 4, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'),

-- MAIN COURSES
('mn_fil', 'Grilled Fillet Steak', 950, 'MAIN COURSES', '', 15, 5, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80'),
('mn_med', 'Beef Medallion Steak', 1050, 'MAIN COURSES', '', 12, 3, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80'),
('mn_pep', 'Pepper Steak', 900, 'MAIN COURSES', '', 15, 5, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
('mn_sbeef', 'Stir Fried Beef', 700, 'MAIN COURSES', '', 20, 5, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80'),
('mn_lamb', 'Lamb Chops', 1200, 'MAIN COURSES', '', 10, 3, 'https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&w=600&q=80'),
('mn_lrib', 'Lamb Ribs', 800, 'MAIN COURSES', '', 10, 3, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
('mn_gbreast', 'Grilled Chicken Breast', 1000, 'MAIN COURSES', '', 20, 5, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'),
('mn_ccur_sp', 'TDs Special Chicken Curry', 850, 'MAIN COURSES', '', 20, 5, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'),
('mn_cpep', 'Chicken Pepper Steak', 900, 'MAIN COURSES', '', 20, 5, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'),
('mn_bbq', 'BBQ Roast Chicken', 800, 'MAIN COURSES', '', 20, 5, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80'),
('mn_ctik', 'Chicken Tikka', 900, 'MAIN COURSES', '', 20, 5, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80'),
('mn_gfish', 'Grilled Fish Fillet', 1000, 'MAIN COURSES', '', 15, 5, 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a277d?auto=format&fit=crop&w=600&q=80'),
('mn_til', 'Whole Fish (Tomato Gravy/Dry)', 950, 'MAIN COURSES', '', 10, 3, 'https://images.unsplash.com/photo-1535914254981-9663acf426da?auto=format&fit=crop&w=600&q=80'),
('mn_fcoc', 'Fish in Coconut', 950, 'MAIN COURSES', '', 15, 5, 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=600&q=80'),
('mn_spag_bol', 'Spaghetti Bolognese', 950, 'MAIN COURSES', 'Spaghetti topped with a rich, slow simmered meat-based sauce', 25, 5, 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=600&q=80'),
('mn_spag_pom', 'Spaghetti Pomodoro', 800, 'MAIN COURSES', '', 25, 5, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80'),

-- BURGERS / BURRITOS & SANDWICHES
('bg_beef', 'Beef Burger', 700, 'BURGERS / BURRITOS & SANDWICHES', 'Served with fries or salad', 30, 5, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'),
('bg_chick', 'Chicken Burger', 750, 'BURGERS / BURRITOS & SANDWICHES', 'Served with fries or salad', 30, 5, 'https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=600&q=80'),
('bur_beef', 'Beef Burrito', 600, 'BURGERS / BURRITOS & SANDWICHES', 'Served with fries or salad', 20, 5, 'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80'),
('bur_chick', 'Chicken Burrito', 700, 'BURGERS / BURRITOS & SANDWICHES', 'Served with fries or salad', 20, 5, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80'),
('bur_veg', 'Vegetable Burrito', 500, 'BURGERS / BURRITOS & SANDWICHES', 'Served with fries or salad', 20, 5, 'https://images.unsplash.com/photo-1511285229362-bf5a3717208d?auto=format&fit=crop&w=600&q=80'),
('bg_extras', 'Burger Extras', 200, 'BURGERS / BURRITOS & SANDWICHES', 'Cheese, Bacon, Coated Onion rings/Fries', 50, 10, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'),

-- SANDWICHES
('snd_stk', 'Steak Sandwich', 700, 'SANDWICHES', 'Thinly sliced steak, caramelized onion, tomatoes, mustard, lettuce. Served with fries or salad', 20, 5, 'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=600&q=80'),
('snd_club', 'Clubhouse Sandwich', 850, 'SANDWICHES', '3 layers consisting of three slices of bread, chicken, fried bacon, lettuce, tomatoes, cucumber and mayonnaise. Served with fries or salad', 20, 5, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'),
('snd_chick', 'Chicken Sandwich', 800, 'SANDWICHES', 'Boneless chicken, lettuce, tomatoes. Served with fries or salad', 20, 5, 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=600&q=80'),
('snd_extras', 'Sandwich Extras', 200, 'SANDWICHES', 'Cheese, Bacon, Coated Onion rings/Fries', 50, 10, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'),

-- SIDES
('sd_mash', 'Mashed Potatoes', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'),
('sd_fries', 'Fries', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&w=600&q=80'),
('sd_rice', 'Rice', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80'),
('sd_chap', 'Chapati', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80'),
('sd_ugali', 'Ugali', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80'),
('sd_vrice', 'Vegetable Rice', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'),
('sd_saute', 'Sauteed Vegetables', 200, 'SIDES', '', 50, 10, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'),

-- DESSERTS
('dst_ban', 'Banana Split', 550, 'DESSERTS', '3 scoops of ice cream served with split Banana, sundae sauce and Nuts', 15, 5, 'https://images.unsplash.com/photo-1567324216289-97c6c1e44894?auto=format&fit=crop&w=600&q=80'),
('dst_sun', 'Classic Sundae', 500, 'DESSERTS', '3 scoops of ice cream piled high, topped with nuts/Cookies', 15, 4, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80'),
('dst_fruit', 'TDs Fruit Salad', 400, 'DESSERTS', 'Served with yoghurt, honey and nuts', 30, 5, 'https://images.unsplash.com/photo-1490474504059-bf6eb9dae980?auto=format&fit=crop&w=600&q=80');