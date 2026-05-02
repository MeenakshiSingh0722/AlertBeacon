import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  MapPin, 
  AlertTriangle, 
  Activity,
  CheckCircle,
  X,
  TrendingUp,
  Users,
  Shield,
  Clock
} from 'lucide-react';

// Types for Intelligence Engine
interface DataSource {
  id: string;
  name: string;
  type: 'user_report' | 'gps' | 'iot_sensor' | 'social_media' | 'emergency_api' | 'device_signal';
  status: 'active' | 'inactive';
  lastUpdate: string;
}

interface RawAlert {
  id: string;
  source: string;
  content: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    analysis?: any;
  };
  timestamp: string;
  confidence?: number;
}

interface ProcessedAlert {
  alert_id: string;
  type: 'medical' | 'fire' | 'accident' | 'crime' | 'disaster' | 'unknown';
  severity: number; // 0-100
  confidence: number; // 0-100
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'verified' | 'unverified' | 'escalated';
  summary: string;
  recommended_response: string[];
  time_detected: string;
  cluster_id?: string;
  risk_zone: boolean;
}

interface Cluster {
  id: string;
  center: { lat: number; lng: number };
  radius: number; // km
  alertCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
}

export default function IntelligenceEngine() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: '1', name: 'User Reports', type: 'user_report', status: 'active', lastUpdate: '2 mins ago' },
    { id: '2', name: 'GPS Location Services', type: 'gps', status: 'active', lastUpdate: '1 min ago' },
    { id: '3', name: 'IoT Environmental Sensors', type: 'iot_sensor', status: 'active', lastUpdate: '30 secs ago' },
    { id: '4', name: 'Social Media Monitoring', type: 'social_media', status: 'active', lastUpdate: '45 secs ago' },
    { id: '5', name: 'Emergency APIs', type: 'emergency_api', status: 'active', lastUpdate: '5 mins ago' },
    { id: '6', name: 'Device Panic Signals', type: 'device_signal', status: 'inactive', lastUpdate: '2 hours ago' }
  ]);

  const [rawAlerts, setRawAlerts] = useState<RawAlert[]>([]);
  const [processedAlerts, setProcessedAlerts] = useState<ProcessedAlert[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ProcessedAlert | null>(null);

  // Emergency classification logic
  const classifyEmergency = useCallback((content: string, location?: any, media?: any): ProcessedAlert['type'] => {
    const lowerContent = content.toLowerCase();
    
    // Medical emergency keywords
    const medicalKeywords = ['medical', 'ambulance', 'hospital', 'doctor', 'injury', 'bleeding', 'unconscious', 'heart attack', 'stroke', 'breathing', 'cpr', 'emergency room'];
    
    // Fire emergency keywords
    const fireKeywords = ['fire', 'burning', 'smoke', 'flames', 'explosion', 'blaze', 'forest fire', 'building fire'];
    
    // Accident keywords
    const accidentKeywords = ['accident', 'crash', 'collision', 'car crash', 'traffic', 'pileup', 'wreck', 'highway', 'road block'];
    
    // Crime/Violence keywords
    const crimeKeywords = ['crime', 'violence', 'assault', 'robbery', 'shooting', 'fight', 'weapon', 'police', 'help', 'danger'];
    
    // Natural disaster keywords
    const disasterKeywords = ['earthquake', 'flood', 'tsunami', 'hurricane', 'tornado', 'storm', 'landslide', 'volcano', 'evacuation'];

    // Count keyword matches for each category
    const medicalScore = medicalKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    const fireScore = fireKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    const accidentScore = accidentKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    const crimeScore = crimeKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    const disasterScore = disasterKeywords.filter(keyword => lowerContent.includes(keyword)).length;

    // Find category with highest score
    const scores = {
      medical: medicalScore,
      fire: fireScore,
      accident: accidentScore,
      crime: crimeScore,
      disaster: disasterScore
    };

    const maxScore = Math.max(...Object.values(scores));
    const detectedType = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as ProcessedAlert['type'];

    return detectedType || 'unknown';
  }, []);

  // Severity scoring algorithm
  const calculateSeverity = useCallback((content: string, location?: any, media?: any, multipleReports: number = 1): number => {
    let severityScore = 0;
    const lowerContent = content.toLowerCase();

    // Keyword urgency scoring
    const urgentKeywords = ['critical', 'life threatening', 'immediate', 'urgent', 'emergency', 'help', 'sos', '911', 'bleeding', 'unconscious', 'heart attack'];
    const urgentMatches = urgentKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    severityScore += urgentMatches * 15;

    // Location density scoring (crowded areas = higher risk)
    if (location) {
      // Simulate location density check
      const highDensityAreas = ['hospital', 'school', 'mall', 'stadium', 'airport', 'train station', 'market'];
      const isHighDensity = highDensityAreas.some(area => 
        location.address && location.address.toLowerCase().includes(area)
      );
      severityScore += isHighDensity ? 10 : 0;
    }

    // Repeated reports scoring
    severityScore += Math.min(multipleReports * 8, 24);

    // Media analysis scoring
    if (media && media.type === 'image') {
      severityScore += 5; // Visual evidence increases credibility
    }
    if (media && media.type === 'video') {
      severityScore += 8; // Video evidence increases credibility more
    }

    // Emergency keyword presence
    const emergencyKeywords = ['help', 'emergency', 'sos', 'urgent', 'immediate'];
    const emergencyMatches = emergencyKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    severityScore += emergencyMatches * 12;

    return Math.min(severityScore, 100);
  }, []);

  // Verification logic
  const verifyAlert = useCallback((alert: RawAlert, existingAlerts: ProcessedAlert[]): { status: 'verified' | 'unverified' | 'escalated', confidence: number } => {
    // Cross-check multiple reports in same location
    const nearbyReports = existingAlerts.filter(existing => {
      if (!alert.location || !existing.location) return false;
      const distance = calculateDistance(alert.location, existing.location);
      return distance <= 5; // Within 5km
    });

    // Validate media consistency with text
    let mediaConsistency = true;
    if (alert.media) {
      const hasVisualKeywords = ['fire', 'accident', 'injury', 'damage', 'blood'];
      const hasVisualEvidence = hasVisualKeywords.some(keyword => 
        alert.content.toLowerCase().includes(keyword)
      );
      mediaConsistency = hasVisualEvidence;
    }

    // Detect spam/fake patterns
    const spamPatterns = [
      /test/i,
      /fake/i,
      /drill/i,
      /practice/i,
      /joke/i
    ];
    
    const isSpam = spamPatterns.some(pattern => pattern.test(alert.content));
    
    // Calculate confidence
    let confidence = 50 + (nearbyReports.length * 10);
    if (mediaConsistency) confidence += 15;
    if (isSpam) confidence -= 30;
    if (alert.confidence) confidence = Math.min(confidence, alert.confidence);

    return {
      status: confidence < 60 ? 'unverified' : 'verified',
      confidence: Math.max(0, Math.min(100, confidence))
    };
  }, []);

  // Distance calculation helper
  const calculateDistance = (loc1: any, loc2: any): number => {
    if (!loc1 || !loc2 || !loc1.lat || !loc2.lat) return Infinity;
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
               Math.cos(loc1.lat * Math.PI/180) * Math.cos(loc2.lat * Math.PI/180) * 
               Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
    return R * c;
  };

  // Geo-clustering logic
  const updateClusters = useCallback((alerts: ProcessedAlert[]): Cluster[] => {
    const clusterRadius = 5; // km
    const newClusters: Cluster[] = [];
    const processed = new Set<string>();

    alerts.forEach(alert => {
      if (processed.has(alert.alert_id)) return;
      processed.add(alert.alert_id);

      // Find nearby alerts for clustering
      const nearbyAlerts = alerts.filter(other => {
        if (other.alert_id === alert.alert_id) return false;
        const distance = calculateDistance(alert.location, other.location);
        return distance <= clusterRadius;
      });

      if (nearbyAlerts.length >= 2) {
        // Calculate cluster center
        const centerLat = nearbyAlerts.reduce((sum, a) => sum + a.location.lat, alert.location.lat) / (nearbyAlerts.length + 1);
        const centerLng = nearbyAlerts.reduce((sum, a) => sum + a.location.lng, alert.location.lng) / (nearbyAlerts.length + 1);

        // Determine cluster severity
        const avgSeverity = nearbyAlerts.reduce((sum, a) => sum + a.severity, alert.severity) / (nearbyAlerts.length + 1);
        const clusterSeverity = avgSeverity > 70 ? 'critical' : avgSeverity > 50 ? 'high' : avgSeverity > 30 ? 'medium' : 'low';

        // Determine cluster type (most common)
        const typeCounts = nearbyAlerts.reduce((acc, a) => {
          acc[a.type] = (acc[a.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const clusterType = Object.keys(typeCounts).reduce((a, b) => 
          typeCounts[a] > typeCounts[b] ? a : b
        );

        newClusters.push({
          id: `cluster_${newClusters.length + 1}`,
          center: { lat: centerLat, lng: centerLng },
          radius: clusterRadius,
          alertCount: nearbyAlerts.length + 1,
          severity: clusterSeverity,
          type: clusterType
        });
      }
    });

    return newClusters;
  }, []);

  // Process new alerts
  const processAlerts = useCallback(() => {
    setIsProcessing(true);
    
    // Simulate receiving new raw alerts
    const newRawAlerts: RawAlert[] = [
      {
        id: `alert_${Date.now()}_1`,
        source: 'user_report',
        content: 'Person collapsed at MG Road, needs immediate medical attention',
        location: { lat: 18.5204, lng: 73.8567, address: 'MG Road, Pune' },
        timestamp: new Date().toISOString(),
        confidence: 85
      },
      {
        id: `alert_${Date.now()}_2`,
        source: 'social_media',
        content: 'Fire reported in commercial building at Koramangala',
        location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' },
        media: { type: 'image', url: '/placeholder-image.jpg' },
        timestamp: new Date().toISOString(),
        confidence: 75
      },
      {
        id: `alert_${Date.now()}_3`,
        source: 'gps',
        content: 'Multiple car accident on Highway 44, traffic blocked',
        location: { lat: 19.0760, lng: 72.8777, address: 'Highway 44, Mumbai-Pune Expressway' },
        timestamp: new Date().toISOString(),
        confidence: 90
      }
    ];

    setRawAlerts(prev => [...prev, ...newRawAlerts]);

    // Process each alert
    const newProcessedAlerts: ProcessedAlert[] = newRawAlerts.map(rawAlert => {
      const type = classifyEmergency(rawAlert.content, rawAlert.location, rawAlert.media);
      const severity = calculateSeverity(rawAlert.content, rawAlert.location, rawAlert.media, 1);
      const verification = verifyAlert(rawAlert, processedAlerts);
      
      return {
        alert_id: rawAlert.id,
        type,
        severity,
        confidence: verification.confidence,
        status: verification.status,
        summary: rawAlert.content,
        recommended_response: getRecommendedResponse(type, severity),
        time_detected: rawAlert.timestamp,
        risk_zone: severity > 70,
        location: rawAlert.location ? 
          { lat: rawAlert.location.lat, lng: rawAlert.location.lng, address: rawAlert.location.address || 'Unknown Location' } : 
          { lat: 0, lng: 0, address: 'Unknown Location' }
      };
    });

    setProcessedAlerts(prev => [...prev, ...newProcessedAlerts]);
    
    // Update clusters
    const allAlerts = [...processedAlerts, ...newProcessedAlerts];
    const newClusters = updateClusters(allAlerts);
    setClusters(newClusters);

    setIsProcessing(false);
  }, [classifyEmergency, calculateSeverity, verifyAlert, updateClusters]);

  // Get recommended response based on type and severity
  const getRecommendedResponse = (type: ProcessedAlert['type'], severity: number): string[] => {
    const baseResponses = {
      medical: ['ambulance', 'first aid', 'medical team'],
      fire: ['fire brigade', 'firefighters', 'evacuation'],
      accident: ['police', 'traffic control', 'emergency services'],
      crime: ['police', 'security', 'law enforcement'],
      disaster: ['emergency services', 'evacuation teams', 'disaster response'],
      unknown: ['emergency services', 'investigation']
    };

    const responses = baseResponses[type] || baseResponses.unknown;
    
    // Add urgency-based responses
    if (severity > 70) {
      responses.push('immediate response required', 'escalate to authorities');
    }
    
    return responses;
  };

  // Get severity color and label
  const getSeverityInfo = (severity: number) => {
    if (severity <= 30) return { color: 'bg-green-100 text-green-700', label: 'Low' };
    if (severity <= 60) return { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' };
    if (severity <= 80) return { color: 'bg-orange-100 text-orange-700', label: 'High' };
    return { color: 'bg-red-100 text-red-700', label: 'Critical' };
  };

  const getTypeIcon = (type: ProcessedAlert['type']) => {
    const icons = {
      medical: Activity,
      fire: AlertTriangle,
      accident: TrendingUp,
      crime: Shield,
      disaster: AlertTriangle,
      unknown: Brain
    };
    return icons[type] || icons.unknown;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                AlertBeacon Intelligence Engine
              </h1>
              <p className="text-gray-600">Real-time crisis detection and emergency response AI</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={isProcessing ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                {isProcessing ? "Processing" : "Active"}
              </Badge>
              <Button 
                onClick={processAlerts}
                disabled={isProcessing}
                className="gap-1"
              >
                <Activity className="h-4 w-4" />
                Process New Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSources.map(source => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        source.type === 'user_report' ? 'bg-blue-500' :
                        source.type === 'gps' ? 'bg-green-500' :
                        source.type === 'iot_sensor' ? 'bg-purple-500' :
                        source.type === 'social_media' ? 'bg-orange-500' :
                        source.type === 'emergency_api' ? 'bg-red-500' :
                        source.type === 'device_signal' ? 'bg-gray-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{source.name}</div>
                        <div className="text-xs text-gray-500">{source.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={source.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {source.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processed Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Processed Alerts ({processedAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {processedAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No alerts processed yet</p>
                    <p className="text-sm">Click "Process New Alerts" to simulate incoming emergency data</p>
                  </div>
                ) : (
                  processedAlerts.map(alert => {
                    const severityInfo = getSeverityInfo(alert.severity);
                    const TypeIcon = getTypeIcon(alert.type);
                    
                    return (
                      <div 
                        key={alert.alert_id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <TypeIcon className="h-4 w-4" />
                              <Badge className={severityInfo.color}>
                                {alert.type.toUpperCase()}
                              </Badge>
                              <Badge className={severityInfo.color}>
                                {severityInfo.label}
                              </Badge>
                              <Badge className={alert.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{alert.summary}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.location.address}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{new Date(alert.time_detected).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Confidence: {alert.confidence}%</div>
                            {alert.risk_zone && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                Risk Zone
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clusters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Emergency Clusters ({clusters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {clusters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No clusters detected</p>
                    <p className="text-sm">Clusters form when multiple alerts are in close proximity</p>
                  </div>
                ) : (
                  clusters.map(cluster => (
                    <div key={cluster.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityInfo(cluster.severity === 'critical' ? 90 : cluster.severity === 'high' ? 70 : cluster.severity === 'medium' ? 50 : 30).color}>
                            {cluster.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {cluster.alertCount} alerts within {cluster.radius}km
                          </span>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">
                          Hotspot
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Center: {cluster.center.lat.toFixed(4)}, {cluster.center.lng.toFixed(4)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Alert Details */}
        {selectedAlert && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Alert Details: {selectedAlert.alert_id}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedAlert(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Classification</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge className="bg-blue-100 text-blue-700">
                          {selectedAlert.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Severity:</span>
                        <Badge className={getSeverityInfo(selectedAlert.severity).color}>
                          {getSeverityInfo(selectedAlert.severity).label} ({selectedAlert.severity}/100)
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={selectedAlert.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {selectedAlert.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{selectedAlert.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Response Recommendations</h4>
                    <div className="space-y-1">
                      {selectedAlert.recommended_response.map((response, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{response}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Location & Timing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <span className="text-gray-900">{selectedAlert.location.address}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Coordinates:</span>
                      <span className="text-gray-900">
                        {selectedAlert.location.lat.toFixed(4)}, {selectedAlert.location.lng.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Detected:</span>
                      <span className="text-gray-900">
                        {new Date(selectedAlert.time_detected).toLocaleString()}
                      </span>
                    </div>
                    {selectedAlert.cluster_id && (
                      <div>
                        <span className="text-gray-600">Cluster:</span>
                        <Badge className="bg-purple-100 text-purple-700">
                          {selectedAlert.cluster_id}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
