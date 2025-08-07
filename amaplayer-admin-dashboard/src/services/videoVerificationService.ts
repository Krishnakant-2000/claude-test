import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface TalentVideo {
  id: string;
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoURL?: string;
  videoUrl: string;
  fileName?: string;
  title?: string;
  description?: string;
  category?: string;
  uploadedAt: any;
  views?: number;
  likes?: string[];
  thumbnail?: string;
  fileSize?: number;
  duration?: number;
  flags?: {
    reason: string;
    flaggedBy: string;
    flaggedAt: any;
  }[];
  // Verification fields
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  reviewedAt?: any;
  verifiedAt?: any;
  verifiedBy?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

class VideoVerificationService {
  private collectionName = 'talentVideos';

  // Get all videos for verification
  async getAllVideos(): Promise<TalentVideo[]> {
    try {
      console.log('🎬 Admin: Fetching all videos from collection:', this.collectionName);
      
      // Simple query without ordering to avoid index requirements
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const videos: TalentVideo[] = [];
      
      console.log(`📊 Admin: Found ${querySnapshot.size} videos in database`);
      
      querySnapshot.forEach((doc) => {
        const videoData = doc.data();
        const processedVideo = { 
          id: doc.id, 
          ...videoData,
          // Ensure verification fields exist
          isVerified: videoData.isVerified || false,
          verificationStatus: videoData.verificationStatus || 'pending'
        } as TalentVideo;
        
        console.log('📝 Admin: Processing video:', {
          id: processedVideo.id,
          fileName: processedVideo.fileName,
          userDisplayName: processedVideo.userDisplayName,
          verificationStatus: processedVideo.verificationStatus,
          isVerified: processedVideo.isVerified,
          uploadedAt: processedVideo.uploadedAt
        });
        
        videos.push(processedVideo);
      });
      
      // Sort by uploadedAt client-side (newest first)
      const sortedVideos = videos.sort((a, b) => {
        const aTime = a.uploadedAt?.seconds || 0;
        const bTime = b.uploadedAt?.seconds || 0;
        return bTime - aTime;
      });
      
      console.log(`✅ Admin: Returning ${sortedVideos.length} processed videos`);
      return sortedVideos;
    } catch (error) {
      console.error('❌ Admin: Error fetching videos:', error);
      throw error;
    }
  }

  // Get pending videos for verification
  async getPendingVideos(): Promise<TalentVideo[]> {
    try {
      // Get all videos and filter client-side to avoid index requirements
      const allVideos = await this.getAllVideos();
      
      // Filter for pending videos
      const pendingVideos = allVideos.filter(video => 
        video.verificationStatus === 'pending' || 
        video.verificationStatus === undefined ||
        video.verificationStatus === null
      );
      
      return pendingVideos;
    } catch (error) {
      console.error('Error fetching pending videos:', error);
      throw error;
    }
  }

  // Approve video
  async approveVideo(videoId: string, adminEmail?: string, adminNotes?: string): Promise<void> {
    try {
      const videoRef = doc(db, this.collectionName, videoId);
      await updateDoc(videoRef, {
        isVerified: true,
        verificationStatus: 'approved',
        verifiedAt: serverTimestamp(),
        verifiedBy: adminEmail || 'admin',
        adminNotes: adminNotes || '',
        rejectionReason: null
      });
      
      console.log('Video approved successfully:', videoId);
    } catch (error) {
      console.error('Error approving video:', error);
      throw error;
    }
  }

  // Flag video
  async flagVideo(videoId: string, reason: string, adminEmail?: string): Promise<void> {
    try {
      const videoRef = doc(db, this.collectionName, videoId);
      await updateDoc(videoRef, {
        [`flags.${Date.now()}`]: {
          reason,
          flaggedBy: adminEmail || 'admin',
          flaggedAt: serverTimestamp()
        }
      });
      
      console.log('Video flagged:', videoId);
    } catch (error) {
      console.error('Error flagging video:', error);
      throw error;
    }
  }

  // Reject video
  async rejectVideo(videoId: string, rejectionReason?: string, adminEmail?: string, adminNotes?: string): Promise<void> {
    try {
      const videoRef = doc(db, this.collectionName, videoId);
      await updateDoc(videoRef, {
        isVerified: false,
        verificationStatus: 'rejected',
        verifiedAt: serverTimestamp(),
        verifiedBy: adminEmail || 'admin',
        rejectionReason: rejectionReason || 'No reason provided',
        adminNotes: adminNotes || ''
      });
      
      console.log('Video rejected:', videoId);
    } catch (error) {
      console.error('Error rejecting video:', error);
      throw error;
    }
  }

  // Reset video to pending status
  async resetVideoStatus(videoId: string): Promise<void> {
    try {
      const videoRef = doc(db, this.collectionName, videoId);
      await updateDoc(videoRef, {
        isVerified: false,
        verificationStatus: 'pending',
        verifiedAt: null,
        verifiedBy: null,
        rejectionReason: null,
        adminNotes: null
      });
      
      console.log('Video status reset to pending:', videoId);
    } catch (error) {
      console.error('Error resetting video status:', error);
      throw error;
    }
  }

  // Get videos by user
  async getVideosByUser(userId: string): Promise<TalentVideo[]> {
    try {
      // Get all videos and filter client-side to avoid index requirements
      const allVideos = await this.getAllVideos();
      
      // Filter for specific user
      const userVideos = allVideos.filter(video => video.userId === userId);
      
      return userVideos;
    } catch (error) {
      console.error('Error fetching user videos:', error);
      throw error;
    }
  }

  // Get verification statistics
  async getVerificationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const allVideos = await this.getAllVideos();
      
      return {
        total: allVideos.length,
        pending: allVideos.filter(v => v.verificationStatus === 'pending').length,
        approved: allVideos.filter(v => v.verificationStatus === 'approved').length,
        rejected: allVideos.filter(v => v.verificationStatus === 'rejected').length
      };
    } catch (error) {
      console.error('Error getting verification stats:', error);
      throw error;
    }
  }
}

export const videoVerificationService = new VideoVerificationService();