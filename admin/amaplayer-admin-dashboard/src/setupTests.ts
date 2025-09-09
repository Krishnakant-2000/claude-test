// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn()
  },
  storage: {
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn()
  }
}));

// Mock environment variables
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.REACT_APP_FIREBASE_APP_ID = '1:123456789:web:abcdef';
