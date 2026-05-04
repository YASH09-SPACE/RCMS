import React, { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { ShieldAlert, TrendingUp, AlertTriangle, Activity, User, Search, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/admin.css';

const PerformanceMatrix = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
    fetchAlerts();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterRole, filterLevel, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getPerformanceScores({ 
        role: filterRole, 
        level: filterLevel,
        limit: 1000 // Request all users
      });
      if (res.success) {
        setData(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      toast.error('Failed to load performance scores');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await superAdminService.getPerformanceAlerts();
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDetail = async (userId) => {
    setSelectedUser(userId);
    setShowModal(true);
    setDetailLoading(true);
    try {
      const res = await superAdminService.getPerformanceDetail(userId);
      if (res.success) {
        setUserDetail(res.data);
      }
    } catch (err) {
      toast.error('Failed to load user detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleIntervention = async (action) => {
    if (!selectedUser) return;
    const message = window.prompt(`Enter message for ${action} intervention:`);
    if (message === null) return;

    setActionLoading(true);
    try {
      const res = await superAdminService.interveneUser(selectedUser, { action, message });
      if (res.success) {
        toast.success(res.message);
        fetchData();
        fetchAlerts();
        openDetail(selectedUser); // Refresh detail
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply intervention');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (!selectedUser) return;
    const reason = window.prompt('Enter reason for score reset:');
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await superAdminService.resetScore(selectedUser, { reason });
      if (res.success) {
        toast.success(res.message);
        fetchData();
        fetchAlerts();
        openDetail(selectedUser);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset score');
    } finally {
      setActionLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'excellent': return 'var(--success)';
      case 'good': return 'var(--info)';
      case 'warning': return 'var(--warning)';
      case 'critical': return 'var(--error)';
      case 'suspended': return '#607d8b'; // BlueGrey
      default: return 'var(--text-muted)';
    }
  };

  // Filter and search data
  const filteredData = data.filter(row => {
    const matchesSearch = searchQuery === '' || 
      row.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.user.district?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.user.ward?.wardName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Performance Matrix</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and manage Admin and Constructor performance scores.</p>
        </div>
        <button 
          className="c-btn c-btn-primary" 
          onClick={() => { fetchData(); fetchAlerts(); }} 
          disabled={loading}
          style={{ 
            padding: '6px 12px !important', 
            fontSize: '13px !important',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            minWidth: 'auto',
            whiteSpace: 'nowrap',
            width: 'auto',
            maxWidth: '120px'
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.length > 0 && (
        <div style={{ background: 'var(--error-bg)', borderLeft: '4px solid var(--error)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertTriangle color="var(--error)" style={{ marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--error)', fontWeight: 600, margin: '0 0 8px 0' }}>Intervention Required ({alerts.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.slice(0, 3).map(a => (
                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--error)' }}>{a.user.name}</span> ({a.role}) - Score: {a.currentScore} 
                    {a.isProbation && <span style={{ marginLeft: '8px', background: 'var(--error)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', animation: 'pulse 2s infinite' }}>{Math.ceil(a.probationHoursRemaining)}h left</span>}
                  </div>
                  <button onClick={() => openDetail(a.user._id)} style={{ background: 'var(--error)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Review</button>
                </div>
              ))}
              {alerts.length > 3 && <div style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>+ {alerts.length - 3} more critical users</div>}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Average Score</span>
              <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><Activity size={20} /></div>
            </div>
            <div className="admin-stat-value">{summary.averageScore} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span></div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Top Performers</span>
              <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><TrendingUp size={20} /></div>
            </div>
            <div className="admin-stat-value">{summary.excellent} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>users</span></div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">At Risk</span>
              <div className="admin-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><AlertTriangle size={20} /></div>
            </div>
            <div className="admin-stat-value">{summary.warning} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>users</span></div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Probations / Suspended</span>
              <div className="admin-stat-icon" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}><ShieldAlert size={20} /></div>
            </div>
            <div className="admin-stat-value">{summary.onProbation} / {summary.suspended}</div>
          </div>
        </div>
      )}

      {/* Filters & Table */}
      <div className="admin-table-container">
        <div className="admin-table-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Staff Performance</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {filteredData.length} {filteredData.length === 1 ? 'user' : 'users'} 
              {(searchQuery || filterRole || filterLevel) && ` (filtered from ${data.length} total)`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Role Filter */}
            <div className="custom-select-wrapper">
              <select className="custom-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="constructor">Constructors</option>
              </select>
            </div>
            
            {/* Level Filter */}
            <div className="custom-select-wrapper">
              <select className="custom-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="">All Levels</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner" style={{ padding: '60px' }} />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Score</th>
                    <th>Level</th>
                    <th>Metrics</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                      {searchQuery || filterRole || filterLevel ? 'No users match your filters' : 'No performance records found'}
                    </td></tr>
                  ) : paginatedData.map(row => (
                    <tr key={row._id} className="admin-table-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color="var(--text-muted)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{row.user.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.user.isActive ? 'Active' : 'Suspended'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{row.role}</td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{row.user.district?.name || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.user.ward?.wardName || 'N/A'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontWeight: 700, fontSize: '16px', color: getLevelColor(row.level) }}>{row.currentScore}</div>
                          {row.isProbation && <AlertTriangle size={14} color="var(--error)" className="pulse-anim" />}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                          background: `${getLevelColor(row.level)}22`, color: getLevelColor(row.level)
                        }}>
                          {row.level}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <div>Tasks: {row.tasksCompletedOnTime} / {row.totalTasksAssigned}</div>
                          <div>SLA Breaches: <span style={{ color: row.tasksBreachedSla > 0 ? 'var(--error)' : 'inherit' }}>{row.tasksBreachedSla}</span></div>
                        </div>
                      </td>
                      <td>
                        <button className="review-btn" onClick={(e) => { e.stopPropagation(); openDetail(row.user._id); }}>
                          Review Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredData.length > itemsPerPage && (
              <div style={{ 
                padding: '16px 24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-surface)'
              }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} users
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: currentPage === 1 ? 'var(--bg-muted)' : 'var(--bg-surface)',
                      color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              background: page === currentPage ? 'var(--primary)' : 'var(--bg-surface)',
                              color: page === currentPage ? 'white' : 'var(--text-primary)',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: page === currentPage ? 600 : 500,
                              minWidth: '36px'
                            }}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} style={{ padding: '6px 4px', color: 'var(--text-muted)' }}>...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: currentPage === totalPages ? 'var(--bg-muted)' : 'var(--bg-surface)',
                      color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowModal(false)} 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '900px', 
              width: '100%', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              background: 'var(--bg-card)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              display: 'flex', 
              flexDirection: 'column'
            }}
          >
            <div className="modal-header" style={{ 
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-surface)'
            }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Performance Detail</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              {detailLoading || !userDetail ? (
                <div className="loading-spinner" style={{ padding: '40px' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* User Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', border: `1px solid ${getLevelColor(userDetail.level)}44` }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${getLevelColor(userDetail.level)}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getLevelColor(userDetail.level), fontSize: '24px', fontWeight: 700 }}>
                        {userDetail.currentScore}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{userDetail.user.name}</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'capitalize', marginBottom: '4px' }}>{userDetail.role} • {userDetail.user.district?.name} / {userDetail.user.ward?.wardName}</div>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: `${getLevelColor(userDetail.level)}22`, color: getLevelColor(userDetail.level), textTransform: 'uppercase' }}>
                          {userDetail.level}
                        </span>
                        {userDetail.isProbation && (
                          <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: 'var(--error-bg)', color: 'var(--error)' }}>
                            PROBATION ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Intervention Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button className="c-btn" style={{ background: 'var(--info)', color: 'white', padding: '8px 16px', fontSize: '13px' }} onClick={() => handleReset()} disabled={actionLoading}>
                        🔄 Reset Score to 100
                      </button>
                      {(userDetail.level === 'warning' || userDetail.level === 'critical' || userDetail.isProbation) && (
                        <button className="c-btn" style={{ background: 'var(--warning)', color: 'white', padding: '8px 16px', fontSize: '13px' }} onClick={() => handleIntervention('warn')} disabled={actionLoading}>
                          ⚠️ Send Formal Warning
                        </button>
                      )}
                      {userDetail.user.isActive ? (
                        <button className="c-btn" style={{ background: 'var(--error)', color: 'white', padding: '8px 16px', fontSize: '13px' }} onClick={() => handleIntervention('suspend')} disabled={actionLoading}>
                          ⛔ Suspend Account
                        </button>
                      ) : (
                        <div style={{ color: 'var(--error)', fontWeight: 600, textAlign: 'center', padding: '8px' }}>Account Suspended</div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>SLA Compliance</div>
                      <div style={{ fontSize: '24px', fontWeight: 700 }}>{userDetail.tasksCompletedOnTime} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>/ {userDetail.totalTasksAssigned} tasks</span></div>
                      <div style={{ color: userDetail.tasksBreachedSla > 0 ? 'var(--error)' : 'var(--success)', fontSize: '13px', marginTop: '4px' }}>
                        {userDetail.tasksBreachedSla} SLA Breaches
                      </div>
                    </div>
                    
                    {userDetail.role === 'admin' ? (
                      <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Escalations</div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>{userDetail.complaintsEscalated}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Total Escalated</div>
                      </div>
                    ) : (
                      <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Citizen Rating</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{userDetail.averageFeedbackRating.toFixed(1)} ⭐</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>From {userDetail.totalFeedbacks} reviews</div>
                      </div>
                    )}
                    
                    {userDetail.role === 'constructor' && (
                      <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Reworks</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: userDetail.complaintsReopened > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{userDetail.complaintsReopened}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Reopened by citizens</div>
                      </div>
                    )}
                  </div>

                  {/* History Log */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Score History Audit Trail</h4>
                    {userDetail.scoreHistory?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No score history available.</p>
                    ) : (
                      <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Change</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Score</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...userDetail.scoreHistory].reverse().map((entry, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(entry.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                <td style={{ padding: '10px', fontWeight: 600, color: entry.change > 0 ? 'var(--success)' : entry.change < 0 ? 'var(--error)' : 'var(--info)' }}>
                                  {entry.change > 0 ? '+' : ''}{entry.change}
                                </td>
                                <td style={{ padding: '10px', fontWeight: 600 }}>{entry.newScore}</td>
                                <td style={{ padding: '10px' }}>{entry.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </SuperAdminLayout>
  );
};

export default PerformanceMatrix;
