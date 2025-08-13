import React, { useState, useEffect } from 'react';
import OfflinePage from './OfflinePage';

// Wrapper component that shows offline page when network is down
// and fallback is needed for critical operations
const OfflineWrapper = ({ children, showOfflineForCriticalOperations = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflinePage, setShowOfflinePage] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflinePage(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (showOfflineForCriticalOperations) {
        setShowOfflinePage(true);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOfflineForCriticalOperations]);
  
  if (showOfflinePage && !isOnline) {
    return <OfflinePage />;
  }
  
  return children;
};

export default OfflineWrapper;