import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { Heart, MessageCircle, Share2, MoreHorizontal, Search, Camera, Bell, LogOut } from 'lucide-react';
import CommentDrawer from '../../components/common/modals/CommentDrawer';
import { 
  collection, 
  query, 
  orderBy, 
  limit,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  deleteDoc,
  serverTimestamp,
  where,
  onSnapshot
} from 'firebase/firestore';
import './FigmaHomeBetter.css';

// User Avatar component that handles both real images and placeholders
const UserAvatar = ({ src, size = 40, userName = 'User' }) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={userName}
        className="user-avatar"
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%',
          objectFit: 'cover'
        }}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }
  
  return (
    <div 
      className="placeholder-avatar"
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        backgroundColor: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size / 2.5,
        color: '#64748b'
      }}
    >
      👤
    </div>
  );
};

// Placeholder SVG components (keep for backwards compatibility)
const PlaceholderAvatar = ({ size = 40 }) => (
  <div 
    className="placeholder-avatar"
    style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%', 
      backgroundColor: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size / 2.5,
      color: '#64748b'
    }}
  >
    👤
  </div>
);

const PlaceholderImage = ({ width = 400, height = 250 }) => (
  <div 
    className="placeholder-image"
    style={{ 
      width, 
      height, 
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      color: '#94a3b8',
      borderRadius: '8px'
    }}
  >
    📷
  </div>
);

