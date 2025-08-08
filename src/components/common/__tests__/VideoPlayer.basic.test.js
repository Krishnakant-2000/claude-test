import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from '../media/VideoPlayer';

describe('VideoPlayer Basic Tests', () => {
  const mockVideoSrc = 'https://example.com/test-video.mp4';

  test('renders video element with src', () => {
    render(<VideoPlayer src={mockVideoSrc} />);
    
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', mockVideoSrc);
  });

  test('shows loading state initially', () => {
    render(<VideoPlayer src={mockVideoSrc} />);
    
    expect(screen.getByText('Loading video...')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<VideoPlayer src={mockVideoSrc} className="custom-player" />);
    
    const container = document.querySelector('.video-player');
    expect(container).toHaveClass('custom-player');
  });
});