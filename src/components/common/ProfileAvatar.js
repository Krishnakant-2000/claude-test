import React, { memo, useMemo } from 'react';

/**
 * Ultra-stable profile avatar component - completely flicker-free
 * No state changes, no loading transitions, just static rendering
 */
const ProfileAvatar = memo(function ProfileAvatar({
  src,
  alt,
  size = 32,
  className = '',
  style = {}
}) {
  // Memoize the image source to prevent recalculations
  const imageSource = useMemo(() => {
    if (!src) {
      return `https://via.placeholder.com/${size}x${size}/2d3748/00ff88?text=👤`;
    }
    
    // For Firebase Storage URLs, ensure proper loading
    if (src.includes('firebasestorage.googleapis.com') && !src.includes('alt=media')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}alt=media`;
    }
    
    return src;
  }, [src, size]);

  // Memoize styles to prevent re-renders
  const imageStyle = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'var(--bg-secondary, #f7fafc)',
    border: '1px solid var(--border-color, #e2e8f0)',
    display: 'block',
    flexShrink: 0, // Prevent flex shrinking
    ...style
  }), [size, style]);

  // Static error handler - no state changes
  const handleError = (e) => {
    // Immediately switch to placeholder without state updates
    e.target.src = `https://via.placeholder.com/${size}x${size}/2d3748/00ff88?text=👤`;
    e.target.onError = null; // Prevent infinite error loops
  };

  return (
    <img
      src={imageSource}
      alt={alt || 'Profile'}
      className={`profile-avatar ${className}`}
      style={imageStyle}
      onError={handleError}
      loading="eager"
      decoding="sync" // Synchronous decoding for immediate display
      draggable={false}
    />
  );
});

export default ProfileAvatar;