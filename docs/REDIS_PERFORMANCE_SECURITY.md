# Redis Cache Performance and Security Guide

## Performance Considerations

### 1. Memory Management

#### Memory Allocation Strategy
```javascript
// Recommended Redis memory configuration
const REDIS_MEMORY_CONFIG = {
  maxmemory: '2gb',                    // Set appropriate memory limit
  maxmemoryPolicy: 'allkeys-lru',      // Evict least recently used keys
  maxmemoryPolicyPolicy: 'volatile-lru' // Alternative for TTL-based eviction
};
```

#### Memory Usage Monitoring
- **Target**: Keep memory usage below 80% of allocated limit
- **Alert Thresholds**: 
  - Warning at 70% memory usage
  - Critical at 85% memory usage
- **Auto-scaling**: Implement memory-based scaling triggers

#### Data Size Optimization
```javascript
// Efficient data storage patterns
const CACHE_OPTIMIZATION = {
  // Use compression for large objects
  compressLargeData: (data) => {
    if (JSON.stringify(data).length > 10000) {
      return compressData(data); // Use gzip or similar
    }
    return data;
  },
  
  // Store references instead of full objects for related data
  useReferences: {
    userPosts: 'post:id:123,post:id:124', // Instead of full post objects
    postComments: 'comment:id:456,comment:id:789'
  },
  
  // Pagination for large datasets
  paginateResults: {
    pageSize: 20,
    maxCachedPages: 5
  }
};
```

### 2. Performance Optimization

#### Connection Pooling
```javascript
// Redis connection pool configuration
const REDIS_POOL_CONFIG = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  
  // Connection pool settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  lazyConnect: true,
  
  // Connection pool limits
  maxConnectionsPerNode: 50,
  minConnectionsPerNode: 10,
  connectionTimeout: 1000,
  commandTimeout: 5000
};
```

#### Cache Key Strategy
```javascript
// Efficient cache key naming convention
const CACHE_KEY_PATTERNS = {
  // Hierarchical structure for easy pattern matching
  user: {
    profile: (userId) => `usr:prf:${userId}`,
    posts: (userId, page) => `usr:pst:${userId}:p${page}`,
    following: (userId) => `usr:flw:${userId}`
  },
  
  // Short keys to minimize memory usage
  post: {
    details: (postId) => `pst:${postId}`,
    comments: (postId, page) => `pst:cmt:${postId}:p${page}`,
    likes: (postId) => `pst:lke:${postId}`
  },
  
  // Versioned keys for cache invalidation
  versioned: (key, version) => `${key}:v${version}`
};
```

#### TTL Optimization Strategy
```javascript
const TTL_STRATEGY = {
  // Dynamic TTL based on data characteristics
  calculateTTL: (dataType, lastUpdated, accessFrequency) => {
    const baseTime = Date.now();
    const timeSinceUpdate = baseTime - lastUpdated;
    
    // Recent data gets shorter TTL for consistency
    if (timeSinceUpdate < 300000) return 300; // 5 minutes
    
    // Frequently accessed data gets longer TTL
    if (accessFrequency > 10) return 3600; // 1 hour
    
    // Default TTL based on data type
    const defaults = {
      userProfile: 3600,    // 1 hour
      posts: 1800,          // 30 minutes
      feeds: 900,           // 15 minutes
      search: 3600,         // 1 hour
      staticContent: 86400  // 24 hours
    };
    
    return defaults[dataType] || 1800;
  },
  
  // Stagger TTL to prevent thundering herd
  addJitter: (ttl) => {
    const jitter = Math.random() * 0.1 * ttl; // 10% jitter
    return Math.floor(ttl + jitter);
  }
};
```

### 3. Performance Monitoring

#### Key Performance Indicators (KPIs)
```javascript
const PERFORMANCE_KPIS = {
  cacheHitRate: {
    target: 0.85,      // 85% cache hit rate
    warning: 0.75,     // Alert if below 75%
    critical: 0.60     // Critical if below 60%
  },
  
  responseTime: {
    target: 50,        // 50ms average response time
    warning: 100,      // Alert if above 100ms
    critical: 250      // Critical if above 250ms
  },
  
  memoryUsage: {
    target: 0.70,      // 70% memory utilization
    warning: 0.80,     // Alert at 80%
    critical: 0.90     // Critical at 90%
  },
  
  connectionCount: {
    target: 25,        // Average 25 connections
    warning: 40,       // Alert at 40 connections
    critical: 50       // Critical at 50 connections
  }
};
```

