import { useState, useEffect } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

/**
 * Debug component to show Google Maps loading status
 * Add this to any page to see real-time Google Maps status
 * 
 * Usage:
 * import GoogleMapsDebug from './components/common/GoogleMapsDebug';
 * <GoogleMapsDebug />
 */
const GoogleMapsDebug = () => {
  const isLoaded = useGoogleMaps();
  const [status, setStatus] = useState({});

  useEffect(() => {
    const checkStatus = () => {
      setStatus({
        windowGoogle: !!window.google,
        googleMaps: !!window.google?.maps,
        googleMapsMap: !!window.google?.maps?.Map,
        googleMapsMarker: !!window.google?.maps?.Marker,
        googleMapsPlaces: !!window.google?.maps?.places,
        hookLoaded: isLoaded,
        timestamp: new Date().toLocaleTimeString(),
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  const getStatusIcon = (value) => (value ? '✅' : '❌');
  const getStatusColor = (value) => (value ? '#4caf50' : '#f44336');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>
        🗺️ Google Maps Debug
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>window.google:</span>
          <span style={{ color: getStatusColor(status.windowGoogle) }}>
            {getStatusIcon(status.windowGoogle)}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>google.maps:</span>
          <span style={{ color: getStatusColor(status.googleMaps) }}>
            {getStatusIcon(status.googleMaps)}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>google.maps.Map:</span>
          <span style={{ color: getStatusColor(status.googleMapsMap) }}>
            {getStatusIcon(status.googleMapsMap)}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>google.maps.Marker:</span>
          <span style={{ color: getStatusColor(status.googleMapsMarker) }}>
            {getStatusIcon(status.googleMapsMarker)}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>google.maps.places:</span>
          <span style={{ color: getStatusColor(status.googleMapsPlaces) }}>
            {getStatusIcon(status.googleMapsPlaces)}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
          <span>useGoogleMaps hook:</span>
          <span style={{ color: getStatusColor(status.hookLoaded) }}>
            {getStatusIcon(status.hookLoaded)}
          </span>
        </div>
        
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444', fontSize: '10px', color: '#999' }}>
          Last check: {status.timestamp}
        </div>
      </div>
      
      {status.hookLoaded && (
        <div style={{ marginTop: '12px', padding: '8px', background: '#4caf50', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
          ✓ Ready to use Google Maps
        </div>
      )}
      
      {!status.hookLoaded && status.windowGoogle && (
        <div style={{ marginTop: '12px', padding: '8px', background: '#ff9800', borderRadius: '4px', textAlign: 'center', fontSize: '11px' }}>
          ⏳ Loading...
        </div>
      )}
      
      {!status.windowGoogle && (
        <div style={{ marginTop: '12px', padding: '8px', background: '#f44336', borderRadius: '4px', textAlign: 'center', fontSize: '11px' }}>
          ⚠️ Google Maps not loaded
        </div>
      )}
    </div>
  );
};

export default GoogleMapsDebug;
