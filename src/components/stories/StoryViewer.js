// Story Viewer - Full-screen story viewing component with navigation
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StoriesService } from '../../firebase/storiesService';
import { X, Share, Heart, MessageCircle, MoreVertical, Download, Send } from 'lucide-react';
import StoryProgress from './StoryProgress';
import { db } from '../../firebase/firebase';
import { addDoc, collection, query, where, getDocs, deleteDoc, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function StoryViewer({ userStories, currentStoryIndex, onClose, onNavigate }) {
  const { currentUser } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [storyDuration, setStoryDuration] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const progressInterval = useRef();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const currentStory = useMemo(() => userStories.stories[currentStoryIndex], [userStories.stories, currentStoryIndex]);
  const isOwnStory = useMemo(() => currentStory?.userId === currentUser?.uid, [currentStory?.userId, currentUser?.uid]);
  const STORY_DURATION = useMemo(() => currentStory?.mediaType === 'video' ? 15000 : 5000, [currentStory?.mediaType]); // 15s for video, 5s for image

  useEffect(() => {
    if (!currentStory) return;

    // Record story view
    if (currentUser && !isOwnStory) {
      StoriesService.viewStory(currentStory.id, currentUser.uid);
    }

    // Load likes and comments
    loadStoryEngagement();

    // Reset duration and start progress
    setStoryDuration(0);
    startStoryProgress();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, currentStory, currentUser, isOwnStory]);

  const loadStoryEngagement = async () => {
    if (!currentStory) return;

    try {
      // Load likes
      setLikesCount(currentStory.likesCount || 0);
      if (currentUser) {
        setIsLiked(currentStory.likes?.includes(currentUser.uid) || false);
      }

      // Load comments
      const commentsQuery = query(
        collection(db, 'storyComments'),
        where('storyId', '==', currentStory.id)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const storyComments = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(storyComments);
    } catch (error) {
      console.error('Error loading story engagement:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUser || isOwnStory) return;

    try {
      const storyRef = doc(db, 'stories', currentStory.id);
      
      if (isLiked) {
        // Unlike
        await updateDoc(storyRef, {
          likes: arrayRemove(currentUser.uid),
          likesCount: increment(-1)
        });
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await updateDoc(storyRef, {
          likes: arrayUnion(currentUser.uid),
          likesCount: increment(1)
        });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);

        // Send notification to story owner
        await sendStoryLikeNotification();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const sendStoryLikeNotification = async () => {
    try {
      const notificationData = {
        type: 'story_like',
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous User',
        senderPhotoURL: currentUser.photoURL || '',
        receiverId: currentStory.userId,
        storyId: currentStory.id,
        storyMediaUrl: currentStory.mediaUrl,
        storyMediaType: currentStory.mediaType,
        storyThumbnail: currentStory.thumbnail || currentStory.mediaUrl,
        message: `${currentUser.displayName || 'Someone'} liked your story`,
        timestamp: new Date(),
        isRead: false
      };

      await addDoc(collection(db, 'notifications'), notificationData);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    
    try {
      const commentData = {
        storyId: currentStory.id,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        text: newComment.trim(),
        timestamp: new Date()
      };

      await addDoc(collection(db, 'storyComments'), commentData);
      
      // Add to local state
      setComments(prev => [...prev, { id: Date.now(), ...commentData }]);
      setNewComment('');
      console.log('✅ Comment submitted successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const startStoryProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    if (isPaused) return;

    progressInterval.current = setInterval(() => {
      setStoryDuration(prev => {
        if (prev >= STORY_DURATION) {
          clearInterval(progressInterval.current);
          // Auto-advance to next story
          setTimeout(() => onNavigate('next'), 100);
          return STORY_DURATION;
        }
        return prev + 100;
      });
    }, 100);
  }, [isPaused, STORY_DURATION, onNavigate]);

  useEffect(() => {
    if (isPaused) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      startStoryProgress();
    }
  }, [isPaused]);

  const handlePauseResume = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handlePrevious = useCallback(() => {
    onNavigate('prev');
  }, [onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate('next');
  }, [onNavigate]);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - next story
        handleNext();
      } else {
        // Swiped right - previous story
        handlePrevious();
      }
    }
  };

  const handleShare = async () => {
    if (!currentStory.sharingEnabled) {
      alert('Sharing is not enabled for this story');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${userStories.userDisplayName}'s Story`,
          text: currentStory.caption || 'Check out this story on AmaPlayer!',
          url: currentStory.publicLink
        });
      } else {
        // Fallback - copy link
        await navigator.clipboard.writeText(currentStory.publicLink);
        alert('Story link copied to clipboard!');
      }
      setShowShareMenu(false);
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const handleDownload = () => {
    if (isOwnStory) {
      // Download own story
      const link = document.createElement('a');
      link.href = currentStory.mediaUrl;
      link.download = `story-${currentStory.timestamp?.toDate?.()?.getTime() || Date.now()}.${currentStory.mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return 'now';
    
    const now = new Date();
    const storyTime = timestamp.toDate();
    const diffMs = now - storyTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'now';
    }
  };

  if (!currentStory) {
    return null;
  }

  return (
    <div className="story-viewer">
      <div className="story-viewer-backdrop" onClick={onClose}></div>
      
      <div 
        className="story-viewer-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Bars */}
        <StoryProgress
          stories={userStories.stories}
          currentIndex={currentStoryIndex}
          currentDuration={storyDuration}
          totalDuration={STORY_DURATION}
        />

        {/* Header */}
        <div className="story-viewer-header">
          <div className="story-user-info">
            <img 
              src={userStories.userPhotoURL || 'https://via.placeholder.com/40'} 
              alt={userStories.userDisplayName}
              className="story-user-avatar"
            />
            <div className="story-user-details">
              <span className="story-user-name">{userStories.userDisplayName}</span>
              <span className="story-timestamp">{formatTimestamp(currentStory.timestamp)}</span>
            </div>
          </div>

          <div className="story-header-actions">
            {isOwnStory && (
              <button className="story-action-btn" onClick={() => setShowInfo(!showInfo)}>
                <MoreVertical size={20} />
              </button>
            )}
            <button className="story-action-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="story-content" onClick={handlePauseResume}>
          {currentStory.mediaType === 'image' ? (
            <img 
              src={currentStory.mediaUrl} 
              alt="Story content"
              className="story-media"
            />
          ) : (
            <video 
              src={currentStory.mediaUrl}
              className="story-media"
              autoPlay
              muted
              loop={false}
              onEnded={handleNext}
            />
          )}

          {/* Navigation Areas */}
          <div className="story-nav-area story-nav-prev" onClick={handlePrevious}></div>
          <div className="story-nav-area story-nav-next" onClick={handleNext}></div>

          {/* Pause Indicator */}
          {isPaused && (
            <div className="story-pause-indicator">
              <div className="pause-icon">❚❚</div>
            </div>
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="story-caption">
            <p>{currentStory.caption}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="story-viewer-footer">
          <div className="story-actions">
            {!isOwnStory && (
              <>
                <button 
                  className={`story-action-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  <Heart size={24} fill={isLiked ? '#ff3040' : 'none'} />
                  {likesCount > 0 && <span className="action-count">{likesCount}</span>}
                </button>
                <button 
                  className="story-action-btn"
                  onClick={() => {
                    const newShowComments = !showComments;
                    setShowComments(newShowComments);
                    // Pause story when opening comments, resume when closing
                    setIsPaused(newShowComments);
                  }}
                >
                  <MessageCircle size={24} />
                  {comments.length > 0 && <span className="action-count">{comments.length}</span>}
                </button>
              </>
            )}
            
            {currentStory.sharingEnabled && (
              <button 
                className="story-action-btn"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share size={24} />
              </button>
            )}

            {isOwnStory && (
              <button className="story-action-btn" onClick={handleDownload}>
                <Download size={24} />
              </button>
            )}
          </div>

          {/* Story Info (Own Stories) */}
          {showInfo && isOwnStory && (
            <div className="story-info-panel">
              <div className="story-stats">
                <div className="stat-item">
                  <span className="stat-value">{currentStory.viewCount || 0}</span>
                  <span className="stat-label">Views</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userStories.stories.length}</span>
                  <span className="stat-label">Stories</span>
                </div>
              </div>
              
              {currentStory.viewers?.length > 0 && (
                <div className="story-viewers">
                  <h4>Viewed by:</h4>
                  <div className="viewers-list">
                    {currentStory.viewers.slice(0, 10).map(viewerId => (
                      <div key={viewerId} className="viewer-item">
                        👁️ {viewerId}
                      </div>
                    ))}
                    {currentStory.viewers.length > 10 && (
                      <div className="viewers-more">
                        +{currentStory.viewers.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Menu */}
          {showShareMenu && (
            <div className="story-share-menu">
              <button className="share-option" onClick={handleShare}>
                <Share size={16} />
                Share Link
              </button>
              <button className="share-option" onClick={() => alert('Coming soon!')}>
                📱 Share to Social
              </button>
              <button className="share-option" onClick={() => alert('Coming soon!')}>
                💾 Save to Highlights
              </button>
            </div>
          )}
        </div>

        {/* Comments Modal */}
        {showComments && (
          <div className="story-comments-modal">
            <div className="comments-header">
              <h4>Comments</h4>
              <button 
                className="close-comments-btn"
                onClick={() => {
                  setShowComments(false);
                  // Resume story when closing comments
                  setIsPaused(false);
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <img 
                      src={comment.userPhotoURL || '/default-avatar.png'} 
                      alt={comment.userDisplayName}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <strong>{comment.userDisplayName}</strong>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {currentUser && (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => {
                    // Pause story when user starts typing
                    setIsPaused(true);
                    console.log('🎥 Story paused - user is typing comment');
                  }}
                  onBlur={() => {
                    // Resume story when user stops typing (but only if comments modal is still open)
                    if (showComments && !newComment.trim()) {
                      setIsPaused(true); // Keep paused if comments modal is open
                    }
                    console.log('🎥 Comment input blurred');
                  }}
                  placeholder="Add a comment..."
                  maxLength={500}
                  disabled={isSubmittingComment}
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="send-comment-btn"
                >
                  <Send size={20} />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}