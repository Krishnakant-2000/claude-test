// Advanced feed page with infinite scroll and performance optimizations
import React, { memo, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInfiniteScroll } from '../../utils/performance/infiniteScroll';
import { useDebounce } from '../../utils/performance/optimization';
import FeedCard, { TalentCard, ProfileCard } from '../../components/common/feed/FeedCard';
import { LoadingFallback } from '../../utils/performance/lazyLoading';
import { RefreshCw, Filter, Search, Plus } from 'lucide-react';
import './FeedPage.css';

// Lazy-loaded components for better performance
const ProfileDetailModal = lazy(() => import('../profile/ProfileDetailModal'));
const CommentModal = lazy(() => import('../../components/common/modals/CommentModal'));
const ShareModal = lazy(() => import('../../components/common/modals/ShareModal'));
const FilterModal = lazy(() => import('../../components/common/modals/FilterModal'));

// Mock API functions (replace with real API calls)
const feedAPI = {
  fetchFeedItems: async (page, pageSize, filters = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data generation
    const items = Array.from({ length: pageSize }, (_, index) => {
      const id = (page - 1) * pageSize + index;
      const types = ['image', 'video', 'talent', 'profile'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        id: `item-${id}`,
        type,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userDisplayName: `User ${Math.floor(Math.random() * 100)}`,
        userPhotoURL: `https://picsum.photos/100/100?random=${id}`,
        caption: `This is a sample ${type} post #${id}`,
        mediaUrl: type === 'video' 
          ? `https://sample-videos.com/zip/10/mp4/SampleVideo_${Math.random() > 0.5 ? '720x480' : '1280x720'}_1mb.mp4`
          : `https://picsum.photos/800/600?random=${id}`,
        thumbnailUrl: type === 'video' ? `https://picsum.photos/800/450?random=${id}` : null,
        likesCount: Math.floor(Math.random() * 1000),
        commentsCount: Math.floor(Math.random() * 100),
        sharesCount: Math.floor(Math.random() * 50),
        isLiked: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Within last week
        views: type === 'video' ? Math.floor(Math.random() * 10000) : undefined,
        rating: type === 'talent' ? (Math.random() * 2 + 3).toFixed(1) : undefined,
        category: type === 'talent' ? ['Sports', 'Music', 'Dance', 'Art'][Math.floor(Math.random() * 4)] : undefined,
        followersCount: type === 'profile' ? Math.floor(Math.random() * 10000) : undefined,
        postsCount: type === 'profile' ? Math.floor(Math.random() * 500) : undefined,
        isFollowing: type === 'profile' ? Math.random() > 0.5 : undefined,
        bio: type === 'profile' ? 'This is a sample bio for the profile card.' : undefined
      };
    });
    
    return items;
  },
  
  likePost: async (postId, liked) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, liked };
  },
  
  followUser: async (userId, following) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, following };
  }
};

const FeedPage = memo(() => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Infinite scroll implementation
  const {
    items,
    loading,
    error,
    hasMore,
    refresh,
    retry,
    containerRef
  } = useInfiniteScroll({
    fetchMore: useCallback(async (page, pageSize) => {
      return await feedAPI.fetchFeedItems(page, pageSize, {
        search: debouncedSearch,
        ...filters
      });
    }, [debouncedSearch, filters]),
    pageSize: 10,
    hasMore: true
  });

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return items;
    
    return items.filter(item => 
      item.caption?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.userDisplayName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [items, debouncedSearch]);

  // Event handlers
  const handleLike = useCallback(async (itemId, liked) => {
    try {
      await feedAPI.likePost(itemId, liked);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }, []);

  const handleComment = useCallback((itemId) => {
    setSelectedItem(items.find(item => item.id === itemId));
    setActiveModal('comment');
  }, [items]);

  const handleShare = useCallback((itemId) => {
    setSelectedItem(items.find(item => item.id === itemId));
    setActiveModal('share');
  }, [items]);

  const handleUserClick = useCallback((userId) => {
    setSelectedItem({ userId });
    setActiveModal('profile');
  }, []);

  const handleFollow = useCallback(async (userId, following) => {
    try {
      await feedAPI.followUser(userId, following);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedItem(null);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    refresh();
  }, [refresh]);

  const openFilters = useCallback(() => {
    setActiveModal('filter');
  }, []);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    refresh();
    closeModal();
  }, [refresh, closeModal]);

  // Render different card types
  const renderFeedCard = useCallback((item) => {
    const commonProps = {
      key: item.id,
      item,
      currentUserId: currentUser?.uid,
      onLike: handleLike,
      onComment: handleComment,
      onShare: handleShare,
      onUserClick: handleUserClick
    };

    switch (item.type) {
      case 'profile':
        return (
          <ProfileCard
            {...commonProps}
            profile={item}
            onFollow={handleFollow}
          />
        );
      case 'talent':
        return <FeedCard {...commonProps} />;
      default:
        return <FeedCard {...commonProps} />;
    }
  }, [currentUser, handleLike, handleComment, handleShare, handleUserClick, handleFollow]);

  return (
    <div className="feed-page">
      {/* Header */}
      <div className="feed-header">
        <div className="feed-title">
          <h1>AmaPlayer Feed</h1>
          <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="feed-controls">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search posts, users, talents..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <button className="filter-btn" onClick={openFilters}>
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="feed-content" ref={containerRef}>
        {error && (
          <div className="error-state">
            <p>Failed to load feed content</p>
            <button onClick={retry} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!error && filteredItems.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <Plus size={48} />
            </div>
            <h3>No Content Yet</h3>
            <p>Start following users or create your first post to see content here!</p>
          </div>
        )}

        {/* Feed Items */}
        <div className="feed-list">
          {filteredItems.map(renderFeedCard)}
          
          {/* Loading Trigger for Infinite Scroll */}
          {hasMore && (
            <div className="loading-trigger">
              {loading && (
                <div className="loading-more">
                  <div className="loading-spinner" />
                  <p>Loading more content...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lazy-loaded Modals */}
      <Suspense fallback={<LoadingFallback />}>
        {activeModal === 'profile' && selectedItem && (
          <ProfileDetailModal
            userId={selectedItem.userId}
            onClose={closeModal}
          />
        )}
        
        {activeModal === 'comment' && selectedItem && (
          <CommentModal
            post={selectedItem}
            onClose={closeModal}
          />
        )}
        
        {activeModal === 'share' && selectedItem && (
          <ShareModal
            post={selectedItem}
            onClose={closeModal}
          />
        )}
        
        {activeModal === 'filter' && (
          <FilterModal
            currentFilters={filters}
            onApply={applyFilters}
            onClose={closeModal}
          />
        )}
      </Suspense>
    </div>
  );
});

export default FeedPage;