import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        return updateProfile(userCredential.user, { displayName });
      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function guestLogin() {
    return signInAnonymously(auth);
  }

  async function googleLogin() {
    const provider = new GoogleAuthProvider();
    
    try {
      // First try popup method
      return await signInWithPopup(auth, provider);
    } catch (error) {
      // If popup fails due to CORS or popup blocked, fallback to redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked, falling back to redirect...');
        return signInWithRedirect(auth, provider);
      }
      throw error;
    }
  }

  function appleLogin() {
    const provider = new OAuthProvider('apple.com');
    // Request additional scopes if needed
    provider.addScope('email');
    provider.addScope('name');
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  function updateUserProfile(profileData) {
    return updateProfile(currentUser, profileData);
  }

  useEffect(() => {
    // Handle redirect result from Google OAuth
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Google redirect login successful:', result.user);
          setCurrentUser(result.user);
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper function to check if current user is a guest
  function isGuest() {
    return currentUser && currentUser.isAnonymous;
  }

  const value = {
    currentUser,
    isGuest,
    signup,
    login,
    guestLogin,
    googleLogin,
    appleLogin,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}