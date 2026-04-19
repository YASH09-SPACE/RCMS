import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images = [], title = 'Images' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  // Return null if no images
  if (!images || images.length === 0) return null;

  const getImageUrl = (url) => {
    if (!url) return '';
    // Handle absolute URLs (Cloudinary)
    if (url.startsWith('http')) return url;
    // Handle relative URLs (local storage)
    return `http://localhost:5001${url}`;
  };

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
  };

  const handleMainImageClick = () => {
    setLightboxOpen(true);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') handlePrevious(e);
    if (e.key === 'ArrowRight') handleNext(e);
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  // Touch gesture support for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext({ stopPropagation: () => {} });
    }
    if (isRightSwipe) {
      handlePrevious({ stopPropagation: () => {} });
    }
  };

  // Add keyboard listener when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, selectedIndex, images.length]);

  return (
    <div className="image-gallery">
      <h3 className="image-gallery-title">{title}</h3>
      
      {/* Main Image Display */}
      <div 
        className="image-gallery-main"
        onClick={handleMainImageClick}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {imageLoading[selectedIndex] && (
          <div className="image-loading-spinner">Loading...</div>
        )}
        {imageErrors[selectedIndex] ? (
          <div className="image-error-placeholder">
            <span>Failed to load image</span>
          </div>
        ) : (
          <img
            src={getImageUrl(images[selectedIndex])}
            alt={`${title} ${selectedIndex + 1}`}
            onError={() => handleImageError(selectedIndex)}
            onLoad={() => handleImageLoad(selectedIndex)}
            loading="lazy"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)'
            }}
          />
        )}
        <div className="image-counter">
          {selectedIndex + 1} of {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="image-gallery-thumbnails">
          {images.map((img, index) => (
            <div
              key={index}
              className={`image-thumbnail ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
              style={{
                cursor: 'pointer',
                opacity: index === selectedIndex ? 1 : 0.6,
                border: index === selectedIndex ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                width: '80px',
                height: '80px'
              }}
            >
              <img
                src={getImageUrl(img)}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="image-lightbox"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          tabIndex={0}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Close Button */}
          <button
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={handlePrevious}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Main Lightbox Image */}
          <img
            src={getImageUrl(images[selectedIndex])}
            alt={`${title} ${selectedIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />

          {/* Next Button */}
          {images.length > 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Image Counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px'
            }}
          >
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
