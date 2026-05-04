import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('rcms_token');
    const savedUser = localStorage.getItem('rcms_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        const res = await authService.getMe();
        setUser(res.data);
        localStorage.setItem('rcms_user', JSON.stringify(res.data));
      } catch {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success) {
      localStorage.setItem('rcms_token', res.data.token);
      localStorage.setItem('rcms_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success) {
      localStorage.setItem('rcms_token', res.data.token);
      localStorage.setItem('rcms_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('rcms_token');
    localStorage.removeItem('rcms_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('rcms_user', JSON.stringify(userData));
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'citizen': return '/citizen/dashboard';
      case 'constructor': return '/constructor/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'super_admin': return '/superadmin/dashboard';
      default: return '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      getDashboardPath,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
