import API from './api';

export const superAdminService = {
  getStats: () => API.get('/superadmin/stats').then(r => r.data),
  getAllComplaints: (params) => API.get('/superadmin/complaints', { params }).then(r => r.data),
  resolveComplaint: (id, comments) => API.put(`/superadmin/complaints/${id}/resolve`, { comments }).then(r => r.data),
  
  // User Management
  getUsers: (params) => API.get('/superadmin/users', { params }).then(r => r.data),
  createUser: (userData) => API.post('/superadmin/users', userData).then(r => r.data),
  updateUser: (id, userData) => API.put(`/superadmin/users/${id}`, userData).then(r => r.data),
  deleteUser: (id) => API.delete(`/superadmin/users/${id}`).then(r => r.data),

  // Advanced Oversight
  getAnalytics: () => API.get('/superadmin/analytics').then(r => r.data),
  getHeatmap: () => API.get('/superadmin/heatmap').then(r => r.data),
  getSlaBreaches: () => API.get('/superadmin/sla-breaches').then(r => r.data)
};
