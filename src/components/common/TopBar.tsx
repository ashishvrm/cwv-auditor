import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get breadcrumb path from current route
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'Home';

    return pathSegments
      .map((segment) => {
        // Convert kebab-case to Title Case
        return segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      })
      .join(' / ');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Get user avatar (first letter or default)
  const avatarLetter = user?.displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-6">
      {/* Left: Breadcrumb */}
      <div className="text-slate-300 text-sm font-medium">
        {getBreadcrumb()}
      </div>

      {/* Right: User info and actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-semibold text-white">
              {avatarLetter}
            </div>

            {/* Display Name */}
            <span className="text-sm font-medium">{user?.displayName}</span>

            {/* Dropdown Arrow */}
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-lg border border-slate-600 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-600">
                <p className="text-sm font-medium text-white">
                  {user?.displayName}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-slate-200 hover:bg-slate-600 transition-colors text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
