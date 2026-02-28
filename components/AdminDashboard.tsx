import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, User, Category, UserRole, SaleTransaction, PaymentMethod, Expense, AuditLog, InventoryItem, InventoryCategory } from '../types.ts';
import { CURRENCY, LOGO_URL, MENU_ITEMS } from '../constants.ts';
import {
  Plus, Trash2, Package, Users, BarChart3, PieChart, RefreshCw,
  DollarSign, ArrowLeft, Search, TrendingUp, TrendingDown,
  Activity, ShieldAlert, Edit3, Beef, Egg, Cake, GlassWater,
  Wheat, Carrot, Layers, Minus, Save, X, Sparkles, UserPlus, LogOut,
  Clock, ShieldCheck, DatabaseBackup, UploadCloud, Search as SearchIcon,
  Wand2, Printer, Download, Trophy, Camera, Calendar, ListFilter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/supabase';
import { LocalDB } from '../services/db';

interface AdminDashboardProps {
  menuItems: MenuItem[];
  users: User[];
  salesHistory: SaleTransaction[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  inventory: InventoryItem[];
  onUpdateStock: (id: string, delta: number) => Promise<void>;
  onSaveInventoryItem: (item: InventoryItem) => Promise<void>;
  onDeleteInventoryItem: (id: string) => Promise<void>;
  onSaveItem: (item: MenuItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onSaveUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onSaveExpense: (expense: Expense) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  currentUserRole: UserRole;
  currentUser: User;
}

const TROPICAL_COLORS = ['#0d9488', '#f97316', '#e11d48', '#7c3aed', '#ca8a04', '#2563eb', '#16a34a', '#db2777', '#4f46e5', '#ea580c'];

// Updated helper to match your real menu categories (exact strings from InventoryCategory type)
const getInventoryIcon = (cat: InventoryCategory) => {
  switch (cat) {
    case 'BREAKFAST': return <Egg size={20} />;
    case 'BITINGS': return <Beef size={20} />;
    case 'MAIN COURSES': return <Beef size={20} />;
    case 'BURGERS / BURRITOS & SANDWICHES': return <Beef size={20} />;
    case 'SOFT DRINKS': return <GlassWater size={20} />;
    case 'BAKERY & PASTRIES': return <Cake size={20} />;
    case 'DESSERTS': return <Cake size={20} />;
    case 'SOUP & SALADS':
    case 'FRESH JUICES':
    case 'LEMONADES': return <Carrot size={20} />;
    case 'HEALTH KICK':
    case 'SMOOTHIES':
    case 'SHAKES': return <Wheat size={20} />;
    default: return <Layers size={20} />;
  }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  menuItems, users, salesHistory, expenses, auditLogs, inventory,
  onUpdateStock, onSaveInventoryItem, onDeleteInventoryItem,
  onSaveItem, onDeleteItem, onSaveUser, onDeleteUser,
  onSaveExpense, onDeleteExpense, onClose, onRefresh,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'finances' | 'security' | 'inventory' | 'menu'>('reports');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Filtering States
  const [dateRange, setDateRange] = useState<'Day' | 'Yesterday' | 'Week' | 'Month' | 'All' | 'Custom'>('Day');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [invSearchTerm, setInvSearchTerm] = useState('');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');

  // Modals
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [editingInvItem, setEditingInvItem] = useState<InventoryItem | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // Recovery tool states
  const [isRepairingDates, setIsRepairingDates] = useState(false);
  const [isSyncingMenu, setIsSyncingMenu] = useState(false);

  const getNairobiYMD = (dateString?: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
  };

  useEffect(() => {
    if (editingUser) setAvatarPreview(editingUser.avatar || null);
    else setAvatarPreview(null);
  }, [editingUser]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const isDateInFilter = (dateStr: string) => {
    const tYMD = getNairobiYMD(dateStr);
    const todayYMD = getNairobiYMD();

    if (dateRange === 'All') return true;
    if (dateRange === 'Day') return tYMD === todayYMD;
    if (dateRange === 'Yesterday') {
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      return tYMD === getNairobiYMD(yest.toISOString());
    }
    if (dateRange === 'Custom') {
      if (!customStart || !customEnd) return true;
      return tYMD >= customStart && tYMD <= customEnd;
    }

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
    if (dateRange === 'Week') return tYMD >= getNairobiYMD(weekAgo.toISOString());
    if (dateRange === 'Month') return tYMD >= getNairobiYMD(monthAgo.toISOString());
    return true;
  };

  const filteredSales = useMemo(() => salesHistory.filter(t => isDateInFilter(t.date)), [salesHistory, dateRange, customStart, customEnd]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isDateInFilter(e.date)), [expenses, dateRange, customStart, customEnd]);
  const filteredInventory = useMemo(() => inventory.filter(i => i.name.toLowerCase().includes(invSearchTerm.toLowerCase())), [inventory, invSearchTerm]);
  const filteredMenuItems = useMemo(() => menuItems.filter(i => i.name.toLowerCase().includes(menuSearchTerm.toLowerCase())), [menuItems, menuSearchTerm]);

  const fastSellingItems = useMemo(() => {
    const counts: Record<string, { name: string; quantity: number; total: number }> = {};
    filteredSales.forEach(t => {
      if (t.status !== 'Paid') return;
      t.items.forEach(item => {
        if (!counts[item.id]) counts[item.id] = { name: item.name, quantity: 0, total: 0 };
        counts[item.id].quantity += item.quantity;
        counts[item.id].total += (item.price * item.quantity);
      });
    });
    return Object.values(counts).sort((a,b) => b.quantity - a.quantity).slice(0, 8);
  }, [filteredSales]);

  const reportStats = useMemo(() => {
    const grossRev = filteredSales.reduce((a, t) => a + (t.status === 'Paid' ? t.total : 0), 0);
    const totalExp = filteredExpenses.reduce((a, e) => a + e.amount, 0);
    const salesByCat: Record<string, number> = {};
    filteredSales.forEach(t => {
      if (t.status !== 'Paid') return;
      t.items.forEach(item => {
        const cat = menuItems.find(m => m.id === item.id)?.category || 'Other';
        salesByCat[cat] = (salesByCat[cat] || 0) + (item.price * item.quantity);
      });
    });
    const totalSalesValue = Object.values(salesByCat).reduce((a, b) => a + b, 0) || 1;
    const pieData = Object.entries(salesByCat).map(([name, raw], idx) => ({
      name, raw, value: Math.round((raw / totalSalesValue) * 100), color: TROPICAL_COLORS[idx % TROPICAL_COLORS.length]
    })).sort((a,b) => b.raw - a.raw);
    return { grossRev, totalExp, pieData };
  }, [filteredSales, filteredExpenses, menuItems]);

  const handleSyncMenu = async () => {
    if (!confirm("Overwrite local menu with system defaults?")) return;
    setIsSyncingMenu(true);
    await LocalDB.saveMenu(MENU_ITEMS);
    await onRefresh();
    setIsSyncingMenu(false);
  };

  const handleRepairDates = async () => {
    setIsRepairingDates(true);
    const todayISO = new Date().toISOString();
    const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayYMD = getNairobiYMD(yesterdayDate.toISOString());
    const targets = salesHistory.filter(t => getNairobiYMD(t.date) === yesterdayYMD);
    for (const t of targets) {
      if (navigator.onLine) await DB.updateTransactionDate(t.id, todayISO);
      await LocalDB.queueOrder({ ...t, date: todayISO });
    }
    await onRefresh();
    setIsRepairingDates(false);
  };

  const handleSaveInvItem = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const item: InventoryItem = {
      id: editingInvItem?.id || `inv-${Date.now()}`,
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      category: formData.get('category') as InventoryCategory,
      lowStockThreshold: Number(formData.get('threshold'))
    };
    await onSaveInventoryItem(item);
    setIsSaving(false); setIsInvModalOpen(false);
  };

  const handleSaveMenuForm = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const item: MenuItem = {
      id: editingMenuItem?.id || `menu-${Date.now()}`,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as Category,
      image: formData.get('image') as string,
      description: formData.get('description') as string,
      stock: Number(formData.get('stock')),
      lowStockThreshold: Number(formData.get('threshold'))
    };
    await onSaveItem(item);
    setIsSaving(false); setIsMenuModalOpen(false);
  };

  const handleSaveExpenseForm = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as any,
      recordedBy: currentUser.name
    };
    await onSaveExpense(newExp);
    setIsSaving(false); setIsExpenseModalOpen(false);
  };

  const NavLink = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center justify-between px-6 py-5 rounded-[22px] transition-all ${activeTab === id ? 'bg-[#4B3621] text-white shadow-xl translate-x-1' : 'text-gray-400 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-4"><Icon size={22} /> <span className="text-sm font-black uppercase tracking-widest">{label}</span></div>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FDFCF9] font-sans overflow-hidden text-[#4B3621]">
      <aside className="w-[340px] bg-white border-r border-gray-100 flex flex-col shrink-0 z-20 shadow-lg">
        <div className="p-12 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-2xl p-2 border border-gray-50 overflow-hidden">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-black text-[#4B3621] leading-none mb-2">Tropical Admin</h1>
            <span className="bg-teal-50 text-teal-700 text-[10px] font-black px-4 py-1.5 rounded-full tracking-[2px] uppercase">Management Console</span>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-3 py-6 overflow-y-auto scrollbar-thin">
          <NavLink id="reports" label="Analytics" icon={BarChart3} />
          <NavLink id="inventory" label="Inventory" icon={Package} />
          <NavLink id="menu" label="Catalogue" icon={Layers} />
          <NavLink id="finances" label="Financials" icon={DollarSign} />
          <div className="py-6"><div className="h-px bg-gray-100 w-full mb-6"></div><p className="px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Team Identity</p></div>
          <NavLink id="users" label="Personnel" icon={Users} />
          <NavLink id="security" label="Cyber Core" icon={ShieldAlert} />
        </nav>
        <div className="p-10 border-t border-gray-50">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-3 px-6 py-5 text-red-500 hover:bg-red-50 rounded-[22px] transition-all font-black text-xs uppercase tracking-widest">
            <LogOut size={18} /> Exit Console
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-28 bg-white border-b border-gray-100 px-12 flex justify-between items-center shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/')} className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-[20px] text-gray-400 hover:text-[#4B3621] hover:bg-gray-100 transition-all shadow-inner">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-4xl font-serif font-black capitalize tracking-tighter">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={handleManualRefresh} className={`w-14 h-14 flex items-center justify-center rounded-[20px] border-2 border-gray-50 text-gray-300 hover:text-teal-600 hover:border-teal-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
              <RefreshCw size={24} />
            </button>
            {activeTab === 'inventory' && <button onClick={() => { setEditingInvItem(null); setIsInvModalOpen(true); }} className="bg-[#4B3621] text-white px-10 py-5 rounded-[22px] text-xs font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all tracking-widest uppercase">
              <Plus size={22} /> New Asset
            </button>}
            {activeTab === 'menu' && <button onClick={() => { setEditingMenuItem(null); setIsMenuModalOpen(true); }} className="bg-[#4B3621] text-white px-10 py-5 rounded-[22px] text-xs font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all tracking-widest uppercase">
              <Plus size={22} /> New Product
            </button>}
            {activeTab === 'finances' && <button onClick={() => setIsExpenseModalOpen(true)} className="bg-red-500 text-white px-10 py-5 rounded-[22px] text-xs font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all tracking-widest uppercase">
              <DollarSign size={22} /> Record Outflow
            </button>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB] scroll-smooth">
          <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {activeTab === 'reports' && (
              <div className="space-y-12">
                {/* ... (your reports tab content remains unchanged) ... */}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="bg-white rounded-[56px] shadow-sm border border-gray-50 overflow-hidden">
                {/* ... (your inventory table content remains unchanged) ... */}
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="bg-white rounded-[56px] shadow-sm border border-gray-50 overflow-hidden">
                {/* ... (your menu table content remains unchanged) ... */}
              </div>
            )}

            {activeTab === 'finances' && (
              <div className="bg-white rounded-[56px] shadow-sm border border-gray-50 overflow-hidden">
                {/* ... (your finances table content remains unchanged) ... */}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ... (your security tab content remains unchanged) ... */}
              </div>
            )}
          </div>
        </div>

        {/* MODALS IMPLEMENTATION */}
        {/* ... (your modals remain unchanged) ... */}
      </main>
    </div>
  );
};
