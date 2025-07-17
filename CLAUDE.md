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
- `src/components/pages/` - Main page components
- `src/components/common/` - Reusable components
- `src/contexts/` - React contexts (Auth, Theme, Language)
- `src/styles/themes.css` - Theme variable definitions
- `src/firebase/` - Firebase configuration and services

### Build & Development
- React app runs on port 3000
- Uses Firebase for backend services
- Supports 12 languages: English, Hindi, Punjabi, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Odia, and Assamese

### Latest Updates - Current Session (Today)
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