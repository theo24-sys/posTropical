import React, { useMemo, useState, useRef } from 'react';
import {
  Download, Printer, FileText, Calendar, ChevronDown,
  TrendingUp, Package, DollarSign, BarChart2, Filter,
  CheckSquare, Square, X, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { SaleTransaction, Expense, MenuItem } from '../types';
import { CURRENCY } from '../constants';

interface ReportsTabProps {
  salesHistory: SaleTransaction[];
  expenses: Expense[];
  menuItems: MenuItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getNairobiYMD = (dateString?: string) => {
  const d = dateString ? new Date(dateString) : new Date();
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-KE', {
    timeZone: 'Africa/Nairobi', day: '2-digit', month: 'short', year: 'numeric'
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

const startOfWeek = (d: Date) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const downloadCSV = (filename: string, rows: string[][], headers: string[]) => {
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── Report type definitions ──────────────────────────────────────────────────

type ReportType = 'sales_summary' | 'item_sales' | 'expenses' | 'transactions';
type PeriodPreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

const REPORT_TYPES: { key: ReportType; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'sales_summary', label: 'Sales Summary', desc: 'Revenue, margins, payment breakdown', icon: <TrendingUp size={20} /> },
  { key: 'item_sales', label: 'Item Performance', desc: 'Units sold, revenue per menu item', icon: <Package size={20} /> },
  { key: 'expenses', label: 'Expense Report', desc: 'All outflows by category', icon: <DollarSign size={20} /> },
  { key: 'transactions', label: 'Transaction Log', desc: 'Full order-by-order ledger', icon: <FileText size={20} /> },
];

const PERIOD_PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this_week', label: 'This Week' },
  { key: 'last_week', label: 'Last Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'custom', label: 'Custom Range' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const ReportsTab: React.FC<ReportsTabProps> = ({ salesHistory, expenses, menuItems }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const [reportType, setReportType] = useState<ReportType>('sales_summary');
  const [period, setPeriod] = useState<PeriodPreset>('this_month');
  const [customStart, setCustomStart] = useState(getNairobiYMD());
  const [customEnd, setCustomEnd] = useState(getNairobiYMD());

  // Item filter for item_sales report
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showItemFilter, setShowItemFilter] = useState(false);
  const allItemIds = useMemo(() => menuItems.map(m => m.id), [menuItems]);

  // ── Date window ─────────────────────────────────────────────────────────
  const { fromYMD, toYMD, periodLabel } = useMemo(() => {
    const today = new Date();
    const todayYMD = getNairobiYMD();

    switch (period) {
      case 'today':
        return { fromYMD: todayYMD, toYMD: todayYMD, periodLabel: `Today (${fmtDate(today.toISOString())})` };
      case 'yesterday': {
        const y = new Date(today); y.setDate(today.getDate() - 1);
        const ymd = getNairobiYMD(y.toISOString());
        return { fromYMD: ymd, toYMD: ymd, periodLabel: `Yesterday (${fmtDate(y.toISOString())})` };
      }
      case 'this_week': {
        const mon = startOfWeek(new Date());
        const monYMD = getNairobiYMD(mon.toISOString());
        return { fromYMD: monYMD, toYMD: todayYMD, periodLabel: `This Week (${fmtDate(mon.toISOString())} – ${fmtDate(today.toISOString())})` };
      }
      case 'last_week': {
        const thisMonday = startOfWeek(new Date());
        const lastMon = new Date(thisMonday); lastMon.setDate(thisMonday.getDate() - 7);
        const lastSun = new Date(thisMonday); lastSun.setDate(thisMonday.getDate() - 1);
        return {
          fromYMD: getNairobiYMD(lastMon.toISOString()),
          toYMD: getNairobiYMD(lastSun.toISOString()),
          periodLabel: `Last Week (${fmtDate(lastMon.toISOString())} – ${fmtDate(lastSun.toISOString())})`
        };
      }
      case 'this_month': {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          fromYMD: getNairobiYMD(first.toISOString()),
          toYMD: todayYMD,
          periodLabel: `${today.toLocaleString('en-KE', { month: 'long', year: 'numeric' })}`
        };
      }
      case 'last_month': {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          fromYMD: getNairobiYMD(first.toISOString()),
          toYMD: getNairobiYMD(last.toISOString()),
          periodLabel: `${first.toLocaleString('en-KE', { month: 'long', year: 'numeric' })}`
        };
      }
      case 'custom':
        return {
          fromYMD: customStart,
          toYMD: customEnd,
          periodLabel: customStart === customEnd
            ? fmtDate(customStart + 'T12:00:00')
            : `${fmtDate(customStart + 'T12:00:00')} – ${fmtDate(customEnd + 'T12:00:00')}`
        };
      default:
        return { fromYMD: todayYMD, toYMD: todayYMD, periodLabel: 'Today' };
    }
  }, [period, customStart, customEnd]);

  const inWindow = (dateStr: string) => {
    const ymd = getNairobiYMD(dateStr);
    return ymd >= fromYMD && ymd <= toYMD;
  };

  // ── Filtered data ────────────────────────────────────────────────────────
  const filteredSales = useMemo(() => salesHistory.filter(t => inWindow(t.date)), [salesHistory, fromYMD, toYMD]);
  const filteredExpenses = useMemo(() => expenses.filter(e => inWindow(e.date)), [expenses, fromYMD, toYMD]);
  const paidSales = useMemo(() => filteredSales.filter(t => t.status === 'Paid'), [filteredSales]);

  // ── Sales summary data ───────────────────────────────────────────────────
  const summary = useMemo(() => {
    const grossRev = paidSales.reduce((a, t) => a + t.total, 0);
    const totalExp = filteredExpenses.reduce((a, e) => a + e.amount, 0);
    const pending = filteredSales.filter(t => t.status === 'Pending').reduce((a, t) => a + t.total, 0);
    const payMap: Record<string, number> = {};
    paidSales.forEach(t => { payMap[t.paymentMethod] = (payMap[t.paymentMethod] || 0) + t.total; });

    // Daily breakdown
    const dailyMap: Record<string, { rev: number; orders: number; exp: number }> = {};
    paidSales.forEach(t => {
      const d = getNairobiYMD(t.date);
      if (!dailyMap[d]) dailyMap[d] = { rev: 0, orders: 0, exp: 0 };
      dailyMap[d].rev += t.total; dailyMap[d].orders++;
    });
    filteredExpenses.forEach(e => {
      const d = getNairobiYMD(e.date);
      if (!dailyMap[d]) dailyMap[d] = { rev: 0, orders: 0, exp: 0 };
      dailyMap[d].exp += e.amount;
    });
    const daily = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));

    return { grossRev, totalExp, netMargin: grossRev - totalExp, pending, payMap, daily, orderCount: paidSales.length };
  }, [paidSales, filteredSales, filteredExpenses]);

  // ── Item sales data ──────────────────────────────────────────────────────
  const itemSalesData = useMemo(() => {
    const map: Record<string, { name: string; category: string; qty: number; rev: number; price: number }> = {};
    paidSales.forEach(t => t.items.forEach(i => {
      if (!map[i.id]) {
        const mi = menuItems.find(m => m.id === i.id);
        map[i.id] = { name: i.name, category: mi?.category || '—', qty: 0, rev: 0, price: mi?.price || i.price };
      }
      map[i.id].qty += i.quantity;
      map[i.id].rev += i.price * i.quantity;
    }));
    const all = Object.entries(map).map(([id, d]) => ({ id, ...d })).sort((a, b) => b.qty - a.qty);

    // Apply item filter if any selected
    if (selectedItems.size > 0) return all.filter(i => selectedItems.has(i.id));
    return all;
  }, [paidSales, menuItems, selectedItems]);

  // All items that appeared in sales (for the filter picker)
  const soldItemIds = useMemo(() => {
    const ids = new Set<string>();
    paidSales.forEach(t => t.items.forEach(i => ids.add(i.id)));
    return ids;
  }, [paidSales]);

  // Weekly grouping for item sales
  const weeklyItemData = useMemo(() => {
    const weeks: Record<string, Record<string, number>> = {};
    paidSales.forEach(t => {
      const d = new Date(t.date);
      const mon = startOfWeek(new Date(d));
      const wk = `W/E ${getNairobiYMD(mon.toISOString())}`;
      if (!weeks[wk]) weeks[wk] = {};
      t.items.forEach(i => {
        if (selectedItems.size > 0 && !selectedItems.has(i.id)) return;
        weeks[wk][i.name] = (weeks[wk][i.name] || 0) + i.quantity;
      });
    });
    return weeks;
  }, [paidSales, selectedItems]);

  // ── CSV Downloads ────────────────────────────────────────────────────────
  const handleDownloadCSV = () => {
    const ts = getNairobiYMD();
    if (reportType === 'sales_summary') {
      downloadCSV(
        `tropical-sales-summary-${ts}.csv`,
        summary.daily.map(([date, d]) => [date, d.rev.toString(), d.orders.toString(), d.exp.toString(), (d.rev - d.exp).toString()]),
        ['Date', 'Revenue (KES)', 'Orders', 'Expenses (KES)', 'Net (KES)']
      );
    } else if (reportType === 'item_sales') {
      downloadCSV(
        `tropical-item-sales-${ts}.csv`,
        itemSalesData.map(i => [i.name, i.category, i.qty.toString(), i.price.toString(), i.rev.toString()]),
        ['Item Name', 'Category', 'Units Sold', 'Unit Price (KES)', 'Total Revenue (KES)']
      );
    } else if (reportType === 'expenses') {
      downloadCSV(
        `tropical-expenses-${ts}.csv`,
        filteredExpenses.map(e => [
          fmtDateTime(e.date),
          e.supplierSource || '—',
          e.itemName || e.description,
          e.quantity?.toString() || '—',
          e.unitCost != null ? e.unitCost.toString() : '—',
          e.category,
          e.amount.toString(),
          e.recordedBy
        ]),
        ['Date', 'Source', 'Purchase', 'Qty', 'Unit Cost (KES)', 'Category', 'Amount (KES)', 'Recorded By']
      );
    } else if (reportType === 'transactions') {
      downloadCSV(
        `tropical-transactions-${ts}.csv`,
        filteredSales.map(t => [
          fmtDateTime(t.date), t.id, t.status, t.cashierName,
          t.orderType || '—', t.tableNumber?.toString() || '—',
          t.paymentMethod, t.total.toString(),
          t.items.map(i => `${i.name}x${i.quantity}`).join('; ')
        ]),
        ['Date', 'Order ID', 'Status', 'Cashier', 'Type', 'Table', 'Payment', 'Total (KES)', 'Items']
      );
    }
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tropical Dreams — ${REPORT_TYPES.find(r => r.key === reportType)?.label} — ${periodLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 32px; font-size: 13px; }
          .print-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4B3621; padding-bottom: 20px; margin-bottom: 28px; }
          .brand { font-size: 24px; font-weight: 900; color: #4B3621; letter-spacing: -1px; }
          .brand-sub { font-size: 11px; color: #888; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; }
          .report-meta { text-align: right; }
          .report-title { font-size: 18px; font-weight: 800; color: #4B3621; }
          .report-period { font-size: 12px; color: #666; margin-top: 4px; }
          .report-generated { font-size: 10px; color: #999; margin-top: 8px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
          .kpi-card { background: #f9f5f0; border-radius: 12px; padding: 16px; }
          .kpi-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 6px; }
          .kpi-value { font-size: 20px; font-weight: 900; color: #4B3621; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #4B3621; color: white; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; }
          td { padding: 9px 12px; border-bottom: 1px solid #f0ebe4; font-size: 12px; }
          tr:nth-child(even) td { background: #faf7f3; }
          .section-title { font-size: 14px; font-weight: 800; color: #4B3621; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #4B3621; padding-left: 10px; }
          .text-right { text-align: right; }
          .total-row td { font-weight: 800; background: #f0ebe4 !important; border-top: 2px solid #4B3621; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const nowStr = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi', dateStyle: 'full', timeStyle: 'short' });
  const reportLabel = REPORT_TYPES.find(r => r.key === reportType)?.label || '';

  // ─── Printable content builder ──────────────────────────────────────────
  const printableContent = useMemo(() => {
    const kpiBlock = `
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Gross Revenue</div><div class="kpi-value">${CURRENCY} ${summary.grossRev.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Orders</div><div class="kpi-value">${summary.orderCount}</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Expenses</div><div class="kpi-value">${CURRENCY} ${summary.totalExp.toLocaleString()}</div></div>
        <div class="kpi-card"><div class="kpi-label">Net Margin</div><div class="kpi-value">${CURRENCY} ${summary.netMargin.toLocaleString()}</div></div>
      </div>
    `;
    const header = `
      <div class="print-header">
        <div><div class="brand">🌴 Tropical Dreams Coffee House</div><div class="brand-sub">Management Report</div></div>
        <div class="report-meta">
          <div class="report-title">${reportLabel}</div>
          <div class="report-period">Period: ${periodLabel}</div>
          <div class="report-generated">Generated: ${nowStr}</div>
        </div>
      </div>
    `;
    const footer = `<div class="footer">Tropical Dreams Coffee House · Confidential Business Report · Generated via POS Admin System</div>`;

    if (reportType === 'sales_summary') {
      const payRows = Object.entries(summary.payMap).map(([m, v]) => `<tr><td>${m}</td><td class="text-right">${CURRENCY} ${v.toLocaleString()}</td><td class="text-right">${Math.round((v / (summary.grossRev || 1)) * 100)}%</td></tr>`).join('');
      const dailyRows = summary.daily.map(([d, v]) => `<tr><td>${fmtDate(d + 'T12:00:00')}</td><td class="text-right">${v.orders}</td><td class="text-right">${CURRENCY} ${v.rev.toLocaleString()}</td><td class="text-right">${CURRENCY} ${v.exp.toLocaleString()}</td><td class="text-right">${CURRENCY} ${(v.rev - v.exp).toLocaleString()}</td></tr>`).join('');
      return header + kpiBlock + `
        <div class="section-title">Payment Methods</div>
        <table><thead><tr><th>Method</th><th class="text-right">Amount</th><th class="text-right">Share</th></tr></thead>
        <tbody>${payRows}<tr class="total-row"><td>TOTAL</td><td class="text-right">${CURRENCY} ${summary.grossRev.toLocaleString()}</td><td class="text-right">100%</td></tr></tbody></table>
        <div class="section-title">Daily Breakdown</div>
        <table><thead><tr><th>Date</th><th class="text-right">Orders</th><th class="text-right">Revenue</th><th class="text-right">Expenses</th><th class="text-right">Net</th></tr></thead>
        <tbody>${dailyRows}</tbody></table>
      ` + footer;
    }

    if (reportType === 'item_sales') {
      const rows = itemSalesData.map((i, idx) => `<tr><td>${idx + 1}</td><td>${i.name}</td><td>${i.category}</td><td class="text-right">${i.qty}</td><td class="text-right">${CURRENCY} ${i.price.toLocaleString()}</td><td class="text-right">${CURRENCY} ${i.rev.toLocaleString()}</td></tr>`).join('');
      const totalQty = itemSalesData.reduce((a, i) => a + i.qty, 0);
      const totalRev = itemSalesData.reduce((a, i) => a + i.rev, 0);
      return header + kpiBlock + `
        <div class="section-title">Item Performance${selectedItems.size > 0 ? ` (${selectedItems.size} items selected)` : ''}</div>
        <table><thead><tr><th>#</th><th>Item</th><th>Category</th><th class="text-right">Units Sold</th><th class="text-right">Unit Price</th><th class="text-right">Revenue</th></tr></thead>
        <tbody>${rows}<tr class="total-row"><td colspan="3">TOTAL</td><td class="text-right">${totalQty}</td><td></td><td class="text-right">${CURRENCY} ${totalRev.toLocaleString()}</td></tr></tbody></table>
      ` + footer;
    }

    if (reportType === 'expenses') {
      const rows = filteredExpenses.map(e => `<tr><td>${fmtDateTime(e.date)}</td><td>${e.supplierSource || '—'}</td><td>${e.itemName || e.description}<div style="font-size:10px;color:#777;font-weight:700;margin-top:4px;">Qty: ${e.quantity ?? '—'} · Unit: ${e.unitCost != null ? `${CURRENCY} ${e.unitCost.toLocaleString()}` : '—'}${e.note ? ` · ${e.note}` : ''}</div></td><td>${e.category}</td><td class="text-right">${CURRENCY} ${e.amount.toLocaleString()}</td><td>${e.recordedBy}</td></tr>`).join('');
      const catMap: Record<string, number> = {};
      filteredExpenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
      const catRows = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<tr><td>${c}</td><td class="text-right">${CURRENCY} ${v.toLocaleString()}</td></tr>`).join('');
      return header + `
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">Total Expenses</div><div class="kpi-value">${CURRENCY} ${summary.totalExp.toLocaleString()}</div></div>
          <div class="kpi-card"><div class="kpi-label">Entries</div><div class="kpi-value">${filteredExpenses.length}</div></div>
        </div>
        <div class="section-title">By Category</div>
        <table><thead><tr><th>Category</th><th class="text-right">Total</th></tr></thead><tbody>${catRows}</tbody></table>
        <div class="section-title">All Entries</div>
        <table><thead><tr><th>Date</th><th>Source</th><th>Purchase</th><th>Category</th><th class="text-right">Amount</th><th>By</th></tr></thead>
        <tbody>${rows}<tr class="total-row"><td colspan="4">TOTAL</td><td class="text-right">${CURRENCY} ${summary.totalExp.toLocaleString()}</td><td></td></tr></tbody></table>
      ` + footer;
    }

    if (reportType === 'transactions') {
      const rows = filteredSales.map(t => `
        <tr>
          <td>${fmtDateTime(t.date)}</td><td>${t.id}</td>
          <td>${t.cashierName}</td>
          <td>${t.orderType || '—'}</td>
          <td>${t.paymentMethod}</td>
          <td><span style="color:${t.status === 'Paid' ? '#16a34a' : '#f59e0b'};font-weight:800">${t.status}</span></td>
          <td class="text-right">${CURRENCY} ${t.total.toLocaleString()}</td>
        </tr>`).join('');
      return header + kpiBlock + `
        <div class="section-title">Transaction Log (${filteredSales.length} records)</div>
        <table><thead><tr><th>Date & Time</th><th>Order ID</th><th>Cashier</th><th>Type</th><th>Payment</th><th>Status</th><th class="text-right">Total</th></tr></thead>
        <tbody>${rows}<tr class="total-row"><td colspan="6">TOTAL PAID</td><td class="text-right">${CURRENCY} ${summary.grossRev.toLocaleString()}</td></tr></tbody></table>
      ` + footer;
    }
    return '';
  }, [reportType, summary, itemSalesData, filteredExpenses, filteredSales, periodLabel, selectedItems, nowStr]);

  // ─── Item filter helpers ────────────────────────────────────────────────
  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedItems(new Set());
  const filteredMenuForPicker = menuItems.filter(m =>
    soldItemIds.has(m.id) && m.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Hidden printable area */}
      <div ref={printRef} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: printableContent }} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif font-black text-[#4B3621] tracking-tighter">Reports</h2>
          <p className="text-sm text-gray-400 font-bold mt-1">Generate, preview and export business reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2.5 px-6 py-4 bg-white border-2 border-gray-100 text-[#4B3621] rounded-[22px] text-xs font-black uppercase tracking-widest hover:border-teal-200 hover:text-teal-700 transition-all shadow-sm"
          >
            <FileSpreadsheet size={18} /> Download CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2.5 px-6 py-4 bg-[#4B3621] text-white rounded-[22px] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            <Printer size={18} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {REPORT_TYPES.map(r => (
          <button
            key={r.key}
            onClick={() => setReportType(r.key)}
            className={`p-6 rounded-[32px] text-left transition-all border-2 ${
              reportType === r.key
                ? 'bg-[#4B3621] border-[#4B3621] text-white shadow-2xl scale-105'
                : 'bg-white border-gray-100 text-[#4B3621] hover:border-[#4B3621]/30 shadow-sm'
            }`}
          >
            <div className={`mb-3 ${reportType === r.key ? 'text-white' : 'text-teal-600'}`}>{r.icon}</div>
            <p className="font-black text-sm">{r.label}</p>
            <p className={`text-[10px] font-bold mt-1 ${reportType === r.key ? 'text-white/60' : 'text-gray-400'}`}>{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Period + filters row */}
      <div className="bg-white rounded-[36px] p-6 border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <Calendar size={18} className="text-teal-500" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Period</p>
        </div>
        <div className="flex flex-wrap gap-2 flex-1">
          {PERIOD_PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-5 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p.key ? 'bg-[#4B3621] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:text-[#4B3621] hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex items-center gap-3 ml-auto bg-gray-50 p-2 rounded-[18px] border border-gray-100">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl text-xs font-black p-2 outline-none shadow-sm" />
            <span className="text-gray-300 font-black text-xs">→</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl text-xs font-black p-2 outline-none shadow-sm" />
          </div>
        )}

        {/* Item filter button (only for item_sales) */}
        {reportType === 'item_sales' && (
          <div className="relative">
            <button
              onClick={() => setShowItemFilter(v => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                selectedItems.size > 0 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-[#4B3621]'
              }`}
            >
              <Filter size={14} />
              {selectedItems.size > 0 ? `${selectedItems.size} Items` : 'All Items'}
              <ChevronDown size={14} />
            </button>
            {showItemFilter && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[28px] border border-gray-100 shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                  <p className="text-xs font-black text-[#4B3621] uppercase tracking-widest">Filter Items</p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-[10px] font-black text-teal-600 hover:underline">All</button>
                    <button onClick={() => setShowItemFilter(false)} className="text-gray-300 hover:text-[#4B3621]"><X size={16} /></button>
                  </div>
                </div>
                <div className="p-3 border-b border-gray-50">
                  <input
                    type="text" placeholder="Search items..." value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-[14px] text-xs font-bold outline-none border border-gray-100"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto p-3 space-y-1 scrollbar-thin">
                  {filteredMenuForPicker.map(m => {
                    const checked = selectedItems.size === 0 || selectedItems.has(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleItem(m.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] hover:bg-gray-50 transition-all text-left"
                      >
                        {selectedItems.size === 0 || selectedItems.has(m.id)
                          ? <CheckSquare size={16} className="text-teal-500 shrink-0" />
                          : <Square size={16} className="text-gray-300 shrink-0" />
                        }
                        <div>
                          <p className="text-xs font-black text-[#4B3621] leading-none">{m.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-0.5">{m.category}</p>
                        </div>
                      </button>
                    );
                  })}
                  {filteredMenuForPicker.length === 0 && (
                    <p className="text-center text-gray-300 text-xs py-6 font-bold italic">No items sold in this period</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PREVIEW AREA ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">

        {/* Preview header */}
        <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Live Preview</p>
            <h3 className="text-2xl font-black text-[#4B3621] tracking-tighter">{reportLabel}</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">{periodLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-300">Generated {nowStr}</p>
          </div>
        </div>

        <div className="p-10 space-y-8">

          {/* KPI summary row — always shown */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Gross Revenue', val: `${CURRENCY} ${summary.grossRev.toLocaleString()}`, color: 'text-teal-600' },
              { label: 'Total Orders', val: summary.orderCount.toString(), color: 'text-[#4B3621]' },
              { label: 'Total Expenses', val: `${CURRENCY} ${summary.totalExp.toLocaleString()}`, color: 'text-red-500' },
              { label: 'Net Margin', val: `${CURRENCY} ${summary.netMargin.toLocaleString()}`, color: summary.netMargin >= 0 ? 'text-teal-600' : 'text-red-500' },
            ].map(k => (
              <div key={k.label} className="bg-[#f9f5f0] rounded-[24px] p-6">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{k.label}</p>
                <p className={`text-2xl font-black tracking-tighter ${k.color}`}>{k.val}</p>
              </div>
            ))}
          </div>

          {/* ── Sales Summary ─────────────────────────────────────────── */}
          {reportType === 'sales_summary' && (
            <div className="space-y-8">
              {/* Payment breakdown */}
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Payment Methods</h4>
                <div className="rounded-[24px] overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-[#4B3621] text-white">
                      <tr>{['Method', 'Amount', 'Share'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {Object.entries(summary.payMap).map(([m, v]) => (
                        <tr key={m} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-black">{m}</td>
                          <td className="px-6 py-4 font-bold">{CURRENCY} {v.toLocaleString()}</td>
                          <td className="px-6 py-4 font-bold text-gray-400">{Math.round((v / (summary.grossRev || 1)) * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Daily breakdown */}
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Daily Breakdown</h4>
                <div className="rounded-[24px] overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-[#4B3621] text-white">
                      <tr>{['Date', 'Orders', 'Revenue', 'Expenses', 'Net'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {summary.daily.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-300 italic font-bold">No data for this period</td></tr>}
                      {summary.daily.map(([d, v]) => (
                        <tr key={d} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold">{fmtDate(d + 'T12:00:00')}</td>
                          <td className="px-6 py-4 font-bold">{v.orders}</td>
                          <td className="px-6 py-4 font-black text-teal-600">{CURRENCY} {v.rev.toLocaleString()}</td>
                          <td className="px-6 py-4 font-bold text-red-500">{CURRENCY} {v.exp.toLocaleString()}</td>
                          <td className={`px-6 py-4 font-black ${(v.rev - v.exp) >= 0 ? 'text-teal-600' : 'text-red-500'}`}>{CURRENCY} {(v.rev - v.exp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Item Sales ────────────────────────────────────────────── */}
          {reportType === 'item_sales' && (
            <div className="space-y-8">
              {/* Weekly summary table */}
              {Object.keys(weeklyItemData).length > 1 && (
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Weekly Summary</h4>
                  <div className="rounded-[24px] overflow-hidden border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#4B3621] text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest sticky left-0 bg-[#4B3621]">Item</th>
                          {Object.keys(weeklyItemData).sort().map(wk => (
                            <th key={wk} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{wk}</th>
                          ))}
                          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {itemSalesData.slice(0, 20).map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-black sticky left-0 bg-white border-r border-gray-50">{item.name}</td>
                            {Object.keys(weeklyItemData).sort().map(wk => (
                              <td key={wk} className="px-6 py-3 font-bold text-center">{weeklyItemData[wk][item.name] || '—'}</td>
                            ))}
                            <td className="px-6 py-3 font-black text-teal-600">{item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Full item list */}
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  Item Performance {selectedItems.size > 0 && <span className="text-teal-500">· {selectedItems.size} selected</span>}
                </h4>
                <div className="rounded-[24px] overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-[#4B3621] text-white">
                      <tr>{['#', 'Item', 'Category', 'Units Sold', 'Unit Price', 'Total Revenue'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {itemSalesData.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-300 italic font-bold">No items sold in this period</td></tr>}
                      {itemSalesData.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-300 font-black">{idx + 1}</td>
                          <td className="px-6 py-4 font-black text-[#4B3621]">{item.name}</td>
                          <td className="px-6 py-4 text-gray-500 font-bold">{item.category}</td>
                          <td className="px-6 py-4 font-black text-lg">{item.qty}</td>
                          <td className="px-6 py-4 font-bold">{CURRENCY} {item.price.toLocaleString()}</td>
                          <td className="px-6 py-4 font-black text-teal-600">{CURRENCY} {item.rev.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Expenses ──────────────────────────────────────────────── */}
          {reportType === 'expenses' && (
            <div className="rounded-[24px] overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-[#4B3621] text-white">
                  <tr>{['Date', 'Source', 'Purchase', 'Category', 'Amount', 'By'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredExpenses.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-300 italic font-bold">No expenses in this period</td></tr>}
                  {filteredExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-500">{fmtDateTime(e.date)}</td>
                      <td className="px-6 py-4 font-black text-amber-600">{e.supplierSource || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="font-black text-[#4B3621]">{e.itemName || e.description}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-300">
                          Qty: {e.quantity ?? '—'} · Unit: {e.unitCost != null ? `${CURRENCY} ${e.unitCost.toLocaleString()}` : '—'}
                        </div>
                        {e.note && <div className="mt-1 text-xs font-medium text-gray-400">{e.note}</div>}
                      </td>
                      <td className="px-6 py-4"><span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">{e.category}</span></td>
                      <td className="px-6 py-4 font-black text-red-500">- {CURRENCY} {e.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-gray-400">{e.recordedBy}</td>
                    </tr>
                  ))}
                  {filteredExpenses.length > 0 && (
                    <tr className="bg-[#f9f5f0]">
                      <td colSpan={4} className="px-6 py-4 font-black text-[#4B3621] uppercase tracking-widest text-xs">Total</td>
                      <td className="px-6 py-4 font-black text-red-500 text-lg">{CURRENCY} {summary.totalExp.toLocaleString()}</td>
                      <td />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Transactions ──────────────────────────────────────────── */}
          {reportType === 'transactions' && (
            <div className="rounded-[24px] overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-[#4B3621] text-white">
                  <tr>{['Date', 'Order ID', 'Cashier', 'Type', 'Payment', 'Status', 'Total'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSales.length === 0 && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-300 italic font-bold">No transactions in this period</td></tr>}
                  {filteredSales.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-500 whitespace-nowrap">{fmtDateTime(t.date)}</td>
                      <td className="px-6 py-4 font-black text-xs text-gray-400">{t.id}</td>
                      <td className="px-6 py-4 font-bold">{t.cashierName}</td>
                      <td className="px-6 py-4 font-bold text-gray-400">{t.orderType || '—'}</td>
                      <td className="px-6 py-4 font-bold">{t.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-[#4B3621]">{CURRENCY} {t.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
