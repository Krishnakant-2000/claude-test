import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { Heart, MessageCircle, Share2, MoreHorizontal, Search, Menu, Camera, Plus } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import './FigmaHome.css';

// Placeholder SVG components
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

const PlaceholderImage = ({ width = 440, height = 262 }) => (
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
      color: '#94a3b8'
    }}
  >
    📷
  </div>
);

export const AmaPlayerHomePage = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

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
        console.log('Post data:', data); // Debug log
        // Only add non-video posts to main feed
        if (!data.videoUrl) {
          postsData.push(data);
        }
      });
      
      console.log('Filtered posts for feed:', postsData); // Debug log
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
        // Only add video posts to reels
        if (data.videoUrl) {
          reelsData.push(data);
        }
      });
      
      setReels(reelsData);
    } catch (error) {
      console.error('Error loading reels:', error);
    }
  };

  // Load stories (mock data for now)
  const loadStories = () => {
    const mockStories = [
      { id: 'your-story', name: 'Your Story', avatar: null, isOwn: true },
      { id: '1', name: 'Daisy Nicolas', avatar: null },
      { id: '2', name: 'Anil Kumble', avatar: null },
      { id: '3', name: 'Harpreet Kaur', avatar: null },
      { id: '4', name: 'Abhi jaiswal', avatar: null },
      { id: '5', name: 'Karan Sharma', avatar: null },
      { id: '6', name: 'Jyotika Verma', avatar: null },
    ];
    setStories(mockStories);
  };

  useEffect(() => {
    loadPosts();
    loadReels();
    loadStories();
  }, []);

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
    <div className="ama-player-home-page">
      <div className="div">
        {/* Header */}
        <div className="text-wrapper-2">Ama Player</div>
        
        {/* Search and Menu Icons */}
        <div className="mdi-search">
          <Search size={28} onClick={() => navigate('/search')} />
        </div>
        
        <div className="group-wrapper">
          <Menu size={25} />
        </div>

        {/* User Avatar and Post Composer */}
        <PlaceholderAvatar size={60} />
        
        <div className="what-s-on-your-mind-wrapper" onClick={() => navigate('/add-post')}>
          <p className="what-s-on-your-mind">What's on your mind?</p>
        </div>

        <div className="streamline-plump">
          <div className="group">
            <div className="overlap-group-2">
              <Camera size={30} />
            </div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="rectangle-2" />
        
        {stories.map((story, index) => (
          <div key={story.id} className={`overlap-${index + 2}`}>
            <div className={`text-wrapper-${index + 3}`}>{story.name}</div>
            <PlaceholderAvatar size={15} />
          </div>
        ))}

        {/* Posts Feed */}
        {posts.length > 0 ? posts.map((post, index) => (
          <div key={post.id}>
            {/* Post Header */}
            <PlaceholderAvatar size={40} />
            
            <div className={`text-wrapper-${10 + index}`}>
              {post.userDisplayName || 'Unknown User'}
            </div>
            
            <div className={`text-wrapper-${12 + index}`}>
              {post.timestamp?.toDate ? 
                post.timestamp.toDate().toLocaleDateString() : 
                'Recently'
              }
            </div>

            {/* Follow Button */}
            <div className="overlap">
              <div className="text-wrapper">Follow</div>
            </div>

            {/* Three Dots Menu */}
            <div className="ph-dots-three">
              <MoreHorizontal size={16} />
            </div>

            {/* Post Image */}
            {post.imageUrl ? (
              <img 
                className={`rectangle-${3 + index}`} 
                src={post.imageUrl} 
                alt="Post" 
              />
            ) : (
              <PlaceholderImage />
            )}

            {/* Like/Comment Stats */}
            <div className={`overlap-${11 + index}`}>
              <Heart size={18} fill={post.likes?.includes(currentUser?.uid) ? '#ef4444' : 'none'} />
            </div>
            
            <div className={`text-wrapper-${17 + index}`}>
              {post.likes?.length || 0}k
            </div>
            
            <div className={`text-wrapper-${20 + index}`}>+</div>
            
            <div className={`text-wrapper-${23 + index}`}>
              {post.comments?.length || 0} Comments
            </div>
            
            <div className={`text-wrapper-${26 + index}`}>
              1.27k Share
            </div>

            {/* Action Buttons */}
            <div className={`frame-${2 + index}`}>
              <div className="material-symbols">
                <Heart 
                  size={24} 
                  fill={post.likes?.includes(currentUser?.uid) ? '#ef4444' : 'none'}
                  onClick={() => handleLike(post.id, post.likes)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div className="text-wrapper-14">Like</div>

              <div className="material-symbols-2">
                <MessageCircle size={25} />
              </div>
              <div className="text-wrapper-15">Comment</div>

              <div className="bitcoin-icons-share">
                <Share2 size={18} />
              </div>
              <div className="text-wrapper-16">Share</div>
            </div>

            {/* Separator */}
            <div className={`rectangle-${6 + index}`} />
          </div>
        )) : (
          // Sample posts when no Firebase posts exist
          <div>
            {/* Sample Post 1 */}
            <PlaceholderAvatar size={40} />
            <div className="text-wrapper-10">HARIS CHANDRA</div>
            <div className="text-wrapper-12">16 JULY</div>
            
            <div className="overlap">
              <div className="text-wrapper">Follow</div>
            </div>
            
            <div className="ph-dots-three">
              <MoreHorizontal size={16} />
            </div>
            
            <PlaceholderImage />
            
            <div className="overlap-11">
              <Heart size={18} />
            </div>
            
            <div className="text-wrapper-17">20k</div>
            <div className="text-wrapper-20">+</div>
            <div className="text-wrapper-23">2021 Comments</div>
            <div className="text-wrapper-26">1.27 k Share</div>
            
            <div className="frame-2">
              <div className="material-symbols">
                <Heart size={24} />
              </div>
              <div className="text-wrapper-14">Like</div>
              
              <div className="material-symbols-2">
                <MessageCircle size={25} />
              </div>
              <div className="text-wrapper-15">Comment</div>
              
              <div className="bitcoin-icons-share">
                <Share2 size={18} />
              </div>
              <div className="text-wrapper-16">Share</div>
            </div>
            
            <div className="rectangle-6" />

            {/* Sample Post 2 */}
            <PlaceholderAvatar size={40} />
            <div className="text-wrapper-11">Harpreet Kaur</div>
            <div className="text-wrapper-13">21 JULY</div>
            
            <div className="overlap-group">
              <div className="text-wrapper">Follow</div>
            </div>
            
            <div className="vector-wrapper">
              <MoreHorizontal size={16} />
            </div>
            
            <PlaceholderImage />
            
            <div className="overlap-12">
              <Heart size={18} />
            </div>
            
            <div className="text-wrapper-18">20k</div>
            <div className="text-wrapper-21">+</div>
            <div className="text-wrapper-24">2021 Comments</div>
            <div className="text-wrapper-27">1.27 k Share</div>
            
            <div className="frame-3">
              <div className="material-symbols">
                <Heart size={24} />
              </div>
              <div className="text-wrapper-14">Like</div>
              
              <div className="material-symbols-2">
                <MessageCircle size={25} />
              </div>
              <div className="text-wrapper-15">Comment</div>
              
              <div className="bitcoin-icons-share">
                <Share2 size={18} />
              </div>
              <div className="text-wrapper-16">Share</div>
            </div>
            
            <div className="rectangle-7" />
          </div>
        )}

        {/* Reels Section */}
        <div className="bi-camera-reels-fill">
          <div className="group-2">
            <Camera size={26} />
          </div>
        </div>
        
        <div className="text-wrapper-29">Reels</div>
        
        {/* Reels Thumbnails - Show actual video reels */}
        <div className="reels-container">
          {reels.length > 0 ? reels.slice(0, 4).map((reel, index) => (
            <div key={reel.id} className={`reel-thumbnail reel-${index + 1}`}>
              {reel.videoUrl ? (
                <video 
                  src={reel.videoUrl} 
                  width={index === 3 ? 68 : 112} 
                  height={217}
                  muted
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              ) : (
                <PlaceholderImage width={index === 3 ? 68 : 112} height={217} />
              )}
            </div>
          )) : (
            // Fallback placeholder reels
            <>
              <PlaceholderImage width={112} height={217} />
              <PlaceholderImage width={112} height={217} />
              <PlaceholderImage width={112} height={217} />
              <PlaceholderImage width={68} height={217} />
            </>
          )}
        </div>
        
        <div className="rectangle-8" />
      </div>
    </div>
  );
};

export default AmaPlayerHomePage;