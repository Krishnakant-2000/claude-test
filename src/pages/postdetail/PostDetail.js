import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/api/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Heart, MessageCircle, ArrowLeft, Video, Send, Trash2 } from 'lucide-react';
import ThemeToggle from '../../components/common/ui/ThemeToggle';
import LanguageSelector from '../../components/common/forms/LanguageSelector';
import VideoPlayer from '../../components/common/media/VideoPlayer';
import LazyImage from '../../components/common/ui/LazyImage';
import notificationService from '../../services/notificationService';
import { filterChatMessage, getChatViolationMessage, logChatViolation } from '../../utils/content/chatFilter';
import FooterNav from '../../components/layout/FooterNav';
import './PostDetail.css';
import { cleanupPostComments } from '../../utils/data/cleanupPosts';
import { SafeCommentsList } from '../../components/common/safety/SafeComment';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isGuest } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📱 Loading post:', postId);
      
      // Clean up corrupted comments for this specific post
      await cleanupPostComments(postId);
      
      const postDoc = await getDoc(doc(db, 'posts', postId));
      
      if (postDoc.exists()) {
        const postData = { id: postDoc.id, ...postDoc.data() };
        
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
        
        console.log('📱 Post loaded:', postData);
        
        // Debug media URLs
        console.log('📱 Media URLs:', {
          mediaUrl: postData.mediaUrl,
          imageUrl: postData.imageUrl,
          videoUrl: postData.videoUrl,
          mediaType: postData.mediaType
        });
        
        setPost(postData);
      } else {
        console.error('❌ Post not found:', postId);
        setError('Post not found');
      }
    } catch (error) {
      console.error('❌ Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser || !post || isLiking) return;

    setIsLiking(true);
    const postRef = doc(db, 'posts', post.id);
    const currentLikes = post.likes || [];
    const userLiked = currentLikes.includes(currentUser.uid);

    try {
      if (userLiked) {
        // Remove like
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
        setPost(prev => ({
          ...prev,
          likes: prev.likes.filter(uid => uid !== currentUser.uid)
        }));
      } else {
        // Add like
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
        setPost(prev => ({
          ...prev,
          likes: [...(prev.likes || []), currentUser.uid]
        }));
        
        // Send notification to post owner (only when liking, not unliking)
        if (post.userId && post.userId !== currentUser.uid) {
          try {
            console.log('🔔 Sending like notification to:', post.userId);
            await notificationService.sendLikeNotification(
              currentUser.uid,
              currentUser.displayName || 'Someone',
              currentUser.photoURL || '',
              post.userId,
              post.id,
              post
            );
          } catch (notificationError) {
            console.error('Error sending like notification:', notificationError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const commentText = newComment.trim();
    
    if (!commentText || !currentUser || isCommenting) return;

    setIsCommenting(true);

    // Prevent guests from commenting
    if (isGuest()) {
      setIsCommenting(false);
      if (window.confirm('Please sign up or log in to comment on posts.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }

    // Content filtering for comments
    const filterResult = filterChatMessage(commentText);
    
    if (!filterResult.isClean) {
      const violationMessage = getChatViolationMessage(filterResult.violations, filterResult.categories);
      
      // Log the violation
      await logChatViolation(currentUser.uid, commentText, filterResult.violations, 'comment');
      
      // Show user-friendly error message
      alert(`You can't post this comment.\n\n${violationMessage}\n\nTip: Share positive sports content, training updates, or encouraging messages!`);
      setIsCommenting(false);
      return;
    }

    try {
      const commentData = {
        text: commentText,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        timestamp: new Date(),
        postId: post.id
      };

      // Update post's comment array
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });

      // Update local state
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), commentData]
      }));

      // Clear input
      setNewComment('');

      // Send notification to post owner (only if commenting on someone else's post)
      if (post.userId && post.userId !== currentUser.uid) {
        try {
          console.log('🔔 Sending comment notification to:', post.userId);
          await notificationService.sendCommentNotification(
            currentUser.uid,
            currentUser.displayName || 'Someone',
            currentUser.photoURL || '',
            post.userId,
            post.id,
            commentText,
            post
          );
        } catch (notificationError) {
          console.error('Error sending comment notification:', notificationError);
        }
      }

    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    if (!currentUser || !post) return;

    try {
      const commentToDelete = post.comments[commentIndex];
      
      // Only allow users to delete their own comments
      if (commentToDelete.userId !== currentUser.uid) {
        alert('You can only delete your own comments');
        return;
      }

      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        comments: arrayRemove(commentToDelete)
      });

      // Update local state
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter((_, index) => index !== commentIndex)
      }));

    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="post-detail">
        <nav className="nav-bar">
          <div className="nav-content">
            <button onClick={() => navigate(-1)} className="back-btn">
              <ArrowLeft size={20} />
              Back
            </button>
            <h1>Post</h1>
            <div className="nav-links">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </nav>
        
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Loading post...</span>
          </div>
        </div>
        
        <FooterNav />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail">
        <nav className="nav-bar">
          <div className="nav-content">
            <button onClick={() => navigate(-1)} className="back-btn">
              <ArrowLeft size={20} />
              Back
            </button>
            <h1>Post</h1>
            <div className="nav-links">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </nav>
        
        <div className="main-content">
          <div className="error-container">
            <h2>Post Not Found</h2>
            <p>The post you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/home')} className="home-btn">
              Go to Home
            </button>
          </div>
        </div>
        
        <FooterNav />
      </div>
    );
  }

  const effectiveLikes = post.likes || [];
  const userLiked = effectiveLikes.includes(currentUser?.uid);

  return (
    <div className="post-detail">
      <nav className="nav-bar">
        <div className="nav-content">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>Post</h1>
          <div className="nav-links">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="main-content post-detail-content">
        <div className="post-detail-container">
          <div className="post">
            <div className="post-header">
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
            
            {/* Media Display */}
            <div className="post-media">
              {(post.mediaType === 'video' || post.videoUrl) ? (
                <div className="post-video-container">
                  <VideoPlayer 
                    src={post.mediaUrl || post.videoUrl}
                    poster={post.mediaMetadata?.thumbnail}
                    controls={true}
                    className="post-video"
                    videoId={`post-${post.id}`}
                    autoPauseOnScroll={false}
                  />
                </div>
              ) : (
                <div className="post-image-container">
                  <LazyImage 
                    src={post.mediaUrl || post.imageUrl} 
                    alt={post.caption || 'Post image'} 
                    className="post-image"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="post-actions">
              <button 
                onClick={handleLike}
                className={userLiked ? 'liked' : ''}
                disabled={!currentUser || isLiking}
              >
                <Heart 
                  size={20} 
                  fill={userLiked ? '#e74c3c' : 'none'}
                  color={userLiked ? '#e74c3c' : 'currentColor'}
                  className={userLiked ? 'heart-liked' : ''}
                />
                <span>{effectiveLikes.length}</span>
                {isLiking && <span style={{marginLeft: '5px'}}>...</span>}
              </button>
              <button className="active">
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

            {/* Comments Section */}
            <div className="comments-section">
              {/* Safe Comments List */}
              <SafeCommentsList
                comments={post.comments || []}
                currentUserId={currentUser?.uid}
                onDelete={(index, commentId) => handleDeleteComment(index)}
                context={`post-detail-${post.id}`}
                emptyMessage="No comments yet. Be the first to comment!"
              />

              {/* Add Comment Form */}
              {!isGuest() ? (
                <form 
                  className="comment-form"
                  onSubmit={handleCommentSubmit}
                >
                  <div className="comment-input-container">
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
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-input"
                      disabled={isCommenting}
                    />
                    <button 
                      type="submit"
                      className="comment-submit-btn"
                      disabled={!newComment.trim() || isCommenting}
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
          </div>
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}