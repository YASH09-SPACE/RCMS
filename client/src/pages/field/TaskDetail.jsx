import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Camera, CheckCircle, Navigation, MessageSquare, AlertTriangle } from 'lucide-react';
import { MOCK_ISSUES } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { formatDateTime, getDaysUntilSLA } from '../../utils/helpers';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [resolutionPhotos, setResolutionPhotos] = useState([]);
  
  const issue = MOCK_ISSUES.find(i => i.id === id);
  
  if (!issue) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-foreground">Task not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const slaDays = getDaysUntilSLA(issue.slaDeadline);
  const isBreached = slaDays !== null && slaDays <= 0;

  const handleStatusUpdate = (newStatus) => {
    setUpdating(true);
    // Mock API call
    setTimeout(() => {
      setUpdating(false);
      navigate('/field/tasks');
    }, 1000);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(f),
    }));
    setResolutionPhotos([...resolutionPhotos, ...previews].slice(0, 3));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-primary-500 font-medium">
          <ArrowLeft size={16} /> Back to Tasks
        </button>
        <span className="text-xs font-mono font-bold bg-surface-raised px-2 py-1 rounded text-subtle">
          {issue.id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="relative overflow-hidden">
            {isBreached && issue.status !== 'RESOLVED' && (
              <div className="absolute top-0 left-0 right-0 bg-accent-red text-white text-[10px] font-bold tracking-widest uppercase py-0.5 text-center">
                SLA Breached
              </div>
            )}
            
            <div className={`mt-${isBreached ? '4' : '0'}`}>
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
                <CategoryBadge category={issue.category} />
              </div>
              
              <h1 className="text-xl font-bold text-foreground mb-2">{issue.title}</h1>
              <p className="text-sm text-muted">{issue.description}</p>
              
              <div className="bg-surface-raised rounded-xl p-3 mt-4 flex items-start gap-3 border border-border">
                <MapPin size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{issue.address}</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="secondary" size="sm" icon={Navigation} className="h-8 text-xs py-0">
                      Navigate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Issue Photos */}
          {issue.photos?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-foreground mb-3">Reported Condition</h3>
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-snap-x">
                {issue.photos.map(p => (
                  <img 
                    key={p.id} 
                    src={p.url} 
                    alt="" 
                    className="h-40 w-60 object-cover rounded-xl border border-border flex-shrink-0 scroll-snap-align-start" 
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Action Area */}
          {(issue.status === 'UNDER_REVIEW' || issue.status === 'IN_PROGRESS') && (
            <Card className="border-primary-500/30 shadow-[0_0_15px_rgba(30,77,183,0.05)]">
              <h3 className="text-lg font-bold text-foreground mb-4">Update Task</h3>
              
              {issue.status === 'UNDER_REVIEW' ? (
                // Acknowledge Task state
                <div className="space-y-4">
                  <p className="text-sm text-muted">Acknowledge this task to start work on it.</p>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    icon={Clock}
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    loading={updating}
                  >
                    Start Work
                  </Button>
                </div>
              ) : (
                // Resolve Task state
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Camera size={16} /> Resolution Photos (Required)
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {resolutionPhotos.map(p => (
                        <div key={p.id} className="relative">
                          <img src={p.url} alt="" className="w-24 h-24 object-cover rounded-xl border border-border" />
                          <button 
                            onClick={() => setResolutionPhotos(resolutionPhotos.filter(rp => rp.id !== p.id))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-accent-red text-white flex items-center justify-center rounded-full text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {resolutionPhotos.length < 3 && (
                        <label className="w-24 h-24 border-2 border-dashed border-border hover:border-primary-500 rounded-xl flex flex-col items-center justify-center cursor-pointer text-subtle transition-colors">
                          <Camera size={20} className="mb-1" />
                          <span className="text-[10px] font-medium">Add Photo</span>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <Textarea 
                    label="Resolution Notes" 
                    placeholder="Describe what was done to fix the issue..." 
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                  />
                  
                  <Button 
                    className="w-full" 
                    variant="success"
                    size="lg" 
                    icon={CheckCircle}
                    disabled={resolutionPhotos.length === 0 || !updateNote}
                    onClick={() => handleStatusUpdate('RESOLVED')}
                    loading={updating}
                  >
                    Mark as Resolved
                  </Button>
                  {resolutionPhotos.length === 0 && (
                    <p className="text-[10px] text-accent-red text-center mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle size={12} /> At least 1 photo is required to resolve
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Resolved State info */}
          {issue.status === 'RESOLVED' && (
            <Card className="bg-accent-green-light border-accent-green/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-green text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-accent-green">Task Resolved</h3>
                  <p className="text-xs text-accent-green/80">You resolved this issue. Awaiting admin closure.</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-3">Task Details</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-subtle flex items-center gap-1"><Clock size={12} /> Reported</span>
                <span className="text-sm font-medium text-foreground">{formatDateTime(issue.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-subtle flex items-center gap-1"><AlertTriangle size={12} /> SLA Deadline</span>
                <span className={`text-sm font-medium ${isBreached ? 'text-accent-red' : 'text-foreground'}`}>
                  {formatDateTime(issue.slaDeadline)}
                </span>
              </div>
            </div>
          </Card>

          {/* Internal Comments for workers */}
          <Card>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare size={16} /> Internal Notes
            </h3>
            <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-1">
              {issue.comments?.filter(c => c.isInternal).map((c, idx) => (
                <div key={idx} className="bg-surface-raised p-2.5 rounded-lg border border-border">
                  <p className="text-xs font-medium text-foreground mb-1">{c.userName}</p>
                  <p className="text-xs text-muted">{c.body}</p>
                </div>
              ))}
              {!issue.comments?.some(c => c.isInternal) && (
                <p className="text-xs text-subtle italic">No internal notes.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add note..." className="input-base text-xs py-1.5 h-auto" />
              <Button size="sm" className="px-3" variant="secondary">Add</Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDetail;
