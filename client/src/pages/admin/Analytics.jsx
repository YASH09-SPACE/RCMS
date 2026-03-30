import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { MOCK_ANALYTICS } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const CATEGORY_COLORS = ['#1E4DB7', '#D94F2C', '#1A7A4A', '#B56A10', '#6C8AFF', '#8A8A84'];

const Analytics = () => {
  const { byCategory, byWard, resolutionTrend, monthlySubmissions, summary } = MOCK_ANALYTICS;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Analytics"
        subtitle="Insights and trends across all reported issues"
        actions={
          <Button variant="secondary" icon={Download} size="sm">Export CSV</Button>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Resolution', value: `${summary.avgResolutionDays} days`, trend: '↓ 0.3d', good: true },
          { label: 'SLA Compliance', value: `${summary.slaCompliance}%`, trend: '↑ 4%', good: true },
          { label: 'Satisfaction', value: `${summary.satisfactionScore}/5`, trend: '↑ 0.2', good: true },
          { label: 'Open Issues', value: summary.openIssues, trend: '↓ 8', good: true },
        ].map((kpi, idx) => (
          <Card key={idx}>
            <p className="text-[10px] font-mono text-subtle uppercase tracking-wider">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            <p className={`text-xs font-medium mt-1 ${kpi.good ? 'text-accent-green' : 'text-accent-red'}`}>{kpi.trend}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Resolution Time Trend */}
        <Card>
          <CardTitle>Resolution Time Trend</CardTitle>
          <div className="mt-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolutionTrend}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="d" />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="avgDays" stroke="var(--color-primary-500)" fill="url(#colorAvg)" strokeWidth={2} name="Avg Days" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardTitle>Issues by Category</CardTitle>
          <div className="mt-4 flex items-center" style={{ height: 280 }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percentage }) => `${percentage}%`} labelLine={false}>
                  {byCategory.map((entry, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1 pl-4">
              {byCategory.map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx] }} />
                  <span className="text-xs text-muted flex-1">{cat.name}</span>
                  <span className="text-xs font-bold text-foreground">{cat.count}</span>
                  <span className="text-[10px] text-subtle w-8 text-right">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Ward-wise breakdown */}
      <Card className="mb-6">
        <CardTitle>Issues by Ward</CardTitle>
        <div className="mt-4" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byWard}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="ward" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Submissions Trend */}
      <Card>
        <CardTitle>Monthly Submissions Trend</CardTitle>
        <div className="mt-4" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySubmissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="submitted" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ fill: 'var(--color-primary-500)', r: 4 }} name="Submitted" />
              <Line type="monotone" dataKey="resolved" stroke="var(--color-accent-green)" strokeWidth={2} dot={{ fill: 'var(--color-accent-green)', r: 4 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};

export default Analytics;
