import { Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import {
  ClipboardList,
  MapPin,
} from 'lucide-react';

const fieldNav = [
  {
    label: 'Tasks',
    links: [
      { to: '/field/tasks', label: 'My Tasks', icon: ClipboardList, end: true },
    ],
  },
];

const FieldLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'field') return <Navigate to="/citizen/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={fieldNav}
        title="RIRRS Field"
        subtitle="Field Worker"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav for field workers */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          <a href="/field/tasks" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-primary-500">
            <ClipboardList size={20} />
            <span className="text-[10px] font-medium">Tasks</span>
          </a>
          <a href="/field/tasks" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-subtle">
            <MapPin size={20} />
            <span className="text-[10px] font-medium">Map</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default FieldLayout;
