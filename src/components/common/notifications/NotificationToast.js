// Notification Toast Component - Shows in-app notifications
import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, UserPlus, Users } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    if (autoClose) {
      // Auto close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for fade out animation
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={20} fill="#e74c3c" color="#e74c3c" />;
      case 'comment':
        return <MessageCircle size={20} color="#3498db" />;
      case 'follow':
        return <UserPlus size={20} color="#2ecc71" />;
      case 'friend_request':
        return <Users size={20} color="#f39c12" />;
      default:
        return <Heart size={20} color="#9b59b6" />;
    }
  };

  const handleClick = () => {
    if (notification.url) {
      window.location.href = notification.url;
    }
    handleClose();
  };

  if (!notification) return null;

  return (
    <div 
      className={`notification-toast ${isVisible ? 'visible' : ''} ${notification.type}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        {getIcon(notification.type)}
      </div>
      
      <div className="notification-content">
        <div className="notification-title">
          {notification.title || 'AmaPlayer'}
        </div>
        <div className="notification-message">
          {notification.message}
        </div>
        {notification.senderName && (
          <div className="notification-sender">
            from {notification.senderName}
          </div>
        )}
      </div>
      
      <button 
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationToast;