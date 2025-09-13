import React, { memo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  User,
  Heart,
  Zap,
  Plus,
  Star,
  Trophy
} from 'lucide-react';
import './FooterNav.css';

const FooterNav = memo(function FooterNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeAnimation, setActiveAnimation] = useState('');

  const navItems = [
    {
      id: 'home',
      icon: Home,
      activeIcon: Star,
      label: 'Home',
      path: '/home',
      color: '#00ff88',
      animationClass: 'bounce'
    },
    {
      id: 'search',
      icon: Search,
      activeIcon: Zap,
      label: 'Discover',
      path: '/search',
      color: '#ff6b6b',
      animationClass: 'pulse'
    },
    {
      id: 'events',
      icon: Plus,
      activeIcon: Trophy,
      label: 'Events',
      path: '/events',
      color: '#ffd93d',
      animationClass: 'rotate'
    },
    {
      id: 'messages',
      icon: MessageCircle,
      activeIcon: Heart,
      label: 'Chat',
      path: '/messages',
      color: '#6bcf7f',
      animationClass: 'shake'
    },
    {
      id: 'profile',
      icon: User,
      activeIcon: Star,
      label: 'Profile',
      path: '/profile',
      color: '#4ecdc4',
      animationClass: 'flip'
    }
  ];

  const handleNavClick = (path, animationClass) => {
    setActiveAnimation(animationClass);
    navigate(path);
    setTimeout(() => setActiveAnimation(''), 600);
  };

  return (
    <footer className="footer-nav">
      <div className="footer-nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={item.id}
              className={`footer-nav-item ${isActive ? 'active' : ''} ${
                activeAnimation === item.animationClass ? item.animationClass : ''
              }`}
              onClick={() => handleNavClick(item.path, item.animationClass)}
              style={{
                '--item-color': item.color,
              }}
            >
              <span className="footer-nav-icon">
                <IconComponent size={24} />
              </span>
              <span className="footer-nav-label">{item.label}</span>
              {isActive && <span className="active-indicator"></span>}
            </button>
          );
        })}
      </div>
    </footer>
  );
});

export default FooterNav;