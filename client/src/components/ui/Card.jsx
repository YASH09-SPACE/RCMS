const Card = ({ children, className = '', hover = false, padding = true, onClick }) => {
  return (
    <div
      className={`${hover ? 'card-hover cursor-pointer' : 'card-base'} ${padding ? 'p-5' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-foreground ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-muted mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
export default Card;