export const AmaPlayerHomePage = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [followingStates, setFollowingStates] = useState({});
  const [commentDrawer, setCommentDrawer] = useState({
    isOpen: false,
    postId: null,
    postAuthor: null
  });
  const [reelViewer, setReelViewer] = useState({
    isOpen: false,
    currentReelIndex: 0,
    reelsList: []
  });
  const [reelCommentDrawer, setReelCommentDrawer] = useState({
    isOpen: false,
    postId: null,
    postAuthor: null
  });

  // Load posts from Firebase (only images and text posts)
  const loadPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const postsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        console.log('Post data:', data);
        // Only add non-video posts to main feed
        if (!data.videoUrl) {
          postsData.push(data);
        }
      });
      
      console.log('Filtered posts for feed:', postsData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
    setLoading(false);
  };

  // Load reels from Firebase (only videos)
  const loadReels = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const reelsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        console.log('Checking for video content:', data);
        // Only add video posts to reels
        if (data.videoUrl) {
          reelsData.push(data);
        }
      });
      
      console.log('Filtered reels:', reelsData);
      setReels(reelsData);
    } catch (error) {
      console.error('Error loading reels:', error);
    }
  };

  // Load stories from Firebase
  const loadStories = async () => {
    try {
      const q = query(
        collection(db, 'stories'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const storiesData = [];
      
      // Group stories by user
      const userStories = {};
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        console.log('Story data:', data);
        
        // Check if story is still active (24 hours)
        const storyTime = data.timestamp?.toDate();
        const now = new Date();
        const hoursDiff = (now - storyTime) / (1000 * 60 * 60);
        
        if (hoursDiff <= 24) { // Only show stories less than 24 hours old
          if (!userStories[data.userId]) {
            userStories[data.userId] = {
              userId: data.userId,
              userName: data.userDisplayName || 'Unknown User',
              userAvatar: data.userPhotoURL,
              stories: [],
              isOwn: data.userId === currentUser?.uid
            };
          }
          userStories[data.userId].stories.push(data);
        }
      });
      
      // Convert to array and add "Your Story" option for current user
      const storiesArray = Object.values(userStories);
      
      // Add "Add Story" option if user is logged in
      if (currentUser && !storiesArray.find(s => s.isOwn)) {
        storiesArray.unshift({
          userId: 'add-story',
          userName: 'Your Story',
          userAvatar: currentUser.photoURL,
          stories: [],
          isAddStory: true,
          isOwn: true
        });
      }
      
      console.log('Processed stories:', storiesArray);
      setStories(storiesArray);
    } catch (error) {
      console.error('Error loading stories:', error);
      // Fallback to mock data
      const mockStories = [
        { userId: 'add-story', userName: 'Your Story', userAvatar: null, stories: [], isAddStory: true, isOwn: true },
        { userId: '1', userName: 'Daisy Nicolas', userAvatar: null, stories: [{ mediaUrl: 'sample', mediaType: 'image' }] },
        { userId: '2', userName: 'Anil Kumble', userAvatar: null, stories: [{ mediaUrl: 'sample', mediaType: 'image' }] },
      ];
      setStories(mockStories);
    }
  };

  useEffect(() => {
    loadPosts();
    loadReels();
    loadStories();
    
    // Fetch followed users
    let unsubscribe;
    if (currentUser) {
      unsubscribe = fetchFollowedUsers();
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]); // Depend on currentUser for proper story loading

  // Handle story click
  const handleStoryClick = (story) => {
    if (story.isAddStory) {
      // Navigate to add story page
      navigate('/add-story');
    } else if (story.stories && story.stories.length > 0) {
      // Open story viewer
      setSelectedStory(story);
      setShowStoryViewer(true);
    }
  };

  // Close story viewer
  const closeStoryViewer = () => {
    setShowStoryViewer(false);
    setSelectedStory(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Fetch users that current user is following
  const fetchFollowedUsers = () => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followedList = [];
      snapshot.forEach((doc) => {
        followedList.push(doc.data().followingId);
      });
      setFollowedUsers(followedList);
    });

    return unsubscribe;
  };

  // Handle follow/unfollow functionality
  const handleFollowUnfollow = async (postUserId, postUserName) => {
    if (!currentUser) {
      alert('Please sign up or log in to follow users');
      return;
    }

    if (currentUser.uid === postUserId) return; // Can't follow yourself

    const isCurrentlyFollowing = followedUsers.includes(postUserId);
    
    // Set loading state
    setFollowingStates(prev => ({ ...prev, [postUserId]: true }));

    try {
      if (isCurrentlyFollowing) {
        // Unfollow: remove from follows collection
        const q = query(
          collection(db, 'follows'),
          where('followerId', '==', currentUser.uid),
          where('followingId', '==', postUserId)
        );
        
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'follows', docSnapshot.id));
        });

        // Update follower count
        const userRef = doc(db, 'users', postUserId);
        await updateDoc(userRef, {
          followers: arrayRemove(currentUser.uid)
        });

        // Update following count
        const currentUserRef = doc(db, 'users', currentUser.uid);
        await updateDoc(currentUserRef, {
          following: arrayRemove(postUserId)
        });
        
      } else {
        // Follow: add to follows collection
        await addDoc(collection(db, 'follows'), {
          followerId: currentUser.uid,
          followingId: postUserId,
          followerName: currentUser.displayName || 'Anonymous User',
          followingName: postUserName || 'Anonymous User',
          timestamp: serverTimestamp()
        });

        // Update follower count
        const userRef = doc(db, 'users', postUserId);
        await updateDoc(userRef, {
          followers: arrayUnion(currentUser.uid)
        });

        // Update following count
        const currentUserRef = doc(db, 'users', currentUser.uid);
        await updateDoc(currentUserRef, {
          following: arrayUnion(postUserId)
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      alert('Failed to update follow status');
    }

    // Clear loading state
    setFollowingStates(prev => ({ ...prev, [postUserId]: false }));
  };

  // Handle opening comment drawer
  const handleOpenComments = (postId, postAuthor) => {
    setCommentDrawer({
      isOpen: true,
      postId: postId,
      postAuthor: postAuthor
    });
  };

  // Handle closing comment drawer
  const handleCloseComments = () => {
    setCommentDrawer({
      isOpen: false,
      postId: null,
      postAuthor: null
    });
  };

  // Handle opening reel viewer
  const handleReelClick = (clickedReelIndex) => {
    setReelViewer({
      isOpen: true,
      currentReelIndex: clickedReelIndex,
      reelsList: reels
    });
  };

  // Handle closing reel viewer
  const handleCloseReelViewer = () => {
    setReelViewer({
      isOpen: false,
      currentReelIndex: 0,
      reelsList: []
    });
  };

  // Handle like functionality for Star Moments
  const handleReelLike = async (reel) => {
    if (!currentUser || !reel.id) return;
    
    const postRef = doc(db, 'posts', reel.id);
    const userLiked = reel.likes?.includes(currentUser.uid);

    // Update local state immediately for better UX (optimistic update)
    setReels(prevReels => 
      prevReels.map(r => {
        if (r.id === reel.id) {
          const newLikes = userLiked 
            ? r.likes?.filter(uid => uid !== currentUser.uid) || []
            : [...(r.likes || []), currentUser.uid];
          return { ...r, likes: newLikes };
        }
        return r;
      })
    );

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
      console.error('Error updating reel like:', error);
      // Revert the optimistic update if there's an error
      setReels(prevReels => 
        prevReels.map(r => {
          if (r.id === reel.id) {
            return { ...r, likes: reel.likes };
          }
          return r;
        })
      );
    }
  };

  // Handle comment functionality for Star Moments
  const handleReelComment = (reel) => {
    setReelCommentDrawer({
      isOpen: true,
      postId: reel.id,
      postAuthor: {
        userId: reel.userId,
        displayName: reel.userDisplayName,
        photoURL: reel.userPhotoURL
      }
    });
  };

  // Handle closing reel comment drawer
  const handleCloseReelComments = () => {
    setReelCommentDrawer({
      isOpen: false,
      postId: null,
      postAuthor: null
    });
  };

  // Handle share functionality
  const handleShare = async (post, isReel = false) => {
    const shareData = {
      title: `${post.userDisplayName || 'AmaPlayer User'}'s ${isReel ? 'Star Moment' : 'Post'}`,
      text: post.caption || `Check out this amazing ${isReel ? 'Star Moment' : 'post'} on AmaPlayer!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share(shareData);
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the link manually.');
      }
    }
  };

  // Handle like functionality
  const handleLike = async (postId, currentLikes) => {
    if (!currentUser || !postId) return;
    
    const postRef = doc(db, 'posts', postId);
    const userLiked = currentLikes?.includes(currentUser.uid);

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
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newLikes = userLiked 
              ? post.likes?.filter(uid => uid !== currentUser.uid) || []
              : [...(post.likes || []), currentUser.uid];
            return { ...post, likes: newLikes };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  return (
    <div className="figma-home-container">
      {/* Header */}
      <div className="home-header">
        <h1 className="home-title">AmaPlayer</h1>
        <div className="header-actions">
          <Search size={28} onClick={() => navigate('/search')} />
          <Bell size={28} onClick={() => navigate('/messages')} />
          <LogOut size={25} onClick={handleLogout} />
        </div>
      </div>

      {/* Post Composer */}
      <div className="post-composer">
        <div className="profile-pic-nav" onClick={() => navigate('/profile')}>
          <UserAvatar 
            src={currentUser?.photoURL} 
            size={40} 
            userName={currentUser?.displayName || 'You'} 
          />
        </div>
        <div className="composer-input" onClick={() => navigate('/add-post')}>
          <p>What's on your mind?</p>
        </div>
        <div className="composer-camera" onClick={() => navigate('/add-post')}>
          <Camera size={30} />
        </div>
      </div>

      {/* Stories Section */}
      <div className="stories-section">
        <div className="stories-container">
          {stories.map((story, index) => (
            <div 
              key={story.userId || index} 
              className={`story-item ${story.isAddStory ? 'add-story' : ''} ${story.stories?.length > 0 ? 'has-stories' : ''}`}
              onClick={() => handleStoryClick(story)}
            >
              <div className="story-avatar-container">
                <UserAvatar 
                  src={story.userAvatar} 
                  size={60} 
                  userName={story.userName} 
                />
                {story.isAddStory && (
                  <div className="add-story-plus">+</div>
                )}
              </div>
              <span className="story-name">{story.userName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {posts.length > 0 ? posts.map((post, index) => (
          <Fragment key={post.id}>
            <div className="post-item">
              {/* Post Header */}
              <div className="post-header">
                <UserAvatar 
                  src={post.userPhotoURL} 
                  size={40} 
                  userName={post.userDisplayName || 'Unknown User'} 
                />
                <div className="post-user-info">
                  <div className="post-username">
                    {post.userDisplayName || 'Unknown User'}
                  </div>
                  <div className="post-timestamp">
                    {post.timestamp?.toDate ? 
                      post.timestamp.toDate().toLocaleDateString() : 
                      'Recently'
                    }
                  </div>
                </div>
                {currentUser && currentUser.uid !== post.userId && (
                  <button 
                    className={`follow-button ${followedUsers.includes(post.userId) ? 'following' : ''}`}
                    onClick={() => handleFollowUnfollow(post.userId, post.userDisplayName)}
                    disabled={followingStates[post.userId]}
                  >
                    {followingStates[post.userId] ? (
                      'Loading...'
                    ) : followedUsers.includes(post.userId) ? (
                      'Unfollow'
                    ) : (
                      'Follow'
                    )}
                  </button>
                )}
                <MoreHorizontal size={16} />
              </div>

              {/* Post Image - Only show if there's actually media */}
              {post.imageUrl && (
                <div className="post-media">
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="post-image"
                  />
                </div>
              )}

              {/* Post Caption */}
              {post.caption && (
                <div className="post-caption">
                  <p>{post.caption}</p>
                </div>
              )}

              {/* Post Stats */}
              <div className="post-stats">
                <span>{post.likes?.length || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
                <span>1.2k shares</span>
              </div>

              {/* Action Buttons */}
              <div className="post-actions">
                <button 
                  className="action-btn"
                  onClick={() => handleLike(post.id, post.likes)}
                >
                  <Heart 
                    size={24} 
                    fill={post.likes?.includes(currentUser?.uid) ? '#ef4444' : 'none'}
                  />
                  Like
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleOpenComments(post.id, {
                    userId: post.userId,
                    displayName: post.userDisplayName,
                    photoURL: post.userPhotoURL
                  })}
                >
                  <MessageCircle size={24} />
                  Comment
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleShare(post, false)}
                >
                  <Share2 size={24} />
                  Share
                </button>
              </div>
            </div>
            
            {/* Show Star Moments after every 5 posts */}
            {(index + 1) % 5 === 0 && (
              <div className="reels-section">
                <div className="reels-header">
                  <Camera size={26} />
                  <h2>Star Moments</h2>
                </div>
                
                <div className="reels-grid">
                  {reels.length > 0 ? reels.slice(0, 4).map((reel, reelIndex) => (
                    <div 
                      key={reel.id} 
                      className="reel-item"
                      onClick={() => handleReelClick(reelIndex)}
                    >
                      {reel.videoUrl ? (
                        <video 
                          src={reel.videoUrl} 
                          className="reel-video"
                          muted
                          poster={reel.thumbnail}
                        />
                      ) : (
                        <div className="reel-placeholder">🎥</div>
                      )}
                      <div className="reel-overlay">
                        <span>{reel.userDisplayName}</span>
                      </div>
                    </div>
                  )) : (
                    // Placeholder star moments
                    Array.from({length: 4}).map((_, reelIndex) => (
                      <div key={reelIndex} className="reel-item">
                        <div className="reel-placeholder">🎥</div>
                        <div className="reel-overlay">
                          <span>Sample Star Moment {reelIndex + 1}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Fragment>
        )) : (
          // Sample posts when no Firebase posts exist
          <div className="sample-posts">
            <div className="post-item">
              <div className="post-header">
                <UserAvatar size={40} userName="HARIS CHANDRA" />
                <div className="post-user-info">
                  <div className="post-username">HARIS CHANDRA</div>
                  <div className="post-timestamp">16 JULY</div>
                </div>
                <button className="follow-button">Follow</button>
                <MoreHorizontal size={16} />
              </div>
              <div className="post-media">
                <PlaceholderImage />
              </div>
              <div className="post-stats">
                <span>20k likes</span>
                <span>2021 comments</span>
                <span>1.27k shares</span>
              </div>
              <div className="post-actions">
                <button className="action-btn">
                  <Heart size={24} />
                  Like
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleOpenComments('sample-post-1', {
                    userId: 'sample-user',
                    displayName: 'HARIS CHANDRA',
                    photoURL: null
                  })}
                >
                  <MessageCircle size={24} />
                  Comment
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleShare({
                    userDisplayName: 'HARIS CHANDRA',
                    caption: 'Sample post content'
                  }, false)}
                >
                  <Share2 size={24} />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Instagram-style Story Viewer */}
      {showStoryViewer && selectedStory && (
        <StoryViewer 
          story={selectedStory} 
          onClose={closeStoryViewer}
          currentUser={currentUser}
        />
      )}

      {/* Comment Drawer */}
      <CommentDrawer
        isOpen={commentDrawer.isOpen}
        onClose={handleCloseComments}
        postId={commentDrawer.postId}
        postAuthor={commentDrawer.postAuthor}
      />

      {/* Reel Viewer */}
      {reelViewer.isOpen && (
        <ReelViewer 
          reels={reels}
          currentIndex={reelViewer.currentReelIndex}
          onClose={handleCloseReelViewer}
          currentUser={currentUser}
          onLike={handleReelLike}
          onComment={handleReelComment}
          onShare={handleShare}
          setReels={setReels}
        />
      )}

      {/* Reel Comment Drawer */}
      <CommentDrawer
        isOpen={reelCommentDrawer.isOpen}
        onClose={handleCloseReelComments}
        postId={reelCommentDrawer.postId}
        postAuthor={reelCommentDrawer.postAuthor}
      />
    </div>
  );
};

// Instagram-style Story Viewer Component
const StoryViewer = ({ story, onClose, currentUser }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStoryItem = story.stories[currentStoryIndex];
  const storyDuration = currentStoryItem?.mediaType === 'video' ? 15000 : 5000; // 15s for video, 5s for image

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < story.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            return 0;
          } else {
            // Close story viewer when all stories are done
            onClose();
            return 100;
          }
        }
        return prev + (100 / (storyDuration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStoryIndex, story.stories.length, storyDuration, isPaused, onClose]);

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < story.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  if (!currentStoryItem) return null;

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer">
        {/* Progress bars */}
        <div className="story-progress-container">
          {story.stories.map((_, index) => (
            <div key={index} className="story-progress-bar">
              <div 
                className="story-progress-fill"
                style={{
                  width: index < currentStoryIndex ? '100%' : 
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story header */}
        <div className="story-header">
          <div className="story-user-info">
            <UserAvatar 
              src={story.userAvatar} 
              size={32} 
              userName={story.userName} 
            />
            <span className="story-username">{story.userName}</span>
            <span className="story-time">
              {currentStoryItem.timestamp?.toDate ? 
                formatTimeAgo(currentStoryItem.timestamp.toDate()) : 
                'now'
              }
            </span>
          </div>
          <button className="story-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Story content */}
        <div 
          className="story-content"
          onMouseDown={handlePause}
          onMouseUp={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        >
          {currentStoryItem.mediaType === 'video' ? (
            <video
              src={currentStoryItem.mediaUrl}
              className="story-media"
              autoPlay
              muted
              loop={false}
              onEnded={handleNext}
            />
          ) : (
            <img
              src={currentStoryItem.mediaUrl}
              alt="Story"
              className="story-media"
            />
          )}

          {/* Caption */}
          {currentStoryItem.caption && (
            <div className="story-caption">
              <p>{currentStoryItem.caption}</p>
            </div>
          )}
        </div>

        {/* Navigation areas */}
        <div className="story-nav-left" onClick={handlePrevious} />
        <div className="story-nav-right" onClick={handleNext} />
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'now';
  if (diffInHours === 1) return '1h';
  return `${diffInHours}h`;
};

// Instagram-style Star Moments Viewer Component
const ReelViewer = ({ reels, currentIndex, onClose, currentUser, onLike, onComment, onShare, setReels }) => {
  const [currentReelIndex, setCurrentReelIndex] = useState(currentIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = React.useRef(null);
  const videoRefs = React.useRef({});

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  useEffect(() => {
    setCurrentReelIndex(currentIndex);
  }, [currentIndex]);

  // Auto-play current video and pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, videoRef]) => {
      if (videoRef) {
        if (parseInt(index) === currentReelIndex) {
          videoRef.currentTime = 0;
          videoRef.play().catch(console.error);
        } else {
          videoRef.pause();
        }
      }
    });
  }, [currentReelIndex]);

  // Handle scroll navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout;

    const handleScroll = () => {
      if (isScrolling) return;
      
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;
      const newIndex = Math.round(scrollTop / containerHeight);
      
      if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReelIndex(newIndex);
      }

      // Clear timeout if it exists
      clearTimeout(scrollTimeout);
      
      // Set timeout to detect end of scrolling
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // Snap to nearest reel
        const snapIndex = Math.round(scrollTop / containerHeight);
        container.scrollTo({
          top: snapIndex * containerHeight,
          behavior: 'smooth'
        });
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentReelIndex, reels.length]);

  // Touch handlers for swipe navigation
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && currentReelIndex < reels.length - 1) {
      // Swipe up - next reel
      scrollToReel(currentReelIndex + 1);
    }
    
    if (isDownSwipe && currentReelIndex > 0) {
      // Swipe down - previous reel
      scrollToReel(currentReelIndex - 1);
    }
  };

  const scrollToReel = (index) => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerHeight = container.clientHeight;
    container.scrollTo({
      top: index * containerHeight,
      behavior: 'smooth'
    });
    setCurrentReelIndex(index);
  };

  // Handle video click to play/pause
  const handleVideoClick = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };


  // Handle mute toggle
  const toggleMute = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
    }
  };

  if (!reels || reels.length === 0) return null;

  return (
    <div className="star-moments-overlay">
      <div 
        className="star-moments-container"
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {reels.map((reel, index) => (
          <div key={reel.id || index} className="star-moment-item">
            {/* Video */}
            <video
              ref={(el) => videoRefs.current[index] = el}
              src={reel.videoUrl || reel.mediaUrl}
              className="star-moment-video"
              loop
              muted
              playsInline
              onClick={() => handleVideoClick(index)}
              onEnded={() => {
                if (index < reels.length - 1) {
                  scrollToReel(index + 1);
                } else {
                  onClose();
                }
              }}
            />

            {/* User Info */}
            <div className="star-moment-user-info">
              <div className="star-moment-user-details">
                <UserAvatar 
                  src={reel.userPhotoURL} 
                  size={40} 
                  userName={reel.userDisplayName || 'Unknown User'} 
                />
                <div className="star-moment-user-text">
                  <span className="star-moment-username">
                    {reel.userDisplayName || 'Unknown User'}
                  </span>
                  {reel.caption && (
                    <p className="star-moment-caption">{reel.caption}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="star-moment-actions">
              <button 
                className="star-moment-action-btn"
                onClick={() => onLike && onLike(reel)}
              >
                <Heart 
                  size={28} 
                  fill={reel.likes?.includes(currentUser?.uid) ? '#ff3040' : 'none'}
                  color="white"
                />
                <span>{reel.likes?.length || 0}</span>
              </button>
              
              <button 
                className="star-moment-action-btn"
                onClick={() => onComment && onComment(reel)}
              >
                <MessageCircle size={28} color="white" />
                <span>{reel.comments?.length || 0}</span>
              </button>
              
              <button 
                className="star-moment-action-btn"
                onClick={() => onShare && onShare(reel, true)}
              >
                <Share2 size={28} color="white" />
              </button>

              <button 
                className="star-moment-action-btn"
                onClick={() => toggleMute(index)}
              >
                🔇
              </button>
            </div>

            {/* Play/Pause indicator */}
            <div 
              className="star-moment-play-indicator"
              onClick={() => handleVideoClick(index)}
            >
              <div className="play-pause-btn">
                {videoRefs.current[index]?.paused ? '▶️' : '⏸️'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Close button */}
      <button className="star-moments-close-btn" onClick={onClose}>
        ×
      </button>

      {/* Progress indicator */}
      <div className="star-moments-progress">
        {reels.map((_, index) => (
          <div 
            key={index}
            className={`progress-dot ${index === currentReelIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AmaPlayerHomePage;