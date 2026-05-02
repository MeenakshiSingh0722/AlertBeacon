import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';
import { toast } from 'sonner';

const Alerts = () => {
  const { alerts, loading, fetchAlerts, markAlertAsRead } = useAlertBeaconStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'popup': return '🔔';
      case 'dashboard': return '📊';
      case 'email': return '📧';
      case 'sms': return '📱';
      default: return '📢';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
      case 'sent': return 'text-blue-500 bg-blue-900/20 border-blue-500';
      case 'read': return 'text-green-500 bg-green-900/20 border-green-500';
      case 'failed': return 'text-red-500 bg-red-900/20 border-red-500';
      default: return 'text-gray-500 bg-gray-900/20 border-gray-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-900/20 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-500';
      default: return 'text-gray-500 bg-gray-900/20 border-gray-500';
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      toast.success('Alert marked as read');
    } catch (error) {
      toast.error('Failed to mark alert as read');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return alert.status !== 'read';
    if (filter === 'critical') return alert.incident?.severity_label === 'critical';
    if (filter === 'high') return alert.incident?.severity_label === 'high';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-gray-400">High and critical priority incident alerts</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300">Filter:</span>
          </div>
          
          {['all', 'unread', 'critical', 'high'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading.alerts ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">No alerts found</p>
            <p className="text-sm mt-2">
              {filter === 'all' 
                ? 'No high or critical alerts at this time' 
                : `No ${filter} alerts found`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Alert Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg">{getAlertTypeIcon(alert.alert_type)}</span>
                      <div>
                        <h3 className="text-white font-medium">{alert.message}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(alert.status)}`}>
                            {alert.status?.toUpperCase()}
                          </span>
                          {alert.incident?.severity_label && (
                            <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(alert.incident.severity_label)}`}>
                              {alert.incident.severity_label?.toUpperCase()}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(alert.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Incident Details */}
                    {alert.incident && (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-medium mb-2">
                              {alert.incident.title}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2">
                              {alert.incident.ai_summary || alert.incident.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Category: {alert.incident.category}</span>
                              <span>Confidence: {alert.incident.confidence_score ? `${(alert.incident.confidence_score * 100).toFixed(0)}%` : 'N/A'}</span>
                              {alert.incident.location_name && (
                                <span>Location: {alert.incident.location_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {alert.incident && (
                        <Link
                          to={`/incidents/${alert.incident.id}`}
                          className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View Incident
                        </Link>
                      )}
                      
                      {alert.status !== 'read' && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="inline-flex items-center gap-1 text-green-500 hover:text-green-400 text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">
                {alerts.length}
              </p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <Bell className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unread</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {alerts.filter(a => a.status !== 'read').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {alerts.filter(a => a.incident?.severity_label === 'critical').length}
              </p>
            </div>
            <div className="p-3 bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {alerts.filter(a => a.incident?.severity_label === 'high').length}
              </p>
            </div>
            <div className="p-3 bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
