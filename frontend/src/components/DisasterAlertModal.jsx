import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Shield, MapPin, Bell } from 'lucide-react';

const DisasterAlertModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if modal has been shown before
    const hasSeenModal = localStorage.getItem('alertbeacon-modal-shown');
    
    if (!hasSeenModal) {
      // Show modal after a short delay for dramatic effect
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllowAccess = async () => {
    setIsLoading(true);
    
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
      
      // Request location permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location access granted:', position.coords);
            handleClose();
          },
          (error) => {
            console.log('Location access denied:', error);
            handleClose();
          }
        );
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      handleClose();
    }
  };

  const handleMaybeLater = () => {
    handleClose();
  };

  const handleClose = () => {
    // Store in localStorage so it doesn't show again
    localStorage.setItem('alertbeacon-modal-shown', 'true');
    setIsOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleOutsideClick}
    >
      <div 
        className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500 ease-out scale-100 opacity-100 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Emergency Illustration */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
              {/* Ring animation */}
              <div className="absolute inset-0 w-24 h-24 bg-red-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AlertBeacon – Crisis Alert System
          </h2>
          <p className="text-gray-600 mb-8">
            Real-time alerts and safety updates
          </p>

          {/* Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Safety First</span>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">
              To receive life-saving alerts and real-time updates, please allow location and notification permissions.
            </p>
          </div>

          {/* Permission Icons */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-xs text-gray-600">Location</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Bell className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-xs text-gray-600">Notifications</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAllowAccess}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Requesting Access...
                </span>
              ) : (
                'Allow Access'
              )}
            </button>
            
            <button
              onClick={handleMaybeLater}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Bottom Circular Close Button */}
        <button
          onClick={handleClose}
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DisasterAlertModal;
