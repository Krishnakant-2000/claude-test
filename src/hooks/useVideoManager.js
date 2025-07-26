import { useCallback, useRef } from 'react';

/**
 * Hook to manage multiple videos on a page
 * Ensures only one video plays at a time
 */
export const useVideoManager = () => {
  const activeVideoRef = useRef(null);
  const activeVideoId = useRef(null);

  const registerVideo = useCallback((videoId, videoElement) => {
    // Pause the currently active video when a new one starts
    const handlePlay = () => {
      if (activeVideoRef.current && activeVideoId.current !== videoId) {
        activeVideoRef.current.pause();
        console.log(`🎥 Paused video ${activeVideoId.current} because video ${videoId} started playing`);
      }
      activeVideoRef.current = videoElement;
      activeVideoId.current = videoId;
    };

    const handlePause = () => {
      if (activeVideoId.current === videoId) {
        activeVideoRef.current = null;
        activeVideoId.current = null;
      }
    };

    // Add event listeners
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handlePause);

    // Return cleanup function
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handlePause);
      
      if (activeVideoId.current === videoId) {
        activeVideoRef.current = null;
        activeVideoId.current = null;
      }
    };
  }, []);

  const pauseActiveVideo = useCallback(() => {
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
      console.log(`🎥 Manually paused active video ${activeVideoId.current}`);
    }
  }, []);

  return {
    registerVideo,
    pauseActiveVideo,
    activeVideoId: activeVideoId.current
  };
};