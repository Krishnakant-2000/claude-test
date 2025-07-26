# AmaPlayer - Backend Services Documentation

## Overview
AmaPlayer uses Firebase as the primary backend service provider, offering a comprehensive suite of services for authentication, database, storage, and hosting. This document provides detailed information about the backend architecture, troubleshooting, and best practices.

## 🔧 Firebase Services Architecture

### 1. Firebase Authentication
**Service**: `Firebase Auth`
**Purpose**: User authentication and authorization

#### Configuration
```javascript
// Location: src/firebase/firebase.js
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
```

#### Supported Authentication Methods
- **Email/Password**: Standard email-based authentication
- **Google Sign-In**: OAuth integration with Google
- **Apple Sign-In**: OAuth integration with Apple ID
- **Anonymous/Guest**: Temporary guest access with limited permissions

#### User Management
```javascript
// User document structure in Firestore
{
  uid: "firebase_auth_uid",
  displayName: "User Name",
  email: "user@example.com",
  photoURL: "https://...",
  isGuest: false,
  role: "athlete", // athlete | coach | organization | fan
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

### 2. Firebase Firestore Database
**Service**: `Cloud Firestore`
**Purpose**: NoSQL document database for app data

#### Configuration
```javascript
// Location: src/firebase/firebase.js
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

#### Key Collections
- **users**: User profiles and settings
- **posts**: User-generated content posts
- **comments**: Post comments and replies
- **stories**: 24-hour stories with auto-expiry
- **highlights**: Permanent story collections
- **messages**: Direct messaging between users
- **follows**: User follow relationships
- **friendRequests**: Friend request management
- **contentReports**: User-generated content reports
- **moderationLogs**: Admin moderation actions

### 3. Firebase Storage
**Service**: `Cloud Storage`
**Purpose**: File and media storage

#### Configuration
```javascript
// Location: src/firebase/firebase.js
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
```

#### Storage Structure
```
bucket/
├── profile-images/{userId}/
├── posts/images/{userId}/
├── posts/videos/{userId}/
├── stories/images/{userId}/
├── stories/videos/{userId}/
├── messages/{userId1}/{userId2}/
├── athlete-highlights/{userId}/
├── training-sessions/{userId}/
└── competitions/{userId}/
```

### 4. Firebase Hosting
**Service**: `Firebase Hosting`
**Purpose**: Static web hosting with CDN

#### Live URLs
- **Production**: https://my-react-firebase-app-69fcd.web.app
- **Development**: Local development server (port 3000)

## 🔐 Security Implementation

### Firestore Security Rules
**Location**: `firebase.rules`

#### Key Security Features
- **Authentication Required**: All operations require valid authentication
- **User-Specific Access**: Users can only modify their own content
- **Guest Restrictions**: Anonymous users have read-only access
- **Admin Privileges**: Special permissions for moderators
- **Content Validation**: Server-side validation of data structure

#### Example Rules
```javascript
// Users can only write their own data
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}

// Posts are publicly readable but require authentication to create
match /posts/{postId} {
  allow read: if true;
  allow create: if request.auth != null && !isGuestUser();
}
```

### Storage Security Rules
**Location**: `storage.rules`

#### Key Features
- **Path-Based Permissions**: Users can only upload to their designated folders
- **File Type Validation**: Only specific file types allowed per path
- **Size Limits**: Enforced file size restrictions
- **Content Type Checking**: MIME type validation

#### Example Rules
```javascript
// Stories uploads - the previously failing case
match /stories/images/{userId}/{fileName} {
  allow read: if true;
  allow write: if request.auth != null 
    && request.auth.uid == userId
    && validateImageFile();
}

function validateImageFile() {
  return request.resource.size < 10 * 1024 * 1024 // 10MB
    && request.resource.contentType.matches('image/.*');
}
```

## 📊 Database Services

### 1. User Management Service
**Location**: `src/contexts/AuthContext.js`

#### Key Functions
```javascript
// User authentication
signIn(email, password)
signUp(email, password, userData)
signInWithGoogle()
signInWithApple()
signInAsGuest()

// Profile management
updateProfile(userData)
uploadProfileImage(imageFile)
deleteUser()
```

