import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  BarChart3, 
  Brain, 
  Settings,
  Menu,
  X,
  ChevronRight,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ImprovedMenuBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: FileText },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Analyze', href: '/analyze', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-gray-800 rounded-lg border border-gray-700 text-white hover:bg-gray-700 transition-colors"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Menu */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Menu Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold text-white border border-blue-500">
              AB
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AlertBeacon</h1>
              <p className="text-gray-400 text-xs">Crisis Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Main Menu</p>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1
                  ${isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {isActive(item.href) && <ChevronRight className="h-4 w-4" />}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-gray-800 mt-auto">
            <div className="flex items-center gap-3 mb-3 p-3 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-gray-400 text-xs">admin@alertbeacon.com</p>
              </div>
            </div>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className={`
        hidden lg:block fixed top-0 left-0 z-40 h-full bg-gray-900 border-r border-gray-800 transform transition-all duration-300 ease-in-out
        ${isMinimized ? 'w-16' : 'w-64'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold text-white text-sm border border-blue-500">
              AB
            </div>
            {!isMinimized && <h1 className="text-white font-bold text-lg">AlertBeacon</h1>}
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            {isMinimized ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className={`${isMinimized ? 'px-2 py-4' : 'p-4'} space-y-1`}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center ${isMinimized ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
              title={isMinimized ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isMinimized && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Top Navigation Bar */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-6 h-16" style={{ marginLeft: isMinimized ? '4rem' : '16rem' }}>
          {/* Left Side - Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search incidents..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Live</span>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-white transition-colors p-1">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImprovedMenuBar;
