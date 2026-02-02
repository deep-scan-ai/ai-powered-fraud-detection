import { Shield, Bell, Search } from 'lucide-react';

function Header() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">FraudGuard</h1>
          <p className="text-xs text-gray-600">AI-Powered Fraud Detection</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
          />
        </div>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
}

export default Header;
