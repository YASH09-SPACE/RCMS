import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Filter, X, List, Map as MapIcon } from 'lucide-react';
import { MOCK_ISSUES } from '../../api/mockData';
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatRelativeTime } from '../../utils/helpers';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_COLORS = {
  PENDING: '#B56A10',
  UNDER_REVIEW: '#1E4DB7',
  IN_PROGRESS: '#6C8AFF',
  RESOLVED: '#1A7A4A',
  CLOSED: '#8A8A84',
};

const createIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const PublicMap = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [filters, setFilters] = useState({ category: '', status: '', ward: '' });

  const filteredIssues = useMemo(() => {
    return MOCK_ISSUES.filter(issue => {
      if (filters.category && issue.category !== filters.category) return false;
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.ward && issue.ward !== filters.ward) return false;
      return true;
    });
  }, [filters]);

  const clearFilters = () => setFilters({ category: '', status: '', ward: '' });
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Public Issue Map</h1>
          <p className="text-sm text-muted">{filteredIssues.length} issues displayed</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={viewMode === 'map' ? List : MapIcon}
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? 'List' : 'Map'}
          </Button>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">Filters</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary-500 hover:text-primary-600">
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select className="input-base text-sm" value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="">All Categories</option>
                <option value="POTHOLE">Pothole</option>
                <option value="STREETLIGHT">Streetlight</option>
                <option value="DRAIN">Drain</option>
                <option value="ROAD_CRACK">Road Crack</option>
                <option value="SIGNAGE">Signage</option>
                <option value="OTHER">Other</option>
              </select>
              <select className="input-base text-sm" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select className="input-base text-sm" value={filters.ward} onChange={(e) => setFilters(f => ({ ...f, ward: e.target.value }))}>
                <option value="">All Wards</option>
                {[...new Set(MOCK_ISSUES.map(i => i.ward))].sort().map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Map View */}
      {viewMode === 'map' ? (
        <div className="rounded-2xl overflow-hidden border border-border shadow-soft" style={{ height: 'calc(100vh - 240px)', minHeight: '400px' }}>
          <MapContainer
            center={[23.0325, 72.5600]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredIssues.map(issue => (
              <Marker
                key={issue.id}
                position={[issue.latitude, issue.longitude]}
                icon={createIcon(STATUS_COLORS[issue.status] || '#888')}
              >
                <Popup>
                  <div style={{ minWidth: '200px', fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#888' }}>{issue.id}</span>
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', lineHeight: 1.3 }}>{issue.title}</h3>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px' }}>{issue.address}</p>
                    <button
                      onClick={() => navigate(`/citizen/issues/${issue.id}`)}
                      style={{ fontSize: '12px', color: '#1E4DB7', cursor: 'pointer', border: 'none', background: 'none', padding: 0, fontWeight: 600 }}
                    >
                      View Details →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredIssues.map(issue => (
            <Card key={issue.id} hover onClick={() => navigate(`/citizen/issues/${issue.id}`)}>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[issue.status] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={issue.category} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate">{issue.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{issue.address} · {formatRelativeTime(issue.createdAt)}</p>
                </div>
                <span className="text-xs text-subtle">👍 {issue.upvoteCount}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicMap;
