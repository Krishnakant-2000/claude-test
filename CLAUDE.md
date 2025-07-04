# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AmaPlayer** is a sophisticated social media application for athletes, inspired by Instagram but focused on sports content. Built with React 19, Firebase backend, and featuring a dark gaming aesthetic with advanced UI/UX elements.

### Key Features
- Instagram-like social media interface for athletes
- Beautiful landing page with Olympic imagery and legendary player quotes
- Dark theme with blue/black gradients and green glowing effects
- Custom green glowing mouse cursor with interactive animations
- Firebase authentication with guest login support
- Real-time posts feed with likes and comments
- Profile management with image uploads
- Mobile-responsive design with footer navigation

## Development Commands

### Starting Development Server
```bash
npm start
# Default port 3000, but typically run on custom ports
PORT=3002 npm start
# With external network access for mobile testing
HOST=0.0.0.0 PORT=3002 npm start
```

### Running Tests
```bash
npm test
# Run specific test files
npm test -- --testPathPattern=Login.test.js --watchAll=false
```

### Building for Production
```bash
npm run build
```

### Linting and Type Checking
- ESLint integrated with react-app configuration
- Shows errors in development console
- Run build command to verify code quality

## Architecture Overview

### Tech Stack
- **Frontend**: React 19.1.0 with functional components and hooks
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Routing**: React Router DOM 7.6.3
- **Styling**: CSS modules with custom dark theme
- **State Management**: React Context API for authentication
- **Testing**: Jest + React Testing Library

### Project Structure

```
src/
├── components/
│   ├── LandingPage.js       # Hero section with Olympic imagery and quotes
│   ├── LandingPage.css      # Landing page dark theme styling
│   ├── Home.js              # Main feed (renamed from Dashboard)
│   ├── Home.css             # Feed styling with dark theme
│   ├── Profile.js           # User profile with post grid
│   ├── Profile.css          # Profile page styling
│   ├── Login.js             # Authentication with guest login
│   ├── Signup.js            # User registration
│   ├── Auth.css             # Authentication styling
│   ├── Search.js            # Search functionality
│   ├── AddPost.js           # Post creation with image upload
│   ├── Activity.js          # Notifications/activity feed
│   ├── FooterNav.js         # Instagram-like bottom navigation
│   ├── FooterNav.css        # Footer navigation styling
│   ├── CustomCursor.js      # Green glowing cursor component
│   └── PrivateRoute.js      # Route protection
├── contexts/
│   └── AuthContext.js       # Firebase authentication context
├── data/
│   └── samplePosts.js       # Sample posts for preview
├── firebase.js              # Firebase configuration
├── App.js                   # Main app with routing
├── App.css                  # Global dark theme and cursor styles
└── index.js                 # React app entry point
```

## Firebase Integration

### Authentication
- Email/password authentication
- **Guest login** with Firebase anonymous auth
- Profile management with display names
- Protected routes for authenticated users

### Database (Firestore)
- **Posts collection**: User posts with images, captions, likes, comments
- **Users collection**: User profiles with bio, followers, following
- Real-time updates with onSnapshot listeners

### Storage
- Profile image uploads
- Post image uploads with automatic compression
- Error handling for failed uploads

### Firebase Configuration
Update `src/firebase.js` with your Firebase project credentials:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Routing Structure

- `/` - Landing page with hero section and quotes
- `/login` - Authentication page with guest option
- `/signup` - User registration
- `/home` - Main feed (protected route)
- `/profile` - User profile (protected route)
- `/search` - Search functionality (protected route)
- `/add-post` - Post creation (protected route)
- `/activity` - Notifications (protected route)

## Styling Guidelines

### Dark Theme Color Palette
- **Primary Background**: `#0f1419` to `#2d3748` gradients
- **Card Backgrounds**: `rgba(45, 55, 72, 0.9)` with transparency
- **Text Colors**: `#e2e8f0` (light), `#a0aec0` (muted)
- **Accent Color**: `#00ff88` (green glow)
- **Interactive Elements**: Green borders and glowing effects

### CSS Best Practices
- Use CSS gradients for backgrounds
- Implement backdrop-filter for glass morphism effects
- Add hover animations and transitions
- Ensure mobile responsiveness
- Use z-index properly for layering

### Custom Cursor Implementation
- Green glowing cursor with animation
- Hover effects on interactive elements
- Smooth tracking with transform transitions

