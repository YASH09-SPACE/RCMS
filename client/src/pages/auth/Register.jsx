import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile)) errors.mobile = 'Must be 10 digits';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the terms';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });
      toast.success('Account created successfully!');
      navigate('/citizen/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">Join thousands of citizens improving their local infrastructure.</p>

        {error && (
          <div className="form-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrapper">
              <input
                type="text"
                name="name"
                className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              <User size={16} className="form-input-icon" />
            </div>
            {fieldErrors.name && <div className="form-field-error">{fieldErrors.name}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <input
                type="email"
                name="email"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              <Mail size={16} className="form-input-icon" />
            </div>
            {fieldErrors.email && <div className="form-field-error">{fieldErrors.email}</div>}
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="form-input-wrapper">
              <input
                type="tel"
                name="mobile"
                className={`form-input ${fieldErrors.mobile ? 'error' : ''}`}
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="form-input-icon"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            {fieldErrors.mobile && <div className="form-field-error">{fieldErrors.mobile}</div>}
          </div>

          {/* Password Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock size={16} className="form-input-icon" />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <div className="form-field-error">{fieldErrors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm</label>
              <div className="form-input-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <Lock size={16} className="form-input-icon" />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <div className="form-field-error">{fieldErrors.confirmPassword}</div>}
            </div>
          </div>

          {/* Terms */}
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <span className="form-checkbox-text">
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </span>
          </label>
          {fieldErrors.agreeTerms && <div className="form-field-error" style={{ marginTop: '-12px', marginBottom: '12px' }}>{fieldErrors.agreeTerms}</div>}

          {/* Submit */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Sign In */}
        <button className="btn btn-google" type="button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continue with Google
        </button>

        {/* Footer Link */}
        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
