// Debug utility to find where comment objects are being rendered
export const debugRenderValue = (value, location = 'unknown') => {
  if (typeof value === 'object' && value !== null) {
    console.error(`🚨 OBJECT DETECTED in render at ${location}:`, value);
    console.error('🚨 Object keys:', Object.keys(value));
    console.error('🚨 Stack trace:', new Error().stack);
    
    // Return a safe string representation
    return `[OBJECT: ${Object.keys(value).join(', ')}]`;
  }
  
  return value;
};

// Safe comment renderer that logs any objects
export const safeRenderComment = (comment, index, postId) => {
  try {
    if (!comment) return '';
    
    if (typeof comment === 'object') {
      console.error(`🚨 Comment object detected in post ${postId}, index ${index}:`, comment);
      
      // Extract text safely
      if (comment.text) {
        return String(comment.text);
      }
      
      return '[Invalid comment]';
    }
    
    return String(comment);
  } catch (error) {
    console.error('Error in safeRenderComment:', error);
    return '[Error rendering comment]';
  }
};