import React, { useState, useEffect, useRef } from 'react';


const TextSelectionPopup = ({ onAskAI, onTranslate }) => {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 0) {
        setSelectedText(text);

        // Get the position of the selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position the popup above the selected text
        setPosition({
          top: rect.top + window.scrollY - 50,
          left: rect.left + window.scrollX + rect.width / 2,
        });

        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsVisible(false);
      }
    };

    // Listen for text selection
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAskAI = () => {
    if (onAskAI) {
      onAskAI(selectedText);
    }
    setIsVisible(false);
    // Clear selection
    window.getSelection().removeAllRanges();
  };

  const handleTranslate = () => {
    if (onTranslate) {
      onTranslate(selectedText);
    }
    setIsVisible(false);
    // Clear selection
    window.getSelection().removeAllRanges();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      className={isVisible ? 'text-selection-popup text-selection-popup--visible' : 'text-selection-popup'}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button className="text-selection-ask-ai-button" onClick={handleAskAI} title="Ask AI to explain this text">
        <span className="text-selection-button-icon">🤖</span>
        <span>Ask AI</span>
      </button>
      <button className="text-selection-translate-button" onClick={handleTranslate} title="Translate this text into Urdu">
        <span className="text-selection-button-icon">🌐</span>
        <span>Translate to Urdu</span>
      </button>
    </div>
  );
};

export default TextSelectionPopup;
