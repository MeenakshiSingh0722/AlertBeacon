import { useEffect, useState } from "react";
import { seedAlerts, type Alert } from "@/data/alerts";
import apiClient from "@/lib/api";

type StoreState = { 
  alerts: Alert[]; 
  authed: boolean;
  user: any | null;
  loading: boolean;
};

const listeners = new Set<() => void>();
let state: StoreState = { 
  alerts: seedAlerts, 
  authed: false, 
  user: null,
  loading: false 
};

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useAlerts() {
  const [, force] = useState(0);
  
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  // Load alerts from API on mount
  useEffect(() => {
    if (state.authed) {
      loadAlerts();
    }
  }, [state.authed]);

  const loadAlerts = async () => {
    setState({ loading: true });
    try {
      const response = await apiClient.getAlerts();
      if (response.data) {
        setState({ alerts: response.data });
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setState({ loading: false });
    }
  };

  const signIn = async (credentials: { email: string; password: string }) => {
    setState({ loading: true });
    try {
      const response = await apiClient.login(credentials);
      if (response.data) {
        localStorage.setItem('alertbeacon_token', response.data.access_token);
        localStorage.setItem('alertbeacon_refresh_token', response.data.refresh_token);
        setState({ 
          authed: true, 
          user: { email: credentials.email } // Temporary user object until we fetch full profile
        });
        await loadAlerts();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setState({ loading: false });
    }
  };

  const signOut = () => {
    localStorage.removeItem('alertbeacon_token');
    localStorage.removeItem('alertbeacon_refresh_token');
    setState({ 
      authed: false, 
      user: null,
      alerts: seedAlerts 
    });
  };

  const prepend = (a: Alert) => {
    setState({ alerts: [a, ...state.alerts] });
  };

  const resolve = async (id: string) => {
    try {
      await apiClient.updateAlertStatus(id, 'resolved');
      setState({
        alerts: state.alerts.map((x) =>
          x.id === id ? { ...x, status: "resolved" as const } : x
        ),
      });
    } catch (error) {
      console.error('Failed to update alert status:', error);
    }
  };

  return {
    alerts: state.alerts,
    authed: state.authed,
    user: state.user,
    loading: state.loading,
    loadAlerts,
    prepend,
    resolve,
    signIn,
    signOut,
  };
}
