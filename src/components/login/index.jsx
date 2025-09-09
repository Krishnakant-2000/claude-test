import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import UserTypeSelection from "./UserTypeSelection";
import "./style.css";
import "./styleguide.css";
import "./UserTypeSelection.css";
import vector5 from "./vector-5.svg";

// User type specific forms
const AthleteForm = () => (
  <div className="user-type-form">
    <h3>Athlete Information</h3>
    <div className="form-group">
      <label>Sport/Game</label>
      <select name="sport" required>
        <option value="">Select your sport</option>
        <option value="cricket">Cricket</option>
        <option value="football">Football</option>
        <option value="basketball">Basketball</option>
        <option value="tennis">Tennis</option>
        <option value="badminton">Badminton</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div className="form-group">
      <label>Experience Level</label>
      <select name="experience" required>
        <option value="">Select experience level</option>
        <option value="beginner">Beginner</option>
        <option value="amateur">Amateur</option>
        <option value="semi-pro">Semi-Professional</option>
        <option value="professional">Professional</option>
      </select>
    </div>
  </div>
);

const CoachForm = () => (
  <div className="user-type-form">
    <h3>Coach Information</h3>
    <div className="form-group">
      <label>Sports/Games You Coach</label>
      <select multiple name="sports" required>
        <option value="cricket">Cricket</option>
        <option value="football">Football</option>
        <option value="basketball">Basketball</option>
        <option value="tennis">Tennis</option>
        <option value="badminton">Badminton</option>
        <option value="other">Other</option>
      </select>
      <small>Hold Ctrl/Cmd to select multiple</small>
    </div>
    <div className="form-group">
      <label>Certification Level</label>
      <input type="text" name="certification" required placeholder="E.g., BCCI Level 2" />
    </div>
    <div className="form-group">
      <label>Years of Experience</label>
      <input type="number" name="experience" min="0" required />
    </div>
  </div>
);

const OrganizationForm = () => (
  <div className="user-type-form">
    <h3>Organization Information</h3>
    <div className="form-group">
      <label>Organization Type</label>
      <select name="orgType" required>
        <option value="">Select organization type</option>
        <option value="academy">Sports Academy</option>
        <option value="club">Sports Club</option>
        <option value="school">School/College</option>
        <option value="university">University</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div className="form-group">
      <label>Sports/Games Offered</label>
      <select multiple name="sportsOffered" required>
        <option value="cricket">Cricket</option>
        <option value="football">Football</option>
        <option value="basketball">Basketball</option>
        <option value="tennis">Tennis</option>
        <option value="badminton">Badminton</option>
      </select>
      <small>Hold Ctrl/Cmd to select multiple</small>
    </div>
    <div className="form-group">
      <label>Organization Size</label>
      <select name="orgSize" required>
        <option value="">Select size</option>
        <option value="small">1-10 members</option>
        <option value="medium">11-50 members</option>
        <option value="large">51-200 members</option>
        <option value="xlarge">200+ members</option>
      </select>
    </div>
  </div>
);

export const LoginPageScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('type'); // 'type', 'details', 'login'
  const [userType, setUserType] = useState(null);
  const [searchParams] = useSearchParams();
  const { login, guestLogin, googleLogin, facebookLogin, appleLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Check for user type in URL params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['athlete', 'coach', 'organization'].includes(type)) {
      setUserType(type);
      setStep('details');
    }
  }, [searchParams]);

  const handleSelectUserType = (type) => {
    setUserType(type);
    setStep('details');
    // Update URL without reload
    navigate(`/login?type=${type}`, { replace: true });
  };

  const handleEmailLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Email login error:', error);
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await guestLogin();
      navigate('/home');
    } catch (error) {
      setError('Failed to log in as guest');
      console.error('Guest login error:', error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
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
  };

  const handleFacebookLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await facebookLogin();
      navigate('/home');
    } catch (error) {
      console.error('Facebook login error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Facebook Sign-in configuration issue. Please contact support.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else {
        setError('Failed to log in with Facebook. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleAppleLogin = async () => {
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
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleCoachRegister = () => {
    // Navigate to coach registration or show coming soon
    alert('Coach registration coming soon!');
  };

  const handleBackClick = () => {
    navigate('/app');
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return <UserTypeSelection onSelectType={handleSelectUserType} />;
      
      case 'details':
        return (
          <div className="login-page">
            <div className="login-container">
              <div className="login-form">
                <h2>Complete Your {userType.charAt(0).toUpperCase() + userType.slice(1)} Profile</h2>
                
                {userType === 'athlete' && <AthleteForm />}
                {userType === 'coach' && <CoachForm />}
                {userType === 'organization' && <OrganizationForm />}
                
                <div className="form-navigation">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setStep('type')}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => setStep('login')}
                  >
                    Continue to Login
                  </button>
                        <div className="text-wrapper-4">Email</div>

                        <div className="text-wrapper-5">Password</div>

                        <div 
                            className="text-wrapper-6"
                            style={{ pointerEvents: 'none' }}
                        >
                            {loading ? 'Loading...' : 'Login'}
                        </div>
                        </form> 

                    <button
                        className="continue-as-a-guest"
                        onClick={handleGuestLogin}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
                    >
                        <div className="div">
                            {loading ? 'Loading...' : 'Continue as Guest'}
                        </div>
                    </button>

                    <button
                        className="sign-up"
                        onClick={handleSignup}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
                    >
                        <div className="text-wrapper-2">Sign up</div>
                    </button>

                    <button
                        className="register-as-a-coach"
                        onClick={handleCoachRegister}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
                    >
                        <div className="text-wrapper-3">Register as a Coach</div>
                    </button>

                    <div className="text-wrapper-7">OR</div>

                    <div className="text-wrapper-8">New User</div>

                    <button
                        className="continue-with"
                        onClick={handleFacebookLogin}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
                    >
                        <div className="logos-facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.0698C24 5.3918 18.6274 0 12 0C5.3726 0 0 5.3918 0 12.0698C0 18.1308 4.388 23.0938 10.125 24V15.5638H7.0782V12.0698H10.125V9.4148C10.125 6.3878 11.9166 4.7168 14.6576 4.7168C15.9706 4.7168 17.3438 4.9528 17.3438 4.9528V7.9208H15.8306C14.3398 7.9208 13.875 8.8528 13.875 9.8088V12.0698H17.2031L16.6711 15.5638H13.875V24C19.612 23.0938 24 18.1308 24 12.0698Z" fill="white"/>
                            </svg>
                        </div>

                        <div className="text-wrapper-9">Continue with Facebook</div>
                    </button>

                    <button
                        className="continue-with-google"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
                    >
                        <div className="devicon-google">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </div>

                        <div className="text-wrapper-10">Continue with Google</div>
                    </button>

                    <button
                        className="sign-in-with-apple"
                        onClick={handleAppleLogin}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
                    >
                        <div className="ri-apple-line">
                            <img className="vector-5" alt="Vector" src={vector5} />
                        </div>

                        <div className="text-wrapper-2">Sign in with Apple</div>
                    </button>
                </div>
            </div>
        </div>
    );
};