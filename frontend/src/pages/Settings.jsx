import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Wifi, 
  WifiOff, 
  Bell, 
  Moon, 
  Sun,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useIncidentSocket } from '../hooks/useIncidentSocket';

const Settings = () => {
  const { connected } = useIncidentSocket();
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus('online');
        setApiResponse(data);
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'online': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-orange-500" />;
      default: return <div className="h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Checking...';
    }
  };

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'error': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">System configuration and status</p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WebSocket Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wifi className="h-5 w-5 text-blue-500" />
            WebSocket Connection
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Status:</span>
              <div className="flex items-center gap-2">
                {connected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Disconnected</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Endpoint:</span>
              <span className="text-gray-400 text-sm">
                {import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/incidents'}
              </span>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">
                {connected 
                  ? 'Real-time updates are active. You will receive live alerts for new incidents.'
                  : 'Real-time updates are not available. Some features may be limited.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-green-500" />
            Backend API Status
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Status:</span>
              <div className="flex items-center gap-2">
                {getApiStatusIcon()}
                <span className={getApiStatusColor()}>{getApiStatusText()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">URL:</span>
              <span className="text-gray-400 text-sm">
                {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
              </span>
            </div>
            
            <button
              onClick={checkApiStatus}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Check Status
            </button>
            
            {apiResponse && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <pre className="text-gray-400 text-xs overflow-x-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-purple-500" />
          Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demo Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Demo Mode</h3>
                <p className="text-gray-500 text-sm">Simulated crisis data for testing</p>
              </div>
              <div className="px-3 py-1 bg-green-900/20 border border-green-500 rounded-full">
                <span className="text-green-500 text-sm">Enabled</span>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">
                Demo mode is currently enabled. You can simulate crisis events and test the system with sample data.
              </p>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Theme</h3>
                <p className="text-gray-500 text-sm">Dark AlertBeacon theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Dark</span>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">
                AlertBeacon uses a dark theme optimized for emergency operations and low-light environments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-500" />
          Notification Preferences
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Critical Alerts</h3>
            <p className="text-gray-400 text-sm mb-3">
              Immediate popup notifications for critical incidents
            </p>
            <div className="flex items-center justify-between">
              <span className="text-green-500 text-sm">Enabled</span>
              <div className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">High Priority</h3>
            <p className="text-gray-400 text-sm mb-3">
              Popup notifications for high severity incidents
            </p>
            <div className="flex items-center justify-between">
              <span className="text-green-500 text-sm">Enabled</span>
              <div className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Sound Alerts</h3>
            <p className="text-gray-400 text-sm mb-3">
              Audio notifications for new incidents
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Disabled</span>
              <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          System Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Frontend Version:</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build:</span>
              <span className="text-white">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment:</span>
              <span className="text-white">{import.meta.env.MODE || 'development'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Browser:</span>
              <span className="text-white">{navigator.userAgent.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="text-white">{navigator.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Timezone:</span>
              <span className="text-white">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
