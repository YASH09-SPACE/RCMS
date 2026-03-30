import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, ArrowUpRight, Clock, CheckCircle2, AlertTriangle, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_ISSUES } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import StatsCard from '../../components/ui/StatsCard';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { formatRelativeTime, truncate } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myIssues, setMyIssues] = useState([]);

  useEffect(() => {
    // Filter issues by current user
    const filtered = MOCK_ISSUES.filter(i => i.reporterId === user?.id);
    setMyIssues(filtered);
  }, [user]);

  const allIssues = MOCK_ISSUES.filter(i => i.reporterId === user?.id);
  const pendingCount = allIssues.filter(i => i.status === 'PENDING').length;
  const activeCount = allIssues.filter(i => ['UNDER_REVIEW', 'IN_PROGRESS'].includes(i.status)).length;
  const resolvedCount = allIssues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status)).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-enter">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Track your reported issues and stay updated on their progress"
        actions={
          <Button icon={PlusCircle} onClick={() => navigate('/citizen/report')}>
            Report Issue
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Reports" value={allIssues.length} icon={ArrowUpRight} color="primary" />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} color="amber" />
        <StatsCard title="In Progress" value={activeCount} icon={AlertTriangle} color="blue" />
        <StatsCard title="Resolved" value={resolvedCount} icon={CheckCircle2} color="green" />
      </div>

      {/* My Issues */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">My Reports</h2>
      </div>

      {myIssues.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-base font-semibold text-foreground mb-1">No reports yet</h3>
          <p className="text-sm text-muted mb-4">Start by reporting a road issue in your area</p>
          <Button icon={PlusCircle} onClick={() => navigate('/citizen/report')}>
            Report Issue
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {myIssues.map((issue, idx) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                hover
                onClick={() => navigate(`/citizen/issues/${issue.id}`)}
                className="group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-subtle">{issue.id}</span>
                      <StatusBadge status={issue.status} />
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary-500 transition-colors truncate">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-muted mt-1">{truncate(issue.description, 100)}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-subtle">
                      <span>📍 {issue.address}</span>
                      <span>🕐 {formatRelativeTime(issue.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={12} /> {issue.upvoteCount}
                      </span>
                    </div>
                  </div>
                  {issue.photos?.[0] && (
                    <img
                      src={issue.photos[0].url}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-border"
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent activity from all issues */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Community Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_ISSUES.slice(0, 6).map((issue, idx) => (
            <Card key={issue.id} hover onClick={() => navigate(`/citizen/issues/${issue.id}`)}>
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={issue.category} />
                <StatusBadge status={issue.status} />
              </div>
              <h4 className="text-sm font-medium text-foreground truncate">{issue.title}</h4>
              <p className="text-xs text-muted mt-1">{issue.address}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-subtle">
                <span>{formatRelativeTime(issue.createdAt)}</span>
                <span className="flex items-center gap-1"><ThumbsUp size={11} /> {issue.upvoteCount}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
