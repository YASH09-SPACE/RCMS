import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, Loader2, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const centerGujarat = { lat: 22.2587, lng: 71.1924 };

const GoogleMapViewer = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  
  const isLoaded = useGoogleMaps();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded) {
      console.log('GoogleMapViewer: Waiting for Google Maps to load...');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('GoogleMapViewer: Map already initialized');
      return;
    }

    // Wait for ref to be ready with a small delay
    const initMap = () => {
      if (!mapRef.current) {
        console.log('GoogleMapViewer: Map ref not ready, retrying...');
        setTimeout(initMap, 100);
        return;
      }

      console.log('GoogleMapViewer: Initializing map...');
      console.log('GoogleMapViewer: window.google =', window.google);
      console.log('GoogleMapViewer: window.google.maps =', window.google?.maps);
      console.log('GoogleMapViewer: mapRef dimensions =', {
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
        display: window.getComputedStyle(mapRef.current).display
      });

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: centerGujarat,
          zoom: 7,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          mapId: 'roadcare-viewer-map', // Add map ID for better rendering
        });

        mapInstanceRef.current = map;
        
        // Force a resize after initialization to ensure proper rendering
        setTimeout(() => {
          window.google.maps.event.trigger(map, 'resize');
          map.setCenter(centerGujarat);
        }, 100);
        
        setMapInitialized(true);
        console.log('✓ Google Map Viewer initialized successfully');
      } catch (error) {
        console.error('✗ Error initializing Google Map Viewer:', error);
        setMapError('Failed to initialize map: ' + error.message);
        toast.error('Failed to initialize map');
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    setTimeout(initMap, 50);
  }, [isLoaded]);

  // Fetch map points when loaded
  useEffect(() => {
    if (isLoaded) {
      console.log('GoogleMapViewer: Fetching map points, user:', user?.role, 'authenticated:', isAuthenticated);
      fetchMapPoints();
    }
  }, [isLoaded, user, isAuthenticated]);

  // Update markers when points or filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) {
      console.log('GoogleMapViewer: Cannot update markers - map not ready');
      return;
    }

    // Apply status filter
    const getFilteredPoints = () => {
      if (statusFilter === 'all') return points;
      if (statusFilter === 'pending') return points.filter(p => ['pending', 'assigned'].includes(p.status));
      if (statusFilter === 'in_progress') return points.filter(p => p.status === 'in_progress');
      if (statusFilter === 'resolved') return points.filter(p => ['completed', 'closed'].includes(p.status));
      return points;
    };
    const filtered = getFilteredPoints();

    console.log('GoogleMapViewer: Updating markers, total:', points.length, 'filtered:', filtered.length, 'filter:', statusFilter);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    filtered.forEach((point, index) => {
      if (!point.latitude || !point.longitude) {
        return;
      }

      const markerColor = getMarkerColor(point);
      const marker = new window.google.maps.Marker({
        position: { lat: point.latitude, lng: point.longitude },
        map: mapInstanceRef.current,
        title: point.title || 'Reported Issue',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(point),
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    console.log('✓ GoogleMapViewer: Markers updated, total:', markersRef.current.length);
  }, [points, isLoaded, statusFilter, mapInitialized]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !window.google) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    userMarkerRef.current = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285f4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    mapInstanceRef.current.setCenter(userLocation);
    mapInstanceRef.current.setZoom(13);
  }, [userLocation, isLoaded]);

  const fetchMapPoints = async () => {
    setLoading(true);
    try {
      let endpoint = '/location/heatmap';
      
      if (isAuthenticated && user?.role === 'admin') {
        endpoint = '/admin/heatmap';
      } else if (isAuthenticated && user?.role === 'constructor') {
        endpoint = '/constructor/heatmap';
      } else if (isAuthenticated && user?.role === 'super_admin') {
        endpoint = '/superadmin/heatmap';
      }

      console.log('GoogleMapViewer: Fetching map data from:', endpoint);
      console.log('GoogleMapViewer: User role:', user?.role, 'Authenticated:', isAuthenticated);
      
      const res = await API.get(endpoint);
      console.log('GoogleMapViewer: API response:', res.data);
      
      if (res.data?.success) {
        console.log('✓ Map data loaded:', res.data.data.length, 'points');
        setPoints(res.data.data);
      } else {
        console.warn('⚠️ Map data response not successful:', res.data);
        setPoints([]); // Set empty array instead of failing
      }
    } catch (err) {
      console.error('✗ Failed to load map data:', err);
      console.error('✗ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      console.log('Map will display without markers');
      setPoints([]); // Set empty array so map still shows
      // Don't show error toast - map can work without data
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
        setUserLocation({ lat: latitude, lng: longitude });
        toast.dismiss('geo');
        toast.success('Location found! Showing nearby issues.');
      },
      (error) => {
        toast.dismiss('geo');
        toast.error('Unable to retrieve your location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#f97316'; // bright orange for unset priority
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f97316';    // orange
      case 'assigned': return '#3b82f6';   // blue
      case 'in_progress': return '#8b5cf6'; // purple
      case 'completed': return '#22c55e';  // green
      case 'reopened': return '#ef4444';   // red
      case 'escalated': return '#dc2626';  // dark red
      default: return '#f97316';
    }
  };

  // Use priority color if priority is set, otherwise fallback to status color
  const getMarkerColor = (point) => {
    if (point.priority) return getPriorityColor(point.priority);
    return getStatusColor(point.status);
  };

  const createInfoWindowContent = (point) => {
    const statusText = point.status?.replace('_', ' ') || 'Unknown';
    const priorityText = point.priority || 'N/A';
    
    return `
      <div style="padding: 8px; min-width: 200px;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #1a1a1a;">
          ${point.title || 'Reported Issue'}
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
          <strong>Status:</strong> ${statusText}
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
          <strong>Priority:</strong> ${priorityText}
        </div>
        <button 
          onclick="window.handleComplaintClick('${point._id}')"
          style="
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
          "
        >
          ${isAuthenticated ? 'View Details' : 'Login to Report'}
        </button>
      </div>
    `;
  };

  // Global handler for info window button clicks
  useEffect(() => {
    window.handleComplaintClick = (complaintId) => {
      if (isAuthenticated) {
        if (user?.role === 'admin' || user?.role === 'super_admin') {
          navigate(`/admin/complaints/${complaintId}`);
        } else if (user?.role === 'constructor') {
          navigate(`/constructor/tasks/${complaintId}`);
        } else {
          // Citizen role
          navigate(`/issue/${complaintId}`);
        }
      } else {
        // Unauthenticated users can also view public issue details
        navigate(`/issue/${complaintId}`);
      }
    };

    return () => {
      delete window.handleComplaintClick;
    };
  }, [isAuthenticated, user, navigate]);

  if (mapError) {
    return (
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '12px', 
        border: '1px solid var(--border)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <MapIcon size={20} color="var(--primary)" /> Live Issue Map
          </h2>
        </div>
        <div style={{ 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--error-bg)',
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
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '12px', 
        border: '1px solid var(--border)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <MapIcon size={20} color="var(--primary)" /> Live Issue Map
          </h2>
        </div>
        <div style={{ 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 className="spinner" size={32} color="var(--primary)" />
            <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {!isLoaded ? 'Loading Google Maps...' : 'Loading complaints...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      borderRadius: '12px', 
      border: '1px solid var(--border)', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 600, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <MapIcon size={20} color="var(--primary)" /> Live Issue Map
        </h2>
        {(!isAuthenticated || user?.role === 'citizen') && (
          <button 
            onClick={requestLocation} 
            className="c-btn c-btn-outline" 
            style={{ 
              padding: '6px 12px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            <Navigation size={14} /> Detect Nearby
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        padding: '8px 16px', 
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
        background: 'var(--bg-card)'
      }}>
        {[
          { key: 'all', label: 'All', color: '#4285f4' },
          { key: 'pending', label: 'Pending', color: '#f97316' },
          { key: 'in_progress', label: 'In Progress', color: '#8b5cf6' },
          { key: 'resolved', label: 'Resolved', color: '#22c55e' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 600,
              border: statusFilter === f.key ? `1.5px solid ${f.color}` : '1.5px solid var(--border)',
              background: statusFilter === f.key ? (f.color + '18') : 'transparent',
              color: statusFilter === f.key ? f.color : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          background: '#e5e3df',
          position: 'relative',
          minHeight: '500px', // Ensure minimum height
          display: 'block', // Ensure block display
        }}
      />


    </div>
  );
};

export default GoogleMapViewer;
