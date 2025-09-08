/**
 * Redis Cache Provider - Replaces CacheDetector
 * Handles app version management and cache initialization
 */

import React, { useEffect, useState, createContext, useContext } from 'react';
import { cacheService } from '../../../services/redisCacheService';

// Create cache context
const CacheContext = createContext({
  cacheReady: false,
  cacheStats: null,
  clearCache: () => {},
  invalidatePattern: () => {}
});

export const useCache = () => useContext(CacheContext);

const CacheProvider = ({ children }) => {
  const [cacheReady, setCacheReady] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [versionChecked, setVersionChecked] = useState(false);

  useEffect(() => {
    const initializeCache = async () => {
      try {
        // Check app version and handle updates
        if (!versionChecked) {
          const versionCheck = await cacheService.checkAppVersion();
          setVersionChecked(true);
          
          if (versionCheck.needsUpdate) {
            // Clear cache on version update without hard refresh
            // This is the key improvement over the old CacheDetector system
            if (process.env.NODE_ENV === 'development') {
              console.log('Version update:', versionCheck);
            }
          }
        }

        // Get initial cache statistics
        const stats = cacheService.getStats();
        setCacheStats(stats);
        setCacheReady(true);
        
        
      } catch (error) {
        console.error('CACHE PROVIDER: Failed to initialize cache:', error);
        
        // Still mark as ready so app can function without cache
        setCacheReady(true);
      }
    };

    initializeCache();
    
    // Update stats periodically
    const statsInterval = setInterval(() => {
      const stats = cacheService.getStats();
      setCacheStats(stats);
    }, 30000); // Every 30 seconds

    return () => clearInterval(statsInterval);
  }, [versionChecked]);

  // Cache management functions
  const clearCache = async () => {
    try {
      await cacheService.clearAll();
      const stats = cacheService.getStats();
      setCacheStats(stats);
      return true;
    } catch (error) {
      console.error('CACHE PROVIDER: Failed to clear cache:', error);
      return false;
    }
  };

  const invalidatePattern = async (pattern) => {
    try {
      await cacheService.clearPattern(pattern);
      const stats = cacheService.getStats();
      setCacheStats(stats);
      return true;
    } catch (error) {
      console.error(`CACHE PROVIDER: Failed to invalidate pattern ${pattern}:`, error);
      return false;
    }
  };

  const contextValue = {
    cacheReady,
    cacheStats,
    clearCache,
    invalidatePattern,
    cacheService // Expose service for advanced usage
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
      {/* Optional: Show cache status in development */}
      {process.env.NODE_ENV === 'development' && cacheReady && (
        <div 
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 10000,
            fontFamily: 'monospace'
          }}
          title="Redis Cache Status (Development Only)"
        >
          🔄 L1: {cacheStats?.l1Size || 0} | 
          📡 {cacheStats?.isOnline ? 'Online' : 'Offline'}
        </div>
      )}
    </CacheContext.Provider>
  );
};

export default CacheProvider;