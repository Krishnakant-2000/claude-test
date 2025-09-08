/**
 * Redis Cache Management Functions for AmaPlayer
 * Provides server-side cache management with Redis integration
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import express from 'express';

const corsHandler = cors({ origin: true });

// Redis client configuration (will be set up with environment variables)
let redisClient: any = null;

const initializeRedis = async () => {
  if (!redisClient || (redisClient.isOpen === false)) {
    try {
      // For now, we'll create a mock Redis interface for development
      // In production, this would be replaced with actual Redis client
      const redis = await import('redis');
      
      const redisConfig = functions.config().redis || {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || ''
      };

      redisClient = redis.createClient({
        url: redisConfig.url,
        username: redisConfig.username,
        password: redisConfig.password,
        socket: {
          tls: redisConfig.url.startsWith('rediss://'),
          rejectUnauthorized: false
        }
      });

      redisClient.on('error', (err: any) => {
        console.error('Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        console.log('Redis Client Connected');
      });

      await redisClient.connect();
    } catch (error) {
      console.warn('Redis not available, using fallback cache:', error);
      // Create a mock Redis interface for development
      redisClient = createMockRedis();
    }
  }
  return redisClient;
};

// Mock Redis interface for development/testing
const createMockRedis = () => {
  const mockCache = new Map<string, { value: string, expires: number }>();
  
  return {
    isOpen: true,
    async get(key: string) {
      const item = mockCache.get(key);
      if (item && item.expires > Date.now()) {
        return item.value;
      }
      mockCache.delete(key);
      return null;
    },
    async setEx(key: string, ttl: number, value: string) {
      mockCache.set(key, {
        value,
        expires: Date.now() + (ttl * 1000)
      });
      return 'OK';
    },
    async del(key: string | string[]) {
      if (Array.isArray(key)) {
        key.forEach(k => mockCache.delete(k));
        return key.length;
      } else {
        mockCache.delete(key);
        return 1;
      }
    },
    async keys(pattern: string) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(mockCache.keys()).filter(key => regex.test(key));
    },
    async exists(key: string) {
      const item = mockCache.get(key);
      return item && item.expires > Date.now() ? 1 : 0;
    }
  };
};

// Cache management functions
const cacheManager = {
  // Get data from cache
  async get(key: string) {
    try {
      const client = await initializeRedis();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache GET error:', error);
      return null;
    }
  },

  // Set data in cache with TTL
  async set(key: string, data: any, ttl: number = 3600) {
    try {
      const client = await initializeRedis();
      await client.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache SET error:', error);
      return false;
    }
  },

  // Delete data from cache
  async del(key: string) {
    try {
      const client = await initializeRedis();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache DEL error:', error);
      return false;
    }
  },

  // Delete multiple keys by pattern
  async delPattern(pattern: string) {
    try {
      const client = await initializeRedis();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache DEL PATTERN error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key: string) {
    try {
      const client = await initializeRedis();
      return await client.exists(key);
    } catch (error) {
      console.error('Cache EXISTS error:', error);
      return false;
    }
  }
};

// Express app for cache API
const cacheApp = express();
cacheApp.use(corsHandler);
cacheApp.use(express.json());

// Health check endpoint
cacheApp.get('/health', async (req, res) => {
  try {
    await initializeRedis();
    res.json({ 
      status: 'healthy', 
      redis: redisClient.isOpen ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      mock: redisClient.constructor.name === 'Object' // Indicates mock redis
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: (error as Error).message 
    });
  }
});

// Get cache data
cacheApp.get('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await cacheManager.get(key);
    
    if (data) {
      res.json({ success: true, data, cached: true });
    } else {
      res.json({ success: true, data: null, cached: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Set cache data
cacheApp.post('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { data, ttl = 3600 } = req.body;
    
    const success = await cacheManager.set(key, data, ttl);
    
    if (success) {
      res.json({ success: true, message: 'Data cached successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to cache data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Delete cache data
cacheApp.delete('/cache/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const success = await cacheManager.del(key);
    
    res.json({ success, message: success ? 'Cache deleted' : 'Cache delete failed' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Clear cache by pattern
cacheApp.delete('/cache/pattern/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const success = await cacheManager.delPattern(pattern);
    
    res.json({ success, message: success ? 'Cache pattern cleared' : 'Cache clear failed' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// App version management
cacheApp.get('/app-version', async (req, res) => {
  try {
    const currentVersion = '2.1.0';
    const userVersion = req.headers['app-version'] || req.query.version || 'unknown';
    
    // Store current version in cache
    await cacheManager.set('app:version', currentVersion, 3600);
    
    const shouldUpdate = userVersion !== currentVersion;
    
    res.json({
      currentVersion,
      userVersion,
      shouldUpdate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Cache invalidation endpoint
cacheApp.post('/invalidate', async (req, res) => {
  try {
    const { keys, patterns, reason = 'manual' } = req.body;
    const results: any[] = [];
    
    // Invalidate specific keys
    if (keys && Array.isArray(keys)) {
      for (const key of keys) {
        const success = await cacheManager.del(key);
        results.push({ key, success, type: 'key' });
      }
    }
    
    // Invalidate by patterns
    if (patterns && Array.isArray(patterns)) {
      for (const pattern of patterns) {
        const success = await cacheManager.delPattern(pattern);
        results.push({ pattern, success, type: 'pattern' });
      }
    }
    
    console.log('Cache invalidation:', { reason, results, timestamp: new Date() });
    
    res.json({
      success: true,
      message: 'Cache invalidation completed',
      results,
      reason
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Export the HTTP function
export const cache = functions.https.onRequest(cacheApp);

// Direct callable functions for internal use
export const getCache = functions.https.onCall(async (data, context) => {
  try {
    const { key } = data;
    if (!key) throw new Error('Key is required');
    
    const result = await cacheManager.get(key);
    return { success: true, data: result };
  } catch (error) {
    console.error('getCache error:', error);
    return { success: false, error: (error as Error).message };
  }
});

export const setCache = functions.https.onCall(async (data, context) => {
  try {
    const { key, data: cacheData, ttl = 3600 } = data;
    if (!key || !cacheData) throw new Error('Key and data are required');
    
    const success = await cacheManager.set(key, cacheData, ttl);
    return { success };
  } catch (error) {
    console.error('setCache error:', error);
    return { success: false, error: (error as Error).message };
  }
});

export const invalidateCache = functions.https.onCall(async (data, context) => {
  try {
    const { keys, patterns } = data;
    const results: any[] = [];
    
    if (keys) {
      for (const key of keys) {
        const success = await cacheManager.del(key);
        results.push({ key, success });
      }
    }
    
    if (patterns) {
      for (const pattern of patterns) {
        const success = await cacheManager.delPattern(pattern);
        results.push({ pattern, success });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('invalidateCache error:', error);
    return { success: false, error: (error as Error).message };
  }
});

console.log('AmaPlayer Cache Functions initialized (TypeScript)');