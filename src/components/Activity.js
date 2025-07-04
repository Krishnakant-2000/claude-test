import React from 'react';
import FooterNav from './FooterNav';
import './Activity.css';

export default function Activity() {
  return (
    <div className="activity">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>Activity</h1>
        </div>
      </nav>

      <div className="main-content activity-content">
        <div className="activity-placeholder">
          <h2>❤️</h2>
          <p>Activity notifications will appear here</p>
          <span>Like and comment interactions from other users</span>
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}