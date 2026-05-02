import { create } from 'zustand';
import { incidentService } from '../services/incidentService';
import { dashboardService } from '../services/dashboardService';
import { alertService } from '../services/alertService';

const useAlertBeaconStore = create((set, get) => ({
  // State
  incidents: [],
  stats: null,
  alerts: [],
  selectedIncident: null,
  crisisPopupIncident: null,
  wsConnected: false,
  filters: {
    search: '',
    severity: '',
    category: '',
    status: '',
  },
  loading: {
    incidents: false,
    stats: false,
    alerts: false,
    analyze: false,
  },
  error: null,

  // Actions
  setFilters: (filters) => set({ filters }),
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
  setError: (error) => set({ error }),
  setWsConnected: (connected) => set({ wsConnected: connected }),

  // Incidents
  fetchIncidents: async (params = {}) => {
    set({ loading: { ...get().loading, incidents: true }, error: null });
    try {
      const data = await incidentService.getIncidents(params);
      set({ incidents: data, loading: { ...get().loading, incidents: false } });
    } catch (error) {
      set({ error: error.message, loading: { ...get().loading, incidents: false } });
    }
  },

  fetchIncident: async (id) => {
    set({ loading: { ...get().loading, incidents: true }, error: null });
    try {
      const data = await incidentService.getIncident(id);
      set({ selectedIncident: data, loading: { ...get().loading, incidents: false } });
    } catch (error) {
      set({ error: error.message, loading: { ...get().loading, incidents: false } });
    }
  },

  updateIncidentStatus: async (id, status) => {
    try {
      await incidentService.updateIncidentStatus(id, status);
      // Update local state
      set(state => ({
        incidents: state.incidents.map(inc => 
          inc.id === id ? { ...inc, status } : inc
        ),
        selectedIncident: state.selectedIncident?.id === id 
          ? { ...state.selectedIncident, status }
          : state.selectedIncident
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  analyzeCrisis: async (data) => {
    set({ loading: { ...get().loading, analyze: true }, error: null });
    try {
      const result = await incidentService.analyzeCrisis(data);
      set({ loading: { ...get().loading, analyze: false } });
      
      // If high/critical, show popup
      if (result.severity_label === 'high' || result.severity_label === 'critical') {
        set({ crisisPopupIncident: result });
      }
      
      return result;
    } catch (error) {
      set({ error: error.message, loading: { ...get().loading, analyze: false } });
      throw error;
    }
  },

  // Stats
  fetchStats: async () => {
    set({ loading: { ...get().loading, stats: true }, error: null });
    try {
      const [overview, categories, trends] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getCategories(),
        dashboardService.getTrends(),
      ]);
      
      set({ 
        stats: { overview, categories, trends },
        loading: { ...get().loading, stats: false }
      });
    } catch (error) {
      set({ error: error.message, loading: { ...get().loading, stats: false } });
    }
  },

  // Alerts
  fetchAlerts: async (params = {}) => {
    set({ loading: { ...get().loading, alerts: true }, error: null });
    try {
      const data = await alertService.getAlerts(params);
      set({ alerts: data, loading: { ...get().loading, alerts: false } });
    } catch (error) {
      set({ error: error.message, loading: { ...get().loading, alerts: false } });
    }
  },

  markAlertAsRead: async (id) => {
    try {
      await alertService.markAlertAsRead(id);
      set(state => ({
        alerts: state.alerts.map(alert => 
          alert.id === id ? { ...alert, status: 'read' } : alert
        )
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Crisis Popup
  openCrisisPopup: (incident) => set({ crisisPopupIncident: incident }),
  closeCrisisPopup: () => set({ crisisPopupIncident: null }),

  // WebSocket event handler
  handleSocketEvent: (event) => {
    const { event_type, data } = event;
    
    if (event_type === 'critical_alert') {
      // Add to incidents if not already there
      set(state => {
        const exists = state.incidents.some(inc => inc.id === data.id);
        if (!exists) {
          return {
            incidents: [data, ...state.incidents],
            crisisPopupIncident: data
          };
        }
        return { crisisPopupIncident: data };
      });
    } else if (event_type === 'incident_created') {
      set(state => {
        const exists = state.incidents.some(inc => inc.id === data.id);
        if (!exists) {
          return { incidents: [data, ...state.incidents] };
        }
        return state;
      });
    } else if (event_type === 'incident_status_updated') {
      set(state => ({
        incidents: state.incidents.map(inc => 
          inc.id === data.id ? { ...inc, ...data } : inc
        ),
        selectedIncident: state.selectedIncident?.id === data.id 
          ? { ...state.selectedIncident, ...data }
          : state.selectedIncident
      }));
    }
  },
}));

export default useAlertBeaconStore;
export { useAlertBeaconStore };
