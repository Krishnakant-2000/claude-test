import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Main app imports
const App = require('./App').default;
const webVitals = require('./reportWebVitals');
const reportWebVitals = webVitals.default;

// Global error handler for React error #31 debugging
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('Objects are not valid as a React child')) {
    console.error('🚨 REACT ERROR #31 CAUGHT GLOBALLY!');
    console.error('🚨 Error message:', event.error.message);
    console.error('🚨 Stack trace:', event.error.stack);
    console.error('🚨 Event details:', event);
    
    // Try to extract object information from error message
    const errorUrl = event.error.message.match(/visit (https:\/\/[^\s]+)/);
    if (errorUrl) {
      console.error('🚨 React error URL:', errorUrl[1]);
    }
    
    // Log current page state
    console.error('🚨 Current page:', window.location.href);
    console.error('🚨 Time:', new Date().toISOString());
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));

// Override React's error handling to get better debugging info
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Objects are not valid as a React child')) {
    console.error('🚨 REACT ERROR #31 DETAILED DEBUG:');
    console.error('🚨 Args:', args);
    console.error('🚨 Stack trace:', new Error().stack);
    
    // Try to extract the object information from the error URL
    const errorMessage = args[0];
    const urlMatch = errorMessage.match(/visit (https:\/\/[^\s]+)/);
    if (urlMatch) {
      console.error('🚨 Error URL:', urlMatch[1]);
      // Decode the URL parameters to see the object structure
      try {
        const url = new URL(urlMatch[1]);
        const params = url.searchParams.get('args[]');
        if (params) {
          console.error('🚨 Object being rendered:', decodeURIComponent(params));
        }
      } catch (e) {
        console.error('🚨 Could not parse error URL:', e);
      }
    }
  }
  originalError.apply(console, args);
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Phase 3: Initialize IndexedDB and register enhanced service worker
const initializeOfflineFeatures = async () => {
  try {
    // Initialize IndexedDB for offline storage
    const { idbStore } = await import('./utils/caching/indexedDB');
    await idbStore.init();
    console.log('✅ Phase 3: IndexedDB initialized successfully');
  } catch (error) {
    console.error('❌ Phase 3: Failed to initialize IndexedDB:', error);
  }
};

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Initialize offline features
    await initializeOfflineFeatures();
    
    navigator.serviceWorker
      .register('/sw-phase3.js')
      .then((registration) => {
        console.log('SW: Service worker registered successfully:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available, show update notification
                console.log('SW: New version available - please refresh');
                if (window.confirm('New version available! Refresh to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW: Service worker registration failed:', error);
      });
      
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'BACKGROUND_SYNC') {
        console.log('SW Message:', event.data.message);
        // Handle background sync completion
      }
    });
  });
}

// Enhanced performance monitoring and Web Vitals tracking
if (reportWebVitals) {
  const { trackPerformance, observePerformance, sendToAnalytics } = require('./reportWebVitals');
  
  // Track performance metrics and send to analytics
  reportWebVitals(sendToAnalytics);

  // Start performance tracking after initial load
  window.addEventListener('load', () => {
    // Track detailed performance metrics
    trackPerformance();
    
    // Start observing performance issues
    observePerformance();
    
    // Log that performance monitoring is active
    // console.log('🚀 AmaPlayer Performance Monitoring Active');
  });
}
