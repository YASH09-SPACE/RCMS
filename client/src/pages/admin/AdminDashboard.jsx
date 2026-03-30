import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, CheckCircle2, Clock, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MOCK_ANALYTICS, MOCK_ISSUES } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import StatsCard from '../../components/ui/StatsCard';
import { Card, CardTitle } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { formatRelativeTime } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#B56A10', '#1E4DB7', '#6C8AFF', '#1A7A4A', '#8A8A84'];

const AdminDashboard = () => {
  const { summary, byCategory, byStatus, monthlySubmissions } = MOCK_ANALYTICS;
  const navigate = useNavigate();

  const recentIssues = MOCK_ISSUES.filter(i => i.status === 'PENDING' || i.status === 'UNDER_REVIEW').slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Admin Dashboard" subtitle="Overview of road issue management system" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Issues" value={summary.totalIssues} icon={BarChart3} color="primary" trend="12% vs last month" trendUp />
        <StatsCard title="Open Issues" value={summary.openIssues} icon={AlertTriangle} color="amber" />
        <StatsCard title="Resolved" value={summary.resolvedIssues} icon={CheckCircle2} color="green" trend="8% vs last month" trendUp />
        <StatsCard title="Avg Resolution" value={`${summary.avgResolutionDays}d`} icon={Clock} color="blue" trend="0.3d faster" trendUp />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="SLA Compliance" value={`${summary.slaCompliance}%`} icon={TrendingUp} color="green" />
        <StatsCard title="Satisfaction" value={`${summary.satisfactionScore}★`} icon={CheckCircle2} color="amber" />
        <StatsCard title="Active Workers" value={summary.activeWorkers} icon={Users} color="primary" />
        <StatsCard title="Closed This Month" value={summary.closedIssues} icon={CheckCircle2} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Submissions Chart */}
        <Card>
          <CardTitle>Monthly Submissions vs Resolved</CardTitle>
          <div className="mt-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySubmissions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="submitted" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} name="Submitted" />
                <Bar dataKey="resolved" fill="var(--color-accent-green)" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution Pie */}
        <Card>
          <CardTitle>Issue Status Distribution</CardTitle>
          <div className="mt-4 flex items-center gap-4" style={{ height: 260 }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="count">
                  {byStatus.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {byStatus.map((s, idx) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-xs text-muted flex-1">{s.name}</span>
                  <span className="text-xs font-semibold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="mb-6">
        <CardTitle>Issues by Category</CardTitle>
        <div className="mt-4" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Pending Issues */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Recent Pending Issues</CardTitle>
          <button onClick={() => navigate('/admin/issues')} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {recentIssues.map(issue => (
            <div
              key={issue.id}
              onClick={() => navigate(`/admin/issues`)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-raised cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-subtle">{issue.id}</span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </div>
                <h4 className="text-sm font-medium text-foreground truncate">{issue.title}</h4>
                <p className="text-xs text-muted">{issue.address}</p>
              </div>
              <div className="text-right text-xs text-subtle flex-shrink-0">
                <div>👍 {issue.upvoteCount}</div>
                <div>{formatRelativeTime(issue.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default AdminDashboard;
