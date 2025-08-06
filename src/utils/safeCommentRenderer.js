// Ultimate Safe Comment Rendering System
// This module provides bulletproof comment rendering that will NEVER cause React error #31

/**
 * Safely converts any value to a string, preventing objects from being rendered
 * @param {any} value - The value to convert
 * @param {string} fallback - Fallback string if conversion fails
 * @returns {string} - Always returns a safe string
 */
export const safenizeString = (value, fallback = '') => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // If it's already a string, return it
  if (typeof value === 'string') {
    return value;
  }
  
  // Handle numbers and booleans
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // NEVER allow objects to be rendered - this prevents React error #31
  if (typeof value === 'object') {
    console.warn('🚨 OBJECT BLOCKED FROM RENDER:', value);
    console.warn('🚨 Using fallback string instead:', fallback);
    return fallback;
  }
  
  // For any other type, convert to string safely
  try {
    return String(value);
  } catch (error) {
    console.error('🚨 String conversion failed:', error);
    return fallback;
  }
};

/**
 * Ultra-safe comment data extraction with multiple validation layers
 * @param {any} comment - Raw comment data from Firebase
 * @returns {Object} - Always returns a safe comment object with string fields
 */
export const ultraSafeCommentData = (comment) => {
  // console.log('🔍 Processing comment data:', comment); // Disabled to prevent performance issues
  
  // First layer: Handle non-objects
  if (!comment || typeof comment !== 'object') {
    console.warn('⚠️ Invalid comment data, using defaults');
    return {
      id: safenizeString('unknown-' + Date.now()),
      text: safenizeString(''),
      userId: safenizeString(''),
      userDisplayName: safenizeString('Unknown User'),
      userPhotoURL: safenizeString(''),
      timestamp: null,
      isValid: false
    };
  }
  
  // Second layer: Extract and sanitize each field
  const safeComment = {
    id: safenizeString(comment.id || comment._id, 'comment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)),
    text: safenizeString(comment.text, ''),
    userId: safenizeString(comment.userId, ''),
    userDisplayName: safenizeString(comment.userDisplayName, 'Unknown User'),
    userPhotoURL: safenizeString(comment.userPhotoURL, ''),
    timestamp: comment.timestamp || null,
    isValid: true
  };
  
  // Third layer: Final validation - ensure ALL fields are safe strings
  Object.keys(safeComment).forEach(key => {
    if (key !== 'timestamp' && key !== 'isValid') {
      const value = safeComment[key];
      if (typeof value === 'object' && value !== null) {
        console.error(`🚨 CRITICAL: Object found in ${key}:`, value);
        safeComment[key] = safenizeString('', 'Safe Value');
      }
    }
  });
  
  // console.log('✅ Safe comment processed:', safeComment); // Disabled to prevent performance issues
  return safeComment;
};

/**
 * Safe timestamp formatter that never returns objects
 * @param {any} timestamp - Firebase timestamp or Date
 * @returns {string} - Always returns a safe string representation
 */
export const safeFormatTimestamp = (timestamp) => {
  if (!timestamp) return 'now';
  
  try {
    // Handle Firebase timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    // Handle string/number timestamps
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleDateString();
    }
    
    // Fallback for any other type
    return 'now';
  } catch (error) {
    console.warn('⚠️ Timestamp formatting failed:', error);
    return 'now';
  }
};

/**
 * Validates that a comment array is safe for rendering
 * @param {Array} comments - Array of comments to validate
 * @returns {Array} - Array of safe comment objects
 */
export const validateCommentsArray = (comments) => {
  if (!Array.isArray(comments)) {
    console.warn('⚠️ Comments is not an array:', comments);
    return [];
  }
  
  return comments
    .map(comment => ultraSafeCommentData(comment))
    .filter(comment => comment.isValid);
};

/**
 * Emergency fallback component data for when everything fails
 */
export const getEmergencyComment = () => ({
  id: 'emergency-' + Date.now(),
  text: '[Comment could not be loaded safely]',
  userId: '',
  userDisplayName: 'System',
  userPhotoURL: '',
  timestamp: null,
  isValid: true
});

/**
 * Debug function to check if any comment data contains objects
 * @param {Array} comments - Comments to debug
 */
export const debugCommentData = (comments, location = 'unknown') => {
  if (!Array.isArray(comments)) return;
  
  comments.forEach((comment, index) => {
    if (typeof comment === 'object' && comment !== null) {
      Object.keys(comment).forEach(key => {
        const value = comment[key];
        if (typeof value === 'object' && value !== null && key !== 'timestamp') {
          console.error(`🚨 OBJECT DETECTED in comment[${index}].${key} at ${location}:`, value);
        }
      });
    }
  });
};