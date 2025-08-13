import { videoVerificationService, TalentVideo } from '../videoVerificationService';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config', () => ({
  db: jest.fn()
}));

const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockedDoc = doc as jest.MockedFunction<typeof doc>;
const mockedCollection = collection as jest.MockedFunction<typeof collection>;

describe('VideoVerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVideos', () => {
    it('should fetch and return all videos with verification status', async () => {
      const mockVideos = [
        {
          id: 'video1',
          userId: 'user1',
          userDisplayName: 'Test User 1',
          videoUrl: 'https://example.com/video1.mp4',
          verificationStatus: 'pending',
          isVerified: false
        },
        {
          id: 'video2',
          userId: 'user2',
          userDisplayName: 'Test User 2', 
          videoUrl: 'https://example.com/video2.mp4',
          verificationStatus: 'approved',
          isVerified: true
        }
      ];

      const mockQuerySnapshot = {
        size: 2,
        docs: mockVideos.map(video => ({
          id: video.id,
          data: () => ({ ...video, id: undefined })
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const result = await videoVerificationService.getAllVideos();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'video1',
        userId: 'user1',
        verificationStatus: 'pending',
        isVerified: false
      });
      expect(result[1]).toMatchObject({
        id: 'video2',
        userId: 'user2',
        verificationStatus: 'approved',
        isVerified: true
      });
    });

    it('should handle empty video collection', async () => {
      const mockQuerySnapshot = {
        size: 0,
        docs: [],
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const result = await videoVerificationService.getAllVideos();

      expect(result).toHaveLength(0);
    });

    it('should handle Firebase errors gracefully', async () => {
      mockedGetDocs.mockRejectedValue(new Error('Firebase connection error'));
      mockedCollection.mockReturnValue({} as any);

      await expect(videoVerificationService.getAllVideos()).rejects.toThrow('Firebase connection error');
    });
  });

  describe('getPendingVideos', () => {
    it('should return only pending videos', async () => {
      const mockVideos = [
        {
          id: 'video1',
          verificationStatus: 'pending',
          isVerified: false
        },
        {
          id: 'video2',
          verificationStatus: 'approved',
          isVerified: true
        },
        {
          id: 'video3',
          verificationStatus: 'pending',
          isVerified: false
        }
      ];

      const mockQuerySnapshot = {
        size: 3,
        docs: mockVideos.map(video => ({
          id: video.id,
          data: () => ({ ...video, id: undefined })
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const result = await videoVerificationService.getPendingVideos();

      expect(result).toHaveLength(2);
      expect(result.every(video => video.verificationStatus === 'pending')).toBe(true);
    });
  });

  describe('approveVideo', () => {
    it('should approve video with correct Firebase update', async () => {
      const videoId = 'video123';
      const adminEmail = 'admin@test.com';
      const adminNotes = 'Good quality video';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await videoVerificationService.approveVideo(videoId, adminEmail, adminNotes);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isVerified: true,
          verificationStatus: 'approved',
          verifiedBy: adminEmail,
          adminNotes: adminNotes,
          rejectionReason: null
        })
      );
    });

    it('should use default admin email when not provided', async () => {
      const videoId = 'video123';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await videoVerificationService.approveVideo(videoId);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          verifiedBy: 'admin'
        })
      );
    });
  });

  describe('rejectVideo', () => {
    it('should reject video with reason', async () => {
      const videoId = 'video123';
      const rejectionReason = 'Inappropriate content';
      const adminEmail = 'admin@test.com';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await videoVerificationService.rejectVideo(videoId, rejectionReason, adminEmail);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isVerified: false,
          verificationStatus: 'rejected',
          rejectionReason: rejectionReason,
          verifiedBy: adminEmail
        })
      );
    });

    it('should provide default rejection reason when none given', async () => {
      const videoId = 'video123';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await videoVerificationService.rejectVideo(videoId);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          rejectionReason: 'No reason provided'
        })
      );
    });
  });

  describe('flagVideo', () => {
    it('should flag video with timestamp', async () => {
      const videoId = 'video123';
      const reason = 'Spam content';
      const adminEmail = 'admin@test.com';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await videoVerificationService.flagVideo(videoId, reason, adminEmail);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          [`flags.${expect.any(Number)}`]: expect.objectContaining({
            reason: reason,
            flaggedBy: adminEmail
          })
        })
      );
    });
  });

  describe('getVerificationStats', () => {
    it('should return correct statistics', async () => {
      const mockVideos = [
        { verificationStatus: 'pending' },
        { verificationStatus: 'approved' },
        { verificationStatus: 'rejected' },
        { verificationStatus: 'pending' },
        { verificationStatus: 'approved' }
      ];

      const mockQuerySnapshot = {
        size: 5,
        docs: mockVideos.map((video, index) => ({
          id: `video${index}`,
          data: () => video
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const stats = await videoVerificationService.getVerificationStats();

      expect(stats).toEqual({
        total: 5,
        pending: 2,
        approved: 2,
        rejected: 1
      });
    });
  });
});