import { Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import {
  LayoutDashboard,
  ListTodo,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

const adminNav = [
  {
    label: 'Dashboard',
    links: [
      { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Management',
    links: [
      { to: '/admin/issues', label: 'Issue Queue', icon: ListTodo, badge: '12' },
      { to: '/admin/workers', label: 'Field Workers', icon: Users },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const AdminLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/citizen/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={adminNav}
        title="RIRRS Admin"
        subtitle="Management Console"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
