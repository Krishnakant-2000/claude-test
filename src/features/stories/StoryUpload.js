// Story Upload - Component for uploading new stories
import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StoriesService } from '../../services/api/storiesService';
import { filterPostContent, getPostViolationMessage } from '../../utils/content/postContentFilter';
import { Camera, Video, X, Upload, AlertTriangle } from 'lucide-react';

export default function StoryUpload({ onStoryUploaded, onClose }) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentViolation, setContentViolation] = useState(null);
  const [showContentWarning, setShowContentWarning] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setMediaType(isImage ? 'image' : 'video');
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    
    console.log('📁 File selected:', { name: file.name, type: file.type, size: file.size });
  };

  const handleCaptionChange = (e) => {
    const newCaption = e.target.value;
    setCaption(newCaption);
    
    // Real-time content filtering for stories (sports-friendly)
    if (newCaption.trim().length > 5) {
      const filterResult = filterPostContent(newCaption, {
        strictMode: false,
        checkPatterns: true,
        languages: ['english', 'hindi'],
        context: 'sports_post' // Stories use sports-friendly filtering
      });
      
      if (!filterResult.isClean && filterResult.shouldBlock) {
        setContentViolation(filterResult);
        setShowContentWarning(true);
      } else {
        setContentViolation(null);
        setShowContentWarning(false);
      }
    } else {
      setContentViolation(null);
      setShowContentWarning(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    // Content filtering check
    if (caption.trim()) {
      console.log('🔍 Checking story caption for inappropriate content...');
      const filterResult = filterPostContent(caption, {
        strictMode: true,
        checkPatterns: true,
        languages: ['english', 'hindi'],
        context: 'sports_post' // Stories are sports-friendly
      });

      if (!filterResult.isClean && (filterResult.shouldBlock || filterResult.shouldWarn)) {
        const violationMsg = getPostViolationMessage(filterResult.violations, filterResult.categories);
        alert(`❌ Story caption blocked: ${violationMsg}\n\nPlease revise to focus on sports and positive content.`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const newStory = await StoriesService.createStory(
        currentUser.uid,
        currentUser.displayName,
        currentUser.photoURL,
        selectedFile,
        caption,
        mediaType
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Story uploaded successfully:', newStory);
      
      // Clean up
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setTimeout(() => {
        onStoryUploaded(newStory);
      }, 500);

    } catch (error) {
      console.error('❌ Error uploading story:', error);
      
      let errorMessage = 'Failed to upload story. ';
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    onClose();
  };

  return (
    <div className="story-upload-modal">
      <div className="story-upload-backdrop" onClick={handleClose}></div>
      <div className="story-upload-container">
        <div className="story-upload-header">
          <h3>Add to Story</h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="story-upload-content">
          {!selectedFile ? (
            <div className="file-selection">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <div className="upload-options">
                <button 
                  className="upload-option image-option"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={32} />
                  <span>Photo</span>
                </button>
                
                <button 
                  className="upload-option video-option"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video size={32} />
                  <span>Video</span>
                </button>
              </div>
              
              <div className="upload-tips">
                <h4>📱 Story Tips</h4>
                <ul>
                  <li>Share your training moments</li>
                  <li>Showcase your sports skills</li>
                  <li>Celebrate achievements</li>
                  <li>Stories disappear after 24 hours</li>
                  <li>Max file size: 50MB</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="story-preview">
              <div className="media-preview">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Story preview" />
                ) : (
                  <video src={mediaPreview} controls />
                )}
                
                <button 
                  className="change-file-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </button>
              </div>
              
              <div className="caption-section">
                <textarea
                  placeholder="Add a caption... (optional)"
                  value={caption}
                  onChange={handleCaptionChange}
                  maxLength={200}
                  className={showContentWarning ? 'content-warning' : ''}
                />
                
                <div className="caption-info">
                  <span className="character-count">{caption.length}/200</span>
                </div>
                
                {/* Content violation warning */}
                {showContentWarning && contentViolation && (
                  <div className="content-violation-warning">
                    <div className="warning-header">
                      <AlertTriangle size={16} />
                      Content Warning
                    </div>
                    <div className="warning-message">
                      {getPostViolationMessage(contentViolation.violations, contentViolation.categories)}
                    </div>
                    <div className="warning-suggestion">
                      💡 Try sharing sports achievements, training updates, or positive team moments.
                    </div>
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span>{uploadProgress}% uploaded</span>
                </div>
              )}
              
              <div className="upload-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setSelectedFile(null);
                    setMediaPreview(null);
                    setCaption('');
                    if (mediaPreview) {
                      URL.revokeObjectURL(mediaPreview);
                    }
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                
                <button 
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Upload size={16} />
                      Uploading...
                    </>
                  ) : (
                    'Share Story'
                  )}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}