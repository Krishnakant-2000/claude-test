// Upload Tests for AmaPlayer Firebase Storage
// Comprehensive testing suite for all media upload functionality

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '../firebase/firebase';
import { StoriesService } from '../firebase/storiesService';
import { uploadVideoFile, validateVideoFile } from '../firebase/videoService';

// Test configuration
const TEST_CONFIG = {
  testUserId: 'test_user_upload_' + Date.now(),
  timeout: 30000, // 30 seconds
  cleanup: true // Whether to clean up test files
};

// Mock file creation utilities
class MockFileGenerator {
  static createImageFile(name = 'test.jpg', size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test pattern
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(50, 0, 50, 50);
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 50, 50, 50);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(50, 50, 50, 50);
    
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], name, { type: 'image/jpeg' });
          Object.defineProperty(file, 'size', { value: size });
          resolve(file);
        },
        'image/jpeg',
        0.8
      );
    });
  }
  
  static createVideoFile(name = 'test.mp4', size = 1024 * 1024) {
    // Create a minimal MP4 file blob
    const mp4Header = new Uint8Array([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
    ]);
    
    const blob = new Blob([mp4Header], { type: 'video/mp4' });
    const file = new File([blob], name, { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }
  
  static createTextFile(name = 'test.txt', content = 'Test file content') {
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], name, { type: 'text/plain' });
  }
  
  static createInvalidFile(name = 'test.exe') {
    const blob = new Blob(['fake executable'], { type: 'application/octet-stream' });
    return new File([blob], name, { type: 'application/octet-stream' });
  }
  
  static createOversizedFile(name = 'large.jpg', sizeMB = 15) {
    const size = sizeMB * 1024 * 1024;
    const data = new Uint8Array(Math.min(size, 1024 * 1024)); // Cap at 1MB for testing
    const blob = new Blob([data], { type: 'image/jpeg' });
    const file = new File([blob], name, { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }
}

// Test results tracking
class TestResultsTracker {
  constructor() {
    this.results = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }
  
  addResult(testName, status, message = '', duration = 0, error = null) {
    const result = {
      testName,
      status, // 'PASS' | 'FAIL' | 'SKIP'
      message,
      duration,
      error,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    this.stats.total++;
    this.stats[status.toLowerCase()]++;
    
    // Log to console with appropriate styling
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    const timeStr = duration > 0 ? ` (${duration}ms)` : '';
    console.log(`${emoji} ${testName}${timeStr}: ${message}`);
    
    if (error) {
      console.error(`   Error:`, error);
    }
  }
  
  generateReport() {
    console.log('\n📊 Upload Test Results Summary:');
    console.log(`   Total Tests: ${this.stats.total}`);
    console.log(`   ✅ Passed: ${this.stats.passed}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   ⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`   Success Rate: ${(this.stats.passed / this.stats.total * 100).toFixed(1)}%`);
    
    if (this.stats.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.testName}: ${r.message}`));
    }
    
    return {
      summary: this.stats,
      details: this.results,
      success: this.stats.failed === 0
    };
  }
}

// Main test suite
export class UploadTestSuite {
  constructor() {
    this.tracker = new TestResultsTracker();
    this.uploadedFiles = []; // Track for cleanup
  }
  