### 2. Posts Service
**Location**: `src/components/pages/Home.js`, `src/components/pages/AddPost.js`

#### Key Functions
```javascript
// Post management
createPost(postData, mediaFile)
updatePost(postId, updates)
deletePost(postId)
likePost(postId, userId)
commentOnPost(postId, commentData)

// Content retrieval
getPosts(limit, lastVisible)
getUserPosts(userId)
getPostsByHashtag(hashtag)
```

### 3. Stories Service
**Location**: `src/firebase/storiesService.js`

#### Key Functions
```javascript
// Story management
StoriesService.createStory(userId, displayName, photoURL, mediaFile, caption)
StoriesService.getActiveStories()
StoriesService.viewStory(storyId, viewerId)
StoriesService.deleteStory(storyId, userId)

// Highlights management
HighlightsService.createHighlight(userId, title, coverImage, storyIds)
HighlightsService.addStoryToHighlight(highlightId, storyId)
```

### 4. Messaging Service
**Location**: `src/components/pages/Messages.js`

#### Key Functions
```javascript
// Message management
sendMessage(receiverId, messageText, mediaFile)
getConversations(userId)
getMessages(conversationId)
markMessageAsRead(messageId)

// Friend management
sendFriendRequest(receiverId)
acceptFriendRequest(requestId)
rejectFriendRequest(requestId)
```

### 5. Video Service
**Location**: `src/firebase/videoService.js`

#### Key Functions
```javascript
// Video upload and processing
uploadVideoFile(file, userId, category, onProgress)
validateVideoFile(file)
createVideoThumbnail(videoFile)
generateVideoMetadata(videoFile, downloadURL)
```

## 🚨 Error Handling & Troubleshooting

### Common Issues and Solutions

#### 1. Storage Permission Error (RESOLVED)
**Error**: `FirebaseError: User does not have permission to access 'stories/images/...'`

**Root Cause**: Missing storage rules for stories paths

**Solution Applied**:
```javascript
// Added to storage.rules
match /stories/images/{userId}/{fileName} {
  allow read: if true;
  allow write: if request.auth != null 
    && request.auth.uid == userId
    && validateImageFile();
}

match /stories/videos/{userId}/{fileName} {
  allow read: if true;
  allow write: if request.auth != null 
    && request.auth.uid == userId
    && validateVideoFile();
}
```

#### 2. Authentication Errors
**Common Issues**:
- Invalid credentials
- Network connectivity
- Firebase config issues

**Debugging Steps**:
```javascript
// Check authentication state
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user?.uid || 'Not authenticated');
});

// Verify Firebase config
console.log('Firebase config:', {
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
});
```

#### 3. Firestore Permission Errors
**Common Issues**:
- Insufficient permissions
- Invalid document structure
- Guest user restrictions

**Debugging Approach**:
```javascript
// Check user authentication and role
const isGuest = auth.currentUser?.isAnonymous;
const userId = auth.currentUser?.uid;

// Validate document structure before writing
const validatePostData = (postData) => {
  return postData.caption && 
         postData.userId && 
         postData.timestamp;
};
```

#### 4. Upload Failures
**Common Causes**:
- File too large
- Unsupported file type
- Network timeout
- Storage quota exceeded

**Prevention**:
```javascript
// Pre-upload validation
const validateFile = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }
  
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files allowed');
  }
};
```

### Error Tracking System
**Location**: `src/utils/errorTracker.js`

#### Features
- Automatic error logging
- User-friendly error messages
- Retry mechanisms
- Performance monitoring

## 🧪 Testing & Validation

### Upload Test Suite
**Location**: `src/tests/uploadTests.js`, `src/components/admin/UploadTestRunner.js`

#### Test Coverage
1. **Basic Image Upload**: Standard post images
2. **Stories Upload**: Previously failing stories functionality
3. **Video Validation**: File type and size validation
4. **Permission Testing**: Access control verification
5. **Error Handling**: Graceful failure scenarios

