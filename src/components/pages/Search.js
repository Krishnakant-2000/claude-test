import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Search as SearchIcon, UserPlus, Check, Clock } from 'lucide-react';
import FooterNav from '../layout/FooterNav';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import './Search.css';

export default function Search() {
  const { currentUser, isGuest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendships, setFriendships] = useState([]);

  useEffect(() => {
    if (currentUser && !isGuest()) {
      fetchSentRequests();
      fetchFriendships();
    }
  }, [currentUser, isGuest]);

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
    if (!searchTerm.trim() || isGuest()) return;
    
    setLoading(true);
    try {
      const results = [];
      const searchTermLower = searchTerm.toLowerCase();
      
      // First, try to get all users and filter client-side for better matching
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      
      console.log('Total users in database:', allUsersSnapshot.size);
      
      allUsersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        
        console.log('User found:', {
          id: doc.id,
          displayName: userData.displayName,
          email: userData.email,
          name: userData.name
        });
        
        // Don't include current user in results
        if (doc.id !== currentUser.uid) {
          const displayName = (userData.displayName || '').toLowerCase();
          const email = (userData.email || '').toLowerCase();
          const name = (userData.name || '').toLowerCase();
          
          // Check if search term matches displayName, email, or name
          if (displayName.includes(searchTermLower) || 
              email.includes(searchTermLower) || 
              name.includes(searchTermLower)) {
            console.log('Match found for:', searchTerm, 'with user:', userData.displayName);
            results.push(userData);
          }
        }
      });
      
      console.log('Search results:', results.length, 'users found');
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setLoading(false);
  };

  const handleShowAllUsers = async () => {
    setLoading(true);
    try {
      const results = [];
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      
      console.log('Showing all users in database:', allUsersSnapshot.size);
      
      allUsersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        
        console.log('Found user in database:', {
          id: doc.id,
          displayName: userData.displayName,
          email: userData.email,
          isCurrentUser: doc.id === currentUser.uid
        });
        
        // Don't include current user in results
        if (doc.id !== currentUser.uid) {
          results.push(userData);
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
    setLoading(false);
  };

  const handleSendFriendRequest = async (userId, userName, userPhoto) => {
    if (isGuest()) {
      alert('Please sign up or log in to send friend requests');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
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
              placeholder="Search for users to add as friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="debug-controls" style={{ marginTop: '10px', textAlign: 'center' }}>
            <button 
              onClick={() => setSearchTerm('') || handleShowAllUsers()} 
              className="show-all-btn"
              disabled={loading}
            >
              Show All Users (Debug)
            </button>
          </div>
        </div>
        
        <div className="search-results">
          {searchResults.length === 0 && searchTerm && !loading && (
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
              <p>Search for users by name to send friend requests</p>
            </div>
          )}
          
          {searchResults.map((user) => {
            const requestStatus = getRequestStatus(user.id);
            const isFriend = isAlreadyFriend(user.id);
            
            return (
              <div key={user.id} className="user-result">
                <div className="user-avatar">
                  <img 
                    src={user.photoURL || 'https://via.placeholder.com/50/2d3748/00ff88?text=👤'} 
                    alt={user.displayName}
                  />
                </div>
                <div className="user-info">
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
                    <button className="pending-btn" disabled>
                      <Clock size={16} />
                      Pending
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