import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, MapPin, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAlertBeaconStore from '../../store/useAlertBeaconStore';
import { toast } from 'sonner';

const CrisisPopup = () => {
  const navigate = useNavigate();
  const { crisisPopupIncident, closeCrisisPopup } = useAlertBeaconStore();
  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (crisisPopupIncident) {
      // Show toast notification
      const severity = crisisPopupIncident.severity_label;
      const title = crisisPopupIncident.title;
      toast.error(`${severity.toUpperCase()} crisis detected: ${title}`, {
        duration: 5000,
        position: 'top-right'
      });

      // Play alert sound (optional)
      if (soundEnabled) {
        playAlertSound(severity);
      }

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        closeCrisisPopup();
      }, 10000);

      return () => {
        clearTimeout(timer);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [crisisPopupIncident, closeCrisisPopup, soundEnabled]);

  const playAlertSound = (severity) => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequency for critical vs high
      oscillator.frequency.value = severity === 'critical' ? 800 : 600;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play alert sound:', error);
    }
  };

  if (!crisisPopupIncident) return null;

  const isCritical = crisisPopupIncident.severity_label === 'critical';
  const severityColor = isCritical ? 'bg-red-500' : 'bg-orange-500';
  const severityBg = isCritical ? 'bg-red-900/20 border-red-500' : 'bg-orange-900/20 border-orange-500';

  const handleViewIncident = () => {
    navigate(`/incidents/${crisisPopupIncident.id}`);
    closeCrisisPopup();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full shadow-2xl transform transition-all duration-300 animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4">
        {/* Header */}
        <div className={`${severityBg} border-b-2 p-4 rounded-t-xl`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`${severityColor} p-2 rounded-full animate-pulse`}>
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {isCritical ? 'CRITICAL ALERT' : 'HIGH ALERT'}
                </h3>
                <p className="text-gray-300 text-sm">
                  Severity: {crisisPopupIncident.severity_score?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title={soundEnabled ? "Mute sound" : "Enable sound"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={closeCrisisPopup}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h4 className="text-white font-semibold text-lg mb-2">
            {crisisPopupIncident.title}
          </h4>

          {/* Location */}
          {crisisPopupIncident.location_name && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
              <MapPin className="h-4 w-4" />
              <span>{crisisPopupIncident.location_name}</span>
            </div>
          )}

          {/* AI Summary */}
          {crisisPopupIncident.ai_summary && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {crisisPopupIncident.ai_summary}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            {crisisPopupIncident.category && (
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="text-gray-300 ml-2 capitalize">
                  {crisisPopupIncident.category}
                </span>
              </div>
            )}
            {crisisPopupIncident.confidence_score && (
              <div>
                <span className="text-gray-500">Confidence:</span>
                <span className="text-gray-300 ml-2">
                  {(crisisPopupIncident.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {crisisPopupIncident.affected_count && (
              <div>
                <span className="text-gray-500">Affected:</span>
                <span className="text-gray-300 ml-2">
                  {crisisPopupIncident.affected_count.toLocaleString()}
                </span>
              </div>
            )}
            {crisisPopupIncident.created_at && (
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="text-gray-300 ml-2">
                  {new Date(crisisPopupIncident.created_at).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {/* Urgency Keywords */}
          {crisisPopupIncident.urgency_keywords?.length > 0 && (
            <div className="mb-4">
              <span className="text-gray-500 text-sm">Urgency Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {crisisPopupIncident.urgency_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleViewIncident}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Incident
            </button>
            <button
              onClick={() => {
                // Mark as read logic would go here
                closeCrisisPopup();
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Mark as Read
            </button>
            <button
              onClick={closeCrisisPopup}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Auto-dismiss notice */}
        <div className="text-center py-2 border-t border-gray-700">
          <p className="text-gray-500 text-xs">
            Auto-dismissing in 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrisisPopup;
