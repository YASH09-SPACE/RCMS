import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import CustomSelect from '../../components/CustomSelect';
import SLACountdown from '../../components/common/SLACountdown';

const SuperAdminComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const initialStatus = searchParams.get('status') || '';

  const [filters, setFilters] = useState({
    status: initialStatus
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters, currentPage]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getAllComplaints({ ...filters, page: currentPage, limit: 10 });
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
    <SuperAdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>State-wide Complaints</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View all maintenance requests across Gujarat.</p>
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
            { value: 'completed', label: 'Completed (Awaiting Admin)' },
            { value: 'closed', label: 'Closed' },
            { value: 'escalated', label: 'Escalated to You' }
          ]}
        />
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner" style={{ padding: '40px' }} />
        ) : complaints.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No complaints found directly match this filter</h3>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Title</th>
                <th>Status</th>
                <th>SLA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} className="admin-table-row" onClick={() => navigate(`/superadmin/complaints/${c._id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.complaintNumber}</td>
                  <td>{c.category?.name}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</td>
                  <td><span className={`badge badge-status badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                  <td>
                    {c.slaDueDate ? (
                      <SLACountdown 
                        slaDueDate={c.slaDueDate} 
                        isSlaBreached={c.isSlaBreached}
                        size="small"
                      />
                    ) : '-'}
                  </td>
                  <td>
                    <button className="c-btn c-btn-outline" style={{ padding: '6px 12px', fontSize: '12px', ...(c.status==='escalated' ? {borderColor: 'var(--error)', color: 'var(--error)'} : {}) }}>
                      {c.status === 'escalated' ? 'Resolve' : 'View'}
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

    </SuperAdminLayout>
  );
};

export default SuperAdminComplaints;
