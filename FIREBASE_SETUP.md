# Firebase Configuration Guide for AmaPlayer

## Current Status ✅
Your Firebase configuration is working correctly! However, for production deployment, you need to configure some additional security rules and settings in the Firebase Console.

## Required Firebase Console Configurations

### 1. 🔐 Authentication Settings
Go to **Authentication > Sign-in method** in Firebase Console:
- ✅ **Email/Password**: Already enabled
- ✅ **Anonymous**: Enable for guest login functionality
- 🔧 **Authorized domains**: Add your production domain when deploying

### 2. 🗄️ Cloud Firestore Rules
Go to **Firestore Database > Rules** and replace with the content from `firebase.rules`:
```bash
# Copy the content from firebase.rules file to Firebase Console
```

### 3. 📁 Cloud Storage Rules  
Go to **Storage > Rules** and replace with the content from `storage.rules`:
```bash
# Copy the content from storage.rules file to Firebase Console
```

### 4. 📊 Firestore Indexes
Go to **Firestore Database > Indexes** and add the indexes from `firestore.indexes.json`:
- Posts by timestamp (for feed)
- Posts by userId and timestamp (for user profiles)
- Posts by mediaType and timestamp (for filtering)

### 5. 🌐 Hosting Configuration (Optional)
If you want to deploy to Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Security Configurations Applied

### 📝 Firestore Security Rules:
- **Users**: Can only read/write their own user documents
- **Posts**: Anyone can read, only authenticated users can create
- **Comments**: Anyone can read, only authenticated users can comment
- **Data validation**: Post captions limited to 1000 chars, comments to 500 chars

### 📷 Storage Security Rules:
- **Profile Images**: 10MB limit, users can only modify their own
- **Post Media**: 10MB limit for images, 100MB limit for videos
- **Video Categories**: Organized by user folders (highlights, training, competitions)
- **Public Read**: All media is publicly readable but write-protected

### 🚀 Performance Optimizations:
- **Composite Indexes**: For efficient queries on posts
- **Field Overrides**: Optimized for timestamp-based queries
- **Size Limits**: Prevent abuse with file size restrictions

## Environment Variables (Recommended)
For production, move sensitive config to environment variables:

Create `.env.production`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Current Features Working:
- ✅ User Authentication (Email/Password + Guest)
- ✅ Real-time Posts Feed
- ✅ Image & Video Uploads
- ✅ Profile Management
- ✅ Multi-language Support
- ✅ Like/Comment System

## Next Steps:
1. **Copy security rules** to Firebase Console
2. **Enable Anonymous authentication** for guest users
3. **Add production domain** to authorized domains
4. **Set up indexes** for better query performance
5. **Consider Firebase Hosting** for deployment

## Monitoring & Analytics:
- **Firebase Analytics**: Already configured with measurementId
- **Performance Monitoring**: Can be added with Firebase Performance
- **Crash Reporting**: Can be added with Firebase Crashlytics

Your current setup is production-ready for development and testing! 🚀