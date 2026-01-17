
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, User, Category, UserRole, SaleTransaction, PaymentMethod, Expense, AuditLog, InventoryItem, InventoryCategory } from '../types.ts';
import { CURRENCY, LOGO_URL, MENU_ITEMS } from '../constants.ts';
import { 
  Plus, Trash2, Save, Package, Users, BarChart3, PieChart, 
  RefreshCw, DollarSign, Printer, Clock, CheckCircle, LogOut, 
  ArrowLeft, Search, X, TrendingUp, TrendingDown, Activity, 
  ShieldAlert, Download, ShoppingCart, Sparkles, Camera, Edit3, 
  Wand2, DatabaseBackup, UploadCloud, Layers, Beef, Egg, Cake, 
  GlassWater, Wheat, Carrot, Minus, UserPlus
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  menuItems, users, salesHistory, expenses, auditLogs, inventory,
  onUpdateStock, onSaveInventoryItem, onDeleteInventoryItem,
  onSaveItem, onDeleteItem, onSaveUser, onDeleteUser,
  onSaveExpense, onDeleteExpense, onClose, onRefresh,
  currentUserRole, currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'users' | 'reports' | 'finances' | 'security' | 'inventory'>('reports');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // Filtering & Search
  const [dateRange, setDateRange] = useState<'Day' | 'Yesterday' | 'Week' | 'Month' | 'All'>('Day');
  const [searchTerm, setSearchTerm] = useState('');
  const [invSearchTerm, setInvSearchTerm] = useState('');

  // Modals
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingInvItem, setEditingInvItem] = useState<InventoryItem | null>(null);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Recovery & Maintenance states
  const [isRepairingDates, setIsRepairingDates] = useState(false);
  const [isSyncingMenu, setIsSyncingMenu] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recoveryList, setRecoveryList] = useState<SaleTransaction[]>([]);

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
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    if (dateRange === 'Week') return tYMD >= getNairobiYMD(weekAgo.toISOString());
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
    if (dateRange === 'Month') return tYMD >= getNairobiYMD(monthAgo.toISOString());
    return true;
  };

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

  // KPI Calculations
  const filteredSales = useMemo(() => salesHistory.filter(t => isDateInFilter(t.date)), [salesHistory, dateRange]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isDateInFilter(e.date)), [expenses, dateRange]);
  const filteredInventory = useMemo(() => inventory.filter(i => i.name.toLowerCase().includes(invSearchTerm.toLowerCase())), [inventory, invSearchTerm]);
  const filteredMenuItems = useMemo(() => menuItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())), [menuItems, searchTerm]);

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

  const handleRepairDates = async () => {
    if (!confirm("Repair dates for orders misfiled as 'Yesterday' (Nairobi Time)?")) return;
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

  const handleSyncMenu = async () => {
    if (!confirm("Overwrite menu with system defaults?")) return;
    setIsSyncingMenu(true);
    await LocalDB.saveMenu(MENU_ITEMS);
    await onRefresh();
    setIsSyncingMenu(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const newItem: MenuItem = { 
        id: editingItem?.id || `item-${Date.now()}`, 
        name: formData.get('name') as string, price: Number(formData.get('price')), 
        category: formData.get('category') as Category, image: formData.get('image') as string, 
        description: formData.get('description') as string, stock: Number(formData.get('stock')), 
        lowStockThreshold: Number(formData.get('threshold')) 
    };
    await onSaveItem(newItem); setIsSaving(false); setEditingItem(null); setIsAddingItem(false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const newUser: User = { 
        id: editingUser?.id || `user-${Date.now()}`, name: formData.get('name') as string, 
        role: formData.get('role') as UserRole, pin: formData.get('pin') as string, avatar: avatarPreview || undefined
    };
    await onSaveUser(newUser); setIsSaving(false); setEditingUser(null); setIsAddingUser(false); setAvatarPreview(null);
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

  const NavButton = ({ icon: Icon, label, id }: { icon: any, label: string, id: typeof activeTab }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === id ? 'bg-gray-900 text-white shadow-xl translate-x-1' : 'text-gray-500 hover:bg-gray-50'}`}>
        <Icon size={20} />
        <span className="text-sm font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden text-gray-900">
      {/* Sidebar */}
      <aside className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0">
         <div className="p-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl p-2 border border-gray-100">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black">Admin</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-tropical-600">Lodwar Station</p>
            </div>
         </div>
         <nav className="flex-1 px-6 space-y-2 py-6 overflow-y-auto">
            <NavButton icon={BarChart3} label="Analytics" id="reports" />
            <NavButton icon={Package} label="Inventory" id="inventory" />
            <NavButton icon={Layers} label="Menu Management" id="menu" />
            <NavButton icon={DollarSign} label="Financials" id="finances" />
            <div className="py-6"><div className="h-px bg-gray-100 w-full mb-6"></div><p className="px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Personnel</p></div>
            <NavButton icon={Users} label="Staffing" id="users" />
            <NavButton icon={ShieldAlert} label="Security & Sync" id="security" />
         </nav>
         <div className="p-8 border-t border-gray-100">
            <button onClick={onClose} className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"><LogOut size={18} /> Exit Management</button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         <header className="h-24 bg-white border-b border-gray-100 px-12 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 shadow-sm transition-all"><ArrowLeft size={22} /></button>
                <h2 className="text-3xl font-serif font-black capitalize tracking-tight">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={handleManualRefresh} className={`w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={22}/></button>
               {activeTab === 'inventory' && <button onClick={() => { setEditingInvItem(null); setIsInvModalOpen(true); }} className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-3"><Plus size={20} /> New SKU</button>}
               {activeTab === 'menu' && <button onClick={() => setIsAddingItem(true)} className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-3"><Plus size={20} /> Add Product</button>}
               {activeTab === 'users' && <button onClick={() => setIsAddingUser(true)} className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-3"><UserPlus size={20} /> Add Staff</button>}
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {activeTab === 'reports' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
                        <div className="flex p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm gap-1 w-fit">
                            {['Day', 'Yesterday', 'Week', 'Month', 'All'].map(r => (
                                <button key={r} onClick={() => setDateRange(r as any)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}>{r}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Revenue</p><h3 className="text-4xl font-black text-tropical-700">{CURRENCY} {reportStats.grossRev.toLocaleString()}</h3></div>
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Operational Exp</p><h3 className="text-4xl font-black text-red-600">{CURRENCY} {reportStats.totalExp.toLocaleString()}</h3></div>
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Orders Count</p><h3 className="text-4xl font-black text-gray-900">{filteredSales.length}</h3></div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-10 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50/30 gap-6">
                           <div><h3 className="font-serif text-3xl font-black">Resource Ledger</h3><p className="text-sm text-gray-400 font-bold">Kitchen & Coffee Supplies</p></div>
                           <div className="relative w-full md:w-80"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input type="text" placeholder="Search SKU..." value={invSearchTerm} onChange={(e) => setInvSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-[20px] outline-none font-bold text-sm bg-white" /></div>
                        </div>
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-50">
                                {filteredInventory.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-10 py-8"><div className="flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-lg transition-all">{getInventoryIcon(item.category)}</div><div><p className="font-black text-lg text-gray-900">{item.name}</p><p className="text-[10px] font-black text-gray-400 uppercase">{item.category}</p></div></div></td>
                                        <td className="px-10 py-8"><p className="text-2xl font-black text-gray-900">{item.quantity} <span className="text-xs font-bold text-gray-400 uppercase">{item.unit}</span></p></td>
                                        <td className="px-10 py-8 text-right"><div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onUpdateStock(item.id, -1)} className="p-3 bg-white border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 shadow-sm"><Minus size={18}/></button><button onClick={() => onUpdateStock(item.id, 1)} className="p-3 bg-white border border-gray-200 rounded-xl text-tropical-600 hover:bg-tropical-50 shadow-sm"><Plus size={18}/></button><button onClick={() => { setEditingInvItem(item); setIsInvModalOpen(true); }} className="p-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black"><Edit3 size={18}/></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-10 border-b flex justify-between items-center bg-gray-50/30">
                           <div className="relative w-80"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input type="text" placeholder="Filter products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-[20px] outline-none font-bold text-sm bg-white" /></div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b"><tr><th className="px-10 py-6">Identity</th><th className="px-10 py-6">Value</th><th className="px-10 py-6 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMenuItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-10 py-8"><div className="flex items-center gap-6"><div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div><div><p className="font-black text-xl text-gray-900 leading-none">{item.name}</p><p className="text-[10px] font-black text-tropical-600 uppercase tracking-widest mt-2">{item.category}</p></div></div></td>
                                        <td className="px-10 py-8 text-xl font-black">{CURRENCY} {item.price.toLocaleString()}</td>
                                        <td className="px-10 py-8 text-right"><div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingItem(item); setIsAddingItem(true); }} className="p-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black"><Edit3 size={18}/></button><button onClick={() => onDeleteItem(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white"><Trash2 size={18}/></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[40px] border border-orange-100 shadow-sm">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-orange-900"><Wand2 size={24}/> Data Correction</h3>
                            <p className="text-sm text-orange-700 mb-8">Move orders from yesterday to today to fix timezone mismatches in reporting.</p>
                            <button onClick={handleRepairDates} disabled={isRepairingDates} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-orange-700 transition-all">
                                {isRepairingDates ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Repair Today's Orders
                            </button>
                        </div>
                        <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-blue-900"><DatabaseBackup size={24}/> System Sync</h3>
                            <p className="text-sm text-blue-700 mb-8">Restore the local database menu items to default system items if data is corrupted.</p>
                            <button onClick={handleSyncMenu} disabled={isSyncingMenu} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all">
                                {isSyncingMenu ? <RefreshCw className="animate-spin" /> : <DatabaseBackup />} Sync Menu Defaults
                            </button>
                        </div>
                    </div>
                )}
            </div>
         </div>

         {/* MODALS */}
         {isInvModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-6">
                <div className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsInvModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"><X size={32}/></button>
                    <h3 className="font-serif text-3xl font-black mb-8 text-gray-900">{editingInvItem ? 'Edit Asset SKU' : 'New Stock Asset'}</h3>
                    <form onSubmit={handleSaveInvItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Formal Item Name</label><input name="name" defaultValue={editingInvItem?.name} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-bold outline-none" required /></div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Level</label><input name="quantity" type="number" step="0.01" defaultValue={editingInvItem?.quantity} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-black" required /></div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Metric Unit</label><input name="unit" defaultValue={editingInvItem?.unit} placeholder="Kgs" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-bold" required /></div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Classification</label><select name="category" defaultValue={editingInvItem?.category || 'Beverages'} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-black text-xs uppercase tracking-widest"><option>Beverages</option><option>Bakery & Pastries</option><option>Meat & Poultry</option><option>Dairy & Eggs</option><option>Vegetables</option><option>Dry Goods</option></select></div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block text-red-600">Low Stock Alert</label><input name="threshold" type="number" defaultValue={editingInvItem?.lowStockThreshold} className="w-full p-5 bg-gray-50 border border-red-100 rounded-[24px] font-black text-red-600" required /></div>
                        <div className="md:col-span-2 pt-8 flex gap-4"><button type="button" onClick={() => setIsInvModalOpen(false)} className="flex-1 py-5 border border-gray-200 rounded-[24px] font-black text-xs uppercase text-gray-400">Discard</button><button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase shadow-2xl hover:bg-black transition-all">{isSaving ? 'Processing...' : 'Commit SKU'}</button></div>
                    </form>
                </div>
            </div>
         )}

         {isAddingItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-6">
                <div className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsAddingItem(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"><X size={32}/></button>
                    <h3 className="font-serif text-3xl font-black mb-8 text-gray-900">{editingItem ? 'Edit Product' : 'New Product'}</h3>
                    <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Product Name</label><input name="name" defaultValue={editingItem?.name} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-bold outline-none" required /></div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Price ({CURRENCY})</label><input name="price" type="number" defaultValue={editingItem?.price} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-black" required /></div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Category</label><select name="category" defaultValue={editingItem?.category || Category.MAINS} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-black text-xs uppercase">{Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Image URL</label><input name="image" defaultValue={editingItem?.image} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-bold outline-none" required /></div>
                        <div className="md:col-span-2 pt-8 flex gap-4"><button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 py-5 border border-gray-200 rounded-[24px] font-black text-xs uppercase text-gray-400">Discard</button><button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase shadow-2xl hover:bg-black transition-all">Save Product</button></div>
                    </form>
                </div>
            </div>
         )}

         {isAddingUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-6">
                <div className="bg-white w-full max-w-md rounded-[48px] p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsAddingUser(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"><X size={32}/></button>
                    <h3 className="font-serif text-3xl font-black mb-8 text-center text-gray-900">Staff Identity</h3>
                    <form onSubmit={handleSaveUser} className="space-y-8">
                        <div className="flex justify-center mb-4">
                           <label className="relative cursor-pointer group">
                             <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-tropical-400">
                                {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <Camera className="text-gray-300" size={32}/>}
                             </div>
                             <input type="file" accept="image/*" onChange={(e) => {
                               const file = e.target.files?.[0];
                               if(file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => setAvatarPreview(reader.result as string);
                                 reader.readAsDataURL(file);
                               }
                            }} className="hidden" />
                           </label>
                        </div>
                        <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block text-center">Display Name</label><input name="name" defaultValue={editingUser?.name} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-center outline-none" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Role</label><select name="role" defaultValue={editingUser?.role || 'Waiter'} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] font-black text-xs uppercase tracking-widest"><option>Admin</option><option>Cashier</option><option>Waiter</option><option>Chef</option><option>Barista</option></select></div>
                           <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block text-center">Pin (4 Digits)</label><input name="pin" defaultValue={editingUser?.pin} maxLength={4} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-center font-mono tracking-widest font-black text-xl outline-none" required /></div>
                        </div>
                        <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsAddingUser(false)} className="flex-1 py-5 border border-gray-100 rounded-[24px] font-black text-xs uppercase text-gray-400">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-5 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase shadow-2xl hover:bg-black transition-all">Authorize</button></div>
                    </form>
                </div>
            </div>
         )}

      </main>
    </div>
  );
};
