import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/firebase';
import { Image, Video, Upload, ArrowLeft } from 'lucide-react';
import VideoUpload from '../common/VideoUpload';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadVideoFile, generateVideoMetadata, VIDEO_PATHS } from '../../firebase/videoService';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import FooterNav from '../layout/FooterNav';
import { errorTracker, getErrorSolution } from '../../utils/errorTracker';
import './AddPost.css';

export default function AddPost() {
  const { currentUser, isGuest } = useAuth();
  const { t } = useLanguage();
  const [newPost, setNewPost] = useState({ caption: '', image: null, video: null, mediaType: 'image' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState('image');
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Cleanup effect for image preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setNewPost({ ...newPost, image: file, video: null, mediaType: 'image' });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageRemove = () => {
    setNewPost({ ...newPost, image: null });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (document.getElementById('file-input')) {
      document.getElementById('file-input').value = '';
    }
  };

  const handleVideoSelect = (videoFile) => {
    setNewPost({ ...newPost, video: videoFile, image: null, mediaType: 'video' });
  };

  const handleVideoRemove = () => {
    setNewPost({ ...newPost, video: null });
  };

  const toggleMediaType = (type) => {
    setMediaType(type);
    setNewPost({ ...newPost, image: null, video: null, mediaType: type });
    
    // Clean up image preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    
    if (document.getElementById('file-input')) {
      document.getElementById('file-input').value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Start error tracking for this upload session
    errorTracker.startRecording();
    
    // Validation with detailed error messages
    if (!newPost.caption.trim()) {
      errorTracker.trackError(new Error('No caption provided'), { step: 'validation' });
      alert('Please enter a caption for your post.');
      return;
    }
    
    if (!newPost.image && !newPost.video) {
      errorTracker.trackError(new Error('No media file selected'), { step: 'validation' });
      alert('Please select an image or video to upload.');
      return;
    }

    // Check user authentication
    if (!currentUser) {
      errorTracker.trackError(new Error('User not authenticated'), { step: 'auth_check' });
      alert('You must be logged in to create a post.');
      return;
    }

    // Prevent guests from creating posts
    if (isGuest()) {
      alert('Please sign up or log in to create posts. Guest accounts have read-only access.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    // Track upload attempt
    const selectedFile = newPost.image || newPost.video;
    errorTracker.trackUploadAttempt(selectedFile, newPost.mediaType);
    
    try {
      let mediaUrl = '';
      let mediaMetadata = {};
      
      console.log('Starting upload...', { 
        mediaType: newPost.mediaType, 
        hasImage: !!newPost.image, 
        hasVideo: !!newPost.video,
        user: currentUser.uid 
      });
      
      if (newPost.mediaType === 'image' && newPost.image) {
        console.log('Uploading image...', {
          name: newPost.image.name,
          size: newPost.image.size,
          type: newPost.image.type
        });
        
        // Validate image file
        if (!newPost.image.type.startsWith('image/')) {
          throw new Error('Selected file is not a valid image.');
        }
        
        if (newPost.image.size > 10 * 1024 * 1024) { // 10MB limit for images
          throw new Error('Image file is too large. Maximum size is 10MB.');
        }
        
        // Create safe filename
        const safeFileName = newPost.image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const imageRef = ref(storage, `posts/images/${currentUser.uid}/${Date.now()}-${safeFileName}`);
        
        console.log('Upload path:', imageRef.fullPath);
        
        const uploadResult = await uploadBytes(imageRef, newPost.image);
        console.log('Image uploaded successfully:', uploadResult);
        
        mediaUrl = await getDownloadURL(uploadResult.ref);
        console.log('Download URL obtained:', mediaUrl);
        
        mediaMetadata = {
          type: 'image',
          mimeType: newPost.image.type,
          size: newPost.image.size,
          fileName: newPost.image.name,
          uploadedAt: new Date().toISOString()
        };
        
      } else if (newPost.mediaType === 'video' && newPost.video) {
        console.log('Uploading video...', {
          name: newPost.video.name,
          size: newPost.video.size,
          type: newPost.video.type
        });
        
        // Handle video upload with progress
        mediaUrl = await uploadVideoFile(
          newPost.video, 
          currentUser.uid, 
          VIDEO_PATHS.POSTS,
          (progress) => {
            console.log('Upload progress:', progress);
            setUploadProgress(progress);
            errorTracker.trackUploadProgress(progress, { type: 'video' });
          }
        );
        console.log('Video uploaded, URL:', mediaUrl);
        
        mediaMetadata = await generateVideoMetadata(newPost.video, mediaUrl);
        console.log('Video metadata generated:', mediaMetadata);
      }

      console.log('Creating post document...');
      const postData = {
        caption: newPost.caption.trim(),
        mediaUrl,
        mediaMetadata,
        mediaType: newPost.mediaType,
        // Keep backward compatibility
        imageUrl: newPost.mediaType === 'image' ? mediaUrl : null,
        videoUrl: newPost.mediaType === 'video' ? mediaUrl : null,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        timestamp: new Date(),
        likes: [],
        comments: []
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Post created successfully with ID:', docRef.id);
      
      // Track successful upload
      errorTracker.trackSuccess('post_creation', {
        postId: docRef.id,
        mediaType: newPost.mediaType,
        fileSize: selectedFile.size
      });

      // Reset form
      setNewPost({ caption: '', image: null, video: null, mediaType: 'image' });
      setMediaType('image');
      
      // Clean up image preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = '';
      }
      setUploadProgress(0);
      
      alert('Post created successfully!');
      
      // Stop error tracking on success
      errorTracker.stopRecording();
      
      // Navigate back to home
      navigate('/home');
      
    } catch (error) {
      console.error('Detailed error creating post:', error);
      
      // Track the error
      errorTracker.trackError(error, {
        step: 'upload_execution',
        mediaType: newPost.mediaType,
        fileSize: selectedFile?.size,
        fileName: selectedFile?.name
      });
      
      // Get solution for this error
      const solution = getErrorSolution(error.code);
      
      // Provide specific error messages
      let errorMessage = 'Failed to create post. ';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'You do not have permission to upload files. Please check your account permissions.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was canceled.';
      } else if (error.code === 'storage/unknown') {
        errorMessage += 'An unknown error occurred during upload.';
      } else if (error.code === 'storage/invalid-format') {
        errorMessage += 'Invalid file format.';
      } else if (error.code === 'storage/invalid-event-name') {
        errorMessage += 'Invalid upload configuration.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      // Add solution hint
      if (solution.solution) {
        errorMessage += `\n\n💡 Suggested fix: ${solution.solution}`;
      }
      
      alert(errorMessage);
      
      // Export error report for debugging
      console.log('🔍 Error report:', errorTracker.getReport());
      
      // Stop error tracking
      errorTracker.stopRecording();
    }
    
    setUploading(false);
  };

  return (
    <div className="add-post">
      <nav className="nav-bar">
        <div className="nav-content">
          <button onClick={() => navigate('/home')} className="back-btn">
            <ArrowLeft size={20} />
            Cancel
          </button>
          <h1>{t('create_post')}</h1>
          <div className="nav-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="main-content add-post-content">
        {isGuest() && (
          <div className="guest-post-restriction">
            <span>🔒 Guest accounts have read-only access. Sign in to create posts.</span>
          </div>
        )}
        <div className="create-post">
          
          {/* Media Type Toggle */}
          <div className="media-type-toggle">
            <button 
              type="button"
              className={`media-btn ${mediaType === 'image' ? 'active' : ''}`}
              onClick={() => toggleMediaType('image')}
            >
              <Image size={20} />
              Image
            </button>
            <button 
              type="button"
              className={`media-btn ${mediaType === 'video' ? 'active' : ''}`}
              onClick={() => toggleMediaType('video')}
            >
              <Video size={20} />
              Video
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              placeholder={t('whats_mind')}
              value={newPost.caption}
              onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
              required
            />
            
            {mediaType === 'image' ? (
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="file-input"
                  required
                  style={{ display: 'none' }}
                />
                
                {!imagePreview ? (
                  <label htmlFor="file-input" className="image-upload-label">
                    <Image size={48} />
                    <span>Choose an image</span>
                    <small>JPG, PNG, GIF up to 10MB</small>
                  </label>
                ) : (
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <div className="image-preview-overlay">
                      <button 
                        type="button" 
                        onClick={handleImageRemove}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                      <label htmlFor="file-input" className="change-image-btn">
                        Change
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <VideoUpload 
                onVideoSelect={handleVideoSelect}
                onVideoRemove={handleVideoRemove}
                showPreview={true}
              />
            )}
            
            {uploading && uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span>{Math.round(uploadProgress)}% uploaded</span>
              </div>
            )}
            
            <button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Upload size={20} />
                  {t('posting')}
                </>
              ) : (
                'Share Post'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}