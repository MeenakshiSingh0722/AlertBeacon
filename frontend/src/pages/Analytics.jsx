import { useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity,
  CheckCircle
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';

const Analytics = () => {
  const { stats, loading, fetchStats } = useAlertBeaconStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medical': return '🏥';
      case 'fire': return '🔥';
      case 'accident': return '🚗';
      case 'crime': return '🚨';
      case 'disaster': return '🌪️';
      case 'infrastructure': return '🏗️';
      case 'shelter': return '🏠';
      case 'food': return '🍔';
      case 'safety': return '🛡️';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading.stats && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const categories = stats?.categories || {};
  const trends = stats?.trends || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400">Comprehensive insights and trends</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Incidents</p>
              <p className="text-2xl font-bold text-white mt-1">
                {overview.total || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {overview.active || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {overview.resolved || 0}
              </p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolution Rate</p>
              <p className="text-2xl font-bold text-blue-500 mt-1">
                {overview.total > 0 
                  ? `${((overview.resolved / overview.total) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            Severity Distribution
          </h2>
          
          <div className="space-y-4">
            {[
              { label: 'Critical', count: overview.critical || 0, color: 'bg-red-500' },
              { label: 'High', count: overview.high || 0, color: 'bg-orange-500' },
              { label: 'Medium', count: overview.medium || 0, color: 'bg-yellow-500' },
              { label: 'Low', count: overview.low || 0, color: 'bg-green-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${overview.total > 0 ? (item.count / overview.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Category Breakdown
          </h2>
          
          {Object.keys(categories).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(categories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="text-gray-300 capitalize">{category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max(5, (count / Math.max(...Object.values(categories))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-white font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Incident Trends
        </h2>
        
        {trends.length > 0 ? (
          <div className="space-y-4">
            {/* Simple trend visualization */}
            <div className="grid grid-cols-7 gap-2">
              {trends.slice(-7).map((trend, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(trend.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="h-20 bg-gray-800 rounded flex items-end justify-center p-1">
                    <div
                      className="bg-green-500 rounded-t transition-all duration-500"
                      style={{ 
                        height: `${Math.max(10, (trend.count / Math.max(...trends.map(t => t.count))) * 60)}px`,
                        width: '100%'
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {trend.count}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Peak Day</p>
                <p className="text-white font-medium">
                  {trends.length > 0 ? 
                    new Date(trends.reduce((max, trend) => 
                      trend.count > max.count ? trend : max
                    ).date).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Average Daily</p>
                <p className="text-white font-medium">
                  {trends.length > 0 ? 
                    (trends.reduce((sum, trend) => sum + trend.count, 0) / trends.length).toFixed(1) : 
                    '0'
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total Period</p>
                <p className="text-white font-medium">
                  {trends.reduce((sum, trend) => sum + trend.count, 0)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p>No trend data available</p>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Most Critical Category</h3>
            <p className="text-gray-400 text-sm">
              {Object.keys(categories).length > 0 ? 
                Object.entries(categories)
                  .sort(([,a], [,b]) => b - a)[0][0].charAt(0).toUpperCase() + 
                  Object.entries(categories)
                    .sort(([,a], [,b]) => b - a)[0][0].slice(1) : 
                'No data'
              }
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Response Rate</h3>
            <p className="text-gray-400 text-sm">
              {overview.total > 0 ? 
                `${((overview.resolved / overview.total) * 100).toFixed(1)}% resolved` : 
                'No incidents'
              }
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Critical Incidents</h3>
            <p className="text-gray-400 text-sm">
              {overview.critical || 0} critical cases requiring immediate attention
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Active Response</h3>
            <p className="text-gray-400 text-sm">
              {overview.active || 0} incidents currently being responded to
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
