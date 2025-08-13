// AmaPlayer Service Worker - Phase 3: Offline Features
// Enhanced service worker with background sync capabilities as per documentation

// Import existing Phase 1 functionality
importScripts('./sw-phase1.js');

// Additional cache versions for Phase 3
const OFFLINE_DATA_CACHE = 'amaplayer-offline-data-v1';
const USER_CONTENT_CACHE = 'amaplayer-user-content-v1';

console.log('SW Phase 3: Service worker with background sync loading...');

// Background sync event handler as per documentation
self.addEventListener('sync', event => {
  console.log('SW Phase 3: Background sync triggered:', event.tag);

  if (event.tag === 'post-sync') {
    event.waitUntil(syncPendingPosts());
  } else if (event.tag === 'like-sync') {
    event.waitUntil(syncPendingLikes());
  } else if (event.tag === 'comment-sync') {
    event.waitUntil(syncPendingComments());
  } else if (event.tag === 'follow-sync') {
    event.waitUntil(syncPendingFollows());
  }
});

// Sync pending posts as per documentation
const syncPendingPosts = async () => {
  console.log('SW Phase 3: Starting post sync...');
  
  try {
    const pendingPosts = await getAllPendingPosts();
    console.log(`SW Phase 3: Found ${pendingPosts.length} pending posts to sync`);

    for (const post of pendingPosts) {
      try {
        await uploadPostToFirebase(post);
        await removeFromIndexedDB('offline_posts', post.id);
        console.log('SW Phase 3: Post synced successfully:', post.id);
      } catch (error) {
        console.error('SW Phase 3: Failed to sync post:', post.id, error);
        await handleSyncFailure('post', post);
      }
    }
  } catch (error) {
    console.error('SW Phase 3: Post sync process failed:', error);
  }
};

// Sync pending likes
const syncPendingLikes = async () => {
  console.log('SW Phase 3: Starting like sync...');
  
  try {
    const pendingLikes = await getAllPendingLikes();
    console.log(`SW Phase 3: Found ${pendingLikes.length} pending likes to sync`);

    for (const like of pendingLikes) {
      try {
        await uploadLikeToFirebase(like);
        await removeFromIndexedDB('offline_likes', like.id);
        console.log('SW Phase 3: Like synced successfully:', like.id);
      } catch (error) {
        console.error('SW Phase 3: Failed to sync like:', like.id, error);
        await handleSyncFailure('like', like);
      }
    }
  } catch (error) {
    console.error('SW Phase 3: Like sync process failed:', error);
  }
};

// Sync pending comments
const syncPendingComments = async () => {
  console.log('SW Phase 3: Starting comment sync...');
  
  try {
    const pendingComments = await getAllPendingComments();
    console.log(`SW Phase 3: Found ${pendingComments.length} pending comments to sync`);

    for (const comment of pendingComments) {
      try {
        await uploadCommentToFirebase(comment);
        await removeFromIndexedDB('offline_comments', comment.id);
        console.log('SW Phase 3: Comment synced successfully:', comment.id);
      } catch (error) {
        console.error('SW Phase 3: Failed to sync comment:', comment.id, error);
        await handleSyncFailure('comment', comment);
      }
    }
  } catch (error) {
    console.error('SW Phase 3: Comment sync process failed:', error);
  }
};

// Sync pending follows
const syncPendingFollows = async () => {
  console.log('SW Phase 3: Starting follow sync...');
  
  try {
    const pendingFollows = await getAllPendingFollows();
    console.log(`SW Phase 3: Found ${pendingFollows.length} pending follows to sync`);

    for (const follow of pendingFollows) {
      try {
        if (follow.action === 'follow') {
          await uploadFollowToFirebase(follow);
        } else if (follow.action === 'unfollow') {
          await uploadUnfollowToFirebase(follow);
        }
        await removeFromIndexedDB('offline_follows', follow.id);
        console.log('SW Phase 3: Follow action synced successfully:', follow.id);
      } catch (error) {
        console.error('SW Phase 3: Failed to sync follow:', follow.id, error);
        await handleSyncFailure('follow', follow);
      }
    }
  } catch (error) {
    console.error('SW Phase 3: Follow sync process failed:', error);
  }
};

// IndexedDB operations in service worker
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AmaPlayerOfflineDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllPendingPosts = async () => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_posts'], 'readonly');
    const store = transaction.objectStore('offline_posts');
    const index = store.index('status');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllPendingLikes = async () => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_likes'], 'readonly');
    const store = transaction.objectStore('offline_likes');
    const index = store.index('status');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllPendingComments = async () => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_comments'], 'readonly');
    const store = transaction.objectStore('offline_comments');
    const index = store.index('status');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllPendingFollows = async () => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_follows'], 'readonly');
    const store = transaction.objectStore('offline_follows');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const removeFromIndexedDB = async (storeName, id) => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Firebase API calls for syncing
