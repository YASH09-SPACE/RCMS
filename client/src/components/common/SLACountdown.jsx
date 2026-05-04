import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const SLACountdown = ({ slaDueDate, isSlaBreached, size = 'medium', complaintStatus }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [status, setStatus] = useState('safe'); // safe, warning, breached, resolved

  useEffect(() => {
    if (!slaDueDate) return;

    // If complaint is resolved/closed, show resolved status
    if (['completed', 'closed'].includes(complaintStatus)) {
      setStatus('resolved');
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const due = new Date(slaDueDate);
      const diff = due - now;

      if (isSlaBreached || diff <= 0) {
        setStatus('breached');
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ hours, minutes });

      // Set status based on time remaining
      if (hours < 24) {
        setStatus('warning');
      } else {
        setStatus('safe');
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [slaDueDate, isSlaBreached, complaintStatus]);

  if (!slaDueDate) return null;

  const getStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size === 'small' ? '4px' : '6px',
      padding: size === 'small' ? '4px 8px' : '6px 12px',
      borderRadius: 'var(--radius-md)',
      fontSize: size === 'small' ? '12px' : '13px',
      fontWeight: 600
    };

    if (status === 'resolved') {
      return {
        ...baseStyles,
        background: 'var(--success-bg)',
        color: 'var(--success)',
        border: '1px solid var(--success)'
      };
    } else if (status === 'breached') {
      return {
        ...baseStyles,
        background: 'var(--error-bg)',
        color: 'var(--error)',
        border: '1px solid var(--error)'
      };
    } else if (status === 'warning') {
      return {
        ...baseStyles,
        background: 'var(--warning-bg)',
        color: 'var(--warning)',
        border: '1px solid var(--warning)'
      };
    } else {
      return {
        ...baseStyles,
        background: 'var(--success-bg)',
        color: 'var(--success)',
        border: '1px solid var(--success)'
      };
    }
  };

  const getIcon = () => {
    const iconSize = size === 'small' ? 14 : 16;
    if (status === 'resolved') return <CheckCircle size={iconSize} />;
    if (status === 'breached') return <AlertCircle size={iconSize} />;
    if (status === 'warning') return <AlertTriangle size={iconSize} />;
    return <Clock size={iconSize} />;
  };

  return (
    <div style={getStyles()}>
      {getIcon()}
      <span>
        {status === 'resolved'
          ? 'SLA Completed'
          : status === 'breached' 
            ? 'SLA BREACHED' 
            : timeRemaining ? `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining` : 'Calculating...'
        }
      </span>
    </div>
  );
};

export default SLACountdown;
