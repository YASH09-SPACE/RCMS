import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Back to login
      </Link>

      {sent ? (
        <div className="text-center py-8">
          <div className="inline-flex p-4 rounded-2xl bg-accent-green-light mb-4">
            <CheckCircle size={32} className="text-accent-green" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted">We've sent a password reset link to <strong className="text-foreground">{email}</strong></p>
          <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
            Try another email
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Reset password</h2>
            <p className="text-sm text-muted mt-1">Enter your email and we'll send you a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        </>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
