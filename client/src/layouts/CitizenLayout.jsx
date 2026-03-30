import { Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import {
  LayoutDashboard,
  PlusCircle,
  Map,
  User,
  FileText,
} from 'lucide-react';

const citizenNav = [
  {
    label: 'Main',
    links: [
      { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/citizen/report', label: 'Report Issue', icon: PlusCircle },
      { to: '/citizen/map', label: 'Public Map', icon: Map },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/citizen/profile', label: 'My Profile', icon: User },
    ],
  },
];

const CitizenLayout = () => {
  const { isAuthenticated, isCitizen, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'field') return <Navigate to="/field/tasks" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={citizenNav}
        title="RIRRS"
        subtitle="Citizen Portal"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {[
            { to: '/citizen/dashboard', icon: LayoutDashboard, label: 'Home' },
            { to: '/citizen/report', icon: PlusCircle, label: 'Report' },
            { to: '/citizen/map', icon: Map, label: 'Map' },
            { to: '/citizen/profile', icon: User, label: 'Profile' },
          ].map((item) => (
            <a
              key={item.to}
              href={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-subtle hover:text-primary-500 transition-colors"
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CitizenLayout;
