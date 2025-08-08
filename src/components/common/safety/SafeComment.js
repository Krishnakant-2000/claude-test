// Safe Comment Component - Bulletproof comment rendering
import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import ProfileAvatar from '../ui/ProfileAvatar';
import ErrorBoundary from './ErrorBoundary';
import { ultraSafeCommentData, safenizeString, safeFormatTimestamp } from '../../../utils/rendering/safeCommentRenderer';

/**
 * Bulletproof comment rendering component that prevents React error #31
 * @param {Object} props - Component props
 * @param {Object} props.comment - Raw comment data
 * @param {number} props.index - Comment index
 * @param {string} props.currentUserId - Current user ID for delete permission
 * @param {Function} props.onDelete - Delete handler
 * @param {string} props.context - Context for debugging (e.g., 'post', 'story')
 */
const SafeComment = memo(function SafeComment({ comment, index, currentUserId, onDelete, context = 'unknown' }) {
  // First layer of protection: Safe data extraction
  const safeComment = ultraSafeCommentData(comment);
  
  // Second layer: Emergency fallback for invalid comments
  if (!safeComment.isValid) {
    return (
      <div className="comment error-comment">
        <p className="error-message">Comment could not be loaded safely</p>
      </div>
    );
  }
  
  // Third layer: Individual field protection with emergency fallbacks
  const displayName = safenizeString(safeComment.userDisplayName, 'Unknown User');
  const commentText = safenizeString(safeComment.text, 'No text');
  const userPhoto = safenizeString(safeComment.userPhotoURL, '');
  const userId = safenizeString(safeComment.userId, '');
  const commentId = safenizeString(safeComment.id, `comment-${index}`);
  
  // Debug logging for production issues
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Rendering safe comment in ${context}:`, {
      id: commentId,
      displayName,
      textLength: commentText.length,
      hasPhoto: !!userPhoto,
      canDelete: userId === currentUserId
    });
  }
  
  return (
    <ErrorBoundary componentName={`SafeComment-${context}-${index}`}>
      <div className="comment" data-comment-id={commentId}>
        <div className="comment-avatar">
          <ProfileAvatar 
            src={userPhoto} 
            alt={`${displayName} avatar`}
            size={32}
          />
        </div>
        
        <div className="comment-content">
          <div className="comment-header">
            <strong className="comment-author">
              {displayName}
            </strong>
            <span className="comment-time">
              {safeFormatTimestamp(safeComment.timestamp)}
            </span>
          </div>
          <p className="comment-text">
            {commentText}
          </p>
        </div>
        
        {userId === currentUserId && onDelete && (
          <button 
            className="delete-comment-btn"
            onClick={() => onDelete(index, commentId)}
            title="Delete comment"
            aria-label={`Delete comment by ${displayName}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
});

/**
 * Safe Comments List Component - Renders multiple comments safely
 */
export const SafeCommentsList = memo(function SafeCommentsList({ 
  comments, 
  currentUserId, 
  onDelete, 
  context = 'unknown',
  emptyMessage = 'No comments yet. Be the first to comment!'
}) {
  // Validate and sanitize comments array
  if (!Array.isArray(comments)) {
    console.warn('⚠️ Comments prop is not an array:', comments);
    return (
      <div className="comments-list">
        <p className="no-comments error">Invalid comments data</p>
      </div>
    );
  }
  
  // Filter out any invalid comments
  const safeComments = comments
    .map(comment => ultraSafeCommentData(comment))
    .filter(comment => comment.isValid);
  
  if (safeComments.length === 0) {
    return (
      <div className="comments-list">
        <p className="no-comments">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="comments-list">
      {safeComments.map((comment, index) => {
        // Generate stable key to prevent re-renders
        const stableKey = comment.id || 
          `${comment.userId || 'unknown'}-${comment.timestamp?.toMillis?.() || Date.now()}-${index}`;
        
        return (
          <SafeComment
            key={`${context}-${stableKey}`}
            comment={comment}
            index={index}
            currentUserId={currentUserId}
            onDelete={onDelete}
            context={context}
          />
        );
      })}
    </div>
  );
});

export default SafeComment;