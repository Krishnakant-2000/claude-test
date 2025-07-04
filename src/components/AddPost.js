import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FooterNav from './FooterNav';
import './AddPost.css';

export default function AddPost() {
  const { currentUser } = useAuth();
  const [newPost, setNewPost] = useState({ caption: '', image: null });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
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
        userDisplayName: currentUser.displayName || 'Anonymous User',
        timestamp: new Date(),
        likes: [],
        comments: []
      });

      setNewPost({ caption: '', image: null });
      setPreview(null);
      navigate('/home');
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setUploading(false);
  };

  return (
    <div className="add-post">
      <nav className="nav-bar">
        <div className="nav-content">
          <button onClick={() => navigate('/home')} className="back-btn">Cancel</button>
          <h1>New Post</h1>
          <button 
            onClick={handleSubmit} 
            disabled={!newPost.image || !newPost.caption || uploading}
            className="share-btn"
          >
            {uploading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </nav>

      <div className="main-content add-post-content">
        <div className="post-form">
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
          
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="image-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload" className="upload-btn">
              {preview ? 'Change Photo' : 'Select Photo'}
            </label>
          </div>

          <textarea
            placeholder="Write a caption..."
            value={newPost.caption}
            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
            rows={4}
          />
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}