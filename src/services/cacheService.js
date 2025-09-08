/**
 * Client-side Cache Service for AmaPlayer
 * Integrates Redis backend with React Query frontend
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, on, off } from 'firebase/database';

class CacheService {
  constructor() {
    this.functions = getFunctions();
    this.database = getDatabase();
    this.cacheManagement = httpsCallable(this.functions, 'cacheManagement');
    this.invalidateCache = httpsCallable(this.functions, 'invalidateCache');
    this.listeners = new Map();
    this.isOnline = navigator.onLine;
    this.pendingInvalidations = [];
    
    this.setupNetworkListeners();
    this.setupCacheInvalidationListener();
  }

  // Cache Management Methods
  async get(key, fallback = null) {
    try {
      const result = await this.cacheManagement({
        action: 'get',
        key
      });
      
      return result.data || fallback;
    } catch (error) {
      console.warn(`Cache get failed for ${key}:`, error);
      return fallback;
    }
  }

  async set(key, value, ttl = 1800) {
    try {
      await this.cacheManagement({
        action: 'set',
        key,
        value,
        ttl
      });
      
      console.log(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error(`Cache set failed for ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.cacheManagement({
        action: 'delete',
        key
      });
      
      console.log(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      console.error(`Cache delete failed for ${key}:`, error);
      return false;
    }
  }

  async deletePattern(pattern) {
    try {
      const result = await this.cacheManagement({
        action: 'deletePattern',
        pattern
      });
      
      console.log(`Cache pattern deleted: ${pattern} (${result.data} keys)`);
      return result.data || 0;
    } catch (error) {
      console.error(`Cache delete pattern failed for ${pattern}:`, error);
      return 0;
    }
  }

  async exists(key) {
    try {
      const result = await this.cacheManagement({
        action: 'exists',
        key
      });
      
      return result.data || false;
    } catch (error) {
      console.error(`Cache exists check failed for ${key}:`, error);
      return false;
    }
  }

  async mGet(keys) {
    try {
      const result = await this.cacheManagement({
        action: 'mGet',
        keys
      });
      
      return result.data || {};
    } catch (error) {
      console.error('Cache mget failed:', error);
      return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
    }
  }

  async getStats() {
    try {
      const result = await this.cacheManagement({
        action: 'stats'
      });
      
      return result.data || {};
    } catch (error) {
      console.error('Cache stats failed:', error);
      return { error: error.message };
    }
  }

  async healthCheck() {
    try {
      const result = await this.cacheManagement({
        action: 'health'
      });
      
      return result.data || { healthy: false };
    } catch (error) {
      console.error('Cache health check failed:', error);
      return { healthy: false, error: error.message };
    }
  }

  // Cache Invalidation Methods
  async invalidateUser(userId, immediate = false) {
    try {
      await this.invalidateCache({
        type: 'user',
        userId,
        immediate
      });
      
      console.log(`Cache invalidated for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`User cache invalidation failed: ${userId}`, error);
      
      // Queue for retry when back online
      if (!this.isOnline) {
        this.pendingInvalidations.push({ type: 'user', userId, immediate });
      }
      
      return false;
    }
  }

  async invalidatePost(postId, immediate = false) {
    try {
      await this.invalidateCache({
        type: 'post',
        postId,
        immediate
      });
      
      console.log(`Cache invalidated for post: ${postId}`);
      return true;
    } catch (error) {
      console.error(`Post cache invalidation failed: ${postId}`, error);
      
      if (!this.isOnline) {
        this.pendingInvalidations.push({ type: 'post', postId, immediate });
      }
      
      return false;
    }
  }

  async invalidateFeeds(immediate = false) {
    try {
      await this.invalidateCache({
        type: 'feeds',
        immediate
      });
      
      console.log('Feed caches invalidated');
      return true;
    } catch (error) {
      console.error('Feed cache invalidation failed:', error);
      
      if (!this.isOnline) {
        this.pendingInvalidations.push({ type: 'feeds', immediate });
      }
      
      return false;
    }
  }

  async invalidateSearch(immediate = false) {
    try {
      await this.invalidateCache({
        type: 'search',
        immediate
      });
      
      console.log('Search caches invalidated');
      return true;
    } catch (error) {
      console.error('Search cache invalidation failed:', error);
      
      if (!this.isOnline) {
        this.pendingInvalidations.push({ type: 'search', immediate });
      }
      
      return false;
    }
  }

  async invalidateGlobal(immediate = false) {
    try {
      await this.invalidateCache({
        type: 'global',
        immediate
      });
      
      console.log('All caches invalidated (nuclear option)');
      return true;
    } catch (error) {
      console.error('Global cache invalidation failed:', error);
      return false;
    }
  }

  // Cache Key Helpers
  getUserProfileKey(userId) {
    return `user:profile:${userId}`;
  }

  getUserPostsKey(userId, page = 0) {
    return `user:posts:${userId}:${page}`;
  }

  getPostDetailsKey(postId) {
    return `post:${postId}`;
  }

  getPostCommentsKey(postId, page = 0) {
    return `post:comments:${postId}:${page}`;
  }

  getHomeFeedKey(userId, page = 0) {
    return `feed:home:${userId}:${page}`;
  }

  getExploreFeedKey(page = 0) {
    return `feed:explore:${page}`;
  }

  getSearchUsersKey(query, page = 0) {
    return `search:users:${encodeURIComponent(query)}:${page}`;
  }

  // React Query Integration Helpers
  async getOrFetch(key, fetchFn, ttl = 1800) {
    // Try cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source and cache
    try {
      const data = await fetchFn();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Fetch and cache failed for ${key}:`, error);
      throw error;
    }
  }

  // Optimistic cache updates
  async optimisticUpdate(key, updater, ttl = 1800) {
    try {
      const current = await this.get(key);
      if (current) {
        const updated = typeof updater === 'function' ? updater(current) : updater;
        await this.set(key, updated, ttl);
        return updated;
      }
      return null;
    } catch (error) {
      console.error(`Optimistic update failed for ${key}:`, error);
      return null;
    }
  }

  // Batch operations for performance
  async batchGet(keys) {
    const BATCH_SIZE = 10;
    const batches = [];
    
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      batches.push(keys.slice(i, i + BATCH_SIZE));
    }

    const results = await Promise.all(
      batches.map(batch => this.mGet(batch))
    );

    return results.reduce((acc, batch) => ({ ...acc, ...batch }), {});
  }

  // Setup real-time cache invalidation listener
  setupCacheInvalidationListener() {
    const invalidationRef = ref(this.database, 'cache_invalidations');
    
    const handleInvalidation = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log('Received cache invalidation:', data);
      
      // Trigger React Query invalidation based on cache invalidation type
      this.handleInvalidationMessage(data);
    };

    on(invalidationRef, 'child_added', handleInvalidation);
    
    // Store reference for cleanup
    this.invalidationListener = () => off(invalidationRef, 'child_added', handleInvalidation);
  }

  // Handle invalidation messages from server
  handleInvalidationMessage(data) {
    const { type, metadata } = data;
    
    // Emit custom events that React Query can listen to
    const event = new CustomEvent('cache-invalidation', {
      detail: { type, metadata }
    });
    
    window.dispatchEvent(event);
  }

  // Network status handlers
  setupNetworkListeners() {
    const handleOnline = () => {
      console.log('Network back online - processing pending invalidations');
      this.isOnline = true;
      this.processPendingInvalidations();
    };

    const handleOffline = () => {
      console.log('Network offline - queueing invalidations');
      this.isOnline = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Store references for cleanup
    this.networkListeners = {
      cleanup: () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }

  // Process pending invalidations when back online
  async processPendingInvalidations() {
    if (this.pendingInvalidations.length === 0) return;

    console.log(`Processing ${this.pendingInvalidations.length} pending cache invalidations`);

    const pending = [...this.pendingInvalidations];
    this.pendingInvalidations = [];

    for (const invalidation of pending) {
      try {
        switch (invalidation.type) {
          case 'user':
            await this.invalidateUser(invalidation.userId, invalidation.immediate);
            break;
          case 'post':
            await this.invalidatePost(invalidation.postId, invalidation.immediate);
            break;
          case 'feeds':
            await this.invalidateFeeds(invalidation.immediate);
            break;
          case 'search':
            await this.invalidateSearch(invalidation.immediate);
            break;
        }
      } catch (error) {
        console.error('Failed to process pending invalidation:', error);
        // Re-queue failed invalidations
        this.pendingInvalidations.push(invalidation);
      }
    }
  }

  // Cleanup method
  destroy() {
    if (this.invalidationListener) {
      this.invalidationListener();
    }
    
    if (this.networkListeners) {
      this.networkListeners.cleanup();
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

// React Hook for using cache service
export const useCacheService = () => {
  return cacheService;
};

// Cache-aware React Query configuration
export const getCacheAwareQueryConfig = (key, ttl = 1800) => ({
  staleTime: (ttl * 1000) * 0.8, // 80% of cache TTL
  cacheTime: (ttl * 1000) * 1.2, // 120% of cache TTL
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

export default cacheService;