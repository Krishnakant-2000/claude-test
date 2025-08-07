import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  sport?: string;
  role?: 'athlete' | 'coach' | 'organization';
  gender?: 'male' | 'female' | 'other';
  age?: number;
  skills?: string[];
  achievements?: Array<{
    title: string;
    date: string;
    description: string;
  }>;
  certificates?: Array<{
    name: string;
    date: string;
    description: string;
    fileUrl?: string;
  }>;
  createdAt?: any;
  lastLoginAt?: any;
  isActive: boolean;
  isVerified?: boolean;
  followers?: number;
  following?: number;
  postsCount?: number;
  videosCount?: number;
  // Admin fields
  isSuspended?: boolean;
  suspendedAt?: any;
  suspensionReason?: string;
  adminNotes?: string;
}

class UserManagementService {
  private collectionName = 'users';

  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      // Don't order by createdAt since not all users have this field
      // Get all users and sort them client-side
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ 
          id: doc.id, 
          ...userData,
          isActive: userData.isActive !== false, // Default to true if not set
        } as User);
      });
      
      // Sort by displayName client-side for consistent ordering
      return users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      
      const filteredUsers = allUsers.filter(user => 
        user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: 'athlete' | 'coach' | 'organization'): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('role', '==', role)
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ 
          id: doc.id, 
          ...userData,
          isActive: userData.isActive !== false
        } as User);
      });
      
      return users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Get users by sport
  async getUsersBySport(sport: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('sport', '==', sport)
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ 
          id: doc.id, 
          ...userData,
          isActive: userData.isActive !== false
        } as User);
      });
      
      return users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    } catch (error) {
      console.error('Error fetching users by sport:', error);
      throw error;
    }
  }

  // Suspend user
  async suspendUser(userId: string, reason: string, adminNotes?: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        isSuspended: true,
        isActive: false,
        suspendedAt: serverTimestamp(),
        suspensionReason: reason,
        adminNotes: adminNotes || ''
      });
      
      console.log('User suspended successfully:', userId);
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  // Unsuspend user
  async unsuspendUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        isSuspended: false,
        isActive: true,
        suspendedAt: null,
        suspensionReason: null
      });
      
      console.log('User unsuspended successfully:', userId);
    } catch (error) {
      console.error('Error unsuspending user:', error);
      throw error;
    }
  }

  // Verify user
  async verifyUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        isVerified: true
      });
      
      console.log('User verified successfully:', userId);
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Unverify user
  async unverifyUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        isVerified: false
      });
      
      console.log('User verification removed:', userId);
    } catch (error) {
      console.error('Error removing user verification:', error);
      throw error;
    }
  }

  // Update user notes
  async updateUserNotes(userId: string, adminNotes: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        adminNotes
      });
      
      console.log('User notes updated:', userId);
    } catch (error) {
      console.error('Error updating user notes:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    verified: number;
    athletes: number;
    coaches: number;
    organizations: number;
  }> {
    try {
      const allUsers = await this.getAllUsers();
      
      return {
        total: allUsers.length,
        active: allUsers.filter(u => u.isActive && !u.isSuspended).length,
        suspended: allUsers.filter(u => u.isSuspended).length,
        verified: allUsers.filter(u => u.isVerified).length,
        athletes: allUsers.filter(u => u.role === 'athlete').length,
        coaches: allUsers.filter(u => u.role === 'coach').length,
        organizations: allUsers.filter(u => u.role === 'organization').length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Delete user (use with caution)
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, userId));
      console.log('User deleted successfully:', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();