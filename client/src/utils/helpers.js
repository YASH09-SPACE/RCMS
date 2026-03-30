// Utility helpers for RIRRS

export const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'amber', dotColor: 'bg-accent-amber' },
  UNDER_REVIEW: { label: 'Under Review', color: 'blue', dotColor: 'bg-accent-blue' },
  IN_PROGRESS: { label: 'In Progress', color: 'blue', dotColor: 'bg-primary-500' },
  RESOLVED: { label: 'Resolved', color: 'green', dotColor: 'bg-accent-green' },
  CLOSED: { label: 'Closed', color: 'gray', dotColor: 'bg-subtle' },
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'green' },
  MEDIUM: { label: 'Medium', color: 'amber' },
  HIGH: { label: 'High', color: 'red' },
  CRITICAL: { label: 'Critical', color: 'red' },
};

export const CATEGORY_CONFIG = {
  POTHOLE: { label: 'Pothole', icon: '🕳️', color: 'amber' },
  STREETLIGHT: { label: 'Streetlight', icon: '💡', color: 'amber' },
  DRAIN: { label: 'Drain', icon: '🌊', color: 'blue' },
  ROAD_CRACK: { label: 'Road Crack', icon: '⚡', color: 'red' },
  SIGNAGE: { label: 'Signage', icon: '🪧', color: 'green' },
  OTHER: { label: 'Other', icon: '📋', color: 'gray' },
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 80) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};

export const getDaysUntilSLA = (slaDeadline) => {
  if (!slaDeadline) return null;
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffDays = Math.ceil((deadline - now) / 86400000);
  return diffDays;
};
