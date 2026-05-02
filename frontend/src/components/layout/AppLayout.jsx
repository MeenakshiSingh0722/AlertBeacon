import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  LayoutDashboard, 
  Map, 
  FileText, 
  Bell, 
  BarChart3, 
  Brain, 
  Settings,
  Menu,
  X,
  Search,
  Wifi,
  WifiOff,
  User,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useIncidentSocket } from '../../hooks/useIncidentSocket';
import CrisisPopup from '../alerts/CrisisPopup';
import GlobalNotifications from '../GlobalNotifications';
import ModernSidebar from '../ModernSidebar';
import { useAlertBeaconStore } from '../../store/useAlertBeaconStore';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { connected } = useIncidentSocket();
  const { stats, fetchStats, error } = useAlertBeaconStore();

  // Fetch stats on mount
  useState(() => {
    fetchStats();
  });

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: FileText },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Analyze', href: '/analyze', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Modern Sidebar */}
      <ModernSidebar />

      {/* Main content area */}
      <div className="lg:ml-72 transition-all duration-500 ease-in-out">
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 backdrop-blur-sm">
              Error: {error}
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Crisis Popup */}
      <CrisisPopup />
      
      {/* Global Notifications */}
      <GlobalNotifications />
    </div>
  );
};

export default AppLayout;
