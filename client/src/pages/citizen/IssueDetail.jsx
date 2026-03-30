import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ThumbsUp, MapPin, Clock, User, MessageSquare, Star, Share2 } from 'lucide-react';
import { MOCK_ISSUES } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { formatDateTime, formatRelativeTime, STATUS_CONFIG } from '../../utils/helpers';

const statusSteps = ['PENDING', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upvoted, setUpvoted] = useState(false);

  const issue = MOCK_ISSUES.find(i => i.id === id);
  if (!issue) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-foreground">Issue not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const statusIdx = statusSteps.indexOf(issue.status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-subtle">{issue.id}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <CategoryBadge category={issue.category} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{issue.title}</h1>
            <p className="text-sm text-muted leading-relaxed">{issue.description}</p>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <Button
                variant={upvoted ? 'primary' : 'secondary'}
                size="sm"
                icon={ThumbsUp}
                onClick={() => setUpvoted(!upvoted)}
              >
                {issue.upvoteCount + (upvoted ? 1 : 0)} Upvotes
              </Button>
              <Button variant="ghost" size="sm" icon={Share2}>Share</Button>
            </div>
          </Card>

          {/* Status timeline */}
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-4">Status Progress</h3>
            <div className="flex items-center gap-0">
              {statusSteps.map((step, idx) => {
                const isActive = idx <= statusIdx;
                const isCurrent = idx === statusIdx;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      isActive ? 'bg-primary-500 text-white' : 'bg-surface-raised text-subtle border border-border'
                    } ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}`}>
                      {isActive ? '✓' : idx + 1}
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 rounded ${isActive && idx < statusIdx ? 'bg-primary-500' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {statusSteps.map(step => (
                <span key={step} className="text-[9px] font-medium text-subtle text-center flex-1">
                  {STATUS_CONFIG[step]?.label}
                </span>
              ))}
            </div>
          </Card>

          {/* Photos */}
          {issue.photos?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-foreground mb-3">Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {issue.photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.url} alt="" className="w-full h-40 object-cover rounded-xl border border-border" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/60 text-white px-2 py-0.5 rounded-full capitalize">
                      {photo.type}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Comments ({issue.comments?.length || 0})
            </h3>
            {issue.comments?.length > 0 ? (
              <div className="space-y-4">
                {issue.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar name={comment.userName} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                        {comment.isInternal && <span className="text-[10px] font-mono bg-accent-amber-light text-accent-amber px-1.5 py-0.5 rounded">Internal</span>}
                        <span className="text-xs text-subtle">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted mt-1">{comment.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-subtle">No comments yet.</p>
            )}
          </Card>

          {/* Feedback */}
          {issue.feedback && (
            <Card>
              <h3 className="text-sm font-semibold text-foreground mb-3">Resolution Feedback</h3>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={18} className={s <= issue.feedback.rating ? 'text-accent-amber fill-accent-amber' : 'text-border'} />
                ))}
                <span className="text-sm font-semibold text-foreground ml-2">{issue.feedback.rating}/5</span>
              </div>
              {issue.feedback.comment && <p className="text-sm text-muted">{issue.feedback.comment}</p>}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-3">Details</h3>
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
                <Clock size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">Reported</span>
                  <span className="text-sm text-foreground">{formatDateTime(issue.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-subtle block">Reported by</span>
                  <span className="text-sm text-foreground">{issue.reporterName}</span>
                </div>
              </div>
              {issue.assigneeName && (
                <div className="flex items-start gap-2.5">
                  <User size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-subtle block">Assigned to</span>
                    <span className="text-sm text-foreground">{issue.assigneeName}</span>
                  </div>
                </div>
              )}
              {issue.ward && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-subtle block">Ward</span>
                    <span className="text-sm text-foreground">{issue.ward}</span>
                  </div>
                </div>
              )}
              {issue.slaDeadline && (
                <div className="flex items-start gap-2.5">
                  <Clock size={14} className="text-subtle mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-subtle block">SLA Deadline</span>
                    <span className="text-sm text-foreground">{formatDateTime(issue.slaDeadline)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueDetail;
