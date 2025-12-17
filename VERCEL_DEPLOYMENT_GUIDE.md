# Vercel Deployment Guide
**Physical AI Humanoid Robotics Book**

## 🎯 Single Environment Variable Deployment

This project has been refactored to use a **single environment variable** (`API_BASE_URL`) for all API endpoints. You only need to update one variable in Vercel to make everything work in production!

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code pushed to GitHub
3. **Backend Deployed**: Your central-backend running on a server (e.g., Railway, Render, or another Vercel project)

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend First

**Option A: Deploy to Railway**
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo (select `central-backend/` folder)
3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL URL
   - `QDRANT_URL`: Your Qdrant URL
   - `QDRANT_API_KEY`: Your Qdrant API key
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `BETTER_AUTH_SECRET`: Your auth secret
   - `CENTRAL_BACKEND_PORT`: 3000
4. Deploy and note the public URL (e.g., `https://your-backend.railway.app`)

**Option B: Deploy to Render**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo, select `central-backend/` as root
4. Add environment variables (same as above)
5. Deploy and note the public URL

### Step 2: Deploy Frontend to Vercel

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: `Docusaurus`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Add Environment Variable**

   **CRITICAL: This is the ONLY environment variable you need to add!**

   - Click "Environment Variables"
   - Add the following:

   ```
   Name:  API_BASE_URL
   Value: https://your-backend-url.railway.app
   ```

   Replace `https://your-backend-url.railway.app` with your actual backend URL from Step 1.

   ⚠️ **Important**:
   - DO NOT include a trailing slash
   - DO NOT include `/api` or any path
   - Just the base URL of your backend

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

---

## ✅ Verify Deployment

After deployment, test all features:

### 1. **Authentication**
- Click "Sign Up" button in navbar
- Modal should appear with blur backdrop
- Page scrolling should be locked
- Create an account
- Sign in
- Check if session persists

### 2. **Chatbot**
- Click chatbot icon
- Ask: "What is physical AI?"
- Should get response from RAG system

### 3. **Translation**
- Select any text on a page
- Click "Translate to Urdu"
- Translation modal should appear
- Text should be translated

### 4. **Personalization**
- Go to any chapter
- Click "Personalize Content"
- Should get personalized explanation based on your background

### 5. **Check Console**
- Open browser DevTools (F12)
- Go to Console tab
- Should see NO errors like:
  - ❌ "Failed to fetch"
  - ❌ "CORS policy"
  - ❌ "404 Not Found"

---

## 🔄 Updating API URL (Production Changes)

If you need to change your backend URL (e.g., moving to a different host):

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Edit `API_BASE_URL`
5. Change to new backend URL
6. Click "Save"
7. Go to "Deployments" tab
8. Click ⋯ on latest deployment
9. Click "Redeploy"
10. ✅ Done! All APIs will now point to the new URL

**No code changes needed!** 🎉

---

## 🌍 Environment-Specific URLs

The app automatically uses the correct URL based on environment:

| Environment | How it works |
|------------|--------------|
| **Local Development** | Uses `API_BASE_URL` from `.env` file → `http://localhost:3000` |
| **Vercel Preview** | Uses `API_BASE_URL` from Vercel env vars → your backend URL |
| **Vercel Production** | Uses `API_BASE_URL` from Vercel env vars → your backend URL |

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors

**Cause**: API_BASE_URL not set or wrong URL

**Fix**:
1. Check Vercel environment variables
2. Ensure `API_BASE_URL` is set correctly
3. Verify backend URL is accessible (visit it in browser)
4. Redeploy frontend

### Issue: CORS errors

**Cause**: Backend not configured to allow frontend origin

**Fix**:
Update `central-backend/src/config/index.js`:

```javascript
cors: {
  allowedOrigins: [
    'https://your-frontend.vercel.app', // Add your Vercel URL
    'http://localhost:3000',
  ],
}
```

Redeploy backend.

### Issue: 404 on API endpoints

**Cause**: Backend routes not initialized

**Fix**:
1. Check backend logs on Railway/Render
2. Ensure all services initialized (PostgreSQL, Qdrant)
3. Verify `initializeServices()` completed successfully

### Issue: Modal appears behind navbar

**Cause**: CSS z-index conflict

**Fix**: Already fixed! Modal has `z-index: 9999` which is higher than navbar.

### Issue: Can't scroll page with modal open

**Cause**: Body scroll lock not working

