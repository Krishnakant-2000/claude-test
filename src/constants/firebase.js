// Firebase collections and document paths
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  STORIES: 'stories',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  FRIEND_REQUESTS: 'friendRequests',
  FOLLOWS: 'follows',
  REPORTS: 'reports',
  ADMIN_LOGS: 'adminLogs',
  EVENTS: 'events'
};

// Firebase storage paths
export const STORAGE_PATHS = {
  POSTS: 'posts',
  STORIES: 'stories',
  PROFILE_IMAGES: 'profile-images',
  VIDEOS: 'videos',
  THUMBNAILS: 'thumbnails',
  TEMP_UPLOADS: 'temp-uploads'
};

// Firebase security rules constants
export const ADMIN_EMAILS = [
  'admin@amaplayer.com',
  'moderator@amaplayer.com'
];