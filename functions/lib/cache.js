"use strict";
/**
 * Redis Cache Management Functions for AmaPlayer
 * Provides server-side cache management with Redis integration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.setCache = exports.getCache = exports.cache = void 0;
const functions = __importStar(require("firebase-functions"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const corsHandler = (0, cors_1.default)({ origin: true });
// Redis client configuration (will be set up with environment variables)
let redisClient = null;
const initializeRedis = async () => {
    if (!redisClient || (redisClient.isOpen === false)) {
        try {
            // For now, we'll create a mock Redis interface for development
            // In production, this would be replaced with actual Redis client
            const redis = await Promise.resolve().then(() => __importStar(require('redis')));
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
            redisClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
            });
            redisClient.on('connect', () => {
                console.log('Redis Client Connected');
            });
            await redisClient.connect();
        }
        catch (error) {
            console.warn('Redis not available, using fallback cache:', error);
            // Create a mock Redis interface for development
            redisClient = createMockRedis();
        }
    }
    return redisClient;
};
// Mock Redis interface for development/testing
const createMockRedis = () => {
    const mockCache = new Map();
    return {
        isOpen: true,
        async get(key) {
            const item = mockCache.get(key);
            if (item && item.expires > Date.now()) {
                return item.value;
            }
            mockCache.delete(key);
            return null;
        },
        async setEx(key, ttl, value) {
            mockCache.set(key, {
                value,
                expires: Date.now() + (ttl * 1000)
            });
            return 'OK';
        },
        async del(key) {
            if (Array.isArray(key)) {
                key.forEach(k => mockCache.delete(k));
                return key.length;
            }
            else {
                mockCache.delete(key);
                return 1;
            }
        },
        async keys(pattern) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return Array.from(mockCache.keys()).filter(key => regex.test(key));
        },
        async exists(key) {
            const item = mockCache.get(key);
            return item && item.expires > Date.now() ? 1 : 0;
        }
    };
};
// Cache management functions
const cacheManager = {
    // Get data from cache
    async get(key) {
        try {
            const client = await initializeRedis();
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Cache GET error:', error);
            return null;
        }
    },
    // Set data in cache with TTL
    async set(key, data, ttl = 3600) {
        try {
            const client = await initializeRedis();
            await client.setEx(key, ttl, JSON.stringify(data));
            return true;
        }
        catch (error) {
            console.error('Cache SET error:', error);
            return false;
        }
    },
    // Delete data from cache
    async del(key) {
        try {
            const client = await initializeRedis();
            await client.del(key);
            return true;
        }
        catch (error) {
            console.error('Cache DEL error:', error);
            return false;
        }
    },
    // Delete multiple keys by pattern
    async delPattern(pattern) {
        try {
            const client = await initializeRedis();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
            return true;
        }
        catch (error) {
            console.error('Cache DEL PATTERN error:', error);
            return false;
        }
    },
    // Check if key exists
    async exists(key) {
        try {
            const client = await initializeRedis();
            return await client.exists(key);
        }
        catch (error) {
            console.error('Cache EXISTS error:', error);
            return false;
        }
    }
};
// Express app for cache API
const cacheApp = (0, express_1.default)();
cacheApp.use(corsHandler);
cacheApp.use(express_1.default.json());
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
    }
    catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
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
        }
        else {
            res.json({ success: true, data: null, cached: false });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
        }
        else {
            res.status(500).json({ success: false, error: 'Failed to cache data' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Delete cache data
cacheApp.delete('/cache/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const success = await cacheManager.del(key);
        res.json({ success, message: success ? 'Cache deleted' : 'Cache delete failed' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Clear cache by pattern
cacheApp.delete('/cache/pattern/:pattern', async (req, res) => {
    try {
        const { pattern } = req.params;
        const success = await cacheManager.delPattern(pattern);
        res.json({ success, message: success ? 'Cache pattern cleared' : 'Cache clear failed' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Cache invalidation endpoint
cacheApp.post('/invalidate', async (req, res) => {
    try {
        const { keys, patterns, reason = 'manual' } = req.body;
        const results = [];
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Export the HTTP function
exports.cache = functions.https.onRequest(cacheApp);
// Direct callable functions for internal use
exports.getCache = functions.https.onCall(async (data, context) => {
    try {
        const { key } = data;
        if (!key)
            throw new Error('Key is required');
        const result = await cacheManager.get(key);
        return { success: true, data: result };
    }
    catch (error) {
        console.error('getCache error:', error);
        return { success: false, error: error.message };
    }
});
exports.setCache = functions.https.onCall(async (data, context) => {
    try {
        const { key, data: cacheData, ttl = 3600 } = data;
        if (!key || !cacheData)
            throw new Error('Key and data are required');
        const success = await cacheManager.set(key, cacheData, ttl);
        return { success };
    }
    catch (error) {
        console.error('setCache error:', error);
        return { success: false, error: error.message };
    }
});
exports.invalidateCache = functions.https.onCall(async (data, context) => {
    try {
        const { keys, patterns } = data;
        const results = [];
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
    }
    catch (error) {
        console.error('invalidateCache error:', error);
        return { success: false, error: error.message };
    }
});
console.log('AmaPlayer Cache Functions initialized (TypeScript)');
//# sourceMappingURL=cache.js.map