import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/firebase';
import { Heart, MessageCircle, Image, Video, Upload } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import VideoUpload from '../common/VideoUpload';
import VideoPlayer from '../common/VideoPlayer';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadVideoFile, generateVideoMetadata, VIDEO_PATHS } from '../../firebase/videoService';
import './Home.css';
import FooterNav from '../layout/FooterNav';
import { samplePosts } from '../../data/samplePosts';
import UploadDebugger from '../common/UploadDebugger';
import APITester from '../common/APITester';
import { errorTracker, getErrorSolution } from '../../utils/errorTracker';

export default function Home() {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ caption: '', image: null, video: null, mediaType: 'image' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState('image');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      
      // Combine real posts with sample posts for preview
      const allPosts = [...postsData, ...samplePosts];
      setPosts(allPosts);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewPost({ ...newPost, image: e.target.files[0], video: null, mediaType: 'image' });
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
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = '';
      }
      setUploadProgress(0);
      
      alert('Post created successfully!');
      
      // Stop error tracking on success
      errorTracker.stopRecording();
      
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

  const handleLike = async (postId, currentLikes) => {
    const postRef = doc(db, 'posts', postId);
    const userLiked = currentLikes.includes(currentUser.uid);

    try {
      if (userLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  return (
    <div className="home">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>AmaPlayer</h1>
          <div className="nav-links">
            <LanguageSelector />
            <ThemeToggle />
            <button onClick={handleLogout}>{t('logout')}</button>
          </div>
        </div>
      </nav>

      <div className="main-content home-content">
        <div className="create-post">
          <h2>{t('create_post')}</h2>
          
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="file-input"
                required
              />
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
                t('post')
              )}
            </button>
          </form>
        </div>

        <div className="posts-feed">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <h3>{post.userDisplayName}</h3>
                <span className="post-time">
                  {post.timestamp?.toDate ? 
                    post.timestamp.toDate().toLocaleDateString() : 
                    new Date(post.timestamp).toLocaleDateString()
                  }
                </span>
              </div>
              
              {/* Media Display */}
              <div className="post-media">
                {(post.mediaType === 'video' || post.videoUrl) ? (
                  <VideoPlayer 
                    src={post.mediaUrl || post.videoUrl}
                    poster={post.mediaMetadata?.thumbnail}
                    controls={true}
                    className="post-video"
                  />
                ) : (
                  <img 
                    src={post.mediaUrl || post.imageUrl} 
                    alt={post.caption} 
                    className="post-image" 
                  />
                )}
              </div>
              
              <div className="post-actions">
                <button 
                  onClick={() => handleLike(post.id, post.likes || [])}
                  className={post.likes?.includes(currentUser.uid) ? 'liked' : ''}
                  disabled={!post.id} // Disable for sample posts
                >
                  <Heart size={20} fill={post.likes?.includes(currentUser.uid) ? '#e74c3c' : 'none'} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <button disabled={!post.id}>
                  <MessageCircle size={20} />
                  <span>{post.comments?.length || 0}</span>
                </button>
                
                {/* Media type indicator */}
                {(post.mediaType === 'video' || post.videoUrl) && (
                  <div className="media-indicator">
                    <Video size={16} />
                    {post.mediaMetadata?.durationFormatted && (
                      <span>{post.mediaMetadata.durationFormatted}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="post-caption">
                <strong>{post.userDisplayName}</strong> {post.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <FooterNav />
      <UploadDebugger />
      <APITester />
    </div>
  );
}