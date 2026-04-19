import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import SLACountdown from '../../components/common/SLACountdown';
import ImageGallery from '../../components/common/ImageGallery';
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

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5001${url}`;
};

const SuperAdminIssueDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getById(id);
      if (res.success) {
        setComplaint(res.data);
      }
    } catch (err) {
      toast.error('Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setProcessing(true);
    try {
      await superAdminService.resolveComplaint(id, adminComment);
      toast.success('Escalated Issue Resolved by Executive Authority');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resolution failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <SuperAdminLayout><div className="loading-spinner" style={{ minHeight: '60vh' }} /></SuperAdminLayout>;
  if (!complaint) return <SuperAdminLayout><div className="empty-state">Issue not found</div></SuperAdminLayout>;

  return (
    <SuperAdminLayout>
      <Link to="/superadmin/complaints" className="detail-back">
        <ArrowLeft size={16} /> Back to State Complaints
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Complaint Details */}
        <div className="detail-card" style={{ maxWidth: 'none', margin: 0 }}>
          {/* Image Gallery - Original Photos */}
          <ImageGallery images={complaint.images} title="Original Photos" />
          
          <div className="detail-body">
            <div className="detail-header">
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-status badge-${complaint.status}`}>{complaint.status?.replace('_', ' ')}</span>
                  <span className="badge badge-category">{complaint.category?.name}</span>
                  {complaint.priority && <span className={`badge badge-${complaint.priority}`}>{complaint.priority} priority</span>}
                  {/* SLA Countdown */}
                  {complaint.slaDueDate && (
                    <SLACountdown 
                      slaDueDate={complaint.slaDueDate} 
                      isSlaBreached={complaint.isSlaBreached}
                      size="medium"
                    />
                  )}
                </div>
                <h1 className="detail-title">{complaint.title}</h1>
              </div>
              <span className="detail-id">{complaint.complaintNumber}</span>
            </div>

            <p className="detail-desc">{complaint.description}</p>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-label">Reported By</div>
                <div className="detail-info-value"><User size={14} style={{ display: 'inline', marginRight: '4px' }}/> {complaint.user?.name}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Location (District / Ward)</div>
                <div className="detail-info-value"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }}/> {complaint.ward ? `${complaint.ward.district?.name} / ${complaint.ward.wardName}` : ''}</div>
              </div>
              <div className="detail-info-item" style={{ gridColumn: '1 / -1' }}>
                 <div className="detail-info-label">Full Address</div>
                 <div className="detail-info-value">{complaint.address}</div>
              </div>
            </div>
            
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
                      {sh.images && sh.images.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                           {sh.images.map((img, idx) => (
                             <img key={idx} src={getImageUrl(img)} alt="Proof" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completion Photos Section */}
            {complaint.statusHistory && complaint.statusHistory.some(sh => sh.status === 'completed' && sh.images && sh.images.length > 0) && (
              <div style={{ marginTop: '30px' }}>
                {complaint.statusHistory
                  .filter(sh => sh.status === 'completed' && sh.images && sh.images.length > 0)
                  .map((sh, idx) => (
                    <div key={idx}>
                      <ImageGallery images={sh.images} title="Completion Photos" />
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Super Admin Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Current Assignment Info */}
          {complaint.assignedConstructor && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
               <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>Assigned Field Worker</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div className="nav-avatar">{complaint.assignedConstructor.name?.charAt(0)}</div>
                 <div>
                   <div style={{ fontWeight: 600, fontSize: '15px' }}>{complaint.assignedConstructor.name}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Constructor ID: {complaint.assignedConstructor._id.slice(-6)}</div>
                 </div>
               </div>
            </div>
          )}

          {/* Escalate Resolution Box */}
          {complaint.status === 'escalated' && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
                <AlertTriangle size={18} /> Executive Override Required
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '20px' }}>
                This issue was escalated by the Ward level admin. Review the complaint and force a resolution closure once handled offline.
              </p>
              
              <div className="c-form-group">
                <label className="c-form-label" style={{ color: 'var(--text-primary)' }}>Executive Closure Note (Optional)</label>
                <textarea 
                  className="c-form-textarea" 
                  value={adminComment} 
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Enter final remarks for record..."
                  rows="3"
                />
              </div>

              <button onClick={handleResolve} className="c-btn c-btn-primary" disabled={processing} style={{ width: '100%', background: 'var(--error)' }}>
                Force Resolve & Close
              </button>
            </div>
          )}
          
          {complaint.status !== 'escalated' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="var(--primary)" /> Executive Read-Only
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                As Super Admin, you have oversight of this issue. Unless the issue is escalated by the Ward Admin, there are no executive actions required.
              </p>
            </div>
          )}

        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminIssueDetail;
