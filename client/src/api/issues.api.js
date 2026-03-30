import { mockDelay } from './axiosConfig';
import { MOCK_ISSUES, MOCK_FIELD_WORKERS } from './mockData';

let issues = [...MOCK_ISSUES];

export const issuesApi = {
  getAll: async (filters = {}) => {
    await mockDelay(400);
    let filtered = [...issues];
    if (filters.category) filtered = filtered.filter(i => i.category === filters.category);
    if (filters.status) filtered = filtered.filter(i => i.status === filters.status);
    if (filters.ward) filtered = filtered.filter(i => i.ward === filters.ward);
    if (filters.priority) filtered = filtered.filter(i => i.priority === filters.priority);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) || i.address.toLowerCase().includes(q)
      );
    }
    return { data: filtered, total: filtered.length };
  },

  getById: async (id) => {
    await mockDelay(300);
    const issue = issues.find(i => i.id === id);
    if (!issue) throw new Error('Issue not found');
    return { data: issue };
  },

  create: async (data) => {
    await mockDelay(600);
    const newIssue = {
      id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
      ...data,
      status: 'PENDING',
      priority: 'MEDIUM',
      upvoteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photos: [],
      comments: [],
      feedback: null,
    };
    issues.unshift(newIssue);
    return { data: newIssue };
  },

  update: async (id, data) => {
    await mockDelay(400);
    const idx = issues.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Issue not found');
    issues[idx] = { ...issues[idx], ...data, updatedAt: new Date().toISOString() };
    return { data: issues[idx] };
  },

  upvote: async (id) => {
    await mockDelay(300);
    const issue = issues.find(i => i.id === id);
    if (issue) issue.upvoteCount += 1;
    return { data: issue };
  },

  getByReporter: async (reporterId) => {
    await mockDelay(300);
    const filtered = issues.filter(i => i.reporterId === reporterId);
    return { data: filtered };
  },

  getByAssignee: async (assigneeId) => {
    await mockDelay(300);
    const filtered = issues.filter(i => i.assigneeId === assigneeId);
    return { data: filtered };
  },
};

export default issuesApi;
