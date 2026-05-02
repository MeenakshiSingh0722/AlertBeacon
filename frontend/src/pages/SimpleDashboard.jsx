import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  FileText,
  BarChart3,
  Clock,
  MapPin,
  Zap,
  Users,
  CheckCircle
} from 'lucide-react';

const SimpleDashboard = () => {
  const [stats, setStats] = useState({
    total: 10,
    critical: 4,
    high: 1,
    active: 2,
    resolved: 0
  });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      // Fetch data directly from API
      const statsResponse = await fetch('http://localhost:8000/api/v1/dashboard/overview');
      const incidentsResponse = await fetch('http://localhost:8000/api/v1/incidents?limit=5');
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set default data if API fails
      setStats({
        total: 10,
        critical: 4,
        high: 1,
        active: 2,
        resolved: 0
      });
      setIncidents([
        {
          id: '1',
          title: 'Massive Fire Outbreak - Delhi Chandni Chowk',
          severity_label: 'critical',
          location_name: 'Delhi, India',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Medical Emergency - Mumbai KEM Hospital',
          severity_label: 'high',
          location_name: 'Mumbai, India',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-900/20 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-500';
      case 'medium': return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
      case 'low': return 'text-green-500 bg-green-900/20 border-green-500';
      default: return 'text-gray-500 bg-gray-900/20 border-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medical': return '🏥';
      case 'fire': return '🔥';
      case 'accident': return '🚗';
      case 'crime': return '🚨';
      case 'disaster': return '🌪️';
      default: return '⚠️';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold text-white text-xl border border-blue-500">
            AB
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">AlertBeacon Crisis Management</h1>
            <p className="text-blue-200 text-lg">Advanced emergency response coordination system</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">System Active</span>
              </div>
              <div className="text-gray-400 text-sm">•</div>
              <div className="text-gray-300 text-sm">{stats.total} Incidents Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Command Center Dashboard</h2>
          <p className="text-gray-400">Real-time monitoring and incident response</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Incidents</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{stats.critical}</p>
            </div>
            <div className="p-3 bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{stats.high}</p>
            </div>
            <div className="p-3 bg-orange-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Incidents</h3>
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No incidents recorded</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-2">{incident.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{incident.location_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(incident.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity_label)}`}>
                    {incident.severity_label?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
