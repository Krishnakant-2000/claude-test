// Enhanced Web Vitals reporting with detailed analytics
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, getINP }) => {
      // Core Web Vitals
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getLCP(onPerfEntry);
      
      // Additional metrics
      getFCP(onPerfEntry);
      getTTFB(onPerfEntry);
      
      // New metric (replaces FID)
      if (getINP) {
        getINP(onPerfEntry);
      }
    });
  }
};

// Enhanced performance tracking
export const trackPerformance = () => {
  // Track navigation timing
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      console.group('🚀 AmaPlayer Performance Metrics');
      console.log('📊 Navigation Timing:', {
        'DNS Lookup': `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
        'TCP Connection': `${navigation.connectEnd - navigation.connectStart}ms`,
        'Request': `${navigation.responseStart - navigation.requestStart}ms`,
        'Response': `${navigation.responseEnd - navigation.responseStart}ms`,
        'DOM Loading': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
        'Total Load Time': `${navigation.loadEventEnd - navigation.navigationStart}ms`
      });
      console.groupEnd();
    }
  }
  
  // Track resource loading
  setTimeout(() => {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');
      const largeResources = resources
        .filter(resource => resource.transferSize > 100000) // > 100KB
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 5);
        
      if (largeResources.length > 0) {
        console.group('📦 Large Resources (>100KB)');
        largeResources.forEach(resource => {
          console.log(`${resource.name.split('/').pop()}: ${(resource.transferSize / 1024).toFixed(1)}KB`);
        });
        console.groupEnd();
      }
    }
  }, 2000);
  
  // Track memory usage (Chrome only)
  if ('memory' in performance) {
    console.log('💾 Memory Usage:', {
      'Used JS Heap': `${(performance.memory.usedJSHeapSize / 1048576).toFixed(1)}MB`,
      'Total JS Heap': `${(performance.memory.totalJSHeapSize / 1048576).toFixed(1)}MB`,
      'Limit': `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(1)}MB`
    });
  }
};

// Send performance data to analytics (placeholder)
export const sendToAnalytics = (metric) => {
  // In production, send to your analytics service
  console.log('📈 Web Vital:', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    entries: metric.entries
  });
  
  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.rating
    });
  }
  
  // Example: Send to custom analytics endpoint
  if (metric.rating === 'poor') {
    fetch('/api/performance-issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(err => console.log('Analytics error:', err));
  }
};

// Performance observer for custom metrics
export const observePerformance = () => {
  if ('PerformanceObserver' in window) {
    // Observe long tasks (>50ms)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('🐌 Long Task detected:', {
              duration: `${entry.duration.toFixed(1)}ms`,
              startTime: `${entry.startTime.toFixed(1)}ms`,
              type: entry.entryType
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.log('Long task observer not supported');
    }
    
    // Observe layout shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.value > 0.1) {
            console.warn('📐 Layout Shift detected:', {
              value: entry.value.toFixed(4),
              startTime: `${entry.startTime.toFixed(1)}ms`,
              sources: entry.sources?.length || 0
            });
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('Layout shift observer not supported');
    }
  }
};

export default reportWebVitals;
