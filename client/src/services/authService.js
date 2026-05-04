import API from './api';

export const authService = {
  register: async (data) => {
    const response = await API.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await API.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await API.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (newPassword) => {
    const response = await API.put('/auth/change-password', { newPassword });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, otp, password) => {
    const response = await API.post('/auth/reset-password', { email, otp, password });
    return response.data;
  },
  sendOTP: async (email) => {
    const response = await API.post('/auth/send-otp', { email });
    return response.data;
  }
};
