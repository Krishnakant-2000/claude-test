import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoUpload from '../forms/VideoUpload';

describe('VideoUpload Basic Tests', () => {
  test('renders upload area correctly', () => {
    render(<VideoUpload />);
    
    expect(screen.getByText('Upload Video')).toBeInTheDocument();
    expect(screen.getByText('Choose Video')).toBeInTheDocument();
  });

  test('displays file type information', () => {
    render(<VideoUpload />);
    
    expect(screen.getByText(/Supported formats:/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum size:/)).toBeInTheDocument();
  });
});