import { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import AdminLayout from '../../components/AdminLayout';
import { Mail, Phone, Search } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Determine workload level based on active task count
 * @param {number} activeTasks - Number of active tasks
 * @returns {'low' | 'medium' | 'high'} Workload level
 */
const getWorkloadLevel = (activeTasks) => {
  if (activeTasks === 0) return 'low';
  if (activeTasks >= 1 && activeTasks <= 5) return 'medium';
  return 'high'; // 6+
};

/**
 * Get workload badge styling and text
 * @param {number} activeTasks - Number of active tasks
 * @returns {Object} Badge configuration with level, text, and className
 */
const getWorkloadBadge = (activeTasks) => {
  const level = getWorkloadLevel(activeTasks);
  return {
    level,
    text: `${activeTasks} Active`,
    className: `constructor-load ${level}`
  };
};

const ConstructorsList = () => {
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState('all');

  useEffect(() => {
    adminService.getConstructors()
      .then(res => {
        // Sort by activeTasks ascending (least busy first)
        const sorted = res.data.sort((a, b) => a.activeTasks - b.activeTasks);
        setConstructors(sorted);
      })
      .catch(err => toast.error('Failed to load constructors'))
      .finally(() => setLoading(false));
  }, []);

  // Debounced search with filtering
  const filteredConstructors = useMemo(() => {
    let filtered = [...constructors];

    // Apply search filter (name, email, phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.mobile.toLowerCase().includes(query)
      );
    }

    // Apply workload filter
    if (workloadFilter !== 'all') {
      filtered = filtered.filter(c => getWorkloadLevel(c.activeTasks) === workloadFilter);
    }

    return filtered;
  }, [constructors, searchQuery, workloadFilter]);

  if (loading) return <AdminLayout><div className="loading-spinner" style={{ padding: '60px' }} /></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Constructor Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage physical workers assigned to your jurisdiction and monitor their active workload.</p>
      </div>

      {/* Search and Filter Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ 
          flex: '1 1 300px',
          position: 'relative'
        }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Workload Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}>
            Workload:
          </label>
          <select
            value={workloadFilter}
            onChange={(e) => setWorkloadFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '120px'
            }}
          >
            <option value="all">All</option>
            <option value="low">Low (0 tasks)</option>
            <option value="medium">Medium (1-5)</option>
            <option value="high">High (6+)</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-muted)',
          fontWeight: 500
        }}>
          {filteredConstructors.length} {filteredConstructors.length === 1 ? 'constructor' : 'constructors'}
        </div>
      </div>

      {/* Constructor Grid */}
      {filteredConstructors.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px' }}>
          <div className="empty-state-icon">👷</div>
          <h3>No Constructors Found</h3>
          <p>
            {constructors.length === 0 
              ? 'There are no workers assigned to your ward yet.'
              : 'No constructors match your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          {filteredConstructors.map(c => {
            const badge = getWorkloadBadge(c.activeTasks);
            return (
              <div className="constructor-card" key={c._id}>
                <div className="constructor-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div className="constructor-info">
                  <div className="constructor-name">{c.name}</div>
                  <div className="constructor-details" style={{ marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {c.email}
                    </span>
                  </div>
                  <div className="constructor-details">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {c.mobile}
                    </span>
                  </div>
                </div>
                <div 
                  className={badge.className} 
                  title={`Workload: ${badge.level} - ${c.activeTasks} active tasks currently assigned`}
                >
                  {badge.text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default ConstructorsList;
