
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Category, MenuItem, CartItem, ReceiptData, PaymentMethod, User, SaleTransaction, Expense, AuditLog, InventoryItem } from './types';
import { LOGO_URL, KITCHEN_RECIPES, INITIAL_USERS, MENU_ITEMS, INITIAL_KITCHEN_INVENTORY } from './constants'; 
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
  Search, LayoutGrid, LogOut, Loader2, RefreshCw, BarChart3, LayoutList, History
} from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [posUser, setPosUser] = useState<User | null>(null);

  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [prefilledTable, setPrefilledTable] = useState<number | undefined>(undefined);
  const [prefilledOrderType, setPrefilledOrderType] = useState<'Dine-in' | 'Take Away'>('Dine-in');

  const navigate = useNavigate();
  const location = useLocation();

  const getNairobiISO = () => new Date().toISOString(); 

  const logActivity = useCallback(async (action: AuditLog['action'], details: string, severity: AuditLog['severity'] = 'low') => {
    if (!posUser) return; 
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      date: getNairobiISO(),
      userId: posUser.id,
      userName: posUser.name,
      action,
      details,
      severity
    };
    setAuditLogs(prev => [log, ...prev]);
    try { if (navigator.onLine) await DB.saveAuditLog(log); } catch (e) {}
  }, [posUser]);

  const sortedSalesHistory = useMemo(() => {
    return [...salesHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [salesHistory]);

  const fetchData = useCallback(async (isInitial = false) => {
      if(isInitial) setIsLoading(true);
      try {
        if (navigator.onLine) {
          const [cloudUsers, cloudMenu, cloudInv, cloudSales, cloudExpenses, cloudLogs] = await Promise.all([
            DB.getUsers(),
            DB.getMenuItems(),
            DB.getInventory(),
            DB.getTransactions(),
            DB.getExpenses(),
            DB.getAuditLogs()
          ]);

          setUsers(cloudUsers.length > 0 ? cloudUsers : INITIAL_USERS);
          setMenuItems(cloudMenu.length > 0 ? cloudMenu : MENU_ITEMS);
          setInventory(cloudInv.length > 0 ? cloudInv : INITIAL_KITCHEN_INVENTORY);
          setSalesHistory(cloudSales);
          setExpenses(cloudExpenses);
          setAuditLogs(cloudLogs);

          await Promise.all([
              LocalDB.saveUsers(cloudUsers.length > 0 ? cloudUsers : INITIAL_USERS),
              LocalDB.saveMenu(cloudMenu.length > 0 ? cloudMenu : MENU_ITEMS),
              LocalDB.saveInventory(cloudInv.length > 0 ? cloudInv : INITIAL_KITCHEN_INVENTORY),
              LocalDB.saveSalesHistory(cloudSales),
              LocalDB.saveExpenses(cloudExpenses)
          ]);
        } else {
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
        }
        const pendingOrders = await LocalDB.getPendingOrders();
        setPendingSyncCount(pendingOrders.length);
      } catch (e) {
          console.error("Fetch failed:", e);
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
    const handleOnline = () => { setIsOnline(true); fetchData(); attemptAutoSync(); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [attemptAutoSync, fetchData]);

  const handleLogin = (user: User) => {
    setPosUser(user);
    logActivity('LOGIN', `User ${user.name} logged in`, 'low');
    navigate('/');
  };

  const handleLogout = () => {
    logActivity('LOGOUT', `User ${posUser?.name} logged out`, 'low');
    setPosUser(null);
    navigate('/');
  };

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      return existing ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const onResumeOrder = (tx: SaleTransaction) => {
    const reconstructed: CartItem[] = tx.items.map(i => {
      const orig = menuItems.find(m => m.id === i.id);
      return { 
        ...(orig || { 
          id: i.id, name: i.name, price: i.price, category: Category.MAINS, image: '', stock: 0, lowStockThreshold: 0 
        }), 
        quantity: i.quantity 
      };
    });
    setCart(reconstructed);
    setEditingTransactionId(tx.id);
    setPrefilledTable(tx.tableNumber);
    setPrefilledOrderType(tx.orderType || 'Dine-in');
    navigate('/');
  };

  const handleCheckout = async (paymentMethod: PaymentMethod, orderType: 'Dine-in' | 'Take Away', amountTendered?: number, change?: number, tableNumber?: number) => {
    if (cart.length === 0 || !posUser) return;
    setIsProcessing(true);
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderId = editingTransactionId || `TD-${Date.now().toString().slice(-6)}`;
    const timestamp = getNairobiISO();

    const sale: SaleTransaction = {
        id: orderId, 
        date: editingTransactionId ? salesHistory.find(t => t.id === editingTransactionId)?.date || timestamp : timestamp, 
        total: subtotal, 
        paymentMethod,
        status: paymentMethod === 'Pay Later' ? 'Pending' : 'Paid',
        cashierName: posUser.name, 
        tableNumber, 
        orderType,
        items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        updatedAt: editingTransactionId ? timestamp : undefined,
        updatedBy: editingTransactionId ? posUser.name : undefined
    };

    try {
        const aiMsg = await generateReceiptMessage(cart, posUser.name);
        setReceiptData({
            items: [...cart], subtotal, tax: 0, total: subtotal, amountTendered, change,
            date: sale.date, orderId, paymentMethod, cashierName: posUser.name,
            tableNumber, orderType, aiMessage: aiMsg, status: sale.status
        });
        setIsModalOpen(true);

        setSalesHistory(prev => [sale, ...prev.filter(t => t.id !== orderId)]);
        if (navigator.onLine) {
            await DB.saveTransaction(sale);
        } else {
            await LocalDB.queueOrder(sale);
        }
        
        logActivity('SALE', `Order ${orderId} ${sale.status}.`, 'low');
        setCart([]);
        setEditingTransactionId(null);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Paid' | 'Pending', paymentMethod: PaymentMethod) => {
    const tx = salesHistory.find(t => t.id === id);
    if (!tx || !posUser) return;
    const updatedTx: SaleTransaction = { ...tx, status: newStatus, paymentMethod, updatedBy: posUser.name, updatedAt: getNairobiISO() };
    setSalesHistory(prev => prev.map(t => t.id === id ? updatedTx : t));
    
    if (navigator.onLine) await DB.saveTransaction(updatedTx);
    else await LocalDB.queueOrder(updatedTx);

    if (newStatus === 'Paid') {
        const reconstructed: CartItem[] = updatedTx.items.map(i => {
            const orig = menuItems.find(m => m.id === i.id);
            return { ...(orig || { id: i.id, name: i.name, price: i.price, category: Category.MAINS, image: '', stock: 0, lowStockThreshold: 0 }), quantity: i.quantity };
        });
        const aiMsg = await generateReceiptMessage(reconstructed, posUser.name);
        setReceiptData({ 
          items: reconstructed, subtotal: tx.total, tax: 0, total: tx.total, 
          date: tx.date, orderId: id, paymentMethod, status: 'Paid', 
          cashierName: tx.cashierName, aiMessage: aiMsg, tableNumber: tx.tableNumber,
          updatedAt: updatedTx.updatedAt
        });
        setIsModalOpen(true);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-beige-50"><Loader2 className="animate-spin text-coffee-800" size={64} /></div>;
  if (!posUser) return <LoginScreen users={users} onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#F5F4EF] overflow-hidden font-sans text-[#4B3621]">
      <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-50 shadow-2xl overflow-hidden">
         <div className="bg-[#4B3621] p-10 text-center shrink-0 relative">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center p-2 shadow-xl border border-white/20">
               <img src={LOGO_URL} alt="Tropical Dreams" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-white font-serif text-2xl font-bold tracking-tight mb-2 leading-tight">Tropical Dreams</h1>
            <div className="flex justify-center items-center">
               <span className="bg-[#14b8a6] text-white text-[10px] font-black px-6 py-1.5 rounded-full tracking-widest uppercase shadow-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
         </div>

         <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[#e0d4c4] rounded-full flex items-center justify-center font-bold text-[#4B3621] overflow-hidden border border-white shadow-sm">
                  {posUser.avatar ? <img src={posUser.avatar} className="w-full h-full object-cover" /> : posUser.name.charAt(0)}
               </div>
               <span className="font-black text-lg truncate max-w-[140px] text-[#4B3621]">{posUser.name}</span>
            </div>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-95"><LogOut size={24} /></button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin bg-white">
            <button 
              onClick={() => { setActiveCategory('All'); navigate('/'); }} 
              className={`w-full flex items-center px-6 py-5 rounded-[20px] text-base font-black transition-all ${activeCategory === 'All' && location.pathname === '/' ? 'bg-[#e0d4c4] text-[#4B3621] shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
               <div className="flex items-center gap-3"><LayoutGrid size={22} /> All Items</div>
            </button>
            <div className="px-6 py-4 mt-6 mb-2 border-t border-gray-50">
               <p className="text-[11px] font-black text-gray-300 uppercase tracking-[2px]">Categories</p>
            </div>
            {Object.values(Category).map(cat => (
               <button 
                 key={cat} 
                 onClick={() => { setActiveCategory(cat); navigate('/'); }} 
                 className={`w-full flex items-center px-6 py-4 rounded-[16px] text-xs font-black transition-all uppercase tracking-wide text-left ${activeCategory === cat && location.pathname === '/' ? 'bg-beige-50 text-[#4B3621] shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 shrink-0">
            <button onClick={() => navigate('/')} className={`flex-1 p-4 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/' ? 'bg-white shadow-lg text-[#14b8a6]' : 'text-gray-300 hover:text-gray-600'}`} title="POS"><LayoutList size={28}/></button>
            <button onClick={() => navigate('/transactions')} className={`flex-1 p-4 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/transactions' ? 'bg-white shadow-lg text-[#14b8a6]' : 'text-gray-300 hover:text-gray-600'}`} title="Orders History"><History size={28}/></button>
            {posUser.role === 'Admin' && (
              <button onClick={() => navigate('/admin')} className={`flex-1 p-4 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/admin' ? 'bg-white shadow-lg text-[#14b8a6]' : 'text-gray-300 hover:text-gray-600'}`} title="Management"><BarChart3 size={28}/></button>
            )}
         </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-1 overflow-hidden h-full">
              <main className="flex-1 flex flex-col overflow-hidden p-8">
                <header className="mb-10 flex items-center justify-between shrink-0">
                  <div className="relative w-full max-w-3xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
                    <input 
                      type="text" 
                      placeholder="Search menu..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full pl-16 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[28px] text-lg focus:ring-4 focus:ring-teal-50 outline-none transition-all placeholder:text-gray-200 font-medium shadow-sm" 
                    />
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 content-start scroll-smooth">
                  {menuItems.filter(i => (activeCategory === 'All' || i.category === activeCategory) && i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                    <MenuItemCard key={item.id} item={item} onAdd={addToCart} />
                  ))}
                </div>
              </main>

              <div className="w-[420px] shrink-0 h-full">
                <CartSidebar 
                  cart={cart} 
                  onUpdateQuantity={(id: string, d: number) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} 
                  onRemove={(id: string) => setCart(p => p.filter(i => i.id !== id))} 
                  onClear={() => { setCart([]); setEditingTransactionId(null); }} 
                  onCheckout={handleCheckout} 
                  onHold={() => {}} 
                  subtotal={cart.reduce((a,c)=>a+(c.price*c.quantity),0)} 
                  tax={0} 
                  total={cart.reduce((a,c)=>a+(c.price*c.quantity),0)} 
                  isProcessing={isProcessing} 
                  userRole={posUser.role} 
                  onLogAction={logActivity}
                  pendingTransactions={sortedSalesHistory.filter(t => t.status === 'Pending')}
                  onResumeOrder={onResumeOrder}
                />
              </div>
            </div>
          } />

          <Route path="/transactions" element={
            <TransactionsPage 
              transactions={sortedSalesHistory} 
              onUpdateStatus={handleUpdateStatus} 
              user={posUser} 
              onEditOrder={onResumeOrder} 
            />
          } />

          <Route path="/admin" element={
            posUser.role === 'Admin' ? (
              <AdminDashboard 
                menuItems={menuItems} users={users} salesHistory={sortedSalesHistory} expenses={expenses} 
                auditLogs={auditLogs} inventory={inventory}
                onUpdateStock={async (id: string, d: number) => {
                  const item = inventory.find(i => i.id === id);
                  if (item) {
                    const updated = { ...item, quantity: item.quantity + d };
                    setInventory(prev => prev.map(i => i.id === id ? updated : i));
                    if (navigator.onLine) await DB.saveInventoryItem(updated);
                    await LocalDB.updateInventoryItem(updated);
                  }
                }}
                onSaveInventoryItem={async (item: InventoryItem) => {
                  setInventory(prev => {
                    const exists = prev.find(i => i.id === item.id);
                    return exists ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev];
                  });
                  if (navigator.onLine) await DB.saveInventoryItem(item);
                  await LocalDB.updateInventoryItem(item);
                }}
                onDeleteInventoryItem={async (id: string) => {
                   setInventory(prev => prev.filter(i => i.id !== id));
                   if (navigator.onLine) await DB.deleteInventoryItem(id);
                   const db = await LocalDB.getDB();
                   await db.delete('inventory', id);
                }}
                onSaveItem={async (i: MenuItem) => { 
                  setMenuItems(prev => {
                    const exists = prev.find(m => m.id === i.id);
                    return exists ? prev.map(m => m.id === i.id ? i : m) : [i, ...prev];
                  });
                  await DB.saveMenuItem(i); 
                }} 
                onDeleteItem={async (id: string) => { 
                  setMenuItems(prev => prev.filter(m => m.id !== id));
                  await DB.deleteMenuItem(id); 
                }} 
                onSaveUser={async (u: User) => { 
                  setUsers(prev => {
                    const exists = prev.find(usr => usr.id === u.id);
                    return exists ? prev.map(usr => usr.id === u.id ? u : usr) : [u, ...prev];
                  });
                  await DB.saveUser(u); 
                }} 
                onDeleteUser={async (id: string) => { 
                  setUsers(prev => prev.filter(u => u.id !== id));
                  await DB.deleteUser(id); 
                }} 
                onSaveExpense={async (e: Expense) => { 
                  setExpenses(prev => [e, ...prev]);
                  await DB.saveExpense(e); 
                }} 
                onDeleteExpense={async (id: string) => { 
                  setExpenses(prev => prev.filter(e => e.id !== id));
                  await DB.deleteExpense(id); 
                }} 
                onClose={() => navigate('/')} 
                onRefresh={() => fetchData(false)} 
                currentUserRole={posUser.role} 
                currentUser={posUser} 
              />
            ) : <Navigate to="/" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {receiptData && <ReceiptModal data={receiptData} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setReceiptData(null); }} />}
      </div>
    </div>
  );
};

export default App;
