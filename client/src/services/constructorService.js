import API from './api';

export const constructorService = {
  getStats: () => API.get('/constructor/stats').then(r => r.data),
  getTasks: (params) => API.get('/constructor/tasks', { params }).then(r => r.data),
  updateTaskStatus: (id, formData) => API.put(`/constructor/tasks/${id}/status`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
};
