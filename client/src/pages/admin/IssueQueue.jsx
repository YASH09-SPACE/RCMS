import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Eye } from 'lucide-react';
import { MOCK_ISSUES, MOCK_FIELD_WORKERS } from '../../api/mockData';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import { formatRelativeTime, formatDate, getDaysUntilSLA } from '../../utils/helpers';

const IssueQueue = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filtered = useMemo(() => {
    let items = [...MOCK_ISSUES];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.address.toLowerCase().includes(q));
    }
    if (statusFilter) items = items.filter(i => i.status === statusFilter);
    if (priorityFilter) items = items.filter(i => i.priority === priorityFilter);
    if (categoryFilter) items = items.filter(i => i.category === categoryFilter);

    switch (sortBy) {
      case 'oldest': items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'upvotes': items.sort((a, b) => b.upvoteCount - a.upvoteCount); break;
      case 'priority': {
        const pOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        items.sort((a, b) => pOrder[a.priority] - pOrder[b.priority]);
        break;
      }
      default: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return items;
  }, [search, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Issue Queue" subtitle={`${filtered.length} issues found`} />

      {/* Filters bar */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search by title, ID, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-sm"
            />
          </div>
          <select className="input-base text-sm w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select className="input-base text-sm w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select className="input-base text-sm w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="upvotes">Most Upvotes</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </Card>

      {/* Issues Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-raised">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">ID</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">Issue</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">Category</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">Priority</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">Upvotes</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">SLA</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium uppercase tracking-wider text-subtle">Reported</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue, idx) => {
                const slaDays = getDaysUntilSLA(issue.slaDeadline);
                return (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-border hover:bg-surface-raised/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-subtle">{issue.id}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-[250px]">
                        <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                        <p className="text-xs text-muted truncate">{issue.address}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><CategoryBadge category={issue.category} /></td>
                    <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                    <td className="px-4 py-3 text-sm text-foreground">👍 {issue.upvoteCount}</td>
                    <td className="px-4 py-3">
                      {slaDays !== null ? (
                        <span className={`text-xs font-mono ${slaDays <= 0 ? 'text-accent-red font-bold' : slaDays <= 2 ? 'text-accent-amber' : 'text-accent-green'}`}>
                          {slaDays <= 0 ? 'BREACHED' : `${slaDays}d left`}
                        </span>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-subtle">{formatRelativeTime(issue.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/admin/issues/${issue.id}`)}>
                        View
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default IssueQueue;
