/**
 * Redis Cache Service for AmaPlayer
 * Handles client-side caching with Redis backend integration
 */

class RedisCacheService {
  constructor() {
    // Always use the deployed Firebase Functions URL since it's now available
    this.baseURL = 'https://us-central1-my-react-firebase-app-69fcd.cloudfunctions.net/cache';
    
    this.localCache = new Map(); // L1 cache for immediate responses
    this.cacheTimeouts = new Map(); // Track cache expiry
    this.isOnline = navigator.onLine;
    this.pendingRequests = new Map(); // Prevent duplicate requests
    
    // Listen for network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    console.log('Redis Cache Service initialized:', { baseURL: this.baseURL });
  }

  /**
   * Get data from cache (tries L1 -> Redis -> fallback)
   */
  async get(key, fallbackFn = null) {
    try {
      // L1 Cache check (immediate)
      if (this.localCache.has(key) && !this.isExpired(key)) {
        console.log(`Cache HIT (L1): ${key}`);
        return this.localCache.get(key);
      }

      // If offline, return L1 cache or null
      if (!this.isOnline) {
        const localData = this.localCache.get(key);
        console.log(`Cache OFFLINE: ${key}`, localData ? 'found in L1' : 'not found');
        return localData || null;
      }

      // Check if request is already pending
      if (this.pendingRequests.has(key)) {
        return await this.pendingRequests.get(key);
      }

      // Redis cache check
      const redisPromise = this.getFromRedis(key);
      this.pendingRequests.set(key, redisPromise);

      try {
        const redisData = await redisPromise;
        this.pendingRequests.delete(key);
        
        if (redisData) {
          console.log(`Cache HIT (Redis): ${key}`);
          // Update L1 cache
          this.setLocal(key, redisData, 300); // 5 minutes L1 TTL
          return redisData;
        }
      } catch (redisError) {
        console.warn(`Redis cache error for ${key}:`, redisError);
        this.pendingRequests.delete(key);
      }

      // Fallback to data source
      if (fallbackFn && typeof fallbackFn === 'function') {
        console.log(`Cache MISS: ${key}, using fallback`);
        try {
          const freshData = await fallbackFn();
          if (freshData) {
            // Cache the fresh data for future use
            this.set(key, freshData, 3600); // 1 hour default TTL
          }
          return freshData;
        } catch (fallbackError) {
          console.error(`Fallback error for ${key}:`, fallbackError);
        }
      }

      console.log(`Cache MISS: ${key}, no data available`);
      return null;

    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache (L1 + Redis)
   */
  async set(key, data, ttl = 3600) {
    try {
      // Always set in L1 cache for immediate access
      this.setLocal(key, data, Math.min(ttl, 900)); // Max 15 minutes for L1

      // Set in Redis if online
      if (this.isOnline) {
        await this.setInRedis(key, data, ttl);
        console.log(`Cache SET: ${key} (L1 + Redis)`);
      } else {
        console.log(`Cache SET: ${key} (L1 only - offline)`);
      }

      return true;
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key) {
    try {
      // Remove from L1
      this.localCache.delete(key);
      this.cacheTimeouts.delete(key);

      // Remove from Redis if online
      if (this.isOnline) {
        await this.deleteFromRedis(key);
        console.log(`Cache DELETE: ${key} (L1 + Redis)`);
      } else {
        console.log(`Cache DELETE: ${key} (L1 only - offline)`);
      }

      return true;
    } catch (error) {
      console.error(`Cache delete error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern) {
    try {
      // Clear L1 cache by pattern
      const keys = Array.from(this.localCache.keys()).filter(key => 
        this.matchesPattern(key, pattern)
      );
      
      keys.forEach(key => {
        this.localCache.delete(key);
        this.cacheTimeouts.delete(key);
      });

      // Clear Redis pattern if online
      if (this.isOnline) {
        await this.clearRedisPattern(pattern);
        console.log(`Cache CLEAR PATTERN: ${pattern} (L1 + Redis)`);
      } else {
        console.log(`Cache CLEAR PATTERN: ${pattern} (L1 only - offline)`);
      }

      return true;
    } catch (error) {
      console.error(`Cache clear pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check app version and handle updates
   */
  async checkAppVersion() {
    try {
      const response = await fetch(`${this.baseURL}/app-version`, {
        headers: {
          'app-version': localStorage.getItem('amaplayer-version') || 'unknown'
        }
      });
      
      if (!response.ok) throw new Error('Version check failed');
      
      const versionData = await response.json();
      
      if (versionData.shouldUpdate) {
        console.log('App version update needed:', versionData);
        
        // Clear all caches for clean update
        await this.clearAll();
        
        // Update stored version
        localStorage.setItem('amaplayer-version', versionData.currentVersion);
        
        return {
          needsUpdate: true,
          currentVersion: versionData.currentVersion,
          userVersion: versionData.userVersion
        };
      }

      return { needsUpdate: false, ...versionData };
    } catch (error) {
      // Silent fail for development when Redis server is not available
      if (process.env.NODE_ENV === 'development') {
        // Only log once to avoid spam
        if (!this.versionCheckErrorLogged) {
          console.log('ℹ️ Cache server not available - using local cache only');
          this.versionCheckErrorLogged = true;
        }
      }
      return { needsUpdate: false, error: error.message };
    }
  }

  /**
   * Clear all caches
   */
  async clearAll() {
    try {
      // Clear L1 cache
      this.localCache.clear();
      this.cacheTimeouts.clear();

      // Clear Redis if online
      if (this.isOnline) {
        await fetch(`${this.baseURL}/cache/pattern/*`, { method: 'DELETE' });
      }

      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Clear all cache error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      l1Size: this.localCache.size,
      l1Keys: Array.from(this.localCache.keys()),
      isOnline: this.isOnline,
      pendingRequests: this.pendingRequests.size
    };
  }

  // Private methods

  setLocal(key, data, ttl) {
    this.localCache.set(key, data);
    this.cacheTimeouts.set(key, Date.now() + (ttl * 1000));
  }

  isExpired(key) {
    const expiry = this.cacheTimeouts.get(key);
    return expiry ? Date.now() > expiry : true;
  }

  async getFromRedis(key) {
    const response = await fetch(`${this.baseURL}/cache/${encodeURIComponent(key)}`);
    if (!response.ok) throw new Error(`Redis GET failed: ${response.status}`);
    
    const result = await response.json();
    return result.success ? result.data : null;
  }

  async setInRedis(key, data, ttl) {
    const response = await fetch(`${this.baseURL}/cache/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, ttl })
    });
    
    if (!response.ok) throw new Error(`Redis SET failed: ${response.status}`);
    return true;
  }

  async deleteFromRedis(key) {
    const response = await fetch(`${this.baseURL}/cache/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error(`Redis DELETE failed: ${response.status}`);
    return true;
  }

  async clearRedisPattern(pattern) {
    const response = await fetch(`${this.baseURL}/cache/pattern/${encodeURIComponent(pattern)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error(`Redis CLEAR PATTERN failed: ${response.status}`);
    return true;
  }

  matchesPattern(key, pattern) {
    // Simple pattern matching (* wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  async syncPendingOperations() {
    // When back online, this could sync any pending operations
    console.log('Back online - cache service ready');
  }
}

// Export singleton instance
export const cacheService = new RedisCacheService();
export default cacheService;