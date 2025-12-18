# 🚀 Simple Deployment - Backend Only

## Samajh Lo (Understand This):

1. **Backend deploy hoga Vercel par** → URL milega (e.g., `https://backend-xyz.vercel.app`)
2. **Yeh URL hi tumhara server hai** → Sab APIs isi URL se chalegi
3. **Frontend ki .env.local mein yeh URL daloge** → Frontend ise use karega
4. **Frontend locally test kar sakte ho** → But backend Vercel par hi hai

---

## 3 Simple Steps:

### Step 1: Backend Deploy Karo

```bash
cd central-backend
vercel --prod
```

**Output:**
```
✅ Production: https://central-backend-xyz123.vercel.app
```

### Step 2: Environment Variables Set Karo

Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
BETTER_AUTH_SECRET=a3f8c9d2e1b4a7c6f5d8e2b1a4c7f6d9e3b2a5c8f7d1e4b3a6c9f2d5e8b1a4c7
BETTER_AUTH_URL=https://central-backend-xyz123.vercel.app
DATABASE_URL=postgresql://neondb_owner:npg_iKdfhC9Iz5uN@ep-shiny-bar-adtgsazt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
QDRANT_URL=https://9fa006fd-c8ea-4b97-bdbf-e1679c7a7db1.europe-west3-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.qP5-vZs2UE7lQG_f_hQK1HZvy9Gva_LVGo-UkmX5i1I
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_CHAT_MODEL=google/gemini-2.0-flash-exp:free
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
```

### Step 3: Frontend Mein URL Set Karo

Root folder mein `.env.local` file banao:

```bash
API_BASE_URL=https://central-backend-xyz123.vercel.app
```

**Done!** ✅

---

## Test Karo:

### Backend Test:
```bash
curl https://central-backend-xyz123.vercel.app/health
```

### Frontend Test (Optional):
```bash
npm start
# localhost:3000 par kholo browser mein
```

---

## URLs:

| What | Where | URL |
|------|-------|-----|
| Backend Server | Vercel | `https://backend-xyz.vercel.app` |
| Health Check | Vercel | `https://backend-xyz.vercel.app/health` |
| Auth API | Vercel | `https://backend-xyz.vercel.app/api/auth/*` |
| Chat API | Vercel | `https://backend-xyz.vercel.app/chat` |
| Frontend (testing) | Local | `http://localhost:3000` |

---

## Important:

- ✅ **Backend Vercel par hai** = Production server
- ✅ **Sab APIs Vercel URL se** = `/health`, `/chat`, etc.
- ✅ **Frontend locally** = Sirf testing ke liye
- ✅ **Frontend bhi deploy karoge** = Same domain par hoga

---

## Agar Problem Ho:

### "Not Found" aa raha hai:
```bash
# Vercel mein Root Directory check karo
# Should be: central-backend
```

### Environment variables missing:
```bash
# Vercel dashboard mein verify karo
# Sab 10 variables set hone chahiye
```

### Frontend backend se connect nahi ho raha:
```bash
# .env.local mein URL check karo
# https:// se start hona chahiye
```

---

## Summary:

```
Backend Deploy → Vercel URL mila → Frontend mein dala → Done ✅
```

That's it! Backend production par hai, frontend local testing ke liye! 🎉
