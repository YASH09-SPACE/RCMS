import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, ArrowUpRight, MapPin, Map as MapIcon, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_ISSUES } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { formatRelativeTime, getDaysUntilSLA } from '../../utils/helpers';

const FieldTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED
  const [search, setSearch] = useState('');

  // Get tasks assigned to current field worker
  const myTasks = useMemo(() => {
    let tasks = MOCK_ISSUES.filter(i => i.assigneeId === user?.id);
    
    if (filter !== 'ALL') {
      tasks = tasks.filter(i => i.status === filter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(i => i.title.toLowerCase().includes(q) || i.address.toLowerCase().includes(q));
    }
    
    // Sort by priority and SLA
    return tasks.sort((a, b) => {
      const pOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return new Date(a.slaDeadline) - new Date(b.slaDeadline);
    });
  }, [user, filter, search]);

  const stats = {
    total: MOCK_ISSUES.filter(i => i.assigneeId === user?.id).length,
    pending: MOCK_ISSUES.filter(i => i.assigneeId === user?.id && i.status === 'UNDER_REVIEW').length, // Treated as pending for worker
    inProgress: MOCK_ISSUES.filter(i => i.assigneeId === user?.id && i.status === 'IN_PROGRESS').length,
    resolved: MOCK_ISSUES.filter(i => i.assigneeId === user?.id && i.status === 'RESOLVED').length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader 
        title="My Tasks" 
        subtitle="Manage your assigned maintenance and repair tasks"
        actions={
          <Button variant="secondary" icon={MapIcon}>Map View</Button>
        }
      />

      {/* Task Summary Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
            filter === 'ALL' 
              ? 'bg-primary-500 border-primary-500 text-white shadow-soft' 
              : 'bg-surface border-border text-subtle hover:bg-surface-raised hover:text-foreground'
          }`}
        >
          <div className="text-sm font-semibold mb-0.5">All Tasks</div>
          <div className={`text-xl font-bold ${filter === 'ALL' ? 'text-white' : 'text-foreground'}`}>
            {stats.total}
          </div>
        </button>
        <button
          onClick={() => setFilter('UNDER_REVIEW')}
          className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
            filter === 'UNDER_REVIEW' 
              ? 'bg-accent-amber border-accent-amber text-white shadow-soft' 
              : 'bg-surface border-border text-subtle hover:bg-surface-raised hover:text-foreground'
          }`}
        >
          <div className="text-sm font-semibold mb-0.5">New/Pending</div>
          <div className={`text-xl font-bold ${filter === 'UNDER_REVIEW' ? 'text-white' : 'text-foreground'}`}>
            {stats.pending}
          </div>
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
            filter === 'IN_PROGRESS' 
              ? 'bg-primary-500 border-primary-500 text-white shadow-soft' 
              : 'bg-surface border-border text-subtle hover:bg-surface-raised hover:text-foreground'
          }`}
        >
          <div className="text-sm font-semibold mb-0.5">In Progress</div>
          <div className={`text-xl font-bold ${filter === 'IN_PROGRESS' ? 'text-white' : 'text-foreground'}`}>
            {stats.inProgress}
          </div>
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
            filter === 'RESOLVED' 
              ? 'bg-accent-green border-accent-green text-white shadow-soft' 
              : 'bg-surface border-border text-subtle hover:bg-surface-raised hover:text-foreground'
          }`}
        >
          <div className="text-sm font-semibold mb-0.5">Completed</div>
          <div className={`text-xl font-bold ${filter === 'RESOLVED' ? 'text-white' : 'text-foreground'}`}>
            {stats.resolved}
          </div>
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
        <input 
          type="text" 
          placeholder="Search location or title..." 
          className="input-base pl-10 h-12 text-base shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-subtle hover:text-foreground bg-surface-raised rounded-lg">
          <Filter size={16} />
        </button>
      </div>

      {myTasks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-4 rounded-full bg-surface-raised mb-4">
            <CheckCircle2 size={32} className="text-subtle" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No tasks found</h3>
          <p className="text-sm text-muted">You have no tasks matching this criteria.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {myTasks.map((task, idx) => {
            const slaDays = getDaysUntilSLA(task.slaDeadline);
            const isBreached = slaDays !== null && slaDays <= 0;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  hover 
                  className={`border-l-4 ${isBreached ? 'border-l-accent-red' : task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'border-l-accent-amber' : 'border-l-primary-500'}`}
                  onClick={() => navigate(`/field/tasks/${task.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <CategoryBadge category={task.category} />
                    </div>
                    {slaDays !== null && task.status !== 'RESOLVED' && task.status !== 'CLOSED' && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isBreached ? 'bg-accent-red-light text-accent-red' : 'bg-surface-raised text-subtle'}`}>
                        {isBreached ? 'SLA BREACHED' : `${slaDays}d to SLA`}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-bold text-foreground leading-tight mb-2">
                    {task.title}
                  </h3>
                  
                  <div className="flex items-start gap-2 text-sm text-muted mb-3">
                    <MapPin size={16} className="text-subtle mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{task.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                    <div className="text-xs font-mono text-subtle">{task.id}</div>
                    <div className="text-xs font-medium text-primary-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                      View details <ArrowUpRight size={14} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// Import needed for empty state
import { CheckCircle2 } from 'lucide-react';

export default FieldTasks;
