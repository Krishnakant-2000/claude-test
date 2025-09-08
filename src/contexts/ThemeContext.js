import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('amaplayer-theme');
    return savedTheme ? JSON.parse(savedTheme) : false; // Default to light mode
  });

  useEffect(() => {
    localStorage.setItem('amaplayer-theme', JSON.stringify(isDarkMode));
    
    // Apply theme to document root
    const themeValue = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeValue);
    
    // Also add a backup method using body class for extra persistence
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeValue}`);
    
    // Set a CSS custom property as another backup
    document.documentElement.style.setProperty('--current-theme', themeValue);
  }, [isDarkMode]);

  // Additional effect to re-apply theme on page load/navigation
  useEffect(() => {
    const reapplyTheme = () => {
      const themeValue = isDarkMode ? 'dark' : 'light';
      if (document.documentElement.getAttribute('data-theme') !== themeValue) {
        console.log('Theme Context: Re-applying theme after navigation/cleanup');
        document.documentElement.setAttribute('data-theme', themeValue);
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${themeValue}`);
        document.documentElement.style.setProperty('--current-theme', themeValue);
        
        // Force a repaint to ensure styles are applied
        document.body.style.display = 'none';
        const _ = document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
      }
    };

    // Re-apply theme immediately
    reapplyTheme();

    // Also re-apply after a brief delay to catch any cleanup that happens after component mount
    const timeoutId = setTimeout(reapplyTheme, 200);
    
    // Listen for custom theme refresh events (triggered after login)
    const handleThemeRefresh = () => {
      setTimeout(reapplyTheme, 100);
    };
    
    window.addEventListener('themeRefresh', handleThemeRefresh);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('themeRefresh', handleThemeRefresh);
    };
  }, [isDarkMode]);

  // Force theme reapplication method
  const forceThemeUpdate = () => {
    const themeValue = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeValue);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeValue}`);
    document.documentElement.style.setProperty('--current-theme', themeValue);
    
    // Force repaint
    document.body.style.display = 'none';
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light',
    forceThemeUpdate
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}