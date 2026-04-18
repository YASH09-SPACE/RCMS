import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f1117', color: '#fff', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid rgba(66,133,244,0.2)',
            borderTopColor: '#4285f4', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect authenticated users away from auth pages
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading, getDashboardPath } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1d26',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.06)'
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' }
            }
          }}
        />

        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Placeholder routes for dashboards */}
          <Route path="/citizen/dashboard" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <PlaceholderDashboard role="Citizen" />
            </ProtectedRoute>
          } />
          <Route path="/constructor/dashboard" element={
            <ProtectedRoute allowedRoles={['constructor']}>
              <PlaceholderDashboard role="Constructor" />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlaceholderDashboard role="Admin" />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/dashboard" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <PlaceholderDashboard role="Super Admin" />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Temporary placeholder
function PlaceholderDashboard({ role }) {
  const { user, logout } = useAuth();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f1117', color: '#fff', fontFamily: 'Inter, sans-serif', gap: '16px'
    }}>
      <div style={{
        background: 'rgba(66,133,244,0.1)', padding: '24px 48px', borderRadius: '16px',
        textAlign: 'center', border: '1px solid rgba(66,133,244,0.15)'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>🛣️ {role} Dashboard</h1>
        <p style={{ color: '#6b7280', marginBottom: '4px' }}>Welcome, {user?.name}</p>
        <p style={{ color: '#4285f4', fontSize: '14px' }}>{user?.email}</p>
      </div>
      <button
        onClick={logout}
        style={{
          background: '#ef4444', color: '#fff', border: 'none', padding: '10px 24px',
          borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default App;
