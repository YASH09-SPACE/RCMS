import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import API from '../../services/api';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import CustomSelect from '../../components/CustomSelect';
import { Plus, Edit2, Trash2, ShieldCheck, HardHat, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminUsers = () => {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin', 'constructor', 'citizen'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'admin',
    district: '',
    ward: ''
  });

  useEffect(() => {
    // Load districts for filter
    API.get('/location/districts').then(res => setDistricts(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      API.get(`/location/wards/${selectedDistrict}`).then(res => setWards(res.data.data)).catch(console.error);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, selectedDistrict, selectedWard, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getUsers({
        role: activeTab,
        districtId: selectedDistrict,
        wardId: selectedWard,
        page: currentPage,
        limit: 10
      });
      setUsers(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openModalForNew = () => {
    setFormData({ id: null, name: '', email: '', mobile: '', password: '', role: activeTab, district: '', ward: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (u) => {
    setFormData({
      id: u._id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      password: '', // blank unless changing
      role: u.role,
      district: u.district?._id || '',
      ward: u.ward?._id || ''
    });
    // Triggers ward fetch if district exists
    if (u.district) API.get(`/location/wards/${u.district._id}`).then(res => setWards(res.data.data)).catch(console.error);
    setIsModalOpen(true);
  };

  const handleSuspension = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return;
    try {
      await API.put(`/superadmin/users/${id}/toggle-status`);
      toast.success(`User ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      if (formData.id) {
        // Update
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't wipe password if blank
        await superAdminService.updateUser(formData.id, payload);
        toast.success('User updated successfully');
      } else {
        // Create
        if (!formData.password) return toast.error('Password is required for new users');
        await superAdminService.createUser(formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSavingUser(false);
    }
  };

  // Pre-process map options
  const districtOptions = districts.map(d => ({ value: d._id, label: d.name }));
  const wardOptions = wards.map(w => ({ value: w._id, label: w.wardName }));

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>User Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage Admins, Constructors, and Citizens across the state.</p>
        </div>
        <button onClick={openModalForNew} className="c-btn c-btn-primary" style={{ flex: '0 0 auto', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <Plus size={16} /> New {activeTab === 'admin' ? 'Admin' : activeTab === 'constructor' ? 'Constructor' : 'Citizen'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => { setActiveTab('admin'); setCurrentPage(1); }}
          style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'admin' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'admin' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'admin' ? 600 : 400, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <ShieldCheck size={18} /> Taluka/Ward Admins
        </button>
        <button 
          onClick={() => { setActiveTab('constructor'); setCurrentPage(1); }}
          style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'constructor' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'constructor' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'constructor' ? 600 : 400, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <HardHat size={18} /> Field Constructors
        </button>
        <button 
          onClick={() => { setActiveTab('citizen'); setCurrentPage(1); }}
          style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'citizen' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'citizen' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'citizen' ? 600 : 400, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <User size={18} /> Citizens
        </button>
      </div>

      {(activeTab === 'admin' || activeTab === 'constructor') && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', width: '100%', maxWidth: '600px' }}>
          <div style={{ flex: 1 }}>
            <CustomSelect
              placeholder="Filter by District"
              value={selectedDistrict}
              onChange={(val) => { setSelectedDistrict(val); setSelectedWard(''); setCurrentPage(1); }}
              options={[{ value: '', label: 'All Districts' }, ...districtOptions]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <CustomSelect
              placeholder="Filter by Taluka / Ward"
              value={selectedWard}
              onChange={(val) => { setSelectedWard(val); setCurrentPage(1); }}
              options={[{ value: '', label: 'All Talukas / Wards' }, ...wardOptions]}
            />
          </div>
        </div>
      )}

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner" style={{ padding: '40px' }} />
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                {(activeTab === 'admin' || activeTab === 'constructor') && <th>District</th>}
                {(activeTab === 'admin' || activeTab === 'constructor') && <th>Taluka/Ward</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="admin-table-row">
                  <td><div style={{ fontWeight: 600 }}>{u.name}</div></td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{u.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.mobile}</div>
                  </td>
                  {(activeTab === 'admin' || activeTab === 'constructor') && <td>{u.district?.name || '-'}</td>}
                  {(activeTab === 'admin' || activeTab === 'constructor') && <td>{u.ward?.wardName || '-'}</td>}
                  <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={(e) => { e.stopPropagation(); openModalForEdit(u); }} className="nav-btn" style={{ width: '32px', height: '32px' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleSuspension(u._id, u.isActive); }} className="nav-btn" style={{ width: '32px', height: '32px', color: u.isActive ? 'var(--warning)' : 'var(--success)' }} title={u.isActive ? "Suspend User" : "Activate User"}>
                        <ShieldCheck size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
         <div className="pagination" style={{ marginTop: '24px', justifyContent: 'flex-end' }}>
           <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
           {Array.from({ length: totalPages }, (_, i) => (
             <button key={i+1} className={currentPage === i+1 ? 'active' : ''} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
           ))}
           <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
         </div>
      )}

      {/* Basic Custom Modal purely built with inline styles to avoid making new CSS files unless needed */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{formData.id ? 'Edit User' : `Create New ${activeTab}`}</h2>
               <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="c-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="c-form-label">Full Name</label>
                  <input type="text" className="c-form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                
                <div className="c-form-group">
                  <label className="c-form-label">Email Address</label>
                  <input type="email" className="c-form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                
                <div className="c-form-group">
                  <label className="c-form-label">Mobile Number</label>
                  <input type="text" className="c-form-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required pattern="\d{10}" title="10 digit mobile" />
                </div>

                <div className="c-form-group">
                  <label className="c-form-label">Password {formData.id && <span style={{fontSize:'12px', color:'var(--text-muted)'}}>(leave blank to keep current)</span>}</label>
                  <input type="password" className="c-form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength={6} />
                </div>

                <div className="c-form-group">
                  <label className="c-form-label">Role</label>
                  <select className="c-form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ appearance: 'auto', padding: '12px' }}>
                     <option value="admin">Taluka/Ward Admin</option>
                     <option value="constructor">Field Constructor</option>
                     <option value="citizen">Citizen</option>
                  </select>
                </div>

                {(formData.role === 'admin' || formData.role === 'constructor') && (
                  <>
                    <div className="c-form-group">
                      <label className="c-form-label">Assigned District</label>
                      <select className="c-form-input" value={formData.district} onChange={e => {
                         setFormData({...formData, district: e.target.value, ward: ''});
                         API.get(`/location/wards/${e.target.value}`).then(res => setWards(res.data.data)).catch(console.error);
                      }} style={{ appearance: 'auto', padding: '12px' }} required>
                         <option value="">Select District</option>
                         {districtOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>

                    <div className="c-form-group">
                      <label className="c-form-label">Assigned Taluka/Ward</label>
                      <select className="c-form-input" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} style={{ appearance: 'auto', padding: '12px' }} required>
                         <option value="">Select Taluka/Ward</option>
                         {formData.district && wardOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="c-btn c-btn-outline">Cancel</button>
                <button type="submit" className="c-btn c-btn-primary" disabled={savingUser}>{savingUser ? 'Saving...' : 'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </SuperAdminLayout>
  );
};

export default SuperAdminUsers;
