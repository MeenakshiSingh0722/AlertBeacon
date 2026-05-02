import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut,
  AlertTriangle
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/map', icon: <MapIcon size={20} />, label: 'Live Map' },
    { to: '/alerts', icon: <Bell size={20} />, label: 'Alerts' },
    { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-surface border-r border-border h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 text-critical font-bold text-xl">
        <AlertTriangle fill="currentColor" />
        <span>AlertBeacon</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
    <h2 className="text-lg font-semibold text-gray-200">Autonomous Crisis Management</h2>
    <div className="flex items-center gap-4">
      <div className="text-right mr-2">
        <p className="text-sm font-medium text-gray-200">NGO Admin</p>
        <p className="text-xs text-gray-500">World Relief Org</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-ai flex items-center justify-center font-bold">
        W
      </div>
    </div>
  </header>
);

const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-background">
        <Header />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
