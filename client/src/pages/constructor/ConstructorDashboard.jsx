import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { constructorService } from '../../services/constructorService';
import ConstructorLayout from '../../components/ConstructorLayout';
import GlobalMap from '../../components/common/GlobalMap';
import { HardHat, CheckCircle, Clock, CheckSquare, AlertTriangle, ListTodo, Hammer } from 'lucide-react';
import toast from 'react-hot-toast';

const ConstructorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    constructorService.getStats()
      .then(res => setStats(res))
      .catch(err => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ConstructorLayout><div className="loading-spinner" style={{ padding: '60px' }} /></ConstructorLayout>;

  // Fallback to 0 if stats aren't loaded correctly
  const pendingStarts = stats?.stats?.assigned || 0;
  const activeWork = stats?.stats?.in_progress || 0;
  const completedWork = stats?.stats?.completed || 0;
  const totalAssigned = pendingStarts + activeWork;

  return (
    <ConstructorLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Worker Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your assigned tasks and update work progress.</p>
      </div>

      {totalAssigned > 5 && (
         <div style={{ background: 'var(--warning-bg)', borderLeft: '4px solid var(--warning)', padding: '16px', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
           <AlertTriangle color="var(--warning)" />
           <div>
             <h4 style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '15px' }}>High Workload Warning</h4>
             <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>You currently have {totalAssigned} active tasks. Focus on completing in-progress items.</p>
           </div>
         </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tasks to Start</span>
            <div className="admin-stat-icon" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}><Clock size={20} /></div>
          </div>
          <div className="admin-stat-value">{pendingStarts}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Field Work</span>
            <div className="admin-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Hammer size={20} /></div>
          </div>
          <div className="admin-stat-value">{activeWork}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Pending Verification</span>
            <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><CheckCircle size={20} /></div>
          </div>
          <div className="admin-stat-value">{completedWork}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Quick Actions</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <Link to="/constructor/tasks?status=active" style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'var(--transition)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ListTodo size={28} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>View My Work Queue</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>See all tasks assigned to you, start new jobs, and upload completion proofs.</p>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: '32px' }}>
        <GlobalMap />
      </div>

    </ConstructorLayout>
  );
};

export default ConstructorDashboard;
