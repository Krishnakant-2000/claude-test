1s# AmaPlayer - Sports Social Media App

## Development Notes

### Theme System
- App uses a complete dark/light theme system with CSS variables
- Theme toggle works on all pages including landing page
- Landing page has enhanced theming with `--landing-*` variables

### Styling Consistency
- All pages (Home, Search, Add, Activity) use consistent background colors and styling
- Homepage theme variables are applied across all main pages
- CSS variables follow pattern: `--bg-primary`, `--text-primary`, `--accent-primary`, etc.

### Landing Page Features
- Hero section with clean, professional title (emojis removed)
- Olympic gallery with themed cards
- Champion quotes section with athlete images
- Responsive design with mobile optimizations
- Fast hover transitions (0.1s) for improved user experience

### Authentication
- Firebase authentication with email/password
- Google signup option added to login page
- **Apple Sign-in integration** with comprehensive error handling
- Guest login functionality available
- Homepage navigation buttons on all auth pages
- Improved clickable buttons for better user experience

### Media Features
- Image and video upload support
- Firebase storage integration
- Video player with metadata
- Upload progress tracking with error handling

### File Structure
- `src/components/pages/` - Main page components organized by feature:
  - `home/`, `profile/`, `messages/`, `search/`, `addpost/`, `events/`, `landingpage/`, `postdetail/`
- `src/components/common/` - Reusable components organized by function:
  - `ui/` (ThemeToggle, ProfileAvatar), `forms/` (LanguageSelector, VideoUpload)
  - `media/` (VideoPlayer), `modals/` (ReportContent), `notifications/` (NotificationManager)
  - `safety/` (ErrorBoundary), `dev-tools/` (APITester, PerformanceDashboard)
- `src/utils/` - Utility functions organized by purpose:
  - `content/` (content filtering), `data/` (data management), `debug/` (debugging), `rendering/` (safe rendering)
- `src/contexts/` - React contexts (Auth, Theme, Language)
- `src/styles/themes.css` - Theme variable definitions
- `src/firebase/` - Firebase configuration and services

### Build & Development
- React app runs on port 3000
- Uses Firebase for backend services
- Supports 12 languages: English, Hindi, Punjabi, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Odia, and Assamese

### Latest Updates - Current Session (Today - Event Status System Enhancement & Codebase Organization)

