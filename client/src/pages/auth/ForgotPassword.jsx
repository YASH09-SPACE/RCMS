import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import AuthLayout from '../../components/AuthLayout';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Icon */}
        <div className="auth-card-icon">
          <KeyRound size={22} />
        </div>

        <h1>Forgot Password?</h1>
        <p className="subtitle">Enter your email to receive a reset link</p>

        {error && (
          <div className="form-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {sent ? (
          <div className="success-message">
            <div className="auth-card-icon success" style={{ margin: '0 auto 16px' }}>
              <Mail size={24} />
            </div>
            <p>We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
            <button className="btn btn-primary" onClick={() => setSent(false)}>
              Send Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
                <Mail size={16} className="form-input-icon" />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Send Reset Link <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="auth-footer-link">
          Remembered your password? <Link to="/login">Login</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
