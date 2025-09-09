// User Verification Service - Handle verification requests and voting
import { db } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { DeviceFingerprint } from '../../utils/deviceFingerprint';

export class VerificationService {
  
  // Create a verification request
  static async createVerificationRequest(userId, userProfile, userVideos) {
    try {
      // Check if user already has a pending or approved verification
      const existingRequest = await this.getUserVerificationRequest(userId);
      if (existingRequest && existingRequest.status !== 'rejected') {
        throw new Error('You already have a pending or approved verification request');
      }

      // Generate unique verification ID
      const verificationId = `verify_${userId}_${Date.now()}`;
      
      const verificationData = {
        verificationId,
        userId,
        userDisplayName: userProfile.displayName || 'Anonymous User',
        userPhotoURL: userProfile.photoURL || '',
        userRole: userProfile.role || 'athlete',
        
        // User info for verification page
        userInfo: {
          name: userProfile.name || userProfile.displayName || '',
          age: userProfile.age || null,
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          sport: userProfile.sport || '',
          achievements: userProfile.achievements || [],
          certificates: userProfile.certificates || []
        },
        
        // Videos for showcase (limit to 5 most recent)
        showcaseVideos: userVideos.slice(0, 5).map(video => ({
          id: video.id || '',
          videoUrl: video.videoUrl || '',
          thumbnail: video.metadata?.thumbnail || '',
          fileName: video.fileName || '',
          uploadedAt: video.uploadedAt || null,
          duration: video.metadata?.durationFormatted || '0:00'
        })),
        
        // Verification tracking
        verificationCount: 0,
        verificationGoal: 4, // Need 4 verifications
        verifiedBy: [], // Array of device IDs who verified
        
        // Status and timestamps
        status: 'pending', // pending, verified, rejected
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        
        // Public link info
        isPublic: true,
        shareableLink: this.generateShareableLink(verificationId),
        
        // Anti-fraud tracking (changed from IP to device-based)
        verifiedDevices: [], // Array of unique device IDs
        verificationIPs: [], // Keep for analytics but not primary check
        flagged: false,
        flagReason: null
      };

      // Save to verificationRequests collection
      console.log('💾 Saving verification request to Firestore:', {
        verificationId: verificationData.verificationId,
        userId: verificationData.userId,
        status: verificationData.status
      });
      
      const docRef = await addDoc(collection(db, 'verificationRequests'), verificationData);
      console.log('✅ Verification request saved with document ID:', docRef.id);
      
      return {
        ...verificationData,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating verification request:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw new Error(`Failed to create verification request: ${error.message}`);
    }
  }

  // Get user's verification request
  static async getUserVerificationRequest(userId) {
    try {
      const q = query(
        collection(db, 'verificationRequests'),
        where('userId', '==', userId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting verification request:', error);
      return null;
    }
  }

  // Get verification request by ID (for public verification page)
  static async getVerificationRequest(verificationId) {
    try {
      console.log('🔍 Searching for verification ID:', verificationId);
      const q = query(
        collection(db, 'verificationRequests'),
        where('verificationId', '==', verificationId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      console.log('📊 Query results:', { empty: snapshot.empty, size: snapshot.size });
      
      if (snapshot.empty) {
        console.log('❌ No documents found for verification ID:', verificationId);
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      // Check if verification has expired
      const now = new Date();
      const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
      
      if (now > expiresAt && data.status === 'pending') {
        // Mark as expired
        await updateDoc(doc.ref, { status: 'expired' });
        return null;
      }
      
      return {
        id: doc.id,
        ...data
      };
    } catch (error) {
      console.error('Error getting verification request:', error);
      return null;
    }
  }

  // Submit a verification vote
  static async submitVerification(verificationId, voterInfo = {}) {
    try {
      const verificationDoc = await this.getVerificationRequest(verificationId);
      if (!verificationDoc) {
        throw new Error('Verification request not found or expired');
      }

      if (verificationDoc.status !== 'pending') {
        throw new Error('This verification request is no longer active');
      }

      // Generate unique device ID for this voter
      const deviceId = DeviceFingerprint.getDeviceId();
      const voterIP = voterInfo.ip || 'unknown';
      
      console.log('🔍 Checking device verification:', {
        deviceId: deviceId.substring(0, 12) + '...',
        verificationId,
        existingDevices: verificationDoc.verifiedDevices?.length || 0
      });

      // Check if device has already verified (primary check)
      if (verificationDoc.verifiedDevices && verificationDoc.verifiedDevices.includes(deviceId)) {
        throw new Error('You have already verified this user from this device');
      }

      // Get device info for logging
      const deviceInfo = DeviceFingerprint.getDeviceInfo();

      // Create verification record with device information
      const verificationData = {
        verificationId,
        userId: verificationDoc.userId,
        deviceId,
        voterIP, // Keep for analytics
        deviceInfo: {
          browser: deviceInfo.browser.name,
          platform: deviceInfo.browser.platform,
          screen: deviceInfo.system.screen,
          timezone: deviceInfo.system.timezone,
          timestamp: serverTimestamp()
        },
        voterInfo: {
          userAgent: voterInfo.userAgent || navigator.userAgent || '',
          timestamp: serverTimestamp(),
          referrer: voterInfo.referrer || document.referrer || ''
        },
        verifiedAt: serverTimestamp()
      };

      // Add to verifications collection
      await addDoc(collection(db, 'verifications'), verificationData);

      // Update verification request
      const updatedCount = verificationDoc.verificationCount + 1;
      const updateData = {
        verificationCount: updatedCount,
        verifiedDevices: [...(verificationDoc.verifiedDevices || []), deviceId],
        verificationIPs: [...(verificationDoc.verificationIPs || []), voterIP], // Keep for analytics
        verifiedBy: [...(verificationDoc.verifiedBy || []), {
          deviceId,
          ip: voterIP,
          timestamp: new Date(),
          browser: deviceInfo.browser.name,
          platform: deviceInfo.browser.platform,
          userAgent: voterInfo.userAgent || navigator.userAgent || ''
        }]
      };

      // Check if verification is complete (reached goal)
      if (updatedCount >= verificationDoc.verificationGoal) {
        updateData.status = 'verified';
        updateData.verifiedAt = serverTimestamp();
        
        // Update user profile with verification badge
        await this.updateUserVerificationStatus(verificationDoc.userId, verificationDoc.userRole);
        
        console.log('✅ Verification completed!', {
          userId: verificationDoc.userId,
          finalCount: updatedCount
        });
      }

      // Update verification request
      const q = query(
        collection(db, 'verificationRequests'),
        where('verificationId', '==', verificationId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, updateData);
      }

      console.log('✅ Verification submitted successfully:', {
        deviceId: deviceId.substring(0, 12) + '...',
        newCount: updatedCount,
        isComplete: updatedCount >= verificationDoc.verificationGoal
      });

      return {
        success: true,
        newCount: updatedCount,
        isComplete: updatedCount >= verificationDoc.verificationGoal,
        remaining: Math.max(0, verificationDoc.verificationGoal - updatedCount),
        deviceId: deviceId.substring(0, 12) + '...' // Partial for privacy
      };
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  }

  // Update user's verification status in their profile
  static async updateUserVerificationStatus(userId, role) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isVerified: true,
        verificationBadge: this.getRoleBadge(role),
        verifiedAt: serverTimestamp(),
        verifiedRole: role
      });
    } catch (error) {
      console.error('Error updating user verification status:', error);
    }
  }

  // Get role-specific badge
  static getRoleBadge(role) {
    const badges = {
      athlete: { icon: '🏆', label: 'Verified Athlete' },
      coach: { icon: '🏃‍♂️', label: 'Verified Coach' },
      organisation: { icon: '🏢', label: 'Verified Organization' }
    };
    return badges[role] || badges.athlete;
  }

  // Generate shareable verification link
  static generateShareableLink(verificationId) {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/verify/${verificationId}`;
    }
    
    // Fallback for server-side rendering or development
    // Try to get the production URL from environment variables first
    const productionUrl = process.env.REACT_APP_PRODUCTION_URL || 'https://my-react-firebase-app-69fcd.web.app';
    return `${productionUrl}/verify/${verificationId}`;
  }

  // Get verification statistics
  static async getVerificationStats(verificationId) {
    try {
      const verificationDoc = await this.getVerificationRequest(verificationId);
      if (!verificationDoc) {
        return null;
      }

      return {
        current: verificationDoc.verificationCount,
        goal: verificationDoc.verificationGoal,
        remaining: Math.max(0, verificationDoc.verificationGoal - verificationDoc.verificationCount),
        percentage: Math.min(100, (verificationDoc.verificationCount / verificationDoc.verificationGoal) * 100),
        isComplete: verificationDoc.verificationCount >= verificationDoc.verificationGoal,
        status: verificationDoc.status
      };
    } catch (error) {
      console.error('Error getting verification stats:', error);
      return null;
    }
  }

  // Check if user can request verification
  static async canRequestVerification(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { canRequest: false, reason: 'User profile not found' };
      }

      const userData = userDoc.data();
      
      // Check if already verified
      if (userData.isVerified) {
        return { canRequest: false, reason: 'Already verified' };
      }

      // Check if has pending request
      const existingRequest = await this.getUserVerificationRequest(userId);
      if (existingRequest && existingRequest.status === 'pending') {
        return { 
          canRequest: false, 
          reason: 'Verification request already pending',
          existingRequest 
        };
      }

      // Users can now request verification without requiring approved talent videos
      return { canRequest: true };
    } catch (error) {
      console.error('Error checking verification eligibility:', error);
      return { canRequest: false, reason: 'Error checking eligibility' };
    }
  }
}

export default VerificationService;