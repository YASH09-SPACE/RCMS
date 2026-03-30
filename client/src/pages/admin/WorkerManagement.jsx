import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Star } from 'lucide-react';
import { MOCK_FIELD_WORKERS } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import StatsCard from '../../components/ui/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const WorkerManagement = () => {
  const workers = MOCK_FIELD_WORKERS;
  const activeCount = workers.filter(w => w.isActive).length;
  const totalCompleted = workers.reduce((sum, w) => sum + w.completedTasks, 0);
  const avgRating = (workers.reduce((sum, w) => sum + w.rating, 0) / workers.length).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Field Worker Management" subtitle="Manage and monitor field repair teams" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Workers" value={workers.length} icon={Users} color="primary" />
        <StatsCard title="Active" value={activeCount} icon={UserCheck} color="green" />
        <StatsCard title="Tasks Completed" value={totalCompleted} icon={Star} color="amber" />
        <StatsCard title="Avg Rating" value={`${avgRating}★`} icon={Star} color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workers.map((worker, idx) => (
          <motion.div
            key={worker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card hover>
              <div className="flex items-start gap-4">
                <Avatar name={worker.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-foreground">{worker.name}</h3>
                    <Badge variant={worker.isActive ? 'green' : 'red'} dot>
                      {worker.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">{worker.email}</p>
                  <p className="text-xs text-muted">{worker.phone}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3 rounded-lg bg-surface-raised">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{worker.assignedTasks}</div>
                      <div className="text-[10px] text-subtle uppercase tracking-wider">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{worker.completedTasks}</div>
                      <div className="text-[10px] text-subtle uppercase tracking-wider">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{worker.rating}★</div>
                      <div className="text-[10px] text-subtle uppercase tracking-wider">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-foreground">{worker.ward}</div>
                      <div className="text-[10px] text-subtle uppercase tracking-wider">Ward</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Badge variant="blue">{worker.specialization}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WorkerManagement;
