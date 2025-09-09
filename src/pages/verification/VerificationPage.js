// Public Verification Page - Allow anyone to verify a user
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerificationService from './verificationService';
import { DeviceFingerprint } from '../../utils/deviceFingerprint';
import { Play, CheckCircle, Clock, Users, Video, User, Smartphone } from 'lucide-react';
import './VerificationPage.css';

const VerificationPage = () => {
  const { verificationId } = useParams();
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [verificationStats, setVerificationStats] = useState(null);
  const [hasVerified, setHasVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (verificationId) {
      fetchVerificationData();
    }
  }, [verificationId]);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching verification data for ID:', verificationId);
      const data = await VerificationService.getVerificationRequest(verificationId);
      console.log('📄 Verification data received:', data);
      
      if (!data) {
        console.log('❌ No verification data found');
        setError('Verification request not found or has expired.');
        setLoading(false);
        return;
      }
      
      setVerificationData(data);
      
      // Get verification statistics
      const stats = await VerificationService.getVerificationStats(verificationId);
      setVerificationStats(stats);
      
      // Check if device has already verified using device fingerprinting
      const deviceId = DeviceFingerprint.getDeviceId();
      const hasVerifiedFromDevice = data.verifiedDevices && data.verifiedDevices.includes(deviceId);
      const hasVerifiedFromStorage = localStorage.getItem(`verified_${verificationId}`);
      setHasVerified(hasVerifiedFromDevice || !!hasVerifiedFromStorage);
      
      console.log('🔍 Device verification check:', {
        deviceId: deviceId.substring(0, 12) + '...',
        hasVerifiedFromDevice,
        hasVerifiedFromStorage: !!hasVerifiedFromStorage,
        totalVerified: data.verifiedDevices?.length || 0
      });
      
    } catch (error) {
      console.error('Error fetching verification data:', error);
      setError('Failed to load verification request. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyUser = async () => {
    if (hasVerified || verifying || !verificationData) return;
    
    setVerifying(true);
    setError('');
    
    try {
      // Get device info for verification (replaces IP-based tracking)
      const deviceId = DeviceFingerprint.getDeviceId();
      const deviceInfo = DeviceFingerprint.getDeviceInfo();
      
      console.log('🔄 Submitting verification:', {
        verificationId,
        deviceId: deviceId.substring(0, 12) + '...',
        browser: deviceInfo.browser.name,
        platform: deviceInfo.browser.platform
      });
      
      const voterInfo = {
        ip: 'browser_ip', // Keep for analytics but not primary check
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date(),
        deviceFingerprint: deviceInfo.fingerprint
      };
      
      const result = await VerificationService.submitVerification(verificationId, voterInfo);
      
      if (result.success) {
        // Mark as verified in local storage (backup check)
        localStorage.setItem(`verified_${verificationId}`, 'true');
        localStorage.setItem(`device_verified_${verificationId}`, deviceId);
        setHasVerified(true);
        
        // Update stats
        setVerificationStats(prev => ({
          ...prev,
          current: result.newCount,
          remaining: result.remaining,
          percentage: Math.min(100, (result.newCount / prev.goal) * 100),
          isComplete: result.isComplete
        }));
        
        console.log('✅ Verification successful:', {
          newCount: result.newCount,
          remaining: result.remaining,
          isComplete: result.isComplete,
          deviceId: result.deviceId
        });
        
        // Show success message with device info
        if (result.isComplete) {
          alert(`🎉 Congratulations! ${verificationData.userDisplayName} is now verified!\nDevice: ${deviceInfo.browser.name} on ${deviceInfo.browser.platform}`);
        } else {
          alert(`✅ Thank you for verifying from ${deviceInfo.browser.name}!\n${result.remaining} more verification${result.remaining !== 1 ? 's' : ''} needed.`);
        }
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      setError(error.message || 'Failed to submit verification. Please try again.');
    }
    
    setVerifying(false);
  };

  const handleVideoPlay = (video) => {
    setPlayingVideo(video);
  };

  const handleCloseVideo = () => {
    setPlayingVideo(null);
  };

  const handleGoToApp = () => {
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    const icons = {
      athlete: '🏆',
      coach: '🏃‍♂️',
      organisation: '🏢'
    };
    return icons[role] || '🏆';
  };

  if (loading) {
    return (
      <div className="verification-page loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading verification request...</h2>
        </div>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="verification-page error">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Verification Not Found</h2>
          <p>{error || 'This verification request does not exist or has expired.'}</p>
          <button className="btn-primary" onClick={handleGoToApp}>
            Go to AmaPlayer
          </button>
        </div>
      </div>
    );
  }

  const isComplete = verificationStats?.isComplete;

  return (
    <div className="verification-page">
      {/* Header */}
      <div className="verification-header">
        <div className="app-branding">
          <h1>AmaPlayer</h1>
          <span className="tagline">Sports Social Network</span>
        </div>
        <button className="explore-btn" onClick={handleGoToApp}>
          Explore More
        </button>
      </div>

      {/* Main Content */}
      <div className="verification-content">
        {/* User Profile Section */}
        <div className="user-profile-section">
          <div className="profile-card">
            <div className="profile-image-container">
              <img 
                src={verificationData.userPhotoURL || 'https://via.placeholder.com/120'} 
                alt="Profile" 
                className="profile-image"
              />
              <div className="role-badge">
                <span className="role-icon">{getRoleIcon(verificationData.userRole)}</span>
                <span className="role-text">{verificationData.userRole}</span>
              </div>
            </div>
            
            <div className="profile-info">
              <h2>{verificationData.userDisplayName}</h2>
              <p className="verification-request-text">
                wants to be verified as a <strong>{verificationData.userRole}</strong>
              </p>
              
              {verificationData.userInfo?.bio && (
                <p className="bio">{verificationData.userInfo.bio}</p>
              )}
              
              <div className="user-details">
                {verificationData.userInfo?.age && (
                  <span className="detail-item">Age: {verificationData.userInfo.age}</span>
                )}
                {verificationData.userInfo?.location && (
                  <span className="detail-item">📍 {verificationData.userInfo.location}</span>
                )}
                {verificationData.userInfo?.sport && (
                  <span className="detail-item">🏃 {verificationData.userInfo.sport}</span>
                )}
              </div>
            </div>
          </div>

          {/* Verification Progress */}
          <div className="verification-progress">
            <div className="progress-header">
              <h3>
                <Users size={20} />
                Verification Progress
              </h3>
              <div className="progress-stats">
                <span className="current-count">{verificationStats?.current || 0}</span>
                <span className="divider">/</span>
                <span className="goal-count">{verificationStats?.goal || 4}</span>
              </div>
            </div>
            
            
            <div className="progress-text">
              {isComplete ? (
                <span className="completed">
                  <CheckCircle size={16} />
                  Verification Complete!
                </span>
              ) : (
                <span className="pending">
                  <Clock size={16} />
                  {verificationStats?.remaining || 4} more verification{(verificationStats?.remaining || 4) !== 1 ? 's' : ''} needed
                </span>
              )}
            </div>

            {/* Device Info Display */}
            {!isComplete && (
              <div className="device-info">
                <div className="device-info-header">
                  <Smartphone size={16} />
                  <span>Device Tracking</span>
                </div>
                <div className="device-details">
                  {(() => {
                    const deviceInfo = DeviceFingerprint.getDeviceInfo();
                    return (
                      <div className="device-details-content">
                        <span className="device-item">
                          🌐 {deviceInfo.browser.name} on {deviceInfo.browser.platform}
                        </span>
                        <span className="device-item">
                          📱 {deviceInfo.system.screen} • {deviceInfo.system.timezone}
                        </span>
                        <span className="device-note">
                          One verification per device to prevent spam
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Verification Button */}
            {!isComplete && (
              <button 
                className={`verify-btn ${hasVerified ? 'verified' : ''}`}
                onClick={handleVerifyUser}
                disabled={hasVerified || verifying}
              >
                {verifying ? (
                  <>
                    <div className="btn-spinner"></div>
                    Verifying...
                  </>
                ) : hasVerified ? (
                  <>
                    <CheckCircle size={20} />
                    You've Verified This User
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verify This User
                  </>
                )}
              </button>
            )}

            {isComplete && (
              <div className="completion-message">
                <CheckCircle size={24} color="#4CAF50" />
                <h4>{verificationData.userDisplayName} is now verified!</h4>
                <p>This user has received their verification badge.</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Videos Section */}
        {verificationData.showcaseVideos && verificationData.showcaseVideos.length > 0 && (
          <div className="videos-section">
            <h3>
              <Video size={20} />
              Talent Showcase ({verificationData.showcaseVideos.length})
            </h3>
            <div className="videos-grid">
              {verificationData.showcaseVideos.map((video, index) => (
                <div key={video.id || index} className="video-card">
                  <video 
                    src={video.videoUrl} 
                    poster={video.thumbnail}
                    className="video-thumbnail"
                    muted
                    preload="metadata"
                  />
                  <div className="video-overlay">
                    <button 
                      className="play-btn"
                      onClick={() => handleVideoPlay(video)}
                    >
                      <Play size={24} />
                    </button>
                  </div>
                  <div className="video-info">
                    <span className="video-name">{video.fileName}</span>
                    <span className="video-duration">{video.duration || '0:00'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cta-section">
          <h3>Discover More Athletes</h3>
          <p>Join AmaPlayer to connect with athletes, coaches, and sports organizations worldwide!</p>
          <button className="btn-cta" onClick={handleGoToApp}>
            <User size={20} />
            Join AmaPlayer
          </button>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="video-modal-overlay" onClick={handleCloseVideo}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <video 
              src={playingVideo.videoUrl}
              controls
              autoPlay
              className="modal-video-player"
              poster={playingVideo.thumbnail}
            />
            <button className="close-video-btn" onClick={handleCloseVideo}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;