const uploadPostToFirebase = async (post) => {
  const apiUrl = '/api/posts'; // Adjust based on your API structure
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      userId: post.userId
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload post: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

const uploadLikeToFirebase = async (like) => {
  const apiUrl = `/api/posts/${like.postId}/like`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: like.userId
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload like: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

const uploadCommentToFirebase = async (comment) => {
  const apiUrl = `/api/posts/${comment.postId}/comments`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: comment.userId,
      content: comment.content
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload comment: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

const uploadFollowToFirebase = async (follow) => {
  const apiUrl = '/api/follows';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      followerId: follow.followerId,
      followingId: follow.followingId
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload follow: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

const uploadUnfollowToFirebase = async (follow) => {
  const apiUrl = '/api/follows';
  
  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      followerId: follow.followerId,
      followingId: follow.followingId
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to upload unfollow: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Handle sync failures
const handleSyncFailure = async (type, item) => {
  const retryCount = (item.retryCount || 0) + 1;
  const maxRetries = 3;

  if (retryCount >= maxRetries) {
    console.error(`SW Phase 3: Max retries reached for ${type}:`, item.id);
    // Mark as failed in IndexedDB
    await updateItemStatus(type, item.id, 'failed', retryCount);
    
    // Send notification to user about failed sync
    await showSyncFailureNotification(type, item.id);
  } else {
    console.log(`SW Phase 3: Retry ${retryCount}/${maxRetries} for ${type}:`, item.id);
    await updateItemStatus(type, item.id, 'pending', retryCount);
  }
};

const updateItemStatus = async (type, id, status, retryCount) => {
  const db = await openIndexedDB();
  const storeMap = {
    post: 'offline_posts',
    like: 'offline_likes',
    comment: 'offline_comments',
    follow: 'offline_follows'
  };
  
  const storeName = storeMap[type];
  if (!storeName) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Get the current item first
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.status = status;
        item.retryCount = retryCount;
        item.updatedAt = new Date().toISOString();
        
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve(false);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Show sync failure notification
const showSyncFailureNotification = async (type, id) => {
  if ('Notification' in self && self.Notification.permission === 'granted') {
    await self.registration.showNotification('AmaPlayer Sync Failed', {
      body: `Failed to sync ${type}. Please check your connection and try again.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `sync-failed-${type}-${id}`,
      actions: [
        {
          action: 'retry',
          title: 'Retry'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }
};

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('SW Phase 3: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'retry') {
    // Trigger sync retry
    event.waitUntil(
      Promise.all([
        syncPendingPosts(),
        syncPendingLikes(),
        syncPendingComments(),
        syncPendingFollows()
      ])
    );
  }
});

// Enhanced fetch event with offline data support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension:')) {
    return;
  }
  
  // Handle API requests with offline fallback
  if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else {
    // Use Phase 1 static asset handling
    return;
  }
});

// Handle API requests with offline data fallback
const handleAPIRequest = async (request) => {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(USER_CONTENT_CACHE);
      cache.put(request.clone(), response.clone());
      return response;
    }
    
    throw new Error(`API request failed: ${response.status}`);
  } catch (error) {
    console.log('SW Phase 3: API request failed, checking cache and offline data:', error);
    
    // Check cache first
    const cache = await caches.open(USER_CONTENT_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('SW Phase 3: Serving from cache:', request.url);
      return cached;
    }
    
    // Check IndexedDB for offline data
    if (request.url.includes('/posts')) {
      return await serveOfflinePosts();
    } else if (request.url.includes('/users')) {
      return await serveOfflineUsers();
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Content not available offline',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Serve offline posts from IndexedDB
const serveOfflinePosts = async () => {
  try {
    const db = await openIndexedDB();
    const offlinePosts = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['offline_posts'], 'readonly');
      const store = transaction.objectStore('offline_posts');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return new Response(JSON.stringify(offlinePosts), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Data': 'true'
      }
    });
  } catch (error) {
    console.error('SW Phase 3: Failed to serve offline posts:', error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Serve offline users from IndexedDB
const serveOfflineUsers = async () => {
  try {
    const db = await openIndexedDB();
    const offlineUsers = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['cached_users'], 'readonly');
      const store = transaction.objectStore('cached_users');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return new Response(JSON.stringify(offlineUsers), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Data': 'true'
      }
    });
  } catch (error) {
    console.error('SW Phase 3: Failed to serve offline users:', error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

console.log('SW Phase 3: Service worker with background sync loaded successfully');