import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Crosshair } from 'lucide-react';

const LocationPickerMap = ({ onSelectLocation }) => {
  const [position, setPosition] = useState(null);
  
  // Default to somewhere near center Gujarat
  const [mapCenter, setMapCenter] = useState([22.2587, 71.1924]);
  const [mapZoom, setMapZoom] = useState(7);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>Issue Location</Popup>
      </Marker>
    );
  };

  const RecenterMap = () => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.flyTo(position, 15);
      }
    }, [position, map]);
    return null;
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not loaded');
      return;
    }
    toast.loading('Finding your location accurately...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = { lat: latitude, lng: longitude };
        setPosition(latlng);
        onSelectLocation(latitude, longitude);
        toast.dismiss('geo');
        toast.success('Location found!');
      },
      () => {
        toast.dismiss('geo');
        toast.error('Could not fetch GPS location. Please tap on the map.');
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <button 
        type="button" 
        onClick={locateUser} 
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        <Crosshair size={16} /> GPS Detect Location
      </button>

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        <RecenterMap />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
