// Application constants
export const APP_NAME = 'AmaPlayer';
export const APP_VERSION = '1.0.0';

// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/home',
  SEARCH: '/search',
  ADD_POST: '/add-post',
  MESSAGES: '/messages',
  EVENTS: '/events',
  PROFILE: '/profile',
  POST_DETAIL: '/post/:postId',
  STORY_DETAIL: '/story/:storyId',
  STORY_SHARE: '/story-share/:storyId'
};

// API constants
export const POSTS_PER_PAGE = 10;
export const STORIES_PER_PAGE = 20;
export const COMMENTS_PER_POST = 50;

// File upload constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  STORY_LIKE: 'story_like',
  STORY_VIEW: 'story_view',
  STORY_COMMENT: 'story_comment',
  FRIEND_REQUEST: 'friend_request',
  MESSAGE: 'message'
};

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Language constants
export const SUPPORTED_LANGUAGES = [
  'en', 'hi', 'pa', 'mr', 'bn', 'ta', 'te', 'kn', 'ml', 'gu', 'or', 'as'
];