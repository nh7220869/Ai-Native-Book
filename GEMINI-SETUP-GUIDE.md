# Complete Gemini Translation Setup Guide

## Overview

This guide explains the complete setup for integrating Google Gemini API with your Docusaurus application using a secure backend approach.

## Why We Need a Backend

### The Problem

Docusaurus is a static site generator, and calling the Gemini API directly from React components fails due to:

1. **CORS (Cross-Origin Resource Sharing)**: Google's Gemini API blocks direct browser requests from your domain for security
2. **Exposed API Keys**: Any API key in frontend code is visible in:
   - Browser DevTools Network tab
   - Page source code
   - JavaScript bundles
3. **No Runtime Environment Variables**: `process.env` is resolved at build time, not runtime. Even if you use environment variables, they get bundled into your static files.

### The Solution

A Node.js + Express backend server that:
- Stores API keys securely server-side
- Acts as a proxy between frontend and Gemini API
- Handles CORS properly
- Provides comprehensive error logging

## Architecture

```
[Docusaurus Frontend] → [Node.js Backend] → [Google Gemini API]
     (Port 3000)            (Port 5001)
```

## Setup Instructions

### 1. Get a Valid Gemini API Key

**IMPORTANT:** The API key currently in your `.env` file is invalid/revoked.

Follow these steps to get a new one:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. **Important:** Select "Create API key in new project" or use an existing project
5. Copy the API key (format: `AIza...`)
6. Enable the Generative Language API for your project if prompted

### 2. Update Backend Environment Variables

Edit `gemini-backend/.env`:

```env
# Replace with your NEW valid API key
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Install Backend Dependencies

```bash
cd gemini-backend
npm install
```

### 4. Start the Backend Server

```bash
cd gemini-backend
npm start
```

You should see:
```
==================================================
🚀 Gemini Backend Server Started
==================================================
📡 Server running on: http://localhost:5001
🏥 Health check: http://localhost:5001/health
🔧 Translation endpoint: POST http://localhost:5001/api/gemini/translate
🔑 Gemini API Key: ✅ Configured
==================================================
```

### 5. Test the Backend (Optional)

```bash
cd gemini-backend
node test-api.js
```

This will test:
- Health check endpoint
- Translation endpoint with sample data
- Error handling

### 6. Start Your Docusaurus App

In a new terminal:

```bash
npm start
```

Your Docusaurus app will run on http://localhost:3000

### 7. Use the Translation Feature

1. Click the "Translate" button in your navbar
2. Select a target language
3. Choose translation mode (chapter/section/full book)
4. Click "Translate"

The frontend will call your backend at `http://localhost:5001/api/gemini/translate`, which securely forwards the request to Gemini.

## How It Works

### Frontend (GeminiTranslator.jsx)

```javascript
// Makes a secure request to YOUR backend (not directly to Gemini)
const response = await fetch('http://localhost:5001/api/gemini/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello World',
    targetLanguage: 'Spanish'
  })
});
```

### Backend (gemini-backend/index.js)

```javascript
// Receives request from frontend
app.post('/api/gemini/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  // Calls Gemini API with YOUR secret key (server-side only)
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const geminiResponse = await axios.post(geminiUrl, requestBody);

  // Returns translation to frontend
  res.json({ success: true, translatedText: ... });
});
```

## Troubleshooting

### Error: "API Key not found. Please pass a valid API key"

**Solution:**
1. Your API key is invalid, expired, or not enabled
2. Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Update `gemini-backend/.env` with the new key
4. Restart the backend server

### Error: "Cannot connect to backend"

**Solution:**
1. Make sure backend server is running on port 5001
2. Check for port conflicts: `netstat -ano | findstr :5001`
3. Verify the backend URL in `Translation/GeminiTranslator.jsx` is `http://localhost:5001`

### Error: "CORS policy error"

**Solution:**
- The backend already has CORS enabled via `app.use(cors())`
- If you still see CORS errors, verify you're calling `localhost:5001`, not the Gemini API directly

### Translations showing "[Translation Error: ...]"

**Solution:**
1. Open browser DevTools Console (F12)
2. Look for error messages starting with "❌"
3. Check backend terminal for detailed error logs
4. Common causes:
   - Invalid API key
   - Backend not running
   - Network connectivity issues

## Production Deployment

### Backend Deployment

For production, deploy your backend to:
- **Vercel**: Requires serverless function conversion
- **Railway**: Easy deployment with environment variables
- **Heroku**: Traditional hosting
- **AWS/GCP**: Full control

**Important changes for production:**

1. Update CORS to allow only your domain:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

2. Use environment variables (not .env file)

3. Update frontend URL:
```javascript
const BACKEND_URL = 'https://your-backend-domain.com';
```

### Frontend Deployment

Deploy Docusaurus normally:
```bash
npm run build
```

The built static site can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting

## API Reference

### POST /api/gemini/translate

**Request:**
```json
{
  "text": "Hello World",
  "targetLanguage": "Spanish"
}
```

**Response (Success):**
```json
{
  "success": true,
  "translatedText": "Hola Mundo",
  "originalLength": 11,
  "translatedLength": 10,
  "targetLanguage": "Spanish"
}
```

**Response (Error):**
```json
{
  "error": "Gemini API error",
  "details": "API Key not found. Please pass a valid API key.",
  "statusCode": 400
}
```

### GET /health

**Response:**
```json
{
  "status": "ok",
  "message": "Gemini backend is running",
  "timestamp": "2025-12-10T06:29:25.790Z"
}
```

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Never expose API keys in frontend code**
3. **Use HTTPS in production**
4. **Implement rate limiting** - Consider adding to backend
5. **Add authentication** - For production use
6. **Monitor API usage** - Check Google Cloud Console

## Cost Considerations

- Gemini API has a free tier with generous limits
- Monitor usage at [Google AI Studio](https://makersuite.google.com/)
- Consider implementing caching (already done in frontend)
- Add request limits per user/session in production

## File Structure

```
Hacathon-nativ-book/
├── gemini-backend/              # Backend server
│   ├── index.js                 # Express server with Gemini integration
│   ├── package.json             # Dependencies
│   ├── .env                     # API key (SECRET - not committed)
│   ├── .gitignore              # Protects .env
│   ├── test-api.js             # Testing utility
│   └── README.md               # Backend docs
├── Translation/                 # Frontend translation component
│   ├── GeminiTranslator.jsx    # Main component (calls backend)
│   └── index.js                # Export
└── GEMINI-SETUP-GUIDE.md       # This file
```

## Next Steps

1. Get a valid Gemini API key
2. Update `gemini-backend/.env`
3. Restart backend server
4. Test translation feature
5. Deploy to production (optional)

## Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check backend terminal for server errors
3. Verify API key is valid at [Google AI Studio](https://makersuite.google.com/)
4. Test with `node test-api.js` in the backend directory

---

**Remember:** The backend approach is the ONLY secure way to use API keys with static sites like Docusaurus!
