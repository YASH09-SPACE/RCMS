import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Clock, Navigation } from 'lucide-react';
import { complaintService, locationService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import CitizenLayout from '../../components/CitizenLayout';
import CustomSelect from '../../components/CustomSelect';
import GoogleMapViewer from '../../components/common/GoogleMapViewer';
import SLACountdown from '../../components/common/SLACountdown';

const categoryIcons = {
  'Pothole': '🕳️',
  'Street Light': '💡',
  'Drainage': '🚰',
  'Garbage Collection': '🗑️',
  'Water Supply': '💧',
  'Park Maintenance': '🌳',
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5001${url}`;
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    page: 1,
    search: searchParams.get('search') || '',
    district: '',
    status: '',
    sort: 'newest'
  });

  const [activeTab, setActiveTab] = useState('all');
  const [heroSearch, setHeroSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    locationService.getDistricts().then(res => {
      if (res.success) setDistricts(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [filters, activeTab]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.district) params.district = filters.district;
      if (filters.status) params.status = filters.status;

      const res = await complaintService.getAll(params);
      if (res.success) {
        setComplaints(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: heroSearch, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <CitizenLayout>
      {/* ===== HERO ===== */}
      <section className="hero">
        <h1>
          Report & Track <span className="highlight">Infrastructure Issues</span>
        </h1>
        <p>Help improve Gujarat's roads, drainage, and public spaces. Your reports drive real change.</p>

        <form className="hero-search" onSubmit={handleHeroSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by issue, area, or complaint number..."
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <ArrowRight size={16} />
          </button>
        </form>
      </section>

      {/* ===== CONTENT ===== */}
      <div className="citizen-content">
        {/* Tabs + Filters */}
        <div className="section-bar">
          <div className="tabs">
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Issues
            </button>
            <button className={`tab ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
              Nearby
            </button>
            {isAuthenticated && (
              <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
                My Issues
              </button>
            )}
          </div>

          <div className="filters-row">
            <button className="c-btn c-btn-outline" onClick={() => setActiveTab(activeTab === 'map' ? 'all' : 'map')} style={{ marginRight: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Navigation size={16} /> {activeTab === 'map' ? 'Hide Live Map' : 'View Live Map'}
            </button>
            <CustomSelect
              variant="pill"
              placeholder="All Districts"
              value={filters.district}
              onChange={(val) => handleFilterChange('district', val)}
              options={[
                { value: '', label: 'All Districts' },
                ...districts.map(d => ({ value: d._id, label: d.name }))
              ]}
            />

            <CustomSelect
              variant="pill"
              placeholder="All Status"
              value={filters.status}
              onChange={(val) => handleFilterChange('status', val)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'reopened', label: 'Reopened' },
              ]}
            />

            <CustomSelect
              variant="pill"
              placeholder="Sort By"
              value={filters.sort}
              onChange={(val) => handleFilterChange('sort', val)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'priority', label: 'Priority' },
              ]}
            />
          </div>
        </div>

        {/* Results info */}
        {activeTab !== 'map' && !loading && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Showing {complaints.length} of {total} issues
            {filters.search && <> for "<strong>{filters.search}</strong>"</>}
          </p>
        )}

        {/* Issues Grid */}
        {activeTab === 'map' ? (
          <div style={{ marginTop: '24px' }}>
            <GoogleMapViewer />
          </div>
        ) : loading ? (
          <div className="loading-spinner" />
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No issues found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="issues-grid">
            {complaints.map(c => (
              <Link to={`/issue/${c._id}`} className="issue-card" key={c._id}>
                {c.images && c.images.length > 0 ? (
                  <img src={getImageUrl(c.images[0])} alt={c.title} className="issue-card-img" />
                ) : (
                  <div className="issue-card-img placeholder">
                    <span style={{ fontSize: '40px' }}>{categoryIcons[c.category?.name] || '📋'}</span>
                  </div>
                )}

                <div className="issue-card-body">
                  <div className="issue-card-tags">
                    <span className="badge badge-category">
                      {c.category?.name || 'General'}
                    </span>
                    <span className={`badge badge-status badge-${c.status}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                    {c.priority && (
                      <span className={`badge badge-${c.priority}`}>
                        {c.priority}
                      </span>
                    )}
                  </div>

                  <div className="issue-card-title">{c.title}</div>

                  {/* SLA Countdown */}
                  {c.slaDueDate && (
                    <div style={{ marginBottom: '8px' }}>
                      <SLACountdown 
                        slaDueDate={c.slaDueDate} 
                        isSlaBreached={c.isSlaBreached}
                        complaintStatus={c.status}
                        size="small"
                      />
                    </div>
                  )}

                  <div className="issue-card-meta">
                    <span className="issue-card-meta-item">
                      <MapPin size={12} />
                      {c.district?.name || 'Gujarat'}
                    </span>
                    <span className="issue-card-meta-item">
                      <Clock size={12} />
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {activeTab !== 'map' && totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={filters.page === page ? 'active' : ''}
                  onClick={() => setFilters(prev => ({ ...prev, page }))}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={filters.page >= totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
};

export default Home;