## Component Development Guidelines

### Authentication Components
- Always use `useAuth()` hook for authentication state
- Implement loading states during authentication
- Handle errors gracefully with user-friendly messages
- Support both email/password and guest authentication

### UI Components
- Follow Instagram-like design patterns
- Use consistent spacing and typography
- Implement hover effects and animations
- Ensure accessibility with proper ARIA labels

### Form Handling
- Use controlled components for forms
- Implement proper validation
- Show loading states during submissions
- Handle file uploads with preview functionality

## Testing Strategy

### Component Testing
- Test authentication flows (login, signup, guest)
- Test form submissions and validations
- Test navigation and routing
- Mock Firebase services for isolated testing

### Test File Structure
```
src/components/__tests__/
├── Dashboard.test.js    # Main feed testing
├── Login.test.js        # Authentication testing
└── Profile.test.js      # Profile functionality testing
```

## Performance Optimizations

### Image Handling
- Use Unsplash URLs with proper parameters for optimization
- Implement error handling with fallback placeholder images
- Compress uploaded images for storage efficiency

### Bundle Optimization
- Code splitting with React.lazy() for large components
- Optimize images and assets
- Use production builds for deployment

## Mobile Development

### Responsive Design
- Mobile-first approach with CSS Grid and Flexbox
- Touch-friendly button sizes (minimum 44px)
- Responsive typography with rem units
- Footer navigation optimized for mobile interaction

### Network Testing
```bash
# Start server with network access for mobile testing
HOST=0.0.0.0 PORT=3002 npm start
# Access from mobile: http://[your-ip]:3002
```

## Development Best Practices

### Code Organization
- Group related components in folders
- Use consistent naming conventions
- Implement proper error boundaries
- Follow React hooks best practices

### State Management
- Use Context API for global state (authentication)
- Keep component state local when possible
- Implement proper cleanup in useEffect hooks

### Error Handling
- Implement error boundaries for React components
- Handle Firebase errors gracefully
- Provide user feedback for failed operations
- Log errors appropriately for debugging

### Security Considerations
- Never expose Firebase private keys
- Implement proper route protection
- Validate user inputs
- Use Firebase Security Rules for data protection

## Deployment Considerations

### Environment Variables
- Set up different Firebase configs for development/production
- Use environment variables for sensitive data
- Configure proper CORS settings

### Build Optimization
- Run `npm run build` for production builds
- Test builds locally before deployment
- Configure proper caching headers
- Optimize for Core Web Vitals

## Sample Data Structure

### Post Document (Firestore)
```javascript
{
  id: "post_id",
  caption: "Post caption",
  imageUrl: "https://...",
  userId: "user_id",
  userDisplayName: "User Name",
  timestamp: Firebase.Timestamp,
  likes: ["user_id1", "user_id2"],
  comments: []
}
```

### User Document (Firestore)
```javascript
{
  id: "user_id",
  displayName: "User Name",
  email: "user@example.com",
  bio: "User bio",
  photoURL: "https://...",
  followers: 0,
  following: 0
}
```

## Quick Reference

### Common Commands
- Start development: `PORT=3002 npm start`
- Run tests: `npm test`
- Build production: `npm run build`
- Mobile testing: Use network IP with port 3002

### Key Files to Modify
- **Firebase config**: `src/firebase.js`
- **Authentication**: `src/contexts/AuthContext.js`
- **Routing**: `src/App.js`
- **Styling**: Component-specific CSS files
- **Sample data**: `src/data/samplePosts.js`

## Advanced Development Patterns

### Custom Hook Patterns
```javascript
// Authentication hook pattern
const { currentUser, login, logout, guestLogin } = useAuth();

// Loading state pattern
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// Firebase operation pattern
try {
  setLoading(true);
  setError('');
  await firebaseOperation();
} catch (error) {
  setError('User-friendly error message');
} finally {
  setLoading(false);
}
```

### Component Composition Patterns
```javascript
// Protected route wrapper
<PrivateRoute>
  <ComponentName />
</PrivateRoute>

// Layout with footer navigation
<div className="page-container">
  <main className="main-content">
    {/* Page content */}
  </main>
  <FooterNav />
</div>
```

## UI/UX Design Principles

### Dark Theme Implementation
- Use gradient backgrounds for depth: `linear-gradient(135deg, #0f1419, #2d3748)`
- Implement glass morphism: `backdrop-filter: blur(10px)`
- Green accent color (`#00ff88`) for interactive elements
- Subtle animations for smooth user experience

