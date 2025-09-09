// Stories Service - Firebase operations for Stories feature
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

// Stories Collection Operations
export class StoriesService {
  
  // Create a new story
  static async createStory(userId, userDisplayName, userPhotoURL, mediaFile, caption = '', mediaType = 'image') {
    try {
      console.log('📱 Creating new story...', { userId, mediaType, caption });
      
      // Upload media file
      const mediaUrl = await this.uploadStoryMedia(mediaFile, userId, mediaType);
      
      // Generate thumbnail for videos
      let thumbnail = null;
      if (mediaType === 'video') {
        thumbnail = await this.generateVideoThumbnail(mediaFile);
      }
      
      // Calculate expiry time (24 hours from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
      
      // Generate public link
      const storyId = `story_${userId}_${Date.now()}`;
      const publicLink = `${window.location.origin}/story/${storyId}`;
      
      // Create story document
      const storyData = {
        userId,
        userDisplayName: userDisplayName || 'Anonymous User',
        userPhotoURL: userPhotoURL || '',
        mediaType,
        mediaUrl,
        thumbnail,
        caption: caption.trim(),
        timestamp: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        viewCount: 0,
        viewers: [],
        isHighlight: false,
        highlightId: null,
        sharingEnabled: true,
        publicLink
      };
      
      const docRef = await addDoc(collection(db, 'stories'), storyData);
      console.log('✅ Story created successfully:', docRef.id);
      
      return { id: docRef.id, ...storyData };
      
    } catch (error) {
      console.error('❌ Error creating story:', error);
      throw error;
    }
  }
  
  // Upload story media to Firebase Storage
  static async uploadStoryMedia(mediaFile, userId, mediaType) {
    try {
      console.log('🔍 uploadStoryMedia called with:', { userId, mediaType, fileName: mediaFile.name });
      
      if (!userId) {
        throw new Error('User ID is required for story upload');
      }
      
      const safeFileName = mediaFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const storagePath = `stories/${mediaType}s/${userId}/${timestamp}-${safeFileName}`;
      
      console.log('📁 Constructing storage path:', storagePath);
      
      const storageRef = ref(storage, storagePath);
      
      console.log('📤 Uploading story media...', { 
        path: storageRef.fullPath,
        userId,
        mediaType,
        fileName: `${timestamp}-${safeFileName}`
      });
      
      const uploadResult = await uploadBytes(storageRef, mediaFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      console.log('✅ Story media uploaded successfully:', downloadUrl);
      return downloadUrl;
      
    } catch (error) {
      console.error('❌ Error uploading story media:', error);
      console.error('Parameters received:', { userId, mediaType, fileName: mediaFile?.name });
      throw error;
    }
  }
  
  // Generate video thumbnail (placeholder implementation)
  static async generateVideoThumbnail(videoFile) {
    // TODO: Implement proper video thumbnail generation
    // For now, return a placeholder
    return 'https://via.placeholder.com/300x400/333/fff?text=Video+Story';
  }
  
  // Get active stories (not expired)
  static async getActiveStories() {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'stories'),
        where('expiresAt', '>', Timestamp.fromDate(now)),
        orderBy('expiresAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const stories = [];
      
      snapshot.forEach((doc) => {
        stories.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by timestamp in memory (most recent first)
      stories.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      });
      
      console.log('📱 Active stories fetched:', stories.length);
      return stories;
      
    } catch (error) {
      console.error('❌ Error fetching active stories:', error);
      return [];
    }
  }
  
  // Get stories by user ID
  static async getUserStories(userId) {
    try {
      const now = new Date();
      
      // Use simpler query to avoid index requirement, then filter in memory
      const q = query(
        collection(db, 'stories'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const stories = [];
      
      snapshot.forEach((doc) => {
        const storyData = { id: doc.id, ...doc.data() };
        
        // Filter expired stories in memory
        const expiresAt = storyData.expiresAt?.toDate ? storyData.expiresAt.toDate() : new Date(storyData.expiresAt);
        if (expiresAt > now) {
          stories.push(storyData);
        }
      });
      
      // Sort by timestamp in memory
      stories.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA; // Descending order
      });
      
      console.log(`🔍 getUserStories: Found ${stories.length} active stories for user ${userId}`);
      return stories;
      
    } catch (error) {
      console.error('❌ Error fetching user stories:', error);
      return [];
    }
  }
  
  // View a story (increment view count and add viewer)
  static async viewStory(storyId, viewerId) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      const viewers = storyData.viewers || [];
      
