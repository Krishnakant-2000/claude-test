import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Search as SearchIcon, UserPlus, Check, X } from 'lucide-react';
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

    // Don't search if less than 2 characters or if guest
    if (searchTerm.trim().length < 2 || isGuest()) {
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
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!searchTerm.trim() || isGuest()) {
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
          const displayName = (userData.displayName || '').toLowerCase().trim();
          const email = (userData.email || '').toLowerCase().trim();
          const name = (userData.name || '').toLowerCase().trim();
          
          // Try multiple matching strategies
          const exactMatch = displayName === searchTermLower || email === searchTermLower || name === searchTermLower;
          const includesMatch = displayName.includes(searchTermLower) || email.includes(searchTermLower) || name.includes(searchTermLower);
          const startsWithMatch = displayName.startsWith(searchTermLower) || email.startsWith(searchTermLower) || name.startsWith(searchTermLower);
          
          if (exactMatch || includesMatch || startsWithMatch) {
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
              placeholder="Start typing to search users... (min 2 characters)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
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