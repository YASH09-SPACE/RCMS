import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Navigation, Save, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import CitizenLayout from '../../components/CitizenLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Helper to calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Medium', color: '#eab308' };
    return { score, label: 'Strong', color: '#22c55e' };
  };

  const strength = getPasswordStrength(passwordData.newPassword);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    pincode: user?.pincode || '',
    address: user?.address || ''
  });

  // Automatically fetch location when pincode is 6 digits AND has been changed by user
  useEffect(() => {
    if (form.pincode.length === 6 && editing && form.pincode !== user?.pincode) {
      const fetchLocation = async () => {
        setFetchingLocation(true);
        try {
          const res = await axios.get(`https://api.postalpincode.in/pincode/${form.pincode}`);
          const data = res.data[0];
          if (data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
            const office = data.PostOffice[0];
            const taluka = (office.Block && office.Block !== 'NA') ? office.Block : office.Name;
            const newAddress = `${taluka}, ${office.District}, ${office.State}`;
            setForm(prev => ({ ...prev, address: newAddress }));
            toast.success('Location auto-filled successfully');
          } else {
            toast.error('Invalid Pincode');
          }
        } catch (error) {
          toast.error('Failed to fetch location from pincode');
        } finally {
          setFetchingLocation(false);
        }
      };
      
      // Debounce slightly to ensure they're done typing
      const timer = setTimeout(() => {
        fetchLocation();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [form.pincode, editing]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await authService.updateProfile({
        name: form.name,
        mobile: form.mobile,
        pincode: form.pincode,
        address: form.address
      });
      
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully!');
        updateUser(res.data);
        setEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setPasswordLoading(true);
      const res = await authService.changePassword(passwordData.newPassword);
      if (res.success) {
        toast.success(res.message || 'Password successfully updated');
        setShowPasswordForm(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <CitizenLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>Profile</h1>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left Column: Avatar & Basic Info */}
          <div style={{
            flex: '1 1 250px', maxWidth: '300px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center'
          }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', fontWeight: 700, margin: '0 auto 16px'
            }}>
              {getInitials(user?.name)}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{user?.name}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '0', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>

          {/* Right Column: Form */}
          <div style={{
            flex: '2 1 500px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'left'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="c-form-group">
                <label className="c-form-label"><User size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Full Name</label>
                <input
                  type="text" className="c-form-input" value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                />
              </div>

              <div className="c-form-group">
                <label className="c-form-label"><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Email</label>
                <input type="email" className="c-form-input" value={form.email} disabled
                  style={{ opacity: 0.6 }}
                />
              </div>

              <div className="c-form-group">
                <label className="c-form-label"><Phone size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Mobile</label>
                <input
                  type="tel" className="c-form-input" value={form.mobile}
                  onChange={(e) => setForm(prev => ({ ...prev, mobile: e.target.value }))}
                  disabled={!editing}
                />
              </div>

              <div className="c-form-group">
                <label className="c-form-label"><Navigation size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Pincode</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" className="c-form-input" value={form.pincode}
                    placeholder="Enter 6-digit Pincode"
                    maxLength={6}
                    onChange={(e) => setForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                    disabled={!editing}
                  />
                  {fetchingLocation && (
                    <Loader2 size={16} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                  )}
                </div>
                {editing && (
                  <div style={{ fontSize: '12px', color: fetchingLocation ? 'var(--primary)' : 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {fetchingLocation ? 'Fetching location...' : 'Auto-fills valid pincode'}
                  </div>
                )}
              </div>
            </div>

            <div className="c-form-group" style={{ marginTop: '20px' }}>
              <label className="c-form-label"><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Full Address</label>
              <textarea
                className="c-form-textarea" value={form.address}
                placeholder="Enter your detailed address"
                onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                disabled={!editing}
                style={{ minHeight: '60px' }}
              />
            </div>

            <div className="form-actions" style={{ marginTop: '32px' }}>
              {editing ? (
                <>
                  <button className="c-btn c-btn-outline" onClick={() => {
                    // Reset to original on cancel
                    setForm({
                      name: user?.name || '',
                      email: user?.email || '',
                      mobile: user?.mobile || '',
                      pincode: user?.pincode || '',
                      address: user?.address || ''
                    });
                    setEditing(false);
                  }} disabled={loading}>Cancel</button>
                  <button className="c-btn c-btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />} 
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button className="c-btn c-btn-outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                    <Lock size={16} /> {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                  </button>
                  <button className="c-btn c-btn-primary" onClick={() => {
                    setEditing(true);
                    setShowPasswordForm(false);
                  }}>Edit Profile</button>
                </>
              )}
            </div>

            {/* Change Password Inline Form */}
            {showPasswordForm && !editing && (
              <div style={{ marginTop: '24px', padding: '24px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Change Password</h3>
                
                <div className="c-form-group">
                  <label className="c-form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="c-form-input"
                      placeholder="At least 6 characters"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={{ paddingRight: '40px' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                        {[1, 2, 3].map((level) => (
                          <div 
                            key={level} 
                            style={{ 
                              flex: 1, 
                              borderRadius: '2px', 
                              backgroundColor: strength.score >= (level === 1 ? 1 : level === 2 ? 3 : 5) ? strength.color : 'var(--border)' 
                            }} 
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                        <span style={{ color: passwordData.newPassword.length >= 6 ? '#22c55e' : '#ef4444' }}>
                          {passwordData.newPassword.length >= 6 ? '✓ Minimum 6 characters' : '✗ Minimum 6 characters required'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="c-form-group">
                  <label className="c-form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="c-form-input"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      style={{ paddingRight: '40px' }}
                    />
                  </div>
                </div>

                <button 
                  className="c-btn c-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
};

export default Profile;
