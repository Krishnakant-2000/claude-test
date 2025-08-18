import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { Image, Video, Upload, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import VideoUpload from '../../components/common/forms/VideoUpload';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadVideoFile, generateVideoMetadata, VIDEO_PATHS } from '../../services/api/videoService';
import ThemeToggle from '../../components/common/ui/ThemeToggle';
import LanguageSelector from '../../components/common/forms/LanguageSelector';
import FooterNav from '../../components/layout/FooterNav';
import { errorTracker, getErrorSolution } from '../../utils/debug/errorTracker';
import { filterPostContent, getPostViolationMessage, logPostViolation } from '../../utils/content/postContentFilter';
import { validateImageContent } from '../../utils/content/imageContentFilter';
// Phase 3: Offline functionality imports
import { createOfflinePost } from '../../utils/caching/offlinePostManager';
import NetworkStatus from '../../components/common/NetworkStatus';
import OfflinePostCreator from '../../components/common/OfflinePostCreator';
import './AddPost.css';

export default function AddPost() {
  const { currentUser, isGuest } = useAuth();
  const { t } = useLanguage();
  const [newPost, setNewPost] = useState({ caption: '', image: null, video: null, mediaType: 'image' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState('image');
  const [imagePreview, setImagePreview] = useState(null);
  const [contentViolation, setContentViolation] = useState(null);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [showImageWarning, setShowImageWarning] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  // Phase 3: Offline mode state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineCreator, setShowOfflineCreator] = useState(false);
  const [offlinePostCreated, setOfflinePostCreated] = useState(null);
  const navigate = useNavigate();

  // Cleanup effect for image preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Phase 3: Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleImageChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setNewPost({ ...newPost, image: file, video: null, mediaType: 'image' });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Analyze image content
      setAnalyzingImage(true);
      try {
        console.log('🔍 Analyzing uploaded image for inappropriate content...');
        const analysis = await validateImageContent(file, {
          strictMode: false,
          quickCheck: false
        });
        
        console.log('📊 Image analysis result:', analysis);
        setImageAnalysis(analysis);
        
        if (!analysis.isClean) {
          setShowImageWarning(true);
          
          if (analysis.shouldBlock) {
            alert(`❌ Image blocked: This image may contain inappropriate content.\n\nReasons: ${analysis.warnings.join(', ')}\n\nPlease upload sports-related images like action shots, team photos, or training moments.`);
            handleImageRemove();
            return;
          }
          
          if (analysis.shouldWarn) {
            const proceed = window.confirm(`⚠️ Image Warning: This image may contain questionable content.\n\nReasons: ${analysis.warnings.join(', ')}\n\nRecommendation: ${analysis.recommendations.join(', ')}\n\nDo you want to continue with this image?`);
            if (!proceed) {
              handleImageRemove();
              return;
            }
          }
        } else {
          setShowImageWarning(false);
          console.log('✅ Image passed content analysis');
        }
        
      } catch (error) {
        console.error('❌ Image analysis failed:', error);
        // Continue with upload but warn user
        setImageAnalysis({ 
          warnings: ['Could not analyze image content'], 
          shouldWarn: true,
          isClean: false 
        });
        setShowImageWarning(true);
      }
      
      setAnalyzingImage(false);
    }
  };

  const handleImageRemove = () => {
    setNewPost({ ...newPost, image: null });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    // Clear image analysis
    setImageAnalysis(null);
    setShowImageWarning(false);
    setAnalyzingImage(false);
    
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

  // Real-time content filtering as user types
  const handleCaptionChange = (e) => {
    const newCaption = e.target.value;
    setNewPost({ ...newPost, caption: newCaption });
    
    // Real-time filter check (less strict for typing)
    if (newCaption.trim().length > 10) { // Only check after some content is entered
      // Detect if this might be sports/talent content for more lenient filtering
      const sportsKeywords = ['performance', 'training', 'workout', 'talent', 'skills', 'competition', 'match', 'game', 'victory', 'win'];
      const isSportsContent = sportsKeywords.some(keyword => 
        newCaption.toLowerCase().includes(keyword)
      );
      
      const filterResult = filterPostContent(newCaption, {
        strictMode: false,
        checkPatterns: true,
        languages: ['english', 'hindi'],
        context: isSportsContent ? 'sports_post' : 'general'
      });
      
      if (!filterResult.isClean && filterResult.shouldBlock) {
        setContentViolation(filterResult);
        setShowViolationWarning(true);
      } else {
        setContentViolation(null);
        setShowViolationWarning(false);
      }
    } else {
      setContentViolation(null);
      setShowViolationWarning(false);
    }
  };

  // Phase 3: Handle offline post creation
  const handleOfflinePost = async () => {
    if (!currentUser) {
      alert('You must be logged in to create posts.');
      return;
    }

    if (isGuest()) {
      if (window.confirm('Please sign up or log in to create posts. Guest accounts have read-only access.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }

    // Use offline post creator for better UX
    setShowOfflineCreator(true);
  };

  // Phase 3: Handle offline post creation callback
  const handleOfflinePostCreated = (offlinePost) => {
    setOfflinePostCreated(offlinePost);
    setShowOfflineCreator(false);
    
    // Show success message and option to continue
    setTimeout(() => {
      if (window.confirm('Post saved offline! It will sync when you\'re back online.\n\nWould you like to create another post?')) {
        // Reset form for another post
        setNewPost({ caption: '', image: null, video: null, mediaType: 'image' });
        setImagePreview(null);
        setOfflinePostCreated(null);
      } else {
        navigate('/home');
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Phase 3: Check if offline and handle accordingly
    if (isOffline || !navigator.onLine) {
      await handleOfflineSubmit();
      return;
    }
    
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
      if (window.confirm('Please sign up or log in to create posts. Guest accounts have read-only access.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }

    // Content filtering check
    console.log('🔍 Checking content for inappropriate material...');
    
    // Detect sports/talent context for more lenient filtering
    const sportsKeywords = ['performance', 'training', 'workout', 'talent', 'skills', 'competition', 'match', 'game', 'victory', 'win', 'congrats', 'fire', 'beast', 'crush'];
    const isSportsContent = sportsKeywords.some(keyword => 
      newPost.caption.toLowerCase().includes(keyword)
    );
    
    const filterResult = filterPostContent(newPost.caption, {
      strictMode: true,
      checkPatterns: true,
      languages: ['english', 'hindi'],
      context: isSportsContent ? 'sports_post' : 'general'
    });
    
    console.log('Filter result:', filterResult);
    
    if (!filterResult.isClean) {
      setContentViolation(filterResult);
      setShowViolationWarning(true);
      
      // Log violation for admin review
      if (filterResult.shouldFlag) {
        await logPostViolation(currentUser.uid, newPost.caption, filterResult.violations, 'post');
        console.log('🚨 Content violation flagged for admin review');
      }
      
      // Block content without confirmation - just show error
      if (filterResult.shouldBlock || filterResult.shouldWarn) {
        const violationMsg = getPostViolationMessage(filterResult.violations, filterResult.categories);
        alert(`❌ You can't post this content: ${violationMsg}`);
        errorTracker.trackError(new Error('Content blocked by filter'), { 
          step: 'content_filter',
          violations: filterResult.violations 
        });
        errorTracker.stopRecording();
        return;
      }
    } else {
      setContentViolation(null);
      setShowViolationWarning(false);
      console.log('✅ Content passed all filters');
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
        
        mediaMetadata = await generateVideoMetadata(newPost.video, mediaUrl, currentUser.uid);
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
      } else if (error.message && error.message.includes('ERR_FAILED')) {
        errorMessage += 'Firebase Storage is not properly configured. Please contact the administrator to set up Firebase Storage in the Firebase Console.';
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

  // Phase 3: Handle offline form submission
  const handleOfflineSubmit = async () => {
    if (!newPost.caption.trim()) {
      alert('Please enter a caption for your post.');
      return;
    }
    
    if (!newPost.image && !newPost.video) {
      alert('Please select an image or video to upload.');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to create posts.');
      return;
    }

    if (isGuest()) {
      if (window.confirm('Please sign up or log in to create posts. Guest accounts have read-only access.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Handle media file for offline storage
      const mediaFile = newPost.image || newPost.video;
      if (mediaFile) {
        // Convert file to base64 for offline storage
        const base64Data = await convertFileToBase64(mediaFile);
        mediaUrl = base64Data;
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      }

      const postData = {
        caption: newPost.caption.trim(),
        mediaUrl,
        mediaType,
        originalFileName: mediaFile?.name || null,
        originalFileSize: mediaFile?.size || null
      };

      // Create offline post
      const offlinePost = await createOfflinePost(postData, currentUser.uid);

      // Reset form
      setNewPost({ caption: '', image: null, video: null, mediaType: 'image' });
      setMediaType('image');
      
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = '';
      }

      alert('Post saved offline! It will sync automatically when you\'re back online.');
      navigate('/home');

    } catch (error) {
      console.error('Failed to create offline post:', error);
      alert('Failed to save post offline. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Phase 3: Show offline creator modal when requested
  if (showOfflineCreator) {
    return (
      <div className="add-post">
        <nav className="nav-bar">
          <div className="nav-content">
            <button onClick={() => setShowOfflineCreator(false)} className="back-btn">
              <ArrowLeft size={20} />
              Cancel
            </button>
            <h1>Create Post (Offline)</h1>
            <div className="nav-controls">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="main-content add-post-content">
          <OfflinePostCreator 
            onPostCreated={handleOfflinePostCreated}
            onCancel={() => setShowOfflineCreator(false)}
            showOfflineIndicator={true}
          />
        </div>
        
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="add-post">
      <nav className="nav-bar">
        <div className="nav-content">
          <button onClick={() => navigate('/home')} className="back-btn">
            <ArrowLeft size={20} />
            Cancel
          </button>
          <h1>
            {t('createPost')}
            {isOffline && (
              <span className="offline-indicator">
                <WifiOff size={16} /> Offline Mode
              </span>
            )}
          </h1>
          <div className="nav-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Phase 3: Network Status Component */}
      <NetworkStatus />

      <div className="main-content add-post-content">
        {/* Phase 3: Offline success message */}
        {offlinePostCreated && (
          <div className="offline-success-banner">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <div className="success-text">
                <strong>Post saved offline!</strong>
                <p>Your post will sync automatically when you're back online.</p>
              </div>
            </div>
          </div>
        )}

        {isGuest() && (
          <div className="guest-post-restriction">
            <span>
              🔒 Guest accounts have read-only access. 
              <button 
                className="sign-in-link"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button> 
              to create posts.
            </span>
          </div>
        )}

        {/* Phase 3: Offline mode notice */}
        {isOffline && (
          <div className="offline-mode-notice">
            <div className="offline-notice-content">
              <WifiOff size={20} />
              <div className="offline-text">
                <strong>You're offline</strong>
                <p>Posts will be saved locally and synced when you reconnect.</p>
              </div>
              <button 
                className="offline-create-btn"
                onClick={handleOfflinePost}
                disabled={isGuest()}
              >
                Create Offline Post
              </button>
            </div>
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
              placeholder={t('whatsOnYourMind')}
              value={newPost.caption}
              onChange={handleCaptionChange}
              required
              className={showViolationWarning ? 'content-warning' : ''}
            />
            
            {/* Real-time content violation warning */}
            {showViolationWarning && contentViolation && (
              <div className="content-violation-warning">
                <div className="warning-header">
                  ⚠️ Content Warning
                </div>
                <div className="warning-message">
                  {getPostViolationMessage(contentViolation.violations, contentViolation.categories)}
                </div>
                <div className="warning-suggestion">
                  💡 Try focusing on sports achievements, training tips, or positive team interactions.
                </div>
              </div>
            )}
            
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
                    
                    {/* Image Analysis Indicator */}
                    {analyzingImage && (
                      <div className="image-analysis-indicator">
                        <div className="analysis-spinner"></div>
                        <span>Analyzing content...</span>
                      </div>
                    )}
                    
                    {/* Image Analysis Warning */}
                    {showImageWarning && imageAnalysis && (
                      <div className="image-analysis-warning">
                        <div className="analysis-header">
                          📷 Image Content Analysis
                        </div>
                        <div className="analysis-status">
                          Risk Level: <span className={`risk-${imageAnalysis.riskLevel}`}>
                            {imageAnalysis.riskLevel?.toUpperCase()}
                          </span>
                        </div>
                        {imageAnalysis.warnings && imageAnalysis.warnings.length > 0 && (
                          <div className="analysis-warnings">
                            <strong>Concerns:</strong>
                            <ul>
                              {imageAnalysis.warnings.slice(0, 3).map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {imageAnalysis.recommendations && imageAnalysis.recommendations.length > 0 && (
                          <div className="analysis-recommendations">
                            <strong>💡 Suggestions:</strong>
                            <p>{imageAnalysis.recommendations[0]}</p>
                          </div>
                        )}
                      </div>
                    )}
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
            
            <button type="submit" disabled={uploading || (isOffline && !showOfflineCreator)}>
              {uploading ? (
                <>
                  <Upload size={20} />
                  {isOffline ? 'Saving Offline...' : t('posting')}
                </>
              ) : isOffline ? (
                <>
                  <WifiOff size={20} />
                  Save Offline
                </>
              ) : (
                <>
                  <Wifi size={20} />
                  Share Post
                </>
              )}
            </button>

            {/* Phase 3: Alternative offline creation button */}
            {isOffline && (
              <button 
                type="button" 
                className="offline-alternative-btn"
                onClick={handleOfflinePost}
                disabled={isGuest()}
              >
                <WifiOff size={20} />
                Use Offline Creator
              </button>
            )}
          </form>
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}