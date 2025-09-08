const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

async function findAndDeleteNotification() {
  try {
    console.log('🔍 Initializing Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Searching through all notifications...');
    
    // Get all notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsSnapshot = await getDocs(notificationsRef);
    
    console.log(`📬 Found ${notificationsSnapshot.size} total notifications`);
    
    let targetNotifications = [];
    let krishnaNotifications = [];
    
    notificationsSnapshot.forEach(doc => {
      const notification = doc.data();
      const message = notification.message || '';
      
      // Look for the specific notification
      if (message.toLowerCase().includes('vishnuayurvedic') && 
          message.toLowerCase().includes('liked your story')) {
        targetNotifications.push({
          id: doc.id,
          data: notification,
          message: message,
          userId: notification.userId,
          timestamp: notification.timestamp?.toDate?.()?.toLocaleString() || notification.timestamp
        });
      }
      
      // Also collect any notifications for Krishna-related users
      if (notification.userId && 
          (message.toLowerCase().includes('krishna') || 
           message.toLowerCase().includes('bhardwaj'))) {
        krishnaNotifications.push({
          id: doc.id,
          data: notification,
          message: message,
          userId: notification.userId,
          timestamp: notification.timestamp?.toDate?.()?.toLocaleString() || notification.timestamp
        });
      }
    });
    
    console.log(`🎯 Found ${targetNotifications.length} notifications matching the criteria`);
    console.log(`👤 Found ${krishnaNotifications.length} notifications for Krishna-related users`);
    
    if (targetNotifications.length > 0) {
      console.log('📋 Target notifications found:');
      targetNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. "${notif.message}" (${notif.timestamp}) [User: ${notif.userId}]`);
      });
      
      // Delete all matching notifications
      for (const notif of targetNotifications) {
        console.log(`🗑️ Deleting notification: "${notif.message.substring(0, 50)}..."`);
        await deleteDoc(doc(db, 'notifications', notif.id));
        console.log(`✅ Deleted notification ${notif.id}`);
      }
      
      console.log('✅ Successfully deleted all matching notifications!');
    } else {
      console.log('❌ No notifications found matching "vishnuayurvedic company liked your story"');
      
      if (krishnaNotifications.length > 0) {
        console.log('📋 Here are notifications for Krishna-related users:');
        krishnaNotifications.forEach((notif, index) => {
          console.log(`${index + 1}. "${notif.message}" (${notif.timestamp})`);
        });
      }
      
      // Let's also search for any notifications containing "vishnu" or "ayurvedic"
      let relatedNotifications = [];
      notificationsSnapshot.forEach(doc => {
        const notification = doc.data();
        const message = notification.message || '';
        
        if (message.toLowerCase().includes('vishnu') || 
            message.toLowerCase().includes('ayurvedic') ||
            message.toLowerCase().includes('company')) {
          relatedNotifications.push({
            id: doc.id,
            message: message,
            userId: notification.userId,
            timestamp: notification.timestamp?.toDate?.()?.toLocaleString() || notification.timestamp
          });
        }
      });
      
      if (relatedNotifications.length > 0) {
        console.log('📋 Related notifications found:');
        relatedNotifications.forEach((notif, index) => {
          console.log(`${index + 1}. "${notif.message}" (${notif.timestamp}) [User: ${notif.userId}]`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Load environment variables
require('dotenv').config();

findAndDeleteNotification();