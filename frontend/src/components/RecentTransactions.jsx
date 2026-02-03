import { CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { useState } from "react";

function RecentTransactions({ transactions, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTransactions =
    transactions?.filter((tx) => {
      const matchesSearch =
        tx.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "fraud" && tx.is_fraud) ||
        (filterStatus === "safe" && !tx.is_fraud);

      return matchesSearch && matchesFilter;
    }) || [];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="modern-card p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Activities
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              All transactions - {filteredTransactions.length}{" "}
              {filteredTransactions.length === 1
                ? "transaction"
                : "transactions"}{" "}
              shown
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="text-gray-400" size={32} />
                    <p className="text-sm">No transactions found</p>
                    {(searchTerm || filterStatus !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("all");
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
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tx.transaction_id || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tx.user_id || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatAmount(tx.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {tx.location || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                      {tx.device || "N/A"}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(tx.timestamp)}
                    </div>
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
