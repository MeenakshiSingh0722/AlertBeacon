import api from './api';

export const incidentService = {
  // Get all incidents with pagination and filtering
  getIncidents: async (params = {}) => {
    const response = await api.get('/incidents', { params });
    return response.data;
  },

  // Get incident by ID
  getIncident: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  // Get incidents for map view
  getMapIncidents: async () => {
    const response = await api.get('/incidents/map');
    return response.data;
  },

  // Get incident statistics
  getIncidentStats: async () => {
    const response = await api.get('/incidents/stats');
    return response.data;
  },

  // Analyze crisis text
  analyzeCrisis: async (data) => {
    const response = await api.post('/incidents/analyze', data);
    return response.data;
  },

  // Update incident status
  updateIncidentStatus: async (id, status) => {
    const response = await api.patch(`/incidents/${id}/status`, { status });
    return response.data;
  },

  // Create new incident
  createIncident: async (data) => {
    const response = await api.post('/incidents', data);
    return response.data;
  },

  // Update incident
  updateIncident: async (id, data) => {
    const response = await api.patch(`/incidents/${id}`, data);
    return response.data;
  },

  // Delete incident
  deleteIncident: async (id) => {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  }
};
