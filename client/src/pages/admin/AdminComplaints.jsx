import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import AdminLayout from '../../components/AdminLayout';
import CustomSelect from '../../components/CustomSelect';
import SLACountdown from '../../components/common/SLACountdown';

const AdminComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const initialStatus = searchParams.get('status') || '';
  const initialPriority = searchParams.get('priority') || '';

  const [filters, setFilters] = useState({
    status: initialStatus,
    priority: initialPriority
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters, currentPage]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await adminService.getComplaints({ ...filters, page: currentPage, limit: 10 });
      if (res.success) {
        setComplaints(res.data);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Ward Complaints</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and assign tasks within your jurisdiction</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <CustomSelect
          variant="pill"
          placeholder="All Statuses"
          value={filters.status}
          onChange={(val) => handleFilterChange('status', val)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed (Review Needed)' },
            { value: 'closed', label: 'Closed' },
            { value: 'escalated', label: 'Escalated' }
          ]}
        />
        <CustomSelect
          variant="pill"
          placeholder="All Priorities"
          value={filters.priority}
          onChange={(val) => handleFilterChange('priority', val)}
          options={[
            { value: '', label: 'All Priorities' },
            { value: 'high', label: 'High Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'low', label: 'Low Priority' }
          ]}
        />
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner" style={{ padding: '40px' }} />
        ) : complaints.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No complaints found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>SLA</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} className="admin-table-row" onClick={() => navigate(`/admin/complaints/${c._id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.complaintNumber}</td>
                  <td>{c.category?.name}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.title}
                    {c.isSlaBreached && <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: '4px', fontWeight: 'bold' }}>SLA BREACHED</span>}
                  </td>
                  <td><span className={`badge badge-status badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                  <td>
                     {c.priority ? <span className={`badge badge-${c.priority}`}>{c.priority}</span> : '-'}
                  </td>
                  <td>
                    {c.slaDueDate ? (
                      <SLACountdown 
                        slaDueDate={c.slaDueDate} 
                        isSlaBreached={c.isSlaBreached}
                        complaintStatus={c.status}
                        size="small"
                      />
                    ) : '-'}
                  </td>
                  <td>{c.assignedConstructor?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td>
                    <button className="c-btn c-btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      {c.status === 'pending' ? 'Assign' : c.status === 'completed' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
         <div className="pagination" style={{ marginTop: '24px', justifyContent: 'flex-end' }}>
           <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
           {Array.from({ length: totalPages }, (_, i) => (
             <button key={i+1} className={currentPage === i+1 ? 'active' : ''} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
           ))}
           <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
         </div>
      )}

    </AdminLayout>
  );
};

export default AdminComplaints;
