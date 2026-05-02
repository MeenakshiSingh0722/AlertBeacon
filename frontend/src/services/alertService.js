import api from './api';

export const alertService = {
  // Get all alerts (high/critical incidents)
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  // Mark alert as read
  markAlertAsRead: async (id) => {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  }
};
