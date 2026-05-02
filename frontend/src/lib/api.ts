const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  areas: string[];
  timestamp: string;
  source: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'monitoring' | 'resolved';
  timestamp: string;
  assignedTo?: string;
}

export interface DashboardStats {
  totalAlerts: number;
  activeIncidents: number;
  criticalAlerts: number;
  responseTime: string;
  statesCovered: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage if available
    const token = localStorage.getItem('alertbeacon_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request('/health');
  }

  // Authentication
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ access_token: string; refresh_token: string; token_type: string }>> {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const url = `${this.baseURL}/api/v1/auth/login`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Login request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Alerts
  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.request('/api/v1/alerts');
  }

  async createAlert(alert: Partial<Alert>): Promise<ApiResponse<Alert>> {
    return this.request('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  async updateAlertStatus(alertId: string, status: string): Promise<ApiResponse<Alert>> {
    return this.request(`/api/v1/alerts/${alertId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Incidents
  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.request('/api/v1/incidents');
  }

  async createIncident(incident: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return this.request('/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async updateIncident(incidentId: string, updates: Partial<Incident>): Promise<ApiResponse<Incident>> {
    return this.request(`/api/v1/incidents/${incidentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/api/v1/dashboard/stats');
  }

  // CAP Feed
  async getCapFeed(): Promise<ApiResponse<any[]>> {
    return this.request('/api/v1/sources/cap-feed');
  }

  // WebSocket connection for real-time updates
  connectWebSocket(): WebSocket {
    const wsUrl = this.baseURL.replace('http', 'ws') + '/api/v1/ws';
    return new WebSocket(wsUrl);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
