import api from './api';

export const demoService = {
  // Seed demo data
  seedDemoData: async () => {
    const response = await api.post('/demo/seed');
    return response.data;
  },

  // Simulate crisis
  simulateCrisis: async () => {
    const response = await api.post('/demo/simulate-crisis');
    return response.data;
  },

  // Simulate incident (legacy)
  simulateIncident: async () => {
    const response = await api.post('/demo/simulate-incident');
    return response.data;
  }
};
