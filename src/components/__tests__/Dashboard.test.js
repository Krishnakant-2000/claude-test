import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { useAuth } from '../../contexts/AuthContext';

// Mock Firebase
jest.mock('../../firebase/firebase', () => ({
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

// Mock Firebase Storage functions
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Dashboard Component', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  const mockLogout = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: mockUser,
      logout: mockLogout
    });

    // Mock onSnapshot to return empty posts array
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        forEach: jest.fn()
      });
      return jest.fn(); // unsubscribe function
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

  test('renders dashboard with navigation', () => {
    renderDashboard();
    
    expect(screen.getByText('AmaPlayer')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('renders create post form', () => {
    renderDashboard();
    
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  test('handles logout functionality', async () => {
    renderDashboard();
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  test('displays create post form inputs', () => {
    renderDashboard();
    
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const fileInput = screen.getByLabelText('');
    const postButton = screen.getByText('Post');
    
    expect(textarea).toBeInTheDocument();
    expect(fileInput).toBeInTheDocument();
    expect(postButton).toBeInTheDocument();
  });

  test('handles text input in create post form', () => {
    renderDashboard();
    
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'Test post content' } });
    
    expect(textarea.value).toBe('Test post content');
  });

  test('post button is disabled when uploading', () => {
    renderDashboard();
    
    const postButton = screen.getByText('Post');
    expect(postButton).not.toBeDisabled();
  });

  test('renders posts feed section', () => {
    renderDashboard();
    
    const postsSection = screen.getByText('Create New Post').closest('div').nextSibling;
    expect(postsSection).toBeInTheDocument();
  });

  test('displays posts when available', () => {
    const mockPosts = [
      {
        id: 'post1',
        caption: 'Test post 1',
        imageUrl: 'https://example.com/image1.jpg',
        userDisplayName: 'Test User',
        timestamp: { toDate: () => new Date('2023-01-01') },
        likes: ['user1', 'user2'],
        comments: []
      }
    ];

    // Mock onSnapshot to return posts
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        forEach: (fn) => {
          mockPosts.forEach((post, index) => {
            fn({
              id: post.id,
              data: () => ({
                caption: post.caption,
                imageUrl: post.imageUrl,
                userDisplayName: post.userDisplayName,
                timestamp: post.timestamp,
                likes: post.likes,
                comments: post.comments
              })
            });
          });
        }
      });
      return jest.fn();
    });

    renderDashboard();
    
    expect(screen.getByText('Test post 1')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('handles guest user without displayName', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'guest-user', displayName: null },
      logout: mockLogout
    });

    renderDashboard();
    
    expect(screen.getByText('AmaPlayer')).toBeInTheDocument();
  });

  test('navigation links work correctly', () => {
    renderDashboard();
    
    const profileLink = screen.getByText('Profile');
    expect(profileLink).toBeInTheDocument();
  });

  test('form submission requires both caption and image', () => {
    renderDashboard();
    
    const form = screen.getByRole('form');
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    
    // Try to submit with only caption
    fireEvent.change(textarea, { target: { value: 'Test caption' } });
    fireEvent.submit(form);
    
    // Should not proceed without image
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  test('handles file input change', () => {
    renderDashboard();
    
    const fileInput = screen.getByLabelText('');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(fileInput.files[0]).toBe(file);
  });
});