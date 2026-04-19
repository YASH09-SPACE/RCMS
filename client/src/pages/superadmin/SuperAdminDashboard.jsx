import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Users, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminService.getStats()
      .then(res => setData(res))
      .catch(err => toast.error('Failed to load global stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SuperAdminLayout><div className="loading-spinner" style={{ padding: '60px' }} /></SuperAdminLayout>;

  const s = data?.stats || {};
  const total = s.total || 0;
  const active = (s.in_progress || 0) + (s.assigned || 0);

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Gujarat Overall Status</h1>
        <p style={{ color: 'var(--text-secondary)' }}>State-wide aggregate metrics for all civic maintenance operations.</p>
      </div>

      {data?.alerts?.escalated > 0 && (
         <div style={{ background: 'var(--error-bg)', borderLeft: '4px solid var(--error)', padding: '16px', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
           <AlertTriangle color="var(--error)" />
           <div>
             <h4 style={{ color: 'var(--error)', fontWeight: 600, fontSize: '15px' }}>Critical Executive Action Required</h4>
             <p style={{ color: 'var(--error)', fontSize: '13px' }}>There are {data.alerts.escalated} escalated complaints that require Super Admin intervention immediately.</p>
           </div>
           <Link to="/superadmin/complaints?status=escalated" className="c-btn c-btn-outline" style={{ marginLeft: 'auto', borderColor: 'var(--error)', color: 'var(--error)', fontSize: '13px', padding: '6px 12px' }}>
             Review Now
           </Link>
         </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Petitions</span>
            <div className="admin-stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Activity size={20} /></div>
          </div>
          <div className="admin-stat-value">{total}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Currently Active</span>
            <div className="admin-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><AlertTriangle size={20} /></div>
          </div>
          <div className="admin-stat-value">{active}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Completed & Verified</span>
            <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><ShieldCheck size={20} /></div>
          </div>
          <div className="admin-stat-value">{s.closed || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
        <Link to="/superadmin/users" style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'var(--transition)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Manage System Users</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add Ward Admins & Workers</span>
        </Link>
      </div>

    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
