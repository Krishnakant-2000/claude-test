import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { MessageSquare, UserPlus, Check, X, Send, Users } from 'lucide-react';
import FooterNav from '../layout/FooterNav';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import './Messages.css';

export default function Messages() {
  const { currentUser, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [messages, setMessages] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && !isGuest()) {
      try {
        fetchFriendRequests();
        fetchFriends();
        fetchMessages();
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    }
    setLoading(false);
  }, [currentUser]);

  const fetchFriendRequests = () => {
    const q = query(
      collection(db, 'friendRequests'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setFriendRequests(requests);
    });

    return unsubscribe;
  };

  const fetchFriends = () => {
    console.log('🔍 Fetching friends for user:', currentUser.uid);
    console.log('📝 Current user info:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    });
    
    const q1 = query(
      collection(db, 'friendships'),
      where('user1', '==', currentUser.uid)
    );
    const q2 = query(
      collection(db, 'friendships'),
      where('user2', '==', currentUser.uid)
    );
    
    // Function to combine results from both queries
    const updateFriendsList = async () => {
      try {
        console.log('🔄 Starting to update friends list...');
        const friendsList = [];
        
        // Get friendships where current user is user1
        console.log('📊 Querying friendships where current user is user1...');
        const snapshot1 = await getDocs(q1);
        console.log('✅ Friendships where user is user1:', snapshot1.size);
        
        for (const docSnap of snapshot1.docs) {
          const friendship = docSnap.data();
          const friendId = friendship.user2;
          console.log('👥 Found friendship (as user1):', {
            friendshipId: docSnap.id,
            user1: friendship.user1,
            user2: friendship.user2,
            friendId: friendId,
            createdAt: friendship.createdAt
          });
          
          try {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            console.log('📄 Friend document exists?', friendDoc.exists());
            if (friendDoc.exists()) {
              const friendData = {
                id: friendId,
                ...friendDoc.data(),
                friendshipId: docSnap.id
              };
              console.log('👤 Adding friend to list:', friendData);
              friendsList.push(friendData);
            } else {
              console.warn('⚠️ Friend document not found for ID:', friendId);
            }
          } catch (error) {
            console.error('❌ Error fetching friend profile:', error);
          }
        }
        
        // Get friendships where current user is user2
        console.log('📊 Querying friendships where current user is user2...');
        const snapshot2 = await getDocs(q2);
        console.log('✅ Friendships where user is user2:', snapshot2.size);
        
        for (const docSnap of snapshot2.docs) {
          const friendship = docSnap.data();
          const friendId = friendship.user1;
          console.log('👥 Found friendship (as user2):', {
            friendshipId: docSnap.id,
            user1: friendship.user1,
            user2: friendship.user2,
            friendId: friendId,
            createdAt: friendship.createdAt
          });
          
          try {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            console.log('📄 Friend document exists?', friendDoc.exists());
            if (friendDoc.exists()) {
              const friendData = {
                id: friendId,
                ...friendDoc.data(),
                friendshipId: docSnap.id
              };
              console.log('👤 Adding friend to list:', friendData);
              friendsList.push(friendData);
            } else {
              console.warn('⚠️ Friend document not found for ID:', friendId);
            }
          } catch (error) {
            console.error('❌ Error fetching friend profile:', error);
          }
        }
        
        console.log('🎉 FINAL RESULT - Total friends found:', friendsList.length);
        console.log('📋 Friends list:', friendsList);
        setFriends(friendsList);
      } catch (error) {
        console.error('❌ Error in updateFriendsList:', error);
      }
    };
    
    // Update friends list initially and set up listeners
    updateFriendsList();
    
    // Listen for changes in both collections
    const unsubscribe1 = onSnapshot(q1, () => {
      console.log('🔄 Friendship change detected (user1 collection)');
      updateFriendsList();
    });
    const unsubscribe2 = onSnapshot(q2, () => {
      console.log('🔄 Friendship change detected (user2 collection)');
      updateFriendsList();
    });
    
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  };

  const fetchMessages = () => {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = [];
      snapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by timestamp, newest first
      messagesList.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
      
      setMessages(messagesList);
    });

    return unsubscribe;
  };

  const handleAcceptRequest = async (requestId, senderId) => {
    if (isGuest()) {
      alert('Please sign up or log in to accept friend requests');
      return;
    }

    try {
      console.log('🎯 Accepting friend request:', {
        requestId,
        senderId,
        currentUserId: currentUser.uid
      });

      // Update request status
      console.log('📝 Updating friend request status to accepted...');
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Friend request status updated');

      // Create friendship entries for both users
      console.log('🤝 Creating friendship document...');
      const friendshipData = {
        user1: currentUser.uid,
        user2: senderId,
        createdAt: serverTimestamp()
      };
      console.log('📋 Friendship data:', friendshipData);
      
      const friendshipRef = await addDoc(collection(db, 'friendships'), friendshipData);
      console.log('✅ Friendship created with ID:', friendshipRef.id);

      alert('Friend request accepted! Check the Friends tab.');

    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
      alert('Error accepting friend request: ' + error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (isGuest()) {
      alert('Please sign up or log in to manage friend requests');
      return;
    }

    try {
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || isGuest()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        receiverId: selectedChat.id,
        senderName: currentUser.displayName || 'Anonymous User',
        senderPhoto: currentUser.photoURL || '',
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Guest view
  if (isGuest()) {
    return (
      <div className="messages">
        <nav className="nav-bar">
          <div className="nav-content">
            <h1>Messages</h1>
            <div className="nav-controls">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="main-content messages-content">
          <div className="guest-restriction">
            <div className="guest-restriction-content">
              <MessageSquare size={48} />
              <h2>Messages & Friend Requests</h2>
              <p>🔒 Guest accounts cannot access messaging features</p>
              <p>Sign up to connect with friends and send messages!</p>
            </div>
          </div>
        </div>
        
        <FooterNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="messages">
        <nav className="nav-bar">
          <div className="nav-content">
            <h1>Messages</h1>
          </div>
        </nav>
        <div className="main-content">
          <div className="loading">Loading messages...</div>
        </div>
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="messages">
      <nav className="nav-bar">
        <div className="nav-content">
          <h1>Messages</h1>
          <div className="nav-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="main-content messages-content">
        {/* Tab Navigation */}
        <div className="messages-tabs">
          <button
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={20} />
            Friends
            {friends.length > 0 && <span className="badge">{friends.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={20} />
            Messages
            {messages.length > 0 && <span className="badge">{messages.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <UserPlus size={20} />
            Requests
            {friendRequests.length > 0 && <span className="badge">{friendRequests.length}</span>}
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="friends-tab">
            {friends.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No friends yet</h3>
                <p>Accept friend requests to start building your network!</p>
              </div>
            ) : (
              <div className="friends-list">
                {friends.map((friend) => (
                  <div key={friend.id} className="friend-item" onClick={() => {setSelectedChat(friend); setActiveTab('messages');}}>
                    <div className="friend-avatar">
                      <img src={friend.photoURL || 'https://via.placeholder.com/40'} alt="Avatar" />
                    </div>
                    <div className="friend-info">
                      <strong>{friend.displayName || 'Anonymous User'}</strong>
                      <p>Click to start conversation</p>
                    </div>
                    <div className="message-icon">
                      <MessageSquare size={20} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-tab">
            {/* Chat Interface */}
            {selectedChat && (
              <div className="chat-interface">
                <div className="chat-header">
                  <div className="chat-avatar">
                    <img src={selectedChat.photoURL || 'https://via.placeholder.com/40'} alt="Avatar" />
                  </div>
                  <div className="chat-info">
                    <strong>{selectedChat.displayName}</strong>
                    <button className="close-chat" onClick={() => setSelectedChat(null)}>×</button>
                  </div>
                </div>
                
                <div className="chat-messages">
                  {messages.filter(msg => 
                    (msg.senderId === selectedChat.id && msg.receiverId === currentUser.uid) ||
                    (msg.senderId === currentUser.uid && msg.receiverId === selectedChat.id)
                  ).map((message) => (
                    <div key={message.id} className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}>
                      <p>{message.message}</p>
                      <span className="message-time">
                        {message.timestamp?.toDate?.()?.toLocaleTimeString() || 'now'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="message-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!newMessage.trim()}>
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}
            
            {/* Recent Messages or Empty State */}
            {!selectedChat && (
              <>
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare size={48} />
                    <h3>No messages yet</h3>
                    <p>Start a conversation with your friends from the Friends tab!</p>
                  </div>
                ) : (
                  <div className="recent-messages">
                    <h3>Recent Messages</h3>
                    <div className="messages-list">
                      {messages.slice(0, 5).map((message) => (
                        <div key={message.id} className="message-item">
                          <div className="message-avatar">
                            <img src={message.senderPhoto || 'https://via.placeholder.com/40'} alt="Avatar" />
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <strong>{message.senderName}</strong>
                              <span className="message-time">
                                {message.timestamp?.toDate?.()?.toLocaleDateString() || 'now'}
                              </span>
                            </div>
                            <p className="message-text">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Friend Requests Tab */}
        {activeTab === 'requests' && (
          <div className="requests-tab">
            {friendRequests.length === 0 ? (
              <div className="empty-state">
                <UserPlus size={48} />
                <h3>No friend requests</h3>
                <p>Friend requests will appear here</p>
              </div>
            ) : (
              <div className="requests-list">
                {friendRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <div className="request-avatar">
                      <img src={request.senderPhoto || 'https://via.placeholder.com/50'} alt="Avatar" />
                    </div>
                    <div className="request-content">
                      <div className="request-info">
                        <strong>{request.senderName}</strong>
                        <p>wants to be your friend</p>
                        <span className="request-time">
                          {request.timestamp?.toDate?.()?.toLocaleDateString() || 'now'}
                        </span>
                      </div>
                      <div className="request-actions">
                        <button
                          className="accept-btn"
                          onClick={() => handleAcceptRequest(request.id, request.senderId)}
                        >
                          <Check size={16} />
                          Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <FooterNav />
    </div>
  );
}