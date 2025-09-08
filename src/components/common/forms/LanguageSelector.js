import React, { useState, useRef, useEffect, memo } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = memo(function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const [isInSettings, setIsInSettings] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      // Check if we're inside a settings menu
      const inSettingsMenu = buttonRef.current.closest('.settings-dropdown');
      setIsInSettings(!!inSettingsMenu);
      
      // If in settings, use overlay mode (direction doesn't matter)
      if (inSettingsMenu) {
        setDropdownDirection('overlay');
      } else {
        // For other contexts, use smart positioning
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 350;
        setDropdownDirection(spaceBelow < dropdownHeight ? 'up' : 'down');
      }
    }
    setIsOpen(!isOpen);
  };


  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        ref={buttonRef}
        className="language-toggle"
        onClick={handleToggleDropdown}
        aria-label="Select Language"
      >
        <Globe size={20} className="language-icon" />
      </button>
      
      {isOpen && (
        <>
          {isInSettings && <div className="language-backdrop" onClick={() => setIsOpen(false)} />}
          <div className={`language-dropdown ${dropdownDirection === 'up' ? 'dropdown-up' : ''} ${dropdownDirection === 'overlay' ? 'dropdown-overlay' : ''}`}>
            <div className="language-dropdown-header">
              <Globe size={16} />
              <span>Choose Language</span>
            </div>
            <div className="language-options">
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(language.code)}
                >
                  <div className="language-info">
                    <span className="language-name">{language.name}</span>
                    <span className="language-native">{language.nativeName}</span>
                  </div>
                  {currentLanguage === language.code && (
                    <span className="language-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default LanguageSelector;