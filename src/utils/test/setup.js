// Test setup utilities
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock Firebase
jest.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
  storage: {
    ref: jest.fn(),
  },
}));

// Mock notification service
jest.mock('../../services/notificationService', () => ({
  initialize: jest.fn(),
  requestPermission: jest.fn(),
  sendNotificationToUser: jest.fn(),
}));

// Mock IntersectionObserver for lazy loading
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  
  observe() {
    return null;
  }
  
  disconnect() {
    return null;
  }
  
  unobserve() {
    return null;
  }
};

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
global.scrollTo = jest.fn();