// Posts service with business logic
import { BaseService } from './baseService';
import { COLLECTIONS } from '../../constants/firebase';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class PostsService extends BaseService {
  constructor() {
    super(COLLECTIONS.POSTS);
  }

  // Create post with media upload
  async createPost(postData, mediaFile = null) {
    try {
      let mediaUrl = null;
      let mediaMetadata = null;

      // Upload media if provided
      if (mediaFile) {
        const uploadResult = await this.uploadMedia(mediaFile);
        mediaUrl = uploadResult.url;
        mediaMetadata = uploadResult.metadata;
      }

      const postDoc = {
        ...postData,
        mediaUrl,
        mediaMetadata,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        likes: [],
        comments: [],
        shares: [],
        visibility: postData.visibility || 'public',
        isActive: true,
      };

      const result = await this.create(postDoc);
      console.log('✅ Post created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error creating post:', error);
      throw error;
    }
  }

  // Upload media to Firebase Storage
  async uploadMedia(file) {
    try {
      const filename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `posts/${filename}`);
      
      console.log('📤 Uploading media file:', filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const metadata = {
        size: file.size,
        type: file.type,
        name: file.name,
        uploadedAt: new Date().toISOString(),
      };

      console.log('✅ Media uploaded successfully:', downloadURL);
      return { url: downloadURL, metadata };
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      throw error;
    }
  }

  // Get posts by user
  async getPostsByUser(userId, limit = 20) {
    const filters = [
      { field: 'userId', operator: '==', value: userId },
      { field: 'isActive', operator: '==', value: true }
    ];
    
    return this.getAll(filters, 'timestamp', 'desc', limit);
  }

  // Get feed posts for user (following + own posts)
  async getFeedPosts(userId, followingList = [], limit = 20) {
    try {
      // Get user's own posts
      const userPosts = await this.getPostsByUser(userId, Math.ceil(limit / 2));
      
      // Get posts from following users
      let followingPosts = [];
      if (followingList.length > 0) {
        // Firestore 'in' query limitation - max 10 items
        const chunks = this.chunkArray(followingList, 10);
        
        for (const chunk of chunks) {
          const filters = [
            { field: 'userId', operator: 'in', value: chunk },
            { field: 'isActive', operator: '==', value: true }
          ];
          const posts = await this.getAll(filters, 'timestamp', 'desc', Math.ceil(limit / 2));
          followingPosts = [...followingPosts, ...posts];
        }
      }

      // Combine and sort posts
      const allPosts = [...userPosts, ...followingPosts]
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        .slice(0, limit);

      return allPosts;
    } catch (error) {
      console.error('❌ Error getting feed posts:', error);
      throw error;
    }
  }

  // Like/unlike post
  async toggleLike(postId, userId, userInfo) {
    try {
      const post = await this.getById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const likes = post.likes || [];
      const isLiked = likes.some(like => like.userId === userId);
      
      let updatedLikes;
      let updatedLikesCount;

      if (isLiked) {
        // Unlike
        updatedLikes = likes.filter(like => like.userId !== userId);
        updatedLikesCount = (post.likesCount || 0) - 1;
        console.log('👎 Post unliked by:', userId);
      } else {
        // Like
        const likeData = {
          userId,
          userName: userInfo.displayName,
          userPhotoURL: userInfo.photoURL,
          timestamp: new Date().toISOString(),
        };
        updatedLikes = [...likes, likeData];
        updatedLikesCount = (post.likesCount || 0) + 1;
        console.log('👍 Post liked by:', userId);
      }

      await this.update(postId, {
        likes: updatedLikes,
        likesCount: Math.max(0, updatedLikesCount),
      });

      return { liked: !isLiked, likesCount: updatedLikesCount };
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      throw error;
    }
  }

  // Add comment to post
  async addComment(postId, commentData) {
    try {
      const post = await this.getById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const comment = {
        id: `comment_${Date.now()}`,
        ...commentData,
        timestamp: new Date().toISOString(),
        likes: [],
        replies: [],
      };

      const updatedComments = [...(post.comments || []), comment];
      const updatedCommentsCount = (post.commentsCount || 0) + 1;

      await this.update(postId, {
        comments: updatedComments,
        commentsCount: updatedCommentsCount,
      });

      console.log('💬 Comment added to post:', postId);
      return comment;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  }

  // Delete post
  async deletePost(postId, userId) {
    try {
      const post = await this.getById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      if (post.userId !== userId) {
        throw new Error('Unauthorized to delete this post');
      }

      // Delete associated media from storage
      if (post.mediaUrl) {
        try {
          const mediaRef = ref(storage, post.mediaUrl);
          await deleteObject(mediaRef);
          console.log('🗑️ Media deleted from storage');
        } catch (error) {
          console.warn('⚠️ Could not delete media from storage:', error);
        }
      }

      // Soft delete - mark as inactive
      await this.update(postId, {
        isActive: false,
        deletedAt: new Date().toISOString(),
      });

      console.log('🗑️ Post deleted successfully:', postId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      throw error;
    }
  }

  // Utility method to chunk arrays for Firestore 'in' queries
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Search posts
  async searchPosts(searchTerm, limit = 20) {
    return this.search('caption', searchTerm, limit);
  }

  // Get trending posts
  async getTrendingPosts(limit = 20) {
    // Simple trending algorithm - posts with high engagement in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filters = [
      { field: 'timestamp', operator: '>=', value: oneDayAgo },
      { field: 'isActive', operator: '==', value: true }
    ];
    
    const posts = await this.getAll(filters, 'likesCount', 'desc', limit);
    return posts.filter(post => (post.likesCount || 0) > 0);
  }
}

export default new PostsService();