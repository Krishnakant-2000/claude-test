import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Home.css';
import FooterNav from './FooterNav';
import { samplePosts } from '../data/samplePosts';

export default function Home() {
  const { currentUser, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ caption: '', image: null });
  const [uploading, setUploading] = useState(false);
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
      setNewPost({ ...newPost, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.image || !newPost.caption) return;

    setUploading(true);
    try {
      const imageRef = ref(storage, `posts/${Date.now()}-${newPost.image.name}`);
      await uploadBytes(imageRef, newPost.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'posts'), {
        caption: newPost.caption,
        imageUrl,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName,
        timestamp: new Date(),
        likes: [],
        comments: []
      });

      setNewPost({ caption: '', image: null });
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error('Error creating post:', error);
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
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="main-content home-content">
        <div className="create-post">
          <h2>Create New Post</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="What's on your mind?"
              value={newPost.caption}
              onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="file-input"
              required
            />
            <button type="submit" disabled={uploading}>
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>

        <div className="posts-feed">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <h3>{post.userDisplayName}</h3>
                <span className="post-time">
                  {post.timestamp?.toDate().toLocaleDateString()}
                </span>
              </div>
              <img src={post.imageUrl} alt={post.caption} className="post-image" />
              <div className="post-actions">
                <button 
                  onClick={() => handleLike(post.id, post.likes || [])}
                  className={post.likes?.includes(currentUser.uid) ? 'liked' : ''}
                >
                  ❤️ {post.likes?.length || 0}
                </button>
                <button>💬 {post.comments?.length || 0}</button>
              </div>
              <div className="post-caption">
                <strong>{post.userDisplayName}</strong> {post.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}