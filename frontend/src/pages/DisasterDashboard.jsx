import React, { useState, useEffect } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Rss, 
  Info, 
  AlertTriangle,
  Search,
  MapPin,
  Thermometer,
  Cloud,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Bell,
  X,
  Navigation,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DisasterDashboard = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Delhi, India');
  const [weatherData, setWeatherData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [earthquakes, setEarthquakes] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        // Mock weather data
        setWeatherData({
          location: selectedLocation,
          temperature: 28,
          condition: 'Mist',
          humidity: 65,
          windSpeed: 12,
          visibility: 5,
          pressure: 1013,
          hourly: [
            { time: '12:00', temp: 28, condition: 'Mist' },
            { time: '13:00', temp: 29, condition: 'Partly Cloudy' },
            { time: '14:00', temp: 30, condition: 'Partly Cloudy' },
            { time: '15:00', temp: 31, condition: 'Clear' },
            { time: '16:00', temp: 30, condition: 'Clear' },
            { time: '17:00', temp: 29, condition: 'Partly Cloudy' }
          ],
          daily: [
            { day: 'Mon', high: 32, low: 24, condition: 'Partly Cloudy' },
            { day: 'Tue', high: 33, low: 25, condition: 'Clear' },
            { day: 'Wed', high: 31, low: 23, condition: 'Rain' },
            { day: 'Thu', high: 30, low: 22, condition: 'Thunderstorm' },
            { day: 'Fri', high: 29, low: 21, condition: 'Rain' }
          ]
        });

        // Mock alerts data
        setAlerts([
          {
            id: 1,
            title: 'Heavy Rainfall Warning',
            location: 'Delhi, NCR',
            severity: 'high',
            time: '2 hours ago',
            description: 'Heavy rainfall expected in the next 6 hours'
          },
          {
            id: 2,
            title: 'Air Quality Alert',
            location: 'Mumbai, Maharashtra',
            severity: 'moderate',
            time: '4 hours ago',
            description: 'AQI levels above 200, avoid outdoor activities'
          },
          {
            id: 3,
            title: 'Heat Wave Advisory',
            location: 'Jaipur, Rajasthan',
            severity: 'normal',
            time: '6 hours ago',
            description: 'Temperature expected to reach 45°C'
          },
          {
            id: 4,
            title: 'Flood Warning',
            location: 'Patna, Bihar',
            severity: 'high',
            time: '8 hours ago',
            description: 'River levels rising, evacuate low-lying areas'
          }
        ]);

        // Mock earthquake data
        setEarthquakes([
          {
            id: 1,
            magnitude: 4.2,
            location: 'Uttarakhand, India',
            depth: '10 km',
            time: '15 mins ago',
            coordinates: '30.3°N, 78.0°E'
          },
          {
            id: 2,
            magnitude: 3.8,
            location: 'Andaman Islands',
            depth: '35 km',
            time: '2 hours ago',
            coordinates: '12.5°N, 92.8°E'
          },
          {
            id: 3,
            magnitude: 5.1,
            location: 'Nepal-India Border',
            depth: '20 km',
            time: '4 hours ago',
            coordinates: '27.5°N, 86.2°E'
          }
        ]);

        // Mock news data
        setNews([
          {
            id: 1,
            title: 'Thunderstorm expected in Lucknow',
            summary: 'Meteorological department warns of severe thunderstorm in Lucknow region',
            time: '1 hour ago',
            category: 'Weather'
          },
          {
            id: 2,
            title: 'Heavy rainfall warning in Delhi',
            summary: 'IMD issues red alert for heavy rainfall in Delhi-NCR region',
            time: '2 hours ago',
            category: 'Alert'
          },
          {
            id: 3,
            title: 'Monsoon advances further in North India',
            summary: 'Monsoon current progressing well, expected to cover more regions',
            time: '3 hours ago',
            category: 'Weather'
          }
        ]);

        setLoading(false);
      }, 1500);
    };

    loadDashboardData();
  }, [selectedLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setSelectedLocation(searchLocation);
      setSearchLocation('');
      // In real app, would fetch data for new location
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'moderate': return '🟠';
      case 'normal': return '🟡';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400 text-lg">Loading AlertBeacon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Top Navbar */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-blue-800/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AB</span>
              </div>
              <h1 className="text-white font-bold text-xl">AlertBeacon</h1>
            </div>

            {/* Menu Items */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link to="/dashboard" className="text-white font-medium flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link to="/rss" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Rss className="h-4 w-4" />
                RSS Feed
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Info className="h-4 w-4" />
                About
              </Link>
              <Link to="/guidelines" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Do's & Don'ts
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-300 hover:text-white">
              <Navigation className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search location for weather and disaster alerts..."
                className="w-full pl-12 pr-4 py-4 bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SECTION - Map */}
          <div className="space-y-6">
            {/* Interactive Map */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                Disaster Map
              </h2>
              <div className="bg-gray-800/50 rounded-xl h-96 flex items-center justify-center border border-blue-700/30">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-400">Interactive Map View</p>
                  <p className="text-gray-500 text-sm mt-2">Showing disaster markers for {selectedLocation}</p>
                </div>
              </div>
            </div>

            {/* Recent Earthquakes */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-400" />
                Recent Earthquakes
              </h2>
              <div className="space-y-3">
                {earthquakes.map((quake) => (
                  <div key={quake.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-orange-400">{quake.magnitude}</span>
                          <span className="text-gray-300 text-sm">Magnitude</span>
                        </div>
                        <p className="text-white font-medium">{quake.location}</p>
                        <p className="text-gray-400 text-sm">{quake.coordinates} • {quake.depth}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">{quake.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* Alert List Panel */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-400" />
                Active Alerts
              </h2>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`rounded-xl p-4 border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getSeverityIcon(alert.severity)}</span>
                          <h3 className="font-semibold">{alert.title}</h3>
                        </div>
                        <p className="text-sm opacity-75 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-2 text-xs opacity-60">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.location}</span>
                          <span>•</span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Overview */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-400" />
                Weather Overview - {weatherData.location}
              </h2>
              
              {/* Current Weather */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-6 w-6 text-orange-400" />
                      <span className="text-3xl font-bold text-white">{weatherData.temperature}°C</span>
                    </div>
                    <p className="text-white font-medium">{weatherData.condition}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{weatherData.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{weatherData.visibility} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{weatherData.pressure} mb</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="mb-4">
                <h3 className="text-white font-medium mb-3">Hourly Forecast</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {weatherData.hourly.map((hour, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30 min-w-[80px] text-center">
                      <p className="text-gray-400 text-xs">{hour.time}</p>
                      <p className="text-white font-medium">{hour.temp}°</p>
                      <p className="text-gray-400 text-xs">{hour.condition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Forecast */}
              <div>
                <h3 className="text-white font-medium mb-3">5-Day Forecast</h3>
                <div className="space-y-2">
                  {weatherData.daily.map((day, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium w-12">{day.day}</span>
                        <span className="text-gray-400 text-sm">{day.condition}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{day.high}°</span>
                        <span className="text-gray-400">{day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Forecast News */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Rss className="h-5 w-5 text-green-400" />
                Forecast News
              </h2>
              <div className="space-y-3">
                {news.map((article) => (
                  <div key={article.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium flex-1">{article.title}</h3>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{article.summary}</p>
                    <p className="text-gray-500 text-xs">{article.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterDashboard;
