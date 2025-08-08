import React, { useState, useEffect, memo } from 'react';

// Development-only performance dashboard
const PerformanceDashboard = memo(function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Update memory usage every 5 seconds
    const updateMemory = () => {
      if ('memory' in performance) {
        setMemory({
          used: (performance.memory.usedJSHeapSize / 1048576).toFixed(1),
          total: (performance.memory.totalJSHeapSize / 1048576).toFixed(1),
          limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(1)
        });
      }
    };

    updateMemory();
    const memoryInterval = setInterval(updateMemory, 5000);

    // Listen for web vitals
    const handleWebVital = (metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        }
      }));
    };

    // Import and setup web vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(handleWebVital);
      getFID(handleWebVital);
      getFCP(handleWebVital);
      getLCP(handleWebVital);
      getTTFB(handleWebVital);
    });

    // Keyboard shortcut to toggle dashboard
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(memoryInterval);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good': return '#00ff88';
      case 'needs-improvement': return '#ffa500';
      case 'poor': return '#ff4444';
      default: return '#888';
    }
  };

  const formatValue = (name, value) => {
    if (name === 'CLS') return value.toFixed(3);
    if (name === 'FCP' || name === 'LCP' || name === 'FID' || name === 'TTFB') {
      return `${Math.round(value)}ms`;
    }
    return value;
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#2d3748',
          color: '#00ff88',
          border: '1px solid #00ff88',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Performance Dashboard (Ctrl+Shift+P)"
      >
        📊
      </button>

      {/* Dashboard */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: 'rgba(45, 55, 72, 0.95)',
            border: '1px solid #00ff88',
            borderRadius: '12px',
            padding: '20px',
            minWidth: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 9999,
            color: '#e2e8f0',
            fontSize: '14px',
            fontFamily: 'monospace',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px',
            borderBottom: '1px solid #4a5568',
            paddingBottom: '10px'
          }}>
            <h3 style={{ margin: 0, color: '#00ff88' }}>Performance</h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Web Vitals */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#00ff88', marginBottom: '8px' }}>Web Vitals</h4>
            {Object.entries(metrics).map(([name, data]) => (
              <div key={name} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                margin: '5px 0',
                padding: '5px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px'
              }}>
                <span>{name}:</span>
                <span style={{ color: getRatingColor(data.rating) }}>
                  {formatValue(name, data.value)} ({data.rating})
                </span>
              </div>
            ))}
          </div>

          {/* Memory Usage */}
          {memory && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#00ff88', marginBottom: '8px' }}>Memory</h4>
              <div style={{ fontSize: '12px' }}>
                <div>Used: {memory.used}MB</div>
                <div>Total: {memory.total}MB</div>
                <div>Limit: {memory.limit}MB</div>
                <div style={{ 
                  background: '#333', 
                  height: '6px', 
                  borderRadius: '3px',
                  marginTop: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#00ff88',
                    height: '100%',
                    width: `${(parseFloat(memory.used) / parseFloat(memory.total)) * 100}%`,
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{ fontSize: '11px', color: '#888', marginTop: '10px' }}>
            <div>💡 Tips:</div>
            <div>• Good CLS: &lt; 0.1</div>
            <div>• Good LCP: &lt; 2.5s</div>
            <div>• Good FID: &lt; 100ms</div>
            <div>• Toggle: Ctrl+Shift+P</div>
          </div>
        </div>
      )}
    </>
  );
});

export default PerformanceDashboard;