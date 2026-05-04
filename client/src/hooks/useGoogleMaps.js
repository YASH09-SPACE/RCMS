import { useState, useEffect } from 'react';

/**
 * Custom hook to check if Google Maps is loaded
 * Handles async loading with proper callback
 * @returns {boolean} isLoaded - Whether Google Maps API is ready
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log('✓ Google Maps already loaded');
      setIsLoaded(true);
      return;
    }

    // Create a global callback for Google Maps
    const originalCallback = window.initGoogleMapsCallback;
    window.initGoogleMapsCallback = () => {
      console.log('✓ Google Maps loaded via callback');
      if (originalCallback) originalCallback();
      setIsLoaded(true);
    };

    // Poll for Google Maps (in case callback doesn't fire)
    let attempts = 0;
    const maxAttempts = 300; // 30 seconds (100ms * 300)

    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.google && window.google.maps && window.google.maps.Map) {
        console.log('✓ Google Maps loaded after', attempts * 100, 'ms');
        setIsLoaded(true);
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.error('✗ Google Maps failed to load after 30 seconds');
        console.error('Possible issues:');
        console.error('1. Check internet connection');
        console.error('2. Check browser console for API key errors');
        console.error('3. Verify APIs are enabled in Google Cloud Console');
        console.error('4. Check if script tag is present in index.html');
        clearInterval(checkInterval);
      } else if (attempts % 10 === 0) {
        // Log every second
        console.log('Waiting for Google Maps...', attempts / 10, 'seconds');
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      // Restore original callback if it existed
      if (originalCallback) {
        window.initGoogleMapsCallback = originalCallback;
      }
    };
  }, []);

  return isLoaded;
};
