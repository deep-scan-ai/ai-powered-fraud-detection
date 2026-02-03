import { useState, useEffect } from "react";
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Shield,
  Sparkles,
  RefreshCw,
  Search,
  Activity,
  Zap,
  Clock,
  Users,
  AlertCircle,
  MoreVertical,
  Filter,
  Calendar,
  CreditCard,
  Globe,
} from "lucide-react";
import { analyzeTransaction, getStats, getTransactions } from "../services/api";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import StatsCard from "./StatsCard";
import RecentTransactions from "./RecentTransactions";
import TransactionChart from "./TransactionChart";
import AlertBanner from "./AlertBanner";

// Dummy data for testing without backend
const USE_DUMMY_DATA = process.env.REACT_APP_USE_DUMMY_DATA === "true" || false;

const DUMMY_STATS = {
  total_transactions: 1247,
  flagged_count: 42,
  accuracy: 96.5,
};

const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    transaction_id: "TXN001",
    user_id: "U100",
    amount: 75000,
    location: "Colombo",
    device: "mobile",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.95,
  },
  {
    id: 2,
    transaction_id: "TXN002",
    user_id: "U101",
    amount: 15000,
    location: "Kandy",
    device: "desktop",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.12,
  },
  {
    id: 3,
    transaction_id: "TXN003",
    user_id: "U102",
    amount: 250000,
    location: "Unknown",
    device: "mobile",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.98,
  },
  {
    id: 4,
    transaction_id: "TXN004",
    user_id: "U103",
    amount: 5000,
    location: "Galle",
    device: "tablet",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.05,
  },
  {
    id: 5,
    transaction_id: "TXN005",
    user_id: "U104",
    amount: 120000,
    location: "Colombo",
    device: "desktop",
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.87,
  },
  {
    id: 6,
    transaction_id: "TXN006",
    user_id: "U105",
    amount: 8500,
    location: "Negombo",
    device: "mobile",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.08,
  },
  {
    id: 7,
    transaction_id: "TXN007",
    user_id: "U106",
    amount: 35000,
    location: "Colombo",
    device: "mobile",
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.15,
  },
  {
    id: 8,
    transaction_id: "TXN008",
    user_id: "U107",
    amount: 180000,
    location: "Unknown",
    device: "desktop",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.92,
  },
  {
    id: 9,
    transaction_id: "TXN009",
    user_id: "U108",
    amount: 12000,
    location: "Kandy",
    device: "tablet",
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    is_fraud: false,
    risk_score: 0.1,
  },
  {
    id: 10,
    transaction_id: "TXN010",
    user_id: "U109",
    amount: 95000,
    location: "Colombo",
    device: "mobile",
    timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    is_fraud: true,
    risk_score: 0.89,
  },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    total_transactions: 0,
    flagged_count: 0,
    accuracy: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(USE_DUMMY_DATA);
  const [formData, setFormData] = useState({
    transaction_id: "",
    user_id: "",
    amount: "",
    location: "Colombo",
    device: "mobile",
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
      console.error("Failed to fetch stats, using dummy data", error);
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
      console.error("Failed to fetch transactions, using dummy data", error);
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const amount = parseFloat(formData.amount);
        const isFraud = amount > 50000;
        const riskScore = isFraud
          ? 0.85 + Math.random() * 0.15
          : Math.random() * 0.2;

        setResult({
          transaction_id: formData.transaction_id,
          is_fraud: isFraud,
          risk_score: riskScore,
          confidence: 0.92 + Math.random() * 0.08,
          reason: isFraud
            ? `High transaction amount (Rs. ${amount.toLocaleString()}) detected. Unusual pattern for user ${formData.user_id}.`
            : `Transaction amount within normal range. User ${formData.user_id} has good transaction history.`,
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
          risk_score: riskScore,
        };
        setTransactions([newTransaction, ...DUMMY_TRANSACTIONS]);
        setStats({
          total_transactions: DUMMY_STATS.total_transactions + 1,
          flagged_count: DUMMY_STATS.flagged_count + (isFraud ? 1 : 0),
          accuracy: DUMMY_STATS.accuracy,
        });
      } else {
        const data = await analyzeTransaction({
          ...formData,
          amount: parseFloat(formData.amount),
        });
        setResult(data);
        setTimeout(() => {
          fetchTransactions();
          fetchStats();
        }, 1000);
      }
    } catch (error) {
      setResult({ error: "Failed to analyze transaction" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fraud Detection Dashboard
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Real-time monitoring & AI-powered analysis
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
              className="pl-10 pr-4 py-2.5 glass-effect border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
          </div>
          <button className="p-2.5 glass-effect border border-white/20 rounded-xl hover:bg-white/80 transition-all">
            <Filter size={18} className="text-gray-700" />
          </button>
          <button className="p-2.5 glass-effect border border-white/20 rounded-xl hover:bg-white/80 transition-all">
            <Calendar size={18} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {usingDummyData ? (
        <div className="modern-card p-4 border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle
              className="text-yellow-600 flex-shrink-0"
              size={20}
            />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Demo Mode Active
              </p>
              <p className="text-sm text-yellow-700">Using sample data.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="modern-card p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="p-2 gradient-primary rounded-lg shadow-md">
              <Activity className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Live Fraud Detection Active
              </p>
              <p className="text-sm text-gray-600">
                AI model accuracy: {stats.accuracy}% • Last update: Just now
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">
                Connected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="modern-card p-6 bg-indigo-50/40 border border-indigo-200/50 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-200">
                  <CreditCard className="text-indigo-600" size={22} />
                </div>
                <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  Today
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Total Transactions</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading
                    ? "..."
                    : stats.total_transactions?.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100/60 rounded-lg">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">+12.5%</span>
                </div>
              </div>
            </div>

            <div className="modern-card p-6 bg-red-50/40 border border-red-200/50 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-200">
                  <AlertCircle className="text-red-600" size={22} />
                </div>
                <span className="text-xs font-medium text-red-600 px-2 py-1 bg-red-50 rounded-full">
                  High Risk
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Flagged Fraud</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats.flagged_count?.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100/60 rounded-lg">
                  <TrendingUp size={16} className="text-red-600" />
                  <span className="text-sm font-bold text-red-700">+3.2%</span>
                </div>
              </div>
            </div>

            <div className="modern-card p-6 bg-emerald-50/40 border border-emerald-200/50 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-200">
                  <Shield className="text-emerald-600" size={22} />
                </div>
                <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  Model
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 font-medium">AI Accuracy</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : `${stats.accuracy}%`}
                </p>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100/60 rounded-lg">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">+2.3%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Transaction Trends</h3>
                <p className="text-sm text-gray-600">
                  Last 30 days fraud pattern analysis
                </p>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View Details →
              </button>
            </div>
            <TransactionChart transactions={transactions} stats={stats} />
          </div>

          {/* Recent Transactions - Full Display */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <RecentTransactions
              transactions={transactions}
              loading={transactionsLoading}
            />
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

                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    AI Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check transaction in real-time
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (Rs.)
                      </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device Type
                    </label>
                    <div className="flex gap-2">
                      {["mobile", "desktop", "tablet"].map((device) => (
                        <button
                          key={device}
                          type="button"
                          onClick={() => setFormData({ ...formData, device })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.device === device
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
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
            <div
              className={`p-5 rounded-2xl border ${result.error
                ? "bg-red-50 border-red-200"
                : result.is_fraud
                  ? "bg-red-50 border-red-300"
                  : "bg-green-50 border-green-300"
                }`}
            >
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
                      <div
                        className={`p-2 rounded-lg ${result.is_fraud ? "bg-red-100" : "bg-green-100"}`}
                      >
                        {result.is_fraud ? (
                          <AlertCircle className="text-red-600" size={24} />
                        ) : (
                          <CheckCircle className="text-green-600" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {result.is_fraud
                            ? "Fraud Detected"
                            : "Transaction Safe"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {result.transaction_id}
                        </p>
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
                        <span className="font-medium">
                          {result.risk_score
                            ? (result.risk_score * 100).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${result.is_fraud ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${result.risk_score * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Confidence</span>
                        <span className="font-medium">
                          {result.confidence
                            ? (result.confidence * 100).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${result.is_fraud ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {result.reason && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Analysis</p>
                        <p className="text-sm font-medium text-gray-900">
                          {result.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Avg. Response
                    </p>
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
                    <p className="text-sm font-medium text-gray-900">
                      False Positives
                    </p>
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
                    <p className="text-sm font-medium text-gray-900">
                      Active Users
                    </p>
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
        <h1 className="text-2xl font-bold text-gray-900">
          Transaction History
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          All transaction records and analysis
        </p>
      </div>
      <RecentTransactions
        transactions={transactions}
        loading={transactionsLoading}
      />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Detailed insights and patterns
        </p>
      </div>

      {/* Charts */}
      <TransactionChart transactions={transactions} stats={stats} />

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="modern-card p-5 bg-blue-50/40 border border-blue-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-200">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Detection Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">94.2%</p>
          <p className="text-xs text-gray-600">Fraud successfully identified</p>
        </div>

        <div className="modern-card p-5 bg-purple-50/40 border border-purple-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-200">
              <Clock className="text-purple-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Response</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">0.8s</p>
          <p className="text-xs text-gray-600">Processing time per transaction</p>
        </div>

        <div className="modern-card p-5 bg-amber-50/40 border border-amber-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-200">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">False Positives</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">5.8%</p>
          <p className="text-xs text-gray-600">Incorrectly flagged as fraud</p>
        </div>

        <div className="modern-card p-5 bg-emerald-50/40 border border-emerald-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-200">
              <Users className="text-emerald-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">Active Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">2,431</p>
          <p className="text-xs text-gray-600">Currently being monitored</p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="modern-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Fraud Patterns</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50/40 rounded-lg border border-red-100">
              <div>
                <p className="font-semibold text-gray-900">Unusual Location</p>
                <p className="text-xs text-gray-600">Transactions from unexpected regions</p>
              </div>
              <span className="text-lg font-bold text-red-600">42%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50/40 rounded-lg border border-orange-100">
              <div>
                <p className="font-semibold text-gray-900">High Amount</p>
                <p className="text-xs text-gray-600">Unusually large transaction values</p>
              </div>
              <span className="text-lg font-bold text-orange-600">28%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50/40 rounded-lg border border-amber-100">
              <div>
                <p className="font-semibold text-gray-900">Rapid Succession</p>
                <p className="text-xs text-gray-600">Multiple transactions in short time</p>
              </div>
              <span className="text-lg font-bold text-amber-600">18%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50/40 rounded-lg border border-yellow-100">
              <div>
                <p className="font-semibold text-gray-900">New Device</p>
                <p className="text-xs text-gray-600">Unrecognized device access</p>
              </div>
              <span className="text-lg font-bold text-yellow-600">12%</span>
            </div>
          </div>
        </div>

        <div className="modern-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Model Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Precision</span>
                <span className="text-sm font-bold text-gray-900">92.4%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '92.4%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Recall</span>
                <span className="text-sm font-bold text-gray-900">89.7%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '89.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">F1 Score</span>
                <span className="text-sm font-bold text-gray-900">91.0%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: '91.0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">AUC-ROC</span>
                <span className="text-sm font-bold text-gray-900">95.3%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: '95.3%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure detection parameters
        </p>
      </div>

      {/* Detection Thresholds */}
      <div className="modern-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detection Thresholds</h3>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Fraud Confidence Threshold</label>
              <span className="text-sm font-bold text-indigo-600">75%</span>
            </div>
            <input type="range" min="50" max="99" value="75" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <p className="text-xs text-gray-500 mt-1">Minimum confidence level to flag a transaction as fraudulent</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Amount Alert Threshold</label>
              <span className="text-sm font-bold text-indigo-600">LKR 5,000</span>
            </div>
            <input type="range" min="1000" max="10000" value="5000" step="500" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <p className="text-xs text-gray-500 mt-1">Trigger additional checks for transactions above this amount</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Velocity Check Window</label>
              <span className="text-sm font-bold text-indigo-600">5 min</span>
            </div>
            <input type="range" min="1" max="30" value="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <p className="text-xs text-gray-500 mt-1">Time window for detecting rapid transaction patterns</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="modern-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Email Alerts</p>
              <p className="text-xs text-gray-600">Receive notifications for high-risk transactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-600">Text alerts for critical fraud events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Dashboard Notifications</p>
              <p className="text-xs text-gray-600">In-app alerts and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="modern-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">AI Model Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Version</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option>v2.5.1 (Current - Recommended)</option>
              <option>v2.4.3 (Stable)</option>
              <option>v2.6.0-beta (Experimental)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Data Refresh</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50/40 rounded-lg border border-indigo-200">
            <div>
              <p className="font-semibold text-gray-900">Auto-Learning</p>
              <p className="text-xs text-gray-600">Continuously improve model with new data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-6 py-2.5 gradient-primary text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="lg:ml-64 p-6 pt-20 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "transactions" && renderTransactions()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
