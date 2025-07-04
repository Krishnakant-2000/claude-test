import React, { useState } from 'react';
import FooterNav from './FooterNav';
import './Search.css';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="search">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>Search</h1>
        </div>
      </nav>

      <div className="main-content search-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users, posts, or hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="search-results">
          <p>Search functionality coming soon!</p>
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}