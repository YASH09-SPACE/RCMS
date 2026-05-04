import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, ArrowRight, Clock, Navigation,
  Loader2, AlertCircle, ChevronRight, Map as MapIcon
} from 'lucide-react';
import { complaintService, locationService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import CitizenLayout from '../../components/CitizenLayout';
import IssueCard from '../../components/common/IssueCard';

/* ─── Nearby mini-map component ──────────────────────────────── */
const NearbyMiniMap = ({ complaints, userLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const isLoaded = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    if (mapInstanceRef.current) return;
    try {
      const center = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : { lat: 22.2587, lng: 71.1924 };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: userLocation ? 11 : 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // User location marker (blue)
      if (userLocation) {
        new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10, fillColor: '#4285f4', fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 3,
          },
        });
      }
    } catch (e) {
      console.error('Mini-map init error:', e);
    }
  }, [isLoaded, userLocation]);

  // Add issue markers whenever complaints list changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    complaints.forEach(c => {
      if (!c.latitude || !c.longitude) return;
      const statusColor = {
        pending: '#f97316', assigned: '#3b82f6', in_progress: '#8b5cf6',
        completed: '#22c55e', closed: '#22c55e', reopened: '#ef4444',
      }[c.status] || '#f97316';
      const marker = new window.google.maps.Marker({
        position: { lat: c.latitude, lng: c.longitude },
        map: mapInstanceRef.current,
        title: c.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8, fillColor: statusColor, fillOpacity: 0.9,
          strokeColor: '#fff', strokeWeight: 2,
        },
      });
      const iw = new window.google.maps.InfoWindow({
        content: `<div style="padding:6px;min-width:160px;font-family:sans-serif">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#1a1a1a">${c.title}</div>
          <div style="font-size:12px;color:#555">${(c.distanceKm || 0).toFixed(1)} km away · ${c.status?.replace('_', ' ')}</div>
        </div>`,
      });
      marker.addListener('click', () => iw.open(mapInstanceRef.current, marker));
      markersRef.current.push(marker);
    });
  }, [complaints, isLoaded]);

  if (!isLoaded) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite' }} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

