import React from 'react';


const TranslationModal = ({ isOpen, onClose, originalText, translatedText, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="translation-modal-overlay" onClick={onClose}>
      <div className="translation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="translation-modal-header">
          <h3>Translation to Urdu</h3>
          <button className="translation-modal-close-button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="translation-modal-body">
          <div className="translation-modal-text-section">
            <h4 className="translation-modal-section-title">Original Text:</h4>
            <div className="translation-modal-text-box">
              {originalText}
            </div>
          </div>

          <div className="translation-modal-arrow">↓</div>

          <div className="translation-modal-text-section">
            <h4 className="translation-modal-section-title">Urdu Translation:</h4>
            <div className="translation-modal-text-box translation-modal-translated-box">
              {isLoading && (
                <div className="translation-modal-loading-container">
                  <div className="translation-modal-loading-spinner"></div>
                  <p>Translating...</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    This may take a moment
                  </p>
                </div>
              )}
              {error && (
                <div className="translation-modal-error-message">
                  <span className="translation-modal-error-icon">⚠</span>
                  <div>
                    <p><strong>Translation Error</strong></p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>{error}</p>
                    {(error.includes('quota') || error.includes('Quota')) && (
                      <p style={{ fontSize: '12px', marginTop: '12px', color: '#666' }}>
                        <strong>Tip:</strong> The API has rate limits.
                        Please wait a few seconds and try again, or translate smaller text selections.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!isLoading && !error && translatedText && (
                <div className="translation-modal-translated-text-container">
                  <p className="translation-modal-translated-text">{translatedText}</p>
                  <button
                    className="translation-modal-copy-button"
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      alert('Translation copied to clipboard!');
                    }}
                    title="Copy translation"
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="translation-modal-footer">
          <button className="translation-modal-close-footer-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;
