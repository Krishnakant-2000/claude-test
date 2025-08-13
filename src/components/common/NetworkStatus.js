import React, { useState, useEffect } from 'react';
import './NetworkStatus.css';

// Network status component as specified in offline caching documentation
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: Online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('Network status: Offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Only show when offline (as per documentation)
  return isOnline ? null : (
    <div className="offline-banner">
      <div className="offline-banner-content">
        <span className="offline-icon">📡</span>
        <span className="offline-text">You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
};

export default NetworkStatus;