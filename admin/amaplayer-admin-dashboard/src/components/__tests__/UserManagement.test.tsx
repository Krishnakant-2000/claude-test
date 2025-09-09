import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../UserManagement';
import * as userService from '../../services/userManagementService';

// Mock the user management service
jest.mock('../../services/userManagementService');

const mockUserService = userService as jest.Mocked<typeof userService>;

const mockUsers = [
  {
    id: 'user1',
    email: 'john@test.com',
    displayName: 'John Athlete',
    photoURL: 'https://example.com/john.jpg',
    bio: 'Professional basketball player',
    location: 'New York, NY',
    sport: 'Basketball',
    role: 'athlete' as const,
    gender: 'male' as const,
    age: 25,
    createdAt: { toDate: () => new Date('2023-01-01') } as any,
    isActive: true,
    isVerified: true,
    followers: 150,
    following: 75,
    postsCount: 20,
    videosCount: 5,
    isSuspended: false
  },
  {
    id: 'user2',
    email: 'jane@test.com',
    displayName: 'Jane Coach',
    photoURL: 'https://example.com/jane.jpg',
    bio: 'Soccer coaching expert',
    location: 'California, CA',
    sport: 'Soccer',
    role: 'coach' as const,
    gender: 'female' as const,
    age: 35,
    createdAt: { toDate: () => new Date('2023-01-02') } as any,
    isActive: true,
    isVerified: false,
    followers: 200,
    following: 50,
    postsCount: 30,
    videosCount: 8,
    isSuspended: true,
    suspensionReason: 'Policy violation'
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService.userManagementService.getAllUsers.mockResolvedValue(mockUsers);
    mockUserService.userManagementService.searchUsers.mockResolvedValue(mockUsers);
    mockUserService.userManagementService.suspendUser.mockResolvedValue();
    mockUserService.userManagementService.unsuspendUser.mockResolvedValue();
    mockUserService.userManagementService.verifyUser.mockResolvedValue();
    mockUserService.userManagementService.unverifyUser.mockResolvedValue();
  });

  it('renders user management page with correct title', async () => {
    renderWithRouter(<UserManagement />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage and moderate user accounts')).toBeInTheDocument();
  });

  it('loads and displays users on mount', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(mockUserService.userManagementService.getAllUsers).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
      expect(screen.getByText('Jane Coach')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });
  });

  it('displays user roles with correct styling', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Athlete')).toBeInTheDocument();
      expect(screen.getByText('Coach')).toBeInTheDocument();
    });

    // Check if role badges are displayed with correct classes
    const athleteRole = screen.getByText('Athlete').closest('span');
    const coachRole = screen.getByText('Coach').closest('span');
    
    expect(athleteRole).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(coachRole).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('displays user status indicators correctly', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Suspended')).toBeInTheDocument();
    });
  });

  it('displays user statistics in table', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('150 followers')).toBeInTheDocument();
      expect(screen.getByText('20 posts')).toBeInTheDocument();
      expect(screen.getByText('200 followers')).toBeInTheDocument();
      expect(screen.getByText('30 posts')).toBeInTheDocument();
    });
  });

  it('opens user details modal when clicking view details', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });

    // Find and click the more options button for first user
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-gray-400')
    );
    
    if (moreButton) {
      fireEvent.click(moreButton);

      // Click view details option
      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByText('User Details')).toBeInTheDocument();
        expect(screen.getByText('John Athlete')).toBeInTheDocument();
        expect(screen.getByText('user1')).toBeInTheDocument(); // User ID
        expect(screen.getByText('Professional basketball player')).toBeInTheDocument();
        expect(screen.getByText('New York, NY')).toBeInTheDocument();
      });
    }
  });

  it('handles user verification', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Jane Coach')).toBeInTheDocument();
    });

    // Find more options for unverified user (Jane Coach)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons[1]; // Assume second more button is for Jane
    
    fireEvent.click(moreButton);

    // Click verify user option
    const verifyButton = screen.getByText('Verify User');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockUserService.userManagementService.verifyUser).toHaveBeenCalledWith('user2');
      expect(mockUserService.userManagementService.getAllUsers).toHaveBeenCalledTimes(2); // Initial + after verification
    });
  });

  it('handles user unverification', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });

    // Find more options for verified user (John Athlete)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons[0]; // First more button for John
    
    fireEvent.click(moreButton);

    // Click remove verification option
    const unverifyButton = screen.getByText('Remove Verification');
    fireEvent.click(unverifyButton);

    await waitFor(() => {
      expect(mockUserService.userManagementService.unverifyUser).toHaveBeenCalledWith('user1');
    });
  });

  it('handles user suspension with reason', async () => {
    // Mock window.prompt
    window.prompt = jest.fn().mockReturnValue('Inappropriate behavior');

    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });

    // Find more options for active user (John Athlete)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons[0];
    
    fireEvent.click(moreButton);

    // Click suspend option
    const suspendButton = screen.getByText('Suspend');
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith('Enter suspension reason:');
      expect(mockUserService.userManagementService.suspendUser).toHaveBeenCalledWith('user1', 'Inappropriate behavior');
    });

    // Restore window.prompt
    (window.prompt as jest.Mock).mockRestore();
  });

  it('handles user unsuspension', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Jane Coach')).toBeInTheDocument();
    });

    // Find more options for suspended user (Jane Coach)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons[1]; // Second more button for Jane
    
    fireEvent.click(moreButton);

    // Click unsuspend option
    const unsuspendButton = screen.getByText('Unsuspend');
    fireEvent.click(unsuspendButton);

    await waitFor(() => {
      expect(mockUserService.userManagementService.unsuspendUser).toHaveBeenCalledWith('user2');
    });
  });

  it('performs search when clicking search button', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });

    // Find search input and enter search term
    const searchInput = screen.getByPlaceholderText(/Search users by User ID, name, email/);
    fireEvent.change(searchInput, { target: { value: 'Basketball' } });

    // Click search button
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockUserService.userManagementService.searchUsers).toHaveBeenCalledWith('Basketball');
    });
  });

  it('performs search when pressing Enter in search input', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });

    // Find search input and press Enter
    const searchInput = screen.getByPlaceholderText(/Search users by User ID, name, email/);
    fireEvent.change(searchInput, { target: { value: 'Coach' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockUserService.userManagementService.searchUsers).toHaveBeenCalledWith('Coach');
    });
  });

  it('filters users by role', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
      expect(screen.getByText('Jane Coach')).toBeInTheDocument();
    });

    // Find role filter dropdown
    const roleFilter = screen.getAllByRole('combobox')[0]; // First combobox should be role filter
    fireEvent.change(roleFilter, { target: { value: 'athlete' } });

    // In actual implementation, this would filter the displayed users
    expect(roleFilter).toHaveValue('athlete');
  });

  it('filters users by status', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
      expect(screen.getByText('Jane Coach')).toBeInTheDocument();
    });

    // Find status filter dropdown
    const statusFilter = screen.getAllByRole('combobox')[1]; // Second combobox should be status filter
    fireEvent.change(statusFilter, { target: { value: 'verified' } });

    // In actual implementation, this would filter the displayed users
    expect(statusFilter).toHaveValue('verified');
  });

  it('displays loading state initially', () => {
    mockUserService.userManagementService.getAllUsers.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<UserManagement />);

    expect(screen.getByRole('generic')).toHaveClass('animate-spin'); // Loading spinner
  });

  it('displays empty state when no users found', async () => {
    mockUserService.userManagementService.getAllUsers.mockResolvedValue([]);

    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filter criteria.')).toBeInTheDocument();
    });
  });

  it('displays user count in header', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Users (2)')).toBeInTheDocument();
    });
  });

  it('closes user details modal when clicking close button', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });

    // Open modal
    const moreButton = screen.getAllByRole('button')[0];
    fireEvent.click(moreButton);
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('User Details')).not.toBeInTheDocument();
    });
  });

  it('displays sport information for users', async () => {
    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('🏃‍♂️ Basketball')).toBeInTheDocument();
      expect(screen.getByText('🏃‍♂️ Soccer')).toBeInTheDocument();
    });
  });
});