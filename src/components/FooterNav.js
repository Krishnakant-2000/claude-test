import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FooterNav.css';

export default function FooterNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      icon: '🏠',
      label: 'Home',
      path: '/home'
    },
    {
      id: 'search',
      icon: '🔍',
      label: 'Search',
      path: '/search'
    },
    {
      id: 'add',
      icon: '➕',
      label: 'Add',
      path: '/add-post'
    },
    {
      id: 'activity',
      icon: '❤️',
      label: 'Activity',
      path: '/activity'
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile',
      path: '/profile'
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <footer className="footer-nav">
      <div className="footer-nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`footer-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavClick(item.path)}
          >
            <span className="footer-nav-icon">{item.icon}</span>
            <span className="footer-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}