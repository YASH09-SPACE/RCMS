import { FileX } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileX, title = 'No data found', description, action, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="p-4 rounded-2xl bg-surface-raised mb-4">
        <Icon size={32} className="text-subtle" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
