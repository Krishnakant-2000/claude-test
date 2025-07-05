import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import './VideoPlayer.css';

export default function VideoPlayer({ 
  src, 
  poster = null, 
  autoPlay = false, 
  loop = false, 
  muted = false,
  controls = true,
  className = '',
  onPlay = null,
  onPause = null,
  onEnded = null
}) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout;
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressClick = (e) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(pos * 100);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (onPause) onPause();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <div 
      className={`video-player ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {loading && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      )}

      {error && (
        <div className="video-error">
          <p>Error loading video</p>
          <button onClick={() => window.location.reload()} aria-label="Retry">Retry</button>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        className="video-element"
      />

      {controls && !loading && !error && (
        <div className={`video-controls ${showControls ? 'visible' : ''}`} data-testid="video-controls">
          {/* Play overlay for center of video */}
          <div className="play-overlay" onClick={togglePlayPause} data-testid="play-overlay">
            {!isPlaying && (
              <div className="play-button-center">
                <Play size={60} fill="currentColor" />
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="controls-bottom">
            {/* Progress bar */}
            <div 
              className="progress-container"
              ref={progressRef}
              onClick={handleProgressClick}
              data-testid="progress-container"
            >
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                  data-testid="progress-fill"
                ></div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="controls-row">
              <div className="controls-left">
                <button 
                  onClick={togglePlayPause} 
                  className="control-btn"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button onClick={restart} className="control-btn" aria-label="Restart">
                  <RotateCcw size={20} />
                </button>

                <div className="volume-container">
                  <button onClick={toggleMute} className="control-btn" aria-label="Volume">
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>

                <div className="time-display">
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>

              <div className="controls-right">
                <button onClick={toggleFullscreen} className="control-btn" aria-label="Fullscreen">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}