#### Performance Monitoring Implementation
```javascript
// Performance tracking service
class CachePerformanceMonitor {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      responseTimes: [],
      lastReset: Date.now()
    };
  }

  recordCacheHit(responseTime) {
    this.metrics.hits++;
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);
    this.checkThresholds();
  }

  recordCacheMiss(responseTime) {
    this.metrics.misses++;
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);
    this.checkThresholds();
  }

  recordError(error) {
    this.metrics.errors++;
    console.error('Cache error:', error);
    this.sendAlert('cache_error', { error: error.message });
  }

  getHitRate() {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.hits / this.metrics.totalRequests;
  }

  getAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    return this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
  }

  checkThresholds() {
    const hitRate = this.getHitRate();
    const avgResponseTime = this.getAverageResponseTime();

    if (hitRate < PERFORMANCE_KPIS.cacheHitRate.critical) {
      this.sendAlert('critical_hit_rate', { hitRate, threshold: PERFORMANCE_KPIS.cacheHitRate.critical });
    }

    if (avgResponseTime > PERFORMANCE_KPIS.responseTime.critical) {
      this.sendAlert('critical_response_time', { avgResponseTime, threshold: PERFORMANCE_KPIS.responseTime.critical });
    }
  }

  sendAlert(type, data) {
    // Implement alerting mechanism (email, Slack, etc.)
    console.warn(`Cache Alert [${type}]:`, data);
  }

  reset() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      responseTimes: [],
      lastReset: Date.now()
    };
  }
}
```

## Security Considerations

### 1. Data Protection

#### Data Encryption
```javascript
// Encrypt sensitive data before caching
import crypto from 'crypto';

const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16
};

class CacheEncryption {
  constructor(secretKey) {
    this.secretKey = crypto.createHash('sha256').update(secretKey).digest();
  }

  encrypt(data) {
    try {
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
      const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, this.secretKey, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  decrypt(encryptedData) {
    try {
      const { encrypted, iv, tag } = encryptedData;
      const decipher = crypto.createDecipher(
        ENCRYPTION_CONFIG.algorithm, 
        this.secretKey, 
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }
}
```

#### Sensitive Data Handling
```javascript
// Define sensitive data types that require encryption
const SENSITIVE_DATA_TYPES = {
  userProfile: ['email', 'phone', 'address'],
  userPreferences: ['paymentInfo', 'personalSettings'],
  postData: ['privateContent', 'location']
};

const CACHE_SECURITY_RULES = {
  // Don't cache sensitive data in plain text
  shouldEncrypt: (key, data) => {
    // Check if key contains sensitive data patterns
    const sensitivePatterns = ['email', 'phone', 'payment', 'private'];
    return sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern));
  },
  
  // Set shorter TTL for sensitive data
  getSensitiveTTL: (dataType) => {
    const sensitiveTTL = {
      userProfile: 900,      // 15 minutes
      paymentInfo: 300,      // 5 minutes
      privateContent: 600    // 10 minutes
    };
    return sensitiveTTL[dataType] || 300;
  },
  
  // Don't cache certain data types at all
  shouldNotCache: (key, data) => {
    const noCachePatterns = ['password', 'token', 'secret', 'key'];
    return noCachePatterns.some(pattern => key.toLowerCase().includes(pattern));
  }
};
```

### 2. Access Control

#### Authentication and Authorization
```javascript
// Redis cache access control
const CACHE_ACCESS_CONTROL = {
  // Verify user permissions before cache operations
  verifyAccess: async (userId, operation, resourceKey) => {
    // Check if user can access this resource
    const permissions = await getUserPermissions(userId);
    
    // Define access rules
    const accessRules = {
      'user:profile:*': (userId, key) => key.includes(userId) || permissions.includes('admin'),
      'user:posts:*': (userId, key) => key.includes(userId) || permissions.includes('moderator'),
      'feed:home:*': (userId, key) => key.includes(userId),
      'admin:*': (userId) => permissions.includes('admin')
    };
    
    // Check access against rules
    for (const [pattern, rule] of Object.entries(accessRules)) {
      if (minimatch(resourceKey, pattern)) {
        return rule(userId, resourceKey);
      }
    }
    
    return false; // Deny by default
  },
  
  // Sanitize cache keys to prevent injection
  sanitizeCacheKey: (key) => {
    // Remove potentially dangerous characters
    return key.replace(/[^a-zA-Z0-9:_-]/g, '');
  },
  
  // Rate limiting for cache operations
  rateLimiter: new Map(),
  
  checkRateLimit: (userId, operation) => {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 100; // 100 requests per minute
    
    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    const limit = this.rateLimiter.get(key);
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return true;
    }
    
    if (limit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    limit.count++;
    return true;
  }
};
```

#### Network Security
```javascript
// Redis connection security
const REDIS_SECURITY_CONFIG = {
  // SSL/TLS configuration
  tls: {
    rejectUnauthorized: true,
    ca: process.env.REDIS_CA_CERT,
    cert: process.env.REDIS_CLIENT_CERT,
    key: process.env.REDIS_CLIENT_KEY
  },
  
  // Authentication
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  
  // Network security
  family: 4, // Force IPv4
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Connection validation
  enableReadyCheck: true,
  maxRetriesPerRequest: 3
};
```

