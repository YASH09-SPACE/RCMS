import API from './api';

export const citizenService = {
  getDashboardStats: async () => {
    const response = await API.get('/citizen/dashboard');
    return response.data;
  }
};
