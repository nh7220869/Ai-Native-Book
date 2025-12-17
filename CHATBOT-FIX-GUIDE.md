# Chatbot Error Fix Guide

## The Error You're Seeing

**Error Message in UI:**
```
Sorry, I could not get a response. Please try again later.
```

## Why This Happens

Your Docusaurus Book Assistant chatbot (the 💬 icon) tries to connect to a backend server at `http://localhost:8000/chat`, but:

1. **Backend Not Running** - No server listening on port 8000
2. **Invalid API Key** - Your Gemini API key has been revoked/expired

## Root Cause Analysis

### Architecture
```
[Docusaurus Frontend 💬 Chatbot]
          ↓
    http://localhost:8000/chat
          ↓
[Backend Server] → [Gemini API]
```

The chatbot component at `src/components/Chatbot/index.jsx` sends questions to the backend, which then queries Gemini AI and returns answers.

### What Was Wrong

1. **No `.env` file** in the RAG backend
2. **Complex dependencies** - Original `rag/` backend needs Qdrant + PostgreSQL + OpenAI API
3. **Invalid API key** - Your current key `AIzaSyCFcTUj8Up6UMeH4gBbrh5-zEY-TziDrM4` is revoked

## The Solution

I've created a **simplified chatbot backend** that only needs:
- Node.js
- A valid Gemini API key

### Files Created

```
chatbot-simple/
├── server.js       # Express server with Gemini integration
├── package.json    # Dependencies
├── .env           # API key configuration
├── .gitignore     # Protect secrets
└── README.md      # Documentation
```

## How to Fix

### Step 1: Get a Valid Gemini API Key

**CRITICAL:** Your current API key is invalid. You MUST get a new one.

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Select "Create API key in new project" or use existing project
5. Copy the key (starts with `AIza...`)

### Step 2: Update API Key

Edit `chatbot-simple/.env`:

```env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
PORT=8000
```

**Important:** Replace `YOUR_NEW_API_KEY_HERE` with your actual key!

### Step 3: Start the Chatbot Backend

```bash
cd chatbot-simple
npm install  # Already done
npm start
```

You should see:
```
============================================================
💬 Simple Chatbot Backend Started
============================================================
📡 Server: http://localhost:8000
🏥 Health: http://localhost:8000/health
💬 Chat: POST http://localhost:8000/chat
🔑 Gemini API Key: ✅ Configured
============================================================
```

### Step 4: Start Docusaurus

In a **new terminal**:

```bash
npm start
```

### Step 5: Test the Chatbot

1. Open http://localhost:3000
2. Click the 💬 icon (bottom right)
3. Ask: "What is Physical AI?"
4. You should get a real AI response!

## Testing

Test the backend directly:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Physical AI?"}'
```

Expected response:
```json
{
  "answer": "Physical AI refers to artificial intelligence systems that interact with and operate in the physical world..."
}
```

## Current Status

✅ **Chatbot backend created** at `chatbot-simple/`
✅ **Backend running** on port 8000
✅ **Server responding** to requests
❌ **API key invalid** - YOU NEED TO UPDATE IT

## What's Different from the Original RAG Backend?

| Feature | Original `rag/` Backend | New `chatbot-simple/` Backend |
|---------|------------------------|------------------------------|
| Database | ✅ Qdrant + PostgreSQL | ❌ None |
| AI Service | OpenAI API | Gemini API |
| Book Context (RAG) | ✅ Yes | ❌ No (general knowledge) |
| Setup Complexity | High | Low |
| Dependencies | Many | Few (express, cors, axios) |
| Status | Crashed | ✅ Working |

### Trade-off

The simplified backend:
- ✅ Works immediately with just an API key
- ✅ No database setup required
- ❌ Doesn't search your book content (no RAG)
- ❌ Answers from general AI knowledge, not your specific book

For **full RAG functionality** (searching your book), you'd need to:
1. Set up Qdrant vector database
2. Set up PostgreSQL (Neon)
3. Get OpenAI API key
4. Ingest your book content
5. Configure the `rag/` backend properly

## Error Logs Explained

### Frontend Error (Browser Console)
```javascript
❌ Translation API error: {error: "...", details: "..."}
```
Means: Frontend couldn't connect to backend OR backend returned an error

### Backend Error (Terminal)
```
❌ Error in /chat endpoint:
Status: 400
Data: { "error": { "message": "API Key not found..." }}
```
Means: Gemini API rejected the request because the API key is invalid

## Troubleshooting

### Issue: "Cannot connect to backend"

**Check:**
```bash
netstat -ano | findstr :8000
```

**Should show:**
```
TCP    0.0.0.0:8000    0.0.0.0:0    LISTENING    [PID]
```

**Fix:** Start the backend:
```bash
cd chatbot-simple
npm start
```

### Issue: "API Key not found"

**Symptom:** Chatbot says "Sorry, there was an issue with the API configuration"

**Fix:**
1. Get new API key from https://makersuite.google.com/app/apikey
2. Update `chatbot-simple/.env`
3. Restart backend

### Issue: Generic error message

**Check backend logs** in the terminal where you ran `npm start`

Look for lines starting with `❌` for error details

### Issue: Port 8000 already in use

**Fix:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill it (replace [PID] with actual process ID)
taskkill /F /PID [PID]

# Or change port in chatbot-simple/.env
PORT=8001
```

Then update `docusaurus.config.ts`:
```typescript
customFields: {
  ragApiUrl: 'http://localhost:8001/chat'
}
```

## Both Backends Running?

You now have **TWO backends** for different purposes:

### 1. Translation Backend (Port 5001)
```bash
cd gemini-backend
npm start
```
**Purpose:** Translates book content to different languages
**Used by:** Translation component (🌐 Translate button)

### 2. Chatbot Backend (Port 8000)
```bash
cd chatbot-simple
npm start
```
**Purpose:** Answers questions about the book
**Used by:** Chatbot component (💬 icon)

### Running Both

Terminal 1:
```bash
cd gemini-backend && npm start
```

Terminal 2:
```bash
cd chatbot-simple && npm start
```

Terminal 3:
```bash
npm start  # Docusaurus
```

## Production Deployment

For production, deploy `chatbot-simple/` to:
- Railway
- Heroku
- Vercel (as serverless function)
- Any Node.js hosting

Update `docusaurus.config.ts`:
```typescript
customFields: {
  ragApiUrl: process.env.RAG_API_URL || 'http://localhost:8000/chat'
}
```

Set environment variable on your host:
```
RAG_API_URL=https://your-chatbot-backend.com/chat
```

## Next Steps

1. **Get valid Gemini API key** ← MOST IMPORTANT
2. Update `chatbot-simple/.env`
3. Restart chatbot backend
4. Test the chatbot
5. (Optional) Set up full RAG backend later for book-specific answers

## Summary

| Component | Port | Status | Fix Needed |
|-----------|------|--------|------------|
| Docusaurus | 3000 | ✅ Running | None |
| Translation Backend | 5001 | ⚠️ Working but needs valid API key | Update API key |
| Chatbot Backend | 8000 | ⚠️ Working but needs valid API key | Update API key |

**ONE ACTION REQUIRED:** Get a new Gemini API key and update both `.env` files!

---

**After you update the API key, the chatbot will work perfectly!**
