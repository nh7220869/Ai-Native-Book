# 🚀 Backend Deployment Guide - FINAL SOLUTION

## 🔴 THE PROBLEM (Why localhost doesn't work)

```
❌ CURRENT SETUP (BROKEN):
Frontend (Vercel) → Backend (localhost:3001 on YOUR computer)
                    ↑
                    This is IMPOSSIBLE from internet!
```

**Why it fails:**
- `localhost` = your local computer
- Vercel's servers CANNOT access your local machine
- That's why you get CORS errors in production

---

## ✅ THE SOLUTION: Deploy Backend to Vercel

You need TWO separate Vercel projects:
1. **Frontend Project**: Docusaurus site at `https://humanoid-robotics-guidemain.vercel.app/`
2. **Backend Project**: Express API (NEW - needs to be deployed)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Deploy Backend to Vercel

**1.1 Create a New Vercel Project for Backend**

```bash
# Navigate to backend folder
cd central-backend

# Initialize git if not already done (from project root)
cd ..
git add central-backend/vercel.json
git commit -m "Add Vercel config for backend deployment"
git push origin main
```

**1.2 Deploy Backend on Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **IMPORTANT:** Set the **Root Directory** to `central-backend`
5. Click **Deploy**

**1.3 Set Backend Environment Variables**

In your NEW backend Vercel project, go to **Settings** → **Environment Variables** and add:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_iKdfhC9Iz5uN@ep-shiny-bar-adtgsazt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=a3f8c9d2e1b4a7c6f5d8e2b1a4c7f6d9e3b2a5c8f7d1e4b3a6c9f2d5e8b1a4c7
BETTER_AUTH_URL=https://your-backend.vercel.app

# Qdrant Vector Database
QDRANT_URL=https://9fa006fd-c8ea-4b97-bdbf-e1679c7a7db1.europe-west3-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.qP5-vZs2UE7lQG_f_hQK1HZvy9Gva_LVGo-UkmX5i1I

# OpenRouter API
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_CHAT_MODEL=google/gemini-2.0-flash-exp:free
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small

# CORS - Add your frontend URL
CORS_ALLOWED_ORIGINS=https://humanoid-robotics-guidemain.vercel.app,http://localhost:3000

# Port (Vercel uses PORT environment variable)
CENTRAL_BACKEND_PORT=3001
NODE_ENV=production
```

**1.4 Get Your Backend URL**

After deployment completes, you'll get a URL like:
```
https://your-backend-name.vercel.app
```

**Copy this URL - you'll need it for the frontend!**

---

### STEP 2: Update Frontend Configuration

**2.1 Update Frontend Environment Variables**

Go to your **FRONTEND** Vercel project → **Settings** → **Environment Variables**:

```env
API_BASE_URL=https://your-backend-name.vercel.app
```

**2.2 Update Local .env File**

In your project root `.env` file:

```env
# For Local Development:
# API_BASE_URL=http://localhost:3001

# For Production (UPDATE THIS with your backend URL):
API_BASE_URL=https://your-backend-name.vercel.app
```

**2.3 Redeploy Frontend**

```bash
git add .
git commit -m "Update API URL to use deployed backend"
git push origin main
```

Vercel will automatically redeploy your frontend.

---

### STEP 3: Update Backend CORS Configuration

**IMPORTANT:** Your backend needs to allow requests from your frontend domain.

Your `central-backend/src/config/index.js` already has CORS configured, but verify it includes your frontend URL:

```javascript
cors: {
  allowedOrigins: process.env.CORS_ALLOWED_ORIGINS ?
    process.env.CORS_ALLOWED_ORIGINS.split(',') : [
      'https://humanoid-robotics-guidemain.vercel.app',  // Your frontend
      'http://localhost:3000',  // Local development
    ],
}
```

**✅ This is already correct in your code!**

---

## 🧪 TESTING

After both deployments complete:

**1. Test Backend Health**

Open in browser:
```
https://your-backend-name.vercel.app/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Central Backend Server is running"
}
```

**2. Test Frontend → Backend Communication**

1. Open your frontend: `https://humanoid-robotics-guidemain.vercel.app/`
2. Open DevTools (F12) → **Network** tab
3. Try to sign in or use any feature
4. Check API calls - should go to `https://your-backend-name.vercel.app/api/...`
5. **Should return 200 OK** (not CORS error!)

---

## 🎯 FINAL ARCHITECTURE

```
✅ PRODUCTION (Both on Vercel):
Frontend: https://humanoid-robotics-guidemain.vercel.app/
          ↓ (API calls)
Backend:  https://your-backend-name.vercel.app/api/...

✅ LOCAL DEVELOPMENT:
Frontend: http://localhost:3000
          ↓ (API calls)
Backend:  http://localhost:3001/api/...
```

---

## 📝 ENVIRONMENT VARIABLES SUMMARY

### Frontend Vercel Project:
```env
API_BASE_URL=https://your-backend-name.vercel.app
```

### Backend Vercel Project:
```env
DATABASE_URL=<your-neon-db-url>
BETTER_AUTH_SECRET=<your-secret>
BETTER_AUTH_URL=https://your-backend-name.vercel.app
QDRANT_URL=<your-qdrant-url>
QDRANT_API_KEY=<your-qdrant-key>
OPENROUTER_API_KEY=<your-openrouter-key>
CORS_ALLOWED_ORIGINS=https://humanoid-robotics-guidemain.vercel.app,http://localhost:3000
NODE_ENV=production
```

---

## 🔧 LOCAL DEVELOPMENT

To develop locally:

**1. Start Backend:**
```bash
cd central-backend
npm run dev
# Runs on http://localhost:3001
```

**2. Start Frontend:**
```bash
npm start
# Runs on http://localhost:3000
```

**3. Update .env for local development:**
```env
API_BASE_URL=http://localhost:3001
```

---

## ❓ WHY THIS SOLVES THE CORS ISSUE

### The Root Causes:

1. **❌ Before:** Frontend on Vercel tried to call `localhost:3001` (your computer) → **IMPOSSIBLE**

2. **✅ After:** Frontend on Vercel calls `your-backend.vercel.app` (another Vercel server) → **WORKS!**

### CORS Works When:
- ✅ Backend is accessible from the internet
- ✅ Backend CORS config includes frontend domain
- ✅ Both use HTTPS in production
- ✅ Credentials are properly configured

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Don't use `localhost` in production** - It only works on your machine
2. **Don't hardcode URLs** - Use environment variables
3. **Don't skip environment variables on Vercel** - They won't read your `.env` file
4. **Don't forget to redeploy** after changing environment variables
5. **Don't mix HTTP and HTTPS** - Use HTTPS in production

---

## 📞 TROUBLESHOOTING

**Still getting CORS errors?**

1. Check backend deployment logs on Vercel
2. Verify CORS_ALLOWED_ORIGINS includes your frontend URL
3. Check Network tab - is it calling the right backend URL?
4. Verify both projects are deployed successfully
5. Check if environment variables are set correctly

**Backend not starting?**

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check if DATABASE_URL is correct
4. Verify Node.js version compatibility

---

## ✅ CHECKLIST

- [ ] Backend `vercel.json` created
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set on Vercel
- [ ] Backend URL copied
- [ ] Frontend environment variable `API_BASE_URL` updated on Vercel
- [ ] Frontend redeployed
- [ ] Tested `/health` endpoint
- [ ] Tested API calls from frontend
- [ ] No CORS errors in browser console
- [ ] API returns 200 OK

---

**Once you complete these steps, your CORS issue will be PERMANENTLY SOLVED!** 🎉
