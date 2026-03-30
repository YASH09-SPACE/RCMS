import { motion } from 'framer-motion';

const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendUp, color = 'primary', className = '' }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-500',
    red: 'bg-accent-red-light text-accent-red',
    green: 'bg-accent-green-light text-accent-green',
    amber: 'bg-accent-amber-light text-accent-amber',
    blue: 'bg-accent-blue-light text-accent-blue',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-base p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-subtle uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-accent-green' : 'text-accent-red'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
