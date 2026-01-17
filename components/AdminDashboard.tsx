
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

// Helper to get inventory category icons
const getInventoryIcon = (cat: InventoryCategory) => {
  switch(cat) {
    case 'Meat & Poultry': return <Beef size={20} />;
    case 'Dairy & Eggs': return <Egg size={20} />;
    case 'Beverages': return <GlassWater size={20} />;
    case 'Bakery & Pastries': return <Cake size={20} />;
    case 'Dry Goods': return <Wheat size={20} />;
    case 'Vegetables': return <Carrot size={20} />;
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
         <div className="p-10 border-t border-gray-50"><button onClick={onClose} className="w-full flex items-center justify-center gap-3 px-6 py-5 text-red-500 hover:bg-red-50 rounded-[22px] transition-all font-black text-xs uppercase tracking-widest"><LogOut size={18} /> Exit Console</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
         <header className="h-28 bg-white border-b border-gray-100 px-12 flex justify-between items-center shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-8">
                <button onClick={() => navigate('/')} className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-[20px] text-gray-400 hover:text-[#4B3621] hover:bg-gray-100 transition-all shadow-inner"><ArrowLeft size={24} /></button>
                <h2 className="text-4xl font-serif font-black capitalize tracking-tighter">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-5">
               <button onClick={handleManualRefresh} className={`w-14 h-14 flex items-center justify-center rounded-[20px] border-2 border-gray-50 text-gray-300 hover:text-teal-600 hover:border-teal-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={24}/></button>
               {activeTab === 'inventory' && <button onClick={() => { setEditingInvItem(null); setIsInvModalOpen(true); }} className="bg-[#4B3621] text-white px-10 py-5 rounded-[22px] text-xs font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all tracking-widest uppercase"><Plus size={22} /> New Asset</button>}
               {activeTab === 'menu' && <button onClick={() => { setEditingMenuItem(null); setIsMenuModalOpen(true); }} className="bg-[#4B3621] text-white px-10 py-5 rounded-[22px] text-xs font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all tracking-widest uppercase"><Plus size={22} /> New Product</button>}
               {activeTab === 'finances' && <button onClick={() => setIsExpenseModalOpen(true)} className="bg-red-500 text-white px-10 py-5 rounded-[22px] text-xs font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all tracking-widest uppercase"><DollarSign size={22} /> Record Outflow</button>}
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB] scroll-smooth">
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                
                {activeTab === 'reports' && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex p-2 bg-white rounded-[24px] border border-gray-100 shadow-sm gap-1 w-fit overflow-x-auto">
                                {['Day', 'Yesterday', 'Week', 'Month', 'All', 'Custom'].map(r => (
                                    <button key={r} onClick={() => setDateRange(r as any)} className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-[#4B3621] text-white shadow-xl' : 'text-gray-400 hover:text-[#4B3621]'}`}>{r}</button>
                                ))}
                            </div>
                            {dateRange === 'Custom' && (
                                <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-gray-100 shadow-sm">
                                    <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-gray-50 border-none rounded-xl text-xs font-black p-2 outline-none" />
                                    <span className="text-gray-300 font-black">to</span>
                                    <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-gray-50 border-none rounded-xl text-xs font-black p-2 outline-none" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-white p-10 rounded-[48px] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2 group-hover:text-teal-600 transition-colors"><TrendingUp size={16}/> Gross Intake</p>
                                <h3 className="text-4xl font-black text-[#4B3621] tracking-tighter">{CURRENCY} {reportStats.grossRev.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white p-10 rounded-[48px] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2 group-hover:text-red-600 transition-colors"><TrendingDown size={16}/> Operational Cost</p>
                                <h3 className="text-4xl font-black text-red-500 tracking-tighter">{CURRENCY} {reportStats.totalExp.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white p-10 rounded-[48px] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2 group-hover:text-purple-600 transition-colors"><Sparkles size={16}/> Net Margin</p>
                                <h3 className={`text-4xl font-black tracking-tighter ${(reportStats.grossRev - reportStats.totalExp) >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                                    {CURRENCY} {(reportStats.grossRev - reportStats.totalExp).toLocaleString()}
                                </h3>
                            </div>
                            <div className="bg-white p-10 rounded-[48px] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2 group-hover:text-amber-600 transition-colors"><Activity size={16}/> Volume</p>
                                <h3 className="text-4xl font-black text-[#4B3621] tracking-tighter">{filteredSales.length} <span className="text-xs text-gray-300 uppercase">Tickets</span></h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                             <div className="bg-white p-12 rounded-[56px] border border-gray-50 shadow-sm">
                                <h4 className="text-xl font-black mb-12 flex items-center gap-4 uppercase tracking-tighter"><Trophy size={28} className="text-amber-500"/> Top Tropical Movers</h4>
                                <div className="space-y-6">
                                    {fastSellingItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-50 group hover:bg-white hover:shadow-xl transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-[22px] bg-white text-[#4B3621] flex items-center justify-center font-black text-lg shadow-sm border border-gray-50 group-hover:bg-[#4B3621] group-hover:text-white transition-all">#{idx+1}</div>
                                                <div>
                                                    <p className="font-black text-lg text-[#4B3621]">{item.name}</p>
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Revenue: {CURRENCY} {item.total.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-white px-6 py-2.5 rounded-full text-xs font-black text-[#4B3621] shadow-sm border border-gray-50">{item.quantity} SOLD</span>
                                            </div>
                                        </div>
                                    ))}
                                    {fastSellingItems.length === 0 && <div className="py-20 text-center text-gray-300 italic">No sales logs found for this filter.</div>}
                                </div>
                             </div>

                             <div className="bg-white p-12 rounded-[56px] border border-gray-50 shadow-sm flex flex-col">
                                <h4 className="text-xl font-black mb-12 flex items-center gap-4 uppercase tracking-tighter"><PieChart size={28} className="text-teal-600"/> Revenue Segregation</h4>
                                <div className="flex-1 flex flex-col justify-center items-center gap-12">
                                     <div className="w-64 h-64 relative">
                                        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                                            {reportStats.pieData.map((d, i, arr) => {
                                                let cumulative = arr.slice(0, i).reduce((sum, item) => sum + (item.value / 100), 0);
                                                const x1 = Math.cos(2 * Math.PI * cumulative);
                                                const y1 = Math.sin(2 * Math.PI * cumulative);
                                                const x2 = Math.cos(2 * Math.PI * (cumulative + (d.value / 100)));
                                                const y2 = Math.sin(2 * Math.PI * (cumulative + (d.value / 100)));
                                                const largeArc = d.value > 50 ? 1 : 0;
                                                return <path key={i} d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`} fill={d.color} className="stroke-white stroke-[0.02] hover:opacity-80 transition-opacity cursor-pointer" />;
                                            })}
                                        </svg>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4 w-full">
                                         {reportStats.pieData.map((d, i) => (
                                             <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-[20px] border border-gray-50">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-3 h-3 rounded-full" style={{ background: d.color }}></div>
                                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[80px]">{d.name}</span>
                                                 </div>
                                                 <span className="text-xs font-black">{d.value}%</span>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="bg-white rounded-[56px] shadow-sm border border-gray-50 overflow-hidden">
                        <div className="p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/20 gap-8">
                           <div>
                              <h3 className="font-serif text-4xl font-black text-[#4B3621] tracking-tighter">Resource Ledger</h3>
                              <p className="text-sm text-gray-400 font-bold mt-2">Station Supplies & Asset Tracking</p>
                           </div>
                           <div className="relative w-full md:w-[400px]">
                              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
                              <input type="text" placeholder="Filter by asset name..." value={invSearchTerm} onChange={(e) => setInvSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 border-2 border-gray-100 rounded-[28px] outline-none focus:ring-4 focus:ring-teal-50 focus:border-teal-100 transition-all font-bold text-lg bg-white" />
                           </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[3px] text-gray-300 border-b border-gray-50">
                                <tr><th className="px-12 py-6">Asset SKU</th><th className="px-12 py-6">Status Level</th><th className="px-12 py-6 text-right">Commit Ops</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredInventory.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 rounded-[24px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-2xl transition-all group-hover:-rotate-3">
                                                    {getInventoryIcon(item.category)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-xl text-[#4B3621] leading-none mb-2">{item.name}</p>
                                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col">
                                                <p className={`text-3xl font-black tracking-tighter ${item.quantity <= item.lowStockThreshold ? 'text-red-500' : 'text-[#4B3621]'}`}>
                                                    {item.quantity} <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{item.unit}</span>
                                                </p>
                                                <div className="w-48 h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                                                    <div className={`h-full transition-all duration-1000 ${item.quantity <= item.lowStockThreshold ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (item.quantity / (item.lowStockThreshold * 4)) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                                                <button onClick={() => onUpdateStock(item.id, -1)} className="p-4 bg-white border-2 border-gray-50 rounded-[20px] text-red-400 hover:text-red-600 hover:shadow-xl transition-all active:scale-90 shadow-sm"><Minus size={20}/></button>
                                                <button onClick={() => onUpdateStock(item.id, 1)} className="p-4 bg-white border-2 border-gray-50 rounded-[20px] text-teal-500 hover:text-teal-700 hover:shadow-xl transition-all active:scale-90 shadow-sm"><Plus size={20}/></button>
                                                <button onClick={() => { setEditingInvItem(item); setIsInvModalOpen(true); }} className="p-4 bg-[#4B3621] text-white rounded-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all"><Edit3 size={20}/></button>
                                                <button onClick={() => onDeleteInventoryItem(item.id)} className="p-4 bg-red-50 text-red-500 rounded-[20px] hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInventory.length === 0 && <tr><td colSpan={3} className="text-center py-40 text-gray-300 italic font-bold">No matching assets found in the ledger.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="bg-white rounded-[56px] shadow-sm border border-gray-50 overflow-hidden">
                        <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                           <div className="relative w-[400px]">
                              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
                              <input type="text" placeholder="Filter products..." value={menuSearchTerm} onChange={(e) => setMenuSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 border-2 border-gray-100 rounded-[28px] outline-none focus:ring-4 focus:ring-teal-50 transition-all font-bold text-lg bg-white" />
                           </div>
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[3px]">Items Live: {menuItems.length}</p>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[3px] text-gray-300 border-b border-gray-50">
                                <tr><th className="px-12 py-6">Public Identity</th><th className="px-12 py-6">Value Point</th><th className="px-12 py-6 text-right">Maintenance</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMenuItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 rounded-[32px] bg-gray-100 border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:scale-110 transition-all">
                                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-2xl text-[#4B3621] leading-none mb-2 tracking-tighter">{item.name}</p>
                                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 font-black text-2xl tracking-tighter">{CURRENCY} {item.price.toLocaleString()}</td>
                                        <td className="px-12 py-10 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button onClick={() => { setEditingMenuItem(item); setIsMenuModalOpen(true); }} className="p-5 bg-[#4B3621] text-white rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all"><Edit3 size={22}/></button>
                                                <button onClick={() => onDeleteItem(item.id)} className="p-5 bg-red-50 text-red-500 rounded-[24px] hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={22}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'finances' && (
                    <div className="bg-white rounded-[56px] shadow-sm border border-gray-50 overflow-hidden">
                        <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <h3 className="font-serif text-4xl font-black text-[#4B3621] tracking-tighter">Expense Ledger</h3>
                            <div className="bg-white px-8 py-4 rounded-[24px] border border-gray-100 shadow-xl flex items-center gap-6">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Period Outflow</p>
                                <span className="text-2xl font-black text-red-500">{CURRENCY} {reportStats.totalExp.toLocaleString()}</span>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[3px] text-gray-300 border-b border-gray-50">
                                <tr><th className="px-12 py-6">Timeline</th><th className="px-12 py-6">Classification</th><th className="px-12 py-6">Description</th><th className="px-12 py-6 text-right">KES Amount</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredExpenses.map(e => (
                                    <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-12 py-10 font-bold text-gray-500">{new Date(e.date).toLocaleDateString('en-GB')}</td>
                                        <td className="px-12 py-10"><span className="px-6 py-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-[9px] font-black uppercase tracking-widest text-gray-400">{e.category}</span></td>
                                        <td className="px-12 py-10 font-black text-lg text-[#4B3621]">{e.description}</td>
                                        <td className="px-12 py-10 text-right"><div className="flex justify-end items-center gap-6"><span className="text-2xl font-black text-red-500 tracking-tighter">-{e.amount.toLocaleString()}</span><button onClick={() => onDeleteExpense(e.id)} className="p-3 text-red-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button></div></td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && <tr><td colSpan={4} className="text-center py-40 text-gray-300 italic font-bold">No financial outflows recorded in this window.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white p-12 rounded-[56px] border border-orange-50 shadow-sm group hover:shadow-2xl transition-all">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-4 text-orange-900 tracking-tighter"><Wand2 size={28}/> Data Correction Hub</h3>
                            <p className="text-sm text-orange-700/60 font-bold mb-10 leading-relaxed">Fix accounting mismatches caused by timezone offsets. Move all records from yesterday's ledger to today's Lodwar Business Day.</p>
                            <button onClick={handleRepairDates} disabled={isRepairingDates} className="w-full py-6 bg-orange-600 text-white rounded-[28px] font-black uppercase text-xs tracking-[4px] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4">
                                {isRepairingDates ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Repair Ledger Timing
                            </button>
                        </div>
                        <div className="bg-white p-12 rounded-[56px] border border-blue-50 shadow-sm group hover:shadow-2xl transition-all">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-4 text-blue-900 tracking-tighter"><DatabaseBackup size={28}/> System Integrity</h3>
                            <p className="text-sm text-blue-700/60 font-bold mb-10 leading-relaxed">Restore standard menu items if the local database is out of sync or missing core products from the Tropical Dreams collection.</p>
                            <button onClick={handleSyncMenu} disabled={isSyncingMenu} className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black uppercase text-xs tracking-[4px] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4">
                                {isSyncingMenu ? <RefreshCw className="animate-spin" /> : <DatabaseBackup />} Restore Defaults
                            </button>
                        </div>
                    </div>
                )}
            </div>
         </div>

         {/* MODALS IMPLEMENTATION */}
         {isInvModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4B3621]/80 backdrop-blur-xl p-6">
                <div className="bg-white w-full max-w-2xl rounded-[64px] p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsInvModalOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-[#4B3621] transition-all p-3 hover:bg-gray-50 rounded-full"><X size={32}/></button>
                    <h3 className="font-serif text-4xl font-black mb-10 text-[#4B3621] tracking-tighter">{editingInvItem ? 'Edit Asset SKU' : 'New Station Asset'}</h3>
                    <form onSubmit={handleSaveInvItem} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Formal Item Name</label><input name="name" defaultValue={editingInvItem?.name} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg focus:ring-8 focus:ring-teal-50 outline-none transition-all" required /></div>
                        <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Current Level</label><input name="quantity" type="number" step="0.01" defaultValue={editingInvItem?.quantity} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                        <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Unit (Kgs/Pcs)</label><input name="unit" defaultValue={editingInvItem?.unit} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                        <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Classification</label><select name="category" defaultValue={editingInvItem?.category || 'Beverages'} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-widest outline-none"><option>Beverages</option><option>Bakery & Pastries</option><option>Meat & Poultry</option><option>Dairy & Eggs</option><option>Vegetables</option><option>Dry Goods</option></select></div>
                        <div><label className="text-[10px] font-black text-red-300 uppercase tracking-[4px] mb-4 block">Critical Warning</label><input name="threshold" type="number" defaultValue={editingInvItem?.lowStockThreshold} className="w-full p-6 bg-red-50/30 border-2 border-red-50 rounded-[28px] font-black text-red-500 text-lg outline-none" required /></div>
                        <div className="md:col-span-2 pt-10 flex gap-6"><button type="button" onClick={() => setIsInvModalOpen(false)} className="flex-1 py-6 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-[4px] text-gray-300">Discard</button><button type="submit" disabled={isSaving} className="flex-[2] py-6 bg-[#4B3621] text-white rounded-[28px] font-black text-[10px] uppercase tracking-[4px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Commit SKU</button></div>
                    </form>
                </div>
            </div>
         )}

         {isMenuModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4B3621]/80 backdrop-blur-xl p-6">
                <div className="bg-white w-full max-w-2xl rounded-[64px] p-16 shadow-2xl relative animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsMenuModalOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-[#4B3621] transition-all p-3 hover:bg-gray-50 rounded-full"><X size={32}/></button>
                    <h3 className="font-serif text-4xl font-black mb-10 text-[#4B3621] tracking-tighter">{editingMenuItem ? 'Update Product' : 'Fresh Product Entry'}</h3>
                    <form onSubmit={handleSaveMenuForm} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Product Name</label><input name="name" defaultValue={editingMenuItem?.name} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                        <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Price ({CURRENCY})</label><input name="price" type="number" defaultValue={editingMenuItem?.price} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                        <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Category</label><select name="category" defaultValue={editingMenuItem?.category || Category.MAINS} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-widest outline-none">{Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">High-Res Image URL</label><input name="image" defaultValue={editingMenuItem?.image} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Brief Description</label><textarea name="description" defaultValue={editingMenuItem?.description} className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-bold text-lg outline-none h-32" /></div>
                        <div className="md:col-span-2 pt-10 flex gap-6"><button type="button" onClick={() => setIsMenuModalOpen(false)} className="flex-1 py-6 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-[4px] text-gray-300">Abort</button><button type="submit" disabled={isSaving} className="flex-[2] py-6 bg-[#4B3621] text-white rounded-[28px] font-black text-[10px] uppercase tracking-[4px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Save Changes</button></div>
                    </form>
                </div>
            </div>
         )}

         {isExpenseModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4B3621]/80 backdrop-blur-xl p-6">
                <div className="bg-white w-full max-w-xl rounded-[64px] p-16 shadow-2xl relative animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsExpenseModalOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-[#4B3621] transition-all p-3 hover:bg-gray-50 rounded-full"><X size={32}/></button>
                    <h3 className="font-serif text-4xl font-black mb-10 text-red-500 tracking-tighter">Record Outflow</h3>
                    <form onSubmit={handleSaveExpenseForm} className="space-y-10">
                        <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Ledger Description</label><input name="description" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                        <div className="grid grid-cols-2 gap-10">
                            <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Amount (KES)</label><input name="amount" type="number" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-lg outline-none" required /></div>
                            <div><label className="text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-4 block">Sector</label><select name="category" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-widest outline-none"><option>Inventory Restock</option><option>Utilities</option><option>Salaries</option><option>Maintenance</option><option>Rent</option><option>Other</option></select></div>
                        </div>
                        <div className="flex gap-6 pt-10"><button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 py-6 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-[4px] text-gray-300">Cancel</button><button type="submit" disabled={isSaving} className="flex-[2] py-6 bg-red-500 text-white rounded-[28px] font-black text-[10px] uppercase tracking-[4px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Record Ledger</button></div>
                    </form>
                </div>
            </div>
         )}
      </main>
    </div>
  );
};
