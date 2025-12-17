# 🚀 Quick Start Guide

## Single Command Setup

### 1. Start Backend (Terminal 1)
```bash
cd central-backend
npm start
```
✅ Server runs on **http://localhost:3001** ← UPDATED PORT!

### 2. Start Frontend (Terminal 2)
```bash
npm start
```
✅ Frontend runs on **http://localhost:3000**

---

## One-Time Setup (If RAG Chat Not Working)

### Populate Vector Database
```bash
cd old-backends-backup/chatbot-backend
python ingest.py
```
⏳ Wait 2-5 minutes for completion

---

## Test Everything

### Open Browser
```
http://localhost:3000
```

### Test Features:
1. ✅ **Sign Up** - Create an account
2. ✅ **Chatbot** - Ask "What is physical AI?"
3. ✅ **Translation** - Select text → "Translate to Urdu"
4. ✅ **Personalization** - Click "Personalize Content"

---

## All API Endpoints (Port 3001) ← UPDATED!

### Authentication
```
POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
POST /api/auth/sign-out
GET  /api/auth/session
```

### Translation
```
POST /api/gemini/translate
POST /api/translate
```

### Personalization
```
POST /api/personalize
```

### Chat (RAG)
```
POST /chat
```

### Health Check
```
GET /health
```

---

## Environment Variables

All configured in `.env`:
- ✅ Central backend: **http://localhost:3001** ← UPDATED PORT!
- ✅ PostgreSQL (Neon)
- ✅ Qdrant (Cloud)
- ⚠️ **OpenRouter API** ← NEEDS NEW API KEY!
- ✅ Better Auth

---

## Troubleshooting

**Backend won't start?**
```bash
cd central-backend && npm install && npm start
```

**Chatbot not responding?**
```bash
cd old-backends-backup/chatbot-backend && python ingest.py
```

**Port 3001 in use?**
```bash
# Windows: netstat -ano | findstr :3001
# Linux/Mac: lsof -i :3001
```

**OpenRouter API not working?**
- Get new API key from https://openrouter.ai/
- Update `OPENROUTER_API_KEY` in `.env`
- Restart backend server

---

## Project Structure

```
Your Project/
├── central-backend/          ← Single unified backend (Port 3001) ← UPDATED!
├── src/                      ← Frontend (Port 3000)
├── docs/                     ← Book content
└── .env                      ← All configuration (UPDATE OpenRouter key!)
```

---

## Success ✅

Your project now runs with:
- **1 Backend Server** (central-backend on port 3001) ← UPDATED!
- **✅ All APIs working and consolidated**
- **✅ Database error handling added**
- **Clean architecture**
- **Modern UI** (#071952, #EBF4F6 colors)
- **Smooth animations**

⚠️ **Next Step:** Update OpenRouter API key in `.env` to enable AI features!

**Ready to build!** 🎉
