import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Clock,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';

const Incidents = () => {
  const { 
    incidents, 
    loading, 
    filters, 
    setFilters, 
    fetchIncidents,
    updateIncidentStatus 
  } = useAlertBeaconStore();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    fetchIncidents({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    });
  }, [pagination.page, pagination.limit, filters]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-900/20 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-500';
      case 'medium': return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
      case 'low': return 'text-green-500 bg-green-900/20 border-green-500';
      default: return 'text-gray-500 bg-gray-900/20 border-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-blue-500 bg-blue-900/20 border-blue-500';
      case 'active': return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
      case 'responding': return 'text-orange-500 bg-orange-900/20 border-orange-500';
      case 'resolved': return 'text-green-500 bg-green-900/20 border-green-500';
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
      case 'infrastructure': return '🏗️';
      case 'shelter': return '🏠';
      case 'food': return '🍔';
      case 'safety': return '🛡️';
      default: return '⚠️';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusUpdate = async (incidentId, newStatus) => {
    await updateIncidentStatus(incidentId, newStatus);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Incidents</h1>
        <p className="text-gray-400">View and manage all crisis incidents</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <select
            value={filters.severity || ''}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="medical">Medical</option>
            <option value="fire">Fire</option>
            <option value="accident">Accident</option>
            <option value="crime">Crime</option>
            <option value="disaster">Disaster</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="shelter">Shelter</option>
            <option value="food">Food</option>
            <option value="safety">Safety</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="responding">Responding</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading.incidents ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">No incidents found</p>
            <p className="text-sm mt-2">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getCategoryIcon(incident.category)}</span>
                        <div>
                          <h3 className="text-white font-medium">{incident.title}</h3>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {incident.ai_summary || incident.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{incident.location_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(incident.severity_label)}`}>
                        {incident.severity_label?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(incident.status)}`}>
                          {incident.status?.toUpperCase()}
                        </span>
                        {/* Quick status actions */}
                        <div className="flex gap-1">
                          {incident.status !== 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(incident.id, 'active')}
                              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                            >
                              Active
                            </button>
                          )}
                          {incident.status !== 'responding' && (
                            <button
                              onClick={() => handleStatusUpdate(incident.id, 'responding')}
                              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                            >
                              Responding
                            </button>
                          )}
                          {incident.status !== 'resolved' && (
                            <button
                              onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                            >
                              Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">
                        {incident.confidence_score ? `${(incident.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(incident.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} incidents
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </button>
            <span className="text-gray-400 px-3">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === totalPages}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
