import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, AlertCircle, Wrench, CheckCircle } from 'lucide-react';
import AuthLayout from '../../components/AuthLayout';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authService.forgotPassword(formData.email);
      toast.success(res.message || 'OTP sent successfully!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authService.resetPassword(formData.email, formData.otp, formData.password);
      toast.success(res.message || 'Password reset successful!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Icon */}
        <div className="auth-card-icon">
          <Wrench size={22} />
        </div>

        <h1>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h1>
        <p className="subtitle">
          {step === 1 
            ? "Enter your email to receive a recovery code" 
            : `Code sent to ${formData.email}`}
        </p>

        {error && (
          <div className="form-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <Mail size={16} className="form-input-icon" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Send Recovery Code <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">6-Digit Recovery Code</label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  className="form-input"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleChange}
                  style={{ letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold' }}
                />
                <KeyRound size={16} className="form-input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="form-input-wrapper">
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock size={16} className="form-input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="form-input-wrapper">
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <CheckCircle size={16} className="form-input-icon" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Reset Password <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <div className="auth-footer-link" style={{ marginTop: '24px' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeftIcon /> Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

export default ForgotPassword;