/* ─── main Home component ─────────────────────────────────────── */
const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('all');
  const [heroSearch, setHeroSearch] = useState(searchParams.get('search') || '');

  // --- All Issues state ---
  const [allComplaints, setAllComplaints] = useState([]);
  const [allLoading, setAllLoading] = useState(true);

  // --- Nearby state ---
  const [nearbyComplaints, setNearbyComplaints] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);

  // --- My Issues state ---
  const [myComplaints, setMyComplaints] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myFetched, setMyFetched] = useState(false);

  /* fetch latest 6 on mount */
  useEffect(() => {
    complaintService.getAll({ page: 1, limit: 6, sort: 'newest' })
      .then(res => { if (res.success) setAllComplaints(res.data); })
      .catch(() => {})
      .finally(() => setAllLoading(false));
  }, []);

  /* fetch nearby when tab selected and not yet fetched */
  useEffect(() => {
    if (activeTab !== 'nearby' || locationRequested) return;
    setLocationRequested(true);

    if (!navigator.geolocation) {
      setNearbyError('Geolocation is not supported by your browser.');
      return;
    }

    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        try {
          const res = await complaintService.getNearby(latitude, longitude, 20);
          if (res.success) setNearbyComplaints(res.data);
        } catch {
          setNearbyError('Failed to load nearby issues.');
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setNearbyError('Location access denied. Please allow location access and try again.');
        setNearbyLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [activeTab, locationRequested]);

  /* fetch my issues when tab selected */
  useEffect(() => {
    if (activeTab !== 'mine' || !isAuthenticated || myFetched) return;
    setMyLoading(true);
    setMyFetched(true);
    complaintService.getMine({ page: 1, limit: 20 })
      .then(res => { if (res.success) setMyComplaints(res.data); })
      .catch(() => {})
      .finally(() => setMyLoading(false));
  }, [activeTab, isAuthenticated, myFetched]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/issues?search=${encodeURIComponent(heroSearch.trim())}`);
  };

  /* retry nearby */
  const retryNearby = () => {
    setLocationRequested(false);
    setNearbyError('');
    setNearbyComplaints([]);
    setUserLocation(null);
  };

  /* ── render helpers ── */
  const renderAllTab = () => (
    <>
      {allLoading ? (
        <div className="loading-spinner" />
      ) : allComplaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No issues found</h3>
          <p>Be the first to report an issue!</p>
        </div>
      ) : (
        <>
          <div className="issues-grid">
            {allComplaints.map(c => <IssueCard key={c._id} c={c} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/issues" className="home-show-all-btn">
              Show All Reports <ChevronRight size={16} />
            </Link>
          </div>
        </>
      )}
    </>
  );

  const renderNearbyTab = () => {
    if (nearbyLoading) return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Loader2 size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Detecting your location...</p>
      </div>
    );
    if (nearbyError) return (
      <div className="empty-state">
        <div className="empty-state-icon"><AlertCircle size={40} color="var(--error)" /></div>
        <h3 style={{ color: 'var(--error)' }}>Location Error</h3>
        <p>{nearbyError}</p>
        <button className="home-show-all-btn" onClick={retryNearby} style={{ marginTop: 12, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    );
    if (!locationRequested) return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Navigation size={40} color="var(--primary)" style={{ marginBottom: 12 }} />
        <p style={{ color: 'var(--text-muted)' }}>Waiting for location…</p>
      </div>
    );
    return (
      <div className="nearby-layout">
        {/* Mini Map — left */}
        <div className="nearby-map-col">
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapIcon size={16} color="var(--primary)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Issues within 20 km</span>
            <span className="badge badge-category">{nearbyComplaints.length} found</span>
          </div>
          <div style={{ height: 480 }}>
            <NearbyMiniMap complaints={nearbyComplaints} userLocation={userLocation} />
          </div>
        </div>

        {/* Issue list — right */}
        <div className="nearby-list-col">
          {nearbyComplaints.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">🗺️</div>
              <h3>No issues nearby</h3>
              <p>No reported issues within 20 km of your location.</p>
            </div>
          ) : (
            <div className="issues-grid" style={{ gridTemplateColumns: '1fr' }}>
              {nearbyComplaints.map(c => <IssueCard key={c._id} c={c} />)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMineTab = () => {
    if (!isAuthenticated) return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Login Required</h3>
        <p>Please log in to see your submitted reports.</p>
        <Link to="/login" className="home-show-all-btn" style={{ marginTop: 12, display: 'inline-flex' }}>Go to Login</Link>
      </div>
    );
    if (myLoading) return <div className="loading-spinner" />;
    if (myComplaints.length === 0) return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <h3>No reports yet</h3>
        <p>You haven't submitted any issues yet.</p>
        <Link to="/citizen/raise" className="home-show-all-btn" style={{ marginTop: 12, display: 'inline-flex' }}>
          Report an Issue
        </Link>
      </div>
    );
    return (
      <div className="issues-grid">
        {myComplaints.map(c => <IssueCard key={c._id} c={c} />)}
      </div>
    );
  };

  return (
    <CitizenLayout>
      {/* ===== HERO ===== */}
      <section className="hero">
        <h1>Report &amp; Track <span className="highlight">Infrastructure Issues</span></h1>
        <p>Help improve Gujarat's roads, drainage, and public spaces. Your reports drive real change.</p>
        <form className="hero-search" onSubmit={handleHeroSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by issue, area, or complaint number..."
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
          />
          <button type="submit" className="search-btn"><ArrowRight size={16} /></button>
        </form>
      </section>

      {/* ===== CONTENT ===== */}
      <div className="citizen-content">
        {/* Tabs */}
        <div className="section-bar">
          <div className="tabs">
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Issues
            </button>
            <button className={`tab ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
              <Navigation size={14} style={{ marginRight: 4 }} /> Nearby
            </button>
            {isAuthenticated && (
              <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
                My Issues
              </button>
            )}
            <Link to="/map" className="tab" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <MapIcon size={14} style={{ marginRight: 4 }} /> Map View
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'all' && renderAllTab()}
        {activeTab === 'nearby' && renderNearbyTab()}
        {activeTab === 'mine' && renderMineTab()}
      </div>
    </CitizenLayout>
  );
};

export default Home;
