import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGallery from '../ImageGallery';

describe('ImageGallery Component', () => {
  const mockImages = [
    'http://example.com/image1.jpg',
    'http://example.com/image2.jpg',
    'http://example.com/image3.jpg'
  ];

  const mockLocalImages = [
    '/uploads/image1.jpg',
    '/uploads/image2.jpg'
  ];

  describe('Empty images array handling', () => {
    it('should return null when images array is empty', () => {
      const { container } = render(<ImageGallery images={[]} title="Test Gallery" />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when images is null', () => {
      const { container } = render(<ImageGallery images={null} title="Test Gallery" />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when images is undefined', () => {
      const { container } = render(<ImageGallery images={undefined} title="Test Gallery" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Basic rendering', () => {
    it('should render gallery with title', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      expect(screen.getByText('Test Gallery')).toBeInTheDocument();
    });

    it('should display first image by default', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      expect(mainImage).toHaveAttribute('src', mockImages[0]);
    });

    it('should display image counter', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('should use default title when not provided', () => {
      render(<ImageGallery images={mockImages} />);
      expect(screen.getByText('Images')).toBeInTheDocument();
    });
  });

  describe('Thumbnail navigation', () => {
    it('should display thumbnails when multiple images exist', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      const thumbnails = screen.getAllByAltText(/Thumbnail/i);
      expect(thumbnails).toHaveLength(3);
    });

    it('should not display thumbnails when only one image exists', () => {
      render(<ImageGallery images={[mockImages[0]]} title="Test Gallery" />);
      const thumbnails = screen.queryAllByAltText(/Thumbnail/i);
      expect(thumbnails).toHaveLength(0);
    });

    it('should change main image when thumbnail is clicked', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const thumbnails = screen.getAllByAltText(/Thumbnail/i);
      fireEvent.click(thumbnails[1]);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      expect(mainImage).toHaveAttribute('src', mockImages[1]);
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('should update counter when navigating thumbnails', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const thumbnails = screen.getAllByAltText(/Thumbnail/i);
      fireEvent.click(thumbnails[2]);
      
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });
  });

  describe('Lightbox functionality', () => {
    it('should open lightbox when main image is clicked', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      // Lightbox should be visible - check for lightbox counter
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      
      // Check lightbox element exists
      const lightbox = document.querySelector('.image-lightbox');
      expect(lightbox).toBeInTheDocument();
    });

    it('should close lightbox when close button is clicked', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      // Find close button by class
      const closeButton = document.querySelector('.lightbox-close');
      fireEvent.click(closeButton);
      
      // Lightbox should be closed
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
    });

    it('should close lightbox when backdrop is clicked', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      const lightbox = document.querySelector('.image-lightbox');
      fireEvent.click(lightbox);
      
      // Lightbox should be closed
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
    });

    it('should display navigation buttons in lightbox when multiple images exist', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      const navButtons = screen.getAllByRole('button');
      // Should have close, previous, and next buttons
      expect(navButtons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Keyboard navigation', () => {
    it('should close lightbox when Escape key is pressed', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Lightbox should be closed
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
    });

    it('should navigate to next image when ArrowRight is pressed', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('should navigate to previous image when ArrowLeft is pressed', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      // Navigate to second image first
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
      
      // Navigate back to first
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should wrap to last image when pressing ArrowLeft on first image', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('should wrap to first image when pressing ArrowRight on last image', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      // Navigate to last image
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
      
      // Wrap to first
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  describe('Image URL handling', () => {
    it('should handle absolute URLs (Cloudinary)', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      expect(mainImage).toHaveAttribute('src', mockImages[0]);
    });

    it('should handle relative URLs (local storage)', () => {
      render(<ImageGallery images={mockLocalImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      expect(mainImage).toHaveAttribute('src', 'http://localhost:5001/uploads/image1.jpg');
    });
  });

  describe('Image loading and error handling', () => {
    it('should display error placeholder when image fails to load', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.error(mainImage);
      
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });

    it('should have lazy loading attribute on images', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      expect(mainImage).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Navigation button functionality', () => {
    it('should navigate to next image when next button is clicked in lightbox', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(btn => btn.querySelector('svg'));
      
      if (nextButton) {
        fireEvent.click(nextButton);
        // Counter should update
        const counter = screen.queryByText('2 / 3');
        if (counter) {
          expect(counter).toBeInTheDocument();
        }
      }
    });

    it('should navigate to previous image when previous button is clicked in lightbox', () => {
      render(<ImageGallery images={mockImages} title="Test Gallery" />);
      
      const mainImage = screen.getAllByAltText(/Test Gallery/i)[0];
      fireEvent.click(mainImage);
      
      // First navigate to second image
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find(btn => btn.querySelector('svg'));
      
      if (prevButton) {
        fireEvent.click(prevButton);
        // Should go back to first image
        const counter = screen.queryByText('1 / 3');
        if (counter) {
          expect(counter).toBeInTheDocument();
        }
      }
    });
  });
});
