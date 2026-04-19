import API from './api';

export const complaintService = {
  // Public
  getAll: (params) => API.get('/complaints', { params }).then(r => r.data),
  getById: (id) => API.get(`/complaints/${id}`).then(r => r.data),
  getComments: (id) => API.get(`/complaints/${id}/comments`).then(r => r.data),

  // Auth required
  create: (formData) => API.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  getMine: (params) => API.get('/complaints/mine', { params }).then(r => r.data),
  addComment: (id, text) => API.post(`/complaints/${id}/comments`, { text }).then(r => r.data),
  submitFeedback: (id, data) => API.post(`/complaints/${id}/feedback`, data).then(r => r.data),
  reopen: (id, reason) => API.put(`/complaints/${id}/reopen`, { reason }).then(r => r.data),
};

export const locationService = {
  getDistricts: () => API.get('/location/districts').then(r => r.data),
  getWards: (districtId) => API.get(`/location/wards/${districtId}`).then(r => r.data),
  reverseGeocode: (lat, lng) => API.post('/location/reverse-geocode', { latitude: lat, longitude: lng }).then(r => r.data)
};

export const categoryService = {
  getAll: () => API.get('/complaints/categories').then(r => r.data),
};