- **Enhanced Event Status System with Competition Status Indicators**
  - **Same-Day Live Detection**: Events on the same date now show as "live" by default unless duration has clearly ended
  - **Competition Status Indicators**: Added visual status badges below event categories showing real-time competition status
  - **Improved Duration Handling**: Same-day events get 8-hour default duration vs 2-hour for others  
  - **Simplified Status Messages**: Clean, straightforward status text showing competition availability
    - `"Competition Opens Soon"` - for upcoming events
    - `"Competition Ongoing"` - for live/active events
    - `"Competition Ended"` - for completed events
  - **Visual Status System**: Color-coded indicators with animated pulse for live events
    - 🟡 Upcoming: Yellow/amber (#ffc107)
    - 🟢 Ongoing: Green (#28a745) with pulsing animation
    - ⚪ Ended: Gray (#6c757d)
  - **Sample Events Removal**: All sample events completely removed - shows empty state when no Firebase events exist
  - **Enhanced Event Service**: Added `getCompetitionStatus()` method with simplified status logic
  - **Improved Event Logic**: Better classification of live vs completed status with time-based detection
  - **Mobile Responsive**: Competition status badges work seamlessly across all device sizes
  - **Clean Empty State**: Professional "No Events Available" display when no events exist

### Previous Updates - Current Session (Today - Codebase Organization & Structure Enhancement)

- **Comprehensive Codebase Organization & Structure Enhancement**
  - **Directory Restructuring**: Complete reorganization of all components and utilities
  - **Components Directory Restructuring**: 
    - `src/components/common/` now organized into logical subdirectories:
      - `ui/` - User interface components (ThemeToggle, ProfileAvatar, LazyImage, CustomCursor)
      - `forms/` - Form-related components (LanguageSelector, VideoUpload)
      - `media/` - Media handling components (VideoPlayer)
      - `notifications/` - Notification system (NotificationManager, NotificationToast)
      - `modals/` - Modal components (ReportContent)
      - `safety/` - Safety and error handling (ErrorBoundary, SafeComment)
      - `dev-tools/` - Development utilities (APITester, PerformanceDashboard, UploadDebugger)
      - `__tests__/` - Component test files
    - `src/components/pages/` now organized with each page in its own subdirectory:
      - `home/` - Home page components (Home.js, Home.css)
      - `profile/` - Profile page components (Profile.js, Profile.css)
      - `messages/` - Messages page components (Messages.js, Messages.css)
      - `search/` - Search page components (Search.js, Search.css)
      - `addpost/` - Add post page components (AddPost.js, AddPost.css)
      - `events/` - Events page components (Events.js, Events.css)
      - `landingpage/` - Landing page components (LandingPage.js, LandingPage.css)
      - `landingpage3d/` - 3D Landing page components (LandingPage3D.js, LandingPage3D.css)
      - `postdetail/` - Post detail components (PostDetail.js, PostDetail.css)
  - **Utils Directory Restructuring**:
    - `src/utils/` now organized into logical categories:
      - `content/` - Content filtering utilities (chatFilter.js, contentFilter.js, imageContentFilter.js, postContentFilter.js)
      - `data/` - Data management utilities (cleanupNotifications.js, cleanupPosts.js, populateSampleStories.js)
      - `debug/` - Debugging utilities (debugComments.js, errorTracker.js)
      - `rendering/` - Rendering utilities (safeCommentRenderer.js)
  - **Import/Export System Updates**:
    - All import statements updated throughout codebase to reflect new directory structure
    - Maintained backward compatibility and functionality
    - Zero breaking changes despite comprehensive restructuring
  - **Video Rejection Status System Enhancement**:
    - Enhanced user profile video status indicators with clear visual feedback
    - Comprehensive rejection feedback with detailed admin reasons
    - Delete and retry functionality for rejected videos with improved UX
    - Status badges showing pending, approved, rejected states
    - Admin comment system for providing specific rejection feedback
  - **Documentation Organization**:
    - Created centralized `docs/` directory for all markdown documentation
    - Moved all project documentation files to `docs/` directory:
      - README.md, FIREBASE_SETUP.md, FIREBASE_DATABASE_SCHEMAS.md
      - FIREBASE_STORAGE_SCHEMAS.md, FIREBASE_STORAGE_SETUP.md, BACKEND_SERVICES_DOCUMENTATION.md
      - ADMIN_DASHBOARD_README.md (renamed from admin dashboard README)
    - Updated .gitignore to properly handle documentation files in new structure
    - CLAUDE.md remains in project root for easy access by development tools
    - Clean project root with centralized documentation management

### Previous Updates - Backend Infrastructure Enhancement

- **CRITICAL FIX: Firebase Storage Permission Error Resolved** 
  - **Root Cause**: Missing storage rules for stories paths (`stories/images/` and `stories/videos/`)
  - **Error Fixed**: `FirebaseError: User does not have permission to access 'stories/images/...' (storage/unauthorized)`
  - **Solution**: Added comprehensive storage rules for all media paths including missing stories paths
  - **Status**: ✅ DEPLOYED - Storage rules successfully deployed to Firebase
  - **Impact**: Stories upload functionality now works correctly for all users

- **Comprehensive Firebase Backend Architecture Overhaul**
  - **Database Schemas Documentation**: Complete schemas for all 15 Firestore collections
    - Users, Posts, Comments, Stories, Highlights, Messages, Follows, Friend Requests, etc.
    - Detailed field descriptions, data types, and relationships
    - Index requirements and performance optimization guidance
  - **Storage Architecture Documentation**: Organized folder structure and file naming conventions
    - Structured paths for profile images, posts, stories, messages, highlights
    - File size limits and type validation for each use case
    - CDN integration and optimization strategies
  - **Security Rules Enhancement**: Updated both Firestore and Storage rules
    - Added missing stories paths that were causing upload failures
    - Enhanced file type validation with specific MIME type checking
    - Comprehensive access control for all user roles (guest, authenticated, admin)

- **Upload Testing & Validation System**
  - **Comprehensive Test Suite**: 10 different upload tests covering all scenarios
    - Basic image uploads, Stories uploads (previously failing), Video validation
    - File size limit testing, Invalid file type rejection, Multiple media types
    - Profile images, Message attachments, Athlete highlights
  - **Admin Test Interface**: Built-in testing dashboard for administrators
    - One-click test execution with real-time progress tracking
    - Detailed error reporting and troubleshooting guidance
    - Automatic cleanup of test files after completion
  - **Mock File Generation**: Advanced testing utilities for different file types and scenarios

- **Backend Services Documentation**: Complete technical documentation
  - **Architecture Overview**: Firebase services integration and configuration
  - **Error Handling**: Common issues, root causes, and solutions
  - **Performance Optimization**: Database indexes, storage optimization, CDN integration
  - **Security Implementation**: Authentication flows, access controls, content filtering
  - **Monitoring & Analytics**: Custom metrics, performance tracking, error monitoring

### Latest Updates - Previous Session
- **Firebase Security Enhancement**: Moved Firebase configuration to environment variables
  - Created .env file with Firebase configuration
  - Updated .gitignore to exclude .env file
  - Modified firebase.js to use environment variables
  - Prevents sensitive config from being publicly visible on GitHub
- **Talent Showcase Video System**: Complete video upload and playback functionality
  - Added upload progress tracking with percentage display
  - Implemented cancel upload functionality with red cancel button
  - Added sample Big Buck Bunny video for demonstration
  - Created full-screen video modal with controls and metadata
  - Video playback available for all users including guests
  - Added video stats display (views, likes, upload date)
- **Advanced Search Filters**: Comprehensive filtering system with multiple criteria
  - **Location Filter**: City, state, country search
  - **Role Filter**: Athlete, coach, organization dropdown
  - **Skill Filter**: Sports skills text search
  - **Sport Filter**: Specific sport filtering
  - **Name Filter**: Full name search functionality
  - **Achievement Filter**: Awards and titles search
  - **Gender Filter**: Male, female, other dropdown
  - **Age Filters**: Multiple age filtering options
    - Exact age input for specific age matching
    - Age range filter with min/max inputs
    - Custom age filter with toggle operator ("<" and ">")
    - Less than/greater than logic for flexible age searching
  - **Filter UI**: Collapsible filters panel with toggle button
  - **Clear All Filters**: Reset all criteria with one click
  - **Enhanced Results**: User detail badges showing role, location, sport, gender, age
  - **Mobile Responsive**: Optimized for all screen sizes
  - **Real-time Search**: Debounced search with live results
- **GitHub Repository**: Created and pushed complete codebase to GitHub
  - Repository: https://github.com/Krishnakant-2000/claude-test
  - Security: Sensitive Firebase config excluded from repository
  - Documentation: Comprehensive commit messages with feature descriptions

### Previous Updates - Earlier Sessions
- **Guest Profile System**: Implemented read-only access for guest users with profile restrictions
- **Mobile Profile Optimization**: Fixed mobile scrolling issues and responsive design
- **Messages System Overhaul**: Replaced Activity tab with comprehensive Messages system
  - Friends tab: Shows friend profiles with follow buttons
  - Messages tab: Real-time messaging interface with conversation management
  - Requests tab: Friend request management (send/accept/decline)
- **Follow/Unfollow System**: Complete implementation with real-time counter updates
- **Profile Viewing**: Added navigation to view other users' profiles with follow functionality
- **Friend Request System**: Proper pending/accepted states with cancel functionality
- **Privacy Controls**: Following lists are private, followers lists are public
- **Search Functionality**: User search with friend request integration
- **Firebase Rules**: Updated security rules for follows, friend requests, and messages
- **UI/UX Improvements**: 
  - Clickable follower/following counts with modal lists
  - Profile navigation from Messages and Search
  - Cancel request buttons instead of static "Pending" states
  - Enhanced debugging for search functionality

### Previous Updates
- Applied homepage styling to all pages
- Fixed landing page theme toggle
- Increased hover animation speeds
- Enhanced theme consistency across the app
- Added complete translations for all 12 supported Indian languages
- Fixed Google signup button in login page

### Key Features Implemented Today
1. **Firebase Security**: Environment variables for sensitive configuration
2. **Video Upload System**: Progress tracking with cancel functionality
3. **Video Playback**: Full-screen modal player for all users
4. **Sample Content**: Big Buck Bunny demo video in talent showcase
5. **Advanced Search**: 8 different filter criteria with real-time search
6. **Age Filtering**: Exact age, range, and custom operator filtering
7. **Toggle Operators**: Interactive "<" and ">" buttons for age comparison
8. **Mobile Optimization**: Responsive design for all new features
9. **GitHub Integration**: Secure repository with comprehensive documentation
10. **Enhanced UX**: User detail badges and improved search results display

### Key Features Implemented in Earlier Sessions
1. **Guest Access Control**: Read-only permissions with clear UI indicators
2. **Real-time Messaging**: Full chat system with Firebase real-time updates
3. **Social Network Features**: Follow/unfollow, friend requests, user discovery
4. **Profile System**: Public profiles with privacy controls for following lists
5. **Search & Discovery**: User search with friend request management
6. **Mobile Responsive**: Full mobile optimization for all new features
7. **Live Search**: Real-time search suggestions as user types (debounced)
8. **Production Deployment**: App successfully deployed to Firebase hosting

### Live Application
**Firebase Hosting URL**: https://my-react-firebase-app-69fcd.web.app
- Clean production build without debugging code
- All features fully functional on live site
- Real-time Firebase integration working
- Apple Sign-in available (requires Firebase Console setup)
- Enhanced guest user experience with easy sign-up access
- Improved authentication flow with better navigation

## Content Filtering System - COMPLETED
### Comprehensive Content Filtering Implementation
- **Separated Filter Systems**: Created dedicated filtering files for different use cases
  - `chatFilter.js`: Strict filtering for real-time messaging with NO sports exceptions
  - `postContentFilter.js`: Sports-friendly filtering for posts with athlete slang whitelist
  - `contentFilter.js`: Original comprehensive filter (kept for backward compatibility)

### Chat Filter Features (`chatFilter.js`)
- **Strict Enforcement**: No sports whitelist - all inappropriate content blocked in chat
- **Real-time Protection**: Filters messages before sending with "You can't send this message" alerts
- **Categories Covered**: Nudity, Violence, Hate Speech, Politics, Drugs, Profanity
- **Multi-language Support**: English and Hindi filtering with comprehensive word lists
- **No Confirmations**: Direct blocking without "Are you sure?" dialogs
- **Admin Logging**: Violations logged for review with dedicated chat logging function

### Post Content Filter Features (`postContentFilter.js`)
- **Sports-Friendly**: Allows athlete slang like "congrats", "performance is fire", "beast mode"
- **Context-Aware**: Automatically detects sports content for lenient filtering
- **Sports Whitelist**: 130+ approved terms for performance, competition, and congratulations
- **Auto-Detection**: Sports keywords trigger automatic context switching
- **Categories Covered**: Politics, Nudity, Violence, Hate Speech, Spam, Drugs (same as chat but with exceptions)

### Implementation Details
- **Messages.js**: Updated to use `filterChatMessage`, `getChatViolationMessage`, `logChatViolation`
- **AddPost.js**: Updated to use `filterPostContent`, `getPostViolationMessage`, `logPostViolation`
- **Error Prevention**: "You can't post/send this content" - no confirmation dialogs
- **Real-time Feedback**: Live content analysis as user types with warning indicators
- **Sports Context**: Talent showcase and sports posts get automatic lenient treatment

### Filter Strictness Levels
1. **Chat Messages**: STRICTEST - No exceptions, all violations blocked immediately
2. **Post Content**: MODERATE - Sports-friendly with automatic context detection
3. **General Content**: BALANCED - Original comprehensive filtering maintained

### Security & Privacy
- All filters log violations for admin review without storing full content
- Sensitive words covered in multiple languages
- Regex patterns with proper escaping and word boundaries
- Context patterns detect sophisticated attempts to bypass filters

### User Experience
- Clear violation messages explaining why content was blocked
- Helpful suggestions for sports-appropriate alternatives
- Visual warnings with real-time feedback during typing
- No interrupting confirmation dialogs - direct content blocking

### Deployment Status
- ✅ **LIVE**: Updated filtering system deployed to Firebase Hosting
- ✅ **Testing**: All filter categories working correctly
- ✅ **Integration**: Both chat and post systems using appropriate dedicated filters
- ✅ **Documentation**: Complete implementation details recorded

## 📱 Stories Feature - COMPLETE IMPLEMENTATION
### Comprehensive Instagram/WhatsApp-Style Stories System
- **24-Hour Auto-Expiry**: Stories automatically disappear after 24 hours
- **Real-time Updates**: Live story viewing and management with Firebase listeners
- **Story Sharing**: Generate shareable public links for stories
- **Highlights System**: Save favorite stories as permanent collections
- **Mobile Responsive**: Touch-friendly interface with swipe navigation
- **Content Filtering**: Sports-friendly content filtering for story uploads

### Stories Feature Components (`src/components/stories/`)
- **`StoriesContainer.js`**: Main component displayed on Home page with user story circles
- **`StoryUpload.js`**: Upload modal with image/video support and content filtering
- **`StoryViewer.js`**: Full-screen story viewer with progress bars and navigation
- **`StoryProgress.js`**: Animated progress bars showing story viewing progress
- **`StorySharePage.js`**: Public sharing page for story links (route: `/story/:storyId`)
- **`HighlightsManager.js`**: Story highlights creation and management system
- **`Stories.css`**: Complete responsive CSS styling for all story components

### Stories Database Architecture (Firebase Firestore)
```javascript
// Stories Collection
stories: {
  storyId: {
    userId: "user123",
    userDisplayName: "Athlete Name",
    userPhotoURL: "https://...",
    mediaType: "image" | "video",
    mediaUrl: "https://...",
    thumbnail: "https://...", // for videos
    caption: "Training session complete! 💪",
    timestamp: Timestamp,
    expiresAt: Timestamp, // 24 hours from creation
    viewCount: 12,
    viewers: ["userId1", "userId2"],
    isHighlight: false,
    highlightId: null,
    sharingEnabled: true,
    publicLink: "https://amaplayer.app/story/storyId123"
  }
}

// Highlights Collection  
highlights: {
  highlightId: {
    userId: "user123",
    title: "Training Sessions",
    coverImage: "https://...",
    storyIds: ["story1", "story2", "story3"],
    createdAt: Timestamp,
    updatedAt: Timestamp,
    isPublic: true
  }
}

// Story Views Collection
storyViews: {
  viewId: {
    storyId: "story123",
    viewerId: "user456", 
    viewedAt: Timestamp,
    viewDuration: 3000 // milliseconds
  }
}
```

### Stories Service (`src/firebase/storiesService.js`)
- **`StoriesService.createStory()`**: Upload and create new stories
- **`StoriesService.getActiveStories()`**: Fetch non-expired stories
- **`StoriesService.viewStory()`**: Record story views with analytics
- **`StoriesService.onActiveStoriesUpdate()`**: Real-time story updates
- **`HighlightsService.createHighlight()`**: Create story highlights
- **`HighlightsService.addStoryToHighlight()`**: Add stories to highlights

### Key Features Implemented
1. **Story Creation & Upload**:
   - Image and video upload support (50MB limit)
   - Sports-friendly content filtering with real-time warnings
   - Caption support with character limit (200 chars)
   - Upload progress tracking with percentage display

2. **Story Viewing Experience**:
   - Full-screen immersive viewer with black background
   - Automatic story progression (5s images, 15s videos)
   - Progress bars showing viewing progress across all stories
   - Touch/swipe navigation (swipe right = next, swipe left = prev)
   - Tap left/right sides for quick navigation
   - Pause/resume functionality (tap center)

3. **Story Management**:
   - View counts and viewer lists for own stories
   - Story statistics and engagement tracking
   - Delete own stories functionality
   - Download own stories feature

4. **Story Sharing System**:
   - Public shareable links (e.g., `/story/storyId123`)
   - Social media sharing integration
   - Copy link to clipboard functionality
   - Public story viewing page with app promotion

5. **Highlights System**:
   - Create permanent story collections
   - Custom highlight titles and cover images
   - Add/remove stories from highlights
   - Highlights prevent story auto-expiry

6. **Home Page Integration**:
   - Stories carousel at top of home feed
   - User profile circles with unviewed story indicators
   - Gradient borders for unviewed stories
   - Story count badges showing number of stories per user
   - Add story button for authenticated users

7. **Advanced Features**:
   - Automatic grouping of stories by user
   - Real-time story updates with Firebase listeners
   - Guest user restrictions (view-only mode)
   - Auto-scroll to latest stories
   - Mobile touch interactions and long-press menus

### User Experience Flow
1. **Creating Stories**: Tap + button → Choose image/video → Add caption → Share story
2. **Viewing Stories**: Tap user circle → Full-screen viewer → Auto-progression with manual navigation
3. **Story Interaction**: View counts, share links, save to highlights
4. **Story Management**: Edit, delete, download own stories
5. **Highlights Creation**: Select multiple stories → Create themed collections

### Sports Integration
- **Content Filtering**: Sports-friendly filtering allows athlete terms like "fire", "beast mode", "crush it"
- **Talent Showcase**: Perfect for sharing training videos and achievement moments
- **Community Building**: Athletes can share daily training progress and motivation
- **Achievement Celebration**: Highlight system for preserving best sports moments

### Technical Excellence
- **Real-time Updates**: Firebase Firestore listeners for live story updates
- **Performance Optimized**: Lazy loading, image compression, efficient queries
- **Mobile First**: Touch-friendly interface with gesture support
- **Auto-Cleanup**: 24-hour expiry system prevents storage bloat
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: Content filtering and Firebase security rules integration

### Router Integration
- **Story Sharing Route**: `/story/:storyId` for public story viewing
- **Deep Linking**: Direct links to specific stories work correctly
- **Navigation**: Seamless integration with existing app routing