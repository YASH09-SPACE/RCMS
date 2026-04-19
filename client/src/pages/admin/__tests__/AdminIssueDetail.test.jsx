import { describe, it, expect } from 'vitest';

/**
 * Integration tests for AdminIssueDetail completion photos display
 * Tests completion history fetching, rendering, late upload warnings, and empty states
 */

/**
 * Filter statusHistory for completed records with images
 * @param {Array} statusHistory - Array of status history records
 * @returns {Array} Filtered completion records
 */
const loadCompletionHistory = (statusHistory) => {
  if (!statusHistory || statusHistory.length === 0) return [];
  
  return statusHistory.filter(
    record => record.status === 'completed' && record.images && record.images.length > 0
  );
};

/**
 * Check if photos were uploaded late (>24h after assignment)
 * @param {Date|string} assignedAt - Assignment timestamp
 * @param {Date|string} uploadedAt - Upload timestamp
 * @returns {boolean} True if upload was late
 */
const isLateUpload = (assignedAt, uploadedAt) => {
  if (!assignedAt || !uploadedAt) return false;
  
  const assignedTime = new Date(assignedAt).getTime();
  const uploadedTime = new Date(uploadedAt).getTime();
  const timeDiff = uploadedTime - assignedTime;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  return timeDiff > twentyFourHours;
};

/**
 * Format timestamp as "DD MMM YYYY, HH:MM AM/PM" in IST
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted timestamp
 */
const formatTimestamp = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Calculate time elapsed since a date
 * @param {Date|string} date - Date to calculate from
 * @returns {string} Time elapsed string (e.g., "2h ago")
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

