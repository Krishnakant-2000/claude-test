// Memoized feed card components for optimal performance
import React, { memo, useState, useCallback } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Play } from 'lucide-react';
import { useInViewport } from '../../../utils/performance/infiniteScroll';
import LazyImage from '../ui/LazyImage';
import LazyVideo from '../media/LazyVideo';
import './FeedCard.css';

// Base feed card with memoization
const FeedCard = memo(({ 
  item, 
  onLike, 
  onComment, 
  onShare, 
  onUserClick,
  currentUserId 
}) => {
  const { elementRef, hasBeenInViewport } = useInViewport({ 
    rootMargin: '100px',
    threshold: 0.1 
  });

  const [liked, setLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likesCount || 0);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      await onLike?.(item.id, newLiked);
    } catch (error) {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
      console.error('Error liking post:', error);
    }
  }, [liked, item.id, onLike]);

  const handleComment = useCallback((e) => {
    e.stopPropagation();
    onComment?.(item.id);
  }, [item.id, onComment]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    onShare?.(item.id);
  }, [item.id, onShare]);

  const handleUserClick = useCallback((e) => {
    e.stopPropagation();
    onUserClick?.(item.userId);
  }, [item.userId, onUserClick]);

  if (!hasBeenInViewport) {
    return (
      <div 
        ref={elementRef} 
        className="feed-card-placeholder"
        style={{ height: '400px' }}
      >
        <div className="loading-skeleton" />
      </div>
    );
  }

  return (
    <div ref={elementRef} className="feed-card">
      {/* User Header */}
      <div className="feed-card-header">
        <div className="user-info" onClick={handleUserClick}>
          <LazyImage
            src={item.userPhotoURL}
            alt={item.userDisplayName}
            className="user-avatar"
            placeholder="/default-avatar.jpg"
          />
          <div className="user-details">
            <h4 className="user-name">{item.userDisplayName}</h4>
            <span className="post-time">{formatTime(item.createdAt)}</span>
          </div>
        </div>
        <button className="more-options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      {item.caption && (
        <div className="feed-card-caption">
          <p>{item.caption}</p>
        </div>
      )}

      {/* Media Content */}
      <div className="feed-card-media">
        {item.type === 'image' && (
          <LazyImage
            src={item.mediaUrl}
            alt={item.caption || 'Post image'}
            className="feed-image"
            placeholder="/image-placeholder.jpg"
          />
        )}
        
        {item.type === 'video' && (
          <LazyVideo
            src={item.mediaUrl}
            poster={item.thumbnailUrl}
            className="feed-video"
          />
        )}
        
        {item.type === 'talent' && (
          <TalentCard talent={item} />
        )}
      </div>

      {/* Actions */}
      <div className="feed-card-actions">
        <button 
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart size={20} fill={liked ? '#e91e63' : 'none'} />
          <span>{likeCount}</span>
        </button>
        
        <button className="action-btn" onClick={handleComment}>
          <MessageCircle size={20} />
          <span>{item.commentsCount || 0}</span>
        </button>
        
        <button className="action-btn" onClick={handleShare}>
          <Share2 size={20} />
          <span>{item.sharesCount || 0}</span>
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.likesCount === nextProps.item.likesCount &&
    prevProps.item.commentsCount === nextProps.item.commentsCount &&
    prevProps.item.isLiked === nextProps.item.isLiked &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

// Memoized talent card component
const TalentCard = memo(({ talent }) => {
  const [playing, setPlaying] = useState(false);

  const handlePlayToggle = useCallback(() => {
    setPlaying(prev => !prev);
  }, []);

  return (
    <div className="talent-card">
      <div className="talent-media">
        {talent.mediaType === 'video' ? (
          <div className="talent-video-container">
            <LazyVideo
              src={talent.mediaUrl}
              poster={talent.thumbnailUrl}
              playing={playing}
              className="talent-video"
            />
            <button className="play-overlay" onClick={handlePlayToggle}>
              <Play size={48} />
            </button>
          </div>
        ) : (
          <LazyImage
            src={talent.mediaUrl}
            alt={talent.title}
            className="talent-image"
          />
        )}
      </div>
      
      <div className="talent-info">
        <h3 className="talent-title">{talent.title}</h3>
        <p className="talent-category">{talent.category}</p>
        <div className="talent-stats">
          <span className="views">{formatNumber(talent.views)} views</span>
          <span className="rating">⭐ {talent.rating}/5</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.talent.id === nextProps.talent.id &&
    prevProps.talent.views === nextProps.talent.views &&
    prevProps.talent.rating === nextProps.talent.rating
  );
});

// Memoized profile card component
const ProfileCard = memo(({ profile, onFollow, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);

  const handleFollow = useCallback(async () => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);

    try {
      await onFollow?.(profile.id, newFollowingState);
    } catch (error) {
      setIsFollowing(!newFollowingState);
      console.error('Error following user:', error);
    }
  }, [isFollowing, profile.id, onFollow]);

  return (
    <div className="profile-card">
      <div className="profile-header">
        <LazyImage
          src={profile.photoURL}
          alt={profile.displayName}
          className="profile-avatar large"
        />
        <div className="profile-info">
          <h3 className="profile-name">{profile.displayName}</h3>
          <p className="profile-bio">{profile.bio}</p>
          <div className="profile-stats">
            <span>{formatNumber(profile.followersCount)} followers</span>
            <span>{formatNumber(profile.postsCount)} posts</span>
          </div>
        </div>
      </div>
      
      {currentUserId !== profile.id && (
        <button 
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
          onClick={handleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.profile.id === nextProps.profile.id &&
    prevProps.profile.followersCount === nextProps.profile.followersCount &&
    prevProps.profile.isFollowing === nextProps.profile.isFollowing &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

// Utility functions
const formatTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default FeedCard;
export { TalentCard, ProfileCard };