// Progressive image component with automatic caching as per documentation
import React, { useState, useEffect } from 'react';
import './ProgressiveImage.css';

const ProgressiveImage = ({ 
  src, 
  placeholder, 
  alt, 
  className = '', 
  onLoad,
  onError,
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '/placeholder-image.png');
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setImageError(false);
    
    // Create new image element for preloading
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Cache the image using Cache API
        if ('caches' in window) {
          const imageCache = await caches.open('images-v1');
          
          // Check if image is already cached
          const cachedResponse = await imageCache.match(src);
          if (!cachedResponse) {
            // Add to cache if not already present
            await imageCache.add(src);
          }
        }
        
        // Update component state
        setImageSrc(src);
        setImageLoaded(true);
        setLoading(false);
        
        // Call onLoad callback if provided
        if (onLoad) {
          onLoad();
        }
      } catch (error) {
        console.warn('Failed to cache image:', error);
        // Still show the image even if caching fails
        setImageSrc(src);
        setImageLoaded(true);
        setLoading(false);
        
        if (onLoad) {
          onLoad();
        }
      }
    };
    
    img.onerror = () => {
      setImageError(true);
      setLoading(false);
      
      if (onError) {
        onError();
      }
    };
    
    // Start loading the image
    img.src = src;
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  // Handle click to retry loading on error
  const handleRetryLoad = () => {
    setImageError(false);
    setImageLoaded(false);
    setLoading(true);
    
    // Trigger re-load by updating the src
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
      setLoading(false);
    };
    img.onerror = () => {
      setImageError(true);
      setLoading(false);
    };
    img.src = src;
  };

  // Render error state
  if (imageError) {
    return (
      <div className={`progressive-image-error ${className}`} {...props}>
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span className="error-text">Failed to load image</span>
          <button className="retry-button" onClick={handleRetryLoad}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`progressive-image-container ${className}`} {...props}>
      {loading && (
        <div className="progressive-image-loading">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading...</span>
        </div>
      )}
      
      <img 
        src={imageSrc}
        alt={alt}
        className={`progressive-image ${imageLoaded ? 'loaded' : 'loading'} ${loading ? 'hidden' : ''}`}
        style={{
          opacity: imageLoaded ? 1 : 0.5,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

// Higher-order component for lazy loading with intersection observer
export const LazyProgressiveImage = ({ 
  src, 
  placeholder, 
  alt, 
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  ...props 
}) => {
  const [inView, setInView] = useState(false);
  const [imageRef, setImageRef] = useState(null);

  useEffect(() => {
    if (!imageRef || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(imageRef);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imageRef);

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, threshold, rootMargin]);

  return (
    <div ref={setImageRef} className={`lazy-progressive-image ${className}`}>
      {inView ? (
        <ProgressiveImage 
          src={src}
          placeholder={placeholder}
          alt={alt}
          {...props}
        />
      ) : (
        <div className="lazy-placeholder">
          <div className="lazy-placeholder-content">
            <span>📷</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;