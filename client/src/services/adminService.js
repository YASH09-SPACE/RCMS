import API from './api';

export const adminService = {
  getStats: () => API.get('/admin/stats').then(r => r.data),
  getComplaints: (params) => API.get('/admin/complaints', { params }).then(r => r.data),
  getConstructors: () => API.get('/admin/constructors').then(r => r.data),
  assignComplaint: (id, constructorId, priority) => API.put(`/admin/complaints/${id}/assign`, { constructorId, priority }).then(r => r.data),
  approveComplaint: (id, comments) => API.put(`/admin/complaints/${id}/approve`, { comments }).then(r => r.data),
  escalateComplaint: (id, reason) => API.put(`/admin/complaints/${id}/escalate`, { reason }).then(r => r.data)
};
