
import React, { useState, useMemo } from 'react';
import { SaleTransaction, PaymentMethod, User } from '../types';
import { CURRENCY } from '../constants';
import { Search, Clock, CheckCircle, ArrowLeft, CreditCard, Banknote, Smartphone, User as UserIcon, Utensils, ShoppingBasket, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionsPageProps {
  transactions: SaleTransaction[];
  onUpdateStatus: (id: string, newStatus: 'Paid' | 'Pending', paymentMethod: PaymentMethod) => Promise<void>;
  user: User;
  onEditOrder?: (transaction: SaleTransaction) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, onUpdateStatus, user, onEditOrder }) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('Cash');
  const navigate = useNavigate();

  const formatEATDate = (isoString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Africa/Nairobi'
    }).format(new Date(isoString));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.tableNumber?.toString() || '').includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [transactions, filterStatus, searchQuery]);

  const handleSettleClick = (t: SaleTransaction) => {
    setSelectedTransaction(t);
    setSettleMethod('Cash'); 
    setIsSettleModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (selectedTransaction) {
      await onUpdateStatus(selectedTransaction.id, 'Paid', settleMethod);
      setIsSettleModalOpen(false);
      setSelectedTransaction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Paid') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"><CheckCircle size={12} /> Succeeded</span>;
    return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit animate-pulse"><Clock size={12} /> Unpaid</span>;
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col font-sans">
      <div className="bg-[#4B3621] text-white px-10 py-8 flex justify-between items-center shadow-xl shrink-0">
         <div className="flex items-center gap-6">
             <button onClick={() => navigate('/')} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all active:scale-95 shadow-lg">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h1 className="font-serif text-3xl font-black tracking-tighter">Order Ledger</h1>
                <p className="text-coffee-200 text-xs font-bold opacity-60 uppercase tracking-widest">Audit & Settlement Center</p>
             </div>
         </div>
         <div className="hidden md:flex bg-white/10 px-6 py-3 rounded-2xl items-center gap-4 backdrop-blur-sm border border-white/5 shadow-inner">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Active Pending:</span>
            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-orange-900/20">{transactions.filter(t => t.status === 'Pending').length}</span>
         </div>
      </div>

      <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             {(['All', 'Pending', 'Paid'] as const).map(status => (
                <button 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${filterStatus === status ? 'bg-[#4B3621] text-white shadow-xl translate-y-[-2px]' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}
                  `}
                >
                  {status} Records
                </button>
             ))}
         </div>
         <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Search ID, Staff or Table..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#4B3621] outline-none font-bold text-base transition-all shadow-inner"
            />
         </div>
      </div>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full max-w-[1600px] mx-auto">
         <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                 <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[3px] text-gray-300 border-b border-gray-100">
                     <tr>
                         <th className="px-8 py-6">Identity</th>
                         <th className="px-8 py-6">Order Snapshot</th>
                         <th className="px-8 py-6">Volume</th>
                         <th className="px-8 py-6 text-right">Value Point</th>
                         <th className="px-8 py-6 text-right">Ops</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-40 text-gray-300 italic font-black text-xl uppercase tracking-widest opacity-40">No records in this window</td>
                        </tr>
                    ) : (
                        filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-8">
                                    <div className="flex flex-col gap-4">
                                        {getStatusBadge(t.status)}
                                        <div>
                                            <p className="font-black text-xl text-[#4B3621] leading-none mb-2">#{t.id}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatEATDate(t.date)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            {t.orderType === 'Take Away' ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 px-3 py-1 rounded-lg border border-teal-100 flex items-center gap-1.5 shadow-sm">
                                                    <ShoppingBasket size={12} /> Take Away
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-1.5 shadow-sm">
                                                    <Utensils size={12} /> Table {t.tableNumber || '-'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-[#4B3621] leading-relaxed line-clamp-2 max-w-sm">
                                            {t.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-8 py-8">
                                    <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {t.items.length} Units
                                    </span>
                                </td>
                                <td className="px-8 py-8 text-right">
                                    <p className="text-2xl font-black text-[#4B3621] tracking-tighter">{CURRENCY} {t.total.toLocaleString()}</p>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Cashier: {t.cashierName}</p>
                                </td>
                                <td className="px-8 py-8 text-right">
                                    {t.status === 'Pending' ? (
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            {onEditOrder && (
                                                <button
                                                    onClick={() => onEditOrder(t)}
                                                    className="bg-white border-2 border-gray-100 hover:border-[#4B3621] text-[#4B3621] px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    <PlusCircle size={16} /> Add Items
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleSettleClick(t)}
                                                className="bg-[#4B3621] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                                            >
                                                Settle Bill
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-xl">Archive Locked</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                 </tbody>
             </table>
         </div>
      </div>

      {isSettleModalOpen && selectedTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4B3621]/90 backdrop-blur-xl p-6">
              <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-xl overflow-hidden p-12 relative animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <CheckCircle size={40} className="text-green-600" />
                      </div>
                      <h3 className="font-serif text-4xl font-black text-[#4B3621] tracking-tighter mb-2">Finalize Sale</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Reference: #{selectedTransaction.id}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-[32px] p-8 mb-10 text-center border border-gray-100">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[3px] mb-2">Total Receivable</p>
                      <h2 className="text-5xl font-black text-[#4B3621] tracking-tighter">{CURRENCY} {selectedTransaction.total.toLocaleString()}</h2>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 block">Select Tender Method</p>
                      <div className="grid grid-cols-3 gap-4">
                          {(['Cash', 'M-Pesa', 'Card'] as PaymentMethod[]).map(m => (
                              <button
                                key={m}
                                onClick={() => setSettleMethod(m)}
                                className={`py-6 rounded-[24px] border-2 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all
                                    ${settleMethod === m ? 'bg-white border-[#4B3621] text-[#4B3621] shadow-xl translate-y-[-4px]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-200'}
                                `}
                              >
                                {m === 'Cash' && <Banknote size={24} />}
                                {m === 'M-Pesa' && <Smartphone size={24} />}
                                {m === 'Card' && <CreditCard size={24} />}
                                {m}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setIsSettleModalOpen(false)} className="flex-1 py-6 border-2 border-gray-100 rounded-[28px] font-black text-[10px] uppercase tracking-widest text-gray-400">Abort</button>
                      <button onClick={handleConfirmSettle} className="flex-[2] py-6 bg-[#4B3621] text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Settle & Archive</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionsPage;
