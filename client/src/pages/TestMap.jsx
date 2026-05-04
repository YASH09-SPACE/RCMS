import { useEffect, useRef, useState } from 'react';

const TestMap = () => {
  const mapRef = useRef(null);
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('=== TestMap Component Mounted ===');
    console.log('1. window.google exists?', !!window.google);
    console.log('2. window.google.maps exists?', !!window.google?.maps);
    console.log('3. mapRef.current exists?', !!mapRef.current);

    // Wait a bit for Google Maps to load
    const timer = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        setStatus('Google Maps NOT loaded');
        setError('window.google.maps is undefined');
        console.error('✗ Google Maps not available');
        return;
      }

      setStatus('Google Maps loaded! Initializing...');
      console.log('✓ Google Maps available, initializing map...');

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
          zoom: 10,
        });

        // Add a marker
        new window.google.maps.Marker({
          position: { lat: 23.0225, lng: 72.5714 },
          map: map,
          title: 'Ahmedabad',
        });

        setStatus('Map initialized successfully!');
        console.log('✓ Map created successfully');
      } catch (err) {
        setStatus('Error initializing map');
        setError(err.message);
        console.error('✗ Error creating map:', err);
      }
    }, 1000); // Wait 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Google Maps Test Page</h1>
      
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        background: error ? '#ffebee' : '#e8f5e9',
        border: `2px solid ${error ? '#f44336' : '#4caf50'}`,
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Status: {status}</h3>
        {error && <p style={{ color: '#d32f2f', margin: 0 }}>Error: {error}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>window.google exists: {window.google ? '✓ Yes' : '✗ No'}</li>
          <li>window.google.maps exists: {window.google?.maps ? '✓ Yes' : '✗ No'}</li>
          <li>Map container exists: {mapRef.current ? '✓ Yes' : '✗ No'}</li>
        </ul>
      </div>

      <div 
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          border: '2px solid #333',
          background: '#e0e0e0',
          borderRadius: '8px',
        }}
      />

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser console (F12)</li>
          <li>Look for messages starting with ===</li>
          <li>Check if you see ✓ or ✗ symbols</li>
          <li>If map doesn't show, copy console messages</li>
        </ol>
      </div>
    </div>
  );
};

export default TestMap;
