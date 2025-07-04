import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FooterNav from './FooterNav';
import './Profile.css';

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile({
          displayName: currentUser.displayName || 'User',
          email: currentUser.email,
          bio: '',
          followers: 0,
          following: 0,
          photoURL: currentUser.photoURL || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const userPosts = [];
      querySnapshot.forEach((doc) => {
        userPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      
      setProfile(prev => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setUploading(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>Profile</h1>
        </div>
      </nav>

      <div className="main-content profile-container">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={profile?.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="profile-image"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-upload"
              id="profile-image-upload"
            />
            <label htmlFor="profile-image-upload" className="upload-label">
              {uploading ? 'Uploading...' : 'Change Photo'}
            </label>
          </div>
          <div className="profile-info">
            <h1>{profile?.displayName}</h1>
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> posts</span>
              <span><strong>{profile?.followers || 0}</strong> followers</span>
              <span><strong>{profile?.following || 0}</strong> following</span>
            </div>
            <p className="profile-bio">{profile?.bio || 'No bio yet'}</p>
          </div>
        </div>
        
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-thumbnail">
              <img src={post.imageUrl} alt={post.caption} />
              <div className="post-overlay">
                <span>❤️ {post.likes || 0}</span>
                <span>💬 {post.comments || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}