import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

// Supported video file types
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/wmv',
  'video/flv',
  'video/webm',
  'video/mkv',
  'video/m4v'
];

// Maximum file size (100MB)
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

// Video upload paths
export const VIDEO_PATHS = {
  POSTS: 'post-videos',
  HIGHLIGHTS: 'athlete-highlights',
  TRAINING: 'training-sessions',
  COMPETITIONS: 'competitions'
};

/**
 * Validates video file before upload
 * @param {File} file - Video file to validate
 * @returns {Object} - Validation result with isValid and error
 */
export const validateVideoFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Unsupported file type. Supported types: ${SUPPORTED_VIDEO_TYPES.map(type => type.split('/')[1]).join(', ')}` 
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return { 
      isValid: false, 
      error: `File size too large. Maximum size: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true };
};

/**
 * Uploads video file to Firebase Storage with progress tracking
 * @param {File} file - Video file to upload
 * @param {string} userId - User ID for folder organization
 * @param {string} category - Video category (posts, highlights, training, competitions)
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - Download URL of uploaded video
 */
export const uploadVideoFile = async (file, userId, category = VIDEO_PATHS.POSTS, onProgress = null) => {
  console.log('uploadVideoFile called with:', { 
    fileName: file.name, 
    fileSize: file.size, 
    userId, 
    category 
  });

  // Validate file first
  const validation = validateVideoFile(file);
  if (!validation.isValid) {
    console.error('Video validation failed:', validation.error);
    throw new Error(validation.error);
  }

  console.log('Video validation passed');

  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${category}/${userId}/${fileName}`;
  
  console.log('Upload path:', filePath);
  
  // Create storage reference
  const storageRef = ref(storage, filePath);

  try {
    if (onProgress) {
      console.log('Starting resumable upload with progress tracking...');
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
            onProgress(progress);
          },
          (error) => {
            console.error('Video upload error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to upload video. ';
            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage += 'You do not have permission to upload files.';
                break;
              case 'storage/canceled':
                errorMessage += 'Upload was canceled.';
                break;
              case 'storage/quota-exceeded':
                errorMessage += 'Storage quota exceeded.';
                break;
              case 'storage/invalid-format':
                errorMessage += 'Invalid video format.';
                break;
              case 'storage/server-file-wrong-size':
                errorMessage += 'File size mismatch.';
                break;
              default:
                errorMessage += error.message || 'Please try again.';
            }
            
            reject(new Error(errorMessage));
          },
          async () => {
            try {
              console.log('Upload completed, getting download URL...');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(new Error('Upload completed but failed to get download URL. Please try again.'));
            }
          }
        );
      });
    } else {
      console.log('Starting simple upload without progress tracking...');
      // Simple upload without progress tracking
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Simple upload completed');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      return downloadURL;
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Re-throw with more context
    if (error.message.includes('Failed to upload video')) {
      throw error; // Already processed
    } else {
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }
};

/**
 * Creates video thumbnail from video file
 * @param {File} videoFile - Video file to create thumbnail from
 * @returns {Promise<Blob>} - Thumbnail image blob
 */
export const createVideoThumbnail = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('loadedmetadata', () => {
      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Seek to 1 second or 10% of video duration
      video.currentTime = Math.min(1, video.duration * 0.1);
    });

    video.addEventListener('seeked', () => {
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video for thumbnail'));
    });

    // Load video file
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Gets video duration from file
 * @param {File} videoFile - Video file to get duration from
 * @returns {Promise<number>} - Duration in seconds
 */
export const getVideoDuration = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video metadata'));
    });

    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Formats duration in seconds to MM:SS format
 * @param {number} duration - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Generates video metadata object
 * @param {File} videoFile - Video file
 * @param {string} downloadURL - Firebase download URL
 * @returns {Promise<Object>} - Video metadata object
 */
export const generateVideoMetadata = async (videoFile, downloadURL) => {
  console.log('Generating video metadata for:', videoFile.name);
  
  try {
    // Try to get duration, but don't fail if it doesn't work
    let duration = null;
    let durationFormatted = null;
    
    try {
      duration = await getVideoDuration(videoFile);
      durationFormatted = formatDuration(duration);
      console.log('Video duration obtained:', duration, 'formatted:', durationFormatted);
    } catch (durationError) {
      console.warn('Could not get video duration:', durationError.message);
    }
    
    // Try to create thumbnail, but don't fail if it doesn't work
    let thumbnailBlob = null;
    try {
      thumbnailBlob = await createVideoThumbnail(videoFile);
      console.log('Video thumbnail created successfully');
    } catch (thumbnailError) {
      console.warn('Could not create video thumbnail:', thumbnailError.message);
    }
    
    const metadata = {
      url: downloadURL,
      type: 'video',
      mimeType: videoFile.type,
      size: videoFile.size,
      fileName: videoFile.name,
      uploadedAt: new Date().toISOString()
    };
    
    // Add optional fields if available
    if (duration !== null) {
      metadata.duration = duration;
      metadata.durationFormatted = durationFormatted;
    }
    
    if (thumbnailBlob) {
      metadata.thumbnail = thumbnailBlob;
    }
    
    console.log('Video metadata generated successfully:', metadata);
    return metadata;
    
  } catch (error) {
    console.error('Error generating video metadata:', error);
    
    // Return basic metadata even if enhanced features fail
    const basicMetadata = {
      url: downloadURL,
      type: 'video',
      mimeType: videoFile.type,
      size: videoFile.size,
      fileName: videoFile.name,
      uploadedAt: new Date().toISOString()
    };
    
    console.log('Returning basic metadata due to error:', basicMetadata);
    return basicMetadata;
  }
};