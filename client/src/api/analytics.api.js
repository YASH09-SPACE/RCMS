import { mockDelay } from './axiosConfig';
import { MOCK_ANALYTICS } from './mockData';

export const analyticsApi = {
  getSummary: async () => {
    await mockDelay(400);
    return { data: MOCK_ANALYTICS.summary };
  },

  getByCategory: async () => {
    await mockDelay(300);
    return { data: MOCK_ANALYTICS.byCategory };
  },

  getByStatus: async () => {
    await mockDelay(300);
    return { data: MOCK_ANALYTICS.byStatus };
  },

  getByWard: async () => {
    await mockDelay(300);
    return { data: MOCK_ANALYTICS.byWard };
  },

  getResolutionTrend: async () => {
    await mockDelay(300);
    return { data: MOCK_ANALYTICS.resolutionTrend };
  },

  getMonthlySubmissions: async () => {
    await mockDelay(300);
    return { data: MOCK_ANALYTICS.monthlySubmissions };
  },

  exportCsv: async () => {
    await mockDelay(500);
    return { data: 'CSV export not available in demo mode.' };
  },
};

export default analyticsApi;
