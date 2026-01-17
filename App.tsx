
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Category, MenuItem, CartItem, ReceiptData, PaymentMethod, User, SaleTransaction, Expense, AuditLog, HeldOrder, InventoryItem } from './types';
import { LOGO_URL, KITCHEN_RECIPES } from './constants'; 
import { MenuItemCard } from './components/MenuItemCard';
import { CartSidebar } from './components/CartSidebar';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import TransactionsPage from './components/TransactionsPage';
import { InventoryPage } from './components/InventoryPage';
import { generateReceiptMessage } from './services/geminiService';
import { DB } from './services/supabase';
import { LocalDB } from './services/db';
import { 
  Search, LayoutGrid, LogOut, Coffee, 
  CheckCircle, Loader2, List, RefreshCw, Package, CloudOff, Cloud
} from 'lucide-react';

const App: React.FC = () => {
  // --- Global State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // App Data State (Strictly from DB)
  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Auth State
  const [posUser, setPosUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  // POS State
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);
  
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [prefilledTable, setPrefilledTable] = useState<number | undefined>(undefined);
  const [prefilledOrderType, setPrefilledOrderType] = useState<'Dine-in' | 'Take Away'>('Dine-in');

  const navigate = useNavigate();
  const location = useLocation();

  const getNairobiISO = () => new Date().toISOString(); 

  const logActivity = useCallback(async (action: AuditLog['action'], details: string, severity: AuditLog['severity'] = 'low', specificUser?: User) => {
    const user = specificUser || posUser || adminUser;
    if (!user) return; 
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      date: getNairobiISO(),
      userId: user.id,
      userName: user.name,
      action,
      details,
      severity
    };
    setAuditLogs(prev => [log, ...prev]);
    try { if (navigator.onLine) await DB.saveAuditLog(log); } catch (e) {}
  }, [posUser, adminUser]);

  // --- DATA FETCHING (Strictly DB-only) ---
  const fetchData = useCallback(async (isInitial = false) => {
      if(isInitial) setIsLoading(true);
      
      try {
        if (navigator.onLine) {
          // 1. ONLINE: Cloud is Authority
          const [cloudUsers, cloudMenu, cloudInv, cloudSales, cloudExpenses] = await Promise.all([
            DB.getUsers(),
            DB.getMenuItems(),
            DB.getInventory(),
            DB.getTransactions(),
            DB.getExpenses(),
          ]);

          // Sync Cloud -> State
          setUsers(cloudUsers);
          setMenuItems(cloudMenu);
          setInventory(cloudInv);
          setSalesHistory(cloudSales);
          setExpenses(cloudExpenses);

          // Sync Cloud -> Local Cache
          await Promise.all([
              LocalDB.saveUsers(cloudUsers),
              LocalDB.saveMenu(cloudMenu),
              LocalDB.saveInventory(cloudInv),
              LocalDB.saveSalesHistory(cloudSales),
              LocalDB.saveExpenses(cloudExpenses)
          ]);

          setIsSupabaseConnected(true);
        } else {
          // 2. OFFLINE: Use Local Cache
          const [localUsers, localMenu, localInv, localSales, localExpenses] = await Promise.all([
            LocalDB.getUsers(),
            LocalDB.getMenu(),
            LocalDB.getInventory(),
            LocalDB.getSalesHistory(),
            LocalDB.getExpenses(),
          ]);

          setUsers(localUsers);
          setMenuItems(localMenu);
          setInventory(localInv);
          setSalesHistory(localSales);
          setExpenses(localExpenses);
          setIsSupabaseConnected(false);
        }
        
        const pendingOrders = await LocalDB.getPendingOrders();
        setPendingSyncCount(pendingOrders.length);

      } catch (e) {
          console.error("Fetch failed:", e);
          setIsSupabaseConnected(false);
          // Emergency local load if cloud crashed mid-fetch
          const lUsers = await LocalDB.getUsers();
          const lMenu = await LocalDB.getMenu();
          setUsers(lUsers);
          setMenuItems(lMenu);
      } finally { 
          if(isInitial) setIsLoading(false); 
      }
  }, []);

  const attemptAutoSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    const pendingOrders = await LocalDB.getPendingOrders();
    if (pendingOrders.length === 0) return;
    setIsSyncing(true);
    for (const order of pendingOrders) {
      try { 
        await DB.saveTransaction(order); 
        await LocalDB.removeOrderFromQueue(order.id); 
      } catch (e) {
        console.error(`Sync failed for order ${order.id}`, e);
      }
    }
    const remaining = await LocalDB.getPendingOrders();
    setPendingSyncCount(remaining.length);
    setIsSyncing(false);
  }, [isSyncing]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    const handleOnline = () => { 
        setIsOnline(true); 
        fetchData(); 
        attemptAutoSync(); 
    };
    const handleOffline = () => {
        setIsOnline(false);
        setIsSupabaseConnected(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [attemptAutoSync, fetchData]);

  useEffect(() => {
    const interval = setInterval(attemptAutoSync, 60000);
    return () => clearInterval(interval);
  }, [attemptAutoSync]);

  const handleLogin = (user: User) => {
    if (user.role === 'Admin') setAdminUser(user);
    setPosUser(user);
    logActivity('LOGIN', `User ${user.name} logged in`, 'low', user);
    if (user.role === 'Chef' || user.role === 'Barista') navigate('/inventory');
    else navigate('/');
  };

  const handleLogout = () => {
    const user = posUser || adminUser;
    if (user) logActivity('LOGOUT', `User ${user.name} logged out`, 'low', user);
    setPosUser(null);
    setAdminUser(null);
    navigate('/');
  };

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      return existing ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...item, quantity: 1 }];
    });
    setLastAddedItem(item.name);
    setTimeout(() => setLastAddedItem(null), 2000);
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }, []);

  const removeFromCart = useCallback((id: string) => setCart(prev => prev.filter(item => item.id !== id)), []);
  const clearCart = useCallback(() => { setCart([]); setEditingTransactionId(null); }, []);

  const handleCheckout = async (paymentMethod: PaymentMethod, orderType: 'Dine-in' | 'Take Away', amountTendered?: number, change?: number, tableNumber?: number) => {
    if (cart.length === 0 || !posUser) return;
    setIsProcessing(true);
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderId = editingTransactionId || `TD-${Date.now().toString().slice(-6)}`;
    const timestamp = getNairobiISO();

    const sale: SaleTransaction = {
        id: orderId, date: timestamp, total: subtotal, paymentMethod,
        status: paymentMethod === 'Pay Later' ? 'Pending' : 'Paid',
        cashierName: posUser.name, tableNumber, orderType,
        items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price }))
    };

    try {
        const aiMsg = await generateReceiptMessage(cart, posUser.name);
        setReceiptData({
            items: [...cart], subtotal, tax: 0, total: subtotal, amountTendered, change,
            date: timestamp, orderId, paymentMethod, cashierName: posUser.name,
            tableNumber, orderType, aiMessage: aiMsg, status: sale.status as 'Paid' | 'Pending'
        });
        setIsModalOpen(true);

        let currentInv = [...inventory];
        cart.forEach(item => {
            const ingredients = KITCHEN_RECIPES[item.id];
            if (ingredients) {
                ingredients.forEach(recipeItem => {
                    const invIdx = currentInv.findIndex(i => i.id === recipeItem.invId);
                    if (invIdx !== -1) {
                        currentInv[invIdx] = { ...currentInv[invIdx], quantity: currentInv[invIdx].quantity - (recipeItem.amount * item.quantity) };
                        if (navigator.onLine) DB.saveInventoryItem(currentInv[invIdx]);
                    }
                });
            }
        });
        setInventory(currentInv);
        await LocalDB.saveInventory(currentInv);

        setSalesHistory(prev => [sale, ...prev.filter(t => t.id !== orderId)]);
        await LocalDB.queueOrder(sale);
        logActivity('SALE', `Order ${orderId} finalized.`, 'low');
        setCart([]);
        setEditingTransactionId(null);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleUpdateInvStock = async (id: string, delta: number) => {
    setInventory(prev => {
        const updated = prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, quantity: item.quantity + delta };
                if (navigator.onLine) DB.saveInventoryItem(newItem);
                return newItem;
            }
            return item;
        });
        LocalDB.saveInventory(updated);
        return updated;
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Paid' | 'Pending', paymentMethod: PaymentMethod) => {
    const tx = salesHistory.find(t => t.id === id);
    if (!tx || !posUser) return;
    const updatedTx: SaleTransaction = { ...tx, status: newStatus, paymentMethod, updatedBy: posUser.name, updatedAt: getNairobiISO() };
    setSalesHistory(prev => prev.map(t => t.id === id ? updatedTx : t));
    if (navigator.onLine) await DB.updateTransactionStatus(id, newStatus, paymentMethod, posUser.name);
    else await LocalDB.queueOrder(updatedTx);

    if (newStatus === 'Paid') {
        const reconstructed: CartItem[] = updatedTx.items.map(i => {
            const orig = menuItems.find(m => m.id === i.id);
            return { ...(orig || { id: i.id, name: i.name, price: i.price, category: Category.MAINS, image: '', stock: 0, lowStockThreshold: 0 }), quantity: i.quantity };
        });
        const aiMsg = await generateReceiptMessage(reconstructed, posUser.name);
        setReceiptData({ items: reconstructed, subtotal: tx.total, tax: 0, total: tx.total, date: tx.date, orderId: id, paymentMethod, status: 'Paid', cashierName: tx.cashierName, aiMessage: aiMsg, tableNumber: tx.tableNumber });
        setIsModalOpen(true);
    }
  };

  if (isLoading) return <div className="h-screen flex flex-col items-center justify-center bg-beige-50"><Loader2 className="animate-spin text-coffee-800 mb-4" size={48} /><p className="font-serif font-bold text-coffee-900 text-lg">Loading your data...</p></div>;
  if (!posUser) return <LoginScreen users={users} onLogin={handleLogin} />;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-beige-50 text-coffee-950 overflow-hidden font-sans">
      <aside className="w-20 md:w-24 bg-coffee-900 flex flex-col items-center py-8 shrink-0 z-40 border-r border-black/10 shadow-2xl">
         <div className="mb-12 bg-white rounded-2xl p-2 w-12 h-12 md:w-16 md:h-16 shadow-xl border border-white/20">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
         </div>
         <nav className="flex-1 space-y-4 w-full px-2">
            <button onClick={() => navigate('/')} className={`w-full flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isActive('/') ? 'bg-tropical-500 text-white shadow-lg' : 'text-coffee-300 hover:bg-white/10'}`}>
                <LayoutGrid size={24} /><span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">POS</span>
            </button>
            <button onClick={() => navigate('/transactions')} className={`w-full flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isActive('/transactions') ? 'bg-tropical-500 text-white shadow-lg' : 'text-coffee-300 hover:bg-white/10'}`}>
                <List size={24} /><span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Orders</span>
            </button>
            <button onClick={() => navigate('/inventory')} className={`w-full flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isActive('/inventory') ? 'bg-tropical-500 text-white shadow-lg' : 'text-coffee-300 hover:bg-white/10'}`}>
                <Package size={24} /><span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Stock</span>
            </button>
            {posUser.role === 'Admin' && (
                <button onClick={() => navigate('/admin')} className={`w-full flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isActive('/admin') ? 'bg-tropical-500 text-white shadow-lg' : 'text-coffee-300 hover:bg-white/10'}`}>
                    <RefreshCw size={24} /><span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Admin</span>
                </button>
            )}
         </nav>
         
         <div className="mt-auto flex flex-col items-center gap-4">
            <div className={`p-2 rounded-full ${isSupabaseConnected ? 'text-green-400' : 'text-red-400'}`} title={isSupabaseConnected ? 'Cloud Connected' : 'Cloud Offline'}>
                {isSupabaseConnected ? <Cloud size={20} /> : <CloudOff size={20} />}
            </div>
            <button onClick={handleLogout} className="p-4 text-red-400 hover:text-red-300 transition-colors"><LogOut size={24} /></button>
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-1 h-full overflow-hidden">
              <main className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col relative">
                <header className="mb-8 flex flex-col md:flex-row gap-4 md:items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-coffee-100 p-3 rounded-2xl shadow-sm border border-coffee-200"><Coffee className="text-coffee-800" size={24} /></div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-coffee-900 leading-none mb-1">Tropical Dreams Menu</h2>
                            <p className="text-sm text-coffee-500 font-medium">Lodwar, Turkana | Welcome, {posUser.name}</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
                        <input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-coffee-200 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-tropical-500 transition-all" />
                    </div>
                </header>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                  <button onClick={() => setActiveCategory('All')} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-coffee-900 text-white shadow-lg' : 'bg-white text-coffee-600 border border-coffee-100'}`}>All Items</button>
                  {Object.values(Category).map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-coffee-900 text-white shadow-lg' : 'bg-white text-coffee-600 border border-coffee-100'}`}>{cat}</button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
                  {menuItems.filter(i => (activeCategory === 'All' || i.category === activeCategory) && i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => <MenuItemCard key={item.id} item={item} onAdd={addToCart} />)}
                  {menuItems.length === 0 && (
                      <div className="col-span-full py-20 text-center text-coffee-300">
                          <p className="font-bold text-lg">No menu items found in your database.</p>
                          <p className="text-sm">Add them in the Admin section.</p>
                      </div>
                  )}
                </div>
                
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${lastAddedItem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                   <div className="bg-coffee-900/95 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
                      <CheckCircle size={20} className="text-tropical-400" />
                      <span className="font-bold">Added {lastAddedItem} to cart</span>
                   </div>
                </div>
              </main>
              
              <div className="w-80 lg:w-96 hidden lg:block border-l border-coffee-100 bg-white shadow-inner">
                <CartSidebar 
                  cart={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onClear={clearCart} onCheckout={handleCheckout} 
                  subtotal={cart.reduce((a,c)=>a+(c.price*c.quantity),0)} tax={0} total={cart.reduce((a,c)=>a+(c.price*c.quantity),0)}
                  isProcessing={isProcessing} userRole={posUser.role} onLogAction={logActivity}
                  isEditing={!!editingTransactionId} prefilledTable={prefilledTable} prefilledOrderType={prefilledOrderType}
                />
              </div>
            </div>
          } />
          
          <Route path="/inventory" element={<InventoryPage inventory={inventory} onUpdateStock={handleUpdateInvStock} onRefresh={() => fetchData(false)} />} />
          
          <Route path="/transactions" element={<TransactionsPage transactions={salesHistory} onUpdateStatus={handleUpdateStatus} user={posUser} onEditOrder={(tx) => {
              const reconstructed: CartItem[] = tx.items.map(i => {
                const orig = menuItems.find(m => m.id === i.id);
                return { ...(orig || { id: i.id, name: i.name, price: i.price, category: Category.MAINS, image: '', stock: 0, lowStockThreshold: 0 }), quantity: i.quantity };
              });
              setCart(reconstructed);
              setEditingTransactionId(tx.id);
              setPrefilledTable(tx.tableNumber);
              setPrefilledOrderType(tx.orderType || 'Dine-in');
              navigate('/');
          }} />} />
          
          <Route path="/admin" element={<AdminDashboard menuItems={menuItems} users={users} salesHistory={salesHistory} expenses={expenses} auditLogs={auditLogs} onSaveItem={async (i) => { await DB.saveMenuItem(i); setMenuItems(prev => [i, ...prev.filter(x => x.id !== i.id)]); }} onDeleteItem={async (id) => { await DB.deleteMenuItem(id); setMenuItems(prev => prev.filter(i => i.id !== id)); }} onSaveUser={async (u) => { await DB.saveUser(u); setUsers(prev => [u, ...prev.filter(x => x.id !== u.id)]); }} onDeleteUser={async (id) => { await DB.deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); }} onSaveExpense={async (e) => { await DB.saveExpense(e); setExpenses(prev => [e, ...prev]); }} onDeleteExpense={async (id) => { await DB.deleteExpense(id); setExpenses(prev => prev.filter(e => e.id !== id)); }} onClose={() => navigate('/')} onRefresh={() => fetchData(false)} currentUserRole={posUser.role} currentUser={posUser} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {receiptData && <ReceiptModal data={receiptData} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setReceiptData(null); }} />}
      </div>

      {pendingSyncCount > 0 && (
          <div className="fixed bottom-4 left-4 z-50 bg-coffee-900 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 border border-white/10 text-xs font-bold animate-in slide-in-from-left-4">
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{pendingSyncCount} Orders Syncing...</span>
          </div>
      )}
    </div>
  );
};

export default App;
