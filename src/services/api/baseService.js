// Base service class for Firebase operations
import { db } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';

export class BaseService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collection = collection(db, collectionName);
  }

  // Create a new document
  async create(data) {
    try {
      const docRef = await addDoc(this.collection, {
        ...data,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Created ${this.collectionName} document:`, docRef.id);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`❌ Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get document by ID
  async getById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.warn(`⚠️ ${this.collectionName} document not found:`, id);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Updated ${this.collectionName} document:`, id);
      return { id, ...data };
    } catch (error) {
      console.error(`❌ Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      console.log(`✅ Deleted ${this.collectionName} document:`, id);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents with optional filtering
  async getAll(filters = [], orderByField = 'timestamp', orderDirection = 'desc', limitCount = 50) {
    try {
      let q = this.collection;
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Retrieved ${documents.length} ${this.collectionName} documents`);
      return documents;
    } catch (error) {
      console.error(`❌ Error getting ${this.collectionName} collection:`, error);
      throw error;
    }
  }

  // Get documents with pagination
  async getPaginated(pageSize = 10, lastDoc = null, filters = [], orderByField = 'timestamp') {
    try {
      let q = this.collection;
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      q = query(q, orderBy(orderByField, 'desc'));
      
      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      q = query(q, limit(pageSize));
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      let lastDocument = null;
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
        lastDocument = doc;
      });
      
      return {
        documents,
        lastDocument,
        hasMore: documents.length === pageSize,
      };
    } catch (error) {
      console.error(`❌ Error getting paginated ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Search documents
  async search(searchField, searchValue, limitCount = 20) {
    try {
      const q = query(
        this.collection,
        where(searchField, '>=', searchValue),
        where(searchField, '<=', searchValue + '\uf8ff'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`🔍 Found ${documents.length} ${this.collectionName} documents`);
      return documents;
    } catch (error) {
      console.error(`❌ Error searching ${this.collectionName}:`, error);
      throw error;
    }
  }
}