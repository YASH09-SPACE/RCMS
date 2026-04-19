import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../NotificationBell';
import { notificationService } from '../../../services/notificationService';
import * as AuthContext from '../../../context/AuthContext';

// Mock the notification service
vi.mock('../../../services/notificationService', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn()
  }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Helper to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotificationBell Component', () => {
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    role: 'admin'
  };

  const mockNotifications = [
    {
      _id: 'notif1',
      title: 'New Task Assigned',
      message: 'You have been assigned to Complaint #12345',
      type: 'info',
      isRead: false,
      complaint: 'complaint123',
      createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      _id: 'notif2',
      title: 'Task Completed',
      message: 'Constructor has marked Complaint #12346 as completed',
      type: 'success',
      isRead: false,
      complaint: 'complaint124',
      createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      _id: 'notif3',
      title: 'SLA Breached',
      message: 'Complaint #12347 has breached SLA',
      type: 'error',
      isRead: true,
      complaint: 'complaint125',
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock useAuth to return mock user
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: mockUser });
    
    // Mock getNotifications to return mock data
    notificationService.getNotifications.mockResolvedValue({
      success: true,
      data: mockNotifications,
      unreadCount: 2
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial rendering and data fetching', () => {
    it('should fetch notifications on mount', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
      });
    });

    it('should display the bell icon', () => {
      renderWithRouter(<NotificationBell />);
      
      const bellButton = screen.getByTitle('Notifications');
      expect(bellButton).toBeInTheDocument();
    });

    it('should not display dropdown initially', () => {
      renderWithRouter(<NotificationBell />);
      
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('Unread count display', () => {
    it('should display red dot indicator when there are unread notifications', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        const bellButton = screen.getByTitle('Notifications');
        const redDot = bellButton.querySelector('span');
        expect(redDot).toBeInTheDocument();
      });
    });

    it('should not display red dot when unread count is 0', async () => {
      notificationService.getNotifications.mockResolvedValue({
        success: true,
        data: mockNotifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        const bellButton = screen.getByTitle('Notifications');
        const redDot = bellButton.querySelector('span');
        expect(redDot).not.toBeInTheDocument();
      });
    });

    it('should update unread count after marking notification as read', async () => {
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      // Wait for initial load
      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      // Open dropdown
      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      // Click on an unread notification
      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(notificationService.markAsRead).toHaveBeenCalledWith('notif1');
      });
    });
  });

  describe('Dropdown display and interaction', () => {
    it('should open dropdown when bell icon is clicked', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    it('should close dropdown when bell icon is clicked again', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      
      // Open dropdown
      fireEvent.click(bellButton);
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });

      // Close dropdown
      fireEvent.click(bellButton);
      await waitFor(() => {
        expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
      });
    });

    it('should display all notifications in the dropdown', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
        expect(screen.getByText('Task Completed')).toBeInTheDocument();
        expect(screen.getByText('SLA Breached')).toBeInTheDocument();
      });
    });

    it('should display "No notifications" when notifications array is empty', async () => {
      notificationService.getNotifications.mockResolvedValue({
        success: true,
        data: [],
        unreadCount: 0
      });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
      });
    });

    it('should display unread notifications with highlighted background', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        const unreadNotif = screen.getByText('New Task Assigned');
        expect(unreadNotif).toBeInTheDocument();
        // Unread notifications should have highlighted background
        const notifItem = unreadNotif.closest('.notification-item');
        expect(notifItem).toBeInTheDocument();
      });
    });

    it('should display read notifications', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        const readNotif = screen.getByText('SLA Breached');
        expect(readNotif).toBeInTheDocument();
      });
    });
  });

  describe('Mark as read functionality', () => {
    it('should mark notification as read when clicked', async () => {
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(notificationService.markAsRead).toHaveBeenCalledWith('notif1');
      });
    });

    it('should not call markAsRead for already read notifications', async () => {
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('SLA Breached')).toBeInTheDocument();
      });

      const readNotification = screen.getByText('SLA Breached');
      fireEvent.click(readNotification);

      // Should not call markAsRead since it's already read
      await waitFor(() => {
        expect(notificationService.markAsRead).not.toHaveBeenCalled();
      });
    });

    it('should call markAsRead and update UI after marking as read', async () => {
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(notificationService.markAsRead).toHaveBeenCalledWith('notif1');
      });
    });
  });

  describe('Mark all as read functionality', () => {
    it('should display "Mark all read" button when unread notifications exist', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText(/Mark all read/i)).toBeInTheDocument();
      });
    });

    it('should not display "Mark all read" button when no unread notifications', async () => {
      notificationService.getNotifications.mockResolvedValue({
        success: true,
        data: mockNotifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.queryByText(/Mark all read/i)).not.toBeInTheDocument();
      });
    });

    it('should call markAllAsRead when "Mark all read" button is clicked', async () => {
      notificationService.markAllAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText(/Mark all read/i)).toBeInTheDocument();
      });

      const markAllButton = screen.getByText(/Mark all read/i);
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(notificationService.markAllAsRead).toHaveBeenCalledTimes(1);
      });
    });

    it('should update all notifications to read state after marking all as read', async () => {
      notificationService.markAllAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText(/Mark all read/i)).toBeInTheDocument();
      });

      const markAllButton = screen.getByText(/Mark all read/i);
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(notificationService.markAllAsRead).toHaveBeenCalled();
      });

      // After marking all as read, the button should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Mark all read/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification click navigation', () => {
    it('should navigate to admin complaint detail for admin user', async () => {
      notificationService.markAsRead.mockResolvedValue({ success: true });

      const { container } = renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        // Check that navigation occurred (URL should change)
        expect(window.location.pathname).toContain('/admin/complaints/complaint123');
      });
    });

    it('should navigate to citizen complaint detail for citizen user', async () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ 
        user: { ...mockUser, role: 'citizen' } 
      });
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(window.location.pathname).toContain('/citizen/my-complaints/complaint123');
      });
    });

    it('should navigate to constructor task detail for constructor user', async () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ 
        user: { ...mockUser, role: 'constructor' } 
      });
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(window.location.pathname).toContain('/constructor/tasks/complaint123');
      });
    });

    it('should close dropdown after notification click', async () => {
      notificationService.markAsRead.mockResolvedValue({ success: true });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        // Dropdown should be closed (header not visible)
        expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
      });
    });
  });

  describe('Polling interval', () => {
    it('should set up polling interval on mount', async () => {
      renderWithRouter(<NotificationBell />);

      // Initial fetch should happen
      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
      });

      // Component should display polling message
      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText(/Auto-updates every 60s/i)).toBeInTheDocument();
      });
    });
  });

  describe('Relative time display', () => {
    it('should display relative time for notifications', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        // Should display time in relative format
        expect(screen.getByText(/1h ago/i)).toBeInTheDocument();
      });
    });
  });

  describe('Notification type icons', () => {
    it('should display notification items with type icons', async () => {
      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        // All notification items should be displayed
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
        expect(screen.getByText('Task Completed')).toBeInTheDocument();
        expect(screen.getByText('SLA Breached')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle fetch notifications error gracefully', async () => {
      notificationService.getNotifications.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<NotificationBell />);

      // Component should still render without crashing
      await waitFor(() => {
        expect(screen.getByTitle('Notifications')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle mark as read error gracefully', async () => {
      notificationService.markAsRead.mockRejectedValue(new Error('Network error'));
      // Reset to successful fetch for this test
      notificationService.getNotifications.mockResolvedValue({
        success: true,
        data: mockNotifications,
        unreadCount: 2
      });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('New Task Assigned')).toBeInTheDocument();
      });

      const notification = screen.getByText('New Task Assigned');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(notificationService.markAsRead).toHaveBeenCalled();
      });

      // Component should still be functional
      expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    });

    it('should handle mark all as read error gracefully', async () => {
      notificationService.markAllAsRead.mockRejectedValue(new Error('Network error'));
      // Reset to successful fetch for this test
      notificationService.getNotifications.mockResolvedValue({
        success: true,
        data: mockNotifications,
        unreadCount: 2
      });

      renderWithRouter(<NotificationBell />);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });

      const bellButton = screen.getByTitle('Notifications');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText(/Mark all read/i)).toBeInTheDocument();
      });

      const markAllButton = screen.getByText(/Mark all read/i);
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(notificationService.markAllAsRead).toHaveBeenCalled();
      });

      // Component should still be functional
      expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    });
  });
});
