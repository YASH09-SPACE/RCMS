import { mockDelay } from './axiosConfig';

export const authApi = {
  login: async (email, password) => {
    await mockDelay(800);
    // Login handled by authStore directly
    return { data: { token: 'mock-jwt-token' } };
  },

  register: async (data) => {
    await mockDelay(800);
    return { data: { token: 'mock-jwt-token', user: data } };
  },

  forgotPassword: async (email) => {
    await mockDelay(600);
    return { data: { message: 'Password reset link sent to your email.' } };
  },

  verifyOtp: async (phone, otp) => {
    await mockDelay(500);
    return { data: { verified: true } };
  },

  refreshToken: async () => {
    await mockDelay(300);
    return { data: { token: 'mock-refreshed-jwt-token' } };
  },
};

export default authApi;
