import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { complaintService, locationService } from '../../services/complaintService';
import CitizenLayout from '../../components/CitizenLayout';
import CustomSelect from '../../components/CustomSelect';
import IssueCard from '../../components/common/IssueCard';

/* ─── AllIssues page ──────────────────────────────────────────── */
const AllIssues = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [districts, setDistricts] = useState([]);

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
    district: searchParams.get('district') || '',
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const [searchInput, setSearchInput] = useState(filters.search);

  /* load districts once */
  useEffect(() => {
    locationService.getDistricts()
      .then(res => { if (res.success) setDistricts(res.data); })
      .catch(() => {});
  }, []);

  /* sync filters to URL params */
  useEffect(() => {
    const p = {};
    if (filters.page > 1) p.page = filters.page;
    if (filters.search) p.search = filters.search;
    if (filters.district) p.district = filters.district;
    if (filters.status) p.status = filters.status;
    if (filters.sort !== 'newest') p.sort = filters.sort;
    setSearchParams(p, { replace: true });
  }, [filters]);

  /* fetch complaints on filter change */
  useEffect(() => {
    setLoading(true);
    const params = {
      page: filters.page,
      limit: 12,
      sort: filters.sort,
    };
    if (filters.search) params.search = filters.search;
    if (filters.district) params.district = filters.district;
    if (filters.status) params.status = filters.status;

    complaintService.getAll(params)
      .then(res => {
        if (res.success) {
          setComplaints(res.data);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, search: '', district: '', status: '', sort: 'newest' });
  };

  const hasActiveFilters = filters.search || filters.district || filters.status || filters.sort !== 'newest';

  /* ── pagination helper ── */
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const start = Math.max(1, filters.page - 2);
    const end = Math.min(totalPages, filters.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="pagination">
        <button
          disabled={filters.page <= 1}
          onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
        >‹</button>
        {start > 1 && <><button onClick={() => setFilters(p => ({ ...p, page: 1 }))}>1</button>{start > 2 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}</>}
        {pages.map(pg => (
          <button key={pg} className={filters.page === pg ? 'active' : ''} onClick={() => setFilters(p => ({ ...p, page: pg }))}>{pg}</button>
        ))}
        {end < totalPages && <>{end < totalPages - 1 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}<button onClick={() => setFilters(p => ({ ...p, page: totalPages }))}>{totalPages}</button></>}
        <button
          disabled={filters.page >= totalPages}
          onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
        >›</button>
      </div>
    );
  };

  return (
    <CitizenLayout>
      <div className="citizen-content">
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Home</Link>
            <ArrowRight size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All Issues</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            All Reported Issues
          </h1>
          {!loading && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {total} issue{total !== 1 ? 's' : ''} reported across Gujarat
            </p>
          )}
        </div>

        {/* ── Search + Filters Bar ── */}
        <div className="all-issues-filters">
          <form className="all-issues-search" onSubmit={handleSearch}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by title, area, complaint number..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="nav-auth-link register" style={{ padding: '0 16px', height: 38, border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
              Search
            </button>
          </form>

          <div className="filters-row" style={{ flexWrap: 'wrap' }}>
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
                { value: 'priority', label: 'By Priority' },
              ]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '0 14px', height: 38, border: '1px solid var(--error)',
                  borderRadius: 'var(--radius-full)', background: 'var(--error-bg)',
                  color: 'var(--error)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex',
                  alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        {!loading && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 16px' }}>
            Showing {complaints.length} of {total} issues
            {filters.search && <> for "<strong>{filters.search}</strong>"</>}
          </p>
        )}

        {loading ? (
          <div className="loading-spinner" style={{ marginTop: 40 }} />
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No issues found</h3>
            <p>Try adjusting your filters or search query.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="home-show-all-btn" style={{ marginTop: 12, cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="issues-grid">
              {complaints.map(c => <IssueCard key={c._id} c={c} />)}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </CitizenLayout>
  );
};

export default AllIssues;
