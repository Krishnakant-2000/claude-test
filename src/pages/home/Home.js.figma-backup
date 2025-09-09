import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { resetPageStyles, bustCSSCache } from '../../utils/cssCleanup';
import notificationService from '../../services/notificationService';
import { db } from '../../lib/firebase';
import { Heart, MessageCircle, Video, Send, Trash2, Image, X, Upload, MoreVertical } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import VideoPlayer from '../../components/common/media/VideoPlayer';
import LazyImage from '../../components/common/ui/LazyImage';
import StoriesContainer from '../../features/stories/StoriesContainer';
import ErrorBoundary from '../../components/common/safety/ErrorBoundary';
import { filterChatMessage, getChatViolationMessage, logChatViolation } from '../../utils/content/chatFilter';
import { filterPostContent, getPostViolationMessage, logPostViolation } from '../../utils/content/postContentFilter';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import './Home.css';
import FooterNav from '../../components/layout/FooterNav';
import { cleanupCorruptedPostComments } from '../../utils/data/cleanupPosts';
import { SafeCommentsList } from '../../components/common/safety/SafeComment';



const POSTS_PER_PAGE = 10;

export default function Home() {
  const { currentUser, isGuest } = useAuth();
  const { isDarkMode } = useTheme();
  
  
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [samplePostLikes, setSamplePostLikes] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [cleanupCompleted, setCleanupCompleted] = useState(false);
  
  // Post composer state
  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postViolation, setPostViolation] = useState(null);
  const [showPostWarning, setShowPostWarning] = useState(false);
  const [showPostMenus, setShowPostMenus] = useState({});
  
  const navigate = useNavigate();

  // Load initial posts
  const loadPosts = useCallback(async (loadMore = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      let q;
      if (loadMore && lastDoc) {
        q = query(
          collection(db, 'posts'),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          orderBy('timestamp', 'desc'),
          limit(POSTS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const postsData = [];
      querySnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() };
        
        // Clean up comment objects to prevent React error #31
        if (postData.comments && Array.isArray(postData.comments)) {
          postData.comments = postData.comments.map(comment => {
            if (typeof comment === 'object' && comment !== null) {
              const { postId, ...cleanComment } = comment; // Remove postId field
              return {
                text: String(cleanComment.text || ''),
                userId: String(cleanComment.userId || ''),
                userDisplayName: String(cleanComment.userDisplayName || 'Unknown User'),
                userPhotoURL: String(cleanComment.userPhotoURL || ''),
                timestamp: cleanComment.timestamp || null
              };
            }
            return comment;
          });
        }
        
        postsData.push(postData);
      });
      
      if (loadMore) {
        setPosts(prev => [...prev, ...postsData]);
      } else {
        // Initial load - combine with sample posts
        const allPosts = [...postsData];
        setPosts(allPosts);
      }
      
      // Update pagination state
      if (querySnapshot.docs.length > 0) {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastDoc(lastVisible);
        setHasMore(querySnapshot.docs.length === POSTS_PER_PAGE);
      } else {
        // No more posts available
        setHasMore(false);
      }
      
    } catch (error) {
      // Error loading posts - logged in production
      // On error, stop trying to load more posts
      if (loadMore) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, lastDoc]);

  // Refresh posts - reset pagination and load fresh posts
  const refreshPosts = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadPosts(false);
  }, [loadPosts]);

  // Handle AmaPlayer title click - scroll to top and refresh posts
  const handleTitleClick = useCallback(() => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Refresh posts to show latest content
    refreshPosts();
  }, [refreshPosts]);


  // Run cleanup only once per session
  useEffect(() => {
    if (!cleanupCompleted) {
      cleanupCorruptedPostComments().then(() => {
        // Post comments cleanup completed, loading posts...
        setCleanupCompleted(true);
        loadPosts();
        
        // System initialized
      }).catch((error) => {
        // Error during cleanup, loading posts anyway - logged in production
        setCleanupCompleted(true);
        loadPosts();
        
        // Error occurred
      });
    } else {
      loadPosts();
    }
  }, [cleanupCompleted, loadPosts, currentUser]);

  // Check if we should show notification permission prompt
  useEffect(() => {
    if (currentUser && !isGuest() && Notification.permission === 'default') {
      // Check if user has already dismissed the prompt
      const dismissed = localStorage.getItem('notificationPromptDismissed');
      if (!dismissed) {
        // Show prompt after 3 seconds to let user settle in
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, isGuest]);

  // Ultra-aggressive CSS cleanup on Home page
  useEffect(() => {
    // Complete style reset for Home
    resetPageStyles('home');
    
    // Re-apply theme immediately after cleanup
    const themeValue = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeValue);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeValue}`);
    
    // Set page title
    document.title = 'AmaPlayer - Home';
    
    // Additional cache busting with theme reapplication
    setTimeout(() => {
      bustCSSCache();
      // Ensure theme is still applied after cache busting
      document.documentElement.setAttribute('data-theme', themeValue);
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${themeValue}`);
    }, 200);
    
    // Cleanup function when component unmounts
    return () => {
      // Bust cache before leaving to prevent style conflicts
      bustCSSCache();
      console.log('HOME: CSS cache busted on unmount');
    };
  }, [isDarkMode]);

  // Logout is now handled by SettingsMenu component

  const handleLike = async (postId, currentLikes, isSamplePost = false, postData = null) => {
    if (!currentUser) return;



    // Handle sample posts differently
    if (isSamplePost) {
      setSamplePostLikes(prev => {
        const currentSampleLikes = prev[postId] || [];
        const userLiked = currentSampleLikes.includes(currentUser.uid);
        
        if (userLiked) {
          return {
            ...prev,
            [postId]: currentSampleLikes.filter(uid => uid !== currentUser.uid)
          };
        } else {
          return {
            ...prev,
            [postId]: [...currentSampleLikes, currentUser.uid]
          };
        }
      });
      return;
    }

    // Handle real posts
    const postRef = doc(db, 'posts', postId);
    const userLiked = currentLikes.includes(currentUser.uid);

    try {
      if (userLiked) {
        // Remove like
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        // Add like
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
        
        // Send notification to post owner (only when liking, not unliking)
        if (postData && postData.userId && postData.userId !== currentUser.uid) {
          try {
            await notificationService.sendLikeNotification(
              currentUser.uid,
              currentUser.displayName || 'Someone',
              currentUser.photoURL || '',
              postData.userId,
              postId,
              postData  // Pass the full post data for media preview
            );
          } catch (notificationError) {
            console.error('Error sending like notification:', notificationError);
          }
        }
      }
    } catch (error) {
      // Error updating like - logged in production
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const commentText = newComment[postId]?.trim();
    
    if (!commentText || !currentUser) return;

    // Prevent guests from commenting
    if (isGuest()) {
      if (window.confirm('Please sign up or log in to comment on posts.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }



    // Content filtering for comments - use strict chat filter
    const filterResult = filterChatMessage(commentText);
    
    if (!filterResult.isClean) {
      const violationMessage = getChatViolationMessage(filterResult.violations, filterResult.categories);
      
      // Log the violation
      await logChatViolation(currentUser.uid, commentText, filterResult.violations, 'comment');
      
      // Show user-friendly error message
      alert(`You can't post this comment.\n\n${violationMessage}\n\nTip: Share positive sports content, training updates, or encouraging messages!`);
      return;
    }

    try {
      // Check if this is a sample post
      const isSamplePost = postId && postId.startsWith('sample');
      
      if (isSamplePost) {
        // For sample posts, add comment locally to state
        const commentData = {
          text: commentText,
          userId: currentUser.uid,
          userDisplayName: currentUser.displayName || 'Anonymous User',
          userPhotoURL: currentUser.photoURL || '',
          timestamp: { toDate: () => new Date() }
        };
        
        setPosts(prevPosts => {
          return prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...(post.comments || []), commentData]
              };
            }
            return post;
          });
        });
      } else {
        // For real posts, save to Firebase - use regular Date for arrayUnion
        const commentData = {
          text: commentText,
          userId: currentUser.uid,
          userDisplayName: currentUser.displayName || 'Anonymous User',
          userPhotoURL: currentUser.photoURL || '',
          timestamp: new Date() // Use regular Date for arrayUnion
        };

        // Add comment to comments collection
        await addDoc(collection(db, 'comments'), {
          ...commentData,
          postId: postId, // Add postId for the separate comments collection document
          timestamp: serverTimestamp() // Use serverTimestamp for the separate document
        });

        // Update post's comment count - using regular Date for arrayUnion
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          comments: arrayUnion(commentData)
        });

        // Send notification to post owner (only if commenting on someone else's post)
        const post = posts.find(p => p.id === postId);
        
        if (post && post.userId && post.userId !== currentUser.uid) {
          try {
            await notificationService.sendCommentNotification(
              currentUser.uid,
              currentUser.displayName || 'Someone',
              currentUser.photoURL || '',
              post.userId,
              postId,
              commentText,
              post
            );
          } catch (notificationError) {
            console.error('Error sending comment notification:', notificationError);
          }
        }
      }

      // Clear input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));

    } catch (error) {
      // Error adding comment - logged in production
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleDeleteComment = async (postId, commentIndex) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post || !post.comments) return;

      const commentToDelete = post.comments[commentIndex];
      
      // Only allow users to delete their own comments
      if (commentToDelete.userId !== currentUser.uid) {
        alert('You can only delete your own comments');
        return;
      }

      const isSamplePost = postId && postId.startsWith('sample');
      
      if (isSamplePost) {
        // For sample posts, remove comment locally from state
        setPosts(prevPosts => {
          return prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments.filter((_, index) => index !== commentIndex)
              };
            }
            return post;
          });
        });
      } else {
        // For real posts, remove from Firebase
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          comments: arrayRemove(commentToDelete)
        });
      }

    } catch (error) {
      // Error deleting comment - logged in production
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const success = await notificationService.enableNotifications(currentUser.uid);
      if (success) {
        setShowNotificationPrompt(false);
        alert('🔔 Notifications enabled! You\'ll now get notified when someone likes your posts.');
      } else {
        alert('Notifications could not be enabled. Please check your browser settings.');
      }
    } catch (error) {
      // Error enabling notifications - logged in production
      alert('Error enabling notifications. Please try again.');
    }
  };

  const handleDismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    // Don't show again for this session
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Post composer functions
  const handlePostTextChange = (e) => {
    const text = e.target.value;
    setPostText(text);
    
    // Real-time content filtering
    if (text.trim().length > 3) {
      const filterResult = filterPostContent(text, {
        context: 'sports_post',
        languages: ['english', 'hindi']
      });
      
      if (!filterResult.isClean && filterResult.shouldBlock) {
        setPostViolation(filterResult);
        setShowPostWarning(true);
      } else {
        setPostViolation(null);
        setShowPostWarning(false);
      }
    } else {
      setPostViolation(null);
      setShowPostWarning(false);
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV) file.');
      return;
    }

    setSelectedMedia(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview({
        url: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    // Reset file input
    const fileInput = document.getElementById('media-upload');
    if (fileInput) fileInput.value = '';
  };

  const uploadMedia = async (file) => {
    const filename = `posts/${currentUser.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytes(storageRef, file);
      
      uploadTask.then(async (snapshot) => {
        try {
          const downloadURL = await getDownloadURL(snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }).catch(reject);
    });
  };

  const handleCreatePost = async () => {
    if (isGuest()) {
      alert('Please sign up or log in to create posts');
      return;
    }

    const text = postText.trim();
    if (!text && !selectedMedia) {
      alert('Please write something or select media to share');
      return;
    }


    // Content filtering
    if (text) {
      const filterResult = filterPostContent(text, {
        context: 'sports_post',
        languages: ['english', 'hindi']
      });
      
      if (!filterResult.isClean) {
        setPostViolation(filterResult);
        setShowPostWarning(true);
        
        if (filterResult.shouldFlag) {
          await logPostViolation(currentUser.uid, text, filterResult.violations, 'home_post');
        }
        
        if (filterResult.shouldBlock || filterResult.shouldWarn) {
          const violationMsg = getPostViolationMessage(filterResult.violations, filterResult.categories);
          alert(`❌ You can't post this content: ${violationMsg}`);
          return;
        }
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if selected
      if (selectedMedia) {
        setUploadProgress(25);
        mediaUrl = await uploadMedia(selectedMedia);
        mediaType = selectedMedia.type.startsWith('image/') ? 'image' : 'video';
        setUploadProgress(75);
      }

      // Create post document
      const postData = {
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        caption: text,
        timestamp: serverTimestamp(),
        likes: [],
        comments: []
      };

      if (mediaUrl) {
        postData.imageUrl = mediaUrl;
        postData.mediaType = mediaType;
      }

      setUploadProgress(90);
      await addDoc(collection(db, 'posts'), postData);
      setUploadProgress(100);

      // Reset form
      setPostText('');
      setSelectedMedia(null);
      setMediaPreview(null);
      setPostViolation(null);
      setShowPostWarning(false);

      // Refresh posts
      await loadPosts();

      alert('Post created successfully!');
    } catch (error) {
      // Error creating post - logged in production
      alert('Failed to create post. Please try again.');
    }

    setUploading(false);
    setUploadProgress(0);
  };

  // Toggle post menu visibility
  const togglePostMenu = (postId) => {
    setShowPostMenus(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Delete post function
  const handleDeletePost = async (postId, postData) => {
    if (!currentUser || postData.userId !== currentUser.uid) {
      alert('You can only delete your own posts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      // Check if it's a sample post
      const isSamplePost = postId && postId.startsWith('sample');
      
      if (isSamplePost) {
        // For sample posts, just remove from local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        alert('Sample post removed successfully!');
        return;
      }

      // For real posts, delete from Firebase
      await deleteDoc(doc(db, 'posts', postId));
      
      // Update local state to remove the deleted post
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Close the menu
      setShowPostMenus(prev => ({
        ...prev,
        [postId]: false
      }));

      alert('Post deleted successfully!');
    } catch (error) {
      // Error deleting post - logged in production
      alert('Failed to delete post. Please try again.');
    }
  };

  // Close menu when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.post-menu-container')) {
      setShowPostMenus({});
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="home">
      <AppHeader onTitleClick={handleTitleClick} showThemeToggle={true} />

      <div className="main-content home-content">
        
        {/* Notification Permission Prompt */}
        {showNotificationPrompt && (
          <div className="notification-prompt" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>🔔</span>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>Stay Updated!</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Get notified when someone likes your posts or interacts with your content.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleEnableNotifications}
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Enable
              </button>
              <button 
                onClick={handleDismissNotificationPrompt}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
        
        {/* Stories Section */}
        <StoriesContainer key={currentUser?.photoURL || 'no-photo'} />

        {/* Post Composer - Twitter/Facebook Style */}
        {!isGuest() && (
          <div className="post-composer">
            <div className="composer-header">
              <div className="composer-avatar">
                <img 
                  src={currentUser?.photoURL || 'https://via.placeholder.com/40'} 
                  alt="Your avatar"
                />
              </div>
              <textarea
                className={`composer-input ${showPostWarning ? 'content-warning' : ''}`}
                placeholder="What's on your mind?"
                value={postText}
                onChange={handlePostTextChange}
                disabled={uploading}
                rows="3"
              />
            </div>

            {/* Content Warning */}
            {showPostWarning && postViolation && (
              <div className="composer-warning">
                <div className="warning-header">
                  <Trash2 size={16} />
                  Inappropriate Content Detected
                </div>
                <div className="warning-message">
                  {getPostViolationMessage(postViolation.violations, postViolation.categories)}
                </div>
                <div className="warning-suggestion">
                  💪 Try sharing your training progress, sports achievements, or positive team experiences!
                </div>
              </div>
            )}

            {/* Media Preview */}
            {mediaPreview && (
              <div className="media-preview">
                <button className="remove-media-btn" onClick={removeMedia}>
                  <X size={20} />
                </button>
                {mediaPreview.type === 'image' ? (
                  <img src={mediaPreview.url} alt="Preview" />
                ) : (
                  <video src={mediaPreview.url} controls muted />
                )}
                <div className="media-info">
                  <span>{mediaPreview.name}</span>
                </div>
              </div>
            )}

            {/* Upload Progress */}
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

            {/* Composer Actions */}
            <div className="composer-actions">
              <div className="media-actions">
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <label htmlFor="media-upload" className="media-btn">
                  <Image size={20} />
                  Photo/Video
                </label>
              </div>
              
              <button 
                className="post-btn"
                onClick={handleCreatePost}
                disabled={(!postText.trim() && !selectedMedia) || uploading || showPostWarning}
              >
                {uploading ? (
                  <>
                    <Upload size={16} />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        )}

        <div className="posts-feed">
          {posts.map((post) => {
            const isSamplePost = post.id && post.id.startsWith('sample');
            const effectiveLikes = isSamplePost ? 
              [...(post.likes || []), ...(samplePostLikes[post.id] || [])].filter((value, index, self) => self.indexOf(value) === index) :
              (post.likes || []);
            const userLiked = effectiveLikes.includes(currentUser?.uid);
            
            return (
            <div key={post.id} className="post">
              <div className="post-header">
                <div className="post-user-info">
                  <h3>{post.userDisplayName}</h3>
                  <span className="post-time">
                    {post.timestamp ? (
                      post.timestamp?.toDate ? 
                        post.timestamp.toDate().toLocaleDateString() : 
                        (post.timestamp instanceof Date ? 
                          post.timestamp.toLocaleDateString() :
                          new Date(post.timestamp).toLocaleDateString()
                        )
                    ) : 'now'}
                  </span>
                </div>
                
                {/* Three dots menu - only show for own posts */}
                {currentUser && post.userId === currentUser.uid && (
                  <div className="post-menu-container">
                    <button 
                      className="post-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePostMenu(post.id);
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {showPostMenus[post.id] && (
                      <div className="post-menu-dropdown">
                        <button 
                          className="menu-item delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post.id, post);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Media Display - Only render if media exists */}
              {((post.mediaUrl && post.mediaUrl.trim() !== '') || 
                (post.imageUrl && post.imageUrl.trim() !== '') || 
                (post.videoUrl && post.videoUrl.trim() !== '')) && (
                <div 
                  className="post-media"
                  onClick={() => navigate(`/post/${post.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {(post.mediaType === 'video' || post.videoUrl) ? (
                    <VideoPlayer 
                      src={post.mediaUrl || post.videoUrl}
                      poster={post.mediaMetadata?.thumbnail}
                      controls={true}
                      className="post-video"
                      videoId={`post-${post.id}`}
                      autoPauseOnScroll={true}
                    />
                  ) : (
                    <LazyImage 
                      src={post.mediaUrl || post.imageUrl} 
                      alt={post.caption} 
                      className="post-image"
                      width={600}
                      height={400}
                    />
                  )}
                </div>
              )}
              
              {/* Text-only content - render as main content if no media */}
              {!((post.mediaUrl && post.mediaUrl.trim() !== '') || 
                 (post.imageUrl && post.imageUrl.trim() !== '') || 
                 (post.videoUrl && post.videoUrl.trim() !== '')) && post.caption && (
                <div 
                  className="post-text-content"
                  onClick={() => navigate(`/post/${post.id}`)}
                  style={{ 
                    cursor: 'pointer',
                    padding: '16px',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    margin: '8px 0',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {post.caption}
                </div>
              )}
              
              <div className="post-actions">
                <button 
                  onClick={() => handleLike(post.id, post.likes || [], isSamplePost, post)}
                  className={userLiked ? 'liked' : ''}
                  disabled={!currentUser}
                >
                  <Heart 
                    size={20} 
                    fill={userLiked ? '#e74c3c' : 'none'}
                    color={userLiked ? '#e74c3c' : 'currentColor'}
                    className={userLiked ? 'heart-liked' : ''}
                  />
                  <span>{effectiveLikes.length}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  disabled={!post.id}
                  className={showComments[post.id] ? 'active' : ''}
                >
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
              
              {/* Caption - only show for posts with media */}
              {((post.mediaUrl && post.mediaUrl.trim() !== '') || 
                (post.imageUrl && post.imageUrl.trim() !== '') || 
                (post.videoUrl && post.videoUrl.trim() !== '')) && (
                <div 
                  className="post-caption"
                  onClick={() => navigate(`/post/${post.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{post.userDisplayName}</strong> {post.caption}
                </div>
              )}

              {/* Comments Section */}
              <ErrorBoundary componentName={`Home Comments for post ${post.id}`}>
                {showComments[post.id] && post.id && (
                  <div className="comments-section">
                    {/* Safe Comments List */}
                    <SafeCommentsList
                      comments={post.comments || []}
                      currentUserId={currentUser?.uid}
                      onDelete={(index, commentId) => handleDeleteComment(post.id, index)}
                      context={`home-post-${post.id}`}
                      emptyMessage="No comments yet. Be the first to comment!"
                    />

                  {/* Add Comment Form */}
                  {!isGuest() ? (
                    <form 
                      className="comment-form"
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                    >
                      <div 
                        className="comment-input-container"
                        onClick={() => {
                          const input = document.querySelector(`input[data-post-id="${post.id}"]`);
                          if (input) input.focus();
                        }}
                      >
                        <LazyImage 
                          src={currentUser.photoURL || 'https://via.placeholder.com/32/2d3748/00ff88?text=👤'} 
                          alt="Your avatar"
                          className="comment-avatar"
                          width={32}
                          height={32}
                          style={{ borderRadius: '50%' }}
                        />
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          className="comment-input"
                          data-post-id={post.id}
                        />
                        <button 
                          type="submit"
                          className="comment-submit-btn"
                          disabled={!newComment[post.id]?.trim()}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="guest-comment-message">
                      <span>Sign in to comment on posts</span>
                    </div>
                  )}
                  </div>
                )}
              </ErrorBoundary>
            </div>
            );
          })}
          
          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="load-more-container">
              <button 
                onClick={() => loadPosts(true)}
                className="load-more-btn"
              >
                Load More Posts
              </button>
            </div>
          )}
          
          {/* Loading Indicator */}
          {loading && hasMore && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading posts...</span>
            </div>
          )}
          
          {/* End of Posts Message */}
          {!hasMore && posts.length > 0 && (
            <div className="end-of-posts">
              <p>You've reached the end! 🎉</p>
              <p>That's all the posts for now.</p>
            </div>
          )}
        </div>
      </div>
      
      
      
      <FooterNav />
    </div>
  );
}