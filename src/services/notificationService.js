// Push Notification Service for AmaPlayer
import { messaging, getToken, onMessage } from '../firebase/firebase';
import { db } from '../firebase/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';

class NotificationService {
  constructor() {
    this.token = null;
    this.isSupported = false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Check if notifications are supported
      this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && messaging;
      
      if (!this.isSupported) {
        console.log('🔔 Push notifications not supported');
        this.initialized = true;
        return;
      }

      // Check existing permission without requesting
      const permission = Notification.permission;
      console.log('🔔 Current notification permission:', permission);
      
      if (permission === 'granted') {
        await this.getAndSaveToken();
      }
      
      // Set up foreground message listener
      this.setupForegroundListener();
      this.initialized = true;
      
    } catch (error) {
      console.error('Error initializing notifications:', error);
      this.initialized = true;
    }
  }

  async requestPermission() {
    try {
      // Only request if permission is not already decided
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('🔔 Notification permission requested:', permission);
        
        if (permission === 'granted') {
          await this.getAndSaveToken();
        } else {
          console.log('🚫 Notification permission denied');
        }
        
        return permission;
      } else {
        console.log('🔔 Notification permission already set:', Notification.permission);
        return Notification.permission;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Method to request permissions from user interaction
  async enableNotifications(userId) {
    try {
      console.log('🔔 User requested to enable notifications');
      const permission = await this.requestPermission();
      
      if (permission === 'granted') {
        // Initialize the service regardless of FCM token success
        await this.initialize();
        
        // Try to get FCM token (optional)
        if (userId) {
          await this.getAndSaveToken(userId);
        }
        
        console.log('✅ In-app notifications enabled');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }

  async getAndSaveToken(userId = null) {
    try {
      if (!messaging) {
        console.log('Messaging not available');
        return null;
      }

      // Check if VAPID key is properly configured
      const vapidKey = process.env.REACT_APP_VAPID_KEY;
      if (!vapidKey || vapidKey === 'your-vapid-key-here' || vapidKey.length < 80) {
        console.log('⚠️ VAPID key not configured properly - push notifications disabled');
        console.log('💡 Get your VAPID key from: https://console.firebase.google.com/project/my-react-firebase-app-69fcd/settings/cloudmessaging');
        console.log('💡 Current key length:', vapidKey?.length || 0, '(should be ~87 characters)');
        return null;
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });

      if (token) {
        console.log('🔔 FCM Token received:', token.substring(0, 20) + '...');
        this.token = token;
        
        // Save token to user's document if userId provided
        if (userId) {
          await this.saveTokenToDatabase(userId, token);
        }
        
        return token;
      } else {
        console.log('🚫 No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async saveTokenToDatabase(userId, token) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingTokens = userData.fcmTokens || [];
        
        // Add token if it doesn't exist
        if (!existingTokens.includes(token)) {
          existingTokens.push(token);
          await setDoc(userRef, { 
            fcmTokens: existingTokens,
            lastTokenUpdate: serverTimestamp()
          }, { merge: true });
          
          console.log('🔔 FCM token saved to database');
        }
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  setupForegroundListener() {
    if (!messaging) return;

    // Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground message received:', payload);
      
      // Show custom notification for foreground messages
      this.showCustomNotification({
        title: payload.notification?.title || 'AmaPlayer',
        body: payload.notification?.body || 'You have a new notification',
        icon: '/logo192.png',
        data: payload.data
      });
    });
  }

  showCustomNotification({ title, body, icon, data }) {
    if (!this.isSupported) return;

    // Create and show notification
    const notification = new Notification(title, {
      body,
      icon,
      badge: '/logo192.png',
      tag: 'amaplayer-notification',
      data,
      requireInteraction: true
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to specific page if URL provided
      if (data?.url) {
        window.location.href = data.url;
      }
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // Send notification to specific user
  async sendNotificationToUser(receiverUserId, notification) {
    try {
      console.log('🔔 Creating notification for user:', receiverUserId, notification);
      
      const notificationData = {
        receiverId: receiverUserId,
        senderId: notification.senderId,
        senderName: notification.senderName,
        senderPhotoURL: notification.senderPhotoURL || '',
        type: notification.type, // 'like', 'comment', 'follow', 'message'
        message: notification.message,
        postId: notification.postId || null,
        storyId: notification.storyId || null,
        timestamp: serverTimestamp(),
        read: false,
        // Additional data for push notification
        pushData: {
          title: notification.title || 'AmaPlayer',
          body: notification.message,
          icon: '/logo192.png',
          url: notification.url || '/',
          ...notification.data
        }
      };

      console.log('📄 About to create notification with data:', notificationData);
      
      // Add notification to Firestore
      const notificationDoc = await addDoc(collection(db, 'notifications'), notificationData);

      console.log('✅ Notification successfully created with ID:', notificationDoc.id);
      console.log('📄 Notification saved to database with fields:', Object.keys(notificationData));
      
      // Immediately verify the notification was saved
      setTimeout(async () => {
        try {
          const savedDoc = await getDoc(doc(db, 'notifications', notificationDoc.id));
          if (savedDoc.exists()) {
            console.log('✅ Verification: Notification exists in database:', savedDoc.data());
          } else {
            console.error('❌ Verification: Notification NOT found in database!');
          }
        } catch (verifyError) {
          console.error('❌ Error verifying notification:', verifyError);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      console.error('❌ Notification data that failed:', notification);
    }
  }

  // Create a like notification
  async sendLikeNotification(likerUserId, likerName, likerPhotoURL, postOwnerUserId, postId, postData = null) {
    if (likerUserId === postOwnerUserId) return; // Don't notify yourself

    await this.sendNotificationToUser(postOwnerUserId, {
      senderId: likerUserId,
      senderName: likerName,
      senderPhotoURL: likerPhotoURL,
      type: 'like',
      message: `${likerName} liked your post`,
      title: 'New Like! ❤️',
      postId: postId,
      url: `/post/${postId}`,
      // Include post media data for preview
      postMediaUrl: postData?.mediaUrl || postData?.imageUrl || postData?.videoUrl,
      postMediaType: postData?.mediaType || (postData?.videoUrl ? 'video' : 'image'),
      postThumbnail: postData?.mediaMetadata?.thumbnail,
      postCaption: postData?.caption,
      data: {
        postId: postId,
        type: 'like'
      }
    });
  }

  // Create a comment notification
  async sendCommentNotification(commenterUserId, commenterName, commenterPhotoURL, postOwnerUserId, postId, commentText, postData = null) {
    if (commenterUserId === postOwnerUserId) return; // Don't notify yourself

    await this.sendNotificationToUser(postOwnerUserId, {
      senderId: commenterUserId,
      senderName: commenterName,
      senderPhotoURL: commenterPhotoURL,
      type: 'comment',
      message: `${commenterName} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      title: 'New Comment! 💬',
      postId: postId,
      url: `/post/${postId}`,
      // Include post media data for preview
      postMediaUrl: postData?.mediaUrl || postData?.imageUrl || postData?.videoUrl,
      postMediaType: postData?.mediaType || (postData?.videoUrl ? 'video' : 'image'),
      postThumbnail: postData?.mediaMetadata?.thumbnail,
      postCaption: postData?.caption,
      data: {
        postId: postId,
        type: 'comment'
      }
    });
  }

  // Create a story like notification
  async sendStoryLikeNotification(likerUserId, likerName, likerPhotoURL, storyOwnerUserId, storyId, storyData = null) {
    if (likerUserId === storyOwnerUserId) return; // Don't notify yourself

    await this.sendNotificationToUser(storyOwnerUserId, {
      senderId: likerUserId,
      senderName: likerName,
      senderPhotoURL: likerPhotoURL,
      type: 'story_like',
      message: `${likerName} liked your story`,
      title: 'Story Like! ❤️',
      storyId: storyId,
      url: `/story/${storyId}`,
      // Include story media data for preview
      storyMediaUrl: storyData?.mediaUrl,
      storyMediaType: storyData?.mediaType || 'image',
      storyThumbnail: storyData?.thumbnail,
      storyCaption: storyData?.caption,
      data: {
        storyId: storyId,
        type: 'story_like'
      }
    });
  }

  // Create a story view notification (for close friends or special viewers)
  async sendStoryViewNotification(viewerUserId, viewerName, viewerPhotoURL, storyOwnerUserId, storyId, storyData = null) {
    if (viewerUserId === storyOwnerUserId) return; // Don't notify yourself

    await this.sendNotificationToUser(storyOwnerUserId, {
      senderId: viewerUserId,
      senderName: viewerName,
      senderPhotoURL: viewerPhotoURL,
      type: 'story_view',
      message: `${viewerName} viewed your story`,
      title: 'Story View! 👀',
      storyId: storyId,
      url: `/story/${storyId}`,
      // Include story media data for preview
      storyMediaUrl: storyData?.mediaUrl,
      storyMediaType: storyData?.mediaType || 'image',
      storyThumbnail: storyData?.thumbnail,
      storyCaption: storyData?.caption,
      data: {
        storyId: storyId,
        type: 'story_view'
      }
    });
  }

  // Create a story comment notification
  async sendStoryCommentNotification(commenterUserId, commenterName, commenterPhotoURL, storyOwnerUserId, storyId, commentText, storyData = null) {
    if (commenterUserId === storyOwnerUserId) return; // Don't notify yourself

    await this.sendNotificationToUser(storyOwnerUserId, {
      senderId: commenterUserId,
      senderName: commenterName,
      senderPhotoURL: commenterPhotoURL,
      type: 'story_comment',
      message: `${commenterName} commented on your story: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      title: 'New Story Comment! 💬',
      storyId: storyId,
      url: `/story/${storyId}`,
      // Include story media data for preview
      storyMediaUrl: storyData?.mediaUrl,
      storyMediaType: storyData?.mediaType || 'image',
      storyThumbnail: storyData?.thumbnail,
      storyCaption: storyData?.caption,
      data: {
        storyId: storyId,
        type: 'story_comment'
      }
    });
  }

  // Create a follow notification
  async sendFollowNotification(followerUserId, followerName, followerPhotoURL, followedUserId) {
    await this.sendNotificationToUser(followedUserId, {
      senderId: followerUserId,
      senderName: followerName,
      senderPhotoURL: followerPhotoURL,
      type: 'follow',
      message: `${followerName} started following you`,
      title: 'New Follower! 👥',
      url: `/profile/${followerUserId}`,
      data: {
        userId: followerUserId,
        type: 'follow'
      }
    });
  }

  // Create a friend request notification
  async sendFriendRequestNotification(senderUserId, senderName, senderPhotoURL, receiverUserId) {
    await this.sendNotificationToUser(receiverUserId, {
      senderId: senderUserId,
      senderName: senderName,
      senderPhotoURL: senderPhotoURL,
      type: 'friend_request',
      message: `${senderName} sent you a friend request`,
      title: 'Friend Request! 🤝',
      url: '/messages?tab=requests',
      data: {
        userId: senderUserId,
        type: 'friend_request'
      }
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;