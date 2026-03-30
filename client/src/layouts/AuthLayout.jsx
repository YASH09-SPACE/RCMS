import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();

  // If already logged in, redirect based on role
  if (isAuthenticated && user) {
    const roleRoutes = {
      citizen: '/citizen/dashboard',
      admin: '/admin/dashboard',
      field: '/field/tasks',
    };
    return <Navigate to={roleRoutes[user.role] || '/citizen/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side — illustration / branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
              Civic Tech Platform
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Road Issue<br />
              <span className="text-white/40">Reporting &</span><br />
              Resolution System
            </h1>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: '248+', label: 'Reports Filed' },
                { num: '87%', label: 'SLA Compliance' },
                { num: '4.1★', label: 'Satisfaction' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-bold text-white">{stat.num}</div>
                  <div className="text-[10px] font-mono text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/30 leading-relaxed">
              Report road issues, track resolutions, and help improve your city's infrastructure. Your voice matters.
            </p>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
