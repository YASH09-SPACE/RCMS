import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const SlaBreaches = () => {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlaBreaches();
  }, []);

  const fetchSlaBreaches = async () => {
    try {
      const res = await superAdminService.getSlaBreaches();
      if (res.success) {
        setBreaches(res.data);
      }
    } catch (err) {
      toast.error('Failed to load SLA breaches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle color="var(--error)" /> SLA Breach Monitor
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>List of all petitions that have passed their mandated Service Level Agreement resolution deadline.</p>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ padding: '100px' }} />
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: 'var(--error-bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--error)' }}>Task ID</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--error)' }}>Issue</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--error)' }}>District</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--error)' }}>Missed Deadline</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--error)' }}>Assigned Admin</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--error)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {breaches.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: '50%' }}>
                          <Clock size={32} />
                        </div>
                        Excellent! No active SLA breaches.
                      </div>
                    </td>
                  </tr>
                ) : breaches.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{b.complaintNumber}</td>
                    <td style={{ padding: '16px' }} title={b.title}>
                      {b.title.length > 30 ? b.title.slice(0, 30) + '...' : b.title}
                    </td>
                    <td style={{ padding: '16px' }}>{b.district?.name || 'N/A'}</td>
                    <td style={{ padding: '16px', color: 'var(--error)', fontWeight: 500 }}>
                      {new Date(b.slaDueDate).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>{b.assignedAdmin?.name || 'Unassigned'}</td>
                    <td style={{ padding: '16px' }}>
                      <Link to={`/superadmin/complaints?search=${b.complaintNumber}`} className="btn" style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--error)', color: 'white' }}>
                        Intervene
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default SlaBreaches;
