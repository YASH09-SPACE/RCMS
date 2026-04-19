import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, AlertTriangle, FileText, Plus } from 'lucide-react';
import CitizenLayout from '../../components/CitizenLayout';
import { citizenService } from '../../services/citizenService';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await citizenService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CitizenLayout>
        <div className="loading-spinner" style={{ padding: '100px' }}></div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Your Civic Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of your reported infrastructure petitions across Gujarat.</p>
          </div>
          <Link to="/citizen/raise" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={18} /> Report Issue
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="admin-stat-card" style={{ background: 'var(--bg-card)' }}>
            <div className="admin-stat-header">
              <span className="admin-stat-title">Total Reports</span>
              <div className="admin-stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Activity size={20} /></div>
            </div>
            <div className="admin-stat-value">{stats.total}</div>
          </div>

          <div className="admin-stat-card" style={{ background: 'var(--bg-card)' }}>
            <div className="admin-stat-header">
              <span className="admin-stat-title">Currently Active</span>
              <div className="admin-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><AlertTriangle size={20} /></div>
            </div>
            <div className="admin-stat-value">{stats.active}</div>
          </div>

          <div className="admin-stat-card" style={{ background: 'var(--bg-card)' }}>
            <div className="admin-stat-header">
              <span className="admin-stat-title">Completed & Fixed</span>
              <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><ShieldCheck size={20} /></div>
            </div>
            <div className="admin-stat-value">{stats.completed + stats.closed}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={32} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Manage Your Reports</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>View the full details, track progress, or provide feedback on your submissions.</p>
          <Link to="/citizen/my-complaints" className="btn" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }}>
            View Full Log
          </Link>
        </div>
      </div>
    </CitizenLayout>
  );
};

export default CitizenDashboard;
