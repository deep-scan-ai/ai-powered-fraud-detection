import { LayoutDashboard, Shield, Activity, Settings, BarChart3 } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-50 hidden lg:block">
      <div className="flex items-center gap-3 p-6 border-b border-slate-700">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold">FraudGuard</h2>
          <p className="text-xs text-slate-400">AI Detection</p>
        </div>
      </div>
      
      <nav className="p-4 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">AD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@fraudguard.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

