import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Camera, Image as ImageIcon, X } from 'lucide-react';
import './AddStory.css';

const AddStory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please select an image or video file');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !currentUser) {
      alert('Please select a file and make sure you are logged in');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const mediaType = selectedFile.type.startsWith('video/') ? 'videos' : 'images';
      const storageRef = ref(storage, `stories/${mediaType}/${currentUser.uid}/${fileName}`);
      
      console.log('🔍 AddStory: Uploading to path:', `stories/${mediaType}/${currentUser.uid}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create story document in Firestore
      await addDoc(collection(db, 'stories'), {
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Unknown User',
        userPhotoURL: currentUser.photoURL || null,
        mediaUrl: downloadURL,
        mediaType: selectedFile.type.startsWith('video/') ? 'video' : 'image',
        caption: caption.trim(),
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });

      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('Error uploading story:', error);
      alert('Failed to upload story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    navigate('/home');
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="add-story-page">
      {/* Header */}
      <div className="add-story-header">
        <button className="back-btn" onClick={handleCancel}>
          <ArrowLeft size={24} />
        </button>
        <h1>Add Story</h1>
        <div></div> {/* Spacer for centering */}
      </div>

      <div className="add-story-content">
        {!selectedFile ? (
          // File selection screen
          <div className="file-selection">
            <div className="upload-options">
              <label className="upload-option" htmlFor="camera-input">
                <Camera size={48} />
                <span>Camera</span>
                <input
                  id="camera-input"
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>

              <label className="upload-option" htmlFor="gallery-input">
                <ImageIcon size={48} />
                <span>Gallery</span>
                <input
                  id="gallery-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="upload-info">
              <p>Share a moment from your day</p>
              <small>Photos and videos • Max 50MB • 24h duration</small>
            </div>
          </div>
        ) : (
          // Story creation screen
          <div className="story-creation">
            <div className="preview-container">
              <button className="remove-file-btn" onClick={removeSelectedFile}>
                <X size={20} />
              </button>
              
              {selectedFile.type.startsWith('video/') ? (
                <video
                  src={previewUrl}
                  className="story-preview"
                  controls
                  muted
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="story-preview"
                />
              )}
            </div>

            <form onSubmit={handleSubmit} className="story-form">
              <div className="caption-input">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  maxLength={200}
                  rows={3}
                />
                <span className="caption-counter">{caption.length}/200</span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="share-btn"
                  disabled={isUploading}
                >
                  {isUploading ? 'Sharing...' : 'Share Story'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStory;