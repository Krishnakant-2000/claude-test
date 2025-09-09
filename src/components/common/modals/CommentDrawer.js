import React, { useState, useEffect, useRef } from 'react';
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
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { X, Send, MessageCircle, Heart } from 'lucide-react';
import './CommentDrawer.css';

const CommentDrawer = ({ isOpen, onClose, postId, postAuthor }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Auto-focus input when drawer opens
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Fetch comments in real-time
  useEffect(() => {
    if (!isOpen || !postId) return;

    setLoading(true);
    
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
        return timeA - timeB; // Ascending order (oldest first)
      });
      
      setComments(commentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, postId]);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser || submitting) return;

    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'comments'), {
        postId: postId,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        text: newComment.trim(),
        timestamp: serverTimestamp(),
        likes: [],
        likesCount: 0
      });

      setNewComment('');
      
      // Notify post author if it's not their own comment
      if (currentUser.uid !== postAuthor?.userId) {
        try {
          await addDoc(collection(db, 'notifications'), {
            type: 'comment',
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Anonymous User',
            receiverId: postAuthor?.userId,
            postId: postId,
            message: `${currentUser.displayName || 'Someone'} commented on your post`,
            timestamp: serverTimestamp(),
            read: false
          });
        } catch (error) {
          console.log('Could not send notification');
        }
      }
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to post comment. Please try again.');
    }
    
    setSubmitting(false);
  };

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      alert('Please log in to like comments');
      return;
    }

    console.log('Like comment:', commentId);
    
    try {
      const commentRef = doc(db, 'comments', commentId);
      const comment = comments.find(c => c.id === commentId);
      
      if (!comment) return;
      
      const userLiked = comment.likes?.includes(currentUser.uid) || false;
      
      if (userLiked) {
        // Unlike - remove user from likes array
        await updateDoc(commentRef, {
          likes: arrayRemove(currentUser.uid),
          likesCount: Math.max(0, (comment.likesCount || 0) - 1)
        });
      } else {
        // Like - add user to likes array  
        await updateDoc(commentRef, {
          likes: arrayUnion(currentUser.uid),
          likesCount: (comment.likesCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Close drawer
  const handleClose = () => {
    setNewComment('');
    onClose();
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="comment-drawer-overlay" onClick={handleClose}>
      <div className="comment-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="comment-drawer-header">
          <div className="header-title">
            <MessageCircle size={20} />
            <h3>Comments ({comments.length})</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="comments-container">
          {loading ? (
            <div className="comments-loading">
              <div className="loading-spinner"></div>
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="no-comments">
              <MessageCircle size={48} />
              <h4>No comments yet</h4>
              <p>Be the first to comment on this post!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.userPhotoURL ? (
                      <img 
                        src={comment.userPhotoURL} 
                        alt={comment.userDisplayName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-placeholder"
                      style={{ 
                        display: comment.userPhotoURL ? 'none' : 'flex'
                      }}
                    >
                      👤
                    </div>
                  </div>
                  
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.userDisplayName || 'Anonymous User'}
                      </span>
                      <span className="comment-timestamp">
                        {comment.timestamp?.toDate ? 
                          comment.timestamp.toDate().toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'Now'
                        }
                      </span>
                    </div>
                    
                    <div className="comment-text">
                      {comment.text}
                    </div>
                    
                    <div className="comment-actions">
                      <button 
                        className={`comment-like-btn ${comment.likes?.includes(currentUser?.uid) ? 'liked' : ''}`}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart 
                          size={14} 
                          fill={comment.likes?.includes(currentUser?.uid) ? '#ef4444' : 'none'}
                          color={comment.likes?.includes(currentUser?.uid) ? '#ef4444' : 'currentColor'}
                        />
                        {comment.likesCount > 0 && (
                          <span>{comment.likesCount}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="comment-input-container">
          <div className="current-user-avatar">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="You" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          
          <form onSubmit={handleSubmitComment} className="comment-form">
            <input
              ref={commentInputRef}
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting || !currentUser}
              maxLength={500}
            />
            
            <button 
              type="submit" 
              disabled={!newComment.trim() || submitting || !currentUser}
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {!currentUser && (
          <div className="login-prompt">
            <p>Please log in to comment on this post</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentDrawer;