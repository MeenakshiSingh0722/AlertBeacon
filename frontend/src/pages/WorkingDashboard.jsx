import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Thermometer, 
  MapPin, 
  Bell,
  Search,
  Cloud,
  Wind,
  Droplets,
  Home,
  LayoutDashboard,
  Rss,
  Info
} from 'lucide-react';

const WorkingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Delhi, India');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setSelectedLocation(searchLocation);
      setSearchLocation('');
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
              <div className="text-white font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </div>
              <div className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </div>
              <div className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Rss className="h-4 w-4" />
                RSS Feed
              </div>
              <div className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Info className="h-4 w-4" />
                About
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Weather Overview */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-400" />
                Weather Overview - {selectedLocation}
              </h2>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-6 w-6 text-orange-400" />
                      <span className="text-3xl font-bold text-white">28°C</span>
                    </div>
                    <p className="text-white font-medium">Mist</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">65%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">12 km/h</span>
                    </div>
                  </div>
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
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-orange-400">4.2</span>
                        <span className="text-gray-300 text-sm">Magnitude</span>
                      </div>
                      <p className="text-white font-medium">Uttarakhand, India</p>
                      <p className="text-gray-400 text-sm">30.3°N, 78.0°E • 10 km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">15 mins ago</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-orange-400">3.8</span>
                        <span className="text-gray-300 text-sm">Magnitude</span>
                      </div>
                      <p className="text-white font-medium">Andaman Islands</p>
                      <p className="text-gray-400 text-sm">12.5°N, 92.8°E • 35 km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-400" />
                Active Alerts
              </h2>
              <div className="space-y-3">
                <div className="bg-red-100 text-red-800 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🔴</span>
                        <h3 className="font-semibold">Heavy Rainfall Warning</h3>
                      </div>
                      <p className="text-sm opacity-75 mb-2">Heavy rainfall expected in the next 6 hours</p>
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <MapPin className="h-3 w-3" />
                        <span>Delhi, NCR</span>
                        <span>•</span>
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-100 text-orange-800 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🟠</span>
                        <h3 className="font-semibold">Air Quality Alert</h3>
                      </div>
                      <p className="text-sm opacity-75 mb-2">AQI levels above 200, avoid outdoor activities</p>
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <MapPin className="h-3 w-3" />
                        <span>Mumbai, Maharashtra</span>
                        <span>•</span>
                        <span>4 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🟡</span>
                        <h3 className="font-semibold">Heat Wave Advisory</h3>
                      </div>
                      <p className="text-sm opacity-75 mb-2">Temperature expected to reach 45°C</p>
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <MapPin className="h-3 w-3" />
                        <span>Jaipur, Rajasthan</span>
                        <span>•</span>
                        <span>6 hours ago</span>
                      </div>
                    </div>
                  </div>
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
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium flex-1">Thunderstorm expected in Lucknow</h3>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      Weather
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Meteorological department warns of severe thunderstorm in Lucknow region</p>
                  <p className="text-gray-500 text-xs">1 hour ago</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium flex-1">Heavy rainfall warning in Delhi</h3>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      Alert
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">IMD issues red alert for heavy rainfall in Delhi-NCR region</p>
                  <p className="text-gray-500 text-xs">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDashboard;
