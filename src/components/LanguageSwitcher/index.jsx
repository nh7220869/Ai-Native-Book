import clsx from 'clsx';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@site/src/contexts/TranslationContext';


const LANGUAGES = [
  { code: 'en', name: 'English', emoji: '🇺🇸', native: 'English' },
  { code: 'ur', name: 'Urdu', emoji: '🇵🇰', native: 'اردو' },
  { code: 'es', name: 'Spanish', emoji: '🇪🇸', native: 'Español' },
];

const LanguageSwitcher = () => {
  const { currentLanguage, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current language info
  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="language-switcher-emoji">{currentLang.emoji}</span>
        <span className="language-switcher-name">{currentLang.native}</span>
        <span className="language-switcher-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="language-switcher-dropdown">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={clsx('language-switcher-option', { 'language-switcher-option--active': lang.code === currentLanguage })}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="language-switcher-option-emoji">{lang.emoji}</span>
              <div className="language-switcher-option-text">
                <span className="language-switcher-option-name">{lang.name}</span>
                <span className="language-switcher-option-native">{lang.native}</span>
              </div>
              {lang.code === currentLanguage && (
                <span className="language-switcher-checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
