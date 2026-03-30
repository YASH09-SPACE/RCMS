import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import CitizenLayout from './layouts/CitizenLayout';
import AdminLayout from './layouts/AdminLayout';
import FieldLayout from './layouts/FieldLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Citizen Pages
import Dashboard from './pages/citizen/Dashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import PublicMap from './pages/citizen/PublicMap';
import IssueDetail from './pages/citizen/IssueDetail';
import Profile from './pages/citizen/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import IssueQueue from './pages/admin/IssueQueue';
import AdminIssueDetail from './pages/admin/AdminIssueDetail';
import WorkerManagement from './pages/admin/WorkerManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

// Field Worker Pages
import FieldTasks from './pages/field/FieldTasks';
import TaskDetail from './pages/field/TaskDetail';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<Navigate to="/citizen/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="map" element={<PublicMap />} />
          <Route path="issues/:id" element={<IssueDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="issues" element={<IssueQueue />} />
          <Route path="issues/:id" element={<AdminIssueDetail />} />
          <Route path="workers" element={<WorkerManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Field Worker Routes */}
        <Route path="/field" element={<FieldLayout />}>
          <Route index element={<Navigate to="/field/tasks" replace />} />
          <Route path="tasks" element={<FieldTasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
