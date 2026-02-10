import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Category, MenuItem, CartItem, ReceiptData, PaymentMethod, User, SaleTransaction, Expense, AuditLog, InventoryItem } from './types';
import { LOGO_URL, INITIAL_USERS, MENU_ITEMS, INITIAL_KITCHEN_INVENTORY } from './constants'; 
import { MenuItemCard } from './components/MenuItemCard';
import { CartSidebar } from './components/CartSidebar';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import TransactionsPage from './components/TransactionsPage';
import { generateReceiptMessage } from './services/geminiService';
import { DB } from './services/supabase';
import { LocalDB } from './services/db';
import { 
  Search, LayoutGrid, LogOut, Loader2, LayoutList, History
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
    if (location.pathname !== '/admin') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    if (posUser) {
      logActivity('LOGOUT', `User ${posUser.name} logged out`, 'low');
    }
    setPosUser(null);
    navigate('/');
  };

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      return existing 
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
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

  const handleCheckout = async (
    paymentMethod: PaymentMethod, 
    orderType: 'Dine-in' | 'Take Away', 
    amountTendered?: number, 
    change?: number, 
    tableNumber?: number
  ) => {
    if (cart.length === 0 || !posUser) return;
    setIsProcessing(true);
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderId = editingTransactionId || `TD-${Date.now().toString().slice(-6)}`;
    const timestamp = getNairobiISO();

    const sale: SaleTransaction = {
      id: orderId, 
      date: editingTransactionId 
        ? salesHistory.find(t => t.id === editingTransactionId)?.date || timestamp 
        : timestamp, 
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
      if (navigator.onLine) await DB.saveTransaction(sale);
      else await LocalDB.queueOrder(sale);
      logActivity('SALE', `Order ${orderId} ${sale.status}.`, 'low');
      setCart([]);
      setEditingTransactionId(null);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Paid' | 'Pending', paymentMethod: PaymentMethod) => {
    const tx = salesHistory.find(t => t.id === id);
    if (!tx || !posUser) return;
    const updatedTx: SaleTransaction = { 
      ...tx, 
      status: newStatus, 
      paymentMethod, 
      updatedBy: posUser.name, 
      updatedAt: getNairobiISO() 
    };
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

  // ────────────────────────────────────────────────
  //              ADMIN HIDDEN LOGIC – CASE INSENSITIVE
  // ────────────────────────────────────────────────
  if (!posUser) {
    const isAdminPath = location.pathname === '/admin' || location.pathname === '/admin/';

    const normalizeRole = (role?: string) => (role || '').trim().toUpperCase();

    let visibleUsers: User[] = [];

    if (isAdminPath) {
      visibleUsers = users.filter(u => normalizeRole(u.role) === 'ADMIN');
    } else {
      visibleUsers = users.filter(u => normalizeRole(u.role) !== 'ADMIN');
    }

    // Optional debug – remove after testing
    // console.log("Path:", location.pathname, "Visible users:", visibleUsers.map(u => `${u.name} (${u.role})`));

    return <LoginScreen users={visibleUsers} onLogin={handleLogin} />;
  }

  // ────────────────────────────────────────────────
  //              MAIN APP LAYOUT
  // ────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F5F4EF] overflow-hidden font-sans text-[#4B3621]">
      <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-50 shadow-2xl overflow-hidden">
        {/* ... rest of your sidebar code remains unchanged ... */}
        {/* (header, user info, categories, bottom nav buttons) */}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Routes>
          <Route path="/" element={/* your POS main content */} />
          <Route path="/transactions" element={<TransactionsPage transactions={sortedSalesHistory} onUpdateStatus={handleUpdateStatus} user={posUser} onEditOrder={onResumeOrder} />} />
          <Route path="/admin" element={
            posUser && normalizeRole(posUser.role) === 'ADMIN' ? (
              <AdminDashboard 
                /* ... all your AdminDashboard props ... */
                onClose={() => navigate('/')}
                onRefresh={() => fetchData(false)}
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
