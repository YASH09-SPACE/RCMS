import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Clock, Filter } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import CitizenLayout from '../../components/CitizenLayout';
import CustomSelect from '../../components/CustomSelect';
import IssueCard from '../../components/common/IssueCard';



const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, currentPage]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await complaintService.getMine(params);
      if (res.success) {
        setComplaints(res.data);
        setStats(res.stats);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { key: 'total', label: 'Total', color: 'var(--primary)' },
    { key: 'pending', label: 'Pending', color: 'var(--warning)' },
    { key: 'in_progress', label: 'In Progress', color: 'var(--primary)' },
    { key: 'completed', label: 'Completed', color: 'var(--success)' },
  ];

  return (
    <CitizenLayout>
      <div className="citizen-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>My Complaints</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Track and manage your reported issues</p>
          </div>
          <Link to="/citizen/raise" className="c-btn c-btn-primary" style={{ flex: 'none', padding: '0 20px' }}>
            <Plus size={16} /> Report New Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="my-stats">
          {statCards.map(s => (
            <div className="stat-card" key={s.key} onClick={() => { setStatusFilter(s.key === 'total' ? '' : s.key); setCurrentPage(1); }}
              style={{ cursor: 'pointer', borderColor: statusFilter === s.key || (s.key === 'total' && !statusFilter) ? s.color : undefined }}>
              <div className="stat-number" style={{ color: s.color }}>{stats[s.key] || 0}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '16px' }}>
          <CustomSelect
            variant="pill"
            placeholder="All Status"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'closed', label: 'Closed' },
              { value: 'reopened', label: 'Reopened' },
            ]}
          />
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="loading-spinner" />
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No complaints yet</h3>
            <p>You haven't raised any complaints. Report an issue to get started!</p>
            <Link to="/citizen/raise" className="c-btn c-btn-primary" style={{ display: 'inline-flex', marginTop: '16px', padding: '0 24px' }}>
              <Plus size={16} /> Report Issue
            </Link>
          </div>
        ) : (
          <div className="issues-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {complaints.map(c => <IssueCard key={c._id} c={c} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i+1} className={currentPage === i+1 ? 'active' : ''} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
            ))}
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
};

export default MyComplaints;
