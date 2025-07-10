import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db, storage } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Edit2, Camera, Plus, X, Save } from 'lucide-react';
import FooterNav from '../layout/FooterNav';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import './Profile.css';

export default function Profile() {
  const { currentUser, isGuest } = useAuth();
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
  const [newCertificate, setNewCertificate] = useState({ name: '', date: '', description: '' });
  const [newAchievement, setNewAchievement] = useState({ title: '', date: '', description: '' });

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchUserPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setProfile(profileData);
        setCertificates(profileData.certificates || []);
        setAchievements(profileData.achievements || []);
      } else {
        // Create default profile data
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
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      
      setProfile(prev => ({ ...prev, photoURL: downloadURL }));
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

  const addCertificate = () => {
    if (newCertificate.name.trim()) {
      setCertificates([...certificates, { ...newCertificate, id: Date.now().toString() }]);
      setNewCertificate({ name: '', date: '', description: '' });
      setShowCertificateForm(false);
    }
  };

  const addAchievement = () => {
    if (newAchievement.title.trim()) {
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
              {!isGuest() && (
                <button 
                  className="edit-profile-btn" 
                  onClick={isEditing ? handleSaveProfile : handleEditProfile}
                >
                  {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                  {isEditing ? t('save_profile') : t('edit_profile')}
                </button>
              )}
            </div>
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> posts</span>
              <span><strong>{profile?.followers || 0}</strong> followers</span>
              <span><strong>{profile?.following || 0}</strong> following</span>
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
                  <button onClick={addCertificate} className="save-btn">
                    {t('add_certificate')}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="items-list">
            {certificates.map((cert) => (
              <div key={cert.id} className="item-card">
                <div className="item-content">
                  <h4>{cert.name}</h4>
                  <p className="item-date">{cert.date}</p>
                  <p className="item-description">{cert.description}</p>
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
      
      <FooterNav />
    </div>
  );
}