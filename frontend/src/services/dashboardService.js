import api from './api';

export const dashboardService = {
  // Get dashboard overview stats
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // Get category breakdown
  getCategories: async () => {
    const response = await api.get('/dashboard/categories');
    return response.data;
  },

  // Get trends data
  getTrends: async () => {
    const response = await api.get('/dashboard/trends');
    return response.data;
  }
};
