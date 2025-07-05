import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';

// Mock Firebase
jest.mock('../../../firebase/firebase', () => ({
  db: {},
  storage: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn()
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock video service
jest.mock('../../../firebase/videoService', () => ({
  uploadVideoFile: jest.fn(),
  generateVideoMetadata: jest.fn(),
  VIDEO_PATHS: {
    POSTS: 'post-videos'
  }
}));

// Mock components
jest.mock('../../../components/common/VideoUpload', () => {
  return function MockVideoUpload({ onVideoSelect, onVideoRemove }) {
    return (
      <div data-testid="video-upload">
        <button onClick={() => onVideoSelect(new File(['video'], 'test.mp4', { type: 'video/mp4' }))}>
          Select Video
        </button>
        <button onClick={onVideoRemove}>Remove Video</button>
      </div>
    );
  };
});

jest.mock('../../../components/common/VideoPlayer', () => {
  return function MockVideoPlayer({ src }) {
    return <div data-testid="video-player" data-src={src}>Video Player</div>;
  };
});

jest.mock('../../../components/layout/FooterNav', () => {
  return function MockFooterNav() {
    return <div data-testid="footer-nav">Footer Navigation</div>;
  };
});

jest.mock('../../../components/common/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="theme-toggle">Theme Toggle</button>;
  };
});

jest.mock('../../../components/common/LanguageSelector', () => {
  return function MockLanguageSelector() {
    return <button data-testid="language-selector">Language Selector</button>;
  };
});

// Mock sample posts
jest.mock('../../../data/samplePosts', () => ({
  samplePosts: [
    {
      id: 'sample-1',
      caption: 'Sample post',
      imageUrl: 'https://example.com/image.jpg',
      userDisplayName: 'Sample User',
      timestamp: new Date(),
      likes: [],
      comments: []
    }
  ]
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('AddPost Functionality', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  const mockAuthContext = {
    currentUser: mockUser,
    logout: jest.fn()
  };

  const mockLanguageContext = {
    t: (key) => {
      const translations = {
        create_post: 'Create New Post',
        whats_mind: "What's on your mind?",
        post: 'Post',
        posting: 'Posting...',
        logout: 'Logout',
        like: 'Like',
        comment: 'Comment'
      };
      return translations[key] || key;
    },
    currentLanguage: 'en',
    changeLanguage: jest.fn()
  };

  const renderWithProviders = (component) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <LanguageContext.Provider value={mockLanguageContext}>
            {component}
          </LanguageContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock onSnapshot to return sample posts
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        forEach: (fn) => {
          fn({
            id: 'test-post-1',
            data: () => ({
              caption: 'Test post',
              imageUrl: 'https://example.com/test.jpg',
              userDisplayName: 'Test User',
              timestamp: { toDate: () => new Date() },
              likes: [],
              comments: []
            })
          });
        }
      });
      return () => {}; // unsubscribe function
    });
  });

  test('renders post creation form', () => {
    renderWithProviders(<Home />);
    
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  test('displays media type toggle buttons', () => {
    renderWithProviders(<Home />);
    
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  test('switches between image and video upload modes', async () => {
    renderWithProviders(<Home />);
    
    // Initially should show image upload
    expect(screen.getByRole('button', { name: /Image/i })).toHaveClass('active');
    
    // Click video button
    fireEvent.click(screen.getByText('Video'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Video/i })).toHaveClass('active');
      expect(screen.getByTestId('video-upload')).toBeInTheDocument();
    });
  });

  test('handles image file upload', async () => {
    const { addDoc } = require('firebase/firestore');
    const { uploadBytes, getDownloadURL } = require('firebase/storage');
    
    addDoc.mockResolvedValue({ id: 'new-post-id' });
    uploadBytes.mockResolvedValue({});
    getDownloadURL.mockResolvedValue('https://example.com/uploaded-image.jpg');
    
    renderWithProviders(<Home />);
    
    // Fill caption
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Test post caption' } });
    
    // Upload image
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['image content'], 'test-image.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit form
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          caption: 'Test post caption',
          mediaUrl: 'https://example.com/uploaded-image.jpg',
          mediaType: 'image',
          userId: 'test-user-id',
          userDisplayName: 'Test User'
        })
      );
    });
  });

  test('handles video file upload', async () => {
    const { addDoc } = require('firebase/firestore');
    const { uploadVideoFile, generateVideoMetadata } = require('../../../firebase/videoService');
    
    addDoc.mockResolvedValue({ id: 'new-video-post-id' });
    uploadVideoFile.mockResolvedValue('https://example.com/uploaded-video.mp4');
    generateVideoMetadata.mockResolvedValue({
      type: 'video',
      duration: 120,
      durationFormatted: '2:00'
    });
    
    renderWithProviders(<Home />);
    
    // Switch to video mode
    fireEvent.click(screen.getByText('Video'));
    
    await waitFor(() => {
      expect(screen.getByTestId('video-upload')).toBeInTheDocument();
    });
    
    // Fill caption
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Test video post' } });
    
    // Select video
    fireEvent.click(screen.getByText('Select Video'));
    
    // Submit form
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(uploadVideoFile).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          caption: 'Test video post',
          mediaType: 'video',
          userId: 'test-user-id',
          userDisplayName: 'Test User'
        })
      );
    });
  });

  test('shows upload progress for video files', async () => {
    const { uploadVideoFile } = require('../../../firebase/videoService');
    
    // Mock uploadVideoFile to call progress callback
    uploadVideoFile.mockImplementation((file, userId, path, onProgress) => {
      // Simulate progress updates
      setTimeout(() => onProgress(25), 100);
      setTimeout(() => onProgress(50), 200);
      setTimeout(() => onProgress(75), 300);
      setTimeout(() => onProgress(100), 400);
      return Promise.resolve('https://example.com/video.mp4');
    });
    
    renderWithProviders(<Home />);
    
    // Switch to video mode
    fireEvent.click(screen.getByText('Video'));
    
    // Fill caption and select video
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Video with progress' } });
    fireEvent.click(screen.getByText('Select Video'));
    
    // Submit form
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    // Should show progress
    await waitFor(() => {
      expect(screen.getByText(/% uploaded/)).toBeInTheDocument();
    });
  });

  test('prevents submission without caption', () => {
    renderWithProviders(<Home />);
    
    // Try to submit without caption
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    // Form should not be submitted
    const { addDoc } = require('firebase/firestore');
    expect(addDoc).not.toHaveBeenCalled();
  });

  test('prevents submission without media file', () => {
    renderWithProviders(<Home />);
    
    // Fill caption but no file
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Caption only' } });
    
    // Try to submit
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    // Form should not be submitted
    const { addDoc } = require('firebase/firestore');
    expect(addDoc).not.toHaveBeenCalled();
  });

  test('disables submit button during upload', async () => {
    const { addDoc } = require('firebase/firestore');
    const { uploadBytes, getDownloadURL } = require('firebase/storage');
    
    // Mock slow upload
    uploadBytes.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    getDownloadURL.mockResolvedValue('https://example.com/image.jpg');
    addDoc.mockResolvedValue({ id: 'post-id' });
    
    renderWithProviders(<Home />);
    
    // Fill form
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Test post' } });
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    // Button should be disabled and show "Posting..."
    await waitFor(() => {
      expect(screen.getByText('Posting...')).toBeInTheDocument();
      expect(screen.getByText('Posting...')).toBeDisabled();
    });
  });

  test('resets form after successful submission', async () => {
    const { addDoc } = require('firebase/firestore');
    const { uploadBytes, getDownloadURL } = require('firebase/storage');
    
    addDoc.mockResolvedValue({ id: 'new-post' });
    uploadBytes.mockResolvedValue({});
    getDownloadURL.mockResolvedValue('https://example.com/image.jpg');
    
    renderWithProviders(<Home />);
    
    // Fill and submit form
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Test post' } });
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    // Form should reset after submission
    await waitFor(() => {
      expect(captionInput.value).toBe('');
      expect(fileInput.value).toBe('');
    });
  });

  test('handles upload errors gracefully', async () => {
    const { uploadBytes } = require('firebase/storage');
    
    // Mock upload failure
    uploadBytes.mockRejectedValue(new Error('Upload failed'));
    
    // Mock window.alert
    window.alert = jest.fn();
    
    renderWithProviders(<Home />);
    
    // Fill and submit form
    const captionInput = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(captionInput, { target: { value: 'Test post' } });
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);
    
    // Should show error alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create post. Please try again.');
    });
  });

  test('displays posts feed correctly', () => {
    renderWithProviders(<Home />);
    
    // Should show sample posts
    expect(screen.getByText('Sample post')).toBeInTheDocument();
    expect(screen.getByText('Sample User')).toBeInTheDocument();
  });

  test('handles video posts in feed', async () => {
    const { onSnapshot } = require('firebase/firestore');
    
    // Mock video post
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        forEach: (fn) => {
          fn({
            id: 'video-post-1',
            data: () => ({
              caption: 'Video post',
              mediaUrl: 'https://example.com/video.mp4',
              mediaType: 'video',
              userDisplayName: 'Video User',
              timestamp: { toDate: () => new Date() },
              likes: [],
              comments: []
            })
          });
        }
      });
      return () => {};
    });
    
    renderWithProviders(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
      expect(screen.getByText('Video post')).toBeInTheDocument();
    });
  });
});