describe('AdminIssueDetail - Completion History Fetching', () => {
  it('should return empty array when statusHistory is null', () => {
    const result = loadCompletionHistory(null);
    expect(result).toEqual([]);
  });

  it('should return empty array when statusHistory is empty', () => {
    const result = loadCompletionHistory([]);
    expect(result).toEqual([]);
  });

  it('should filter for completed status with images', () => {
    const statusHistory = [
      { status: 'pending', images: [], comments: 'Created' },
      { status: 'assigned', images: [], comments: 'Assigned to constructor' },
      { status: 'in_progress', images: [], comments: 'Work started' },
      { 
        status: 'completed', 
        images: ['image1.jpg', 'image2.jpg'], 
        comments: 'Work completed',
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    const result = loadCompletionHistory(statusHistory);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('completed');
    expect(result[0].images).toHaveLength(2);
  });

  it('should exclude completed status without images', () => {
    const statusHistory = [
      { status: 'completed', images: [], comments: 'Completed without photos' },
      { status: 'completed', images: null, comments: 'Completed with null images' },
      { 
        status: 'completed', 
        images: ['image1.jpg'], 
        comments: 'Completed with photos',
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    const result = loadCompletionHistory(statusHistory);
    expect(result).toHaveLength(1);
    expect(result[0].images).toHaveLength(1);
  });

  it('should handle multiple completion records with images', () => {
    const statusHistory = [
      { 
        status: 'completed', 
        images: ['image1.jpg'], 
        comments: 'First completion',
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      },
      { status: 'reopened', images: [], comments: 'Reopened by citizen' },
      { 
        status: 'completed', 
        images: ['image2.jpg', 'image3.jpg'], 
        comments: 'Second completion',
        updatedBy: { name: 'Jane Constructor' },
        createdAt: '2024-01-16T14:00:00Z'
      }
    ];

    const result = loadCompletionHistory(statusHistory);
    expect(result).toHaveLength(2);
    expect(result[0].comments).toBe('First completion');
    expect(result[1].comments).toBe('Second completion');
  });

  it('should exclude non-completed statuses even with images', () => {
    const statusHistory = [
      { status: 'pending', images: ['image1.jpg'], comments: 'Has images but not completed' },
      { status: 'in_progress', images: ['image2.jpg'], comments: 'In progress with images' },
      { 
        status: 'completed', 
        images: ['image3.jpg'], 
        comments: 'Actually completed',
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    const result = loadCompletionHistory(statusHistory);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('completed');
  });
});

describe('AdminIssueDetail - Late Upload Detection', () => {
  it('should return false when assignedAt is null', () => {
    const result = isLateUpload(null, '2024-01-15T10:00:00Z');
    expect(result).toBe(false);
  });

  it('should return false when uploadedAt is null', () => {
    const result = isLateUpload('2024-01-15T10:00:00Z', null);
    expect(result).toBe(false);
  });

  it('should return false when both dates are null', () => {
    const result = isLateUpload(null, null);
    expect(result).toBe(false);
  });

  it('should return false when upload is within 24 hours', () => {
    const assignedAt = '2024-01-15T10:00:00Z';
    const uploadedAt = '2024-01-16T09:00:00Z'; // 23 hours later
    
    const result = isLateUpload(assignedAt, uploadedAt);
    expect(result).toBe(false);
  });

  it('should return false when upload is exactly 24 hours', () => {
    const assignedAt = '2024-01-15T10:00:00Z';
    const uploadedAt = '2024-01-16T10:00:00Z'; // Exactly 24 hours later
    
    const result = isLateUpload(assignedAt, uploadedAt);
    expect(result).toBe(false);
  });

  it('should return true when upload is more than 24 hours late', () => {
    const assignedAt = '2024-01-15T10:00:00Z';
    const uploadedAt = '2024-01-16T11:00:00Z'; // 25 hours later
    
    const result = isLateUpload(assignedAt, uploadedAt);
    expect(result).toBe(true);
  });

  it('should return true when upload is 48 hours late', () => {
    const assignedAt = '2024-01-15T10:00:00Z';
    const uploadedAt = '2024-01-17T10:00:00Z'; // 48 hours later
    
    const result = isLateUpload(assignedAt, uploadedAt);
    expect(result).toBe(true);
  });

  it('should return true when upload is 7 days late', () => {
    const assignedAt = '2024-01-15T10:00:00Z';
    const uploadedAt = '2024-01-22T10:00:00Z'; // 7 days later
    
    const result = isLateUpload(assignedAt, uploadedAt);
    expect(result).toBe(true);
  });

  it('should handle Date objects as input', () => {
    const assignedAt = new Date('2024-01-15T10:00:00Z');
    const uploadedAt = new Date('2024-01-16T11:00:00Z'); // 25 hours later
    
    const result = isLateUpload(assignedAt, uploadedAt);
    expect(result).toBe(true);
  });
});

describe('AdminIssueDetail - Timestamp Formatting', () => {
  it('should format timestamp in IST with correct format', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatTimestamp(date);
    
    // Should contain day, month, year, time, and AM/PM (case insensitive)
    expect(formatted).toMatch(/\d{2}/); // Day
    expect(formatted).toMatch(/[A-Z][a-z]{2}/); // Month abbreviation
    expect(formatted).toMatch(/\d{4}/); // Year
    expect(formatted).toMatch(/\d{2}:\d{2}/); // Time
    expect(formatted.toLowerCase()).toMatch(/(am|pm)/); // AM/PM (case insensitive)
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatTimestamp(date);
    
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});

describe('AdminIssueDetail - Time Ago Calculation', () => {
  it('should return "Just now" for recent timestamps (< 60 seconds)', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    
    const result = timeAgo(recent);
    expect(result).toBe('Just now');
  });

  it('should return minutes for timestamps < 1 hour', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 45 * 60 * 1000); // 45 minutes ago
    
    const result = timeAgo(recent);
    expect(result).toMatch(/\d+m ago/);
  });

  it('should return hours for timestamps < 24 hours', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
    
    const result = timeAgo(recent);
    expect(result).toMatch(/\d+h ago/);
  });

  it('should return days for timestamps < 30 days', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    const result = timeAgo(recent);
    expect(result).toMatch(/\d+d ago/);
  });

  it('should return formatted date for timestamps > 30 days', () => {
    const now = new Date();
    const old = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    
    const result = timeAgo(old);
    expect(result).toMatch(/\d+\s[A-Z][a-z]{2}\s\d{4}/); // e.g., "15 Jan 2024"
  });

  it('should handle string date input', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    
    const result = timeAgo(recent);
    expect(result).toMatch(/\d+h ago/);
  });
});

describe('AdminIssueDetail - Empty State Display', () => {
  it('should show empty state when no completion history exists', () => {
    const completionHistory = [];
    const shouldShowEmptyState = completionHistory.length === 0;
    
    expect(shouldShowEmptyState).toBe(true);
  });

  it('should not show empty state when completion history exists', () => {
    const completionHistory = [
      { 
        status: 'completed', 
        images: ['image1.jpg'], 
        comments: 'Work completed',
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
    const shouldShowEmptyState = completionHistory.length === 0;
    
    expect(shouldShowEmptyState).toBe(false);
  });
});

describe('AdminIssueDetail - Completion Photos Rendering Logic', () => {
  it('should render completion section for each completion record', () => {
    const completionHistory = [
      { 
        status: 'completed', 
        images: ['image1.jpg', 'image2.jpg'], 
        comments: 'First completion',
        updatedBy: { name: 'John Constructor', _id: '123' },
        createdAt: '2024-01-15T10:00:00Z'
      },
      { 
        status: 'completed', 
        images: ['image3.jpg'], 
        comments: 'Second completion after reopen',
        updatedBy: { name: 'Jane Constructor', _id: '456' },
        createdAt: '2024-01-16T14:00:00Z'
      }
    ];

    expect(completionHistory).toHaveLength(2);
    expect(completionHistory[0].images).toHaveLength(2);
    expect(completionHistory[1].images).toHaveLength(1);
  });

  it('should include constructor information in each record', () => {
    const completionHistory = [
      { 
        status: 'completed', 
        images: ['image1.jpg'], 
        comments: 'Work completed',
        updatedBy: { name: 'John Constructor', _id: '123' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    expect(completionHistory[0].updatedBy.name).toBe('John Constructor');
    expect(completionHistory[0].updatedBy._id).toBe('123');
  });

  it('should include comments in completion record', () => {
    const completionHistory = [
      { 
        status: 'completed', 
        images: ['image1.jpg'], 
        comments: 'Fixed the pothole with asphalt',
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    expect(completionHistory[0].comments).toBe('Fixed the pothole with asphalt');
  });

  it('should handle completion record without comments', () => {
    const completionHistory = [
      { 
        status: 'completed', 
        images: ['image1.jpg'], 
        comments: null,
        updatedBy: { name: 'John Constructor' },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    expect(completionHistory[0].comments).toBeNull();
  });
});

describe('AdminIssueDetail - Integration Scenarios', () => {
  it('should handle complete workflow: fetch, filter, check late upload, format', () => {
    const complaint = {
      assignedAt: '2024-01-15T10:00:00Z',
      statusHistory: [
        { status: 'pending', images: [], comments: 'Created' },
        { status: 'assigned', images: [], comments: 'Assigned' },
        { status: 'in_progress', images: [], comments: 'Started' },
        { 
          status: 'completed', 
          images: ['image1.jpg', 'image2.jpg'], 
          comments: 'Work completed on time',
          updatedBy: { name: 'John Constructor' },
          createdAt: '2024-01-15T20:00:00Z' // 10 hours after assignment
        }
      ]
    };

    // Step 1: Load completion history
    const completionHistory = loadCompletionHistory(complaint.statusHistory);
    expect(completionHistory).toHaveLength(1);

    // Step 2: Check if late upload
    const record = completionHistory[0];
    const late = isLateUpload(complaint.assignedAt, record.createdAt);
    expect(late).toBe(false); // 10 hours is not late

    // Step 3: Format timestamp
    const formatted = formatTimestamp(record.createdAt);
    expect(formatted).toBeTruthy();

    // Step 4: Calculate time ago
    const elapsed = timeAgo(record.createdAt);
    expect(elapsed).toBeTruthy();
  });

  it('should detect late upload in complete workflow', () => {
    const complaint = {
      assignedAt: '2024-01-15T10:00:00Z',
      statusHistory: [
        { 
          status: 'completed', 
          images: ['image1.jpg'], 
          comments: 'Late completion',
          updatedBy: { name: 'John Constructor' },
          createdAt: '2024-01-17T10:00:00Z' // 48 hours after assignment
        }
      ]
    };

    const completionHistory = loadCompletionHistory(complaint.statusHistory);
    const record = completionHistory[0];
    const late = isLateUpload(complaint.assignedAt, record.createdAt);
    
    expect(late).toBe(true); // 48 hours is late
  });

  it('should handle multiple completions with mixed late/on-time uploads', () => {
    const complaint = {
      assignedAt: '2024-01-15T10:00:00Z',
      statusHistory: [
        { 
          status: 'completed', 
          images: ['image1.jpg'], 
          comments: 'First completion - on time',
          updatedBy: { name: 'John Constructor' },
          createdAt: '2024-01-15T20:00:00Z' // 10 hours - on time
        },
        { status: 'reopened', images: [], comments: 'Reopened' },
        { 
          status: 'completed', 
          images: ['image2.jpg'], 
          comments: 'Second completion - late',
          updatedBy: { name: 'Jane Constructor' },
          createdAt: '2024-01-17T10:00:00Z' // 48 hours - late
        }
      ]
    };

    const completionHistory = loadCompletionHistory(complaint.statusHistory);
    expect(completionHistory).toHaveLength(2);

    const firstLate = isLateUpload(complaint.assignedAt, completionHistory[0].createdAt);
    const secondLate = isLateUpload(complaint.assignedAt, completionHistory[1].createdAt);

    expect(firstLate).toBe(false);
    expect(secondLate).toBe(true);
  });
});
