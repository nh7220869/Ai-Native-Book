import React from 'react';
import Header from '../components/Header';


const HomePage = () => {
  return (
    <div>
      <Header />

      <div style={{
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1>Welcome to Physical AI Book</h1>

        <div className="homepage-card-grid">
          <div className="homepage-card">
            <h3>📖 Documentation</h3>
            <p>Complete guide to Physical AI and Robotics</p>
          </div>

          <div className="homepage-card">
            <h3>🤖 Tutorials</h3>
            <p>Step-by-step tutorials with code examples</p>
          </div>

          <div className="homepage-card">
            <h3>💡 Examples</h3>
            <p>Real-world projects and implementations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
