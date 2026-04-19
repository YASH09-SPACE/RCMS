import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './common/NotificationBell';
import { LayoutDashboard, LogOut, Moon, Sun, ShieldAlert, Globe, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/admin.css';

const SuperAdminLayout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null; 
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="admin-sidebar-header">
          <div className="nav-logo" style={{ textDecoration: 'none' }}>
            <div className="nav-logo-icon" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
              <ShieldAlert size={20} />
            </div>
            <div className="nav-logo-text">State <span>Exec</span></div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/superadmin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          <NavLink to="/superadmin/analytics" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Analytics Matrix
          </NavLink>
          <NavLink to="/superadmin/heatmap" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Globe size={18} /> Live Heatmap
          </NavLink>
          <NavLink to="/superadmin/sla-breaches" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={18} /> SLA Monitors
          </NavLink>
          <NavLink to="/superadmin/complaints" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Globe size={18} /> All Complaints
          </NavLink>
          <NavLink to="/superadmin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} /> User Directory
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="nav-avatar" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>{user.name.charAt(0)}</div>
            <div className="admin-user-info">
              <span className="admin-user-name" title={user.name}>{user.name.length > 15 ? user.name.slice(0,15)+'...' : user.name}</span>
              <span className="admin-user-role" style={{ color: 'var(--error)' }}>Super Admin</span>
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
          <div className="admin-topbar-title">Gujarat RoadCare Executive Control</div>
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

export default SuperAdminLayout;
