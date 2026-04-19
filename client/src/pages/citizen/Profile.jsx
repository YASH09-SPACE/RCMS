import { useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CitizenLayout from '../../components/CitizenLayout';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
    setEditing(false);
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <CitizenLayout>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>Profile</h1>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center'
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 700, margin: '0 auto 16px'
          }}>
            {getInitials(user?.name)}
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{user?.name}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'capitalize' }}>{user?.role}</p>

          {/* Form */}
          <div style={{ textAlign: 'left' }}>
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

            <div className="form-actions">
              {editing ? (
                <>
                  <button className="c-btn c-btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="c-btn c-btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save Changes
                  </button>
                </>
              ) : (
                <button className="c-btn c-btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
};

export default Profile;
