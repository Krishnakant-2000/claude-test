import { userManagementService, User } from '../userManagementService';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config', () => ({
  db: jest.fn()
}));

const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockedDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockedDoc = doc as jest.MockedFunction<typeof doc>;
const mockedCollection = collection as jest.MockedFunction<typeof collection>;

describe('UserManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch and return all users with default active status', async () => {
      const mockUsers = [
        {
          id: 'user1',
          email: 'user1@test.com',
          displayName: 'Test User 1',
          role: 'athlete',
          isActive: true
        },
        {
          id: 'user2',
          email: 'user2@test.com',
          displayName: 'Test User 2',
          role: 'coach'
          // isActive not set - should default to true
        }
      ];

      const mockQuerySnapshot = {
        docs: mockUsers.map(user => ({
          id: user.id,
          data: () => {
            const { id, ...userData } = user;
            return userData;
          }
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const result = await userManagementService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'user1',
        email: 'user1@test.com',
        displayName: 'Test User 1',
        isActive: true
      });
      expect(result[1]).toMatchObject({
        id: 'user2',
        email: 'user2@test.com',
        displayName: 'Test User 2',
        isActive: true // Should default to true
      });
    });

    it('should sort users by display name', async () => {
      const mockUsers = [
        { id: 'user1', displayName: 'Zebra User', email: 'z@test.com' },
        { id: 'user2', displayName: 'Alpha User', email: 'a@test.com' },
        { id: 'user3', displayName: 'Beta User', email: 'b@test.com' }
      ];

      const mockQuerySnapshot = {
        docs: mockUsers.map(user => ({
          id: user.id,
          data: () => {
            const { id, ...userData } = user;
            return userData;
          }
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const result = await userManagementService.getAllUsers();

      expect(result[0].displayName).toBe('Alpha User');
      expect(result[1].displayName).toBe('Beta User');
      expect(result[2].displayName).toBe('Zebra User');
    });

    it('should handle Firebase errors', async () => {
      mockedGetDocs.mockRejectedValue(new Error('Firebase error'));
      mockedCollection.mockReturnValue({} as any);

      await expect(userManagementService.getAllUsers()).rejects.toThrow('Firebase error');
    });
  });

  describe('searchUsers', () => {
    it('should filter users by search criteria', async () => {
      const mockUsers = [
        {
          id: 'user1',
          displayName: 'John Athlete',
          email: 'john@test.com',
          bio: 'Basketball player',
          sport: 'Basketball',
          location: 'New York'
        },
        {
          id: 'user2',
          displayName: 'Jane Coach',
          email: 'jane@test.com',
          bio: 'Soccer coach',
          sport: 'Soccer',
          location: 'California'
        },
        {
          id: 'user3',
          displayName: 'Bob Runner',
          email: 'bob@test.com',
          bio: 'Marathon runner',
          sport: 'Running',
          location: 'Texas'
        }
      ];

      const mockQuerySnapshot = {
        docs: mockUsers.map(user => ({
          id: user.id,
          data: () => ({ ...user, id: undefined, isActive: true })
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      // Search by sport
      const basketballResults = await userManagementService.searchUsers('Basketball');
      expect(basketballResults).toHaveLength(1);
      expect(basketballResults[0].displayName).toBe('John Athlete');

      // Search by location
      const californiaResults = await userManagementService.searchUsers('California');
      expect(californiaResults).toHaveLength(1);
      expect(californiaResults[0].displayName).toBe('Jane Coach');

      // Search by user ID
      const user2Results = await userManagementService.searchUsers('user2');
      expect(user2Results).toHaveLength(1);
      expect(user2Results[0].displayName).toBe('Jane Coach');
    });

    it('should return empty array for no matches', async () => {
      const mockQuerySnapshot = {
        docs: [{
          id: 'user1',
          data: () => ({ displayName: 'Test User', email: 'test@test.com', isActive: true })
        }],
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const result = await userManagementService.searchUsers('nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('suspendUser', () => {
    it('should suspend user with reason and notes', async () => {
      const userId = 'user123';
      const reason = 'Inappropriate behavior';
      const adminNotes = 'Multiple violations reported';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await userManagementService.suspendUser(userId, reason, adminNotes);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isSuspended: true,
          isActive: false,
          suspensionReason: reason,
          adminNotes: adminNotes
        })
      );
    });

    it('should handle suspension without admin notes', async () => {
      const userId = 'user123';
      const reason = 'Spam content';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await userManagementService.suspendUser(userId, reason);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isSuspended: true,
          isActive: false,
          suspensionReason: reason,
          adminNotes: ''
        })
      );
    });
  });

  describe('unsuspendUser', () => {
    it('should unsuspend user and clear suspension data', async () => {
      const userId = 'user123';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await userManagementService.unsuspendUser(userId);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isSuspended: false,
          isActive: true,
          suspendedAt: null,
          suspensionReason: null
        })
      );
    });
  });

  describe('verifyUser', () => {
    it('should verify user account', async () => {
      const userId = 'user123';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await userManagementService.verifyUser(userId);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isVerified: true
        })
      );
    });
  });

  describe('unverifyUser', () => {
    it('should remove user verification', async () => {
      const userId = 'user123';

      mockedDoc.mockReturnValue({} as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await userManagementService.unverifyUser(userId);

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isVerified: false
        })
      );
    });
  });

  describe('getUserStats', () => {
    it('should return correct user statistics', async () => {
      const mockUsers = [
        { isActive: true, isSuspended: false, isVerified: true, role: 'athlete' },
        { isActive: true, isSuspended: false, isVerified: false, role: 'coach' },
        { isActive: false, isSuspended: true, isVerified: true, role: 'athlete' },
        { isActive: true, isSuspended: false, isVerified: true, role: 'organization' },
        { isActive: true, isSuspended: false, isVerified: false, role: 'athlete' }
      ];

      const mockQuerySnapshot = {
        docs: mockUsers.map((user, index) => ({
          id: `user${index}`,
          data: () => user
        })),
        forEach: jest.fn(function(callback) {
          this.docs.forEach(callback);
        })
      };

      mockedGetDocs.mockResolvedValue(mockQuerySnapshot as any);
      mockedCollection.mockReturnValue({} as any);

      const stats = await userManagementService.getUserStats();

      expect(stats).toEqual({
        total: 5,
        active: 4, // isActive && !isSuspended
        suspended: 1,
        verified: 3,
        athletes: 3,
        coaches: 1,
        organizations: 1
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user document', async () => {
      const userId = 'user123';

      mockedDoc.mockReturnValue({} as any);
      mockedDeleteDoc.mockResolvedValue(undefined);

      await userManagementService.deleteUser(userId);

      expect(mockedDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });

    it('should handle deletion errors', async () => {
      const userId = 'user123';

      mockedDoc.mockReturnValue({} as any);
      mockedDeleteDoc.mockRejectedValue(new Error('Deletion failed'));

      await expect(userManagementService.deleteUser(userId)).rejects.toThrow('Deletion failed');
    });
  });
});