### 3. Data Validation and Sanitization

#### Input Validation
```javascript
// Cache data validation
class CacheValidator {
  static validateCacheKey(key) {
    // Key validation rules
    const rules = [
      { test: key => key.length > 0, error: 'Key cannot be empty' },
      { test: key => key.length <= 250, error: 'Key too long (max 250 chars)' },
      { test: key => /^[a-zA-Z0-9:_-]+$/.test(key), error: 'Key contains invalid characters' },
      { test: key => !key.startsWith(':') && !key.endsWith(':'), error: 'Key cannot start or end with colon' }
    ];
    
    for (const rule of rules) {
      if (!rule.test(key)) {
        throw new Error(`Invalid cache key: ${rule.error}`);
      }
    }
    
    return true;
  }
  
  static validateCacheData(data, maxSize = 1048576) { // 1MB default
    if (data === null || data === undefined) {
      return true; // Allow null/undefined values
    }
    
    try {
      const serialized = JSON.stringify(data);
      
      if (serialized.length > maxSize) {
        throw new Error(`Data too large: ${serialized.length} bytes (max ${maxSize})`);
      }
      
      // Check for potentially dangerous content
      if (this.containsDangerousContent(serialized)) {
        throw new Error('Data contains potentially dangerous content');
      }
      
      return true;
    } catch (error) {
      if (error.message.includes('circular structure')) {
        throw new Error('Data contains circular references');
      }
      throw error;
    }
  }
  
  static containsDangerousContent(data) {
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(data));
  }
  
  static sanitizeUserInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
```

### 4. Audit and Logging

#### Security Audit Logging
```javascript
// Security event logging
class CacheSecurityLogger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  }
  
  logCacheAccess(userId, operation, key, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      operation,
      cacheKey: key,
      result: result ? 'success' : 'failure',
      userAgent: this.getUserAgent(),
      ipAddress: this.getClientIP()
    };
    
    // Log to secure audit system
    this.writeAuditLog('cache_access', logEntry);
  }
  
  logSecurityEvent(eventType, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      severity: this.getSeverity(eventType),
      details,
      stackTrace: new Error().stack
    };
    
    this.writeAuditLog('security_event', logEntry);
    
    // Alert on critical security events
    if (logEntry.severity === 'critical') {
      this.sendSecurityAlert(logEntry);
    }
  }
  
  getSeverity(eventType) {
    const severityMap = {
      'access_denied': 'medium',
      'invalid_key': 'low',
      'rate_limit_exceeded': 'medium',
      'encryption_failure': 'critical',
      'unauthorized_access': 'critical'
    };
    
    return severityMap[eventType] || 'medium';
  }
  
  writeAuditLog(category, entry) {
    // Write to secure logging system (e.g., ELK stack, Cloud Logging)
    console.log(`[AUDIT][${category.toUpperCase()}]`, JSON.stringify(entry));
  }
  
  sendSecurityAlert(logEntry) {
    // Send immediate alert for critical security events
    // Implement integration with alerting system
    console.error('[SECURITY ALERT]', logEntry);
  }
}
```

## Performance Optimization Checklist

### ✅ Implementation Checklist

- [ ] **Memory Management**
  - [ ] Set appropriate Redis memory limits
  - [ ] Implement LRU eviction policy
  - [ ] Monitor memory usage with alerts
  - [ ] Implement data compression for large objects

- [ ] **Connection Optimization**
  - [ ] Configure connection pooling
  - [ ] Set appropriate timeouts
  - [ ] Implement connection retry logic
  - [ ] Monitor connection health

- [ ] **Cache Strategy**
  - [ ] Implement hierarchical key naming
  - [ ] Use dynamic TTL calculation
  - [ ] Implement cache warming for popular content
  - [ ] Add jitter to prevent thundering herd

- [ ] **Performance Monitoring**
  - [ ] Track cache hit rates (target: >85%)
  - [ ] Monitor response times (target: <50ms)
  - [ ] Set up alerting for performance degradation
  - [ ] Implement performance dashboards

- [ ] **Security Implementation**
  - [ ] Encrypt sensitive data
  - [ ] Implement access control
  - [ ] Validate and sanitize inputs
  - [ ] Enable audit logging
  - [ ] Set up security monitoring

- [ ] **Testing and Validation**
  - [ ] Load test Redis infrastructure
  - [ ] Test failover scenarios
  - [ ] Validate security controls
  - [ ] Performance benchmark testing

This comprehensive performance and security framework ensures that the Redis cache migration not only improves performance but also maintains the highest security standards for the AmaPlayer application.