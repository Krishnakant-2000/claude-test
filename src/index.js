import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals, { trackPerformance, observePerformance, sendToAnalytics } from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
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
// Track performance metrics and send to analytics
reportWebVitals(sendToAnalytics);

// Start performance tracking after initial load
window.addEventListener('load', () => {
  // Track detailed performance metrics
  trackPerformance();
  
  // Start observing performance issues
  observePerformance();
  
  // Log that performance monitoring is active
  console.log('🚀 AmaPlayer Performance Monitoring Active');
});
