import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const user = await login(email, password);
      const routes = { citizen: '/citizen/dashboard', admin: '/admin/dashboard', field: '/field/tasks' };
      navigate(routes[user.role] || '/citizen/dashboard');
    } catch (err) {
      // Error is set in store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile branding */}
      <div className="lg:hidden mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-subtle">Civic Tech Platform</span>
        <h1 className="text-2xl font-bold text-foreground mt-1">RIRRS</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted mt-1">Sign in to your account to continue</p>
      </div>

      {/* Demo credentials */}
      <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-200">
        <p className="text-xs font-semibold text-primary-700 mb-2">Demo Credentials</p>
        <div className="space-y-1">
          {[
            { role: 'Citizen', email: 'citizen@rirrs.in', pass: 'citizen123' },
            { role: 'Admin', email: 'admin@rirrs.in', pass: 'admin123' },
            { role: 'Field Worker', email: 'fieldworker@rirrs.in', pass: 'field123' },
          ].map((cred) => (
            <button
              key={cred.role}
              type="button"
              onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-primary-100 transition-colors group text-left"
            >
              <span className="font-medium text-primary-600">{cred.role}</span>
              <span className="text-primary-400 font-mono group-hover:text-primary-600 transition-colors">{cred.email}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-accent-red-light border border-accent-red/20 text-sm text-accent-red">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-subtle hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={isLoading}
          className="w-full"
          iconRight={ArrowRight}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
          Create account
        </Link>
      </p>
    </motion.div>
  );
};

export default Login;
