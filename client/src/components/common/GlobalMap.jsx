import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Loader2, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const centerGujarat = [22.2587, 71.1924];

const GlobalMap = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchMapPoints();
  }, [user]);

  const fetchMapPoints = async () => {
    setLoading(true);
    try {
      // Logic for Endpoint Determination
      let endpoint = '/location/heatmap'; // Public access for Guests/Citizens
      
      if (isAuthenticated && user?.role === 'admin') {
        endpoint = '/admin/heatmap'; // Secure limited scope
      } else if (isAuthenticated && user?.role === 'constructor') {
        endpoint = '/constructor/heatmap'; // Secure limited scope
      } else if (isAuthenticated && user?.role === 'super_admin') {
        endpoint = '/superadmin/heatmap'; // System wide
      }

      const res = await API.get(endpoint);
      if (res.data?.success) {
        setPoints(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load live map data');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Locating...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        toast.dismiss('geo');
        toast.success('Location found! Showing nearby issues.');
      },
      (error) => {
        toast.dismiss('geo');
        toast.error('Unable to retrieve your location');
      }
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'; 
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#8b5cf6';
    }
  };

  const createCustomIcon = (priority) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${getPriorityColor(priority)}" width="24" height="24">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 4.5 12 4.5 15.5 6.07 15.5 8 13.93 11.5 12 11.5z"/>
      </svg>
    `;
    const url = `data:image/svg+xml;base64,${btoa(svg)}`;
    return new L.Icon({
        iconUrl: url,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
    });
  };

  // Component to re-center map when user location is found
  const MapCenterer = () => {
    const map = useMap();
    useEffect(() => {
      if (userLocation) {
        map.flyTo(userLocation, 13);
      }
    }, [userLocation, map]);
    return null;
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapIcon size={20} color="var(--primary)" /> Live Issue Heatmap
        </h2>
        {(!isAuthenticated || user?.role === 'citizen') && (
          <button onClick={requestLocation} className="c-btn c-btn-outline" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={14} /> Detect Nearby
          </button>
        )}
      </div>

      <div style={{ height: '500px', width: '100%', position: 'relative' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="spinner" size={32} color="var(--primary)" />
          </div>
        ) : (
          <MapContainer center={centerGujarat} zoom={7} style={{ height: '100%', width: '100%' }}>
            {theme === 'dark' ? (
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">Carto</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            
            <MapCenterer />

            {/* Render User Location Marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup><strong>You are here</strong></Popup>
              </Marker>
            )}

            {/* Render Issues */}
            {points.map(p => (p.latitude && p.longitude) && (
              <Marker key={p._id} position={[p.latitude, p.longitude]} icon={createCustomIcon(p.priority)}>
                <Popup>
                  <div style={{ fontWeight: 'bold' }}>{p.title || 'Reported Issue'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Status: {p.status?.replace('_', ' ')}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Priority: {p.priority}</div>
                  <div style={{ marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <button 
                      onClick={() => navigate(isAuthenticated ? '/citizen/raise-complaint' : '/login?redirect=/citizen/raise-complaint')}
                      style={{ 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '4px 8px', 
                        fontSize: '11px', 
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      {isAuthenticated ? 'View/Report Similar' : 'Login to Report'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px', padding: '16px', background: 'var(--bg-muted)' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }} /> High</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }} /> Medium</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }} /> Low</div>
      </div>
    </div>
  );
};

export default GlobalMap;
