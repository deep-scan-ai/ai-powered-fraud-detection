import { LayoutDashboard, Shield, Activity, Settings, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

function MobileNav({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-lg text-gray-700"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-50 lg:hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">FraudGuard</h2>
                  <p className="text-xs text-slate-400">AI Detection</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="p-4 mt-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
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
          </div>
        </>
      )}
    </>
  );
}

export default MobileNav;

