import { useState, useEffect, useRef } from 'react';
import { Crosshair, Search, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const GoogleMapPicker = ({ onSelectLocation, initialCenter = { lat: 22.2587, lng: 71.1924 } }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const isLoaded = useGoogleMaps();
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded) {
      console.log('GoogleMapPicker: Waiting for Google Maps to load...');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('GoogleMapPicker: Map already initialized');
      return;
    }

    // Wait for ref to be ready with a small delay
    const initMap = () => {
      if (!mapRef.current) {
        console.log('GoogleMapPicker: Map ref not ready, retrying...');
        setTimeout(initMap, 100);
        return;
      }

      console.log('GoogleMapPicker: Initializing map...');
      console.log('GoogleMapPicker: window.google =', window.google);
      console.log('GoogleMapPicker: window.google.maps =', window.google?.maps);
      console.log('GoogleMapPicker: mapRef dimensions =', {
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
        display: window.getComputedStyle(mapRef.current).display
      });

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 7,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapId: 'roadcare-picker-map', // Add map ID for better rendering
          styles: [], // Can add custom styles for light/dark theme
        });

        mapInstanceRef.current = map;

        // Add click listener to map
        map.addListener('click', (e) => {
          handleMapClick(e.latLng);
        });

        // Initialize Autocomplete
        if (searchInputRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'in' }, // Restrict to India
            fields: ['geometry', 'formatted_address', 'address_components'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              const location = place.geometry.location;
              handleMapClick(location);
              map.setCenter(location);
              map.setZoom(15);
            }
          });

          autocompleteRef.current = autocomplete;
        }

        // Force a resize after initialization to ensure proper rendering
        setTimeout(() => {
          window.google.maps.event.trigger(map, 'resize');
          map.setCenter(initialCenter);
        }, 100);

        console.log('✓ Google Map Picker initialized successfully');
      } catch (error) {
        console.error('✗ Error initializing Google Map Picker:', error);
        setMapError('Failed to initialize map: ' + error.message);
        toast.error('Failed to initialize map');
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    setTimeout(initMap, 50);
  }, [isLoaded]);

  const handleMapClick = async (latLng) => {
    const lat = latLng.lat();
    const lng = latLng.lng();

    setSelectedPosition({ lat, lng });

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition(latLng);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: latLng,
        map: mapInstanceRef.current,
        title: 'Selected Location',
        animation: window.google.maps.Animation.DROP,
      });
    }

    // Reverse geocode to get address and pincode
    await reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const addressComponents = result.address_components;
        
        // Extract pincode
        const postalCode = addressComponents.find(comp => 
          comp.types.includes('postal_code')
        );
        
        // Extract state to validate Gujarat
        const state = addressComponents.find(comp => 
          comp.types.includes('administrative_area_level_1')
        );

        // Validate location is in Gujarat
        if (state && !state.long_name.toLowerCase().includes('gujarat')) {
          toast.error('Please select a location within Gujarat state');
          setIsGeocoding(false);
          return;
        }

        const extractedPincode = postalCode ? postalCode.long_name : '';
        const formattedAddress = result.formatted_address;

        setAddress(formattedAddress);
        setPincode(extractedPincode);

        // Call parent callback with location data
        onSelectLocation({
          latitude: lat,
          longitude: lng,
          address: formattedAddress,
          pincode: extractedPincode,
          addressComponents: addressComponents,
        });

        toast.success('Location selected successfully');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to get address for this location');
    } finally {
      setIsGeocoding(false);
    }
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Finding your location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLng = new window.google.maps.LatLng(latitude, longitude);
        
        handleMapClick(latLng);
        mapInstanceRef.current.setCenter(latLng);
        mapInstanceRef.current.setZoom(15);
        
        toast.dismiss('geo');
        toast.success('Location found!');
      },
      (error) => {
        toast.dismiss('geo');
        toast.error('Could not fetch GPS location. Please click on the map or search.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchByPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsGeocoding(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ 
        address: pincode,
        componentRestrictions: { country: 'IN', administrativeArea: 'Gujarat' }
      });

      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        handleMapClick(location);
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(13);
      } else {
        toast.error('Pincode not found in Gujarat');
      }
    } catch (error) {
      console.error('Pincode search error:', error);
      toast.error('Failed to search by pincode');
    } finally {
      setIsGeocoding(false);
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ 
        width: '100%', 
        height: '450px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spinner" size={32} color="var(--primary)" />
          <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Loading Google Maps...
          </div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
            This may take a few seconds
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '450px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--error-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--error)',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--error)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            Map Loading Error
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            {mapError}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Search and Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Address Search */}
        <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search address or landmark..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Pincode Search */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={(e) => e.key === 'Enter' && searchByPincode()}
            style={{
              width: '120px',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
          <button
            type="button"
            onClick={searchByPincode}
            disabled={isGeocoding}
            style={{
              padding: '10px 16px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MapPin size={16} /> Go
          </button>
        </div>

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={locateUser}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Crosshair size={16} /> Use My Location
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          background: '#e5e3df',
          position: 'relative',
          minHeight: '400px', // Ensure minimum height
          display: 'block', // Ensure block display
        }}
      />

      {/* Selected Location Info */}
      {selectedPosition && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--success-bg)',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
            ✓ Location Selected
          </div>
          {address && (
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <strong>Address:</strong> {address}
            </div>
          )}
          {pincode && (
            <div style={{ color: 'var(--text-secondary)' }}>
              <strong>Pincode:</strong> {pincode}
            </div>
          )}
          {isGeocoding && (
            <div style={{ color: 'var(--primary)', marginTop: '4px' }}>
              Fetching ward information...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;
