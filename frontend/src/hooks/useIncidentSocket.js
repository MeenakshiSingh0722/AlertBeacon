import { useEffect, useRef } from 'react';
import useAlertBeaconStore from '../store/useAlertBeaconStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/incidents';

export const useIncidentSocket = () => {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const { setWsConnected, handleSocketEvent } = useAlertBeaconStore();

  const connect = () => {
    try {
      ws.current = new WebSocket(WS_URL);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        reconnectAttempts.current = 0;
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSocketEvent(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setWsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeout.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setWsConnected(false);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setWsConnected(false);
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    connected: useAlertBeaconStore(state => state.wsConnected),
    disconnect,
    reconnect: connect
  };
};
