import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Search, Sun, Moon, User, LogOut, FileText, Plus, Home, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './common/NotificationBell';
import '../styles/citizen.css';

const CitizenLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="citizen-layout">
      {/* ===== NAVBAR ===== */}
      <nav className="citizen-nav">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <Wrench size={18} />
            </div>
            <div className="nav-logo-text">
              Road<span>Care</span>
            </div>
          </Link>

          {/* Search */}
          <form className="nav-search" onSubmit={handleSearch}>
            <Search size={15} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search issues by title, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="nav-right">
          {/* Theme Toggle */}
          <button className="nav-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Raise Complaint CTA */}
              <Link to="/citizen/raise" className="nav-auth-link register" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Report Issue
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div className="nav-avatar" onClick={() => setShowDropdown(!showDropdown)}>
                  {getInitials(user?.name)}
                </div>

                {showDropdown && (
                  <div className="nav-dropdown">
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid var(--divider)` }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                    <Link to="/citizen/dashboard" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <Home size={15} /> Dashboard
                    </Link>
                    <Link to="/citizen/my-complaints" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FileText size={15} /> My Complaints
                    </Link>
                    <Link to="/citizen/profile" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <User size={15} /> Profile
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-auth-link login">Log In</Link>
              <Link to="/register" className="nav-auth-link register">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="citizen-main">
        {children}
      </main>
    </div>
  );
};

export default CitizenLayout;
