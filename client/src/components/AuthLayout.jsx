import { Link } from 'react-router-dom';
import { Wrench, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/auth.css';

const AuthLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="auth-layout">
      {/* Navigation Bar */}
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <Wrench size={18} />
          </div>
          <div className="auth-logo-text">
            Road<span>Care</span>
          </div>
        </Link>

        <div className="auth-nav-actions">
          <button className="theme-toggle" title="Toggle theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="auth-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="auth-page-footer">
        © 2026 RoadCare Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
