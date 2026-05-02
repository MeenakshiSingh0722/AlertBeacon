import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  FileText,
  BarChart3,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';
import { demoService } from '../services/demoService';
import { toast } from 'sonner';

const Dashboard = () => {
  const { 
    stats, 
    incidents, 
    loading, 
    fetchStats, 
    fetchIncidents, 
    analyzeCrisis,
    openCrisisPopup 
  } = useAlertBeaconStore();

  const [simulating, setSimulating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      // Use the store methods properly
      await Promise.all([
        fetchStats(),
        fetchIncidents({ limit: 10 })
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSimulateCrisis = async () => {
    setSimulating(true);
    try {
      const result = await demoService.simulateCrisis();
      toast.success('Crisis simulation completed!');
      
      // Refresh data
      await Promise.all([
        fetchStats(),
        fetchIncidents({ limit: 10 })
      ]);

      // If high/critical, show popup
      if (result.severity === 'high' || result.severity === 'critical') {
        // Get the latest incident to show in popup
        const updatedIncidents = await fetchIncidents({ limit: 1 });
        if (updatedIncidents[0]) {
          openCrisisPopup(updatedIncidents[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to simulate crisis');
    } finally {
      setSimulating(false);
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

  if (loading.stats && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <Logo size="large" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">AlertBeacon Crisis Management</h1>
            <p className="text-blue-200 text-lg">Advanced emergency response coordination system</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">System Active</span>
              </div>
              <div className="text-gray-400 text-sm">•</div>
              <div className="text-gray-300 text-sm">{stats?.overview?.total || 0} Incidents Tracked</div>
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
          <button
            onClick={handleSimulateCrisis}
            disabled={simulating}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className={`h-4 w-4 ${simulating ? 'animate-pulse' : ''}`} />
            {simulating ? 'Simulating...' : 'Simulate Crisis'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Incidents</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.overview?.total || 0}
              </p>
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
              <p className="text-2xl font-bold text-red-500 mt-1">
                {stats?.overview?.critical || 0}
              </p>
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
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {stats?.overview?.high || 0}
              </p>
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
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {stats?.overview?.active || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Incidents</h2>
            <Link to="/incidents" className="text-blue-500 hover:text-blue-400 text-sm">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {loading.incidents ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No incidents yet</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(incident.category)}</span>
                        <h3 className="text-white font-medium">{incident.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{incident.location_name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(incident.severity_label)}`}>
                        {incident.severity_label?.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(incident.confidence_score * 100).toFixed(0)}% conf
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Category Breakdown</h2>
          
          {stats?.categories ? (
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="text-gray-300 capitalize">{category}</span>
                  </div>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p>No category data</p>
            </div>
          )}
        </div>
      </div>

      {/* Severity Trend */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Severity Distribution</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Critical', count: stats?.overview?.critical || 0, color: 'bg-red-500' },
            { label: 'High', count: stats?.overview?.high || 0, color: 'bg-orange-500' },
            { label: 'Medium', count: stats?.overview?.medium || 0, color: 'bg-yellow-500' },
            { label: 'Low', count: stats?.overview?.low || 0, color: 'bg-green-500' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="h-20 bg-gray-800 rounded-lg flex items-end justify-center p-2">
                <div 
                  className={`${item.color} rounded-t transition-all duration-500`}
                  style={{ 
                    height: `${Math.max(20, (item.count / Math.max(...Object.values(stats?.overview || {}))) * 60)}px`,
                    width: '100%'
                  }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">{item.label}</p>
              <p className="text-white font-bold">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
