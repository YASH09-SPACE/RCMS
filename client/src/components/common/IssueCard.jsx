import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import SLACountdown from './SLACountdown';

const categoryIcons = {
  'Pothole': '🕳️', 'Street Light': '💡', 'Drainage': '🚰',
  'Garbage Collection': '🗑️', 'Water Supply': '💧', 'Park Maintenance': '🌳',
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5001${url}`;
};

const IssueCard = ({ c }) => (
  <Link to={`/issue/${c._id}`} className="issue-card">
    {c.images?.length > 0 ? (
      <img src={getImageUrl(c.images[0])} alt={c.title} className="issue-card-img" />
    ) : (
      <div className="issue-card-img placeholder">
        <span style={{ fontSize: 40 }}>{categoryIcons[c.category?.name] || '📋'}</span>
      </div>
    )}
    <div className="issue-card-body">
      <div className="issue-card-tags">
        <span className="badge badge-category">{c.category?.name || 'General'}</span>
        <span className={`badge badge-status badge-${c.status}`}>{c.status?.replace('_', ' ')}</span>
        {c.priority && <span className={`badge badge-${c.priority}`}>{c.priority}</span>}
      </div>
      <div className="issue-card-title">{c.title}</div>
      {c.complaintNumber && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
          {c.complaintNumber}
        </div>
      )}
      {c.slaDueDate && (
        <div style={{ marginBottom: 8 }}>
          <SLACountdown slaDueDate={c.slaDueDate} isSlaBreached={c.isSlaBreached} complaintStatus={c.status} size="small" />
        </div>
      )}
      {c.distanceKm != null && (
        <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
          📍 {c.distanceKm.toFixed(1)} km away
        </div>
      )}
      <div className="issue-card-meta">
        <span className="issue-card-meta-item"><MapPin size={12} />{c.district?.name || 'Gujarat'}</span>
        <span className="issue-card-meta-item"><Clock size={12} />{timeAgo(c.createdAt)}</span>
      </div>
    </div>
  </Link>
);

export default IssueCard;
