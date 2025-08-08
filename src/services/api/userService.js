// User service with business logic
import { BaseService } from './baseService';
import { COLLECTIONS } from '../../constants/firebase';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

class UserService extends BaseService {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  // Create user profile
  async createUserProfile(userData) {
    try {
      const userProfile = {
        ...userData,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        storiesCount: 0,
        isVerified: false,
        isActive: true,
        privacy: {
          profileVisibility: 'public',
          followingVisible: false,
          followersVisible: true,
        },
        settings: {
          notifications: true,
          emailNotifications: false,
          pushNotifications: true,
        },
      };

      // Use user ID as document ID
      const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
      await setDoc(userRef, userProfile);
      
      console.log('✅ User profile created:', userData.uid);
      return { id: userData.uid, ...userProfile };
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile by ID
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        console.log('✅ User profile retrieved:', userId);
        return userData;
      } else {
        console.warn('⚠️ User profile not found:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      
      console.log('✅ User profile updated:', userId);
      return { id: userId, ...updateData };
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(searchTerm, limit = 20) {
    try {
      // Search by display name
      const nameResults = await this.search('displayName', searchTerm, limit);
      
      // Search by username if it exists
      let usernameResults = [];
      try {
        usernameResults = await this.search('username', searchTerm, limit);
      } catch (error) {
        console.log('Username search not available');
      }
      
      // Combine and deduplicate results
      const allResults = [...nameResults, ...usernameResults];
      const uniqueResults = allResults.filter((user, index, array) => 
        array.findIndex(u => u.id === user.id) === index
      );
      
      return uniqueResults.slice(0, limit);
    } catch (error) {
      console.error('❌ Error searching users:', error);
      throw error;
    }
  }

  // Follow/unfollow user
  async toggleFollow(currentUserId, targetUserId) {
    try {
      if (currentUserId === targetUserId) {
        throw new Error('Cannot follow yourself');
      }

      // Get current user's following list
      const currentUser = await this.getUserProfile(currentUserId);
      const following = currentUser?.following || [];
      
      // Get target user's followers list
      const targetUser = await this.getUserProfile(targetUserId);
      const followers = targetUser?.followers || [];
      
      const isFollowing = following.includes(targetUserId);
      
      let updatedFollowing;
      let updatedFollowers;
      let followersCount;
      let followingCount;

      if (isFollowing) {
        // Unfollow
        updatedFollowing = following.filter(id => id !== targetUserId);
        updatedFollowers = followers.filter(id => id !== currentUserId);
        followersCount = Math.max(0, (targetUser.followersCount || 0) - 1);
        followingCount = Math.max(0, (currentUser.followingCount || 0) - 1);
        console.log('👎 Unfollowed user:', targetUserId);
      } else {
        // Follow
        updatedFollowing = [...following, targetUserId];
        updatedFollowers = [...followers, currentUserId];
        followersCount = (targetUser.followersCount || 0) + 1;
        followingCount = (currentUser.followingCount || 0) + 1;
        console.log('👍 Followed user:', targetUserId);
      }

      // Update current user's following
      await this.updateUserProfile(currentUserId, {
        following: updatedFollowing,
        followingCount,
      });

      // Update target user's followers
      await this.updateUserProfile(targetUserId, {
        followers: updatedFollowers,
        followersCount,
      });

      return {
        isFollowing: !isFollowing,
        followersCount,
        followingCount,
      };
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
      throw error;
    }
  }

  // Get user's followers
  async getUserFollowers(userId, limit = 50) {
    try {
      const user = await this.getUserProfile(userId);
      if (!user || !user.followers) {
        return [];
      }

      // Get follower profiles in chunks
      const followerProfiles = await this.getUserProfiles(user.followers.slice(0, limit));
      return followerProfiles;
    } catch (error) {
      console.error('❌ Error getting user followers:', error);
      throw error;
    }
  }

  // Get user's following
  async getUserFollowing(userId, limit = 50) {
    try {
      const user = await this.getUserProfile(userId);
      if (!user || !user.following) {
        return [];
      }

      // Get following profiles in chunks
      const followingProfiles = await this.getUserProfiles(user.following.slice(0, limit));
      return followingProfiles;
    } catch (error) {
      console.error('❌ Error getting user following:', error);
      throw error;
    }
  }

  // Get multiple user profiles
  async getUserProfiles(userIds) {
    try {
      const profiles = [];
      
      // Process in chunks to avoid overwhelming Firestore
      const chunkSize = 10;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(id => this.getUserProfile(id));
        const chunkResults = await Promise.all(chunkPromises);
        
        profiles.push(...chunkResults.filter(profile => profile !== null));
      }

      return profiles;
    } catch (error) {
      console.error('❌ Error getting user profiles:', error);
      throw error;
    }
  }

  // Update user statistics
  async updateUserStats(userId, statsUpdate) {
    try {
      const validStats = ['postsCount', 'storiesCount', 'followersCount', 'followingCount'];
      const filteredUpdate = {};
      
      Object.keys(statsUpdate).forEach(key => {
        if (validStats.includes(key)) {
          filteredUpdate[key] = Math.max(0, statsUpdate[key]);
        }
      });

      await this.updateUserProfile(userId, filteredUpdate);
      console.log('📊 User stats updated:', userId, filteredUpdate);
      
      return filteredUpdate;
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
      throw error;
    }
  }

  // Get user activity summary
  async getUserActivitySummary(userId) {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) {
        return null;
      }

      return {
        postsCount: user.postsCount || 0,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        storiesCount: user.storiesCount || 0,
        isVerified: user.isVerified || false,
        joinDate: user.createdAt,
        lastActive: user.updatedAt,
      };
    } catch (error) {
      console.error('❌ Error getting user activity summary:', error);
      throw error;
    }
  }
}

export default new UserService();