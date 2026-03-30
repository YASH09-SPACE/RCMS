import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, User, MessageSquare } from 'lucide-react';
import { MOCK_ISSUES, MOCK_FIELD_WORKERS } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { formatDateTime, formatDate } from '../../utils/helpers';

const AdminIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(MOCK_ISSUES.find(i => i.id === id) || null);
  
  if (!issue) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-foreground">Issue not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleAssignWorker = (workerId) => {
    const worker = MOCK_FIELD_WORKERS.find(w => w.id === workerId);
    setIssue(prev => ({
      ...prev,
      assigneeId: workerId || null,
      assigneeName: worker ? worker.name : null
    }));
  };

  const handleStatusUpdate = (newStatus) => {
    setIssue(prev => ({ ...prev, status: newStatus }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4">
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-subtle">{issue.id}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <CategoryBadge category={issue.category} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{issue.title}</h1>
            <p className="text-sm text-muted leading-relaxed">{issue.description}</p>
          </Card>

          {/* Admin Management Tools */}
          <Card className="border-primary-500/30">
            <h3 className="text-lg font-bold text-foreground mb-4">Management Controls</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assign Field Worker</label>
                <select 
                  className="input-base"
                  value={issue.assigneeId || ''}
                  onChange={(e) => handleAssignWorker(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {MOCK_FIELD_WORKERS.filter(w => w.isActive).map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name} ({worker.specialization})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Update Status</label>
                <select 
                  className="input-base"
                  value={issue.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Photos */}
          {issue.photos?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-foreground mb-3">Photos ({issue.photos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {issue.photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.url} alt="" className="w-full h-40 object-cover rounded-xl border border-border" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full capitalize">
                      {photo.type || 'Upload'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Internal Comments */}
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Internal Administrator Notes
            </h3>
            <div className="space-y-4 mb-4">
              {issue.comments?.filter(c => c.isInternal).map(comment => (
                <div key={comment.id} className="bg-surface-raised p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{comment.userName}</span>
                    <span className="text-xs text-subtle">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.body}</p>
                </div>
              ))}
              {!issue.comments?.some(c => c.isInternal) && (
                <p className="text-sm text-subtle italic">No admin notes recorded on this issue.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add a new internal note..." className="input-base" />
              <Button>Post Note</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-3">Meta Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">Location</span>
                  <span className="text-sm text-foreground">{issue.address}</span>
                  <span className="text-[10px] text-subtle block font-mono mt-0.5">{issue.latitude}, {issue.longitude}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">Ward</span>
                  <span className="text-sm text-foreground">{issue.ward}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">SLA Deadline</span>
                  <span className="text-sm text-foreground">{issue.slaDeadline ? formatDateTime(issue.slaDeadline) : 'None'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">Reported by</span>
                  <span className="text-sm text-foreground">{issue.reporterName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">Created At</span>
                  <span className="text-sm text-foreground">{formatDateTime(issue.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminIssueDetail;
