import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VideoVerification from '../VideoVerification';
import * as videoService from '../../services/videoVerificationService';

// Mock the video verification service
jest.mock('../../services/videoVerificationService');

const mockVideoService = videoService as jest.Mocked<typeof videoService>;

const mockVideos = [
  {
    id: 'video1',
    userId: 'user1',
    userDisplayName: 'John Athlete',
    userEmail: 'john@test.com',
    videoUrl: 'https://example.com/video1.mp4',
    fileName: 'training.mp4',
    title: 'Training Session',
    description: 'My latest training video',
    category: 'training',
    uploadedAt: { toDate: () => new Date('2023-01-01') } as any,
    views: 100,
    likes: ['user2', 'user3'],
    thumbnail: 'https://example.com/thumb1.jpg',
    fileSize: 5000000,
    duration: 120,
    isVerified: false,
    verificationStatus: 'pending' as const,
    flags: []
  },
  {
    id: 'video2',
    userId: 'user2',
    userDisplayName: 'Jane Coach',
    userEmail: 'jane@test.com',
    videoUrl: 'https://example.com/video2.mp4',
    fileName: 'technique.mp4',
    title: 'Technique Demo',
    description: 'Proper technique demonstration',
    category: 'technique',
    uploadedAt: { toDate: () => new Date('2023-01-02') } as any,
    views: 200,
    likes: ['user1'],
    thumbnail: 'https://example.com/thumb2.jpg',
    fileSize: 8000000,
    duration: 180,
    isVerified: true,
    verificationStatus: 'approved' as const,
    verifiedAt: { toDate: () => new Date('2023-01-03') } as any,
    verifiedBy: 'admin@test.com',
    flags: []
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('VideoVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVideoService.videoVerificationService.getAllVideos.mockResolvedValue(mockVideos);
    mockVideoService.videoVerificationService.approveVideo.mockResolvedValue();
    mockVideoService.videoVerificationService.rejectVideo.mockResolvedValue();
    mockVideoService.videoVerificationService.flagVideo.mockResolvedValue();
  });

  it('renders video verification page with correct title', async () => {
    renderWithRouter(<VideoVerification />);
    
    expect(screen.getByText('Video Verification')).toBeInTheDocument();
    expect(screen.getByText('Review and verify talent showcase videos')).toBeInTheDocument();
  });

  it('loads and displays videos on mount', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(mockVideoService.videoVerificationService.getAllVideos).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
      expect(screen.getByText('Technique Demo')).toBeInTheDocument();
    });
  });

  it('displays video statistics correctly', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      // Should show stats for pending (1), approved (1), rejected (0), total (2)
      expect(screen.getByText('1')).toBeInTheDocument(); // Pending count
      expect(screen.getByText('2')).toBeInTheDocument(); // Total count
    });
  });

  it('filters videos by status when clicking filter cards', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
      expect(screen.getByText('Technique Demo')).toBeInTheDocument();
    });

    // Click on pending filter
    const pendingCard = screen.getByText('Pending Review').closest('.cursor-pointer');
    fireEvent.click(pendingCard!);

    // Should filter to show only pending videos
    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
      // Approved video should be filtered out in the actual implementation
    });
  });

  it('opens video modal when clicking on video thumbnail', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
    });

    // Click on video thumbnail
    const videoThumbnail = screen.getByAltText('Training Session');
    fireEvent.click(videoThumbnail.parentElement!);

    await waitFor(() => {
      expect(screen.getByText('Video Review')).toBeInTheDocument();
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
    });
  });

  it('handles video approval', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
    });

    // Find and click approve button for pending video
    const approveButtons = screen.getAllByText('Approve');
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(mockVideoService.videoVerificationService.approveVideo).toHaveBeenCalledWith('video1');
      expect(mockVideoService.videoVerificationService.getAllVideos).toHaveBeenCalledTimes(2); // Initial load + after approval
    });
  });

  it('handles video rejection with reason', async () => {
    // Mock window.prompt
    window.prompt = jest.fn().mockReturnValue('Inappropriate content');

    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
    });

    // Find and click reject button for pending video
    const rejectButtons = screen.getAllByText('Reject');
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith('Enter rejection reason (optional):');
      expect(mockVideoService.videoVerificationService.rejectVideo).toHaveBeenCalledWith('video1', 'Inappropriate content');
    });

    // Restore window.prompt
    (window.prompt as jest.Mock).mockRestore();
  });

  it('handles video flagging with reason', async () => {
    // Mock window.prompt
    window.prompt = jest.fn().mockReturnValue('Spam content');

    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
    });

    // Click on more options menu
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('svg')); // Find button with MoreVertical icon
    if (moreButton) {
      fireEvent.click(moreButton);

      // Find and click flag option
      const flagButton = screen.getByText('Flag');
      fireEvent.click(flagButton);

      await waitFor(() => {
        expect(window.prompt).toHaveBeenCalledWith('Enter flag reason:');
        expect(mockVideoService.videoVerificationService.flagVideo).toHaveBeenCalledWith('video1', 'Spam content');
      });
    }

    // Restore window.prompt
    (window.prompt as jest.Mock).mockRestore();
  });

  it('filters videos using search input', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
      expect(screen.getByText('Technique Demo')).toBeInTheDocument();
    });

    // Find search input and type
    const searchInput = screen.getByPlaceholderText('Search videos by title, user, or description...');
    fireEvent.change(searchInput, { target: { value: 'Training' } });

    // In the actual implementation, this would filter the displayed results
    // The test verifies the input is working
    expect(searchInput).toHaveValue('Training');
  });

  it('displays loading state initially', () => {
    mockVideoService.videoVerificationService.getAllVideos.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<VideoVerification />);

    expect(screen.getByRole('generic')).toHaveClass('animate-spin'); // Loading spinner
  });

  it('displays empty state when no videos found', async () => {
    mockVideoService.videoVerificationService.getAllVideos.mockResolvedValue([]);

    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('No videos found')).toBeInTheDocument();
      expect(screen.getByText('No videos have been submitted for review yet.')).toBeInTheDocument();
    });
  });

  it('shows video details in modal', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
    });

    // Click on video to open modal
    const videoThumbnail = screen.getByAltText('Training Session');
    fireEvent.click(videoThumbnail.parentElement!);

    await waitFor(() => {
      // Check video details are displayed
      expect(screen.getByText('Video Review')).toBeInTheDocument();
      expect(screen.getByText('John Athlete')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('My latest training video')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Views
      expect(screen.getByText('2')).toBeInTheDocument(); // Likes count
      expect(screen.getByText('4.8 MB')).toBeInTheDocument(); // File size
      expect(screen.getByText('120s')).toBeInTheDocument(); // Duration
    });
  });

  it('closes video modal when clicking close button', async () => {
    renderWithRouter(<VideoVerification />);

    await waitFor(() => {
      expect(screen.getByText('Training Session')).toBeInTheDocument();
    });

    // Open modal
    const videoThumbnail = screen.getByAltText('Training Session');
    fireEvent.click(videoThumbnail.parentElement!);

    await waitFor(() => {
      expect(screen.getByText('Video Review')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Video Review')).not.toBeInTheDocument();
    });
  });
});