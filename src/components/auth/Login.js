import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, guestLogin, googleLogin, appleLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (error) {
      setError('Failed to log in');
    }
    setLoading(false);
  }

  async function handleGuestLogin() {
    try {
      setError('');
      setLoading(true);
      await guestLogin();
      navigate('/home');
    } catch (error) {
      setError('Failed to log in as guest');
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await googleLogin();
      navigate('/home');
    } catch (error) {
      setError('Failed to log in with Google');
      console.error('Google login error:', error);
    }
    setLoading(false);
  }

  async function handleAppleLogin() {
    try {
      setError('');
      setLoading(true);
      await appleLogin();
      navigate('/home');
    } catch (error) {
      console.error('Apple login error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Apple Sign-in is not enabled. Please contact support.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled');
      } else {
        setError('Failed to log in with Apple');
      }
    }
    setLoading(false);
  }

  return (
    <div className="auth-container auth-page">
      <div className="auth-header">
        <button 
          className="homepage-btn"
          onClick={() => navigate('/')}
          title="Go to Homepage"
        >
          🏠 <span>Home</span>
        </button>
        <div className="auth-controls">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
      <div className="auth-card">
        <h1>{t('amaplayer')}</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={loading} type="submit" className="auth-btn">
            {t('login')}
          </button>
        </form>
        <div className="social-login">
          <button 
            disabled={loading} 
            className="auth-btn google-btn"
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </button>
          <button 
            disabled={loading} 
            className="auth-btn apple-btn"
            onClick={handleAppleLogin}
          >
            Sign in with Apple
          </button>
        </div>
        <div className="guest-login">
          <button 
            disabled={loading} 
            onClick={handleGuestLogin} 
            className="auth-btn guest-btn"
          >
            {t('continue_guest')}
          </button>
        </div>
        <div className="auth-link-section">
          <p>{t('no_account')}</p>
          <button 
            className="auth-link-btn"
            onClick={() => navigate('/signup')}
          >
            {t('signup')}
          </button>
        </div>
      </div>
    </div>
  );
}