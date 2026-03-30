import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-soft hover:shadow-medium',
  secondary: 'bg-surface border border-border text-foreground hover:bg-surface-raised hover:border-border-strong',
  ghost: 'text-muted hover:text-foreground hover:bg-surface-raised',
  danger: 'bg-accent-red text-white hover:opacity-90 active:opacity-80',
  success: 'bg-accent-green text-white hover:opacity-90 active:opacity-80',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-3.5 text-base',
  icon: 'p-2.5',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`btn-base ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'opacity-70 cursor-wait' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
      {IconRight && <IconRight size={16} />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
