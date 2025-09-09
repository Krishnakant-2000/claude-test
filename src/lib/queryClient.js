// React Query configuration for offline-first caching
import { QueryClient } from '@tanstack/react-query';

// Create QueryClient with offline-first configuration as per documentation
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache retention time
      retry: 3, // Retry failed requests 3 times
      networkMode: 'offlineFirst', // Offline-first strategy
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: false, // Don't always refetch on mount
    },
    mutations: {
      retry: 2, // Retry failed mutations 2 times
      networkMode: 'offlineFirst',
    },
  },
});

// Custom query options for different content types
export const QUERY_CONFIGS = {
  // User data - longer cache times
  USER_PROFILE: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Posts - medium cache times
  POSTS: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  },
  
  // Real-time data - shorter cache times
  MESSAGES: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Static data - long cache times
  SPORTS_DATA: {
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Events - medium-long cache times
  EVENTS: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
};

// Query key factories for consistent key management
export const queryKeys = {
  // User-related queries
  user: (userId) => ['user', userId],
  userProfile: (userId) => ['user', 'profile', userId],
  userPosts: (userId) => ['user', 'posts', userId],
  userFollowers: (userId) => ['user', 'followers', userId],
  userFollowing: (userId) => ['user', 'following', userId],
  
  // Posts queries
  posts: () => ['posts'],
  postsByUser: (userId) => ['posts', 'user', userId],
  postDetail: (postId) => ['posts', postId],
  postComments: (postId) => ['posts', postId, 'comments'],
  
  // Messages queries
  conversations: (userId) => ['messages', 'conversations', userId],
  messages: (conversationId) => ['messages', conversationId],
  
  // Events queries
  events: () => ['events'],
  eventsByDate: (date) => ['events', 'date', date],
  eventDetail: (eventId) => ['events', eventId],
  
  // Sports data queries
  sports: () => ['sports'],
  athletes: () => ['athletes'],
  athleteProfile: (athleteId) => ['athletes', athleteId],
  
  // Search queries
  searchUsers: (query) => ['search', 'users', query],
  searchPosts: (query) => ['search', 'posts', query],
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all user-related data
  userData: (userId) => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  },
  
  // Invalidate posts data
  posts: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
  
  // Invalidate specific post
  post: (postId) => {
    queryClient.invalidateQueries({ queryKey: ['posts', postId] });
  },
  
  // Invalidate messages
  messages: (userId) => {
    queryClient.invalidateQueries({ queryKey: ['messages', 'conversations', userId] });
  },
};

export default queryClient;