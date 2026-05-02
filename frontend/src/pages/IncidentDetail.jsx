import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';
import { toast } from 'sonner';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedIncident, 
    loading, 
    fetchIncident, 
    updateIncidentStatus 
  } = useAlertBeaconStore();

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIncident(id);
    }
  }, [id]);

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

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateIncidentStatus(id, newStatus);
      toast.success(`Incident status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading.incidents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!selectedIncident) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p className="text-lg">Incident not found</p>
        <button
          onClick={() => navigate('/incidents')}
          className="mt-4 text-blue-500 hover:text-blue-400"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/incidents')}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Details</h1>
          <p className="text-gray-400">View and manage crisis incident information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">{getCategoryIcon(selectedIncident.category)}</span>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {selectedIncident.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm rounded-full border ${getSeverityColor(selectedIncident.severity_label)}`}>
                      {selectedIncident.severity_label?.toUpperCase()} - {selectedIncident.severity_score?.toFixed(1)}/10
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedIncident.status)}`}>
                      {selectedIncident.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {selectedIncident.status !== 'active' && (
                <button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={updating}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Activity className="h-3 w-3" />
                  Mark Active
                </button>
              )}
              {selectedIncident.status !== 'responding' && (
                <button
                  onClick={() => handleStatusUpdate('responding')}
                  disabled={updating}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Mark Responding
                </button>
              )}
              {selectedIncident.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={updating}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-3 w-3" />
                  Mark Resolved
                </button>
              )}
            </div>
          </div>

          {/* AI Summary */}
          {selectedIncident.ai_summary && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Analysis Summary
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {selectedIncident.ai_summary}
              </p>
            </div>
          )}

          {/* Raw Content */}
          {selectedIncident.raw_content && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Original Content</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {selectedIncident.raw_content}
                </p>
              </div>
            </div>
          )}

          {/* Urgency Keywords */}
          {selectedIncident.urgency_keywords?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Urgency Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {selectedIncident.urgency_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Location
            </h3>
            <div className="space-y-2">
              <p className="text-gray-300">
                {selectedIncident.location_name || 'Unknown Location'}
              </p>
              {selectedIncident.latitude && selectedIncident.longitude && (
                <div className="text-sm text-gray-500">
                  Lat: {selectedIncident.latitude}, Lng: {selectedIncident.longitude}
                </div>
              )}
              {selectedIncident.source_url && (
                <a
                  href={selectedIncident.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Source
                </a>
              )}
            </div>
          </div>

          {/* Impact */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Impact
            </h3>
            <div className="space-y-3">
              {selectedIncident.affected_count && (
                <div>
                  <span className="text-gray-500 text-sm">Affected Count:</span>
                  <p className="text-white font-medium">
                    {selectedIncident.affected_count.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500 text-sm">Confidence Score:</span>
                <p className="text-white font-medium">
                  {selectedIncident.confidence_score 
                    ? `${(selectedIncident.confidence_score * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Severity Score:</span>
                <p className="text-white font-medium">
                  {selectedIncident.severity_score?.toFixed(1) || 'N/A'}/10
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Metadata</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Category:</span>
                <p className="text-white font-medium capitalize">
                  {selectedIncident.category || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Source Type:</span>
                <p className="text-white font-medium capitalize">
                  {selectedIncident.source_type || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Created:</span>
                <p className="text-white font-medium">
                  {new Date(selectedIncident.created_at).toLocaleString()}
                </p>
              </div>
              {selectedIncident.resolved_at && (
                <div>
                  <span className="text-gray-500 text-sm">Resolved:</span>
                  <p className="text-white font-medium">
                    {new Date(selectedIncident.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
