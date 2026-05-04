import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { adminService } from '../../services/adminService';
import AdminLayout from '../../components/AdminLayout';
import CustomSelect from '../../components/CustomSelect';
import ImageGallery from '../../components/common/ImageGallery';
import SLACountdown from '../../components/common/SLACountdown';
import { ArrowLeft, MapPin, Clock, User, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTimestamp = (date) => {
  // Format as "DD MMM YYYY, HH:MM AM/PM" in IST
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5001${url}`;
};

const AdminIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completionHistory, setCompletionHistory] = useState([]);
  
  // Assignment State
  const [constructors, setConstructors] = useState([]);
  const [selectedConstructor, setSelectedConstructor] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [assigning, setAssigning] = useState(false);

  // Approval/Escalate State
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
    adminService.getConstructors().then(res => setConstructors(res.data)).catch(console.error);
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getById(id);
      if (res.success) {
        setComplaint(res.data);
        if (res.data.assignedConstructor) setSelectedConstructor(res.data.assignedConstructor._id);
        if (res.data.priority) setSelectedPriority(res.data.priority);
        
        // Load completion history
        loadCompletionHistory(res.data);
      }
    } catch (err) {
      toast.error('Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletionHistory = (complaintData) => {
    // Filter statusHistory for completed status with images
    if (complaintData.statusHistory && complaintData.statusHistory.length > 0) {
      const completionRecords = complaintData.statusHistory.filter(
        record => record.status === 'completed' && record.images && record.images.length > 0
      );
      setCompletionHistory(completionRecords);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedConstructor || !selectedPriority) return toast.error('Select constructor & priority');
    setAssigning(true);
    try {
      await adminService.assignComplaint(id, selectedConstructor, selectedPriority);
      toast.success('Complaint Assigned Successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await adminService.approveComplaint(id, adminComment);
      toast.success('Work Approved & Closed');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleEscalate = async () => {
    if (!adminComment) return toast.error('Please provide a reason for escalation');
    setProcessing(true);
    try {
      await adminService.escalateComplaint(id, adminComment);
      toast.success('Complaint Escalated to Super Admin');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Escalation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <AdminLayout><div className="loading-spinner" style={{ minHeight: '60vh' }} /></AdminLayout>;
  if (!complaint) return <AdminLayout><div className="empty-state">Issue not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/admin/complaints" className="detail-back">
        <ArrowLeft size={16} /> Back to Ward Complaints
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Complaint Details */}
        <div className="detail-card" style={{ maxWidth: 'none', margin: 0 }}>
          {/* SLA Countdown */}
          {complaint.slaDueDate && (
            <div style={{ marginBottom: '20px' }}>
              <SLACountdown 
                slaDueDate={complaint.slaDueDate} 
                isSlaBreached={complaint.isSlaBreached}
                complaintStatus={complaint.status}
                size="medium"
              />
            </div>
          )}
          
          {/* Original Photos */}
          {complaint.images && complaint.images.length > 0 && (
            <ImageGallery images={complaint.images} title="Original Photos (Reported Issue)" />
          )}
          
          {/* Completion Photos Section */}
          {completionHistory.length > 0 ? (
            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              background: 'var(--success-bg)', 
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                marginBottom: '16px',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} /> Completion Photos
              </h3>
              
              {completionHistory.map((record, index) => {
                const isLateUpload = complaint.assignedAt && 
                  (new Date(record.createdAt) - new Date(complaint.assignedAt)) > (24 * 60 * 60 * 1000);
                
                return (
                  <div key={index} style={{ marginBottom: index < completionHistory.length - 1 ? '24px' : 0 }}>
                    {/* Constructor Info */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div className="nav-avatar" style={{ width: '36px', height: '36px' }}>
                        {record.updatedBy?.name?.charAt(0) || 'C'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {record.updatedBy?.name || 'Constructor'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>{formatTimestamp(record.createdAt)}</span>
                          <span>•</span>
                          <span>{timeAgo(record.createdAt)}</span>
                          {isLateUpload && (
                            <>
                              <span>•</span>
                              <span style={{ 
                                color: 'var(--warning)', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <AlertTriangle size={12} /> Late Upload
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Constructor Comments */}
                    {record.comments && (
                      <div style={{ 
                        marginBottom: '12px',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                      }}>
                        "{record.comments}"
                      </div>
                    )}
                    
                    {/* Completion Photos Gallery */}
                    <ImageGallery 
                      images={record.images} 
                      title={`Completion Photos ${completionHistory.length > 1 ? `(Upload ${index + 1})` : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              background: 'var(--bg-input)', 
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              No completion photos uploaded yet
            </div>
          )}
          
          <div className="detail-body">
            <div className="detail-header">
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-status badge-${complaint.status}`}>{complaint.status?.replace('_', ' ')}</span>
                  <span className="badge badge-category">{complaint.category?.name}</span>
                  {complaint.priority && <span className={`badge badge-${complaint.priority}`}>{complaint.priority} priority</span>}
                </div>
                <h1 className="detail-title">{complaint.title}</h1>
              </div>
              <span className="detail-id">{complaint.complaintNumber}</span>
            </div>

            <p className="detail-desc">{complaint.description}</p>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-label">Reported By</div>
                <div className="detail-info-value"><User size={14} style={{ display: 'inline', marginRight: '4px' }}/> {complaint.user?.name} ({complaint.user?.mobile})</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Location</div>
                <div className="detail-info-value"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }}/> {complaint.address}</div>
              </div>
            </div>
            
            {/* Timeline embedded inside detail card for admin view */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <div className="timeline" style={{ marginTop: '30px' }}>
                <h3 className="timeline-title">Audit Trail</h3>
                {complaint.statusHistory.map((sh, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-dot" style={{ background: 'var(--primary)', color: '#fff' }}>
                      <CheckCircle size={14} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-status">{sh.status?.replace('_', ' ')}</div>
                      <div className="timeline-meta">{sh.updatedBy?.name} · {timeAgo(sh.createdAt)}{sh.comments && ` · ${sh.comments}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Admin Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Assignment Box */}
          {['pending', 'reopened'].includes(complaint.status) && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--primary)" /> Assign Task
              </h3>
              <form onSubmit={handleAssign}>
                <div className="c-form-group">
                  <label className="c-form-label">Priority</label>
                  <CustomSelect 
                    value={selectedPriority} 
                    onChange={setSelectedPriority}
                    options={[
                      { value: 'high', label: 'High Priority' },
                      { value: 'medium', label: 'Medium Priority' },
                      { value: 'low', label: 'Low Priority' }
                    ]}
                  />
                </div>
                <div className="c-form-group">
                  <label className="c-form-label">Assign Constructor</label>
                  <CustomSelect 
                    placeholder="Select Worker"
                    value={selectedConstructor} 
                    onChange={setSelectedConstructor}
                    options={constructors.map(c => ({ value: c._id, label: `${c.name} (${c.activeTasks} active tasks)` }))}
                  />
                </div>
                <button type="submit" className="c-btn c-btn-primary" style={{ width: '100%' }} disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </form>
            </div>
          )}

          {/* Current Assignment Info */}
          {(!['pending', 'reopened'].includes(complaint.status)) && complaint.assignedConstructor && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
               <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>Assigned To</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div className="nav-avatar">{complaint.assignedConstructor.name?.charAt(0)}</div>
                 <div>
                   <div style={{ fontWeight: 600, fontSize: '15px' }}>{complaint.assignedConstructor.name}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Constructor ID: {complaint.assignedConstructor._id.slice(-6)}</div>
                 </div>
               </div>
            </div>
          )}

          {/* Review / Escalate Box — Premium Redesign */}
          {complaint.status === 'completed' && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '2px solid var(--success)',
              padding: '0', 
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              {/* Header with pulse indicator */}
              <div style={{
                background: 'var(--success-bg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)',
                  animation: 'pulse 2s infinite'
                }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>
                    Review Required
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Constructor has submitted completion proof
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="c-form-group" style={{ marginBottom: '16px' }}>
                  <label className="c-form-label">Admin Remarks (Optional)</label>
                  <textarea 
                    className="c-form-textarea" 
                    value={adminComment} 
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Add verification notes..."
                    rows="2"
                    style={{ minHeight: '60px' }}
                  />
                </div>

                {/* Verify & Close — Green CTA */}
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to verify and close this complaint? The citizen will be notified.')) {
                      handleApprove();
                    }
                  }} 
                  className="c-btn" 
                  disabled={processing} 
                  style={{ 
                    width: '100%', 
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    height: '48px',
                    fontSize: '15px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle size={18} /> {processing ? 'Processing...' : 'Verify & Close Issue'}
                </button>

                {/* Divider */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  margin: '16px 0',
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* Escalate — Warning Style */}
                <button 
                  onClick={handleEscalate} 
                  className="c-btn" 
                  disabled={processing} 
                  style={{ 
                    width: '100%', 
                    background: 'transparent',
                    color: 'var(--error)',
                    border: '1.5px solid var(--error)',
                    height: '42px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    gap: '6px',
                    opacity: 0.85
                  }}
                >
                  <AlertTriangle size={14} /> Escalate to Super Admin
                </button>
              </div>
            </div>
          )}

          {/* Actions for non-completed (assigned/in_progress) */}
          {['assigned', 'in_progress'].includes(complaint.status) && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="var(--warning)" /> Administration Actions
              </h3>
              
              <div className="c-form-group">
                <label className="c-form-label">Admin Comment (Required for Escalation)</label>
                <textarea 
                  className="c-form-textarea" 
                  value={adminComment} 
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Enter remarks..."
                  rows="3"
                />
              </div>

              <button onClick={handleEscalate} className="c-btn c-btn-outline" disabled={processing} style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}>
                <AlertTriangle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Escalate to Super Admin
              </button>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIssueDetail;
