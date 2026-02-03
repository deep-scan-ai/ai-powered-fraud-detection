import { LayoutDashboard, Shield, Activity, Settings, BarChart3, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { userInfo, user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
    }
  };
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-indigo-500 to-purple-600' },
    { id: 'transactions', label: 'Transactions', icon: Activity, color: 'from-blue-500 to-cyan-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-emerald-500 to-teal-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-white/20 shadow-2xl z-50 hidden lg:block animate-slide-in">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 gradient-primary rounded-xl shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">FraudGuard</h2>
            <p className="text-xs text-gray-600 font-medium">AI Detection</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 mb-2 rounded-xl transition-all duration-300 group ${isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
                }`}
            >
              <Icon size={20} className={isActive ? 'drop-shadow-md' : ''} />
              <span className="font-semibold text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="mx-4 mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-emerald-600" />
          <p className="text-xs font-bold text-emerald-900 uppercase">System Status</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-700">AI Model</span>
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-700">Response</span>
            <span className="text-xs font-bold text-emerald-900">0.8s</span>
          </div>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {userInfo?.display_name?.slice(0, 2)?.toUpperCase() || user?.email?.slice(0, 2)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userInfo?.display_name || 'User'}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200/60 hover:border-red-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LogOut size={18} />
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
