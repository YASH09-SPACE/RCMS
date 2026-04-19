import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import AdminLayout from '../../components/AdminLayout';
import GlobalMap from '../../components/common/GlobalMap';
import { Clock, AlertTriangle, CheckCircle, ListTodo, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(res => setStats(res))
      .catch(err => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="loading-spinner" /></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back. Here's what's happening in your ward.</p>
      </div>

      {stats?.slaAlerts > 0 && (
        <div style={{ background: 'var(--error-bg)', borderLeft: '4px solid var(--error)', padding: '16px', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AlertTriangle color="var(--error)" />
          <div>
            <h4 style={{ color: 'var(--error)', fontWeight: 600, fontSize: '15px' }}>SLA Warnings ({stats.slaAlerts})</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>There are complaints close to breaching their SLA that need immediate attention.</p>
          </div>
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Pending</span>
            <div className="admin-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Clock size={20} /></div>
          </div>
          <div className="admin-stat-value">{stats?.stats?.pending || 0}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Work</span>
            <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><ListTodo size={20} /></div>
          </div>
          <div className="admin-stat-value">{(stats?.stats?.assigned || 0) + (stats?.stats?.in_progress || 0)}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Completed Work</span>
            <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><CheckCircle size={20} /></div>
          </div>
          <div className="admin-stat-value">{stats?.stats?.completed || 0}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Escalated</span>
            <div className="admin-stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><BarChart3 size={20} /></div>
          </div>
          <div className="admin-stat-value">{stats?.stats?.escalated || 0}</div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
         <GlobalMap />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Quick Actions</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Link to="/admin/complaints?status=pending" style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'var(--transition)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ListTodo size={24} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Assign New Complaints</span>
        </Link>
        
        <Link to="/admin/complaints?status=completed" style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'var(--transition)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Review Completed Work</span>
        </Link>
      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;
