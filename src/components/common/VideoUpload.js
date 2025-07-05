import React, { useState, useRef } from 'react';
import { Upload, Video, X, Play, Pause } from 'lucide-react';
// import { useLanguage } from '../../contexts/LanguageContext';
import { validateVideoFile, SUPPORTED_VIDEO_TYPES, MAX_VIDEO_SIZE } from '../../firebase/videoService';
import './VideoUpload.css';

export default function VideoUpload({ 
  onVideoSelect, 
  onVideoRemove, 
  maxSizeMB = 100,
  acceptedTypes = SUPPORTED_VIDEO_TYPES,
  showPreview = true,
  className = ''
}) {
  // const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    setError('');
    
    console.log('VideoUpload: File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Validate video file
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      console.error('VideoUpload: Validation failed:', validation.error);
      setError(validation.error);
      return;
    }

    console.log('VideoUpload: Validation passed');

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      console.log('VideoUpload: Preview URL created:', previewUrl);
      
      setVideoPreview(previewUrl);
      setSelectedVideo(file);
      
      // Call parent callback
      if (onVideoSelect) {
        console.log('VideoUpload: Calling onVideoSelect callback');
        onVideoSelect(file);
      }
    } catch (error) {
      console.error('VideoUpload: Error creating preview:', error);
      setError('Failed to create video preview. Please try again.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setSelectedVideo(null);
    setIsPlaying(false);
    setError('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onVideoRemove) {
      onVideoRemove();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`video-upload ${className}`}>
      {!selectedVideo ? (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <div className="upload-icon">
              <Video size={48} />
            </div>
            <h3>Upload Video</h3>
            <p>Drag and drop your video here, or click to browse</p>
            <div className="upload-info">
              <p>Supported formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
              <p>Maximum size: {Math.floor(MAX_VIDEO_SIZE / (1024 * 1024))}MB</p>
            </div>
            <button type="button" className="upload-btn">
              <Upload size={20} />
              Choose Video
            </button>
          </div>
        </div>
      ) : (
        <div className="video-preview-container">
          {showPreview && videoPreview && (
            <div className="video-preview">
              <video
                ref={videoRef}
                src={videoPreview}
                onEnded={handleVideoEnded}
                controls={false}
                className="preview-video"
              />
              <div className="video-controls">
                <button
                  type="button"
                  className="play-pause-btn"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>
            </div>
          )}
          
          <div className="video-info">
            <div className="video-details">
              <h4>{selectedVideo.name}</h4>
              <p>Size: {formatFileSize(selectedVideo.size)}</p>
              <p>Type: {selectedVideo.type}</p>
            </div>
            <button
              type="button"
              className="remove-btn"
              onClick={removeVideo}
              title="Remove video"
              aria-label="Remove video"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}