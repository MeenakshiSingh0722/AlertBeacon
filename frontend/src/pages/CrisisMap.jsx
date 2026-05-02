import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Map, 
  Filter, 
  MapPin, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';

const CrisisMap = () => {
  const { 
    incidents, 
    loading, 
    filters, 
    setFilters, 
    fetchIncidents 
  } = useAlertBeaconStore();

  const [mapIncidents, setMapIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    fetchMapIncidents();
  }, [filters]);

  const fetchMapIncidents = async () => {
    try {
      const data = await fetchIncidents({
        ...filters,
        limit: 100 // Get more incidents for map view
      });
      setMapIncidents(data || []);
    } catch (error) {
      console.error('Failed to fetch map incidents:', error);
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

  const getSeverityBorderColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
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
  };

  const incidentsWithLocation = mapIncidents.filter(inc => inc.latitude && inc.longitude);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Crisis Map</h1>
        <p className="text-gray-400">Geographic view of ongoing crisis incidents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h3>
            
            <div className="space-y-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity || ''}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="responding">Responding</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Incidents:</span>
                    <span className="text-white">{incidentsWithLocation.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">With Location:</span>
                    <span className="text-white">{incidentsWithLocation.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical:</span>
                    <span className="text-red-500">
                      {incidentsWithLocation.filter(inc => inc.severity_label === 'critical').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High:</span>
                    <span className="text-orange-500">
                      {incidentsWithLocation.filter(inc => inc.severity_label === 'high').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {/* Map Placeholder */}
            <div className="relative h-96 lg:h-full min-h-96 bg-gray-800">
              {/* Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-8 grid-rows-8 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="border border-gray-700"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Incident Pins */}
              {incidentsWithLocation.map((incident, index) => {
                // Simple positioning based on coordinates (normalized)
                const x = ((parseFloat(incident.longitude) + 180) / 360) * 100;
                const y = ((90 - parseFloat(incident.latitude)) / 180) * 100;
                
                return (
                  <div
                    key={incident.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    {/* Pin */}
                    <div className={`w-4 h-4 ${getSeverityColor(incident.severity_label)} rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform`}>
                      <div className={`absolute inset-0 ${getSeverityColor(incident.severity_label)} rounded-full animate-ping opacity-75`}></div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-gray-400">{incident.severity_label?.toUpperCase()}</div>
                    </div>
                  </div>
                );
              })}

              {/* No Incidents Message */}
              {incidentsWithLocation.length === 0 && !loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No incidents with location data</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting filters or check back later</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Map Legend */}
              <div className="absolute top-4 right-4 bg-gray-900/90 border border-gray-700 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-300 mb-2">Severity</h4>
                <div className="space-y-1">
                  {['critical', 'high', 'medium', 'low'].map(severity => (
                    <div key={severity} className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${getSeverityColor(severity)} rounded-full`}></div>
                      <span className="text-xs text-gray-400 capitalize">{severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Incident Popup */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCategoryIcon(selectedIncident.category)}</span>
                <div>
                  <h3 className="text-white font-semibold">{selectedIncident.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${getSeverityBorderColor(selectedIncident.severity_label)} ${getSeverityColor(selectedIncident.severity_label)}`}>
                    {selectedIncident.severity_label?.toUpperCase()} - {selectedIncident.severity_score?.toFixed(1)}/10
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedIncident.location_name && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedIncident.location_name}</span>
                </div>
              )}
              
              {selectedIncident.ai_summary && (
                <div>
                  <span className="text-gray-500">Summary:</span>
                  <p className="text-gray-300 mt-1">{selectedIncident.ai_summary}</p>
                </div>
              )}

              {selectedIncident.confidence_score && (
                <div>
                  <span className="text-gray-500">Confidence:</span>
                  <span className="text-white ml-2">
                    {(selectedIncident.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              {selectedIncident.affected_count && (
                <div>
                  <span className="text-gray-500">Affected:</span>
                  <span className="text-white ml-2">
                    {selectedIncident.affected_count.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Link
                to={`/incidents/${selectedIncident.id}`}
                onClick={() => setSelectedIncident(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Details
              </Link>
              <button
                onClick={() => setSelectedIncident(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisMap;
