import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Activity, Map, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await superAdminService.getAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load district analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>District Performance Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Evaluate the resolution speeds and SLA integrity of every district across Gujarat.</p>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ padding: '100px' }} />
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>District Name</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Petitions</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolved</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Breaches</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolution Rate</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</td></tr>
                ) : data.map(d => {
                  const rate = d.resolutionRate || 0;
                  let status = 'Good';
                  let statusColor = 'var(--success)';
                  
                  if (rate < 50 || d.breached > 10) {
                    status = 'Critical';
                    statusColor = 'var(--error)';
                  } else if (rate < 80 || d.breached > 0) {
                    status = 'Warning';
                    statusColor = 'var(--warning)';
                  }

                  return (
                    <tr key={d._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{d.name}</td>
                      <td style={{ padding: '16px' }}>{d.total}</td>
                      <td style={{ padding: '16px' }}>{d.resolved}</td>
                      <td style={{ padding: '16px', color: d.breached > 0 ? 'var(--error)' : 'inherit', fontWeight: d.breached > 0 ? 'bold' : 'normal' }}>
                        {d.breached}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '100px', height: '6px', background: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--primary)', width: `${rate}%` }} />
                          </div>
                          <span style={{ fontSize: '13px' }}>{rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: `${statusColor}22`, color: statusColor }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;
