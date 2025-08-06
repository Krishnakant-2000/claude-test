// Notification Manager - Handles multiple in-app notifications
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import NotificationToast from './NotificationToast';
import notificationService from '../../services/notificationService';

const NotificationManager = () => {
  const { currentUser, isGuest } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);

  // One-time cleanup of corrupted notifications
  const cleanupCorruptedNotifications = async (userId) => {
    try {
      console.log('🧹 Checking for corrupted notifications for user:', userId);
      
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('receiverId', '==', userId));
      const snapshot = await getDocs(q);
      
      let deletedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Check if any field contains objects (corrupted data)
        const hasObjects = Object.values(data).some(value => 
          typeof value === 'object' && value !== null && 
          !value.toDate && // Not a Firestore timestamp
          !Array.isArray(value) && // Not an array
          typeof value.seconds === 'undefined' // Not a timestamp object
        );
        
        if (hasObjects) {
          console.log('🗑️ Deleting corrupted notification:', docSnapshot.id);
          await deleteDoc(doc(db, 'notifications', docSnapshot.id));
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        console.log('✅ Cleanup complete - deleted', deletedCount, 'corrupted notifications');
      } else {
        console.log('✅ No corrupted notifications found');
      }
      
    } catch (error) {
      console.error('❌ Error during notification cleanup:', error);
    }
  };

  useEffect(() => {
    if (!currentUser || isGuest()) return;
    
    console.log('🔔 Setting up notification listener for user:', currentUser.uid);
    
    // Run cleanup first to remove any corrupted data
    cleanupCorruptedNotifications(currentUser.uid).then(() => {
      console.log('🧹 Cleanup completed, setting up listener...');
    });

    // Listen for new notifications from Firestore with error handling
    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', currentUser.uid),
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newNotifications = [];
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const rawNotification = change.doc.data();
            
            // Deep sanitization to prevent any objects from being rendered
            const sanitizeValue = (value) => {
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') {
                console.warn('🚨 Found object in notification data, converting to string:', value);
                
                // Try to extract text from comment objects
                if (value && typeof value.text === 'string') {
                  return String(value.text);
                }
                
                // NEVER return JSON.stringify - it can cause React error #31
                // Instead return a safe string description
                console.error('🚨 BLOCKING OBJECT FROM RENDER:', value);
                return '[Object data]';
              }
              return String(value);
            };
            
            // Aggressively sanitize all notification fields
            const notification = {
              id: change.doc.id,
              type: sanitizeValue(rawNotification.type),
              message: sanitizeValue(rawNotification.message),
              senderName: sanitizeValue(rawNotification.senderName),
              senderPhotoURL: sanitizeValue(rawNotification.senderPhotoURL),
              receiverId: sanitizeValue(rawNotification.receiverId),
              senderId: sanitizeValue(rawNotification.senderId),
              timestamp: rawNotification.timestamp,
              read: Boolean(rawNotification.read),
              pushData: rawNotification.pushData ? {
                title: sanitizeValue(rawNotification.pushData.title),
                url: sanitizeValue(rawNotification.pushData.url) || '/'
              } : null,
              postId: rawNotification.postId ? sanitizeValue(rawNotification.postId) : null,
              data: {}  // Clear any complex data objects
            };
            
            // Extra safety check - ensure no object values exist
            Object.keys(notification).forEach(key => {
              if (typeof notification[key] === 'object' && notification[key] !== null && key !== 'pushData' && key !== 'timestamp') {
                console.warn(`🚨 Converting object field ${key} to string:`, notification[key]);
                notification[key] = String(notification[key]);
              }
            });
            
            console.log('🔔 New notification received (sanitized):', notification.type, notification.message);
            newNotifications.push(notification);
            
            // Show toast for new notifications
            showToastNotification(notification);
          }
        });

        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
        }
      },
      (error) => {
        console.log('⚠️ Notification listener error (index needed):', error.code);
        if (error.code === 'failed-precondition') {
          console.log('📝 Please create Firestore index at: https://console.firebase.google.com/project/my-react-firebase-app-69fcd/firestore/indexes');
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser, isGuest]);

  const showToastNotification = (notification) => {
    const toastId = `toast-${notification.id}-${Date.now()}`;
    
    // Ensure all toast data is safe strings
    const toast = {
      id: toastId,
      type: String(notification.type || ''),
      title: String(notification.pushData?.title || notification.type || 'AmaPlayer'),
      message: String(notification.message || ''),
      senderName: String(notification.senderName || ''),
      url: String(notification.pushData?.url || '/'),
      timestamp: Date.now()
    };

    setToastNotifications(prev => [...prev, toast]);
  };

  const removeToastNotification = (toastId) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== toastId));
  };

  // Only show toasts, not the notification list (that would be in a separate notifications page)
  return (
    <div className="notification-manager">
      {toastNotifications.map((toast, index) => (
        <div key={toast.id} style={{ zIndex: 10000 - index }}>
          <NotificationToast
            notification={toast}
            onClose={() => removeToastNotification(toast.id)}
            autoClose={true}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;