// Lazy-loaded video component with performance optimizations
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useInViewport } from '../../../utils/performance/infiniteScroll';
import './LazyVideo.css';

const LazyVideo = memo(({ 
  src, 
  poster, 
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  playing = false,
  onPlay,
  onPause,
  controls = false,
  preload = 'metadata'
}) => {
  const videoRef = useRef();
  const [isPlaying, setIsPlaying] = useState(playing);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const { elementRef, hasBeenInViewport } = useInViewport({
    rootMargin: '100px',
    threshold: 0.25
  });

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error('Video play error:', error);
      setHasError(true);
    }
  }, [isPlaying, onPlay, onPause]);

  // Handle mute/unmute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  }, [isMuted]);

  // Handle fullscreen
  const enterFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitEnterFullscreen) {
      videoRef.current.webkitEnterFullscreen();
    }
  }, []);

  // Video event handlers
  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback((e) => {
    console.error('Video loading error:', e);
    setHasError(true);
    setIsLoaded(false);
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Pause video when it goes out of viewport
  useEffect(() => {
    if (!hasBeenInViewport && isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  }, [hasBeenInViewport, isPlaying]);

  // Handle playing prop changes
  useEffect(() => {
    if (playing !== isPlaying && videoRef.current && isLoaded) {
      if (playing) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing, isPlaying, isLoaded]);

  // Show loading placeholder if not in viewport yet
  if (!hasBeenInViewport) {
    return (
      <div 
        ref={elementRef} 
        className={`lazy-video-placeholder ${className}`}
        style={{ 
          backgroundImage: poster ? `url(${poster})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="video-loading">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className={`lazy-video-error ${className}`}>
        <div className="error-message">
          <p>Unable to load video</p>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className={`lazy-video-container ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        preload={preload}
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        className="lazy-video"
        controls={controls}
      />
      
      {/* Custom Controls Overlay */}
      {!controls && (
        <div className={`video-controls-overlay ${showControls ? 'visible' : ''}`}>
          <button 
            className="play-pause-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div className="video-controls-right">
            <button 
              className="mute-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button 
              className="fullscreen-btn"
              onClick={enterFullscreen}
              aria-label="Fullscreen"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {!isLoaded && (
        <div className="video-loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
      
      {/* Play Button Overlay for Non-Playing Videos */}
      {!isPlaying && isLoaded && !showControls && (
        <div className="play-button-overlay" onClick={togglePlay}>
          <button className="large-play-btn">
            <Play size={48} />
          </button>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.playing === nextProps.playing &&
    prevProps.muted === nextProps.muted
  );
});

export default LazyVideo;