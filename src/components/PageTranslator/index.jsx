import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@site/src/contexts/TranslationContext';


const PageTranslator = () => {
  const { isTranslating, currentLanguage } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  // Show banner when translating
  useEffect(() => {
    if (isTranslating) {
      setShowBanner(true);
    }
  }, [isTranslating]);

  // Auto-hide banner after translation completes
  useEffect(() => {
    if (!isTranslating && showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isTranslating, showBanner]);

  // Don't render anything if English and not translating
  if (currentLanguage === 'en' && !isTranslating) {
    return null;
  }

  return (
    <>
      {/* Translation Progress Banner */}
      {showBanner && (
        <div className={clsx('page-translator-banner', { 'page-translator-banner--success': !isTranslating })}>
          {isTranslating ? (
            <>
              <div className="page-translator-spinner"></div>
              <span>Translating page to {getLanguageName(currentLanguage)}...</span>
            </>
          ) : (
            <>
              <span className="page-translator-checkmark">✓</span>
              <span>Page translated to {getLanguageName(currentLanguage)}</span>
            </>
          )}
        </div>
      )}

      {/* Floating Translation Indicator */}
      {isTranslating && (
        <div className="page-translator-floating-indicator">
          <div className="page-translator-small-spinner"></div>
          <span>Translating...</span>
        </div>
      )}
    </>
  );
};

// Helper function to get language name
const getLanguageName = (locale) => {
  const names = {
    en: 'English',
    ur: 'Urdu (اردو)',
    es: 'Español',
  };
  return names[locale] || locale;
};

export default PageTranslator;
