import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivateRoute from './features/auth/PrivateRoute';
import NetworkStatus from './components/common/NetworkStatus';
import { registerSW } from './utils/serviceWorkerRegistration';
import { queryClient } from './lib/queryClient';
import './styles/global.css';
import './styles/themes.css';
import './App.css';
import './performance.css';

// Lazy load components for better performance
const LandingPage3D = React.lazy(() => import('./pages/landingpage3d/LandingPage3D'));
const Login = React.lazy(() => import('./features/auth/Login'));
const Signup = React.lazy(() => import('./features/auth/Signup'));
const Home = React.lazy(() => import('./pages/home/Home'));
const Profile = React.lazy(() => import('./pages/profile/Profile'));
const Search = React.lazy(() => import('./pages/search/Search'));
const AddPost = React.lazy(() => import('./pages/addpost/AddPost'));
const Messages = React.lazy(() => import('./pages/messages/Messages'));
const Events = React.lazy(() => import('./pages/events/Events'));
const PostDetail = React.lazy(() => import('./pages/postdetail/PostDetail'));
const StoryDetail = React.lazy(() => import('./features/stories/StoryDetail'));
const StorySharePage = React.lazy(() => import('./features/stories/StorySharePage'));
const VerificationPage = React.lazy(() => import('./pages/verification/VerificationPage'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--accent-primary)',
      borderTop: '4px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

function AppContent() {
  useEffect(() => {
    // Register service worker for offline functionality - Phase 1
    registerSW({
      onSuccess: () => {
        console.log('SW Phase 1: Service worker registered successfully');
      },
      onUpdate: () => {
        console.log('SW Phase 1: New version available');
      }
    });
  }, []);

  return (
    <div className="App">
      <NetworkStatus />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
              <Route path="/" element={<LandingPage3D />} />
              <Route path="/landing" element={<LandingPage3D />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              <Route path="/search" element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              } />
              <Route path="/add-post" element={
                <PrivateRoute>
                  <AddPost />
                </PrivateRoute>
              } />
              <Route path="/messages" element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              } />
              <Route path="/events" element={
                <PrivateRoute>
                  <Events />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/profile/:userId" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/post/:postId" element={
                <PrivateRoute>
                  <PostDetail />
                </PrivateRoute>
              } />
              <Route path="/story/:storyId" element={
                <PrivateRoute>
                  <StoryDetail />
                </PrivateRoute>
              } />
              <Route path="/story-share/:storyId" element={<StorySharePage />} />
              <Route path="/verify/:verificationId" element={<VerificationPage />} />
              </Routes>
      </Suspense>
      
    </div>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
