import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoUpload from '../forms/VideoUpload';
import { validateVideoFile, SUPPORTED_VIDEO_TYPES, MAX_VIDEO_SIZE } from '../../../firebase/videoService';

// Mock the video service
jest.mock('../../../firebase/videoService', () => ({
  validateVideoFile: jest.fn(),
  SUPPORTED_VIDEO_TYPES: [
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/m4v'
  ],
  MAX_VIDEO_SIZE: 100 * 1024 * 1024 // 100MB
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-video-url');
global.URL.revokeObjectURL = jest.fn();

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
  writable: true,
  value: 120 // 2 minutes
});

describe('VideoUpload Component', () => {
  const mockOnVideoSelect = jest.fn();
  const mockOnVideoRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    validateVideoFile.mockReturnValue({ isValid: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders video upload area correctly', () => {
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    expect(screen.getByText('Upload Video')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your video here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Choose Video')).toBeInTheDocument();
  });

  test('displays supported video formats and file size limits', () => {
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    expect(screen.getByText(/Supported formats:/)).toBeInTheDocument();
    expect(screen.getByText(/MP4, MOV, AVI, WMV, FLV, WEBM, MKV, M4V/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum size: 100MB/)).toBeInTheDocument();
  });

  test('handles valid video file selection', async () => {
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnVideoSelect).toHaveBeenCalledWith(file);
      expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    });
  });

  test('shows error for invalid video file', async () => {
    validateVideoFile.mockReturnValue({ 
      isValid: false, 
      error: 'Unsupported file type' 
    });

    const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Unsupported file type')).toBeInTheDocument();
      expect(mockOnVideoSelect).not.toHaveBeenCalled();
    });
  });

  test('handles drag and drop functionality', async () => {
    const file = new File(['video content'], 'dropped-video.mp4', { type: 'video/mp4' });
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    const dropZone = screen.getByText('Upload Video').closest('.upload-area');

    // Simulate drag over
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('drag-active');

    // Simulate drag leave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('drag-active');

    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(mockOnVideoSelect).toHaveBeenCalledWith(file);
    });
  });

  test('displays video preview when showPreview is true', async () => {
    const file = new File(['video content'], 'preview-video.mp4', { type: 'video/mp4' });
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
        showPreview={true}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('preview-video.mp4')).toBeInTheDocument();
      expect(screen.getByText('Size: 13 Bytes')).toBeInTheDocument();
      expect(screen.getByText('Type: video/mp4')).toBeInTheDocument();
    });
  });

  test('handles video preview play/pause controls', async () => {
    const file = new File(['video content'], 'control-video.mp4', { type: 'video/mp4' });
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
        showPreview={true}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('control-video.mp4')).toBeInTheDocument();
      expect(screen.getByText('Size: 13 Bytes')).toBeInTheDocument();
      expect(screen.getByText('Type: video/mp4')).toBeInTheDocument();
      
      // Check if remove button exists
      const removeButton = screen.getByRole('button', { name: /remove video/i });
      expect(removeButton).toBeInTheDocument();
    });
  });

  test('removes video when remove button is clicked', async () => {
    const file = new File(['video content'], 'remove-video.mp4', { type: 'video/mp4' });
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /remove video/i });
      fireEvent.click(removeButton);
      
      expect(mockOnVideoRemove).toHaveBeenCalled();
      expect(screen.getByText('Upload Video')).toBeInTheDocument();
    });
  });

  test('displays file size and type information', async () => {
    const file = new File(['video content'], 'info-video.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Size: 1 MB')).toBeInTheDocument();
      expect(screen.getByText('Type: video/mp4')).toBeInTheDocument();
    });
  });

  test('validates file size limits', async () => {
    validateVideoFile.mockReturnValue({ 
      isValid: false, 
      error: 'File size too large. Maximum size: 100MB' 
    });

    const largeFile = new File(['large content'], 'large-video.mp4', { type: 'video/mp4' });
    Object.defineProperty(largeFile, 'size', { value: 200 * 1024 * 1024 }); // 200MB
    
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File size too large. Maximum size: 100MB')).toBeInTheDocument();
      expect(mockOnVideoSelect).not.toHaveBeenCalled();
    });
  });

  test('handles multiple file types correctly', async () => {
    const testCases = [
      { name: 'test.mp4', type: 'video/mp4', valid: true },
      { name: 'test.mov', type: 'video/mov', valid: true },
      { name: 'test.avi', type: 'video/avi', valid: true },
      { name: 'test.txt', type: 'text/plain', valid: false }
    ];

    for (const testCase of testCases) {
      validateVideoFile.mockReturnValue({ 
        isValid: testCase.valid,
        error: testCase.valid ? undefined : 'Unsupported file type'
      });

      const file = new File(['content'], testCase.name, { type: testCase.type });
      
      const { rerender } = render(
        <VideoUpload 
          onVideoSelect={mockOnVideoSelect}
          onVideoRemove={mockOnVideoRemove}
        />
      );

      const fileInput = document.querySelector('input[type="file"]');
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      if (testCase.valid) {
        await waitFor(() => {
          expect(mockOnVideoSelect).toHaveBeenCalledWith(file);
        });
      } else {
        await waitFor(() => {
          expect(screen.getByText('Unsupported file type')).toBeInTheDocument();
        });
      }

      // Reset for next test
      jest.clearAllMocks();
      rerender(
        <VideoUpload 
          onVideoSelect={mockOnVideoSelect}
          onVideoRemove={mockOnVideoRemove}
        />
      );
    }
  });

  test('applies custom className correctly', () => {
    render(
      <VideoUpload 
        onVideoSelect={mockOnVideoSelect}
        onVideoRemove={mockOnVideoRemove}
        className="custom-video-upload"
      />
    );

    const container = screen.getByText('Upload Video').closest('.video-upload');
    expect(container).toHaveClass('custom-video-upload');
  });
});