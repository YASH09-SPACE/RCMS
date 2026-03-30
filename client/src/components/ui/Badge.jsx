const badgeVariants = {
  blue: 'bg-accent-blue-light text-accent-blue',
  red: 'bg-accent-red-light text-accent-red',
  green: 'bg-accent-green-light text-accent-green',
  amber: 'bg-accent-amber-light text-accent-amber',
  gray: 'bg-surface-raised text-subtle',
  primary: 'bg-primary-50 text-primary-500',
};

const Badge = ({ children, variant = 'blue', dot = false, className = '' }) => {
  return (
    <span className={`badge-base ${badgeVariants[variant] || badgeVariants.blue} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  );
};

// Status Badge
import { STATUS_CONFIG } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <Badge variant={config.color} dot>
      {config.label}
    </Badge>
  );
};

// Priority Badge
import { PRIORITY_CONFIG } from '../../utils/helpers';

const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW;
  return (
    <Badge variant={config.color}>
      {config.label}
    </Badge>
  );
};

// Category Badge
import { CATEGORY_CONFIG } from '../../utils/helpers';

const CategoryBadge = ({ category }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
  return (
    <Badge variant={config.color}>
      {config.icon} {config.label}
    </Badge>
  );
};

export { Badge, StatusBadge, PriorityBadge, CategoryBadge };
export default Badge;
