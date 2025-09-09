// React Query hooks for posts data with offline-first caching
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import postsService from '../services/api/postsService';
import { queryKeys, QUERY_CONFIGS } from '../lib/queryClient';
import { getUserCacheManager } from '../utils/caching/userCacheManager';

// Hook for getting posts feed with infinite scrolling
export const usePostsFeed = (userId, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.posts(),
    queryFn: async ({ pageParam = null }) => {
      // Try cache first
      const cacheManager = getUserCacheManager(userId);
      if (!pageParam && cacheManager) {
        const cached = await cacheManager.getCachedUserData('USER_POSTS', 'feed');
        if (cached) {
          console.log('📋 Posts feed loaded from cache');
          return cached;
        }
      }

      // Fetch from API
      const posts = await postsService.getPosts({ 
        limit: options.limit || 10,
        startAfter: pageParam 
      });
      
      // Cache first page
      if (!pageParam && cacheManager && posts?.posts) {
        await cacheManager.cacheUserData('USER_POSTS', posts, 'feed');
      }
      
      return posts;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken || null,
    ...QUERY_CONFIGS.POSTS,
    ...options,
  });
};

// Hook for getting posts by specific user
export const useUserPosts = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.postsByUser(userId),
    queryFn: async () => {
      const cacheManager = getUserCacheManager(userId);
      if (cacheManager) {
        const cached = await cacheManager.getCachedUserData('USER_POSTS', 'userPosts');
        if (cached) {
          return cached;
        }
      }

      const posts = await postsService.getUserPosts(userId, options.limit || 20);
      
      if (cacheManager && posts) {
        await cacheManager.cacheUserData('USER_POSTS', posts, 'userPosts');
      }
      
      return posts;
    },
    enabled: !!userId,
    ...QUERY_CONFIGS.POSTS,
    ...options,
  });
};

// Hook for getting following users' posts
export const useFollowingPosts = (userId, options = {}) => {
  return useQuery({
    queryKey: ['posts', 'following', userId],
    queryFn: async () => {
      const cacheManager = getUserCacheManager(userId);
      if (cacheManager) {
        const cached = await cacheManager.getCachedUserData('FOLLOWED_CONTENT', 'posts');
        if (cached) {
          return cached;
        }
      }

      // This would need to be implemented in postsService - placeholder for now
      console.log('Following posts placeholder - method not yet implemented in postsService');
      const posts = [];
      
      if (cacheManager && posts) {
        await cacheManager.cacheUserData('FOLLOWED_CONTENT', posts, 'posts');
      }
      
      return posts;
    },
    enabled: !!userId,
    ...QUERY_CONFIGS.POSTS,
    ...options,
  });
};

// Hook for getting single post details
export const usePostDetail = (postId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.postDetail(postId),
    queryFn: () => postsService.getPostById(postId),
    enabled: !!postId,
    ...QUERY_CONFIGS.POSTS,
    ...options,
  });
};

// Hook for getting post comments
export const usePostComments = (postId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.postComments(postId),
    queryFn: () => {
      // Placeholder - getPostComments method not yet implemented
      console.log('Post comments placeholder - method not yet implemented');
      return [];
    },
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes - comments change frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes cache retention
    ...options,
  });
};

// Hook for searching posts
export const useSearchPosts = (searchTerm, options = {}) => {
  return useQuery({
    queryKey: queryKeys.searchPosts(searchTerm),
    queryFn: () => {
      // Placeholder - searchPosts method not yet implemented
      console.log('Search posts placeholder - method not yet implemented');
      return [];
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 3 * 60 * 1000, // 3 minutes for search results
    cacheTime: 5 * 60 * 1000, // 5 minutes cache retention
    ...options,
  });
};

// Mutation for creating a new post
export const useCreatePost = (userId) => {
  const queryClient = useQueryClient();
  const cacheManager = getUserCacheManager(userId);

  return useMutation({
    mutationFn: (postData) => {
      // Placeholder - createPost method not yet implemented
      console.log('Create post placeholder - method not yet implemented');
      return Promise.resolve({ ...postData, id: `temp-${Date.now()}` });
    },
    onSuccess: async (data) => {
      // Invalidate posts queries to refetch with new post
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.postsByUser(userId) });
      
      // Update user-specific cache
      if (cacheManager) {
        await cacheManager.clearUserCache('USER_POSTS');
      }
      
      // Update user posts count
      queryClient.setQueryData(['user', 'profile', userId], (old) => ({
        ...old,
        postsCount: (old?.postsCount || 0) + 1,
      }));
    },
  });
};

