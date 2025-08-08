import React, { useState, useRef, useEffect, memo } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = memo(function LanguageSelector() {
  const { currentLanguage, changeLanguage, getCurrentLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const currentLang = getCurrentLanguage();

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className="language-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
      >
        <Globe size={18} className="language-icon" />
        <span className="language-text">{currentLang.nativeName}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
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
      )}
    </div>
  );
});

export default LanguageSelector;