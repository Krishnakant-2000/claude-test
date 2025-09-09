import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SettingsContext = createContext({});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      events: true
    },
    privacy: {
      profileVisible: true,
      showOnlineStatus: true,
      allowMessageRequests: true,
      showActivityStatus: true,
      searchableByEmail: true,
      showFollowersCount: true
    },
    account: {
      language: 'en',
      autoSave: true,
      dataUsage: 'normal', // minimal, normal, high
      downloadQuality: 'auto' // low, medium, high, auto
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      showTimestamps: true,
      animationsEnabled: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load user settings from Firebase
  const loadSettings = async () => {
    if (!currentUser || isGuest()) return;
    
    setLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      const settingsDoc = await getDoc(userSettingsRef);
      
      if (settingsDoc.exists()) {
        const userData = settingsDoc.data();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...userData.settings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings to Firebase
  const saveSettings = async (newSettings = settings) => {
    if (!currentUser || isGuest()) return false;
    
    setLoading(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', currentUser.uid);
      await setDoc(userSettingsRef, {
        userId: currentUser.uid,
        settings: newSettings,
        updatedAt: new Date(),
        version: '2.1'
      }, { merge: true });
      
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update specific setting
  const updateSetting = (category, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Bulk update settings
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  // Reset settings to defaults
  const resetSettings = () => {
    const defaultSettings = {
      notifications: {
        push: true,
        email: true,
        likes: true,
        comments: true,
        follows: true,
        messages: true,
        events: true
      },
      privacy: {
        profileVisible: true,
        showOnlineStatus: true,
        allowMessageRequests: true,
        showActivityStatus: true,
        searchableByEmail: true,
        showFollowersCount: true
      },
      account: {
        language: 'en',
        autoSave: true,
        dataUsage: 'normal',
        downloadQuality: 'auto'
      },
      appearance: {
        theme: 'dark',
        compactMode: false,
        showTimestamps: true,
        animationsEnabled: true
      }
    };
    
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  // Export settings as JSON
  const exportSettings = () => {
    const settingsBlob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(settingsBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amaplayer-settings-${currentUser?.uid || 'guest'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import settings from JSON file
  const importSettings = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasUnsavedChanges(true);
          resolve(true);
        } catch (error) {
          reject(new Error('Invalid settings file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Load settings when user changes
  useEffect(() => {
    if (currentUser && !isGuest()) {
      loadSettings();
    }
  }, [currentUser]);

  const value = {
    settings,
    loading,
    hasUnsavedChanges,
    updateSetting,
    updateSettings,
    saveSettings,
    loadSettings,
    resetSettings,
    exportSettings,
    importSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;