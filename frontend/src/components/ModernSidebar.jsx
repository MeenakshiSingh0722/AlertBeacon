import React, { useState, useEffect } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Rss, 
  Info, 
  AlertTriangle,
  Menu,
  X,
  ChevronLeft,
  User,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ModernSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Menu items with icons
  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'RSS Feed', href: '/rss', icon: Rss },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Do\'s & Don\'ts', href: '/guidelines', icon: AlertTriangle },
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close mobile menu on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleLogout = () => {
    // Handle logout logic
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={handleToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-700/50 text-white hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 shadow-lg"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50
          transform transition-all duration-500 ease-in-out
          ${isMobile 
            ? `${isOpen ? 'translate-x-0' : '-translate-x-full'} w-80` 
            : `${isMinimized ? 'w-20' : 'w-72'} translate-x-0`
          }
          shadow-2xl
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AB</span>
            </div>
            {/* Title */}
            {!isMinimized && (
              <div>
                <h1 className="text-white font-bold text-lg">AlertBeacon</h1>
                <p className="text-gray-400 text-xs">Crisis Management</p>
              </div>
            )}
          </div>
          
          {/* Close/Minimize Button */}
          <button
            onClick={isMobile ? handleClose : handleMinimize}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200"
            aria-label={isMobile ? "Close menu" : "Minimize sidebar"}
          >
            {isMobile ? <X className="h-5 w-5" : <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {!isMinimized && (
            <div className="mb-4">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Navigation</h3>
            </div>
          )}
          
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center ${isMinimized ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl
                transition-all duration-300 ease-in-out relative overflow-hidden
                ${isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:scale-105'
                }
              `}
            >
              {/* Background gradient effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0
                group-hover:opacity-100 transition-opacity duration-300
                ${isActive(item.href) ? 'opacity-100' : ''}
              `} />
              
              {/* Icon */}
              <item.icon className={`
                h-5 w-5 flex-shrink-0 relative z-10 transition-transform duration-300
                ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}
              `} />
              
              {/* Text */}
              {!isMinimized && (
                <span className="relative z-10 font-medium transition-all duration-300">
                  {item.name}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive(item.href) && !isMinimized && (
                <div className="absolute right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-700/50">
          {!isMinimized && (
            <div className="mb-4">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">User</h3>
            </div>
          )}
          
          {/* Profile */}
          <div className={`
            flex items-center ${isMinimized ? 'justify-center' : 'gap-3'} p-3 rounded-xl
            bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 group
          `}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
            
            {!isMinimized && (
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Admin User</p>
                <p className="text-gray-400 text-xs">admin@alertbeacon.com</p>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center ${isMinimized ? 'justify-center' : 'gap-3'} w-full mt-3 px-4 py-3
              rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20
              transition-all duration-300 group
            `}
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            {!isMinimized && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Desktop Minimize Button (when sidebar is minimized) */}
      {isMinimized && !isMobile && (
        <button
          onClick={handleMinimize}
          className="fixed top-4 left-24 z-40 p-2 bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700/50 text-white hover:bg-gray-800/90 transition-all duration-300 hover:scale-105"
          aria-label="Expand sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default ModernSidebar;
