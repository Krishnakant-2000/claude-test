import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Search as SearchIcon, UserPlus, Check, X, Filter, MapPin, User, Award, Target } from 'lucide-react';
import FooterNav from '../layout/FooterNav';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import './Search.css';

export default function Search() {
  const navigate = useNavigate();
  const { currentUser, isGuest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    role: '',
    skill: '',
    sport: '',
    name: '',
    achievement: '',
    sex: ''
  });

  useEffect(() => {
    if (currentUser && !isGuest()) {
      fetchSentRequests();
      fetchFriendships();
    }
  }, [currentUser, isGuest]);

  // Live search effect with debouncing
  useEffect(() => {
    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Don't search if no criteria and if guest
    if (isGuest()) {
      setSearchResults([]);
      return;
    }

    // Search if there's a search term or any filter applied
    const hasSearchCriteria = searchTerm.trim().length >= 2 || 
                            Object.values(filters).some(filter => filter.trim().length > 0);

    if (!hasSearchCriteria) {
      setSearchResults([]);
      return;
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms delay

    setSearchDebounceTimer(timer);

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, filters]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const fetchFriendships = () => {
    const q1 = query(
      collection(db, 'friendships'),
      where('user1', '==', currentUser.uid)
    );
    const q2 = query(
      collection(db, 'friendships'),
      where('user2', '==', currentUser.uid)
    );
    
    // For simplicity, just track friendships
    setFriendships([]);
  };

  const handleSearch = async () => {
    if (isGuest()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const results = [];
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      
      allUsersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        
        // Don't include current user in results
        if (doc.id !== currentUser.uid) {
          let matches = true;
          
          // Text search (if provided)
          if (searchTermLower) {
            const displayName = (userData.displayName || '').toLowerCase().trim();
            const email = (userData.email || '').toLowerCase().trim();
            const name = (userData.name || '').toLowerCase().trim();
            
            const textMatch = displayName.includes(searchTermLower) || 
                            email.includes(searchTermLower) || 
                            name.includes(searchTermLower);
            
            if (!textMatch) matches = false;
          }
          
          // Apply filters
          if (matches && filters.location && userData.location) {
            if (!userData.location.toLowerCase().includes(filters.location.toLowerCase())) {
              matches = false;
            }
          }
          
          if (matches && filters.role && userData.role) {
            if (userData.role !== filters.role) {
              matches = false;
            }
          }
          
          if (matches && filters.skill && userData.skills) {
            const skillMatch = userData.skills.some(skill => 
              skill.toLowerCase().includes(filters.skill.toLowerCase())
            );
            if (!skillMatch) matches = false;
          }
          
          if (matches && filters.sport && userData.sport) {
            if (!userData.sport.toLowerCase().includes(filters.sport.toLowerCase())) {
              matches = false;
            }
          }
          
          if (matches && filters.name && userData.name) {
            if (!userData.name.toLowerCase().includes(filters.name.toLowerCase())) {
              matches = false;
            }
          }
          
          if (matches && filters.achievement && userData.achievements) {
            const achievementMatch = userData.achievements.some(achievement => 
              achievement.title.toLowerCase().includes(filters.achievement.toLowerCase())
            );
            if (!achievementMatch) matches = false;
          }
          
          if (matches && filters.sex && userData.sex) {
            if (userData.sex !== filters.sex) {
              matches = false;
            }
          }
          
          if (matches) {
            results.push(userData);
          }
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Error searching users: ' + error.message);
    }
    setLoading(false);
  };


  const handleSendFriendRequest = async (userId, userName, userPhoto) => {
    if (isGuest()) {
      if (window.confirm('Please sign up or log in to send friend requests.\n\nWould you like to go to the login page?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const requestStatus = getRequestStatus(userId);
      
      if (requestStatus === 'pending') {
        // Cancel friend request
        const request = sentRequests.find(req => req.receiverId === userId);
        if (request) {
          await deleteDoc(doc(db, 'friendRequests', request.id));
          alert('Friend request cancelled');
        }
      } else {
        // Send friend request
        await addDoc(collection(db, 'friendRequests'), {
          senderId: currentUser.uid,
          receiverId: userId,
          senderName: currentUser.displayName || 'Anonymous User',
          senderPhoto: currentUser.photoURL || '',
          receiverName: userName,
          receiverPhoto: userPhoto || '',
          status: 'pending',
          timestamp: serverTimestamp()
        });
        
        alert('Friend request sent!');
      }
    } catch (error) {
      console.error('Error with friend request:', error);
      alert('Failed to update friend request');
    }
  };

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

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      role: '',
      skill: '',
      sport: '',
      name: '',
      achievement: '',
      sex: ''
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter.trim().length > 0) || searchTerm.trim().length > 0;

  // Guest view
  if (isGuest()) {
    return (
      <div className="search">
        <nav className="nav-bar">
          <div className="nav-content">
            <h1>Search</h1>
            <div className="nav-controls">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="main-content search-content">
          <div className="guest-restriction">
            <div className="guest-restriction-content">
              <SearchIcon size={48} />
              <h2>User Search</h2>
              <p>🔒 Guest accounts cannot search for users</p>
              <p>Sign up to find and connect with friends!</p>
              <button 
                className="sign-up-btn"
                onClick={() => navigate('/login')}
              >
                Sign Up / Sign In
              </button>
            </div>
          </div>
        </div>
        
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="search">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>Search</h1>
          <div className="nav-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="main-content search-content">
        <div className="search-bar">
          <div className="search-input-container">
            <SearchIcon size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or display name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="search-filters">
            <div className="filters-header">
              <h3><Filter size={20} />Advanced Filters</h3>
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <X size={16} />
                  Clear All
                </button>
              )}
            </div>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label><MapPin size={16} />Location</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label><User size={16} />Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="athlete">Athlete</option>
                  <option value="coach">Coach</option>
                  <option value="organisation">Organization</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label><Target size={16} />Skill</label>
                <input
                  type="text"
                  placeholder="e.g., Swimming, Running"
                  value={filters.skill}
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label><Target size={16} />Sport</label>
                <input
                  type="text"
                  placeholder="e.g., Football, Basketball"
                  value={filters.sport}
                  onChange={(e) => handleFilterChange('sport', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label><User size={16} />Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label><Award size={16} />Achievement</label>
                <input
                  type="text"
                  placeholder="e.g., Gold Medal, Champion"
                  value={filters.achievement}
                  onChange={(e) => handleFilterChange('achievement', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label><User size={16} />Gender</label>
                <select
                  value={filters.sex}
                  onChange={(e) => handleFilterChange('sex', e.target.value)}
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="search-results">
          {searchTerm && searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
            <div className="search-placeholder">
              <SearchIcon size={48} />
              <h3>Keep typing...</h3>
              <p>Type at least 2 characters to start searching</p>
            </div>
          )}

          {searchResults.length === 0 && searchTerm && searchTerm.trim().length >= 2 && !loading && (
            <div className="empty-state">
              <SearchIcon size={48} />
              <h3>No users found</h3>
              <p>Try searching with different keywords</p>
            </div>
          )}
          
          {searchResults.length === 0 && !searchTerm && (
            <div className="search-placeholder">
              <SearchIcon size={48} />
              <h3>Find Friends</h3>
              <p>Start typing to search for users and send friend requests</p>
            </div>
          )}
          
          {searchResults.map((user) => {
            const requestStatus = getRequestStatus(user.id);
            const isFriend = isAlreadyFriend(user.id);
            
            return (
              <div key={user.id} className="user-result">
                <div className="user-avatar" onClick={() => navigate(`/profile/${user.id}`)}>
                  <img 
                    src={user.photoURL || 'https://via.placeholder.com/50/2d3748/00ff88?text=👤'} 
                    alt={user.displayName}
                  />
                </div>
                <div className="user-info" onClick={() => navigate(`/profile/${user.id}`)}>
                  <strong>{user.displayName || 'Anonymous User'}</strong>
                  <p>{user.bio || 'No bio available'}</p>
                  <div className="user-details">
                    {user.role && <span className="user-role">{user.role}</span>}
                    {user.location && <span className="user-location"><MapPin size={12} />{user.location}</span>}
                    {user.sport && <span className="user-sport"><Target size={12} />{user.sport}</span>}
                    {user.sex && <span className="user-sex">{user.sex}</span>}
                  </div>
                  {user.email && <span className="user-email">{user.email}</span>}
                </div>
                <div className="user-actions">
                  {isFriend ? (
                    <button className="friend-btn" disabled>
                      <Check size={16} />
                      Friends
                    </button>
                  ) : requestStatus === 'pending' ? (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleSendFriendRequest(user.id, user.displayName, user.photoURL)}
                    >
                      <X size={16} />
                      Cancel Request
                    </button>
                  ) : requestStatus === 'accepted' ? (
                    <button className="accepted-btn" disabled>
                      <Check size={16} />
                      Accepted
                    </button>
                  ) : (
                    <button 
                      className="add-friend-btn"
                      onClick={() => handleSendFriendRequest(user.id, user.displayName, user.photoURL)}
                    >
                      <UserPlus size={16} />
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <FooterNav />
    </div>
  );
}