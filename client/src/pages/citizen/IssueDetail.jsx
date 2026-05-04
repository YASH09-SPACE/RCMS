import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Star, Send, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import CitizenLayout from '../../components/CitizenLayout';
import SLACountdown from '../../components/common/SLACountdown';
import ImageGallery from '../../components/common/ImageGallery';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'var(--warning)',
  assigned: 'var(--info)',
  in_progress: 'var(--primary)',
  completed: 'var(--success)',
  closed: 'var(--success)',
  reopened: 'var(--error)',
  escalated: 'var(--error)',
};

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

const IssueDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, commRes] = await Promise.all([
        complaintService.getById(id),
        complaintService.getComments(id)
      ]);
      if (compRes.success) setComplaint(compRes.data);
      if (commRes.success) setComments(commRes.data);
    } catch (err) {
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await complaintService.addComment(id, commentText.trim());
      if (res.success) {
        setComments(prev => [res.data, ...prev]);
        setCommentText('');
        toast.success('Comment posted!');
      }
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedback = async () => {
    if (feedbackRating === 0) { toast.error('Please select a rating'); return; }
    setSubmittingFeedback(true);
    try {
      await complaintService.submitFeedback(id, { rating: feedbackRating, comments: feedbackText });
      toast.success('Feedback submitted!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReopen = async () => {
    if (!confirm('Are you sure you want to reopen this complaint?')) return;
    try {
      await complaintService.reopen(id, 'Issue not resolved satisfactorily');
      toast.success('Complaint reopened');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen');
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const isOwner = isAuthenticated && user && complaint?.user && (
    complaint.user._id === user._id || 
    complaint.user === user._id || 
    String(complaint.user._id) === String(user._id)
  );

  if (loading) return <CitizenLayout><div className="loading-spinner" style={{ minHeight: '60vh' }} /></CitizenLayout>;
  if (!complaint) return (
    <CitizenLayout>
      <div className="detail-page">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Issue not found</h3>
          <p>This complaint may have been removed or doesn't exist.</p>
          <Link to="/" className="c-btn c-btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>Back to Home</Link>
        </div>
      </div>
    </CitizenLayout>
  );

  return (
    <CitizenLayout>
      <div className="detail-page">
        {/* Back link */}
        <Link to="/" className="detail-back">
          <ArrowLeft size={16} /> Back to Issues
        </Link>

        {/* Main Card */}
        <div className="detail-card">
          {/* Original Photos (Before) */}
          <ImageGallery images={complaint.images} title="📸 Original Photos (Before)" />

          {/* Resolution Photos (After) — Only visible when issue is resolved */}
          {['completed', 'closed'].includes(complaint.status) && complaint.statusHistory && (() => {
            const completionRecords = complaint.statusHistory.filter(
              sh => sh.status === 'completed' && sh.images && sh.images.length > 0
            );
            if (completionRecords.length === 0) return null;
            return (
              <div style={{ 
                margin: '0', 
                padding: '20px 24px', 
                background: 'var(--success-bg)', 
                borderTop: '2px solid var(--success)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '16px' 
                }}>
                  <CheckCircle size={18} color="var(--success)" />
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: 'var(--success)', 
                    margin: 0 
                  }}>
                    Resolution Photos (After Fix)
                  </h3>
                </div>
                
                {completionRecords.map((record, idx) => (
                  <div key={idx} style={{ marginBottom: idx < completionRecords.length - 1 ? '20px' : 0 }}>
                    {/* Worker Info */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      marginBottom: '10px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--success)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {record.updatedBy?.name?.charAt(0) || 'W'}
                      </div>
                      <span>
                        Fixed by <strong style={{ color: 'var(--text-primary)' }}>{record.updatedBy?.name || 'Worker'}</strong>
                        {' · '}
                        {new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Worker's Note */}
                    {record.comments && (
                      <div style={{
                        padding: '10px 14px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        marginBottom: '12px',
                        borderLeft: '3px solid var(--success)'
                      }}>
                        "{record.comments}"
                      </div>
                    )}

                    {/* After Photos Gallery */}
                    <ImageGallery 
                      images={record.images} 
                      title={`After Photos ${completionRecords.length > 1 ? `(Fix ${idx + 1})` : ''}`} 
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="detail-body">
            {/* Header */}
            <div className="detail-header">
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-status badge-${complaint.status}`}>
                    {complaint.status?.replace('_', ' ')}
                  </span>
                  {complaint.priority && (
                    <span className={`badge badge-${complaint.priority}`}>
                      {complaint.priority} priority
                    </span>
                  )}
                  {complaint.isSlaBreached && (
                    <span style={{ padding: '2px 8px', fontSize: '11px', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: '12px', fontWeight: 'bold' }}>
                      SLA DEADLINE BREACHED
                    </span>
                  )}
                  <span className="badge badge-category">
                    {complaint.category?.name}
                  </span>
                </div>
                <h1 className="detail-title">{complaint.title}</h1>
              </div>
              <span className="detail-id">{complaint.complaintNumber}</span>
            </div>

            {/* SLA Countdown */}
            {complaint.slaDueDate && (
              <div style={{ marginBottom: '16px' }}>
                <SLACountdown 
                  slaDueDate={complaint.slaDueDate} 
                  isSlaBreached={complaint.isSlaBreached}
                  complaintStatus={complaint.status}
                  size="medium"
                />
              </div>
            )}

            {/* Description */}
            <p className="detail-desc">{complaint.description}</p>

            {/* Info Grid */}
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-label">Location</div>
                <div className="detail-info-value">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {complaint.address || `${complaint.ward?.wardName || ''}, ${complaint.district?.name || 'Gujarat'}`}
                </div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Reported By</div>
                <div className="detail-info-value">
                  <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {complaint.user?.name || 'Citizen'}
                </div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Reported On</div>
                <div className="detail-info-value">
                  <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">District</div>
                <div className="detail-info-value">{complaint.district?.name}</div>
              </div>
            </div>

            {/* Status Timeline */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <div className="timeline">
                <h3 className="timeline-title">Status Timeline</h3>
                {complaint.statusHistory.map((sh, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-dot" style={{ background: statusColors[sh.status] || 'var(--text-muted)', color: '#fff' }}>
                      <CheckCircle size={14} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-status">{sh.status?.replace('_', ' ')}</div>
                      <div className="timeline-meta">
                        {sh.updatedBy?.name && `by ${sh.updatedBy.name} · `}
                        {timeAgo(sh.createdAt)}
                        {sh.comments && ` · ${sh.comments}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback Section (only for owner when completed) */}
            {isOwner && ['completed', 'closed'].includes(complaint.status?.toLowerCase()) && !complaint.feedback && (
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Rate the Resolution</h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setFeedbackRating(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', opacity: feedbackRating >= s ? 1 : 0.3 }}>
                      ⭐
                    </button>
                  ))}
                </div>
                <textarea
                  className="c-form-textarea"
                  placeholder="Share your experience (optional)"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{ marginBottom: '12px', minHeight: '60px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="c-btn c-btn-primary" onClick={handleFeedback} disabled={submittingFeedback}
                    style={{ flex: 'none', padding: '0 20px' }}>Submit Feedback</button>
                  <button className="c-btn c-btn-outline" onClick={handleReopen}
                    style={{ flex: 'none', padding: '0 20px', color: 'var(--error)' }}>
                    <RotateCcw size={14} /> Reopen
                  </button>
                </div>
              </div>
            )}

            {/* Existing feedback */}
            {complaint.feedback && (
              <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>Citizen Feedback</span>
                  <span>{'⭐'.repeat(complaint.feedback.rating)}</span>
                </div>
                {complaint.feedback.comments && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{complaint.feedback.comments}</p>}
              </div>
            )}
          </div>
        </div>

        {/* ===== COMMUNITY COMMENTS ===== */}
        <div className="comments-section">
          <div className="comments-header">
            <h3>Community</h3>
            <span className="comments-count">{comments.length}</span>
          </div>

          {/* Comment form or login prompt */}
          {isAuthenticated ? (
            <form className="comment-form" onSubmit={handleComment}>
              <textarea
                placeholder="Add your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
              />
              <button type="submit" disabled={submittingComment || !commentText.trim()}>
                <Send size={14} /> Post
              </button>
            </form>
          ) : (
            <div className="comment-login-msg">
              <Link to="/login">Log in</Link> or <Link to="/register">Sign up</Link> to join the discussion
            </div>
          )}

          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(c => (
              <div className="comment-item" key={c._id}>
                <div className="comment-avatar">{getInitials(c.user?.name)}</div>
                <div className="comment-body">
                  <span className="comment-author">{c.user?.name}</span>
                  <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CitizenLayout>
  );
};

export default IssueDetail;
