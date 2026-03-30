// Axios-like mock configuration
// In production, replace with real axios instance

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Mock delay to simulate network latency
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API client
const apiClient = {
  get: async (url, config = {}) => {
    await mockDelay(300);
    console.log(`[API GET] ${url}`, config);
    return { data: null, status: 200 };
  },
  post: async (url, data, config = {}) => {
    await mockDelay(500);
    console.log(`[API POST] ${url}`, data);
    return { data: null, status: 201 };
  },
  put: async (url, data, config = {}) => {
    await mockDelay(400);
    console.log(`[API PUT] ${url}`, data);
    return { data: null, status: 200 };
  },
  patch: async (url, data, config = {}) => {
    await mockDelay(400);
    console.log(`[API PATCH] ${url}`, data);
    return { data: null, status: 200 };
  },
  delete: async (url, config = {}) => {
    await mockDelay(300);
    console.log(`[API DELETE] ${url}`);
    return { data: null, status: 200 };
  },
};

export default apiClient;
export { API_BASE_URL, mockDelay };
