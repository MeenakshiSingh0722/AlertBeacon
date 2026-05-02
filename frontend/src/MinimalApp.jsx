import React from 'react';

const MinimalApp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-white font-bold text-2xl">AB</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AlertBeacon</h1>
          <p className="text-blue-300 text-lg mb-8">Crisis Management System</p>
          
          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-8 max-w-md">
            <h2 className="text-white font-semibold text-xl mb-4">System Status</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Backend API:</span>
                <span className="text-green-400">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Database:</span>
                <span className="text-green-400">✅ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Frontend:</span>
                <span className="text-green-400">✅ Working</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Location:</span>
                <span className="text-blue-400">Delhi, India</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="bg-red-100 text-red-800 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span>🔴</span>
                  <span className="font-semibold">Heavy Rainfall Warning</span>
                </div>
                <p className="text-sm">Delhi NCR - 2 hours ago</p>
              </div>
              
              <div className="bg-orange-100 text-orange-800 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span>🟠</span>
                  <span className="font-semibold">Air Quality Alert</span>
                </div>
                <p className="text-sm">Mumbai - 4 hours ago</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-gray-400 text-sm">
            <p>AlertBeacon Crisis Management System</p>
            <p>Real-time disaster monitoring and alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalApp;
