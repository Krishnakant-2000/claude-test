// Comment modal for posts with lazy loading
import React, { memo, useState, useCallback, useEffect } from 'react';
import { X, Send, Heart, MoreHorizontal, User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import LazyImage from '../ui/LazyImage';
import './Modal.css';

const CommentModal = memo(({ post, onClose }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Firebase functions for real-time comments
  const fetchComments = useCallback((postId) => {
    if (!postId) return;

    // Temporary: Use simple query while index is building  
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = [];
      
      for (const docSnap of snapshot.docs) {
        const commentData = { id: docSnap.id, ...docSnap.data() };
        
        // Fetch user data for each comment if not already included
        if (!commentData.userPhotoURL && commentData.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentData.userPhotoURL = userData.photoURL;
              commentData.userDisplayName = userData.displayName || commentData.userDisplayName;
            }
          } catch (error) {
            console.log('Could not fetch user data for comment');
          }
        }
        
        commentsData.push(commentData);
      }
      
      // Sort comments by timestamp in memory while index is building
      commentsData.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA; // Descending order (newest first)
      });
      
      setComments(commentsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const submitComment = useCallback(async (postId, text) => {
    if (!currentUser || !text.trim()) return;
    
    try {
      const newCommentRef = await addDoc(collection(db, 'comments'), {
        postId: postId,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        text: text.trim(),
        timestamp: serverTimestamp(),
        likes: [],
        likesCount: 0
      });

      // Notify post author if it's not their own comment
      if (currentUser.uid !== post?.userId) {
        try {
          await addDoc(collection(db, 'notifications'), {
            type: 'comment',
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Anonymous User',
            receiverId: post?.userId,
            postId: postId,
            message: `${currentUser.displayName || 'Someone'} commented on your post`,
            timestamp: serverTimestamp(),
            read: false
          });
        } catch (error) {
          console.log('Could not send notification');
        }
      }

        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        text: text.trim(),
        timestamp: serverTimestamp(),
        likes: [],
        likesCount: 0
      };
      
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, [currentUser, post]);

  const likeComment = useCallback(async (commentId, liked) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, liked };
  }, []);

  // Load comments with real-time updates
  useEffect(() => {
    if (!post?.id) return;
    
    setLoading(true);
    const unsubscribe = fetchComments(post.id);
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [post?.id, fetchComments]);

  // Handle comment submission
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !currentUser) return;

    try {
      setSubmitting(true);
      await submitComment(post.id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [newComment, submitting, post.id, submitComment, currentUser]);

  // Handle comment like
  const handleLikeComment = useCallback(async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const newLiked = !comment.isLiked;
    
    // Optimistic update
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: newLiked, likesCount: newLiked ? c.likesCount + 1 : c.likesCount - 1 }
        : c
    ));

    try {
      await likeComment(commentId, newLiked);
    } catch (error) {
      // Revert on error
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, isLiked: !newLiked, likesCount: newLiked ? c.likesCount - 1 : c.likesCount + 1 }
          : c
      ));
      console.error('Error liking comment:', error);
    }
  }, [comments, likeComment]);

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return 'Now';
    
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>Comments</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Post Preview */}
        <div className="post-preview">
          <div className="user-info">
            <LazyImage
              src={post.userPhotoURL}
              alt={post.userDisplayName}
              className="user-avatar small"
              placeholder="/default-avatar.jpg"
            />
            <div className="user-details">
              <h4>{post.userDisplayName}</h4>
              <span className="post-time">{formatTime(post.timestamp)}</span>
            </div>
          </div>
          {post.caption && <p className="post-caption">{post.caption}</p>}
        </div>

        {/* Comments List */}
        <div className="comments-container">
          {loading ? (
            <div className="loading-comments">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="comment-skeleton">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-content">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <LazyImage
                    src={comment.userPhotoURL}
                    alt={comment.userDisplayName}
                    className="comment-avatar"
                    placeholder="/default-avatar.jpg"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <h5 className="comment-author">{comment.userDisplayName}</h5>
                      <span className="comment-time">{formatTime(comment.timestamp)}</span>
                      <button className="comment-options">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-actions">
                      <button 
                        className={`comment-like ${comment.isLiked ? 'liked' : ''}`}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart size={14} fill={comment.isLiked ? '#e91e63' : 'none'} />
                        {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                      </button>
                      <button className="comment-reply">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-comments">
              <div className="empty-icon">
                <User size={48} />
              </div>
              <h4>No comments yet</h4>
              <p>Be the first to comment on this post!</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        {currentUser && (
          <form className="comment-form" onSubmit={handleSubmitComment}>
            <LazyImage
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="user-avatar small"
              placeholder="/default-avatar.jpg"
            />
            <div className="comment-input-container">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                maxLength={500}
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? (
                  <div className="loading-spinner small" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        )}

        {!currentUser && (
          <div className="guest-comment-notice">
            <p>Sign in to join the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default CommentModal;