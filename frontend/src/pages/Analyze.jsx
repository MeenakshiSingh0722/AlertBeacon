import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  ExternalLink,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAlertBeaconStore } from '../store/useAlertBeaconStore';
import { toast } from 'sonner';

const Analyze = () => {
  const [formData, setFormData] = useState({
    raw_text: '',
    source_url: ''
  });
  const [result, setResult] = useState(null);
  const { analyzeCrisis, loading, openCrisisPopup } = useAlertBeaconStore();

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
      case 'infrastructure': return '🏗️';
      case 'shelter': return '🏠';
      case 'food': return '🍔';
      case 'safety': return '🛡️';
      default: return '⚠️';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.raw_text.trim()) {
      toast.error('Please enter text to analyze');
      return;
    }

    try {
      const analysisResult = await analyzeCrisis(formData);
      setResult(analysisResult);
      
      if (analysisResult.is_crisis) {
        toast.success('Crisis detected and analyzed!');
        
        // If high/critical, show popup
        if (analysisResult.severity_label === 'high' || analysisResult.severity_label === 'critical') {
          openCrisisPopup(analysisResult);
        }
      } else {
        toast.info('No crisis detected in the provided text');
      }
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData({ raw_text: '', source_url: '' });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Crisis Analyzer</h1>
        <p className="text-gray-400">Paste raw report text and AlertBeacon AI will classify, score, summarize and store the incident.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Input Analysis
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Crisis Text *
                </label>
                <textarea
                  value={formData.raw_text}
                  onChange={(e) => setFormData({ ...formData, raw_text: e.target.value })}
                  placeholder="Paste news/social media/report text here..."
                  className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  placeholder="https://example.com/news-article"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading.analyze || !formData.raw_text.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading.analyze ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI agents are analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Sample Texts */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sample Crisis Texts</h3>
            <div className="space-y-3">
              {[
                {
                  title: "Medical Emergency",
                  text: "Major medical emergency at KEM Hospital Mumbai - over 50 patients affected due to oxygen supply shortage, immediate medical assistance required"
                },
                {
                  title: "Flood Crisis",
                  text: "Severe flooding in Bihar affecting 5000 people in Patna district, food shortage crisis emerging, urgent relief supplies needed"
                },
                {
                  title: "Infrastructure Collapse",
                  text: "Infrastructure collapse in Kerala - bridge collapse on NH-66 near Kozhikode, traffic blocked, emergency services on site"
                }
              ].map((sample, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2">{sample.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">{sample.text}</p>
                  <button
                    onClick={() => setFormData({ ...formData, raw_text: sample.text })}
                    className="text-purple-500 hover:text-purple-400 text-sm"
                  >
                    Use this sample
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  {result.is_crisis ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Crisis Detected
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      No Crisis Detected
                    </>
                  )}
                </h2>
                {result.is_crisis && (
                  <span className={`px-3 py-1 text-sm rounded-full border ${getSeverityColor(result.severity_label)}`}>
                    {result.severity_label?.toUpperCase()} - {result.severity_score?.toFixed(1)}/10
                  </span>
                )}
              </div>

              {/* Analysis Results */}
              <div className="space-y-4">
                {result.title && (
                  <div>
                    <span className="text-gray-500 text-sm">Title:</span>
                    <p className="text-white font-medium">{result.title}</p>
                  </div>
                )}

                {result.category && (
                  <div>
                    <span className="text-gray-500 text-sm">Category:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{getCategoryIcon(result.category)}</span>
                      <span className="text-white font-medium capitalize">{result.category}</span>
                    </div>
                  </div>
                )}

                {result.ai_summary && (
                  <div>
                    <span className="text-gray-500 text-sm">AI Summary:</span>
                    <p className="text-gray-300 mt-1">{result.ai_summary}</p>
                  </div>
                )}

                {result.confidence_score && (
                  <div>
                    <span className="text-gray-500 text-sm">Confidence:</span>
                    <p className="text-white font-medium">
                      {(result.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                )}

                {result.location_name && (
                  <div>
                    <span className="text-gray-500 text-sm">Location:</span>
                    <p className="text-white font-medium">{result.location_name}</p>
                  </div>
                )}

                {result.affected_count && (
                  <div>
                    <span className="text-gray-500 text-sm">Affected Count:</span>
                    <p className="text-white font-medium">
                      {result.affected_count.toLocaleString()}
                    </p>
                  </div>
                )}

                {result.urgency_keywords?.length > 0 && (
                  <div>
                    <span className="text-gray-500 text-sm">Urgency Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.urgency_keywords.map((keyword, index) => (
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

                {result.severity_factors && (
                  <div>
                    <span className="text-gray-500 text-sm">Severity Factors:</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.entries(result.severity_factors).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-white ml-2">{value}/3</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {result.is_crisis && result.id && (
                  <Link
                    to={`/incidents/${result.id}`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Incident
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Analysis Yet</h3>
              <p className="text-gray-500 text-sm">
                Enter crisis text and click "Analyze with AI" to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;
