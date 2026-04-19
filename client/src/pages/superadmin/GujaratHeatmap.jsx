import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

const GujaratHeatmap = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gujarat geographic center
  const center = [22.2587, 71.1924];

  useEffect(() => {
    fetchHeatmapPoints();
  }, []);

  const fetchHeatmapPoints = async () => {
    try {
      const res = await superAdminService.getHeatmap();
      if (res.success) {
        setPoints(res.data);
      }
    } catch (err) {
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'; 
      case 'medium': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const createCustomIcon = (priority) => {
    // Generate a custom SVG pin
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

  return (
    <SuperAdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapIcon /> Gujarat Density Heatmap
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-world geographic distribution of all currently active unresolved petitions.</p>
      </div>

      <div style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}>
            <Loader2 className="spinner" size={32} color="var(--primary)" />
          </div>
        ) : (
          <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map(p => (
              <Marker key={p._id} position={[p.latitude, p.longitude]} icon={createCustomIcon(p.priority)}>
                <Popup>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Priority: {p.priority.toUpperCase()}</div>
                  <div>Status: {p.status}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }} /> High Priority</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }} /> Medium Priority</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }} /> Low Priority</div>
      </div>
    </SuperAdminLayout>
  );
};

export default GujaratHeatmap;
