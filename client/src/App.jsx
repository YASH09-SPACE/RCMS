import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Test Page
import TestMap from './pages/TestMap';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Citizen / Public Pages
import Home from './pages/citizen/Home';
import AllIssues from './pages/citizen/AllIssues';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import IssueDetail from './pages/citizen/IssueDetail';
import RaiseComplaint from './pages/citizen/RaiseComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import Profile from './pages/citizen/Profile';
import CitizenMap from './pages/citizen/CitizenMap';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminIssueDetail from './pages/admin/AdminIssueDetail';
import ConstructorsList from './pages/admin/ConstructorsList';

// Constructor Pages
import ConstructorDashboard from './pages/constructor/ConstructorDashboard';
import ConstructorTasks from './pages/constructor/ConstructorTasks';
import ConstructorTaskDetail from './pages/constructor/ConstructorTaskDetail';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminComplaints from './pages/superadmin/SuperAdminComplaints';
import SuperAdminIssueDetail from './pages/superadmin/SuperAdminIssueDetail';
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers';
import SuperAdminAnalytics from './pages/superadmin/SuperAdminAnalytics';
import SlaBreaches from './pages/superadmin/SlaBreaches';
import GujaratHeatmap from './pages/superadmin/GujaratHeatmap';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-body, #0f1117)', color: '#fff', fontFamily: 'Inter, sans-serif'
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
    return <Navigate to="/" replace />;
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
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card, #1a1d26)',
                color: 'var(--text-primary, #fff)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                padding: '12px 16px',
                border: '1px solid var(--border, rgba(255,255,255,0.06))'
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
            {/* ===== TEST ROUTE ===== */}
            <Route path="/test-map" element={<TestMap />} />

            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/issues" element={<AllIssues />} />
            <Route path="/map" element={<CitizenMap />} />
            <Route path="/issue/:id" element={<IssueDetail />} />

            {/* ===== AUTH ROUTES ===== */}
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ===== CITIZEN ROUTES ===== */}
            <Route path="/citizen/dashboard" element={
              <ProtectedRoute allowedRoles={['citizen']}><CitizenDashboard /></ProtectedRoute>
            } />
            <Route path="/citizen/raise" element={
              <ProtectedRoute allowedRoles={['citizen']}><RaiseComplaint /></ProtectedRoute>
            } />
            <Route path="/citizen/my-complaints" element={
              <ProtectedRoute allowedRoles={['citizen']}><MyComplaints /></ProtectedRoute>
            } />
            <Route path="/citizen/profile" element={
              <ProtectedRoute allowedRoles={['citizen']}><Profile /></ProtectedRoute>
            } />

            {/* ===== CONSTRUCTOR ROUTES ===== */}
            <Route path="/constructor" element={
              <ProtectedRoute allowedRoles={['constructor']}><ConstructorDashboard /></ProtectedRoute>
            } />
            <Route path="/constructor/dashboard" element={<Navigate to="/constructor" replace />} />
            <Route path="/constructor/tasks" element={
              <ProtectedRoute allowedRoles={['constructor']}><ConstructorTasks /></ProtectedRoute>
            } />
            <Route path="/constructor/tasks/:id" element={
              <ProtectedRoute allowedRoles={['constructor']}><ConstructorTaskDetail /></ProtectedRoute>
            } />
            
            {/* ===== ADMIN ROUTES ===== */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/complaints" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminComplaints /></ProtectedRoute>
            } />
            <Route path="/admin/complaints/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminIssueDetail /></ProtectedRoute>
            } />
            <Route path="/admin/constructors" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}><ConstructorsList /></ProtectedRoute>
            } />

            {/* ===== SUPER ADMIN ROUTES ===== */}
            <Route path="/superadmin" element={
              <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>
            } />
            <Route path="/superadmin/dashboard" element={<Navigate to="/superadmin" replace />} />
            <Route path="/superadmin/analytics" element={
              <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminAnalytics /></ProtectedRoute>
            } />
            <Route path="/superadmin/heatmap" element={
              <ProtectedRoute allowedRoles={['super_admin']}><GujaratHeatmap /></ProtectedRoute>
            } />
            <Route path="/superadmin/sla-breaches" element={
              <ProtectedRoute allowedRoles={['super_admin']}><SlaBreaches /></ProtectedRoute>
            } />
            <Route path="/superadmin/complaints" element={
              <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminComplaints /></ProtectedRoute>
            } />
            <Route path="/superadmin/complaints/:id" element={
              <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminIssueDetail /></ProtectedRoute>
            } />
            <Route path="/superadmin/users" element={
              <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminUsers /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Temporary placeholder for other panels
function PlaceholderDashboard({ role }) {
  const { user, logout } = useAuth();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-body, #0f1117)', color: 'var(--text-primary, #fff)',
      fontFamily: 'Inter, sans-serif', gap: '16px'
    }}>
      <div style={{
        background: 'var(--primary-light, rgba(66,133,244,0.1))', padding: '24px 48px',
        borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>🛣️ {role} Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Welcome, {user?.name}</p>
        <p style={{ color: 'var(--primary)', fontSize: '14px' }}>{user?.email}</p>
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