#### Running Tests
```javascript
// Run all upload tests
import { runUploadTests } from './tests/uploadTests';
const results = await runUploadTests();

// Run specific story tests
import { runStoriesUploadTest } from './tests/uploadTests';
const storyResults = await runStoriesUploadTest();
```

### Admin Test Interface
**Access**: Available to users with 'admin' or 'test' in email address
**Location**: `src/components/admin/UploadTestRunner.js`

#### Features
- One-click test execution
- Real-time progress tracking
- Detailed error reporting
- Automated cleanup
- Troubleshooting guidance

## 📈 Performance Optimization

### Database Optimization
1. **Indexes**: Strategic composite indexes for common queries
2. **Pagination**: Cursor-based pagination for large datasets
3. **Denormalization**: User data cached in posts for quick access
4. **Batch Operations**: Multiple operations in single transactions

### Storage Optimization
1. **CDN Integration**: Global edge caching via Firebase CDN
2. **Image Compression**: Automatic optimization for web delivery
3. **Lazy Loading**: On-demand media loading
4. **Cleanup Jobs**: Automatic removal of expired content

### Client-Side Optimization
1. **Connection Pooling**: Persistent Firebase connections
2. **Local Caching**: Firestore offline persistence
3. **Debounced Requests**: Rate limiting for real-time features
4. **Progressive Loading**: Incremental content loading

## 🔍 Monitoring & Analytics

### Firebase Analytics
- **User Engagement**: Daily/monthly active users
- **Feature Usage**: Most used app features
- **Performance**: App startup time, screen load times
- **Crashes**: Error tracking and crash reports

### Custom Metrics
```javascript
// Track custom events
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'story_created', {
  user_role: 'athlete',
  media_type: 'video',
  duration: 15
});

logEvent(analytics, 'post_shared', {
  content_type: 'training_video',
  engagement_score: 0.85
});
```

### Storage Metrics
- **Total Usage**: Storage consumption by user/content type
- **Upload Success Rate**: Percentage of successful uploads
- **Popular Content**: Most accessed media files
- **Growth Trends**: Daily/monthly storage growth

## 🚀 Deployment & CI/CD

### Firebase Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy hosting
firebase deploy --only hosting

# Deploy all services
firebase deploy
```

### Environment Configuration
**Location**: `.env` (not committed to repository)

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Build Process
```bash
# Development
npm start

# Production build
npm run build

# Deploy to Firebase
firebase deploy
```

## 🛡️ Security Best Practices

### Data Protection
1. **Environment Variables**: Sensitive config in environment variables
2. **Security Rules**: Comprehensive Firestore and Storage rules
3. **Input Validation**: Client and server-side validation
4. **Content Filtering**: Automated inappropriate content detection

### Access Control
1. **Role-Based Permissions**: Different access levels (guest, user, admin)
2. **API Rate Limiting**: Prevent abuse and spam
3. **User Verification**: Email verification for new accounts
4. **Admin Controls**: Moderation tools and reporting system

### Privacy Compliance
1. **Data Minimization**: Only collect necessary user data
2. **User Consent**: Clear privacy policy and terms
3. **Data Deletion**: User right to delete account and data
4. **Audit Logs**: Track all administrative actions

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Security Rules Review**: Monthly review and updates
2. **Storage Cleanup**: Automated removal of expired content
3. **Performance Monitoring**: Weekly performance reviews
4. **User Feedback**: Regular analysis of user reports and feedback

### Escalation Procedures
1. **Critical Issues**: Immediate notification and response
2. **User Reports**: 24-48 hour response time
3. **Performance Degradation**: Automatic alerts and monitoring
4. **Security Incidents**: Immediate response protocol

### Contact Information
- **Development Team**: Technical implementation issues
- **Firebase Support**: Infrastructure and service issues
- **Security Team**: Security incidents and vulnerabilities

This documentation provides a comprehensive overview of the AmaPlayer backend services. The recent fixes to Firebase Storage rules should resolve the upload permission errors, and the implemented testing suite ensures ongoing reliability of the upload functionality.