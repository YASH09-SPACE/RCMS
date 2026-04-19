import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './common/NotificationBell';
import { LayoutDashboard, FileText, Component, LogOut, Moon, Sun, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/admin.css'; // Make sure the new CSS is loaded

const AdminLayout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated or not an admin/super_admin, redirect immediately
    if (!isAuthenticated || !['admin', 'super_admin'].includes(user?.role)) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Prevent flash of content before redirect
  if (!isAuthenticated || !['admin', 'super_admin'].includes(user?.role)) {
    return null; 
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="nav-logo" style={{ textDecoration: 'none' }}>
            <div className="nav-logo-icon"><ShieldAlert size={20} /></div>
            <div className="nav-logo-text">RCMS <span>Admin</span></div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/complaints" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Taluka/Ward Complaints
          </NavLink>
          <NavLink to="/admin/constructors" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Component size={18} /> Constructors
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="nav-avatar">{user.name.charAt(0)}</div>
            <div className="admin-user-info">
              <span className="admin-user-name" title={user.name}>{user.name.length > 15 ? user.name.slice(0,15)+'...' : user.name}</span>
              <span className="admin-user-role">Taluka/Ward Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', paddingLeft: '8px', color: 'var(--error)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">Taluka/Ward Administration Panel</div>
          <div className="admin-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell />
            <button className="nav-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="admin-content">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
