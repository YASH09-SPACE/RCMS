import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './common/NotificationBell';
import { LayoutDashboard, LogOut, Moon, Sun, HardHat, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/admin.css'; // Reusing admin sidebar and layout styles exactly

const ConstructorLayout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated or not a constructor, redirect
    if (!isAuthenticated || user?.role !== 'constructor') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!isAuthenticated || user?.role !== 'constructor') {
    return null; 
  }

  return (
    <div className="admin-layout">
      {/* Sidebar - Reusing admin classes for consistent styling */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="nav-logo" style={{ textDecoration: 'none' }}>
            <div className="nav-logo-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <HardHat size={20} />
            </div>
            <div className="nav-logo-text">RCMS <span>Worker</span></div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/constructor" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/constructor/tasks" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> My Work Queue
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="nav-avatar">{user.name.charAt(0)}</div>
            <div className="admin-user-info">
              <span className="admin-user-name" title={user.name}>{user.name.length > 15 ? user.name.slice(0,15)+'...' : user.name}</span>
              <span className="admin-user-role">Field Worker</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', paddingLeft: '8px', color: 'var(--error)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Constructor Field Panel</div>
          <div className="admin-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell />
            <button className="nav-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConstructorLayout;
