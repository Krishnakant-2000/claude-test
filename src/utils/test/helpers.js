// Test helper utilities
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock user object for testing
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  isAnonymous: false,
};

export const mockGuestUser = {
  uid: 'guest-user-id',
  isAnonymous: true,
  displayName: 'Guest User',
};

// Mock Firebase auth context
export const createMockAuthContext = (user = mockUser, loading = false) => ({
  currentUser: user,
  loading,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  guestLogin: jest.fn(),
  googleLogin: jest.fn(),
  appleLogin: jest.fn(),
  isGuest: user?.isAnonymous || false,
});

// Provider wrapper for testing
export const AllTheProviders = ({ children, authValue }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider value={authValue}>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const { authValue = createMockAuthContext(), ...renderOptions } = options;
  
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} authValue={authValue} />,
    ...renderOptions,
  });
};

// Mock post object for testing
export const mockPost = {
  id: 'test-post-id',
  caption: 'Test post caption',
  mediaUrl: 'https://example.com/image.jpg',
  mediaType: 'image',
  userId: 'test-user-id',
  userName: 'Test User',
  userPhotoURL: 'https://example.com/photo.jpg',
  likes: [],
  likesCount: 0,
  comments: [],
  commentsCount: 0,
  timestamp: { seconds: Date.now() / 1000 },
};

// Mock story object for testing
export const mockStory = {
  id: 'test-story-id',
  mediaUrl: 'https://example.com/story.jpg',
  mediaType: 'image',
  userId: 'test-user-id',
  userName: 'Test User',
  userPhotoURL: 'https://example.com/photo.jpg',
  timestamp: { seconds: Date.now() / 1000 },
  views: [],
  likes: [],
};

// Wait for loading states
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));