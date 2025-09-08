// Verification Badge Component - Shows verification status next to profile image
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import VerificationService from '../../../pages/verification/verificationService';
import ShareVerificationModal from '../modals/ShareVerificationModal';
import './VerificationBadge.css';

const VerificationBadge = ({ 
  profile, 
  isOwnProfile, 
  onVerificationRequest,
  showTooltip = true 
}) => {
  const { currentUser, isGuest } = useAuth();
  const [verificationRequest, setVerificationRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (isOwnProfile && currentUser && !profile?.isVerified) {
      fetchVerificationRequest().catch(error => {
        console.error('Failed to fetch verification request:', error);
        // Don't crash the component on network errors
      });
    }
  }, [isOwnProfile, currentUser, profile?.isVerified]);

  const fetchVerificationRequest = async () => {
    try {
      const request = await VerificationService.getUserVerificationRequest(currentUser.uid);
      setVerificationRequest(request);
    } catch (error) {
      console.error('Error fetching verification request:', error);
    }
  };

  const handleRequestVerification = async () => {
    if (!currentUser || (isGuest && isGuest())) {
      alert('Please sign up or log in to request verification');
      return;
    }

    setLoading(true);
    try {
      // Check eligibility first
      const eligibility = await VerificationService.canRequestVerification(currentUser.uid);
      if (!eligibility.canRequest) {
        alert(eligibility.reason);
        setLoading(false);
        return;
      }

      // Call parent handler to open verification request modal
      if (onVerificationRequest) {
        onVerificationRequest();
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      alert('Failed to request verification. Please try again.');
    }
    setLoading(false);
  };

  const handleShareVerification = () => {
    if (verificationRequest && verificationRequest.status === 'pending') {
      setShowShareModal(true);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      athlete: '🏆',
      coach: '🏃‍♂️',
      organisation: '🏢'
    };
    return icons[role] || '🏆';
  };

  const getVerificationProgress = () => {
    if (!verificationRequest) return null;
    
    const { verificationCount, verificationGoal } = verificationRequest;
    const percentage = Math.min(100, (verificationCount / verificationGoal) * 100);
    
    return {
      current: verificationCount,
      goal: verificationGoal,
      percentage,
      remaining: Math.max(0, verificationGoal - verificationCount)
    };
  };

  // Verified user badge
  if (profile?.isVerified) {
    const badge = profile.verificationBadge || VerificationService.getRoleBadge(profile.role || 'athlete');
    
    return (
      <div className="verification-container verified">
        <div className="verification-badge verified-badge" title={badge.label}>
          <span className="badge-icon">{badge.icon}</span>
          <span className="badge-checkmark">✓</span>
        </div>
        {showTooltip && (
          <div className="verification-tooltip">
            {badge.label}
          </div>
        )}
      </div>
    );
  }

  // Own profile - show request button or pending status
  if (isOwnProfile && (!isGuest || !isGuest())) {
    // Has pending verification request
    if (verificationRequest && verificationRequest.status === 'pending') {
      const progress = getVerificationProgress();
      
      return (
        <>
          <div className="verification-container pending">
            <button 
              className="verification-badge pending-badge clickable" 
              title="Click to share verification link"
              onClick={handleShareVerification}
            >
              <span className="badge-icon">⏳</span>
              <span className="progress-count">{progress.current}/{progress.goal}</span>
            </button>
            {showTooltip && (
              <div className="verification-tooltip">
                Verification in progress<br />
                {progress.remaining} more verification{progress.remaining !== 1 ? 's' : ''} needed<br />
                <strong>Click to share link again</strong>
              </div>
            )}
          </div>
          
          <ShareVerificationModal 
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            verificationRequest={verificationRequest}
          />
        </>
      );
    }

    // Show request verification button
    return (
      <div className="verification-container request">
        <button 
          className="verification-badge request-badge"
          onClick={handleRequestVerification}
          disabled={loading}
          title="Request verification"
        >
          <span className="badge-icon">{loading ? '⏳' : '⭐'}</span>
        </button>
        {showTooltip && (
          <div className="verification-tooltip">
            {loading ? 'Checking eligibility...' : 'Request verification'}
          </div>
        )}
      </div>
    );
  }

  // Other user's profile - don't show anything if not verified
  return null;
};

export default VerificationBadge;