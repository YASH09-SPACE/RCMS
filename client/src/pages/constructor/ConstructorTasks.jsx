import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { constructorService } from '../../services/constructorService';
import ConstructorLayout from '../../components/ConstructorLayout';
import CustomSelect from '../../components/CustomSelect';
import SLACountdown from '../../components/common/SLACountdown';

const ConstructorTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const initialStatus = searchParams.get('status') || 'active';

  const [filters, setFilters] = useState({
    status: initialStatus
  });

  useEffect(() => {
    fetchTasks();
  }, [filters, currentPage]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await constructorService.getTasks({ ...filters, page: currentPage, limit: 10 });
      if (res.success) {
        setTasks(res.data);
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
    <ConstructorLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>My Work Queue</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tasks assigned to you by the Ward Admin</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <CustomSelect
          variant="pill"
          placeholder="Queue Filter"
          value={filters.status}
          onChange={(val) => handleFilterChange('status', val)}
          options={[
            { value: 'active', label: 'Active Tasks (Need Action)' },
            { value: 'completed', label: 'Completed (Pending Admin)' },
            { value: 'closed', label: 'Closed (Verified)' },
            { value: '', label: 'All My Tasks' }
          ]}
        />
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner" style={{ padding: '40px' }} />
        ) : tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No tasks found</h3>
            <p>You have no tasks matching this filter.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Location</th>
                <th>Priority</th>
                <th>SLA</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id} className="admin-table-row" onClick={() => navigate(`/constructor/tasks/${t._id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.complaintNumber}</td>
                  <td>{t.category?.name}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.address}</td>
                  <td>
                     {t.priority ? <span className={`badge badge-${t.priority}`}>{t.priority}</span> : '-'}
                  </td>
                  <td>
                    {t.slaDueDate ? (
                      <SLACountdown 
                        slaDueDate={t.slaDueDate} 
                        isSlaBreached={t.isSlaBreached}
                        size="small"
                      />
                    ) : '-'}
                  </td>
                  <td><span className={`badge badge-status badge-${t.status}`}>{t.status.replace('_', ' ')}</span></td>
                  <td>
                    <button className="c-btn c-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      {t.status === 'assigned' ? 'Start Work' : t.status === 'in_progress' ? 'Upload Proof' : 'View'}
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

    </ConstructorLayout>
  );
};

export default ConstructorTasks;
