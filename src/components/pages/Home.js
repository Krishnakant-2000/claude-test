import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { Heart, MessageCircle, Video, Send, Trash2 } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import VideoPlayer from '../common/VideoPlayer';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import './Home.css';
import FooterNav from '../layout/FooterNav';
import { samplePosts } from '../../data/samplePosts';
import UploadDebugger from '../common/UploadDebugger';
import APITester from '../common/APITester';

export default function Home() {
  const { currentUser, logout, isGuest } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
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
      alert('Please sign up or log in to comment on posts');
      return;
    }

    try {
      const commentData = {
        text: commentText,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        userPhotoURL: currentUser.photoURL || '',
        timestamp: serverTimestamp(),
        postId: postId
      };

      // Add comment to comments collection
      await addDoc(collection(db, 'comments'), commentData);

      // Update post's comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });

      // Clear input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));

    } catch (error) {
      console.error('Error adding comment:', error);
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

      // Remove comment from post
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayRemove(commentToDelete)
      });

    } catch (error) {
      console.error('Error deleting comment:', error);
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
            {isGuest() && <span className="guest-indicator">Guest Mode</span>}
            <button onClick={handleLogout}>{isGuest() ? 'Sign In' : t('logout')}</button>
          </div>
        </div>
      </nav>

      <div className="main-content home-content">

        <div className="posts-feed">
          {posts.map((post) => (
            <div key={post.id} className="post">
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
                  disabled={!post.id} // Only disable for sample posts
                >
                  <Heart size={20} fill={post.likes?.includes(currentUser.uid) ? '#e74c3c' : 'none'} />
                  <span>{post.likes?.length || 0}</span>
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
              
              <div className="post-caption">
                <strong>{post.userDisplayName}</strong> {post.caption}
              </div>

              {/* Comments Section */}
              {showComments[post.id] && post.id && (
                <div className="comments-section">
                  {/* Existing Comments */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="comments-list">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="comment">
                          <div className="comment-avatar">
                            <img 
                              src={comment.userPhotoURL || 'https://via.placeholder.com/32/2d3748/00ff88?text=👤'} 
                              alt={comment.userDisplayName}
                            />
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <strong>{comment.userDisplayName}</strong>
                              <span className="comment-time">
                                {comment.timestamp ? (
                                  comment.timestamp?.toDate ? 
                                    comment.timestamp.toDate().toLocaleDateString() : 
                                    (comment.timestamp instanceof Date ? 
                                      comment.timestamp.toLocaleDateString() :
                                      new Date(comment.timestamp).toLocaleDateString()
                                    )
                                ) : 'now'}
                              </span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                          {comment.userId === currentUser.uid && (
                            <button 
                              className="delete-comment-btn"
                              onClick={() => handleDeleteComment(post.id, index)}
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  {!isGuest() ? (
                    <form 
                      className="comment-form"
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                    >
                      <div className="comment-input-container">
                        <img 
                          src={currentUser.photoURL || 'https://via.placeholder.com/32/2d3748/00ff88?text=👤'} 
                          alt="Your avatar"
                          className="comment-avatar"
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