### Interactive Elements
- All buttons should have hover effects
- Use transform and box-shadow for depth
- Implement loading states for async operations
- Provide visual feedback for user actions

### Typography Hierarchy
```css
/* Primary headings */
h1 { color: #00ff88; font-size: 2.5rem; text-shadow: glow effect; }

/* Secondary text */
h2, h3 { color: #e2e8f0; }

/* Body text */
p { color: #a0aec0; line-height: 1.6; }

/* Muted text */
.muted { color: #718096; }
```

## State Management Patterns

### Authentication State
```javascript
// Context provider pattern
<AuthProvider>
  <App />
</AuthProvider>

// Hook usage in components
const { currentUser, loading } = useAuth();
if (loading) return <LoadingSpinner />;
if (!currentUser) return <Navigate to="/login" />;
```

### Form State Management
```javascript
// Controlled form pattern
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

const handleChange = (e) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};
```

## Firebase Best Practices

### Real-time Data Patterns
```javascript
// Firestore listener pattern
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'posts'), orderBy('timestamp', 'desc')),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    }
  );
  return () => unsubscribe();
}, []);
```

### Image Upload Pattern
```javascript
// File upload with preview
const handleImageUpload = async (file) => {
  setUploading(true);
  try {
    const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw new Error('Upload failed');
  } finally {
    setUploading(false);
  }
};
```

## Error Handling Standards

### Component Error Boundaries
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling
```javascript
// Standard async operation pattern
const handleAsyncOperation = async () => {
  try {
    setLoading(true);
    setError('');
    const result = await asyncFunction();
    // Handle success
  } catch (error) {
    setError(getErrorMessage(error));
    console.error('Operation failed:', error);
  } finally {
    setLoading(false);
  }
};
```

## Animation and Interaction Guidelines

### CSS Animation Patterns
```css
/* Fade in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.interactive-element {
  transition: all 0.3s ease;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
}
```

### Loading States
```javascript
// Loading component pattern
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

// Button loading state
<button disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

## Security Implementation

### Input Validation
```javascript
// Client-side validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (data) => {
  const errors = {};
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email required';
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};
```

### Firebase Security Rules
```javascript
// Firestore security rules example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Performance Optimization Techniques

### Image Optimization
```javascript
// Image loading with optimization
const OptimizedImage = ({ src, alt, fallback }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="image-container">
      {loading && <ImageSkeleton />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        style={{ display: loading ? 'none' : 'block' }}
      />
      {error && <img src={fallback} alt={alt} />}
    </div>
  );
};
```

### Code Splitting
```javascript
// Lazy loading components
const Profile = lazy(() => import('./components/Profile'));
const Dashboard = lazy(() => import('./components/Home'));

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <Profile />
</Suspense>
```

## Testing Patterns

### Component Testing Template
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComponentName from '../ComponentName';

// Mock external dependencies
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockUser,
    login: jest.fn(),
    logout: jest.fn()
  })
}));

describe('ComponentName', () => {
  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ComponentName {...props} />
      </MemoryRouter>
    );
  };

  test('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    renderComponent();
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalled();
    });
  });
});
```

## Accessibility Guidelines

### ARIA Implementation
```javascript
// Accessible button
<button
  aria-label="Like post"
  aria-pressed={isLiked}
  onClick={handleLike}
>
  {isLiked ? '❤️' : '🤍'} {likeCount}
</button>

// Form accessibility
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email
  </div>
)}
```

### Keyboard Navigation
```css
/* Focus indicators */
.interactive-element:focus {
  outline: 2px solid #00ff88;
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #00ff88;
  color: #000;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
```

## Deployment and DevOps

### Environment Configuration
```javascript
// Environment-specific configs
const config = {
  development: {
    apiUrl: 'http://localhost:3002',
    firebase: devFirebaseConfig
  },
  production: {
    apiUrl: 'https://amaplayer.com',
    firebase: prodFirebaseConfig
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Build Optimization
```json
// package.json scripts for optimization
{
  "scripts": {
    "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "build:prod": "GENERATE_SOURCEMAP=false npm run build",
    "serve": "serve -s build -l 3000"
  }
}
```

This documentation provides comprehensive guidance for developing, testing, and maintaining the AmaPlayer social media application with its advanced features and dark gaming aesthetic.