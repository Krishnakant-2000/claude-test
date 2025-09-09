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

// Initialize offline features if needed
const initializeOfflineFeatures = async () => {
  try {
    // Offline features can be added here in the future
    console.log('✅ Offline features initialized');
  } catch (error) {
    console.error('❌ Failed to initialize offline features:', error);
  }
};

// Register Firebase messaging service worker for FCM support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Initialize offline features
      await initializeOfflineFeatures();
      
      // Register Firebase messaging service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('🔔 Firebase messaging service worker registered successfully:', registration.scope);
      
      // Wait for service worker to be active
      if (registration.active) {
        console.log('🔔 Service worker is active and ready');
        window.serviceWorkerReady = true;
        window.dispatchEvent(new CustomEvent('serviceWorkerReady'));
      } else {
        // Wait for it to become active
        registration.addEventListener('statechange', (event) => {
          if (event.target.state === 'activated') {
            console.log('🔔 Service worker activated');
            window.serviceWorkerReady = true;
            window.dispatchEvent(new CustomEvent('serviceWorkerReady'));
          }
        });
      }
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔔 New service worker version available');
              // Auto-refresh for service worker updates to prevent FCM issues
              window.location.reload();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('🔔 Firebase messaging service worker registration failed:', error);
      window.serviceWorkerReady = false;
    }
      
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'NOTIFICATION_CLICK') {
        console.log('🔔 Notification click message received:', event.data);
        // Handle notification click
        if (event.data.url) {
          window.location.href = event.data.url;
        }
      }
    });
  });
} else {
  console.warn('🔔 Service workers not supported in this browser');
  window.serviceWorkerReady = false;
}

// Basic performance monitoring (no analytics)
if (reportWebVitals) {
  // Simple web vitals without analytics
  reportWebVitals();
}
