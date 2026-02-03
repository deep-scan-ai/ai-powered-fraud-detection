import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { useState } from 'react';

function RecentTransactions({ transactions, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount || 0);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm ||
      tx.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'fraud' && tx.is_fraud) ||
      (filterStatus === 'safe' && !tx.is_fraud);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="modern-card p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48 mb-6 shimmer"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg shimmer"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/30 via-purple-50/30 to-pink-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 gradient-primary rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            </div>
            <p className="text-sm text-gray-600 ml-3">{filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} found</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white font-medium shadow-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="fraud">Fraud</option>
              <option value="safe">Safe</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Device</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Clock className="text-gray-400" size={32} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-1">No transactions found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                    {(searchTerm || filterStatus !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('all');
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold mt-2 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, index) => (
                <tr
                  key={tx.transaction_id || index}
                  className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{tx.transaction_id || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {(tx.user_id || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{tx.user_id || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatAmount(tx.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{tx.location || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 rounded-full capitalize border border-gray-200">
                      {tx.device || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.is_fraud ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold gradient-danger text-white rounded-full shadow-md">
                        <XCircle size={14} />
                        Fraud
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold gradient-success text-white rounded-full shadow-md">
                        <CheckCircle size={14} />
                        Safe
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;
