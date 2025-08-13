import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth');
jest.mock('../../firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  }
}));

const mockedSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockedOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;

// Test component to use auth context
const TestComponent: React.FC = () => {
  const { currentUser, isAdmin, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{currentUser?.email || 'No User'}</div>
      <div data-testid="admin">{isAdmin ? 'Admin' : 'Not Admin'}</div>
      <button onClick={() => login('admin@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', () => {
    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Don't call callback immediately to test loading state
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(screen.getByTestId('admin')).toHaveTextContent('Not Admin');
  });

  it('updates state when user signs in', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'admin@test.com',
      emailVerified: true
    };

    let authStateCallback: (user: any) => void;

    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate user sign in
    act(() => {
      authStateCallback!(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('admin@test.com');
      expect(screen.getByTestId('admin')).toHaveTextContent('Admin'); // Should be admin for admin@test.com
    });
  });

  it('identifies admin users correctly', async () => {
    const mockAdminUser = {
      uid: 'admin-uid',
      email: 'admin@amaplayer.com',
      emailVerified: true
    };

    let authStateCallback: (user: any) => void;

    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      authStateCallback!(mockAdminUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toHaveTextContent('Admin');
    });
  });

  it('identifies non-admin users correctly', async () => {
    const mockRegularUser = {
      uid: 'user-uid',
      email: 'user@test.com',
      emailVerified: true
    };

    let authStateCallback: (user: any) => void;

    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      authStateCallback!(mockRegularUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toHaveTextContent('Not Admin');
    });
  });

  it('handles login function', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'admin@test.com',
      emailVerified: true
    };

    mockedSignIn.mockResolvedValue({ user: mockUser } as any);
    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // Initially no user
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    // Click login button
    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith(expect.anything(), 'admin@test.com', 'password');
    });
  });

  it('handles login errors', async () => {
    const loginError = new Error('Invalid credentials');
    mockedSignIn.mockRejectedValue(loginError);
    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    // Spy on console.error to check error logging
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', loginError);
    });

    consoleSpy.mockRestore();
  });

  it('handles logout function', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'admin@test.com',
      emailVerified: true
    };

    let authStateCallback: (user: any) => void;

    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    mockedSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Set initial user
    act(() => {
      authStateCallback!(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('admin@test.com');
    });

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalled();
    });
  });

  it('handles logout errors', async () => {
    const logoutError = new Error('Logout failed');
    mockedSignOut.mockRejectedValue(logoutError);
    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback({ uid: 'test', email: 'test@test.com' });
      return jest.fn();
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', logoutError);
    });

    consoleSpy.mockRestore();
  });

  it('cleans up auth listener on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockedOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('handles null user state (signed out)', async () => {
    let authStateCallback: (user: any) => void;

    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      authStateCallback!(null); // User signed out
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('admin')).toHaveTextContent('Not Admin');
    });
  });

  it('handles multiple admin email formats', async () => {
    const adminEmails = [
      'admin@amaplayer.com',
      'admin@test.com',
      'moderator@amaplayer.com',
      'support@amaplayer.com'
    ];

    let authStateCallback: (user: any) => void;

    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return jest.fn();
    });

    for (const email of adminEmails) {
      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        authStateCallback!({
          uid: 'test-uid',
          email,
          emailVerified: true
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('admin')).toHaveTextContent('Admin');
      });

      rerender(<div />); // Clean up
    }
  });
});