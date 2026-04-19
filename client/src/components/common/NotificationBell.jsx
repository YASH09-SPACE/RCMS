import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import toast from 'react-hot-toast';
import '../../styles/notifications.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        // Limit to 20 most recent notifications
        setNotifications(res.data.slice(0, 20));
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  // Fetch notifications on mount and poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Format relative time (e.g., "2h ago")
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Handle notification click - mark as read and navigate to complaint
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to complaint detail page based on user role
      if (notification.complaint) {
        setShowDropdown(false);
        
        if (user.role === 'citizen') {
          navigate(`/citizen/my-complaints/${notification.complaint}`);
        } else if (user.role === 'admin' || user.role === 'super_admin') {
          navigate(`/admin/complaints/${notification.complaint}`);
        } else if (user.role === 'constructor') {
          navigate(`/constructor/tasks/${notification.complaint}`);
        }
      }
    } catch (err) {
      console.error('Failed to handle notification click:', err);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'error': return <AlertCircle size={16} color="var(--error)" />;
      case 'success': return <ShieldCheck size={16} color="var(--success)" />;
      case 'warning': return <AlertCircle size={16} color="var(--warning)" />;
      default: return <Info size={16} color="var(--info)" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="nav-btn" 
        title="Notifications" 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            backgroundColor: 'var(--error)',
            borderRadius: '50%'
          }}></span>
        )}
      </button>

      {showDropdown && (
        <div className="nav-dropdown" style={{ width: '320px', padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Mark all read <Check size={12} />
              </button>
            )}
          </div>
          
          <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className="notification-item"
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border)',
                    background: n.isRead ? 'transparent' : 'var(--bg-muted)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }} 
                  onClick={() => handleNotificationClick(n)}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: n.isRead ? 400 : 600, 
                      color: 'var(--text-primary)', 
                      marginBottom: '4px' 
                    }}>
                      {n.title}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      wordWrap: 'break-word'
                    }}>
                      {n.message}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-muted)',
                      fontStyle: 'italic'
                    }}>
                      {getRelativeTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: '8px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-updates every 60s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
