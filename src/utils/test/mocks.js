// Mock data and functions for testing

// Mock Firebase Firestore responses
export const mockFirestoreDoc = (data) => ({
  id: data.id || 'mock-doc-id',
  data: () => data,
  exists: () => true,
});

export const mockFirestoreCollection = (docs = []) => ({
  docs: docs.map(doc => mockFirestoreDoc(doc)),
  size: docs.length,
  empty: docs.length === 0,
  forEach: (callback) => docs.forEach((doc, index) => callback(mockFirestoreDoc(doc), index)),
});

// Mock Firebase Storage
export const mockStorageRef = {
  put: jest.fn(() => Promise.resolve({
    ref: mockStorageRef,
    metadata: { size: 1000 },
  })),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
};

// Mock Firebase Auth
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInAnonymously: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

// Mock notification data
export const mockNotification = {
  id: 'test-notification-id',
  type: 'like',
  message: 'Test notification message',
  senderId: 'test-sender-id',
  senderName: 'Test Sender',
  receiverId: 'test-receiver-id',
  timestamp: { seconds: Date.now() / 1000 },
  read: false,
};

// Mock local storage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock service worker registration
export const mockServiceWorkerRegistration = {
  update: jest.fn(),
  unregister: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock window methods
export const mockWindow = {
  alert: jest.fn(),
  confirm: jest.fn(() => true),
  prompt: jest.fn(),
  open: jest.fn(),
  location: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    replace: jest.fn(),
    assign: jest.fn(),
  },
};