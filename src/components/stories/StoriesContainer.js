// Stories Container - Main component for displaying stories on Home page
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StoriesService } from '../../firebase/storiesService';
import { Plus, Play } from 'lucide-react';
import StoryViewer from './StoryViewer';
import StoryUpload from './StoryUpload';
import './Stories.css';

export default function StoriesContainer() {
  const { currentUser, isGuest } = useAuth();
  const [stories, setStories] = useState([]);
  const [groupedStories, setGroupedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  useEffect(() => {
    
    // Set up real-time listener for active stories
    const unsubscribe = StoriesService.onActiveStoriesUpdate((activeStories) => {
      setStories(activeStories);
      
      // Group stories by user
      const grouped = groupStoriesByUser(activeStories);
      setGroupedStories(grouped);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const groupStoriesByUser = useCallback((storiesArray) => {
    const grouped = {};
    
    storiesArray.forEach(story => {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          userId: story.userId,
          userDisplayName: story.userDisplayName,
          userPhotoURL: story.userPhotoURL,
          stories: [],
          hasUnviewedStories: false
        };
      }
      
      grouped[story.userId].stories.push(story);
      
      // Check if user has unviewed stories
      const viewers = story.viewers || [];
      if (currentUser && !viewers.includes(currentUser.uid)) {
        grouped[story.userId].hasUnviewedStories = true;
      }
    });
    
    // Convert to array and sort (current user first, then by most recent story)
    const groupedArray = Object.values(grouped).sort((a, b) => {
      // Current user first
      if (currentUser) {
        if (a.userId === currentUser.uid) return -1;
        if (b.userId === currentUser.uid) return 1;
      }
      
      // Then by most recent story
      const aLatest = Math.max(...a.stories.map(s => s.timestamp?.toDate?.()?.getTime() || 0));
      const bLatest = Math.max(...b.stories.map(s => s.timestamp?.toDate?.()?.getTime() || 0));
      return bLatest - aLatest;
    });
    
    return groupedArray;
  }, [currentUser]);

  const handleStoryUploaded = useCallback((newStory) => {
    console.log('✅ New story uploaded:', newStory);
    setShowUpload(false);
    // Stories will be updated via real-time listener
  }, []);

  const handleUserStoriesClick = useCallback((userStories, startIndex = 0) => {
    console.log('👁️ Opening user stories:', userStories.userDisplayName);
    setSelectedUserStories(userStories);
    setSelectedStoryIndex(startIndex);
  }, []);

  const closeStoryViewer = useCallback(() => {
    setSelectedUserStories(null);
    setSelectedStoryIndex(0);
  }, []);

  const handleStoryNavigation = useCallback((direction) => {
    if (!selectedUserStories) return;
    
    if (direction === 'next') {
      if (selectedStoryIndex < selectedUserStories.stories.length - 1) {
        setSelectedStoryIndex(selectedStoryIndex + 1);
      } else {
        // Move to next user's stories
        const currentUserIndex = groupedStories.findIndex(
          group => group.userId === selectedUserStories.userId
        );
        if (currentUserIndex < groupedStories.length - 1) {
          const nextUserStories = groupedStories[currentUserIndex + 1];
          setSelectedUserStories(nextUserStories);
          setSelectedStoryIndex(0);
        } else {
          closeStoryViewer();
        }
      }
    } else if (direction === 'prev') {
      if (selectedStoryIndex > 0) {
        setSelectedStoryIndex(selectedStoryIndex - 1);
      } else {
        // Move to previous user's stories
        const currentUserIndex = groupedStories.findIndex(
          group => group.userId === selectedUserStories.userId
        );
        if (currentUserIndex > 0) {
          const prevUserStories = groupedStories[currentUserIndex - 1];
          setSelectedUserStories(prevUserStories);
          setSelectedStoryIndex(prevUserStories.stories.length - 1);
        }
      }
    }
  }, [selectedUserStories, selectedStoryIndex, groupedStories, closeStoryViewer]);


  if (loading) {
    return (
      <div className="stories-container">
        <div className="stories-loading">
          <div className="loading-spinner"></div>
          <span>Loading stories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stories-container">
      <div className="stories-header">
        <h3>Stories</h3>
        <span className="stories-count">{stories.length} active</span>
      </div>
      
      <div className="stories-scroll">
        {/* Add Story Button - Only for authenticated users */}
        {!isGuest() && (
          <div 
            className="story-item add-story-item"
            onClick={() => setShowUpload(true)}
          >
            <div className="story-avatar add-story-avatar">
              <img 
                src={currentUser?.photoURL || 'https://via.placeholder.com/60'} 
                alt="Your avatar" 
              />
              <div className="add-story-icon">
                <Plus size={20} />
              </div>
            </div>
            <span className="story-username">Add Story</span>
          </div>
        )}
        
        {/* User Stories */}
        {groupedStories.map((userGroup) => (
          <div 
            key={userGroup.userId}
            className="story-item"
            onClick={() => handleUserStoriesClick(userGroup)}
          >
            <div className={`story-avatar ${userGroup.hasUnviewedStories ? 'unviewed' : 'viewed'}`}>
              <img 
                src={
                  userGroup.userId === currentUser?.uid 
                    ? (currentUser?.photoURL || 'https://via.placeholder.com/60')
                    : (userGroup.userPhotoURL || 'https://via.placeholder.com/60')
                } 
                alt={userGroup.userDisplayName}
                onLoad={() => {}}
              />
              {userGroup.stories.some(s => s.mediaType === 'video') && (
                <div className="story-media-indicator">
                  <Play size={12} />
                </div>
              )}
              <div className="stories-count-badge">
                {userGroup.stories.length}
              </div>
            </div>
            <span className="story-username">
              {userGroup.userId === currentUser?.uid ? 'You' : userGroup.userDisplayName}
            </span>
          </div>
        ))}
        
      </div>
      
      {/* Story Upload Modal */}
      {showUpload && (
        <StoryUpload 
          onStoryUploaded={handleStoryUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}
      
      {/* Story Viewer Modal */}
      {selectedUserStories && (
        <StoryViewer
          userStories={selectedUserStories}
          currentStoryIndex={selectedStoryIndex}
          onClose={closeStoryViewer}
          onNavigate={handleStoryNavigation}
        />
      )}
    </div>
  );
}