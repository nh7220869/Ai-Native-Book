# 🚀 Backend Deploy Karo, Frontend Locally Chalao

## Step 1: Backend Deploy Karo (Vercel par)

### A. Vercel Account Banao
1. https://vercel.com par jao
2. GitHub se login karo

### B. Backend Deploy Karo

#### Using Vercel Dashboard (Easiest):

1. https://vercel.com/new par jao
2. "Add New Project" click karo
3. Apni Git repository import karo
4. **⚠️ ZAROORI**: **Root Directory** mein `central-backend` likho
5. **Framework Preset**: Other select karo
6. **Build Command**: Khali chhod do
7. **Install Command**: `npm install`
8. "Deploy" button click karo
9. Wait karo... deployment complete hone tak

#### Using Terminal (Alternative):

```bash
# Backend folder mein jao
cd central-backend

# Vercel CLI install karo (agar pehle se nahi hai)
npm install -g vercel

# Login karo
vercel login

# Deploy karo
vercel --prod
```

### C. Environment Variables Set Karo

Deployment ke baad:

1. Vercel Dashboard → Apna Project → **Settings** → **Environment Variables**
2. Yeh sab add karo:

```
NODE_ENV=production
BETTER_AUTH_SECRET=a3f8c9d2e1b4a7c6f5d8e2b1a4c7f6d9e3b2a5c8f7d1e4b3a6c9f2d5e8b1a4c7
BETTER_AUTH_URL=https://YOUR-BACKEND-URL.vercel.app
DATABASE_URL=postgresql://neondb_owner:npg_iKdfhC9Iz5uN@ep-shiny-bar-adtgsazt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
QDRANT_URL=https://9fa006fd-c8ea-4b97-bdbf-e1679c7a7db1.europe-west3-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.qP5-vZs2UE7lQG_f_hQK1HZvy9Gva_LVGo-UkmX5i1I
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_CHAT_MODEL=google/gemini-2.0-flash-exp:free
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
```

3. **⚠️ IMPORTANT**: `BETTER_AUTH_URL` mein apna actual Vercel URL dalo!

### D. Backend Test Karo

Deployment complete hone ke baad, aapko ek URL milega:
```
https://your-backend-name.vercel.app
```

Terminal mein test karo:

```bash
# Health check
curl https://your-backend-name.vercel.app/health

# Auth health check
curl https://your-backend-name.vercel.app/api/auth/auth-health
```

Agar JSON response aaya, toh backend successfully deploy ho gaya! ✅

---

## Step 2: Backend URL Ko Frontend Mein Set Karo

### A. Backend URL Copy Karo
Deployment complete hone ke baad, Vercel tumhe ek URL dega:
```
https://central-backend-xyz123.vercel.app
```
**Yeh hi tumhara production server URL hai!** ✅

### B. `.env.local` File Banao

Project **root folder** mein (not central-backend):

**Windows:**
```bash
cd ..
echo API_BASE_URL=https://central-backend-xyz123.vercel.app > .env.local
```

**Ya Manually:**
1. Root folder mein `.env.local` naam ki file banao
2. Isme yeh likho:
```bash
API_BASE_URL=https://central-backend-xyz123.vercel.app
```
(Apna actual Vercel URL use karo)

### C. Frontend Test Karo (Optional - Local Testing)

```bash
# Root folder mein
npm install
npm start
```

Browser mein `http://localhost:3000` kholo - **frontend locally chalega** but **backend Vercel par hai** ✅

### D. Important Points:

- ✅ **Sab APIs Vercel URL se chalti hain**: `/health`, `/chat`, `/api/auth/*` etc.
- ✅ **localhost:3000** sirf frontend testing ke liye hai (temporary)
- ✅ **Production mein frontend bhi deploy karoge** toh dono same domain par honge

---

## 🎯 Complete Flow

```
┌─────────────────────────────────────────────────┐
│  Frontend (localhost:3000 - temporary testing)  │
│  .env.local mein:                               │
│  API_BASE_URL=https://backend-xyz.vercel.app    │
└────────────┬────────────────────────────────────┘
             │
             │ Sab API calls is URL par jaati hain ↓
             │
             ▼
┌─────────────────────────────────────────────────┐
│  Backend (Vercel Production Server) ✅          │
│  https://backend-xyz.vercel.app                 │
│                                                 │
│  Available Endpoints:                           │
│  - /health                                      │
│  - /api/auth/*                                  │
│  - /chat                                        │
│  - /api/translate                               │
│  - /api/personalize                             │
└────────────┬────────────────────────────────────┘
             │
             ├─► PostgreSQL (Neon Database)
             ├─► Qdrant (Vector Database)
             └─► OpenRouter (AI API)
```

**Key Point**: Backend ka Vercel URL hi tumhara complete server hai. Sab kuch wahi se run hota hai! 🎯

---

## 📝 Quick Commands

### Backend Deploy Karo:
```bash
cd central-backend
vercel --prod
```

### Frontend Locally Start Karo:
```bash
npm start
```

### Backend Logs Dekho:
```bash
cd central-backend
vercel logs
```

### Frontend ke liye Backend URL Change Karo:
Edit `.env.local` file:
```bash
API_BASE_URL=https://new-backend-url.vercel.app
```

---

## ✅ Checklist

Backend Deployment:
- [ ] Vercel par account banaya
- [ ] Backend deploy kiya with `central-backend` as root directory
- [ ] Environment variables set kiye
- [ ] `BETTER_AUTH_URL` mein actual Vercel URL dala
- [ ] Health endpoint test kiya
- [ ] Backend URL copy kiya

Frontend Setup:
- [ ] `.env.local` file banai
- [ ] Backend URL `.env.local` mein dala
- [ ] `npm install` run kiya
- [ ] `npm start` se frontend chala liya
- [ ] Browser mein `localhost:3000` par dekha

---

## 🐛 Problems Ho To

### "Not Found" aa raha hai
- Vercel mein Root Directory `central-backend` hai ya nahi check karo
- Environment variables sahi set hain ya nahi verify karo

### Frontend backend se connect nahi ho raha
- `.env.local` mein sahi URL hai ya nahi check karo
- Backend URL https:// se start ho raha hai ya nahi dekho
- Frontend restart karo: Stop karo (Ctrl+C) aur phir se `npm start` karo

### CORS error aa raha hai
- `central-backend/src/config/index.js` mein `allowedOrigins` check karo
- `http://localhost:3000` add hai ya nahi dekho

---

## 📞 Need Help?

- Detailed backend guide: `central-backend/BACKEND-DEPLOYMENT.md`
- Full stack deployment: `VERCEL-DEPLOYMENT-GUIDE.md`
- Vercel docs: https://vercel.com/docs
