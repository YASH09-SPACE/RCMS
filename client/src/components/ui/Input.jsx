import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-base ${Icon ? 'pl-10' : ''} ${error ? 'border-accent-red focus:ring-accent-red/30 focus:border-accent-red' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-accent-red mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Select component
const Select = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  placeholder = 'Select...',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className="input-base appearance-none cursor-pointer"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-accent-red mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Textarea component
const Textarea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-base resize-none ${error ? 'border-accent-red focus:ring-accent-red/30 focus:border-accent-red' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-accent-red mt-1">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input, Select, Textarea };
export default Input;
