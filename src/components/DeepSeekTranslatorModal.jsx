import React, { useState, useCallback } from 'react';

const DeepSeekTranslatorModal = ({ onClose }) => {
  const [text, setText] = useState(`# Hackathon Native Book – Physical AI & Humanoid Robotics

A Comprehensive Guide to Building Intelligent Robots

Start Reading 🌬

This textbook explores Physical AI & Humanoid Robotics, from foundational concepts to advanced topics like ROS 2, Isaac Sim, and LLMs.`);
  
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Urdu');
  const [apiStatus, setApiStatus] = useState('Not tested');
  
  // ✅ YOUR DEEPSEEK API KEY
  const DEEPSEEK_API_KEY = 'sk-81a2d9d947204af399b06a78b9694cd7'; // This key should ideally be loaded from an environment variable or secure config

  const languages = [
    { name: 'Urdu', emoji: '🇵🇰', prompt: 'Translate to Urdu (اردو). Keep markdown formatting.' },
    { name: 'Hindi', emoji: '🇮🇳', prompt: 'Translate to Hindi (हिन्दी). Keep markdown formatting.' },
    { name: 'Arabic', emoji: '🇸🇦', prompt: 'Translate to Arabic (العربية). Keep markdown formatting.' },
    { name: 'Spanish', emoji: '🇪🇸', prompt: 'Translate to Spanish (Español). Keep markdown formatting.' },
    { name: 'French', emoji: '🇫🇷', prompt: 'Translate to French (Français). Keep markdown formatting.' },
    { name: 'German', emoji: '🇩🇪', prompt: 'Translate to German (Deutsch). Keep markdown formatting.' },
  ];

  // ✅ TEST YOUR API KEY
  const testYourDeepSeekAPI = async () => {
    console.log('🔍 Testing YOUR DeepSeek API Key...');
    setApiStatus('Testing...');
    
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Translate "Hello, this is a test" to Urdu'
            }
          ],
          temperature: 0.7,
          max_tokens: 50
        })
      });
      
      const data = await response.json();
      console.log('✅ YOUR API Response:', data);
      
      if (data.choices?.[0]?.message?.content) {
        const translation = data.choices[0].message.content;
        setApiStatus('✅ Working');
        alert(`✅ YOUR DEEPSEEK API IS WORKING!\n\nTranslation: ${translation}`);
        return true;
      } else if (data.error) {
        setApiStatus('❌ Failed');
        alert(`❌ API Error: ${data.error.message}\n\nCheck your API key at: https://platform.deepseek.com/api_keys`);
        return false;
      } else {
        setApiStatus('❌ No response');
        alert('❌ No response from API');
        return false;
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      setApiStatus('❌ Network error');
      alert(`❌ Network Error: ${error.message}\n\nCheck CORS or internet connection.`);
      return false;
    }
  };

  const translateText = useCallback(async () => {
    if (!text.trim()) {
      alert('Please enter text to translate');
      return;
    }

    setLoading(true);
    setTranslated('Translating...');

    try {
      const selectedLang = languages.find(lang => lang.name === language);
      
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `${selectedLang.prompt}. Preserve # headings, **bold**, emojis. Return only translation.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      console.log('Translation Result:', data);
      
      if (data.choices?.[0]?.message?.content) {
        setTranslated(data.choices[0].message.content);
        setApiStatus('✅ Last successful');
      } else if (data.error) {
        setTranslated(`❌ API Error: ${data.error.message}`);
        setApiStatus('❌ Error');
      } else {
        setTranslated('❌ No translation received');
        setApiStatus('❌ No response');
      }
    } catch (error) {
      console.error('Translation Error:', error);
      setTranslated(`❌ Network Error: ${error.message}`);
      setApiStatus('❌ Network error');
    } finally {
      setLoading(false);
    }
  }, [text, language, languages, DEEPSEEK_API_KEY]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translated)
      .then(() => alert('✅ Translation copied!'))
      .catch(err => alert('❌ Copy failed: ' + err));
  };

  // Format for better display
  const formatText = (text) => {
    return text
      .replace(/\n/g, '\n')
      .replace(/\"/g, '"');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '10px',
        minWidth: '500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          &times;
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #10a37f',
          paddingBottom: '15px'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#10a37f', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🤖</span>
              <span>DeepSeek Translator</span>
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              Your API Key: sk-81a2d9d947204af399b06a78b9694cd7
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={testYourDeepSeekAPI}
              style={{
                padding: '8px 15px',
                background: '#10a37f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}
            >
              Test Your API
            </button>
            <div style={{ fontSize: '12px', color: apiStatus.includes('✅') ? '#10a37f' : apiStatus.includes('❌') ? '#ff4444' : '#666' }}>
              Status: {apiStatus}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Select Language:
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            {languages.map(lang => (
              <button
                key={lang.name}
                onClick={() => setLanguage(lang.name)}
                style={{
                  padding: '10px',
                  border: language === lang.name ? '2px solid #10a37f' : '1px solid #ddd',
                  background: language === lang.name ? '#e8f5f1' : 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '18px' }}>{lang.emoji}</div>
                <div>{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              English Text:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="6"
              placeholder="Type English text here..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '10px' 
            }}>
              <label style={{ fontWeight: 'bold', color: '#333' }}>
                {language} Translation:
              </label>
              {translated && !translated.startsWith('❌') && (
                <button 
                  onClick={copyToClipboard}
                  style={{
                    padding: '5px 10px',
                    background: '#10a37f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  📋 Copy
                </button>
              )}
            </div>
            <div style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#f8f9fa',
              minHeight: '150px',
              fontSize: '14px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              lineHeight: '1.5'
            }}>
              {formatText(translated) || 'Translation will appear here...'}
            </div>
          </div>
        </div>

        <button
          onClick={translateText}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#888' : '#10a37f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? '🔄 Translating...' : '🚀 Translate Now'}
        </button>

        <div style={{
          padding: '15px',
          background: '#f0f9f6',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#0d8c6d',
          border: '1px solid #b8e6d0'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔑</span>
            <span>Your DeepSeek API Information</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px',
            marginBottom: '10px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666' }}>API Key</div>
              <div style={{ 
                fontSize: '11px', 
                fontFamily: 'monospace',
                background: 'white',
                padding: '5px',
                borderRadius: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                sk-81a2d9d947204af399b06a78b9694cd7
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666' }}>Status</div>
              <div style={{ 
                color: apiStatus.includes('✅') ? '#10a37f' : apiStatus.includes('❌') ? '#ff4444' : '#666',
                fontWeight: '500'
              }}>
                {apiStatus}
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '10px', 
            paddingTop: '10px', 
            borderTop: '1px solid #b8e6d0',
            fontSize: '12px'
          }}>
            <a 
              href="https://platform.deepseek.com/api_keys" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#10a37f', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ↗ Manage your API key
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSeekTranslatorModal;