**Fix**: Already fixed! Modal component locks body scroll when open.

---

## 📦 What Files Were Changed

### Environment Configuration
- ✅ `.env` - Added `API_BASE_URL` variable
- ✅ `docusaurus.config.ts` - Exposes `apiBaseUrl` to frontend
- ✅ `src/config/api.js` - **NEW** centralized API configuration

### Frontend Components (Now use API config)
- ✅ `src/lib/auth-client.js`
- ✅ `src/components/Chatbot/index.jsx`
- ✅ `src/components/ChapterToolbar/index.jsx`
- ✅ `src/theme/Root.js`
- ✅ `src/contexts/TranslationContext.jsx`

### UI Fixes
- ✅ `src/theme/NavbarItem/CustomAuthNavbarItem.js`
  - Modal z-index: 1000 → 9999
  - Added body scroll lock
  - Improved responsive design
  - Better backdrop blur

---

## 📊 API Endpoints Reference

All these endpoints are automatically constructed from `API_BASE_URL`:

| Endpoint | Full URL |
|----------|----------|
| Sign Up | `${API_BASE_URL}/api/auth/sign-up/email` |
| Sign In | `${API_BASE_URL}/api/auth/sign-in/email` |
| Sign Out | `${API_BASE_URL}/api/auth/sign-out` |
| Get Session | `${API_BASE_URL}/api/auth/session` |
| Translate | `${API_BASE_URL}/api/gemini/translate` |
| Personalize | `${API_BASE_URL}/api/personalize` |
| RAG Chat | `${API_BASE_URL}/chat` |
| Health Check | `${API_BASE_URL}/health` |

---

## 🎨 UI Improvements Included

### Login/Signup Modal
- ✅ **Higher z-index (9999)**: Always appears on top
- ✅ **Body scroll lock**: Page doesn't scroll when modal is open
- ✅ **Blur backdrop**: Modern glassmorphism effect
- ✅ **Responsive design**: Works on mobile, tablet, desktop
- ✅ **Proper overflow handling**: Long forms scroll within modal
- ✅ **Close button** (`×`): Easy to dismiss

### Layout Fixes
- ✅ No more modal appearing behind navbar
- ✅ No more page jumping when modal opens
- ✅ Smooth animations
- ✅ Proper focus management

---

## 🔐 Security Considerations

### Environment Variables Security

**Frontend (Vercel)**
- ❌ Never put secrets in frontend env vars
- ✅ Only public URLs (like `API_BASE_URL`) are safe

**Backend (Railway/Render)**
- ✅ All secrets should be here:
  - `DATABASE_URL`
  - `QDRANT_API_KEY`
  - `OPENROUTER_API_KEY`
  - `BETTER_AUTH_SECRET`

### CORS Configuration

Ensure backend allows only your domains:

```javascript
cors: {
  allowedOrigins: [
    'https://your-production-frontend.vercel.app',
    'https://your-preview-*.vercel.app', // For preview deployments
    'http://localhost:3000', // Local development
  ],
  credentials: true,
}
```

---

## 📱 Testing Checklist

Before marking deployment as successful:

- [ ] Frontend loads without errors
- [ ] Can sign up with new account
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] Session persists on page reload
- [ ] Chatbot responds to questions
- [ ] Text selection translation works
- [ ] Page translation works
- [ ] Content personalization works
- [ ] Login modal displays correctly
- [ ] Modal blocks page scrolling
- [ ] Modal can be closed
- [ ] No console errors
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop

---

## 🎯 Summary

**Before Refactoring:**
- 5 different backend servers
- Hardcoded URLs in 5 files
- Different ports (3000, 3001, 5001, 8000)
- Hard to deploy and maintain

**After Refactoring:**
- ✅ 1 backend server (port 3000)
- ✅ 1 environment variable (`API_BASE_URL`)
- ✅ Centralized configuration (`src/config/api.js`)
- ✅ Easy deployment (just update 1 env var)
- ✅ Fixed UI issues (modal, scrolling, layout)
- ✅ Production-ready

---

## 📞 Support

If you encounter issues:

1. **Check backend health**: Visit `${API_BASE_URL}/health`
2. **Check browser console**: Look for specific error messages
3. **Check Vercel build logs**: See if build failed
4. **Check backend logs**: See if API requests are reaching backend
5. **Verify environment variables**: Ensure `API_BASE_URL` is set correctly

---

**Happy Deploying! 🚀**

*Last Updated: December 16, 2025*
