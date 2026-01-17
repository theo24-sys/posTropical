
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, User, Category, UserRole, SaleTransaction, PaymentMethod, Expense, AuditLog } from '../types.ts';
import { CURRENCY, LOGO_URL, MENU_ITEMS } from '../constants.ts';
import { Plus, Trash2, Save, Package, Users, BarChart3, PieChart, AlertTriangle, Filter, ChevronDown, ChevronUp, RefreshCw, DollarSign, Printer, Clock, CheckCircle, LogOut, ArrowLeft, MoreHorizontal, Search, X, TrendingUp, TrendingDown, Activity, Wallet, User as UserIcon, CloudOff, UploadCloud, Database, ShieldAlert, Download, FileText, ShoppingCart, Award, Camera, Image as ImageIcon, Edit3, AlertCircle, Calendar, Trophy, Wand2, DatabaseBackup } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/supabase';
import { LocalDB } from '../services/db';

interface AdminDashboardProps {
  menuItems: MenuItem[];
  users: User[];
  salesHistory: SaleTransaction[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  onSaveItem: (item: MenuItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onSaveUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onSaveExpense: (expense: Expense) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onClose: () => void; // Logout logic
  onRefresh: () => Promise<void>; // New Refresh Prop
  currentUserRole: UserRole;
  currentUser: User;
}

const TROPICAL_COLORS = [
  '#0d9488', // Teal
  '#f97316', // Orange
  '#e11d48', // Pink
  '#7c3aed', // Violet
  '#ca8a04', // Yellow
  '#2563eb', // Blue
  '#16a34a', // Green
  '#db2777', // Magenta
  '#4f46e5', // Indigo
  '#ea580c', // Burnt Orange
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  menuItems,
  users,
  salesHistory,
  expenses,
  auditLogs,
  onSaveItem,
  onDeleteItem,
  onSaveUser,
  onDeleteUser,
  onSaveExpense,
  onDeleteExpense,
  onClose,
  onRefresh,
  currentUserRole,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'users' | 'reports' | 'finances' | 'security'>('reports');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // --- Reporting Filters State ---
  const [dateRange, setDateRange] = useState<'Day' | 'Yesterday' | 'Week' | 'Month' | 'All' | 'Custom'>('Day');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'All'>('All');
  const [selectedStaff, setSelectedStaff] = useState<string>('All');
  
  // --- Transaction Table Sort State ---
  const [sortConfig, setSortConfig] = useState<{ key: keyof SaleTransaction; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  // Menu State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Expense State
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // --- Recovery Tool State ---
  const [recoveryList, setRecoveryList] = useState<SaleTransaction[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isRepairingDates, setIsRepairingDates] = useState(false);
  const [isSyncingMenu, setIsSyncingMenu] = useState(false);

  // Timezone Helper: Lodwar is UTC+3 (Africa/Nairobi)
  const getNairobiYMD = (dateString?: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
  };

  // Sync avatar state when editing a user
  useEffect(() => {
    if (editingUser) {
      setAvatarPreview(editingUser.avatar || null);
    } else {
      setAvatarPreview(null);
    }
  }, [editingUser]);


  // --- Role check effect ---
  useEffect(() => {
    if (currentUserRole === 'Waiter' || currentUserRole === 'Chef' || currentUserRole === 'Barista') {
       onClose();
    }
  }, [currentUserRole, onClose]);

  // --- Automated Tasks: Export ---
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data.length) return alert("No data to export");
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        let val = row[fieldName];
        if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`; // Escape quotes
        if (typeof val === 'object') val = `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${getNairobiYMD()}.csv`;
    link.click();
  };

  const handlePrintReports = () => {
    window.print();
  };

  const handlePrintReorderList = () => {
    const lowStock = menuItems.filter(i => i.stock <= i.lowStockThreshold);
    if (lowStock.length === 0) return alert("Inventory is healthy! No items need reordering.");
    
    const printWindow = window.open('', 'ReorderList', 'height=600,width=800');
    if(printWindow) {
        printWindow.document.write(`
            <html>
            <head><title>Shopping List</title></head>
            <body style="font-family: sans-serif; padding: 20px;">
                <h1>Tropical Dreams - Reorder List</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 20px;">
                    <thead>
                        <tr style="border-bottom: 2px solid black;">
                            <th style="padding: 8px;">Item</th>
                            <th style="padding: 8px;">Category</th>
                            <th style="padding: 8px;">Current Stock</th>
                            <th style="padding: 8px;">Threshold</th>
                            <th style="padding: 8px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lowStock.map(item => `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 8px; font-weight: bold;">${item.name}</td>
                                <td style="padding: 8px;">${item.category}</td>
                                <td style="padding: 8px; color: red;">${item.stock}</td>
                                <td style="padding: 8px;">${item.lowStockThreshold}</td>
                                <td style="padding: 8px;">[ ] ORDERED</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // --- Data Correction Handlers ---
  
  const handleSyncMenuWithConstants = async () => {
    if (!confirm("This will force the local database to update with items from the code (like the new Sausage). Continue?")) return;
    setIsSyncingMenu(true);
    try {
        await LocalDB.saveMenu(MENU_ITEMS);
        alert("Local database updated with latest system items! Refreshing...");
        await onRefresh();
    } catch (e) {
        console.error(e);
        alert("Failed to sync menu.");
    } finally {
        setIsSyncingMenu(false);
    }
  };

  const handleRepairDates = async () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayYMD = getNairobiYMD(yesterdayDate.toISOString());
    
    // Find orders that are recorded as "Yesterday" in Nairobi Time
    const misfiledOrders = salesHistory.filter(t => getNairobiYMD(t.date) === yesterdayYMD);

    if (misfiledOrders.length === 0) {
        alert("No orders found recorded as 'Yesterday' to move.");
        return;
    }

    if (!confirm(`Found ${misfiledOrders.length} orders recorded as Yesterday. Move them to Today's accounting date (Lodwar Time)?`)) return;

    setIsRepairingDates(true);
    const todayISO = new Date().toISOString();
    try {
        for (const order of misfiledOrders) {
            if (navigator.onLine) {
                await DB.updateTransactionDate(order.id, todayISO);
            }
            // Also update local sales history for immediate reflection
            const updatedTx = { ...order, date: todayISO };
            await LocalDB.queueOrder(updatedTx); 
        }
        alert("Success! Orders moved. Refreshing dashboard...");
        await onRefresh();
    } catch (e) {
        console.error(e);
        alert("Failed to repair dates. Check connection.");
    } finally {
        setIsRepairingDates(false);
    }
  };

  // --- Recovery Handlers ---
  const handleScanForMissing = async () => {
    setIsScanning(true);
    try {
        const pending = await LocalDB.getPendingOrders();
        const serverSales = await DB.getTransactions(); 
        const serverIds = new Set(serverSales.map(t => t.id));
        const missing = pending.filter(p => !serverIds.has(p.id));
        
        setRecoveryList(missing);
        if(missing.length === 0) {
            alert("Scan Complete: No unsynced records found on this device.");
        }
    } catch(e) {
        console.error(e);
        alert("Scan failed. Check console for details.");
    } finally {
        setIsScanning(false);
    }
  };

  const handleRestoreAll = async () => {
    if(recoveryList.length === 0) return;
    if(!confirm(`Attempt to restore ${recoveryList.length} orders to the cloud?`)) return;

    setIsRestoring(true);
    let successCount = 0;
    const errors = [];

    for(const tx of recoveryList) {
        try {
            await DB.saveTransaction(tx);
            await LocalDB.removeOrderFromQueue(tx.id);
            successCount++;
        } catch (e: any) {
            console.error(`Failed to restore ${tx.id}`, e);
            errors.push(`${tx.id}: ${e.message}`);
        }
    }

    setIsRestoring(false);
    
    const remaining = await LocalDB.getPendingOrders();
    const serverSales = await DB.getTransactions();
    const serverIds = new Set(serverSales.map(t => t.id));
    setRecoveryList(remaining.filter(p => !serverIds.has(p.id)));

    if(successCount > 0) {
        alert(`Successfully restored ${successCount} orders! Refreshing dashboard...`);
        handleManualRefresh();
    }
    
    if(errors.length > 0) {
        alert(`Some orders failed to restore:\n${errors.slice(0,3).join('\n')}${errors.length > 3 ? '...' : ''}`);
    }
  };

  // --- Inventory Alerts ---
  const lowStockItems = useMemo(() => {
    return menuItems.filter(item => item.stock <= item.lowStockThreshold);
  }, [menuItems]);

  // --- Filter Logic (Respecting Lodwar Time) ---
  const filteredSales = useMemo(() => {
    const todayYMD = getNairobiYMD();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayYMD = getNairobiYMD(yesterdayDate.toISOString());
    
    return salesHistory.filter(t => {
        const tYMD = getNairobiYMD(t.date);

        // Date Filter
        let dateMatch = true;
        if (dateRange === 'Day') {
            dateMatch = tYMD === todayYMD;
        } else if (dateRange === 'Yesterday') {
            dateMatch = tYMD === yesterdayYMD;
        } else if (dateRange === 'Week') {
            const start = new Date(); start.setDate(start.getDate() - 7);
            dateMatch = tYMD >= getNairobiYMD(start.toISOString()) && tYMD <= todayYMD;
        } else if (dateRange === 'Month') {
            const start = new Date(); start.setDate(start.getDate() - 30);
            dateMatch = tYMD >= getNairobiYMD(start.toISOString()) && tYMD <= todayYMD;
        } else if (dateRange === 'Custom') {
            dateMatch = tYMD >= customStartDate && tYMD <= customEndDate;
        }

        if (!dateMatch) return false;

        // Payment Filter
        if (selectedPaymentMethod !== 'All' && t.paymentMethod !== selectedPaymentMethod) return false;
        
        // Staff Filter
        if (selectedStaff !== 'All' && t.cashierName !== selectedStaff) return false;

        return true;
    });
  }, [salesHistory, dateRange, customStartDate, customEndDate, selectedPaymentMethod, selectedStaff]);

  // Helper for Expenses/Logs reuse of same logic (Nairobi Timezone)
  const isDateInFilter = (dateStr: string) => {
      const tYMD = getNairobiYMD(dateStr);
      const todayYMD = getNairobiYMD();

      if (dateRange === 'All') return true;
      if (dateRange === 'Day') return tYMD === todayYMD;
      if (dateRange === 'Yesterday') {
         const yest = new Date(); yest.setDate(yest.getDate() - 1);
         return tYMD === getNairobiYMD(yest.toISOString());
      }
      if (dateRange === 'Week') {
         const d = new Date(); d.setDate(d.getDate() - 7);
         return tYMD >= getNairobiYMD(d.toISOString()) && tYMD <= todayYMD;
      }
      if (dateRange === 'Month') {
         const d = new Date(); d.setDate(d.getDate() - 30);
         return tYMD >= getNairobiYMD(d.toISOString()) && tYMD <= todayYMD;
      }
      if (dateRange === 'Custom' && customStartDate && customEndDate) {
         return tYMD >= customStartDate && tYMD <= customEndDate;
      }
      return true;
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => isDateInFilter(e.date));
  }, [expenses, dateRange, customStartDate, customEndDate]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(l => isDateInFilter(l.date));
  }, [auditLogs, dateRange, customStartDate, customEndDate]);

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    return menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuItems, searchTerm]);

  // --- Sort Logic ---
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredSales];
    sorted.sort((a, b) => {
      const key = sortConfig.key;
      const aVal = (a as any)[key];
      const bVal = (b as any)[key];
      const safeA = (aVal === undefined || aVal === null) ? '' : aVal;
      const safeB = (bVal === undefined || bVal === null) ? '' : bVal;
      if (safeA < safeB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (safeA > safeB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSales, sortConfig]);

  // --- KPI Calculations ---
  const totalOrders = filteredSales.length;
  const paidSales = filteredSales.filter(t => t.status === 'Paid');
  const pendingSales = filteredSales.filter(t => t.status === 'Pending');
  const totalPaidRevenue = paidSales.reduce((acc, t) => acc + t.total, 0);
  const totalPendingRevenue = pendingSales.reduce((acc, t) => acc + t.total, 0);
  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalPaidRevenue - totalExpenseAmount;
  const avgOrderValue = totalOrders > 0 ? (totalPaidRevenue + totalPendingRevenue) / totalOrders : 0;
  
  // Profit Margin
  const profitMargin = totalPaidRevenue > 0 ? (netProfit / totalPaidRevenue) * 100 : 0;

  // --- Chart Calculations ---
  const chartData = useMemo(() => {
    // Default: charts use filtered data
    let barChartSource = filteredSales;
    let isTrend7Days = false;

    // Special Requirement: If viewing "Day" or "Yesterday", show trend for Last 7 Days instead of just 1 day
    if (dateRange === 'Day' || dateRange === 'Yesterday') {
       isTrend7Days = true;
       const sevenDaysAgo = new Date();
       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
       const limitYMD = getNairobiYMD(sevenDaysAgo.toISOString());

       // Filter from full history to get the context
       barChartSource = salesHistory.filter(t => {
           const tYMD = getNairobiYMD(t.date);
           return tYMD >= limitYMD;
       });
    }

    // Process Bar Data
    const chronSales = [...barChartSource].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let barChartData = [];

    if (isTrend7Days) {
        // Pre-fill last 7 days to ensure x-axis is complete even if 0 sales
        const daysMap = new Map<string, number>();
        const daysList: string[] = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Africa/Nairobi' });
            daysMap.set(key, 0);
            daysList.push(key);
        }

        chronSales.filter(t => t.status === 'Paid').forEach(t => {
            const key = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Africa/Nairobi' });
            if (daysMap.has(key)) {
                daysMap.set(key, (daysMap.get(key) || 0) + t.total);
            }
        });

        barChartData = daysList.map((day, i) => ({
            day,
            sales: daysMap.get(day) || 0,
            color: TROPICAL_COLORS[i % TROPICAL_COLORS.length]
        }));
    } else {
        // Standard View (Month, Week, etc)
        const salesByDate: Record<string, number> = {};
        chronSales.filter(t => t.status === 'Paid').forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Africa/Nairobi' });
            salesByDate[dateStr] = (salesByDate[dateStr] || 0) + t.total;
        });
        barChartData = Object.entries(salesByDate).map(([day, sales], i) => ({ 
            day, 
            sales,
            color: TROPICAL_COLORS[i % TROPICAL_COLORS.length]
        }));
    }

    // Pie Chart
    const salesByCat: Record<string, number> = {};
    const itemStats: Record<string, number> = {};

    filteredSales.forEach(t => {
        if (t.items && Array.isArray(t.items)) {
            t.items.forEach((item: { id: string; name: string; price: number; quantity: number }) => {
                 const originalItem = menuItems.find(m => m.id === item.id);
                 const cat = originalItem?.category || 'Unknown';
                 salesByCat[cat] = (salesByCat[cat] || 0) + (item.price * item.quantity);
                 itemStats[item.name] = (itemStats[item.name] || 0) + item.quantity;
            });
        }
    });

    const totalCatSales = Object.values(salesByCat).reduce((a,b)=>a+b, 0);
    const pieChartData = Object.entries(salesByCat)
      .map(([name, value], i) => ({
         name, 
         value: totalCatSales > 0 ? Math.round((value / totalCatSales) * 100) : 0,
         raw: value,
         color: TROPICAL_COLORS[i % TROPICAL_COLORS.length] 
      }))
      .sort((a,b) => b.value - a.value);

    const topItems = Object.entries(itemStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Expense Analytics
    const expenseByCat: Record<string, number> = {};
    filteredExpenses.forEach(e => {
        expenseByCat[e.category] = (expenseByCat[e.category] || 0) + e.amount;
    });
    const totalExp = Object.values(expenseByCat).reduce((a,b)=>a+b,0);
    const expenseChartData = Object.entries(expenseByCat)
      .map(([name, value], i) => ({
          name, 
          value: totalExp > 0 ? Math.round((value / totalExp) * 100) : 0,
          raw: value,
          color: ['#dc2626', '#ea580c', '#f59e0b', '#ef4444', '#7f1d1d'][i % 5]
      }))
      .sort((a,b)=> b.value - a.value);

    const staffSpending: Record<string, number> = {};
    filteredExpenses.forEach(e => {
        staffSpending[e.recordedBy] = (staffSpending[e.recordedBy] || 0) + e.amount;
    });
    const staffSpendingData = Object.entries(staffSpending)
       .map(([name, value]) => ({ name, value }))
       .sort((a,b) => b.value - a.value);

    return { barChartData, pieChartData, expenseChartData, staffSpendingData, topItems };
  }, [filteredSales, menuItems, filteredExpenses, salesHistory, dateRange]);

  // --- Visual Components (SVG based) ---
  const VisualBarChart = ({ data, valuePrefix = "" }: { data: any[], valuePrefix?: string }) => {
    if (!data.length) return <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">No data available</div>;
    const max = Math.max(...data.map(d => d.sales), 1);
    return (
      <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-8 px-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{valuePrefix}{d.sales.toLocaleString()}</div>
            <div style={{ height: `${(d.sales / max) * 100}%`, backgroundColor: d.color }} className={`w-full max-w-[40px] min-w-[12px] rounded-t-lg transition-all duration-500 opacity-80 group-hover:opacity-100`}></div>
            <span className="absolute top-full mt-2 text-[10px] text-gray-400 font-medium truncate w-full text-center">{d.day}</span>
          </div>
        ))}
      </div>
    );
  };

  const SvgPieChart = ({ data }: { data: any[] }) => {
    if (!data.length) return <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">No data available</div>;
    let cumulativePercent = 0;
    const slices = data.map(d => {
        const startX = Math.cos(2 * Math.PI * cumulativePercent);
        const startY = Math.sin(2 * Math.PI * cumulativePercent);
        const percent = d.value / 100;
        cumulativePercent += percent;
        const endX = Math.cos(2 * Math.PI * cumulativePercent);
        const endY = Math.sin(2 * Math.PI * cumulativePercent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
        return { pathData, color: d.color, name: d.name, value: d.value };
    });
    return (
      <div className="flex flex-col sm:flex-row items-center gap-8 h-full justify-center py-4">
         <div className="w-40 h-40 shrink-0 relative group/chart">
            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full overflow-visible">
               {slices.map((slice, i) => (
                   <g key={i}>
                     <path d={slice.pathData} fill={slice.color} className="hover:opacity-80 transition-opacity cursor-pointer stroke-white stroke-[0.02]" />
                   </g>
               ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold text-gray-900">{data.reduce((a,b)=>a+b.raw, 0).toLocaleString()}</span>
                </div>
            </div>
         </div>
         <div className="flex-1 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto w-full pr-2">
            {data.map((d, i) => (
               <div key={i} className="flex items-center justify-between text-xs w-full p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                     <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: d.color }}></div>
                     <span className="text-gray-700 font-bold truncate" title={d.name}>{d.name}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2 flex flex-col">
                      <span className="font-bold text-gray-900">{d.value}%</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  // --- Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); const formData = new FormData(e.target as HTMLFormElement);
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
    e.preventDefault(); setIsSaving(true); const formData = new FormData(e.target as HTMLFormElement);
    const newUser: User = { 
        id: editingUser?.id || `user-${Date.now()}`, name: formData.get('name') as string, 
        role: formData.get('role') as UserRole, pin: formData.get('pin') as string, avatar: avatarPreview || undefined
    };
    await onSaveUser(newUser); setIsSaving(false); setEditingUser(null); setIsAddingUser(false); setAvatarPreview(null);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); const formData = new FormData(e.target as HTMLFormElement);
    const newExpense: Expense = { 
        id: `exp-${Date.now()}`,
        date: new Date().toISOString(),
        description: formData.get('description') as string,
        amount: Number(formData.get('amount')),
        category: formData.get('category') as any,
        recordedBy: currentUser.name
    };
    await onSaveExpense(newExpense);
    setIsSaving(false);
    setIsAddingExpense(false);
  };

  const handleSort = (key: keyof SaleTransaction) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'asc' ? 'desc' : 'asc' }));

  const NavButton = ({ icon: Icon, label, id }: { icon: any, label: string, id: typeof activeTab }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${activeTab === id ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
        <Icon size={20} className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const StatCard = ({ label, value, colorClass, icon: Icon }: { label: string, value: string | number, colorClass?: string, icon?: any }) => (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow relative overflow-hidden">
         <div className="flex justify-between items-start z-10">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
            {Icon && <Icon className="text-gray-200 opacity-50" size={24} />}
         </div>
         <h3 className={`text-3xl font-bold z-10 ${colorClass || 'text-gray-900'}`}>{value}</h3>
         <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full z-0 opacity-50" />
      </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden text-gray-900">
      
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0 z-30 hidden md:flex">
         <div className="p-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-2 border border-gray-100">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-serif text-xl font-bold text-gray-900 leading-none">Tropical<br/>Dreams</h1>
         </div>
         
         <nav className="flex-1 px-6 space-y-2 py-4">
            <NavButton icon={BarChart3} label="Overview" id="reports" />
            <NavButton icon={DollarSign} label="Expenses" id="finances" />
            <NavButton icon={ShieldAlert} label="Security & Sync" id="security" />
            {currentUserRole === 'Admin' && (
                <>
                    <div className="py-4"><div className="h-px bg-gray-100 w-full"></div><p className="px-4 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Management</p></div>
                    <NavButton icon={Package} label="Products" id="menu" />
                    <NavButton icon={Users} label="Staff" id="users" />
                </>
            )}
         </nav>

         <div className="p-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 font-bold border border-gray-100 shadow-sm overflow-hidden">{currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p><p className="text-xs text-gray-500 truncate">{currentUserRole}</p></div>
            </div>
            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"><LogOut size={18} /> Sign Out</button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 relative">
         
         <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex justify-between items-center shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ArrowLeft size={20} /></button>
                <h2 className="text-2xl font-serif font-bold text-gray-900 capitalize">{activeTab}</h2>
            </div>

            <div className="flex items-center gap-3">
               <button onClick={handleManualRefresh} disabled={isRefreshing} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"><RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} /></button>
               {activeTab === 'reports' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleExportCSV(filteredSales, 'SalesData')} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"><Download size={16} /> Export CSV</button>
                    <button onClick={handlePrintReports} className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"><Printer size={16} /> Print Report</button>
                  </div>
               )}
               {activeTab === 'menu' && (
                  <div className="flex gap-2">
                    <button onClick={handlePrintReorderList} className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"><ShoppingCart size={16} /> Smart Reorder List</button>
                    <button onClick={() => setIsAddingItem(true)} className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"><Plus size={16} /> Add Product</button>
                  </div>
               )}
               {activeTab === 'users' && <button onClick={() => setIsAddingUser(true)} className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"><Plus size={16} /> Add Staff</button>}
               {activeTab === 'finances' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleExportCSV(filteredExpenses, 'ExpenseData')} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"><Download size={16} /> Export CSV</button>
                    <button onClick={() => setIsAddingExpense(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2"><Plus size={16} /> Record Expense</button>
                  </div>
               )}
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {activeTab === 'reports' && (
                    <>
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-2 items-center justify-between no-print">
                            <div className="flex p-1 bg-gray-50 rounded-xl">
                                {['Day', 'Yesterday', 'Week', 'Month', 'All', 'Custom'].map(r => (
                                    <button key={r} onClick={() => setDateRange(r as any)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateRange === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{r}</button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 px-4 text-[10px] font-bold text-gray-400 uppercase">
                                <span>Lodwar Time: {getNairobiYMD()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label={`Revenue (${dateRange})`} value={`${CURRENCY} ${totalPaidRevenue.toLocaleString()}`} icon={DollarSign} />
                            <StatCard label="Pending Payment" value={`${CURRENCY} ${totalPendingRevenue.toLocaleString()}`} colorClass="text-orange-500" icon={Clock} />
                            <StatCard label="Total Orders" value={totalOrders} icon={Package} />
                            <StatCard label="Avg Order Value" value={`${CURRENCY} ${Math.round(avgOrderValue).toLocaleString()}`} icon={BarChart3} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart3 size={18} /> Sales Trend</h3>
                                <VisualBarChart data={chartData.barChartData} valuePrefix={CURRENCY + " "} />
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><PieChart size={18} /> Categories</h3>
                                <div className="flex-1 flex flex-col gap-6">
                                    <SvgPieChart data={chartData.pieChartData} />
                                    <div className="border-t border-gray-50 pt-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Trophy size={12}/> Top Items</h4>
                                        <div className="space-y-2">
                                            {chartData.topItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="font-medium text-gray-700 truncate">{item.name}</span>
                                                    <span className="font-bold text-gray-900">{item.count} sold</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-lg text-gray-900">Recent Transactions</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date/Time</th>
                                            <th className="px-6 py-4">Items</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sortedTransactions.slice(0, 50).map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span></td>
                                                <td className="px-6 py-4 text-gray-600">{new Date(t.date).toLocaleString()}</td>
                                                <td className="px-6 py-4 truncate max-w-xs">{t.items.map(i => i.name).join(', ')}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{CURRENCY} {t.total.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-600">{t.paymentMethod}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100">
                            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2"><Wand2 size={20} /> Data Correction</h3>
                            <p className="text-xs text-orange-700 mb-6">If orders from today are reflecting as yesterday due to timezone shifts, use this to move them to Today (Lodwar Time).</p>
                            <button onClick={handleRepairDates} disabled={isRepairingDates} className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
                                {isRepairingDates ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />} Repair Today's Orders
                            </button>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2"><DatabaseBackup size={20} /> System Sync</h3>
                            <p className="text-xs text-blue-700 mb-6">Forces the local database to update its menu from the code (use this if "Sausage" or other items aren't showing).</p>
                            <button onClick={handleSyncMenuWithConstants} disabled={isSyncingMenu} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
                                {isSyncingMenu ? <RefreshCw className="animate-spin" size={20} /> : <DatabaseBackup size={20} />} Sync Menu Defaults
                            </button>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><UploadCloud size={20} /> Cloud Sync</h3>
                            <div className="space-y-4">
                                <button onClick={handleScanForMissing} disabled={isScanning} className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">{isScanning ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />} Scan for Unsynced Orders</button>
                                {recoveryList.length > 0 && <div className="p-4 bg-orange-50 rounded-xl"><h4 className="font-bold text-orange-800">Found {recoveryList.length} Unsynced</h4><button onClick={handleRestoreAll} disabled={isRestoring} className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold w-full">Restore Now</button></div>}
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldAlert size={20} /> Audit Log</h3>
                            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2">
                                {filteredAuditLogs.map(log => (
                                    <div key={log.id} className="text-xs border-b border-gray-50 pb-2">
                                        <div className="flex justify-between font-bold mb-1"><span className="uppercase text-blue-600">{log.action}</span><span>{new Date(log.date).toLocaleTimeString()}</span></div>
                                        <p className="text-gray-700">{log.details}</p><p className="text-gray-400">User: {log.userName}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'finances' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard label="Total Expenses" value={`${CURRENCY} ${totalExpenseAmount.toLocaleString()}`} colorClass="text-red-600" icon={TrendingDown} />
                            <StatCard label="Net Profit" value={`${CURRENCY} ${netProfit.toLocaleString()}`} colorClass={netProfit >= 0 ? "text-green-600" : "text-red-600"} icon={Activity} />
                            <StatCard label="Profit Margin" value={`${profitMargin.toFixed(1)}%`} icon={TrendingUp} />
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-lg text-gray-900">Expense History</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredExpenses.map(e => (
                                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-gray-100 uppercase text-[10px] font-bold">{e.category}</span></td>
                                                <td className="px-6 py-4 font-medium">{e.description}</td>
                                                <td className="px-6 py-4 font-bold text-red-600">{CURRENCY} {e.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4"><button onClick={() => onDeleteExpense(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'menu' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input id="menu-search" name="menu-search" type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-xl w-64 outline-none focus:ring-2 focus:ring-gray-900" /></div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium"><tr><th className="px-6 py-4">Image</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMenuItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4"><div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" alt={item.name} /></div></td>
                                        <td className="px-6 py-4 font-bold">{item.name}</td>
                                        <td className="px-6 py-4">{CURRENCY} {item.price.toLocaleString()}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock <= item.lowStockThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.stock} left</span></td>
                                        <td className="px-6 py-4 text-right"><button onClick={() => { setEditingItem(item); setIsAddingItem(true); }} className="p-2 text-blue-400 hover:text-blue-600"><Edit3 size={16} /></button><button onClick={() => onDeleteItem(item.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium"><tr><th className="px-6 py-4">Avatar</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4"><div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 font-bold">{u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} /> : u.name.charAt(0)}</div></td>
                                        <td className="px-6 py-4 font-bold">{u.name}</td>
                                        <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{u.role}</td>
                                        <td className="px-6 py-4 text-right"><button onClick={() => { setEditingUser(u); setIsAddingUser(true); }} className="p-2 text-blue-400 hover:text-blue-600"><Edit3 size={16} /></button><button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
         </div>

         {/* --- MODALS --- */}
         {isAddingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <h3 className="font-bold text-xl mb-6">{editingItem ? 'Edit Product' : 'Add Product'}</h3>
                    <form onSubmit={handleSaveItem} className="space-y-4">
                        <div>
                          <label htmlFor="item-name" className="text-xs font-bold text-gray-400 mb-1 block">Product Name</label>
                          <input id="item-name" name="name" defaultValue={editingItem?.name} placeholder="Product Name" className="w-full p-3 border rounded-xl" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="item-price" className="text-xs font-bold text-gray-400 mb-1 block">Price</label>
                              <input id="item-price" name="price" defaultValue={editingItem?.price} type="number" placeholder="Price" className="w-full p-3 border rounded-xl" required />
                            </div>
                            <div>
                              <label htmlFor="item-category" className="text-xs font-bold text-gray-400 mb-1 block">Category</label>
                              <select id="item-category" name="category" defaultValue={editingItem?.category} className="w-full p-3 border rounded-xl">
                                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="item-stock" className="text-xs font-bold text-gray-400 mb-1 block">Current Stock</label>
                              <input id="item-stock" name="stock" defaultValue={editingItem?.stock} type="number" placeholder="Stock" className="w-full p-3 border rounded-xl" />
                            </div>
                            <div>
                              <label htmlFor="item-threshold" className="text-xs font-bold text-gray-400 mb-1 block">Low Stock Alert at</label>
                              <input id="item-threshold" name="threshold" defaultValue={editingItem?.lowStockThreshold} type="number" placeholder="Threshold" className="w-full p-3 border rounded-xl" />
                            </div>
                        </div>
                        <div>
                          <label htmlFor="item-image" className="text-xs font-bold text-gray-400 mb-1 block">Image URL</label>
                          <input id="item-image" name="image" defaultValue={editingItem?.image} placeholder="Image URL" className="w-full p-3 border rounded-xl" />
                        </div>
                        <div>
                          <label htmlFor="item-description" className="text-xs font-bold text-gray-400 mb-1 block">Description</label>
                          <textarea id="item-description" name="description" defaultValue={editingItem?.description} placeholder="Description" rows={3} className="w-full p-3 border rounded-xl" />
                        </div>
                        <div className="flex gap-3 pt-4"><button type="button" onClick={() => {setIsAddingItem(false); setEditingItem(null);}} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold">Save</button></div>
                    </form>
                </div>
            </div>
         )}

         {isAddingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden">
                    <h3 className="font-bold text-xl mb-6">Staff Member</h3>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                        <div className="flex justify-center mb-4"><label htmlFor="avatar-upload" className="relative cursor-pointer w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-gray-900 transition-colors">{avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar Preview" /> : <Camera className="text-gray-400" size={24} />}<input id="avatar-upload" name="avatar" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/></label></div>
                        <div>
                          <label htmlFor="user-name" className="text-xs font-bold text-gray-400 mb-1 block">Full Name</label>
                          <input id="user-name" name="name" defaultValue={editingUser?.name} placeholder="Full Name" className="w-full p-3 border rounded-xl" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="user-role" className="text-xs font-bold text-gray-400 mb-1 block">Role</label>
                              <select id="user-role" name="role" defaultValue={editingUser?.role || 'Waiter'} className="w-full p-3 border rounded-xl">
                                  <option value="Admin">Admin</option>
                                  <option value="Cashier">Cashier</option>
                                  <option value="Waiter">Waiter</option>
                                  <option value="Chef">Chef</option>
                                  <option value="Barista">Barista</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="user-pin" className="text-xs font-bold text-gray-400 mb-1 block">4 Digit PIN</label>
                              <input id="user-pin" name="pin" defaultValue={editingUser?.pin} maxLength={4} placeholder="PIN" className="w-full p-3 border rounded-xl text-center font-mono tracking-widest" required />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4"><button type="button" onClick={() => {setIsAddingUser(false); setEditingUser(null);}} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold">Save</button></div>
                    </form>
                </div>
            </div>
         )}

         {isAddingExpense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden">
                    <h3 className="font-bold text-xl mb-6 text-red-600">Record Expense</h3>
                    <form onSubmit={handleSaveExpense} className="space-y-4">
                        <div>
                          <label htmlFor="exp-desc" className="text-xs font-bold text-gray-400 mb-1 block">Description</label>
                          <input id="exp-desc" name="description" placeholder="Description" className="w-full p-3 border rounded-xl" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="exp-amount" className="text-xs font-bold text-gray-400 mb-1 block">Amount (KES)</label>
                              <input id="exp-amount" name="amount" type="number" placeholder="Amount" className="w-full p-3 border rounded-xl" required />
                            </div>
                            <div>
                              <label htmlFor="exp-category" className="text-xs font-bold text-gray-400 mb-1 block">Category</label>
                              <select id="exp-category" name="category" className="w-full p-3 border rounded-xl"><option>Inventory Restock</option><option>Utilities</option><option>Salaries</option><option>Maintenance</option><option>Rent</option><option>Other</option></select>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsAddingExpense(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={isSaving} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Record</button></div>
                    </form>
                </div>
            </div>
         )}

      </main>
    </div>
  );
};
