import React, { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User } from 'lucide-react';
import './FooterNav.css';

const FooterNav = memo(function FooterNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/home'
    },
    {
      id: 'search',
      icon: Search,
      label: 'Search',
      path: '/search'
    },
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      path: '/events'
    },
    {
      id: 'messages',
      icon: MessageCircle,
      label: 'Messages',
      path: '/messages'
    },
    {
      id: 'profile',
      icon: User,
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
            <span className="footer-nav-icon">
              <item.icon size={24} />
            </span>
            <span className="footer-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
});

export default FooterNav;