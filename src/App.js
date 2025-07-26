import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PerformanceDashboard from './components/common/PerformanceDashboard';
import './styles/global.css';
import './styles/themes.css';
import './App.css';
import './performance.css';

// Lazy load components for better performance
const LandingPage3D = React.lazy(() => import('./components/pages/LandingPage3D'));
const Login = React.lazy(() => import('./components/auth/Login'));
const Signup = React.lazy(() => import('./components/auth/Signup'));
const Home = React.lazy(() => import('./components/pages/Home'));
const Profile = React.lazy(() => import('./components/pages/Profile'));
const Search = React.lazy(() => import('./components/pages/Search'));
const AddPost = React.lazy(() => import('./components/pages/AddPost'));
const Messages = React.lazy(() => import('./components/pages/Messages'));
const StorySharePage = React.lazy(() => import('./components/stories/StorySharePage'));

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
  return (
    <div className="App">
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
              <Route path="/story/:storyId" element={<StorySharePage />} />
              <Route path="/dashboard" element={<Navigate to="/home" />} />
              </Routes>
      </Suspense>
      
      {/* Performance Dashboard (Development Only) */}
      <PerformanceDashboard />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
