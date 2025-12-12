import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { analyzeTransaction, getStats, getTransactions  } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    total_transactions: 0,
    flagged_count: 0,
    accuracy: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    transaction_id: '',
    user_id: '',
    amount: '',
    location: 'Colombo',
    device: 'mobile'
  });

  useEffect(() => {
    // fetchStats();
    fetchTransactions(); 
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to analyze transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">
          AI Fraud Detection Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total_transactions}
                </p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Flagged as Fraud</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.flagged_count}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Model Accuracy</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.accuracy}%
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        {/* Analysis Form */}
        <div className="p-8 mb-8 bg-white rounded-lg shadow">
          <h2 className="mb-6 text-2xl font-bold">Analyze Transaction</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TXN001"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="U123"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Colombo"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Device
                </label>
                <select
                  name="device"
                  value={formData.device}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : 'Analyze Transaction'}
            </button>
          </form>

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-6 rounded-lg ${
              result.error 
                ? 'bg-red-50 border-2 border-red-200' 
                : result.is_fraud 
                ? 'bg-red-50 border-2 border-red-300'
                : 'bg-green-50 border-2 border-green-300'
            }`}>
              {result.error ? (
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-600" size={24} />
                  <div>
                    <h3 className="font-bold text-red-900">Error</h3>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {result.is_fraud ? (
                      <XCircle className="text-red-600" size={32} />
                    ) : (
                      <CheckCircle className="text-green-600" size={32} />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {result.is_fraud ? '⚠️ Fraud Detected' : '✅ Transaction Safe'}
                      </h3>
                      <p className="text-gray-600">Transaction ID: {result.transaction_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Risk Score</p>
                      <p className="text-2xl font-bold">
                        {(result.risk_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-2xl font-bold">
                        {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {result.reason && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium text-gray-900">{result.reason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>


        {/* Transactions Table */}
        <div className="p-8 mb-8 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-2xl font-bold">All Transactions</h2>
          <table className="min-w-full border border-gray-200 table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Transaction ID</th>
                <th className="px-4 py-2 border">User ID</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Location</th>
                <th className="px-4 py-2 border">Device</th>
                <th className="px-4 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.transaction_id}>
                  <td className="px-4 py-2 border">{tx.transaction_id}</td>
                  <td className="px-4 py-2 border">{tx.user_id}</td>
                  <td className="px-4 py-2 border">{tx.amount}</td>
                  <td className="px-4 py-2 border">{tx.location}</td>
                  <td className="px-4 py-2 border">{tx.device}</td>
                  <td className="px-4 py-2 border">{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            
      </div>
    </div>
  );
}

export default Dashboard;