      // Only count unique views
      if (!viewers.includes(viewerId)) {
        await updateDoc(storyRef, {
          viewCount: (storyData.viewCount || 0) + 1,
          viewers: [...viewers, viewerId]
        });
        
        // Log story view
        await addDoc(collection(db, 'storyViews'), {
          storyId,
          viewerId,
          viewedAt: serverTimestamp(),
          viewDuration: 0 // Will be updated when story viewing ends
        });
        
        console.log('👁️ Story view recorded:', storyId);
      }
      
    } catch (error) {
      console.error('❌ Error recording story view:', error);
    }
  }
  
  // Delete a story
  static async deleteStory(storyId, userId) {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      
      // Only allow story owner to delete
      if (storyData.userId !== userId) {
        throw new Error('Not authorized to delete this story');
      }
      
      await deleteDoc(storyRef);
      console.log('🗑️ Story deleted successfully:', storyId);
      
    } catch (error) {
      console.error('❌ Error deleting story:', error);
      throw error;
    }
  }
  
  // Get expired stories for cleanup
  static async getExpiredStories() {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'stories'),
        where('expiresAt', '<=', Timestamp.fromDate(now)),
        where('isHighlight', '==', false) // Don't delete highlighted stories
      );
      
      const snapshot = await getDocs(q);
      const expiredStories = [];
      
      snapshot.forEach((doc) => {
        expiredStories.push({ id: doc.id, ...doc.data() });
      });
      
      return expiredStories;
      
    } catch (error) {
      console.error('❌ Error fetching expired stories:', error);
      return [];
    }
  }
  
  // Real-time listener for active stories
  static onActiveStoriesUpdate(callback) {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'stories'),
        where('expiresAt', '>', Timestamp.fromDate(now)),
        orderBy('expiresAt', 'desc')
      );
      
      return onSnapshot(q, (snapshot) => {
        const stories = [];
        snapshot.forEach((doc) => {
          stories.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by timestamp in memory (most recent first)
        stories.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
          const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
          return timeB - timeA;
        });
        
        callback(stories);
      });
      
    } catch (error) {
      console.error('❌ Error setting up stories listener:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }
}

// Highlights Service
export class HighlightsService {
  
  // Create a new highlight
  static async createHighlight(userId, title, coverImage, storyIds = []) {
    try {
      const highlightData = {
        userId,
        title: title.trim(),
        coverImage: coverImage || '',
        storyIds: storyIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic: true
      };
      
      const docRef = await addDoc(collection(db, 'highlights'), highlightData);
      
      // Mark stories as highlights
      for (const storyId of storyIds) {
        await updateDoc(doc(db, 'stories', storyId), {
          isHighlight: true,
          highlightId: docRef.id
        });
      }
      
      console.log('✨ Highlight created successfully:', docRef.id);
      return { id: docRef.id, ...highlightData };
      
    } catch (error) {
      console.error('❌ Error creating highlight:', error);
      throw error;
    }
  }
  
  // Get user highlights
  static async getUserHighlights(userId) {
    try {
      const q = query(
        collection(db, 'highlights'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const highlights = [];
      
      snapshot.forEach((doc) => {
        highlights.push({ id: doc.id, ...doc.data() });
      });
      
      return highlights;
      
    } catch (error) {
      console.error('❌ Error fetching highlights:', error);
      return [];
    }
  }
  
  // Add story to highlight
  static async addStoryToHighlight(highlightId, storyId) {
    try {
      const highlightRef = doc(db, 'highlights', highlightId);
      const highlightDoc = await getDoc(highlightRef);
      
      if (!highlightDoc.exists()) {
        throw new Error('Highlight not found');
      }
      
      const highlightData = highlightDoc.data();
      const currentStoryIds = highlightData.storyIds || [];
      
      if (!currentStoryIds.includes(storyId)) {
        await updateDoc(highlightRef, {
          storyIds: [...currentStoryIds, storyId],
          updatedAt: serverTimestamp()
        });
        
        // Mark story as highlight
        await updateDoc(doc(db, 'stories', storyId), {
          isHighlight: true,
          highlightId: highlightId
        });
        
        console.log('✨ Story added to highlight successfully');
      }
      
    } catch (error) {
      console.error('❌ Error adding story to highlight:', error);
      throw error;
    }
  }
  
  // Remove story from highlight
  static async removeStoryFromHighlight(highlightId, storyId) {
    try {
      const highlightRef = doc(db, 'highlights', highlightId);
      const highlightDoc = await getDoc(highlightRef);
      
      if (!highlightDoc.exists()) {
        throw new Error('Highlight not found');
      }
      
      const highlightData = highlightDoc.data();
      const currentStoryIds = highlightData.storyIds || [];
      const updatedStoryIds = currentStoryIds.filter(id => id !== storyId);
      
      await updateDoc(highlightRef, {
        storyIds: updatedStoryIds,
        updatedAt: serverTimestamp()
      });
      
      // Unmark story as highlight
      await updateDoc(doc(db, 'stories', storyId), {
        isHighlight: false,
        highlightId: null
      });
      
      console.log('✨ Story removed from highlight successfully');
      
    } catch (error) {
      console.error('❌ Error removing story from highlight:', error);
      throw error;
    }
  }
}

export default StoriesService;