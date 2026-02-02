import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Shield, 
  Sparkles, 
  RefreshCw,
  BarChart3,
  FileText,
  Settings,
  Search,
  Filter,
  Download,
  ChevronRight,
  Activity,
  Zap,
  Clock,
  MapPin,
  Smartphone,
  Users,
  AlertCircle,
  TrendingDown,
  Eye,
  MoreVertical,
  Calendar,
  CreditCard,
  Globe
} from 'lucide-react';
import { analyzeTransaction, getStats, getTransactions } from '../services/api';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import StatsCard from './StatsCard';
import RecentTransactions from './RecentTransactions';
import TransactionChart from './TransactionChart';
import AlertBanner from './AlertBanner';

// Dummy data for testing without backend
const USE_DUMMY_DATA = process.env.REACT_APP_USE_DUMMY_DATA === 'true' || false;

const DUMMY_STATS = {
  total_transactions: 1247,
  flagged_count: 42,
  accuracy: 96.5
};

const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    transaction_id: 'TXN001',
    user_id: 'U100',
    amount: 75000,
    location: 'Colombo',
    device: 'mobile',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.95
  },
  {
    id: 2,
    transaction_id: 'TXN002',
    user_id: 'U101',
    amount: 15000,
    location: 'Kandy',
    device: 'desktop',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.12
  },
  {
    id: 3,
    transaction_id: 'TXN003',
    user_id: 'U102',
    amount: 250000,
    location: 'Unknown',
    device: 'mobile',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.98
  },
  {
    id: 4,
    transaction_id: 'TXN004',
    user_id: 'U103',
    amount: 5000,
    location: 'Galle',
    device: 'tablet',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.05
  },
  {
    id: 5,
    transaction_id: 'TXN005',
    user_id: 'U104',
    amount: 120000,
    location: 'Colombo',
    device: 'desktop',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.87
  },
  {
    id: 6,
    transaction_id: 'TXN006',
    user_id: 'U105',
    amount: 8500,
    location: 'Negombo',
    device: 'mobile',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.08
  },
  {
    id: 7,
    transaction_id: 'TXN007',
    user_id: 'U106',
    amount: 35000,
    location: 'Colombo',
    device: 'mobile',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.15
  },
  {
    id: 8,
    transaction_id: 'TXN008',
    user_id: 'U107',
    amount: 180000,
    location: 'Unknown',
    device: 'desktop',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.92
  },
  {
    id: 9,
    transaction_id: 'TXN009',
    user_id: 'U108',
    amount: 12000,
    location: 'Kandy',
    device: 'tablet',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.10
  },
  {
    id: 10,
    transaction_id: 'TXN010',
    user_id: 'U109',
    amount: 95000,
    location: 'Colombo',
    device: 'mobile',
    timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.89
  }
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total_transactions: 0, flagged_count: 0, accuracy: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(USE_DUMMY_DATA);
  const [formData, setFormData] = useState({
    transaction_id: '',
    user_id: '',
    amount: '',
    location: 'Colombo',
    device: 'mobile'
  });

  useEffect(() => {
    if (USE_DUMMY_DATA || usingDummyData) {
      setStats(DUMMY_STATS);
      setTransactions(DUMMY_TRANSACTIONS);
      setStatsLoading(false);
      setTransactionsLoading(false);
      setUsingDummyData(true);
    } else {
      fetchTransactions();
      fetchStats();
      const interval = setInterval(() => {
        fetchStats();
        fetchTransactions();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [usingDummyData]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getStats();
      setStats(data);
      setUsingDummyData(false);
    } catch (error) {
      console.error('Failed to fetch stats, using dummy data', error);
      setStats(DUMMY_STATS);
      setUsingDummyData(true);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const data = await getTransactions();
      setTransactions(data || []);
      setUsingDummyData(false);
    } catch (error) {
      console.error('Failed to fetch transactions, using dummy data', error);
      setTransactions(DUMMY_TRANSACTIONS);
      setUsingDummyData(true);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (USE_DUMMY_DATA || usingDummyData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const amount = parseFloat(formData.amount);
        const isFraud = amount > 50000;
        const riskScore = isFraud ? 0.85 + Math.random() * 0.15 : Math.random() * 0.2;
        
        setResult({
          transaction_id: formData.transaction_id,
          is_fraud: isFraud,
          risk_score: riskScore,
          confidence: 0.92 + Math.random() * 0.08,
          reason: isFraud 
            ? `High transaction amount (Rs. ${amount.toLocaleString()}) detected. Unusual pattern for user ${formData.user_id}.`
            : `Transaction amount within normal range. User ${formData.user_id} has good transaction history.`
        });
        
        const newTransaction = {
          id: DUMMY_TRANSACTIONS.length + 1,
          transaction_id: formData.transaction_id,
          user_id: formData.user_id,
          amount: amount,
          location: formData.location,
          device: formData.device,
          timestamp: new Date().toISOString(),
          is_fraud: isFraud,
          risk_score: riskScore
        };
        setTransactions([newTransaction, ...DUMMY_TRANSACTIONS]);
        setStats({
          total_transactions: DUMMY_STATS.total_transactions + 1,
          flagged_count: DUMMY_STATS.flagged_count + (isFraud ? 1 : 0),
          accuracy: DUMMY_STATS.accuracy
        });
      } else {
        const data = await analyzeTransaction({
          ...formData,
          amount: parseFloat(formData.amount)
        });
        setResult(data);
        setTimeout(() => {
          fetchTransactions();
          fetchStats();
        }, 1000);
      }
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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">Fraud Detection Dashboard</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Real-time monitoring & AI-powered analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} />
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {usingDummyData ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-yellow-800">Demo Mode Active</p>
              <p className="text-sm text-yellow-700">Using sample data.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Live Fraud Detection Active</p>
              <p className="text-sm text-gray-600">AI model accuracy: {stats.accuracy}% • Last update: Just now</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="text-blue-600" size={20} />
                </div>
                <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">Today</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.total_transactions?.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">+12.5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <span className="text-xs font-medium text-red-600 px-2 py-1 bg-red-50 rounded-full">High Risk</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Flagged Fraud</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.flagged_count?.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">+3.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="text-green-600" size={20} />
                </div>
                <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">Model</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">AI Accuracy</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : `${stats.accuracy}%`}
                </p>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">+2.3%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Transaction Trends</h3>
                <p className="text-sm text-gray-600">Last 30 days fraud pattern analysis</p>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View Details →
              </button>
            </div>
            <TransactionChart transactions={transactions} stats={stats} />
          </div>

          {/* Recent Transactions - Full Display */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <RecentTransactions transactions={transactions} loading={transactionsLoading} />
          </div>
        </div>

        {/* Right Column - Analysis Form & Quick Stats */}
        <div className="space-y-6">
          {/* Analysis Form */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Subtle green gradient overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">AI Analysis</h3>
                  <p className="text-sm text-gray-600">Check transaction in real-time</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                     <input
                       type="text"
                       name="transaction_id"
                       value={formData.transaction_id}
                       onChange={handleChange}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                       placeholder="TXN001"
                       required
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                       <input
                         type="text"
                         name="user_id"
                         value={formData.user_id}
                         onChange={handleChange}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                         placeholder="U123"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                       <input
                         type="number"
                         name="amount"
                         value={formData.amount}
                         onChange={handleChange}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                         placeholder="50000"
                         required
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                     <div className="relative">
                       <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                       <input
                         type="text"
                         name="location"
                         value={formData.location}
                         onChange={handleChange}
                         className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                         placeholder="Colombo"
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
                     <div className="flex gap-2">
                       {['mobile', 'desktop', 'tablet'].map((device) => (
                         <button
                           key={device}
                           type="button"
                           onClick={() => setFormData({...formData, device})}
                           className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                             formData.device === device
                               ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                               : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                           }`}
                         >
                           {device.charAt(0).toUpperCase() + device.slice(1)}
                         </button>
                       ))}
                     </div>
                   </div>
                </div>

                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                 >
                   {loading ? (
                     <span className="flex items-center justify-center gap-2">
                       <RefreshCw className="animate-spin" size={20} />
                       Analyzing...
                     </span>
                   ) : (
                     <span className="flex items-center justify-center gap-2">
                       <Sparkles size={18} />
                       Analyze Now
                     </span>
                   )}
                 </button>
              </form>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-5 rounded-2xl border ${
              result.error
                ? 'bg-red-50 border-red-200'
                : result.is_fraud
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
            }`}>
              {result.error ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">Error</h3>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${result.is_fraud ? 'bg-red-100' : 'bg-green-100'}`}>
                        {result.is_fraud ? (
                          <AlertCircle className="text-red-600" size={24} />
                        ) : (
                          <CheckCircle className="text-green-600" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {result.is_fraud ? 'Fraud Detected' : 'Transaction Safe'}
                        </h3>
                        <p className="text-sm text-gray-600">ID: {result.transaction_id}</p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical size={20} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Risk Score</span>
                        <span className="font-medium">{result.risk_score ? (result.risk_score * 100).toFixed(1) : '0'}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${result.is_fraud ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${result.risk_score * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Confidence</span>
                        <span className="font-medium">{result.confidence ? (result.confidence * 100).toFixed(1) : '0'}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${result.is_fraud ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {result.reason && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Analysis</p>
                        <p className="text-sm font-medium text-gray-900">{result.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Avg. Response</p>
                    <p className="text-xs text-gray-500">Processing time</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">0.8s</span>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Zap className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">False Positives</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">12</span>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="text-green-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active Users</p>
                    <p className="text-xs text-gray-500">Monitoring</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">2.4k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-500 text-sm mt-1">All transaction records and analysis</p>
      </div>
      <RecentTransactions transactions={transactions} loading={transactionsLoading} />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Detailed insights and patterns</p>
      </div>
      <TransactionChart transactions={transactions} stats={stats} />
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure detection parameters</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500">Settings panel will be available soon.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="lg:ml-64 p-6 pt-20 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;