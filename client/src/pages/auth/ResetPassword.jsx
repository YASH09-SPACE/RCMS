import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import AuthLayout from '../../components/AuthLayout';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Success state - Password Updated screen
  if (success) {
    return (
      <AuthLayout>
        <div className="auth-card">
          <div className="auth-card-icon success" style={{ margin: '0 auto 16px' }}>
            <ShieldCheck size={28} />
          </div>

          <h1>Password Updated!</h1>
          <div className="success-message">
            <p>Your password has been changed successfully.<br />You can now log in with your new credentials.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Back to Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Icon */}
        <div className="auth-card-icon">
          <Lock size={22} />
        </div>

        <h1>Set New Password</h1>
        <p className="subtitle">Choose a strong password for your account</p>

        {error && (
          <div className="form-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="form-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <Lock size={16} className="form-input-icon" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="form-input-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Lock size={16} className="form-input-icon" />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : <>Update Password <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
