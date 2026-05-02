import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, MapPin, Users, Globe, Bell } from 'lucide-react';
import { toast } from 'sonner';

const GlobalNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch real incidents from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/incidents?limit=10');
        if (response.ok) {
          const incidents = await response.json();
          
          // Transform incidents into notification format
          const notificationData = incidents.map((incident, index) => ({
            id: incident.id,
            region: incident.location_name?.includes('India') || 
                   incident.location_name?.includes('Delhi') || 
                   incident.location_name?.includes('Mumbai') || 
                   incident.location_name?.includes('Bihar') ? 'India' : 'World',
            type: incident.severity_label === 'critical' ? 'critical' : 
                  incident.severity_label === 'high' ? 'high' : 'medium',
            title: `${incident.severity_label?.toUpperCase()}: ${incident.title}`,
            location: incident.location_name || 'Unknown Location',
            affected: incident.affected_count ? `${incident.affected_count}+ people` : 'Unknown',
            time: getRelativeTime(incident.created_at),
            description: incident.description || incident.ai_summary || 'No description available',
            coordinates: incident.latitude && incident.longitude ? 
                       `${incident.latitude}°${incident.latitude >= 0 ? 'N' : 'S'}, ${incident.longitude}°${incident.longitude >= 0 ? 'E' : 'W'}` : 
                       'Coordinates not available'
          }));

          // Show notifications with staggered timing
          notificationData.forEach((notification, index) => {
            if (!dismissed.has(notification.id)) {
              setTimeout(() => {
                setNotifications(prev => {
                  if (!prev.find(n => n.id === notification.id)) {
                    return [...prev, notification];
                  }
                  return prev;
                });

                // Show toast notification
                if (notification.type === 'critical') {
                  toast.error(`🚨 ${notification.title}`, {
                    duration: 6000,
                    position: 'top-right'
                  });
                } else if (notification.type === 'high') {
                  toast.warning(`⚠️ ${notification.title}`, {
                    duration: 5000,
                    position: 'top-right'
                  });
                } else {
                  toast.info(`ℹ️ ${notification.title}`, {
                    duration: 4000,
                    position: 'top-right'
                  });
                }
              }, index * 1000);
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [dismissed]);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const dismissNotification = (notificationId) => {
    setDismissed(prev => new Set([...prev, notificationId]));
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-600 border-red-400 text-white shadow-red-500/50';
      case 'high':
        return 'bg-orange-600 border-orange-400 text-white shadow-orange-500/50';
      case 'medium':
        return 'bg-yellow-600 border-yellow-400 text-white shadow-yellow-500/50';
      default:
        return 'bg-gray-800 border-gray-600 text-white shadow-gray-500/50';
    }
  };

  const getRegionIcon = (region) => {
    return region === 'India' ? '🇮🇳' : '🌍';
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md max-h-96 overflow-y-auto">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 mb-2 border border-gray-700">
        <div className="flex items-center gap-2 text-white">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">Global Crisis Alerts</span>
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        </div>
      </div>
      
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            ${getNotificationStyle(notification.type)}
            border-2 rounded-xl p-4 shadow-2xl backdrop-blur-sm
            transform transition-all duration-500 ease-in-out
            animate-slide-in-right
            hover:scale-105
          `}
          style={{
            animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">{getRegionIcon(notification.region)}</span>
                <div className={`p-1 rounded-full bg-white/20`}>
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {notification.region}
                  </span>
                  <span className="text-xs opacity-75">
                    {notification.time}
                  </span>
                </div>
                <h4 className="font-bold text-sm mb-2">{notification.title}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{notification.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{notification.affected}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span>{notification.coordinates}</span>
                  </div>
                </div>
                <p className="text-xs mt-2 opacity-90">{notification.description}</p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="ml-2 text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalNotifications;
