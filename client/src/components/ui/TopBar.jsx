import { Menu, Bell, Search, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ onMenuClick, className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`sticky top-0 z-30 glass border-b border-border ${className}`}>
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-surface-raised rounded-lg px-3 py-2 border border-border min-w-[240px] transition-all focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20">
            <Search size={16} className="text-subtle" />
            <input
              type="text"
              placeholder="Search issues..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-subtle w-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors">
            <Bell size={18} className="text-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors"
            >
              <Avatar name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-foreground leading-none">{user?.name}</div>
                <div className="text-[10px] text-subtle capitalize mt-0.5">{user?.role}</div>
              </div>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl border border-border shadow-medium z-50 py-1 animate-scale-in">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-subtle">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-surface-raised transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