// Mutation for updating a post
export const useUpdatePost = (userId) => {
  const queryClient = useQueryClient();
  const cacheManager = getUserCacheManager(userId);

  return useMutation({
    mutationFn: ({ postId, updateData }) => {
      // Placeholder - updatePost method not yet implemented
      console.log('Update post placeholder - method not yet implemented');
      return Promise.resolve({ postId, ...updateData });
    },
    onMutate: async ({ postId, updateData }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.postDetail(postId) });
      
      const previousPost = queryClient.getQueryData(queryKeys.postDetail(postId));
      
      queryClient.setQueryData(queryKeys.postDetail(postId), (old) => ({
        ...old,
        ...updateData,
        updatedAt: new Date().toISOString(),
      }));

      return { previousPost };
    },
    onError: (err, { postId }, context) => {
      // Revert optimistic update
      queryClient.setQueryData(queryKeys.postDetail(postId), context.previousPost);
    },
    onSettled: async ({ postId }) => {
      // Refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: queryKeys.postDetail(postId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      
      if (cacheManager) {
        await cacheManager.clearUserCache('USER_POSTS');
      }
    },
  });
};

// Mutation for deleting a post
export const useDeletePost = (userId) => {
  const queryClient = useQueryClient();
  const cacheManager = getUserCacheManager(userId);

  return useMutation({
    mutationFn: (postId) => {
      // Placeholder - deletePost method not yet implemented
      console.log('Delete post placeholder - method not yet implemented');
      return Promise.resolve();
    },
    onSuccess: async (data, postId) => {
      // Remove from all queries
      queryClient.removeQueries({ queryKey: queryKeys.postDetail(postId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.postsByUser(userId) });
      
      // Clear user cache
      if (cacheManager) {
        await cacheManager.clearUserCache('USER_POSTS');
      }
      
      // Update user posts count
      queryClient.setQueryData(['user', 'profile', userId], (old) => ({
        ...old,
        postsCount: Math.max(0, (old?.postsCount || 0) - 1),
      }));
    },
  });
};

// Mutation for liking/unliking a post
export const useTogglePostLike = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }) => {
      // Placeholder - togglePostLike method not yet implemented
      console.log('Toggle post like placeholder - method not yet implemented');
      return Promise.resolve({ postId, isLiked: !isLiked });
    },
    onMutate: async ({ postId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.postDetail(postId) });
      
      const previousPost = queryClient.getQueryData(queryKeys.postDetail(postId));
      
      if (previousPost) {
        queryClient.setQueryData(queryKeys.postDetail(postId), {
          ...previousPost,
          likes: isLiked 
            ? (previousPost.likes || []).filter(id => id !== userId)
            : [...(previousPost.likes || []), userId],
          likesCount: isLiked 
            ? Math.max(0, (previousPost.likesCount || 0) - 1)
            : (previousPost.likesCount || 0) + 1,
        });
      }

      return { previousPost };
    },
    onError: (err, { postId }, context) => {
      // Revert optimistic update
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.postDetail(postId), context.previousPost);
      }
    },
    onSettled: ({ postId }) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
    },
  });
};

// Mutation for adding a comment
export const useAddComment = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, comment }) => {
      // Placeholder - addComment method not yet implemented
      console.log('Add comment placeholder - method not yet implemented');
      return Promise.resolve({ ...comment, userId, id: `temp-comment-${Date.now()}` });
    },
    onSuccess: (data, { postId }) => {
      // Invalidate comments and post details
      queryClient.invalidateQueries({ queryKey: queryKeys.postComments(postId) });
      
      // Update post comments count optimistically
      queryClient.setQueryData(queryKeys.postDetail(postId), (old) => ({
        ...old,
        commentsCount: (old?.commentsCount || 0) + 1,
      }));
    },
  });
};

// Hook for prefetching posts data
export const usePrefetchPosts = () => {
  const queryClient = useQueryClient();

  const prefetchPostsFeed = async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts(),
      queryFn: () => postsService.getPosts({ limit: 10 }),
      ...QUERY_CONFIGS.POSTS,
    });
  };

  const prefetchUserPosts = async (userId) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.postsByUser(userId),
      queryFn: () => postsService.getUserPosts(userId, 20),
      ...QUERY_CONFIGS.POSTS,
    });
  };

  const prefetchPostDetail = async (postId) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.postDetail(postId),
      queryFn: () => postsService.getPostById(postId),
      ...QUERY_CONFIGS.POSTS,
    });
  };

  return {
    prefetchPostsFeed,
    prefetchUserPosts,
    prefetchPostDetail,
  };
};

// Hook for managing posts cache
export const usePostsCache = (userId) => {
  const cacheManager = getUserCacheManager(userId);

  const clearPostsCache = async () => {
    if (cacheManager) {
      return await cacheManager.clearUserCache('USER_POSTS');
    }
    return false;
  };

  const cachePostsData = async (data, key = 'feed') => {
    if (cacheManager) {
      return await cacheManager.cacheUserData('USER_POSTS', data, key);
    }
    return false;
  };

  const getCachedPosts = async (key = 'feed') => {
    if (cacheManager) {
      return await cacheManager.getCachedUserData('USER_POSTS', key);
    }
    return null;
  };

  return {
    clearPostsCache,
    cachePostsData,
    getCachedPosts,
  };
};