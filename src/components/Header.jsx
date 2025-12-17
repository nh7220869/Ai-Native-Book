import React from 'react';

const Header = () => {
  return (
    <header className="elegant-header">
      {/* Logo Section */}
      <div className="logo-section">
        <a href="/" className="logo">🤖 Hackathon Native Book</a>
      </div>

      {/* Navigation & Translation Button */}
      <div className="nav-section">
        <nav className="nav-links">
          <a href="/docs" className="nav-link">📚 Docs</a>
          <a href="/tutorials" className="nav-link">🎓 Tutorials</a>
          <a href="/examples" className="nav-link">💡 Examples</a>
        </nav>
        
        {/* Translation Button */}
        <button className="header-button">
          🌐 Translate
        </button>
      </div>
    </header>
  );
};

export default Header;