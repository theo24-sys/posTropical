import React, { useMemo, useState } from 'react';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Users, Clock, CreditCard, Smartphone, Banknote, AlertCircle,
  BarChart2, Activity, Target, Zap, Award, ChevronUp, ChevronDown
} from 'lucide-react';
import { SaleTransaction, Expense, MenuItem, User } from '../types';
import { CURRENCY } from '../constants';

interface AnalyticsTabProps {
  salesHistory: SaleTransaction[];
  expenses: Expense[];
  menuItems: MenuItem[];
  users: User[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const getNairobiYMD = (dateString?: string) => {
  const d = dateString ? new Date(dateString) : new Date();
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
};

const getNairobiHour = (dateString: string) => {
  return parseInt(
    new Intl.DateTimeFormat('en-KE', { timeZone: 'Africa/Nairobi', hour: 'numeric', hour12: false }).format(new Date(dateString))
  );
};

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();

const pctChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  icon: React.ReactNode;
  accent: string;
}> = ({ label, value, sub, delta, icon, accent }) => (
  <div className={`bg-white rounded-[40px] p-8 border border-gray-50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-8 translate-x-8`} style={{ background: accent }} />
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white shadow-lg`} style={{ background: accent }}>
        {icon}
      </div>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black ${delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {delta >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(delta)}%
        </div>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[3px] mb-2">{label}</p>
    <h3 className="text-3xl font-black text-[#4B3621] tracking-tighter leading-none">{value}</h3>
    {sub && <p className="text-xs text-gray-400 font-bold mt-2">{sub}</p>}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  salesHistory, expenses, menuItems, users
}) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // ── Filter windows ────────────────────────────────────────────────────────
  const { current, previous } = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 99999;
    const now = new Date();
    const cutCurrent = new Date(now); cutCurrent.setDate(now.getDate() - days);
    const cutPrevious = new Date(now); cutPrevious.setDate(now.getDate() - days * 2);

    const inWindow = (dateStr: string, from: Date, to: Date) => {
      const d = new Date(dateStr);
      return d >= from && d <= to;
    };

    return {
      current: salesHistory.filter(t => inWindow(t.date, cutCurrent, now)),
      previous: salesHistory.filter(t => inWindow(t.date, cutPrevious, cutCurrent)),
    };
  }, [salesHistory, period]);

  const paidCurrent = useMemo(() => current.filter(t => t.status === 'Paid'), [current]);
  const paidPrevious = useMemo(() => previous.filter(t => t.status === 'Paid'), [previous]);

  // ── KPI stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const curRev = paidCurrent.reduce((a, t) => a + t.total, 0);
    const prevRev = paidPrevious.reduce((a, t) => a + t.total, 0);
    const curAOV = paidCurrent.length ? curRev / paidCurrent.length : 0;
    const prevAOV = paidPrevious.length ? prevRev / paidPrevious.length : 0;
    const pendingVal = current.filter(t => t.status === 'Pending').reduce((a, t) => a + t.total, 0);
    const pendingCount = current.filter(t => t.status === 'Pending').length;

    const curExpenses = expenses
      .filter(e => {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 99999;
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
        return new Date(e.date) >= cutoff;
      })
      .reduce((a, e) => a + e.amount, 0);

    return {
      curRev, prevRev,
      curAOV, prevAOV,
      curOrders: paidCurrent.length, prevOrders: paidPrevious.length,
      netMargin: curRev - curExpenses,
      curExpenses,
      pendingVal, pendingCount,
    };
  }, [paidCurrent, paidPrevious, current, expenses, period]);

  // ── Daily trend (last N days) ─────────────────────────────────────────────
  const dailyTrend = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 60;
    const buckets: Record<string, { rev: number; orders: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      buckets[getNairobiYMD(d.toISOString())] = { rev: 0, orders: 0 };
    }
    paidCurrent.forEach(t => {
      const ymd = getNairobiYMD(t.date);
      if (buckets[ymd]) { buckets[ymd].rev += t.total; buckets[ymd].orders++; }
    });
    const entries = Object.entries(buckets);
    const maxRev = Math.max(...entries.map(([, v]) => v.rev), 1);
    return entries.map(([date, val]) => ({
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      ...val,
      barH: Math.round((val.rev / maxRev) * 100),
    }));
  }, [paidCurrent, period]);

  // ── Hourly heatmap ────────────────────────────────────────────────────────
  const hourlyData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, rev: 0, orders: 0 }));
    paidCurrent.forEach(t => {
      const h = getNairobiHour(t.date);
      if (h >= 0 && h < 24) { buckets[h].rev += t.total; buckets[h].orders++; }
    });
    const maxOrders = Math.max(...buckets.map(b => b.orders), 1);
    return buckets.map(b => ({ ...b, intensity: b.orders / maxOrders }));
  }, [paidCurrent]);

  // ── Payment method split ──────────────────────────────────────────────────
  const paymentSplit = useMemo(() => {
    const map: Record<string, number> = {};
    paidCurrent.forEach(t => { map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.total; });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, string> = {
      'Cash': '#16a34a', 'M-Pesa': '#10b981', 'Card': '#3b82f6', 'Pay Later': '#f59e0b'
    };
    const icons: Record<string, React.ReactNode> = {
      'Cash': <Banknote size={16} />,
      'M-Pesa': <Smartphone size={16} />,
      'Card': <CreditCard size={16} />,
      'Pay Later': <AlertCircle size={16} />,
    };
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([method, amount]) => ({
        method, amount,
        pct: Math.round((amount / total) * 100),
        color: colors[method] || '#6b7280',
        icon: icons[method] || <CreditCard size={16} />,
      }));
  }, [paidCurrent]);

  // ── Cashier leaderboard ───────────────────────────────────────────────────
  const cashierBoard = useMemo(() => {
    const map: Record<string, { rev: number; orders: number; aov: number }> = {};
    paidCurrent.forEach(t => {
      if (!map[t.cashierName]) map[t.cashierName] = { rev: 0, orders: 0, aov: 0 };
      map[t.cashierName].rev += t.total;
      map[t.cashierName].orders++;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, ...d, aov: d.orders ? Math.round(d.rev / d.orders) : 0 }))
      .sort((a, b) => b.rev - a.rev);
  }, [paidCurrent]);

  // ── Item scatter: popularity vs price ────────────────────────────────────
  const itemScatter = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; price: number; rev: number }> = {};
    paidCurrent.forEach(t => t.items.forEach(i => {
      if (!counts[i.id]) {
        const mi = menuItems.find(m => m.id === i.id);
        counts[i.id] = { name: i.name, qty: 0, price: mi?.price || i.price, rev: 0 };
      }
      counts[i.id].qty += i.quantity;
      counts[i.id].rev += i.price * i.quantity;
    }));
    const items = Object.values(counts);
    const maxQty = Math.max(...items.map(i => i.qty), 1);
    const maxPrice = Math.max(...items.map(i => i.price), 1);
    return items.map(i => ({
      ...i,
      x: Math.round((i.qty / maxQty) * 90) + 5,
      y: Math.round((1 - i.price / maxPrice) * 80) + 10,
    }));
  }, [paidCurrent, menuItems]);

  // ── Order type split ──────────────────────────────────────────────────────
  const orderTypeSplit = useMemo(() => {
    let dineIn = 0, takeAway = 0;
    paidCurrent.forEach(t => {
      if (t.orderType === 'Take Away') takeAway++;
      else dineIn++;
    });
    const total = dineIn + takeAway || 1;
    return { dineIn, takeAway, dineInPct: Math.round((dineIn / total) * 100), takeAwayPct: Math.round((takeAway / total) * 100) };
  }, [paidCurrent]);

  const PERIODS = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'all', label: 'All Time' },
  ] as const;

  const TEAL = '#0d9488';
  const COFFEE = '#4B3621';
  const AMBER = '#f59e0b';
  const ROSE = '#f43f5e';
  const INDIGO = '#6366f1';

  return (
    <div className="space-y-10">

      {/* ── Period Selector ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif font-black text-[#4B3621] tracking-tighter">Deep Analytics</h2>
          <p className="text-sm text-gray-400 font-bold mt-1">Intelligence layer for Tropical Dreams</p>
        </div>
        <div className="flex p-2 bg-white rounded-[24px] border border-gray-100 shadow-sm gap-1">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-7 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p.key ? 'bg-[#4B3621] text-white shadow-xl' : 'text-gray-400 hover:text-[#4B3621]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Gross Revenue"
          value={`${CURRENCY} ${fmtK(stats.curRev)}`}
          sub={`vs ${CURRENCY} ${fmtK(stats.prevRev)} prior`}
          delta={pctChange(stats.curRev, stats.prevRev)}
          icon={<TrendingUp size={20} />}
          accent={TEAL}
        />
        <StatCard
          label="Avg Order Value"
          value={`${CURRENCY} ${Math.round(stats.curAOV).toLocaleString()}`}
          sub={`${stats.curOrders} paid orders`}
          delta={pctChange(stats.curAOV, stats.prevAOV)}
          icon={<Target size={20} />}
          accent={INDIGO}
        />
        <StatCard
          label="Net Margin"
          value={`${CURRENCY} ${fmtK(stats.netMargin)}`}
          sub={`Expenses: ${CURRENCY} ${fmtK(stats.curExpenses)}`}
          icon={<Zap size={20} />}
          accent={stats.netMargin >= 0 ? TEAL : ROSE}
        />
        <StatCard
          label="Pending Debt"
          value={`${CURRENCY} ${fmtK(stats.pendingVal)}`}
          sub={`${stats.pendingCount} unsettled orders`}
          icon={<AlertCircle size={20} />}
          accent={AMBER}
        />
      </div>

      {/* ── Daily Revenue Trend ──────────────────────────────────────── */}
      <div className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl font-black text-[#4B3621] flex items-center gap-3 tracking-tighter">
            <BarChart2 size={24} className="text-teal-500" /> Daily Revenue Trend
          </h4>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            {CURRENCY} / day
          </p>
        </div>
        <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2 scrollbar-thin">
          {dailyTrend.map((d, i) => {
            const isToday = d.date === getNairobiYMD();
            return (
              <div key={i} className="flex flex-col items-center gap-2 group flex-shrink-0" style={{ minWidth: period === '90d' ? '10px' : period === '30d' ? '20px' : '32px' }}>
                <div className="relative w-full flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-[#4B3621] text-white text-[9px] font-black px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none shadow-xl">
                    <p>{d.label}</p>
                    <p>{CURRENCY} {d.rev.toLocaleString()}</p>
                    <p>{d.orders} orders</p>
                  </div>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ${isToday ? 'bg-teal-500' : 'bg-[#e0d4c4] group-hover:bg-[#4B3621]'}`}
                    style={{ height: `${Math.max(d.barH, d.rev > 0 ? 4 : 0)}%`, minHeight: d.rev > 0 ? '4px' : '0' }}
                  />
                </div>
                {period !== '90d' && (
                  <p className={`text-[8px] font-black uppercase tracking-widest rotate-45 origin-left ${isToday ? 'text-teal-600' : 'text-gray-300'}`} style={{ marginTop: '4px' }}>
                    {d.label.split(' ')[1]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hourly Heatmap + Payment Split ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Hourly heatmap */}
        <div className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-sm">
          <h4 className="text-xl font-black text-[#4B3621] flex items-center gap-3 tracking-tighter mb-8">
            <Clock size={24} className="text-amber-500" /> Peak Hour Intelligence
          </h4>
          <div className="grid grid-cols-12 gap-1.5">
            {hourlyData.map(h => {
              const label = h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`;
              const isActive = h.orders > 0;
              return (
                <div key={h.hour} className="group relative flex flex-col items-center gap-1.5">
                  <div
                    className="w-full aspect-square rounded-xl transition-all cursor-default"
                    style={{
                      background: isActive
                        ? `rgba(13, 148, 136, ${0.15 + h.intensity * 0.85})`
                        : '#f9fafb',
                      border: isActive ? '1px solid rgba(13,148,136,0.2)' : '1px solid #f3f4f6'
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 bg-[#4B3621] text-white text-[9px] font-black px-2 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none shadow-xl">
                    {label}: {h.orders} orders · {CURRENCY} {h.rev.toLocaleString()}
                  </div>
                  <p className="text-[8px] font-black text-gray-300">{label}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-6 justify-end">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Low</p>
            <div className="flex gap-1">
              {[0.15, 0.35, 0.55, 0.75, 1].map(o => (
                <div key={o} className="w-5 h-3 rounded" style={{ background: `rgba(13,148,136,${o})` }} />
              ))}
            </div>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Peak</p>
          </div>
        </div>

        {/* Payment split */}
        <div className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-sm">
          <h4 className="text-xl font-black text-[#4B3621] flex items-center gap-3 tracking-tighter mb-8">
            <CreditCard size={24} className="text-indigo-500" /> Payment Methods
          </h4>
          {paymentSplit.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 font-bold italic">No payment data</div>
          ) : (
            <div className="space-y-5">
              {/* Stacked bar */}
              <div className="w-full h-5 rounded-full overflow-hidden flex gap-0.5 mb-8">
                {paymentSplit.map(p => (
                  <div
                    key={p.method}
                    className="h-full transition-all duration-1000 first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${p.pct}%`, background: p.color }}
                  />
                ))}
              </div>
              {paymentSplit.map((p, i) => (
                <div key={p.method} className="flex items-center justify-between group p-4 rounded-[20px] hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white shadow-sm" style={{ background: p.color }}>
                      {p.icon}
                    </div>
                    <div>
                      <p className="font-black text-[#4B3621] text-sm">{p.method}</p>
                      <p className="text-[10px] font-bold text-gray-400">{p.pct}% of revenue</p>
                    </div>
                  </div>
                  <p className="font-black text-lg text-[#4B3621] tracking-tighter">{CURRENCY} {p.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cashier Leaderboard + Order Type ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Cashier leaderboard — takes 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-[48px] p-10 border border-gray-50 shadow-sm">
          <h4 className="text-xl font-black text-[#4B3621] flex items-center gap-3 tracking-tighter mb-8">
            <Award size={24} className="text-rose-500" /> Staff Performance
          </h4>
          {cashierBoard.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 font-bold italic">No data for this period</div>
          ) : (
            <div className="space-y-4">
              {cashierBoard.map((c, i) => {
                const maxRev = cashierBoard[0].rev || 1;
                const barW = Math.round((c.rev / maxRev) * 100);
                return (
                  <div key={c.name} className="group p-5 rounded-[28px] hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-black text-sm shadow-sm ${
                          i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-black text-[#4B3621] text-lg leading-none">{c.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">{c.orders} orders · AOV {CURRENCY} {c.aov.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-black text-xl text-[#4B3621] tracking-tighter">{CURRENCY} {c.rev.toLocaleString()}</p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${barW}%`, background: i === 0 ? '#f59e0b' : '#0d9488' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order type + period-over-period */}
        <div className="flex flex-col gap-8">
          {/* Dine-in vs Take Away */}
          <div className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-sm flex-1">
            <h4 className="text-base font-black text-[#4B3621] flex items-center gap-3 tracking-tighter mb-6">
              <Users size={20} className="text-teal-500" /> Service Mode
            </h4>
            <div className="flex flex-col gap-5 mt-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-black text-[#4B3621]">Dine-in</p>
                  <p className="text-sm font-black text-teal-600">{orderTypeSplit.dineInPct}%</p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${orderTypeSplit.dineInPct}%` }} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{orderTypeSplit.dineIn} orders</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-black text-[#4B3621]">Take Away</p>
                  <p className="text-sm font-black text-amber-600">{orderTypeSplit.takeAwayPct}%</p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${orderTypeSplit.takeAwayPct}%` }} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{orderTypeSplit.takeAway} orders</p>
              </div>
            </div>
          </div>

          {/* Period comparison card */}
          <div className="bg-[#4B3621] rounded-[48px] p-10 border border-[#3a2818] shadow-sm">
            <h4 className="text-base font-black text-white/60 uppercase tracking-widest mb-6">vs Prior Period</h4>
            <div className="space-y-5">
              {[
                { label: 'Revenue', cur: stats.curRev, prev: stats.prevRev },
                { label: 'Orders', cur: stats.curOrders, prev: stats.prevOrders },
                { label: 'Avg Order', cur: Math.round(stats.curAOV), prev: Math.round(stats.prevAOV) },
              ].map(({ label, cur, prev }) => {
                const d = pctChange(cur, prev);
                return (
                  <div key={label} className="flex items-center justify-between">
                    <p className="text-sm font-black text-white/60">{label}</p>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${
                      d >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {d >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(d)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Item Popularity vs Price Scatter ─────────────────────────── */}
      <div className="bg-white rounded-[48px] p-10 border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xl font-black text-[#4B3621] flex items-center gap-3 tracking-tighter">
            <Activity size={24} className="text-indigo-500" /> Popularity vs Price Matrix
          </h4>
        </div>
        <p className="text-xs text-gray-400 font-bold mb-8">
          Right = more popular · Top = higher priced · Ideal items: top-right quadrant
        </p>
        <div className="relative w-full h-64 bg-gray-50/50 rounded-[28px] border border-gray-100 overflow-hidden">
          {/* Quadrant labels */}
          <p className="absolute top-3 left-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">High Price · Low Volume</p>
          <p className="absolute top-3 right-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest">High Price · High Volume ★</p>
          <p className="absolute bottom-3 left-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">Low Price · Low Volume</p>
          <p className="absolute bottom-3 right-4 text-[9px] font-black text-amber-400 uppercase tracking-widest">Low Price · High Volume</p>
          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200" />
          {/* Dots */}
          {itemScatter.map((item, i) => (
            <div
              key={i}
              className="absolute group"
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-md cursor-pointer transition-all group-hover:scale-[2.5] group-hover:z-10"
                style={{ background: item.x > 50 && item.y < 50 ? '#10b981' : item.x > 50 ? '#f59e0b' : '#94a3b8' }}
              />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4B3621] text-white text-[9px] font-black px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none shadow-xl">
                <p>{item.name}</p>
                <p>{CURRENCY} {item.price} · {item.qty} sold</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsTab;
