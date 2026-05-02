import React from 'react';

const PagePlaceholder = ({ title }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-100">{title}</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-surface border border-border rounded-xl animate-pulse"></div>
      ))}
    </div>
    <div className="h-96 bg-surface border border-border rounded-xl p-8 flex items-center justify-center text-gray-500">
      Placeholder content for {title} page.
    </div>
  </div>
);

export const Dashboard = () => <PagePlaceholder title="Dashboard Overview" />;
export const Map = () => <PagePlaceholder title="Crisis Live Map" />;
export const Alerts = () => <PagePlaceholder title="Active Alerts" />;
export const Analytics = () => <PagePlaceholder title="System Analytics" />;
export const Settings = () => <PagePlaceholder title="Account Settings" />;
export const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 space-y-6 shadow-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-critical">AlertBeacon</h1>
        <p className="text-gray-400 mt-2">Sign in to autonomous command center</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Email Address</label>
          <input type="email" className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:border-accent outline-none" placeholder="admin@alertbeacon.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Password</label>
          <input type="password" className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:border-accent outline-none" placeholder="••••••••" />
        </div>
        <button className="w-full bg-accent hover:bg-accent/80 text-white font-bold py-3 rounded-lg transition-colors">
          Access Console
        </button>
      </div>
    </div>
  </div>
);
