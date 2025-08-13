// Offline Post Creator Component - Phase 3 implementation
// UI component for creating posts while offline with automatic queuing

import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createOfflinePost } from '../../utils/caching/offlinePostManager';
import NetworkStatus from './NetworkStatus';
import './OfflinePostCreator.css';

const OfflinePostCreator = ({ onPostCreated, onCancel, showOfflineIndicator = true }) => {
  const { currentUser: user } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef(null);

  // Handle media file selection
  const handleMediaSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB for offline storage)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB for offline posts');
      return;
    }

    setMediaFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview({
        url: e.target.result,
        type: file.type.startsWith('video/') ? 'video' : 'image'
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove media
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create offline post
  const handleCreatePost = async () => {
    if (!caption.trim() && !mediaFile) {
      setError('Please add a caption or select media');
      return;
    }

    if (!user) {
      setError('You must be logged in to create posts');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Handle media file for offline storage
      if (mediaFile) {
        // For offline posts, we store the file as base64 in IndexedDB
        const base64Data = await convertFileToBase64(mediaFile);
        mediaUrl = base64Data;
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      }

      const postData = {
        caption: caption.trim(),
        mediaUrl,
        mediaType,
        isOffline: true,
        originalFileName: mediaFile?.name || null,
        originalFileSize: mediaFile?.size || null
      };

      // Create offline post
      const offlinePost = await createOfflinePost(postData, user.uid);

      setShowConfirmation(true);
      
      // Clear form
      setCaption('');
      setMediaFile(null);
      setMediaPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(offlinePost);
      }

      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to create offline post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Convert file to base64 for IndexedDB storage
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Check if we can create posts offline
  const canCreateOffline = () => {
    return 'indexedDB' in window && user;
  };

  if (!canCreateOffline()) {
    return (
      <div className="offline-post-creator offline-unavailable">
        <div className="unavailable-message">
          <h3>Offline posting not available</h3>
          <p>Your browser doesn't support offline features or you're not logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offline-post-creator">
      {showOfflineIndicator && <NetworkStatus />}
      
      <div className="creator-header">
        <h3>
          {navigator.onLine ? '📝 Create Post' : '📱 Create Post (Offline)'}
        </h3>
        {!navigator.onLine && (
          <div className="offline-notice">
            <span className="offline-indicator">🔄 Will sync when online</span>
          </div>
        )}
      </div>

      {showConfirmation && (
        <div className="confirmation-banner">
          <div className="confirmation-content">
            <span className="success-icon">✅</span>
            <span>
              {navigator.onLine 
                ? 'Post created and queued for upload!' 
                : 'Post saved! It will sync when you\'re back online.'
              }
            </span>
          </div>
        </div>
      )}

      <div className="creator-body">
        {/* Caption Input */}
        <div className="caption-section">
          <textarea
            className="caption-input"
            placeholder={navigator.onLine 
              ? "What's happening in sports?" 
              : "What's happening? (will post when online)"
            }
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={500}
            disabled={isCreating}
          />
          <div className="character-count">
            {caption.length}/500
          </div>
        </div>

        {/* Media Section */}
        {mediaPreview && (
          <div className="media-preview">
            {mediaPreview.type === 'video' ? (
              <video controls className="preview-media">
                <source src={mediaPreview.url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={mediaPreview.url} 
                alt="Preview" 
                className="preview-media"
              />
            )}
            <button 
              className="remove-media-btn"
              onClick={removeMedia}
              disabled={isCreating}
            >
              ✕
            </button>
          </div>
        )}

        {/* Media Upload */}
        <div className="media-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaSelect}
            className="media-input"
            id="offline-media-input"
            disabled={isCreating}
          />
          <label htmlFor="offline-media-input" className="media-upload-btn">
            {mediaFile ? '🔄 Change Media' : '📎 Add Media'}
          </label>
          <small className="media-hint">
            Images and videos up to 10MB
            {!navigator.onLine && ' (stored locally until online)'}
          </small>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="creator-actions">
          <button
            className="create-btn"
            onClick={handleCreatePost}
            disabled={isCreating || (!caption.trim() && !mediaFile)}
          >
            {isCreating ? (
              <>
                <span className="loading-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                {navigator.onLine ? '📤 Create Post' : '💾 Save Post'}
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              className="cancel-btn"
              onClick={onCancel}
              disabled={isCreating}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Offline Info */}
        {!navigator.onLine && (
          <div className="offline-info">
            <div className="info-item">
              <span className="info-icon">💾</span>
              <span>Post will be saved locally</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔄</span>
              <span>Automatic sync when online</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <span>Works completely offline</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflinePostCreator;