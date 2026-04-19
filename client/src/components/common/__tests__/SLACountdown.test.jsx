import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SLACountdown from '../SLACountdown';

describe('SLACountdown Component', () => {
  let RealDate;

  beforeEach(() => {
    // Save the real Date
    RealDate = global.Date;
  });

  afterEach(() => {
    // Restore the real Date
    global.Date = RealDate;
  });

  const mockDate = (isoDate) => {
    const mockNow = new RealDate(isoDate);
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return mockNow;
        }
        return new RealDate(...args);
      }
      static now() {
        return mockNow.getTime();
      }
    };
  };

  describe('Null slaDueDate handling', () => {
    it('should return null when slaDueDate is null', () => {
      const { container } = render(
        <SLACountdown slaDueDate={null} isSlaBreached={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should return null when slaDueDate is undefined', () => {
      const { container } = render(
        <SLACountdown slaDueDate={undefined} isSlaBreached={false} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Safe status rendering (>24h remaining)', () => {
    it('should display safe status with green styling when more than 24 hours remain', () => {
      // Mock Date to return a fixed time
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: Jan 3, 2024, 12:00 PM (48 hours later)
      const slaDueDate = new Date('2024-01-03T12:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      // Check that countdown is displayed
      const countdown = screen.getByText(/48h 0m remaining/i);
      expect(countdown).toBeInTheDocument();

      // Check for safe status styling
      const container = countdown.closest('div');
      expect(container).toHaveStyle({
        background: 'var(--success-bg)',
        color: 'var(--success)'
      });
    });

    it('should display safe status when exactly 25 hours remain', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: 25 hours later
      const slaDueDate = new Date('2024-01-02T13:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/25h 0m remaining/i);
      expect(countdown).toBeInTheDocument();

      const container = countdown.closest('div');
      expect(container).toHaveStyle({
        background: 'var(--success-bg)',
        color: 'var(--success)'
      });
    });
  });

  describe('Warning status rendering (<24h remaining)', () => {
    it('should display warning status with yellow styling when less than 24 hours remain', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: 12 hours later
      const slaDueDate = new Date('2024-01-02T00:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/12h 0m remaining/i);
      expect(countdown).toBeInTheDocument();

      // Check for warning styling
      const container = countdown.closest('div');
      expect(container).toHaveStyle({
        background: 'var(--warning-bg)',
        color: 'var(--warning)'
      });
    });

    it('should display warning status when 23 hours remain', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: 23 hours later
      const slaDueDate = new Date('2024-01-02T11:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/23h 0m remaining/i);
      expect(countdown).toBeInTheDocument();

      const container = countdown.closest('div');
      expect(container).toHaveStyle({
        background: 'var(--warning-bg)',
        color: 'var(--warning)'
      });
    });

    it('should display warning status with minutes when 2 hours 30 minutes remain', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: 2 hours 30 minutes later
      const slaDueDate = new Date('2024-01-01T14:30:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/2h 30m remaining/i);
      expect(countdown).toBeInTheDocument();
    });
  });

  describe('Breached status rendering', () => {
    it('should display breached status when isSlaBreached is true', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date in the past
      const slaDueDate = new Date('2024-01-01T10:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={true} />);

      const breachedText = screen.getByText(/SLA BREACHED/i);
      expect(breachedText).toBeInTheDocument();

      // Check for error styling
      const container = breachedText.closest('div');
      expect(container).toHaveStyle({
        background: 'var(--error-bg)',
        color: 'var(--error)'
      });
    });

    it('should display breached status when slaDueDate is in the past', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date 2 hours ago
      const slaDueDate = new Date('2024-01-01T10:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const breachedText = screen.getByText(/SLA BREACHED/i);
      expect(breachedText).toBeInTheDocument();
    });

    it('should display breached status when slaDueDate equals current time', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date exactly now
      const slaDueDate = new Date('2024-01-01T12:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const breachedText = screen.getByText(/SLA BREACHED/i);
      expect(breachedText).toBeInTheDocument();
    });
  });

  describe('Size prop handling', () => {
    it('should apply small size styling when size="small"', () => {
      mockDate('2024-01-01T12:00:00Z');

      const slaDueDate = new Date('2024-01-02T12:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} size="small" />);

      const countdown = screen.getByText(/24h 0m remaining/i);
      const container = countdown.closest('div');

      expect(container).toHaveStyle({
        gap: '4px',
        padding: '4px 8px',
        fontSize: '12px'
      });
    });

    it('should apply medium size styling by default', () => {
      mockDate('2024-01-01T12:00:00Z');

      const slaDueDate = new Date('2024-01-02T12:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/24h 0m remaining/i);
      const container = countdown.closest('div');

      expect(container).toHaveStyle({
        gap: '6px',
        padding: '6px 12px',
        fontSize: '13px'
      });
    });
  });

  describe('Time calculation accuracy', () => {
    it('should correctly calculate hours and minutes', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: 5 hours 45 minutes later
      const slaDueDate = new Date('2024-01-01T17:45:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/5h 45m remaining/i);
      expect(countdown).toBeInTheDocument();
    });

    it('should handle edge case of 0 minutes remaining', () => {
      mockDate('2024-01-01T12:00:00Z');

      // SLA due date: exactly 3 hours later
      const slaDueDate = new Date('2024-01-01T15:00:00Z').toISOString();

      render(<SLACountdown slaDueDate={slaDueDate} isSlaBreached={false} />);

      const countdown = screen.getByText(/3h 0m remaining/i);
      expect(countdown).toBeInTheDocument();
    });
  });
});