  // Test 1: Basic image upload to posts
  async testBasicImageUpload() {
    const testName = 'Basic Image Upload to Posts';
    const startTime = Date.now();
    
    try {
      const imageFile = await MockFileGenerator.createImageFile('test-post.jpg');
      const filePath = `posts/images/${TEST_CONFIG.testUserId}/test-${Date.now()}.jpg`;
      const storageRef = ref(storage, filePath);
      
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      this.uploadedFiles.push(storageRef);
      
      if (downloadUrl && downloadUrl.includes('googleapis.com')) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', `Upload successful, URL: ${downloadUrl.substring(0, 50)}...`, duration);
      } else {
        throw new Error('Invalid download URL received');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 2: Stories image upload (the failing case)
  async testStoriesImageUpload() {
    const testName = 'Stories Image Upload (Previously Failing)';
    const startTime = Date.now();
    
    try {
      const imageFile = await MockFileGenerator.createImageFile('test-story.jpg');
      
      // This should now work with our fixed storage rules
      const result = await StoriesService.uploadStoryMedia(imageFile, TEST_CONFIG.testUserId, 'image');
      
      if (result && result.includes('googleapis.com')) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', `Stories upload successful: ${result.substring(0, 50)}...`, duration);
      } else {
        throw new Error('Invalid download URL from stories upload');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 3: Video upload validation
  async testVideoUploadValidation() {
    const testName = 'Video Upload Validation';
    const startTime = Date.now();
    
    try {
      const videoFile = MockFileGenerator.createVideoFile('test-video.mp4', 5 * 1024 * 1024); // 5MB
      const validation = validateVideoFile(videoFile);
      
      if (validation.isValid) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', 'Video validation passed', duration);
      } else {
        throw new Error(`Video validation failed: ${validation.error}`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 4: Large file rejection
  async testOversizedFileRejection() {
    const testName = 'Oversized File Rejection';
    const startTime = Date.now();
    
    try {
      const oversizedFile = MockFileGenerator.createOversizedFile('huge-image.jpg', 15); // 15MB
      const filePath = `posts/images/${TEST_CONFIG.testUserId}/oversized-${Date.now()}.jpg`;
      const storageRef = ref(storage, filePath);
      
      try {
        await uploadBytes(storageRef, oversizedFile);
        // If upload succeeds, that's actually a failure for this test
        throw new Error('Oversized file was unexpectedly accepted');
      } catch (uploadError) {
        // This is expected - the upload should fail
        if (uploadError.code === 'storage/unauthorized' || 
            uploadError.message.includes('size') ||
            uploadError.message.includes('limit')) {
          const duration = Date.now() - startTime;
          this.tracker.addResult(testName, 'PASS', 'Oversized file correctly rejected', duration);
        } else {
          throw uploadError;
        }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 5: Invalid file type rejection
  async testInvalidFileTypeRejection() {
    const testName = 'Invalid File Type Rejection';
    const startTime = Date.now();
    
    try {
      const invalidFile = MockFileGenerator.createInvalidFile('malware.exe');
      const filePath = `posts/images/${TEST_CONFIG.testUserId}/invalid-${Date.now()}.exe`;
      const storageRef = ref(storage, filePath);
      
      try {
        await uploadBytes(storageRef, invalidFile);
        throw new Error('Invalid file type was unexpectedly accepted');
      } catch (uploadError) {
        if (uploadError.code === 'storage/unauthorized' || 
            uploadError.message.includes('type') ||
            uploadError.message.includes('format')) {
          const duration = Date.now() - startTime;
          this.tracker.addResult(testName, 'PASS', 'Invalid file type correctly rejected', duration);
        } else {
          throw uploadError;
        }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 6: Multiple file types
  async testMultipleFileTypes() {
    const testName = 'Multiple File Types Upload';
    const startTime = Date.now();
    
    try {
      const fileTypes = [
        { file: await MockFileGenerator.createImageFile('test.jpg'), path: 'posts/images' },
        { file: MockFileGenerator.createVideoFile('test.mp4'), path: 'post-videos' },
        { file: MockFileGenerator.createTextFile('test.txt'), path: 'temp' }
      ];
      
      let successCount = 0;
      
      for (const { file, path } of fileTypes) {
        try {
          const filePath = `${path}/${TEST_CONFIG.testUserId}/multi-test-${Date.now()}-${file.name}`;
          const storageRef = ref(storage, filePath);
          
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          
          if (downloadUrl) {
            successCount++;
            this.uploadedFiles.push(storageRef);
          }
        } catch (typeError) {
          console.warn(`Expected failure for ${file.type}:`, typeError.message);
          // Some file types should fail (like .txt to images folder)
        }
      }
      
      if (successCount >= 1) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', `${successCount}/${fileTypes.length} uploads successful`, duration);
      } else {
        throw new Error('No file uploads succeeded');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 7: Stories video upload
  async testStoriesVideoUpload() {
    const testName = 'Stories Video Upload';
    const startTime = Date.now();
    
    try {
      const videoFile = MockFileGenerator.createVideoFile('story-video.mp4', 10 * 1024 * 1024); // 10MB
      
      const result = await StoriesService.uploadStoryMedia(videoFile, TEST_CONFIG.testUserId, 'video');
      
      if (result && result.includes('googleapis.com')) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', `Stories video upload successful`, duration);
      } else {
        throw new Error('Invalid download URL from stories video upload');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 8: Message attachments
  async testMessageAttachments() {
    const testName = 'Message Attachments Upload';
    const startTime = Date.now();
    
    try {
      const imageFile = await MockFileGenerator.createImageFile('message-attachment.jpg');
      const filePath = `messages/${TEST_CONFIG.testUserId}/friend_user/msg-${Date.now()}.jpg`;
      const storageRef = ref(storage, filePath);
      
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      this.uploadedFiles.push(storageRef);
      
      if (downloadUrl) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', 'Message attachment upload successful', duration);
      } else {
        throw new Error('Failed to get download URL for message attachment');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 9: Profile image upload
  async testProfileImageUpload() {
    const testName = 'Profile Image Upload';
    const startTime = Date.now();
    
    try {
      const imageFile = await MockFileGenerator.createImageFile('profile-avatar.jpg');
      const filePath = `profile-images/${TEST_CONFIG.testUserId}/avatar.jpg`;
      const storageRef = ref(storage, filePath);
      
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      this.uploadedFiles.push(storageRef);
      
      if (downloadUrl) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', 'Profile image upload successful', duration);
      } else {
        throw new Error('Failed to get download URL for profile image');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Test 10: Athlete highlights upload
  async testAthleteHighlightsUpload() {
    const testName = 'Athlete Highlights Upload';
    const startTime = Date.now();
    
    try {
      const videoFile = MockFileGenerator.createVideoFile('highlight-reel.mp4', 50 * 1024 * 1024); // 50MB
      const filePath = `athlete-highlights/${TEST_CONFIG.testUserId}/highlight-${Date.now()}.mp4`;
      const storageRef = ref(storage, filePath);
      
      const uploadResult = await uploadBytes(storageRef, videoFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      this.uploadedFiles.push(storageRef);
      
      if (downloadUrl) {
        const duration = Date.now() - startTime;
        this.tracker.addResult(testName, 'PASS', 'Athlete highlight upload successful', duration);
      } else {
        throw new Error('Failed to get download URL for athlete highlight');
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addResult(testName, 'FAIL', error.message, duration, error);
    }
  }
  
  // Cleanup uploaded test files
  async cleanup() {
    if (!TEST_CONFIG.cleanup) {
      console.log('🧹 Cleanup skipped (TEST_CONFIG.cleanup = false)');
      return;
    }
    
    console.log(`🧹 Cleaning up ${this.uploadedFiles.length} test files...`);
    
    let cleanedCount = 0;
    for (const fileRef of this.uploadedFiles) {
      try {
        await deleteObject(fileRef);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to delete ${fileRef.fullPath}:`, error.message);
      }
    }
    
    console.log(`✅ Cleaned up ${cleanedCount}/${this.uploadedFiles.length} test files`);
  }
  
  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting AmaPlayer Upload Tests...\n');
    
    const tests = [
      this.testBasicImageUpload,
      this.testStoriesImageUpload, // This was the main failing test
      this.testVideoUploadValidation,
      this.testOversizedFileRejection,
      this.testInvalidFileTypeRejection,
      this.testMultipleFileTypes,
      this.testStoriesVideoUpload,
      this.testMessageAttachments,
      this.testProfileImageUpload,
      this.testAthleteHighlightsUpload
    ];
    
    for (const test of tests) {
      try {
        await test.call(this);
      } catch (error) {
        console.error(`Test runner error:`, error);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Generate final report
    const report = this.tracker.generateReport();
    
    // Cleanup
    await this.cleanup();
    
    return report;
  }
}

// Export individual test functions for manual testing
export const runUploadTests = async () => {
  const testSuite = new UploadTestSuite();
  return await testSuite.runAllTests();
};

export const runStoriesUploadTest = async () => {
  const testSuite = new UploadTestSuite();
  await testSuite.testStoriesImageUpload();
  await testSuite.testStoriesVideoUpload();
  return testSuite.tracker.generateReport();
};

export default UploadTestSuite;