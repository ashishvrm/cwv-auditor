import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Sliders,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`;

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ml-6 ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`;

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-700 flex flex-col transition-all duration-300 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Brand */}
      <div className="px-4 py-6 border-b border-slate-700">
        {isCollapsed ? (
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
            CW
          </div>
        ) : (
          <h1 className="text-xl font-bold text-white">CWV Portal</h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {/* Home */}
        <NavLink to="/" className={navLinkClass}>
          <Home size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Home</span>}
        </NavLink>

        {/* CWV Audit with Sub-nav */}
        <div>
          <NavLink to="/cwv-audit" className={navLinkClass}>
            <Activity size={20} className="flex-shrink-0" />
            {!isCollapsed && <span>CWV Audit</span>}
          </NavLink>

          {!isCollapsed && (
            <div className="space-y-1 mt-2">
              <NavLink to="/cwv-audit" className={subNavLinkClass}>
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/cwv-audit/pages" className={subNavLinkClass}>
                <FileIcon size={16} />
                Pages
              </NavLink>
              <NavLink to="/cwv-audit/trends" className={subNavLinkClass}>
                <BarChart3 size={16} />
                Trends
              </NavLink>
              <NavLink to="/cwv-audit/settings" className={subNavLinkClass}>
                <Sliders size={16} />
                Settings
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Divider */}
      <div className="border-t border-slate-700" />

      {/* Settings */}
      <div className="px-3 py-4">
        <NavLink to="/settings" className={navLinkClass}>
          <Settings size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-700 px-3 py-4">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

// File icon component (since lucide-react might not have a simple file icon)
const FileIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

export default Sidebar;
