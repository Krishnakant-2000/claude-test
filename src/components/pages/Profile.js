import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db, storage } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, addDoc, serverTimestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadVideoFile, generateVideoMetadata } from '../../firebase/videoService';
import { filterContent, getViolationMessage } from '../../utils/contentFilter';
import { Edit2, Camera, Plus, X, Save, Users, UserPlus, Check, Video, Trash2, Play } from 'lucide-react';
import FooterNav from '../layout/FooterNav';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import './Profile.css';

export default function Profile({ profileUserId = null }) {
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isGuest, updateUserProfile, refreshAuth } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [newCertificate, setNewCertificate] = useState({ name: '', date: '', description: '', fileUrl: '', fileName: '' });
  const [newAchievement, setNewAchievement] = useState({ title: '', date: '', description: '' });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followingUser, setFollowingUser] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [talentVideos, setTalentVideos] = useState([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  
  // Determine which user's profile we're viewing
  const targetUserId = urlUserId || profileUserId || currentUser?.uid;
  const isOwnProfile = targetUserId === currentUser?.uid;

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchUserPosts();
      fetchTalentVideos();
      if (!isGuest()) {
        fetchFollowedUsers();
        fetchSentRequests();
        fetchFriendships();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, targetUserId]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'users', targetUserId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setProfile(profileData);
        setCertificates(profileData.certificates || []);
        setAchievements(profileData.achievements || []);
      } else if (isOwnProfile) {
        // Create default profile data only for own profile
        const defaultProfile = {
          displayName: currentUser.displayName || 'User',
          email: currentUser.email,
          bio: '',
          followers: 0,
          following: 0,
          photoURL: currentUser.photoURL || '',
          name: '',
          age: '',
          height: '',
          weight: '',
          sex: '',
          role: 'athlete',
          certificates: [],
          achievements: []
        };
        
        setProfile(defaultProfile);
        
        // Save default profile to Firestore so user is searchable
        try {
          await setDoc(docRef, defaultProfile, { merge: true });
        } catch (error) {
          console.error('Error creating default profile:', error);
        }
      } else {
        // Profile not found for other user
        setProfile(null);
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
        where('userId', '==', targetUserId)
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

  const fetchTalentVideos = async () => {
    console.log('Fetching talent videos for user:', targetUserId);
    
    // Always add sample video as the first video
    const sampleVideo = {
      id: 'sample-video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      metadata: {
        duration: 596,
        durationFormatted: '9:56',
        thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217'
      },
      fileName: 'Sample_Talent_Video.mp4',
      userDisplayName: profile?.displayName || 'Demo User',
      likes: 45,
      views: 128,
      uploadedAt: new Date('2024-01-15'),
      isSample: true
    };
    
    try {
      let videos = [];
      
      // Only fetch user videos if we have a valid targetUserId
      if (targetUserId) {
        const q = query(
          collection(db, 'talentVideos'),
          where('userId', '==', targetUserId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          videos.push({ id: doc.id, ...doc.data() });
        });
      }
      
      // Add sample video first, then user videos
      const allVideos = [sampleVideo, ...videos];
      console.log('Setting talent videos:', allVideos);
      setTalentVideos(allVideos);
    } catch (error) {
      console.error('Error fetching talent videos:', error);
      // If there's an error, at least show the sample video
      console.log('Showing sample video only due to error');
      setTalentVideos([sampleVideo]);
    }
  };

  const handleVideoUpload = async (e) => {
    if (isGuest()) {
      if (window.confirm('Please sign up or log in to upload talent videos. Guest accounts have read-only access.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Check if user already has 7 videos
    if (talentVideos.length >= 7) {
      alert('You can only upload a maximum of 7 talent videos. Please delete some videos to upload new ones.');
      return;
    }

    setUploadingVideo(true);
    setVideoUploadProgress(0);
    setUploadTask(null);

    try {
      // Upload video using the video service
      const videoUrl = await uploadVideoFile(
        file,
        currentUser.uid,
        'talent-videos',
        (progress) => {
          setVideoUploadProgress(progress);
        },
        (task) => {
          setUploadTask(task);
        }
      );

      // Generate metadata
      const videoMetadata = await generateVideoMetadata(file, videoUrl, currentUser.uid);

      // Save to talentVideos collection
      const videoData = {
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous User',
        videoUrl,
        metadata: videoMetadata,
        fileName: file.name,
        uploadedAt: serverTimestamp(),
        likes: 0,
        views: 0
      };

      await addDoc(collection(db, 'talentVideos'), videoData);
      
      // Refresh the videos list
      fetchTalentVideos();
      
      alert('Talent video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    }

    setUploadingVideo(false);
    setVideoUploadProgress(0);
    setUploadTask(null);
  };

  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadingVideo(false);
      setVideoUploadProgress(0);
      setUploadTask(null);
      alert('Upload cancelled');
    }
  };

  const handleVideoPlay = (video) => {
    setPlayingVideo(video);
  };

  const handleCloseVideoPlayer = () => {
    setPlayingVideo(null);
  };

  const handleDeleteVideo = async (videoId) => {
    if (isGuest()) {
      alert('Please sign up or log in to delete videos.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteDoc(doc(db, 'talentVideos', videoId));
        fetchTalentVideos();
        alert('Video deleted successfully!');
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video. Please try again.');
      }
    }
  };

  const handleImageUpload = async (e) => {
    if (isGuest()) {
      alert('Please sign up or log in to upload profile photos. Guest accounts have read-only access.');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firebase Auth profile using context function (includes refresh)
      await updateUserProfile({ photoURL: downloadURL });
      console.log('✅ Firebase Auth profile photo updated with context refresh');
      
      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      console.log('✅ Firestore user profile photo updated');
      
      setProfile(prev => ({ ...prev, photoURL: downloadURL }));
      
      // Force refresh auth context to update all components
      setTimeout(() => {
        refreshAuth();
        console.log('🔄 Forced auth refresh after profile photo update');
      }, 500);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setUploading(false);
  };

  const handleEditProfile = () => {
    if (isGuest()) {
      alert('Please sign up or log in to edit your profile. Guest accounts have read-only access.');
      return;
    }
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedProfile = {
        ...editedProfile,
        certificates,
        achievements
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size should be less than 5MB');
      return;
    }

    try {
      const storageRef = ref(storage, `certificates/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setNewCertificate(prev => ({ 
        ...prev, 
        fileUrl: downloadURL, 
        fileName: file.name 
      }));
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert('Failed to upload certificate');
    }
  };

  const addCertificate = () => {
    if (newCertificate.name.trim()) {
      // Content filtering for certificate name and description with sports context
      const nameFilter = filterContent(newCertificate.name, {
        strictMode: false,
        context: 'sports_post',
        languages: ['english', 'hindi']
      });
      
      const descFilter = filterContent(newCertificate.description, {
        strictMode: false,
        context: 'sports_post', 
        languages: ['english', 'hindi']
      });
      
      if (!nameFilter.isClean && (nameFilter.shouldBlock || nameFilter.shouldWarn)) {
        const violationMsg = getViolationMessage(nameFilter.violations, nameFilter.categories);
        alert(`❌ You can't add this certificate: ${violationMsg}\n\nPlease focus on sports achievements and certifications.`);
        return;
      }
      
      if (!descFilter.isClean && (descFilter.shouldBlock || descFilter.shouldWarn)) {
        const violationMsg = getViolationMessage(descFilter.violations, descFilter.categories);
        alert(`❌ You can't add this description: ${violationMsg}\n\nPlease focus on sports-related content.`);
        return;
      }

      setCertificates([...certificates, { ...newCertificate, id: Date.now().toString() }]);
      setNewCertificate({ name: '', date: '', description: '', fileUrl: '', fileName: '' });
      setShowCertificateForm(false);
    }
  };

  const addAchievement = () => {
    if (newAchievement.title.trim()) {
      // Content filtering for achievement title and description with sports context
      const titleFilter = filterContent(newAchievement.title, {
        strictMode: false,
        context: 'sports_post',
        languages: ['english', 'hindi']
      });
      
      const descFilter = filterContent(newAchievement.description, {
        strictMode: false,
        context: 'sports_post', 
        languages: ['english', 'hindi']
      });
      
      if (!titleFilter.isClean && (titleFilter.shouldBlock || titleFilter.shouldWarn)) {
        const violationMsg = getViolationMessage(titleFilter.violations, titleFilter.categories);
        alert(`❌ You can't add this achievement: ${violationMsg}\n\nPlease focus on sports achievements and accomplishments.`);
        return;
      }
      
      if (!descFilter.isClean && (descFilter.shouldBlock || descFilter.shouldWarn)) {
        const violationMsg = getViolationMessage(descFilter.violations, descFilter.categories);
        alert(`❌ You can't add this description: ${violationMsg}\n\nPlease focus on sports-related content.`);
        return;
      }

      setAchievements([...achievements, { ...newAchievement, id: Date.now().toString() }]);
      setNewAchievement({ title: '', date: '', description: '' });
      setShowAchievementForm(false);
    }
  };

  const removeCertificate = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const removeAchievement = (id) => {
    setAchievements(achievements.filter(ach => ach.id !== id));
  };

  // Fetch users that current user is following
  const fetchFollowedUsers = () => {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followedList = [];
      snapshot.forEach((doc) => {
        followedList.push(doc.data().followingId);
      });
      // followedUsers state was removed for optimization
    });

    return unsubscribe;
  };

  // Fetch sent friend requests
  const fetchSentRequests = () => {
    const q = query(
      collection(db, 'friendRequests'),
      where('senderId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setSentRequests(requests);
    });

    return unsubscribe;
  };

  // Fetch friendships
  const fetchFriendships = () => {
    const q1 = query(
      collection(db, 'friendships'),
      where('user1', '==', currentUser.uid)
    );
    const q2 = query(
      collection(db, 'friendships'),
      where('user2', '==', currentUser.uid)
    );
    
    const updateFriendships = async () => {
      try {
        const friendshipsList = [];
        
        const snapshot1 = await getDocs(q1);
        snapshot1.forEach((doc) => {
          friendshipsList.push({ id: doc.id, ...doc.data() });
        });
        
        const snapshot2 = await getDocs(q2);
        snapshot2.forEach((doc) => {
          friendshipsList.push({ id: doc.id, ...doc.data() });
        });
        
        setFriendships(friendshipsList);
      } catch (error) {
        console.error('Error fetching friendships:', error);
      }
    };
    
    updateFriendships();
    
    const unsubscribe1 = onSnapshot(q1, updateFriendships);
    const unsubscribe2 = onSnapshot(q2, updateFriendships);
    
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  };

  // Helper functions for friend request status
  const getRequestStatus = (userId) => {
    const request = sentRequests.find(req => req.receiverId === userId);
    if (!request) return null;
    return request.status;
  };

  const isAlreadyFriend = (userId) => {
    return friendships.some(friendship => 
      friendship.user1 === userId || friendship.user2 === userId
    );
  };

  // Handle friend request (send or cancel)
  const handleFollowProfile = async () => {
    if (isGuest()) {
      alert('Please sign up or log in to send friend requests');
      return;
    }

    if (followingUser || isOwnProfile) return;

    try {
      setFollowingUser(true);
      
      const requestStatus = getRequestStatus(targetUserId);
      const isFriend = isAlreadyFriend(targetUserId);
      
      if (requestStatus === 'pending') {
        // Cancel friend request
        const request = sentRequests.find(req => req.receiverId === targetUserId);
        if (request) {
          await deleteDoc(doc(db, 'friendRequests', request.id));
          alert('Friend request cancelled');
        }
      } else if (!isFriend && !requestStatus) {
        // Send friend request
        await addDoc(collection(db, 'friendRequests'), {
          senderId: currentUser.uid,
          receiverId: targetUserId,
          senderName: currentUser.displayName || 'Anonymous User',
          senderPhoto: currentUser.photoURL || '',
          receiverName: profile?.displayName || 'Anonymous User',
          receiverPhoto: profile?.photoURL || '',
          status: 'pending',
          timestamp: serverTimestamp()
        });
        alert('Friend request sent!');
      }
      
    } catch (error) {
      console.error('Error with friend request:', error);
      alert('Error updating friend request status');
    }
    
    setFollowingUser(false);
  };

  // Fetch followers list
  const fetchFollowers = async () => {
    try {
      console.log('🔍 Fetching followers for user:', targetUserId);
      const q = query(
        collection(db, 'follows'),
        where('followingId', '==', targetUserId)
      );
      
      const snapshot = await getDocs(q);
      const followersList = [];
      console.log('📊 Found', snapshot.size, 'follow records');
      
      for (const docSnap of snapshot.docs) {
        const followData = docSnap.data();
        console.log('👤 Processing follower:', followData.followerId);
        const followerDoc = await getDoc(doc(db, 'users', followData.followerId));
        if (followerDoc.exists()) {
          followersList.push({
            id: followData.followerId,
            ...followerDoc.data()
          });
        }
      }
      
      console.log('✅ Final followers list:', followersList.length, 'followers');
      setFollowers(followersList);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  // Fetch following list
  const fetchFollowing = async () => {
    try {
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', targetUserId)
      );
      
      const snapshot = await getDocs(q);
      const followingList = [];
      
      for (const docSnap of snapshot.docs) {
        const followData = docSnap.data();
        const followingDoc = await getDoc(doc(db, 'users', followData.followingId));
        if (followingDoc.exists()) {
          followingList.push({
            id: followData.followingId,
            ...followingDoc.data()
          });
        }
      }
      
      setFollowing(followingList);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  // Function to navigate to profile and close modal
  const navigateToProfile = (userId) => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  // Guest profile view - minimal display with only guest ID
  if (isGuest()) {
    return (
      <div className="profile">
        <nav className="nav-bar">
          <div className="nav-content">
            <h1>{t('profile')}</h1>
            <div className="nav-controls">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="main-content profile-container">
          <div className="guest-profile">
            <div className="guest-profile-header">
              <div className="guest-avatar">
                <img
                  src="https://via.placeholder.com/120/f39c12/ffffff?text=GUEST"
                  alt="Guest Profile"
                  className="profile-image"
                />
              </div>
              <div className="guest-info">
                <h1>Guest User</h1>
                <p className="guest-id">Guest ID: {currentUser.uid}</p>
                <div className="guest-limitation">
                  <p>🔒 Guest Account - Read Only Access</p>
                  <p>Sign up to unlock full features!</p>
                  <button 
                    className="sign-up-btn"
                    onClick={() => navigate('/login')}
                  >
                    Sign Up / Sign In
                  </button>
                </div>
              </div>
            </div>
            
            <div className="guest-features">
              <div className="feature-card">
                <h3>What you can do as a guest:</h3>
                <ul>
                  <li>✅ View all posts</li>
                  <li>✅ Like posts</li>
                  <li>✅ View comments</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <h3>Sign up to unlock:</h3>
                <ul>
                  <li>📝 Create posts</li>
                  <li>💬 Comment on posts</li>
                  <li>👤 Edit profile</li>
                  <li>🏆 Add achievements</li>
                  <li>📜 Add certificates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="profile">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>{t('profile')}</h1>
          <div className="nav-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="main-content profile-container">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={profile?.photoURL || 'https://via.placeholder.com/150/2d3748/00ff88?text=Profile'}
              alt={t('profile')}
              className="profile-image"
            />
            {!isGuest() && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload"
                  id="profile-image-upload"
                />
                <label htmlFor="profile-image-upload" className="upload-label">
                  <Camera size={20} />
                  {uploading ? 'Uploading...' : t('upload_photo')}
                </label>
              </>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-title-section">
              <h1>{profile?.displayName}</h1>
              {isOwnProfile && !isGuest() && (
                <button 
                  className="edit-profile-btn" 
                  onClick={isEditing ? handleSaveProfile : handleEditProfile}
                >
                  {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                  {isEditing ? t('save_profile') : t('edit_profile')}
                </button>
              )}
              {!isOwnProfile && !isGuest() && (
                <button 
                  className="edit-profile-btn" 
                  onClick={handleFollowProfile}
                  disabled={followingUser}
                >
                  {followingUser ? (
                    'Loading...'
                  ) : (() => {
                    const requestStatus = getRequestStatus(targetUserId);
                    const isFriend = isAlreadyFriend(targetUserId);
                    
                    if (isFriend) {
                      return <><Check size={20} /> Friends</>;
                    } else if (requestStatus === 'pending') {
                      return <><X size={20} /> Cancel Request</>;
                    } else if (requestStatus === 'accepted') {
                      return <><Check size={20} /> Accepted</>;
                    } else {
                      return <><UserPlus size={20} /> Add Friend</>;
                    }
                  })()}
                </button>
              )}
            </div>
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> posts</span>
              <span className="clickable-stat" onClick={fetchFollowers}>
                <strong>{profile?.followers || 0}</strong> followers
              </span>
              {isOwnProfile && (
                <span className="clickable-stat" onClick={fetchFollowing}>
                  <strong>{profile?.following || 0}</strong> following
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="profile-section">
          <h2>{t('personal_details')}</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>{t('name')}</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedProfile.name || ''} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('name')}
                />
              ) : (
                <span>{profile?.name || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <label>{t('age')}</label>
              {isEditing ? (
                <input 
                  type="number" 
                  value={editedProfile.age || ''} 
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder={t('age')}
                />
              ) : (
                <span>{profile?.age || 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <label>{t('height_cm')}</label>
              {isEditing ? (
                <input 
                  type="number" 
                  value={editedProfile.height || ''} 
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder={t('height_cm')}
                />
              ) : (
                <span>{profile?.height ? `${profile.height} cm` : 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <label>{t('weight_kg')}</label>
              {isEditing ? (
                <input 
                  type="number" 
                  value={editedProfile.weight || ''} 
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder={t('weight_kg')}
                />
              ) : (
                <span>{profile?.weight ? `${profile.weight} kg` : 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <label>{t('sex')}</label>
              {isEditing ? (
                <select 
                  value={editedProfile.sex || ''} 
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                >
                  <option value="">{t('sex')}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              ) : (
                <span>{profile?.sex ? t(profile.sex) : 'Not specified'}</span>
              )}
            </div>
            <div className="detail-item">
              <label>{t('role')}</label>
              {isEditing ? (
                <select 
                  value={editedProfile.role || 'athlete'} 
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  <option value="athlete">{t('athlete')}</option>
                  <option value="coach">{t('coach')}</option>
                  <option value="organisation">{t('organisation')}</option>
                </select>
              ) : (
                <span>{t(profile?.role || 'athlete')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Certificates Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>{t('certificates')}</h2>
            {isEditing && (
              <button 
                className="add-btn" 
                onClick={() => setShowCertificateForm(true)}
              >
                <Plus size={20} />
                {t('add_certificate')}
              </button>
            )}
          </div>
          
          {showCertificateForm && (
            <div className="form-overlay active" onClick={() => setShowCertificateForm(false)}>
              <div className="form-modal active" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                  <h3>{t('add_certificate')}</h3>
                  <button onClick={() => setShowCertificateForm(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="form-content">
                  <input 
                    type="text" 
                    placeholder={t('certificate_name')} 
                    value={newCertificate.name}
                    onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                  />
                  <input 
                    type="date" 
                    placeholder={t('date_received')} 
                    value={newCertificate.date}
                    onChange={(e) => setNewCertificate({...newCertificate, date: e.target.value})}
                  />
                  <textarea 
                    placeholder={t('description')} 
                    value={newCertificate.description}
                    onChange={(e) => setNewCertificate({...newCertificate, description: e.target.value})}
                  />
                  <div className="file-upload-section">
                    <label htmlFor="certificate-upload" className="upload-btn">
                      <Plus size={16} />
                      Upload Certificate File
                    </label>
                    <input 
                      id="certificate-upload"
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleCertificateUpload}
                      style={{ display: 'none' }}
                    />
                    {newCertificate.fileName && (
                      <span className="file-name">📎 {newCertificate.fileName}</span>
                    )}
                  </div>
                  <button onClick={addCertificate} className="save-btn">
                    {t('add_certificate')}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="items-list">
            {certificates.map((cert) => (
              <div key={cert.id} className="item-card certificate-card">
                {cert.fileUrl && (
                  <div className="certificate-preview">
                    {cert.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img 
                        src={cert.fileUrl} 
                        alt={cert.name}
                        className="cert-thumbnail"
                        onClick={() => window.open(cert.fileUrl, '_blank')}
                      />
                    ) : (
                      <div 
                        className="cert-file-icon"
                        onClick={() => window.open(cert.fileUrl, '_blank')}
                      >
                        📄
                        <span className="file-type">
                          {cert.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="item-content">
                  <h4>{cert.name}</h4>
                  <p className="item-date">{cert.date}</p>
                  <p className="item-description">{cert.description}</p>
                  {cert.fileName && (
                    <p className="file-info">📎 {cert.fileName}</p>
                  )}
                </div>
                {isEditing && (
                  <button 
                    className="remove-btn" 
                    onClick={() => removeCertificate(cert.id)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {certificates.length === 0 && (
              <p className="empty-state">No certificates added yet</p>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>{t('achievements')}</h2>
            {isEditing && (
              <button 
                className="add-btn" 
                onClick={() => setShowAchievementForm(true)}
              >
                <Plus size={20} />
                {t('add_achievement')}
              </button>
            )}
          </div>
          
          {showAchievementForm && (
            <div className="form-overlay active" onClick={() => setShowAchievementForm(false)}>
              <div className="form-modal active" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                  <h3>{t('add_achievement')}</h3>
                  <button onClick={() => setShowAchievementForm(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="form-content">
                  <input 
                    type="text" 
                    placeholder={t('achievement_title')} 
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                  />
                  <input 
                    type="date" 
                    placeholder={t('date_received')} 
                    value={newAchievement.date}
                    onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                  />
                  <textarea 
                    placeholder={t('description')} 
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  />
                  <button onClick={addAchievement} className="save-btn">
                    {t('add_achievement')}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="items-list">
            {achievements.map((ach) => (
              <div key={ach.id} className="item-card">
                <div className="item-content">
                  <h4>{ach.title}</h4>
                  <p className="item-date">{ach.date}</p>
                  <p className="item-description">{ach.description}</p>
                </div>
                {isEditing && (
                  <button 
                    className="remove-btn" 
                    onClick={() => removeAchievement(ach.id)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="empty-state">No achievements added yet</p>
            )}
          </div>
        </div>
        
        {/* Talent Showcase Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2><Video size={24} /> Talent Showcase ({talentVideos.length}/7)</h2>
            {isOwnProfile && !isGuest() && talentVideos.length < 7 && (
              <div className="upload-video-container">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  id="talent-video-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="talent-video-upload" className="upload-video-btn">
                  <Plus size={16} />
                  {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                </label>
              </div>
            )}
          </div>
          
          {uploadingVideo && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${videoUploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-info">
                <span>{Math.round(videoUploadProgress)}% uploaded</span>
                <button 
                  className="cancel-upload-btn"
                  onClick={handleCancelUpload}
                  disabled={!uploadTask}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="videos-grid">
            {talentVideos.map((video) => (
              <div key={video.id} className="video-thumbnail">
                <video 
                  src={video.videoUrl} 
                  poster={video.metadata?.thumbnail}
                  className="video-preview"
                  controls={false}
                  muted
                  preload="metadata"
                  onClick={() => handleVideoPlay(video)}
                />
                <div className="video-overlay">
                  <button 
                    className="play-btn"
                    onClick={() => handleVideoPlay(video)}
                  >
                    <Play size={24} />
                  </button>
                  <div className="video-info">
                    <span>👁️ {video.views || 0}</span>
                    <span>❤️ {video.likes || 0}</span>
                  </div>
                  {isOwnProfile && !isGuest() && !video.isSample && (
                    <button 
                      className="delete-video-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVideo(video.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="video-duration">
                  {video.metadata?.durationFormatted || '0:00'}
                </div>
              </div>
            ))}
            {talentVideos.length === 0 && (
              <div className="empty-state">
                <Video size={48} />
                <p>No talent videos yet</p>
                {isOwnProfile && !isGuest() && (
                  <span>Upload videos to showcase your talent!</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Posts Grid */}
        <div className="profile-section">
          <h2>Posts ({posts.length})</h2>
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-thumbnail">
                {post.imageUrl && <img src={post.imageUrl} alt={post.caption} />}
                <div className="post-overlay">
                  <span>❤️ {post.likes || 0}</span>
                  <span>💬 {post.comments || 0}</span>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="empty-state">No posts yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="modal-overlay" onClick={() => setShowFollowersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Users size={20} /> Followers ({followers.length})</h3>
              <button onClick={() => setShowFollowersModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {followers.length === 0 ? (
                <div className="empty-modal">
                  <Users size={48} />
                  <p>No followers yet</p>
                </div>
              ) : (
                <div className="users-list">
                  {followers.map((follower) => (
                    <div key={follower.id} className="user-item" onClick={() => navigateToProfile(follower.id)}>
                      <div className="user-avatar">
                        <img src={follower.photoURL || 'https://via.placeholder.com/40'} alt="Avatar" />
                      </div>
                      <div className="user-info">
                        <strong>{follower.displayName || 'Anonymous User'}</strong>
                        <p>{follower.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal - Only show for own profile */}
      {showFollowingModal && isOwnProfile && (
        <div className="modal-overlay" onClick={() => setShowFollowingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><UserPlus size={20} /> Following ({following.length})</h3>
              <button onClick={() => setShowFollowingModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {following.length === 0 ? (
                <div className="empty-modal">
                  <UserPlus size={48} />
                  <p>Not following anyone yet</p>
                </div>
              ) : (
                <div className="users-list">
                  {following.map((user) => (
                    <div key={user.id} className="user-item" onClick={() => navigateToProfile(user.id)}>
                      <div className="user-avatar">
                        <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Avatar" />
                      </div>
                      <div className="user-info">
                        <strong>{user.displayName || 'Anonymous User'}</strong>
                        <p>{user.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {playingVideo && (
        <div className="video-modal-overlay" onClick={handleCloseVideoPlayer}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{playingVideo.fileName || 'Talent Video'}</h3>
              <button className="close-video-btn" onClick={handleCloseVideoPlayer}>
                <X size={24} />
              </button>
            </div>
            <div className="video-modal-body">
              <video 
                src={playingVideo.videoUrl}
                controls
                autoPlay
                className="modal-video-player"
                poster={playingVideo.metadata?.thumbnail}
              />
              <div className="video-modal-info">
                <div className="video-stats">
                  <span>👁️ {playingVideo.views || 0} views</span>
                  <span>❤️ {playingVideo.likes || 0} likes</span>
                  <span>📅 {playingVideo.uploadedAt ? new Date(playingVideo.uploadedAt.seconds ? playingVideo.uploadedAt.seconds * 1000 : playingVideo.uploadedAt).toLocaleDateString() : 'Unknown date'}</span>
                </div>
                <div className="video-description">
                  <strong>Uploaded by:</strong> {playingVideo.userDisplayName || 'Unknown User'}
                  {playingVideo.isSample && (
                    <span className="sample-badge">Sample Video</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <FooterNav />
    </div>
  );
}