import React, { useState, useRef, useEffect, memo } from 'react';

const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ELoading...%3C/text%3E%3C/svg%3E',
  width,
  height,
  style = {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  // Optimize image URL for compression if it's a Firebase Storage URL
  const getOptimizedImageUrl = (url) => {
    if (!url || error) return placeholder;
    
    // For Firebase Storage URLs, ensure proper loading
    if (url.includes('firebasestorage.googleapis.com')) {
      // Ensure alt=media is present for proper image loading
      if (!url.includes('alt=media')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}alt=media`;
      }
    }
    
    return url;
  };

  const imageStyle = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    background: error ? 'var(--bg-secondary)' : 'transparent'
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !error && (
        <img
          src={placeholder}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(2px)',
            opacity: 0.6
          }}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            minHeight: '200px'
          }}
        >
          <span>Failed to load image</span>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && !error && (
        <img
          src={getOptimizedImageUrl(src)}
          alt={alt}
          style={{
            ...imageStyle,
            width: '100%',
            height: 'auto',
            objectFit: style.objectFit || 'cover'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
});

export default LazyImage;