// User Reporting System for AmaPlayer
import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
import './ReportContent.css';

const ReportContent = ({ 
  contentId, 
  contentType, // 'post', 'message', 'user', 'comment'
  contentOwnerId,
  contentPreview,
  onClose 
}) => {
  const { currentUser, isGuest } = useAuth();
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = {
    inappropriate_content: {
      label: 'Inappropriate Content',
      description: 'Sexual, violent, or graphic content',
      category: 'content'
    },
    politics: {
      label: 'Political Content',
      description: 'Political discussions or propaganda',
      category: 'content'
    },
    hate_speech: {
      label: 'Hate Speech',
      description: 'Discriminatory or offensive language',
      category: 'behavior'
    },
    harassment: {
      label: 'Harassment',
      description: 'Bullying or targeted harassment',
      category: 'behavior'
    },
    spam: {
      label: 'Spam',
      description: 'Promotional content or repeated posts',
      category: 'spam'
    },
    fake_news: {
      label: 'Misinformation',
      description: 'False or misleading information',
      category: 'content'
    },
    nudity: {
      label: 'Nudity',
      description: 'Explicit or suggestive imagery',
      category: 'content'
    },
    violence: {
      label: 'Violence',
      description: 'Graphic violence or threats',
      category: 'content'
    },
    drugs: {
      label: 'Drugs/Alcohol',
      description: 'Content promoting substance abuse',
      category: 'content'
    },
    other: {
      label: 'Other',
      description: 'Other policy violation',
      category: 'other'
    }
  };

  const handleReasonToggle = (reasonKey) => {
    setSelectedReasons(prev => 
      prev.includes(reasonKey)
        ? prev.filter(r => r !== reasonKey)
        : [...prev, reasonKey]
    );
  };

  const handleSubmitReport = async () => {
    if (isGuest()) {
      alert('Please sign in to report content.');
      return;
    }

    if (selectedReasons.length === 0 && !customReason.trim()) {
      alert('Please select at least one reason or provide a custom reason.');
      return;
    }

    setSubmitting(true);

    try {
      const reportData = {
        contentId,
        contentType,
        contentOwnerId,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || 'Anonymous User',
        reporterEmail: currentUser.email,
        reasons: selectedReasons,
        customReason: customReason.trim(),
        contentPreview: contentPreview?.substring(0, 500) || null, // Limit preview length
        timestamp: serverTimestamp(),
        status: 'pending', // pending, reviewed, resolved, dismissed
        priority: determinePriority(selectedReasons),
        moderatorNotes: null,
        actionTaken: null
      };

      console.log('📋 Submitting content report:', reportData);

      await addDoc(collection(db, 'contentReports'), reportData);

      console.log('✅ Report submitted successfully');
      setSubmitted(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }

    setSubmitting(false);
  };

  const determinePriority = (reasons) => {
    const highPriorityReasons = ['hate_speech', 'harassment', 'violence', 'nudity'];
    const mediumPriorityReasons = ['inappropriate_content', 'fake_news'];
    
    if (reasons.some(r => highPriorityReasons.includes(r))) return 'high';
    if (reasons.some(r => mediumPriorityReasons.includes(r))) return 'medium';
    return 'low';
  };

  const getContentTypeDisplay = () => {
    const types = {
      post: '📝 Post',
      message: '💬 Message',
      user: '👤 User Profile',
      comment: '💭 Comment'
    };
    return types[contentType] || contentType;
  };

  if (submitted) {
    return (
      <div className="report-modal-overlay" onClick={onClose}>
        <div className="report-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="report-header">
            <h3>✅ Report Submitted</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="success-message">
            <p>Thank you for helping keep AmaPlayer safe! Your report has been submitted and will be reviewed by our moderation team.</p>
            <p><strong>Report ID:</strong> #{Date.now().toString(36).toUpperCase()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-header">
          <div className="report-title">
            <Flag size={20} />
            <h3>Report Content</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="report-content">
          <div className="content-info">
            <p><strong>Reporting:</strong> {getContentTypeDisplay()}</p>
            {contentPreview && (
              <div className="content-preview">
                <strong>Content:</strong>
                <p>"{contentPreview.substring(0, 100)}..."</p>
              </div>
            )}
          </div>

          <div className="report-reasons">
            <h4>Why are you reporting this content?</h4>
            <p className="help-text">Select all that apply:</p>

            <div className="reasons-grid">
              {Object.entries(reportReasons).map(([key, reason]) => (
                <label key={key} className="reason-option">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(key)}
                    onChange={() => handleReasonToggle(key)}
                  />
                  <div className="reason-content">
                    <div className="reason-label">{reason.label}</div>
                    <div className="reason-description">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="custom-reason">
            <label htmlFor="custom-reason">Additional details (optional):</label>
            <textarea
              id="custom-reason"
              placeholder="Provide additional context about why this content violates our community guidelines..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              maxLength={500}
            />
            <div className="char-count">{customReason.length}/500</div>
          </div>

          <div className="report-notice">
            <p><strong>Please note:</strong> False reports may result in account restrictions. Reports are reviewed by our moderation team within 24-48 hours.</p>
          </div>

          <div className="report-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="submit-btn" 
              onClick={handleSubmitReport}
              disabled={submitting || (selectedReasons.length === 0 && !customReason.trim())}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;