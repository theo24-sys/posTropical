
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
    setSettleMethod('Cash'); // Default
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
    if (status === 'Paid') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Paid</span>;
    return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
  };

  return (
    <div className="min-h-screen bg-beige-100 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-coffee-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-4">
             <button onClick={() => navigate('/')} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="font-serif text-xl font-bold">Transaction Management</h1>
                <p className="text-coffee-300 text-xs">View and manage order status</p>
             </div>
         </div>
         <div className="hidden md:flex bg-white/10 px-4 py-2 rounded-lg items-center gap-2">
            <span className="text-sm font-medium">Pending Orders:</span>
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">{transactions.filter(t => t.status === 'Pending').length}</span>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-coffee-200 p-4 sticky top-0 z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             {(['All', 'Pending', 'Paid'] as const).map(status => (
                <button 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                    ${filterStatus === status ? 'bg-coffee-800 text-white shadow-md' : 'bg-beige-50 text-coffee-600 hover:bg-coffee-100'}
                  `}
                >
                  {status} Orders
                </button>
             ))}
         </div>
         
         <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Staff or Table..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-xl focus:ring-2 focus:ring-coffee-500 outline-none bg-beige-50"
            />
         </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
         <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
             <table className="w-full text-left text-sm">
                 <thead className="bg-beige-50 text-coffee-600 font-medium border-b border-coffee-100">
                     <tr>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Order Info</th>
                         <th className="px-6 py-4">Items</th>
                         <th className="px-6 py-4">Total</th>
                         <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-coffee-50">
                    {filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-coffee-400 italic">No transactions found matching your filter.</td>
                        </tr>
                    ) : (
                        filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-beige-50 transition-colors">
                                <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-coffee-800">#{t.id}</span>
                                        <span className="text-xs text-coffee-500">{new Date(t.date).toLocaleString()}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {t.orderType === 'Take Away' ? (
                                                <span className="text-xs bg-tropical-50 px-1.5 rounded border border-tropical-200 text-tropical-700 flex items-center gap-1">
                                                    <ShoppingBasket size={10} /> Take Away
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-gray-100 px-1.5 rounded border border-gray-200 text-gray-600 flex items-center gap-1">
                                                    <Utensils size={10} /> Table {t.tableNumber || '-'}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">by {t.cashierName}</span>
                                        </div>
                                        {t.updatedBy && t.status === 'Paid' && (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-medium">
                                                <UserIcon size={10} /> Collected by {t.updatedBy}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-xs">
                                        <p className="truncate font-medium text-coffee-700">
                                            {t.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </p>
                                        <p className="text-xs text-coffee-400">{t.items.length} items</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-lg text-coffee-900">{CURRENCY} {t.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    {t.status === 'Pending' ? (
                                        <div className="flex justify-end gap-2">
                                            {onEditOrder && (
                                                <button
                                                    onClick={() => onEditOrder(t)}
                                                    className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    title="Add items to this order"
                                                >
                                                    <PlusCircle size={14} /> Add Items
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleSettleClick(t)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-green-900/10 transition-colors"
                                            >
                                                Mark Paid
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">Completed</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* Settle Modal */}
      {isSettleModalOpen && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                  <div className="bg-green-600 p-4 text-white text-center">
                      <h3 className="font-bold text-lg">Confirm Payment</h3>
                      <p className="text-green-100 text-sm">Order #{selectedTransaction.id}</p>
                  </div>
                  <div className="p-6">
                      <div className="text-center mb-6">
                          <p className="text-gray-500 text-sm mb-1">Total Amount Due</p>
                          <h2 className="text-3xl font-bold text-gray-900">{CURRENCY} {selectedTransaction.total.toLocaleString()}</h2>
                          <div className="mt-2 text-xs bg-gray-50 text-gray-500 p-2 rounded border border-gray-100">
                             Collecting as: <strong>{user.name}</strong>
                          </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Payment Method</p>
                          <div className="grid grid-cols-3 gap-2">
                              {(['Cash', 'M-Pesa', 'Card'] as PaymentMethod[]).map(m => (
                                  <button
                                    key={m}
                                    onClick={() => setSettleMethod(m)}
                                    className={`py-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 transition-all
                                        ${settleMethod === m ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}
                                    `}
                                  >
                                    {m === 'Cash' && <Banknote size={18} />}
                                    {m === 'M-Pesa' && <Smartphone size={18} />}
                                    {m === 'Card' && <CreditCard size={18} />}
                                    {m}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="flex gap-3">
                          <button onClick={() => setIsSettleModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                          <button onClick={handleConfirmSettle} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-900/20">Confirm Paid</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionsPage;
