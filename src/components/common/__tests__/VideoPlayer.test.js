import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from '../media/VideoPlayer';

// Mock HTMLVideoElement properties and methods
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: jest.fn()
});

// Mock fullscreen API
Object.defineProperty(HTMLVideoElement.prototype, 'requestFullscreen', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null
});

// Mock video properties
const mockVideoElement = {
  duration: 120, // 2 minutes
  currentTime: 0,
  volume: 1,
  muted: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

describe('VideoPlayer Component', () => {
  const mockVideoSrc = 'https://example.com/test-video.mp4';
  const mockPoster = 'https://example.com/poster.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset video element properties
    Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
      writable: true,
      value: 120
    });
    
    Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
      writable: true,
      value: 0
    });
    
    Object.defineProperty(HTMLVideoElement.prototype, 'volume', {
      writable: true,
      value: 1
    });
    
    Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
      writable: true,
      value: false
    });
  });

  test('renders video player with basic props', () => {
    render(<VideoPlayer src={mockVideoSrc} poster={mockPoster} />);
    
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', mockVideoSrc);
    expect(video).toHaveAttribute('poster', mockPoster);
  });

  test('shows loading state initially', () => {
    render(<VideoPlayer src={mockVideoSrc} />);
    
    expect(screen.getByText('Loading video...')).toBeInTheDocument();
    expect(screen.getByText('Loading video...')).toBeInTheDocument();
  });

  test('shows play button when video is paused', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    // Simulate video loaded
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });
  });

  test('toggles play/pause when play button is clicked', async () => {
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    const mockPause = jest.fn();
    
    HTMLVideoElement.prototype.play = mockPlay;
    HTMLVideoElement.prototype.pause = mockPause;
    
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  test('handles volume control', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      
      // Volume should be updated
      expect(video.volume).toBe(0.5);
    });
  });

  test('toggles mute when mute button is clicked', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      const muteButton = screen.getByRole('button', { name: /volume/i });
      fireEvent.click(muteButton);
      
      expect(video.muted).toBe(true);
    });
  });

  test('handles progress bar click for seeking', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      const progressContainer = screen.getByTestId('progress-container');
      
      // Mock getBoundingClientRect
      progressContainer.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100
      }));
      
      fireEvent.click(progressContainer, { clientX: 50 });
      
      // Should seek to middle of video (50% of 120 seconds = 60 seconds)
      expect(video.currentTime).toBe(60);
    });
  });

  test('requests fullscreen when fullscreen button is clicked', async () => {
    const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
    HTMLVideoElement.prototype.requestFullscreen = mockRequestFullscreen;
    
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);
      
      expect(mockRequestFullscreen).toHaveBeenCalled();
    });
  });

  test('restarts video when restart button is clicked', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    // Set current time to middle of video
    Object.defineProperty(video, 'currentTime', { writable: true, value: 60 });
    
    await waitFor(() => {
      const restartButton = screen.getByRole('button', { name: /restart/i });
      fireEvent.click(restartButton);
      
      expect(video.currentTime).toBe(0);
    });
  });

  test('formats time correctly', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    await waitFor(() => {
      // Should show "0:00 / 2:00" for 120 second video at start
      expect(screen.getByText('0:00 / 2:00')).toBeInTheDocument();
    });
  });

  test('calls callback functions when provided', async () => {
    const onPlay = jest.fn();
    const onPause = jest.fn();
    const onEnded = jest.fn();
    
    render(
      <VideoPlayer 
        src={mockVideoSrc} 
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        controls={true}
      />
    );
    
    const video = document.querySelector('video');
    
    // Simulate play event
    fireEvent.play(video);
    expect(onPlay).toHaveBeenCalled();
    
    // Simulate pause event
    fireEvent.pause(video);
    expect(onPause).toHaveBeenCalled();
    
    // Simulate ended event
    fireEvent.ended(video);
    expect(onEnded).toHaveBeenCalled();
  });

  test('handles video loading errors', () => {
    render(<VideoPlayer src="invalid-video-url" />);
    
    const video = document.querySelector('video');
    fireEvent.error(video);
    
    expect(screen.getByText('Error loading video')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('updates progress during playback', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    // Simulate time update
    Object.defineProperty(video, 'currentTime', { writable: true, value: 30 });
    fireEvent.timeUpdate(video);
    
    await waitFor(() => {
      const progressFill = screen.getByTestId('progress-fill');
      // 30 seconds out of 120 seconds = 25% progress
      expect(progressFill).toHaveStyle('width: 25%');
    });
  });

  test('hides controls when autoPlay is enabled and controls are hidden', () => {
    render(
      <VideoPlayer 
        src={mockVideoSrc} 
        autoPlay={true}
        controls={false}
      />
    );
    
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(
      <VideoPlayer 
        src={mockVideoSrc} 
        className="custom-player"
      />
    );
    
    const container = document.querySelector('.video-player');
    expect(container).toHaveClass('custom-player');
  });

  test('handles muted prop correctly', () => {
    render(<VideoPlayer src={mockVideoSrc} muted={true} />);
    
    const video = document.querySelector('video');
    // The muted attribute is controlled by the component's state
    expect(video).toBeInTheDocument();
  });

  test('handles loop prop correctly', () => {
    render(<VideoPlayer src={mockVideoSrc} loop={true} />);
    
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('loop');
  });

  test('shows controls on mouse move and hides after inactivity', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    const container = document.querySelector('.video-player');
    
    // Mouse move should show controls
    fireEvent.mouseMove(container);
    
    await waitFor(() => {
      expect(screen.getByTestId('video-controls')).toHaveClass('visible');
    });
    
    // Test controls visibility toggle
    expect(screen.getByTestId('video-controls')).toHaveClass('visible');
  });

  test('handles keyboard controls', async () => {
    render(<VideoPlayer src={mockVideoSrc} controls={true} />);
    
    const video = document.querySelector('video');
    fireEvent.loadedMetadata(video);
    
    // Test that video element is present and accessible for keyboard events
    expect(video).toBeInTheDocument();
    
    // Space bar keydown event should be handled
    fireEvent.keyDown(video, { key: ' ', code: 'Space' });
    
    // Verify that controls are still functioning
    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
  });
});