import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, MapPin, Users, Bell } from 'lucide-react';
import { toast } from 'sonner';

const CrisisAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  // Simulate real-time crisis alerts
  useEffect(() => {
    const crisisScenarios = [
      {
        id: 'crisis-1',
        type: 'critical',
        title: 'CRITICAL: MASSIVE FIRE OUTBREAK',
        location: 'Delhi Chandni Chowk Market',
        affected: '500+ people',
        time: '2 mins ago',
        description: 'Major fire incident in crowded market area - immediate evacuation required'
      },
      {
        id: 'crisis-2',
        type: 'high',
        title: 'HIGH: MEDICAL EMERGENCY',
        location: 'Mumbai KEM Hospital',
        affected: '50+ patients',
        time: '5 mins ago',
        description: 'Oxygen supply shortage affecting critical care patients'
      },
      {
        id: 'crisis-3',
        type: 'medium',
        title: 'MEDIUM: FLOOD WARNING',
        location: 'Bihar Patna District',
        affected: '5000+ people',
        time: '10 mins ago',
        description: 'Rising water levels - residents advised to move to higher ground'
      }
    ];

    // Show first alert immediately
    setTimeout(() => {
      if (!dismissed.has('crisis-1')) {
        setAlerts([crisisScenarios[0]]);
        toast.error('🚨 CRITICAL ALERT: Fire outbreak in Delhi', {
          duration: 5000,
          position: 'top-right'
        });
      }
    }, 1000);

    return () => {
      // Cleanup
    };
  }, [dismissed]);

  const dismissAlert = (alertId) => {
    setDismissed(prev => new Set([...prev, alertId]));
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertStyle = (type) => {
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

  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-white';
      case 'high': return 'text-white';
      case 'medium': return 'text-white';
      default: return 'text-gray-300';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            ${getAlertStyle(alert.type)}
            border-2 rounded-xl p-5 shadow-2xl backdrop-blur-sm
            transform transition-all duration-300 ease-in-out
            animate-pulse
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-2 rounded-full bg-white/20 ${getIconColor(alert.type)}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg mb-2">{alert.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{alert.affected}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{alert.time}</span>
                  </div>
                </div>
                <p className="text-sm mt-3 opacity-90">{alert.description}</p>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="ml-3 text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CrisisAlerts;
