import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { MessageSquare, UserPlus, Check, X, Send, Users, Edit3, Trash2, Save, XCircle, AlertTriangle, Bell, Heart, Play } from 'lucide-react';
import FooterNav from '../layout/FooterNav';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import { filterChatMessage, getChatViolationMessage, logChatViolation } from '../../utils/chatFilter';
import './Messages.css';

export default function Messages() {
  const navigate = useNavigate();
  const { currentUser, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [messages, setMessages] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [messageViolation, setMessageViolation] = useState(null);
  const [showMessageWarning, setShowMessageWarning] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [followingUser, setFollowingUser] = useState(null);

  useEffect(() => {
    if (currentUser && !isGuest()) {
      try {
        fetchFriendRequests();
        fetchFriends();
        fetchMessages();
        fetchFollowedUsers();
        fetchNotifications();
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
    console.log('📨 Setting up message listeners for user:', currentUser.uid);
    
    // Query for messages where current user is receiver
    const q1 = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUser.uid)
    );
    
    // Query for messages where current user is sender
    const q2 = query(
      collection(db, 'messages'),
      where('senderId', '==', currentUser.uid)
    );
    
    const updateMessages = async () => {
      try {
        const messagesList = [];
        
        // Get messages where user is receiver
        const snapshot1 = await getDocs(q1);
        snapshot1.forEach((doc) => {
          messagesList.push({ id: doc.id, ...doc.data() });
        });
        
        // Get messages where user is sender
        const snapshot2 = await getDocs(q2);
        snapshot2.forEach((doc) => {
          messagesList.push({ id: doc.id, ...doc.data() });
        });
        
        // Remove duplicates (shouldn't happen but just in case)
        const uniqueMessages = messagesList.filter((msg, index, arr) => 
          arr.findIndex(m => m.id === msg.id) === index
        );
        
        // Sort by timestamp, newest first
        uniqueMessages.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeA - timeB; // Changed to oldest first for chat display
        });
        
        console.log('📨 Total messages found:', uniqueMessages.length);
        setMessages(uniqueMessages);
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
      }
    };
    
    // Initial load
    updateMessages();
    
    // Listen for changes in both collections
    const unsubscribe1 = onSnapshot(q1, () => {
      console.log('📨 Message change detected (as receiver)');
      updateMessages();
    });
    const unsubscribe2 = onSnapshot(q2, () => {
      console.log('📨 Message change detected (as sender)');
      updateMessages();
    });
    
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  };

  const fetchNotifications = () => {
    console.log('🔔 Setting up notification listeners for user:', currentUser.uid);
    
    const q = query(
      collection(db, 'notifications'),
      where('receiverId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = [];
      snapshot.forEach((doc) => {
        notificationsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by timestamp (newest first)
      notificationsList.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timeB - timeA;
      });
      
      console.log('🔔 Notifications found:', notificationsList.length);
      setNotifications(notificationsList);
    });
    
    return unsubscribe;
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, selectedChat]);

  // Real-time message content filtering as user types
  const handleMessageChange = (e) => {
    const newMessageText = e.target.value;
    setNewMessage(newMessageText);
    
    // Real-time filter check (strict for messages)
    if (newMessageText.trim().length > 3) { // Check after minimal content
      console.log('🔍 Real-time message filter check:', newMessageText);
      const filterResult = filterChatMessage(newMessageText, {
        strictMode: true,
        checkPatterns: true,
        languages: ['english', 'hindi']
      });
      
      console.log('Real-time filter result:', filterResult);
      
      if (!filterResult.isClean && filterResult.shouldBlock) {
        setMessageViolation(filterResult);
        setShowMessageWarning(true);
      } else {
        setMessageViolation(null);
        setShowMessageWarning(false);
      }
    } else {
      setMessageViolation(null);
      setShowMessageWarning(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || isGuest() || sendingMessage) return;

    const messageText = newMessage.trim();
    
    // Content filtering check for messages
    console.log('🔍 Checking message content for inappropriate material...', messageText);
    const filterResult = filterChatMessage(messageText, {
      strictMode: true,
      checkPatterns: true,
      languages: ['english', 'hindi']
    });
    
    console.log('Message filter result:', filterResult);
    
    if (!filterResult.isClean) {
      setMessageViolation(filterResult);
      setShowMessageWarning(true);
      
      // Log violation for admin review
      if (filterResult.shouldFlag) {
        await logChatViolation(currentUser.uid, messageText, filterResult.violations, 'chat');
        console.log('🚨 Message violation flagged for admin review');
      }
      
      // Block content without confirmation - just show error
      if (filterResult.shouldBlock || filterResult.shouldWarn) {
        const violationMsg = getChatViolationMessage(filterResult.violations, filterResult.categories);
        alert(`❌ You can't send this message: ${violationMsg}`);
        return; // Don't send the message
      }
    } else {
      setMessageViolation(null);
      setShowMessageWarning(false);
      console.log('✅ Message content passed all filters');
    }

    setSendingMessage(true);
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('📤 Sending message:', {
        senderId: currentUser.uid,
        receiverId: selectedChat.id,
        message: messageText
      });

      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        receiverId: selectedChat.id,
        senderName: currentUser.displayName || 'Anonymous User',
        senderPhoto: currentUser.photoURL || '',
        message: messageText,
        timestamp: serverTimestamp(),
        read: false,
        edited: false,
        deletedFor: [] // Array to track who deleted the message
      });
      
      console.log('✅ Message sent successfully');
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 200);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setNewMessage(messageText); // Restore message if failed
      alert('Failed to send message: ' + error.message);
    }
    
    setSendingMessage(false);
  };

  const handleDeleteMessage = async (messageId, deleteType) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        alert('Message not found');
        return;
      }

      const messageData = messageDoc.data();
      
      if (deleteType === 'everyone') {
        // Only sender can delete for everyone
        if (messageData.senderId !== currentUser.uid) {
          alert('You can only delete your own messages for everyone');
          return;
        }
        
        // Delete the entire message document
        await deleteDoc(messageRef);
        console.log('🗑️ Message deleted for everyone');
      } else {
        // Delete for me only - add current user to deletedFor array
        const currentDeletedFor = messageData.deletedFor || [];
        if (!currentDeletedFor.includes(currentUser.uid)) {
          await updateDoc(messageRef, {
            deletedFor: [...currentDeletedFor, currentUser.uid]
          });
          console.log('🗑️ Message deleted for current user only');
        }
      }
      
      setShowMessageOptions(null);
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      alert('Failed to delete message: ' + error.message);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) {
      alert('Message cannot be empty');
      return;
    }

    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        message: editText.trim(),
        edited: true,
        editedAt: serverTimestamp()
      });
      
      setEditingMessage(null);
      setEditText('');
      setShowMessageOptions(null);
      console.log('✏️ Message edited successfully');
    } catch (error) {
      console.error('❌ Error editing message:', error);
      alert('Failed to edit message: ' + error.message);
    }
  };

  const startEdit = (message) => {
    setEditingMessage(message.id);
    setEditText(message.message);
    setShowMessageOptions(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // Long press handlers
  const handleMouseDown = (message) => {
    if (!message.senderId || message.senderId !== currentUser.uid) return;
    
    const timer = setTimeout(() => {
      setShowMessageOptions(message.id);
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchStart = (message) => {
    if (!message.senderId || message.senderId !== currentUser.uid) return;
    
    const timer = setTimeout(() => {
      setShowMessageOptions(message.id);
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageOptions && !event.target.closest('.message')) {
        setShowMessageOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMessageOptions]);

  // Fetch users that current user is following
  const fetchFollowedUsers = () => {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followed = [];
      snapshot.forEach((doc) => {
        followed.push(doc.data().followingId);
      });
      setFollowedUsers(followed);
    });

    return unsubscribe;
  };

  const handleFollow = async (userId, userName) => {
    if (isGuest()) {
      alert('Please sign up or log in to follow users');
      return;
    }

    setFollowingUser(userId);
    
    try {
      const isFollowing = followedUsers.includes(userId);
      
      if (isFollowing) {
        // Unfollow: remove from follows collection
        const q = query(
          collection(db, 'follows'),
          where('followerId', '==', currentUser.uid),
          where('followingId', '==', userId)
        );
        
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'follows', docSnapshot.id));
        });
        
        console.log(`✅ Unfollowed ${userName}`);
      } else {
        // Follow: add to follows collection
        await addDoc(collection(db, 'follows'), {
          followerId: currentUser.uid,
          followingId: userId,
          followerName: currentUser.displayName || 'Anonymous User',
          followingName: userName,
          timestamp: serverTimestamp()
        });
        
        console.log(`✅ Now following ${userName}`);
      }
    } catch (error) {
      console.error('❌ Error updating follow status:', error);
      alert('Failed to update follow status: ' + error.message);
    }
    
    setFollowingUser(null);
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
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={20} />
            Messages
          </button>
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <UserPlus size={20} />
            Requests
            {friendRequests.length > 0 && <span className="badge">{friendRequests.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.isRead).length}</span>
            )}
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
                {friends.map((friend) => {
                  const isFollowing = followedUsers.includes(friend.id);
                  const isProcessing = followingUser === friend.id;
                  
                  return (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-avatar" onClick={() => navigate(`/profile/${friend.id}`)}>
                        <img src={friend.photoURL || 'https://via.placeholder.com/40'} alt="Avatar" />
                      </div>
                      <div className="friend-info" onClick={() => navigate(`/profile/${friend.id}`)}>
                        <strong>{friend.displayName || 'Anonymous User'}</strong>
                        <p>Click to view profile</p>
                      </div>
                      <div className="friend-actions">
                        <button 
                          className="message-friend-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChat(friend);
                          }}
                        >
                          💬 Message
                        </button>
                        <button 
                          className={`follow-btn ${isFollowing ? 'following' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollow(friend.id, friend.displayName || 'Anonymous User');
                          }}
                          disabled={isProcessing}
                        >
                          {isProcessing ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-tab">
            {/* Chat Interface */}
            {selectedChat && (
              <>
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
                  
                  <div className="chat-messages" id="chat-messages">
                    {(() => {
                      const filteredMessages = messages.filter(msg => 
                        (msg.senderId === selectedChat.id && msg.receiverId === currentUser.uid) ||
                        (msg.senderId === currentUser.uid && msg.receiverId === selectedChat.id)
                      );
                      
                      console.log('💬 Chat Debug Info:', {
                        currentUserId: currentUser.uid,
                        selectedChatId: selectedChat.id,
                        totalMessages: messages.length,
                        filteredMessages: filteredMessages.length,
                        allMessages: messages.map(m => ({
                          id: m.id,
                          senderId: m.senderId,
                          receiverId: m.receiverId,
                          message: m.message
                        }))
                      });
                      
                      return filteredMessages
                        .filter(message => !message.deletedFor?.includes(currentUser.uid)) // Filter out messages deleted by current user
                        .map((message) => {
                          const isOwnMessage = message.senderId === currentUser.uid;
                          const isEditing = editingMessage === message.id;
                          
                          return (
                            <div 
                              key={message.id} 
                              className={`message ${isOwnMessage ? 'sent' : 'received'} ${showMessageOptions === message.id ? 'message-selected' : ''}`}
                              onMouseDown={() => handleMouseDown(message)}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseUp}
                              onTouchStart={() => handleTouchStart(message)}
                              onTouchEnd={handleTouchEnd}
                              onTouchCancel={handleTouchEnd}
                            >
                              <div className="message-content">
                                {isEditing ? (
                                  <div className="edit-input-container">
                                    <input
                                      type="text"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="edit-input"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleEditMessage(message.id);
                                        }
                                      }}
                                    />
                                    <div className="edit-actions">
                                      <button 
                                        className="save-btn"
                                        onClick={() => handleEditMessage(message.id)}
                                      >
                                        <Save size={14} />
                                      </button>
                                      <button 
                                        className="cancel-btn"
                                        onClick={cancelEdit}
                                      >
                                        <XCircle size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p>{message.message}</p>
                                    {message.edited && (
                                      <span className="edited-indicator">edited</span>
                                    )}
                                  </>
                                )}
                                
                                {isOwnMessage && !isEditing && showMessageOptions === message.id && (
                                  <div className="options-menu">
                                    <button 
                                      className="option-item edit-option"
                                      onClick={() => startEdit(message)}
                                    >
                                      <Edit3 size={14} />
                                      Edit
                                    </button>
                                    <button 
                                      className="option-item delete-option"
                                      onClick={() => handleDeleteMessage(message.id, 'me')}
                                    >
                                      <Trash2 size={14} />
                                      Delete for me
                                    </button>
                                    <button 
                                      className="option-item delete-everyone-option"
                                      onClick={() => {
                                        if (window.confirm('Delete this message for everyone?')) {
                                          handleDeleteMessage(message.id, 'everyone');
                                        }
                                      }}
                                    >
                                      <Trash2 size={14} />
                                      Delete for everyone
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              <span className="message-time">
                                {message.timestamp?.toDate?.()?.toLocaleTimeString() || 'now'}
                              </span>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
                
                {/* Message content violation warning */}
                {showMessageWarning && messageViolation && (
                  <div className="message-violation-warning">
                    <div className="warning-header">
                      <AlertTriangle size={16} />
                      Inappropriate Content Detected
                    </div>
                    <div className="warning-message">
                      {getChatViolationMessage(messageViolation.violations, messageViolation.categories)}
                    </div>
                    <div className="warning-suggestion">
                      💬 Try discussing sports, training, or positive team experiences.
                    </div>
                  </div>
                )}

                {/* Fixed Message Input */}
                <form onSubmit={handleSendMessage} className="fixed-message-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleMessageChange}
                    onClick={() => setShowMessageOptions(null)} // Close options when typing
                    onFocus={() => setShowMessageOptions(null)} // Close options when focusing input
                    className={showMessageWarning ? 'content-warning' : ''}
                  />
                  <button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                    <Send size={20} />
                  </button>
                </form>
              </>
            )}
            
            {/* Friends List for Starting Conversations */}
            {!selectedChat && (
              <>
                {friends.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare size={48} />
                    <h3>No friends to message</h3>
                    <p>Add friends to start conversations!</p>
                  </div>
                ) : (
                  <div className="friends-section">
                    <h3>Start a conversation</h3>
                    <div className="friends-list">
                      {friends.map((friend) => (
                        <div key={friend.id} className="friend-item" onClick={() => setSelectedChat(friend)}>
                          <div className="friend-avatar">
                            <img src={friend.photoURL || 'https://via.placeholder.com/40'} alt="Avatar" />
                          </div>
                          <div className="friend-info">
                            <strong>{friend.displayName || 'Anonymous User'}</strong>
                            <p>Click to start messaging</p>
                          </div>
                          <div className="message-icon">
                            <MessageSquare size={20} />
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

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <h3>No notifications</h3>
                <p>Story likes and other notifications will appear here</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-content">
                      <div className="notification-header">
                        <img 
                          src={notification.senderPhotoURL || '/default-avatar.png'} 
                          alt={notification.senderName}
                          className="notification-avatar"
                        />
                        <div className="notification-info">
                          <div className="notification-text">
                            <strong>{notification.senderName}</strong> liked your story
                          </div>
                          <div className="notification-time">
                            {notification.timestamp?.toDate?.() ? 
                              new Date(notification.timestamp.toDate()).toLocaleString() :
                              new Date(notification.timestamp).toLocaleString()
                            }
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="notification-unread-dot"></div>
                        )}
                      </div>
                      
                      {/* Story Preview */}
                      <div className="story-preview">
                        {notification.storyMediaType === 'video' ? (
                          <div className="story-video-preview">
                            <video 
                              src={notification.storyThumbnail || notification.storyMediaUrl}
                              className="story-preview-media"
                              muted
                            />
                            <div className="video-play-icon">
                              <Play size={24} fill="white" />
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={notification.storyMediaUrl}
                            alt="Story"
                            className="story-preview-media"
                          />
                        )}
                        <div className="story-like-icon">
                          <Heart size={16} fill="#ff3040" />
                        </div>
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