import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, guestLogin } = useAuth();
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

  return (
    <div className="auth-container auth-page">
      <div className="auth-header">
        <LanguageSelector />
        <ThemeToggle />
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
        <div className="guest-login">
          <button 
            disabled={loading} 
            onClick={handleGuestLogin} 
            className="auth-btn guest-btn"
          >
            {t('continue_guest')}
          </button>
        </div>
        <p>
          {t('no_account')} <Link to="/signup">{t('signup')}</Link>
        </p>
      </div>
    </div>
  );
}