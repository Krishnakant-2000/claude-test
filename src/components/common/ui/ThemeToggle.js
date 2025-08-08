import React, { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = memo(function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <Sun size={20} className="theme-icon" />
      ) : (
        <Moon size={20} className="theme-icon" />
      )}
    </button>
  );
});

export default ThemeToggle;