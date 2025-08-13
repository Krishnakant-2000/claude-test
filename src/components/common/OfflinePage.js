import React from 'react';
import './OfflinePage.css';

// Offline fallback page component as specified in offline caching documentation
const OfflinePage = () => (
  <div className="offline-page">
    <div className="offline-content">
      <div className="offline-icon">📡</div>
      <h2>You're Offline</h2>
      <p>Check your connection and try again.</p>
      <button 
        onClick={() => window.location.reload()}
        className="retry-button"
      >
        Retry
      </button>
    </div>
  </div>
);

export default OfflinePage;