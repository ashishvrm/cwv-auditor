import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Settings, TrendingUp, FileText } from 'lucide-react';

interface CWVLayoutProps {
  children: React.ReactNode;
}

const CWVLayout: React.FC<CWVLayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-700 bg-slate-950">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-2xl font-bold text-white">CWV Audit</h1>
          <p className="mt-1 text-xs text-slate-400">Performance Monitor</p>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            to="/cwv-audit"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
              location.pathname === '/cwv-audit'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 size={20} />
            Dashboard
          </Link>

          <Link
            to="/cwv-audit/pages"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
              isActive('/cwv-audit/pages')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText size={20} />
            Pages
          </Link>

          <Link
            to="/cwv-audit/trends"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
              isActive('/cwv-audit/trends')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp size={20} />
            Trends
          </Link>

          <Link
            to="/cwv-audit/settings"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
              isActive('/cwv-audit/settings')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="border-t border-slate-700 p-4">
          <p className="text-xs text-slate-500">Core Web Vitals Dashboard v1.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default CWVLayout;
