const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc, orderBy, limit } = require('firebase/firestore');

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

    console.log('🔍 Searching for user: Krishnakant Bhardwaj');
    
    // First, find the user by display name
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('displayName', '==', 'Krishnakant Bhardwaj'));
    const usersSnapshot = await getDocs(userQuery);
    
    if (usersSnapshot.empty) {
      console.log('❌ No user found with name: Krishnakant Bhardwaj');
      
      // Try alternative search patterns
      const altQuery1 = query(usersRef, where('firstName', '==', 'Krishnakant'));
      const altSnapshot1 = await getDocs(altQuery1);
      
      if (!altSnapshot1.empty) {
        console.log('Found user(s) by firstName:');
        altSnapshot1.forEach(doc => {
          const userData = doc.data();
          console.log('User found:', {
            id: doc.id,
            displayName: userData.displayName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email
          });
        });
      }
      
      // Try searching for "krishnakant" (lowercase)
      const altQuery2 = query(usersRef, where('displayName', '==', 'krishnakant bhardwaj'));
      const altSnapshot2 = await getDocs(altQuery2);
      
      if (!altSnapshot2.empty) {
        console.log('Found user(s) by lowercase name:');
        altSnapshot2.forEach(doc => {
          const userData = doc.data();
          console.log('User found:', {
            id: doc.id,
            displayName: userData.displayName,
            email: userData.email
          });
        });
      }
      
      console.log('📋 Let me check all users to find the right one...');
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      const potentialUsers = [];
      
      allUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        const displayName = userData.displayName || '';
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (displayName.toLowerCase().includes('krishna') || 
            firstName.toLowerCase().includes('krishna') ||
            displayName.toLowerCase().includes('bhardwaj') ||
            lastName.toLowerCase().includes('bhardwaj')) {
          potentialUsers.push({
            id: doc.id,
            displayName: userData.displayName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email
          });
        }
      });
      
      if (potentialUsers.length > 0) {
        console.log('🎯 Found potential matching users:');
        potentialUsers.forEach(user => console.log(user));
        
        // Use the first matching user
        const targetUserId = potentialUsers[0].id;
        await searchAndDeleteNotification(db, targetUserId, potentialUsers[0]);
      } else {
        console.log('❌ No matching users found');
      }
      
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('✅ Found user:', {
      id: userId,
      displayName: userData.displayName,
      email: userData.email
    });
    
    await searchAndDeleteNotification(db, userId, userData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

async function searchAndDeleteNotification(db, userId, userData) {
  try {
    console.log('🔍 Searching for notifications for user:', userData.displayName);
    
    // Search for all notifications for this user
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(
      notificationsRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    console.log(`📬 Found ${notificationsSnapshot.size} notifications for this user`);
    
    let targetNotification = null;
    let allNotifications = [];
    
    notificationsSnapshot.forEach(doc => {
      const notification = doc.data();
      const notificationData = {
        id: doc.id,
        message: notification.message || '',
        type: notification.type || '',
        fromUser: notification.fromUser || '',
        timestamp: notification.timestamp?.toDate?.()?.toLocaleString() || notification.timestamp,
        read: notification.read || false
      };
      
      allNotifications.push(notificationData);
      
      // Check if this matches the target notification
      if (notification.message && 
          notification.message.toLowerCase().includes('vishnuayurvedic') && 
          notification.message.toLowerCase().includes('liked your story')) {
        targetNotification = { id: doc.id, data: notification };
        console.log('🎯 Found target notification!');
      }
    });
    
    // Show all notifications
    console.log('📋 All notifications for this user:');
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.type}] ${notif.message} (${notif.timestamp}) ${notif.read ? '[READ]' : '[UNREAD]'}`);
    });
    
    if (targetNotification) {
      console.log('🗑️ Deleting the target notification...');
      await deleteDoc(doc(db, 'notifications', targetNotification.id));
      console.log('✅ Successfully deleted the notification!');
    } else {
      console.log('❌ Could not find the specific notification about vishnuayurvedic company liking story');
      
      // Look for any notifications with "vishnuayurvedic" in them
      const vishnuNotifications = allNotifications.filter(notif => 
        notif.message.toLowerCase().includes('vishnu') || 
        notif.message.toLowerCase().includes('ayurvedic')
      );
      
      if (vishnuNotifications.length > 0) {
        console.log('📋 Found notifications containing "vishnu" or "ayurvedic":');
        vishnuNotifications.forEach(notif => {
          console.log(`- ${notif.message} (${notif.timestamp})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error searching notifications:', error.message);
  }
}

// Load environment variables
require('dotenv').config();

findAndDeleteNotification();