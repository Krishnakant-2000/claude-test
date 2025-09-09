import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/common/ui/ThemeToggle';
import { resetPageStyles, bustCSSCache } from '../../utils/cssCleanup';
import './Auth.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin, appleLogin } = useAuth();
  const navigate = useNavigate();

  // Ultra-aggressive CSS cleanup and cache busting
  useEffect(() => {
    // Immediate complete reset
    resetPageStyles('signup');
    
    // Additional cache busting after delays to catch lazy-loaded styles
    const timers = [
      setTimeout(() => bustCSSCache(), 100),
      setTimeout(() => resetPageStyles('signup'), 200),
      setTimeout(() => bustCSSCache(), 500)
    ];
    
    // Set page title
    document.title = 'AmaPlayer - Sign Up';
    
    console.log('SIGNUP: Ultra-aggressive CSS cleanup and cache busting completed');
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Cache busting on every render to handle repeated navigation
  useEffect(() => {
    bustCSSCache();
    
    const timer = setTimeout(() => {
      resetPageStyles('signup');
    }, 50);
    
    return () => clearTimeout(timer);
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName);
      navigate('/home');
    } catch (error) {
      setError('Failed to create an account');
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
    try {
      setError('');
      setLoading(true);
      await googleLogin();
      navigate('/home');
    } catch (error) {
      setError('Failed to sign up with Google');
      console.error('Google signup error:', error);
    }
    setLoading(false);
  }

  async function handleAppleSignup() {
    try {
      setError('');
      setLoading(true);
      await appleLogin();
      navigate('/home');
    } catch (error) {
      console.error('Apple signup error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Apple Sign-in is not enabled. Please contact support.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled');
      } else {
        setError('Failed to sign up with Apple');
      }
    }
    setLoading(false);
  }

  return (
    <div className="auth-container auth-page">
      <div className="auth-header">
        <button 
          className="homepage-btn"
          onClick={() => navigate('/app')}
          title="Go to App"
        >
          🏠 <span>Home</span>
        </button>
        <div className="auth-controls">
          <ThemeToggle />
        </div>
      </div>
      <div className="auth-card">
        <h1>AmaPlayer</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={loading} type="submit" className="auth-btn">
            Sign Up
          </button>
        </form>
        <div className="social-login">
          <button 
            disabled={loading} 
            className="auth-btn google-btn"
            onClick={handleGoogleSignup}
          >
            Sign up with Google
          </button>
          <button 
            disabled={loading} 
            className="auth-btn apple-btn"
            onClick={handleAppleSignup}
          >
            Sign up with Apple
          </button>
        </div>
        <div className="auth-link-section">
          <p>Already have an account?</p>
          <button 
            className="auth-link-btn"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}