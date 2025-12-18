# Vercel Deployment Guide - Full Stack App

This guide walks you through deploying your Docusaurus frontend + Express backend on Vercel.

## Architecture Overview

- **Frontend**: Docusaurus (React-based static site) → Served from `/build`
- **Backend**: Express.js API → Serverless functions in `/api`
- **Deployment**: Single Vercel project, same domain

## File Structure

```
project-root/
├── api/
│   └── index.js              # Serverless handler for backend
├── central-backend/
│   ├── src/
│   │   ├── app.js           # Express app
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utilities
│   └── server.js            # Local dev server
├── docs/                     # Docusaurus content
├── src/                      # Docusaurus React components
├── vercel.json              # Vercel configuration
├── package.json             # Root dependencies (frontend + backend)
└── docusaurus.config.ts     # Docusaurus config
```

## Step 1: Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```bash
NODE_ENV=production
BETTER_AUTH_SECRET=a3f8c9d2e1b4a7c6f5d8e2b1a4c7f6d9e3b2a5c8f7d1e4b3a6c9f2d5e8b1a4c7
BETTER_AUTH_URL=https://physical-ai-humanoid-robotics-book-eosin.vercel.app
DATABASE_URL=postgresql://neondb_owner:npg_iKdfhC9Iz5uN@ep-shiny-bar-adtgsazt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
QDRANT_URL=https://9fa006fd-c8ea-4b97-bdbf-e1679c7a7db1.europe-west3-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.qP5-vZs2UE7lQG_f_hQK1HZvy9Gva_LVGo-UkmX5i1I
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_CHAT_MODEL=google/gemini-2.0-flash-exp:free
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
```

**IMPORTANT**:
- Do NOT set `API_BASE_URL` in Vercel (leave it empty/unset)
- Update `BETTER_AUTH_URL` to match your actual Vercel domain

## Step 2: Configure Vercel Project Settings

In Vercel → Project Settings:

- **Root Directory**: Leave empty (deploys from root)
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`
- **Node.js Version**: 20.x

## Step 3: How the Routing Works

Your `vercel.json` routes requests as follows:

1. `/api/*` → `/api/index.js` (backend serverless function)
2. `/health` → `/api/index.js` (backend health check)
3. `/chat` → `/api/index.js` (backend chat endpoint)
4. `/*` → `/build/*` (frontend static files)

## Step 4: Deploy

### Option A: Deploy via Git (Recommended)

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push
   ```

2. Vercel will automatically detect the push and deploy

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

## Step 5: Verify Deployment

After deployment, test these endpoints:

1. **Frontend**: `https://your-app.vercel.app/`
2. **Health Check**: `https://your-app.vercel.app/health`
3. **API**: `https://your-app.vercel.app/api/auth/auth-health`
4. **Chat**: `https://your-app.vercel.app/chat` (POST request)

## Common Issues & Solutions

### Issue 1: "Not Found" on API Routes

**Cause**: Environment variables not set or `/api/index.js` not found

**Solution**:
1. Verify all environment variables are set in Vercel
2. Make sure you're deploying from the root directory
3. Check that `/api/index.js` exists in your repo

### Issue 2: Module Import Errors

**Cause**: Backend dependencies not installed

**Solution**:
- Backend dependencies are now in root `package.json`
- Run `npm install` locally to update `package-lock.json`
- Commit and redeploy

### Issue 3: Database Connection Errors

**Cause**: DATABASE_URL not set or incorrect

**Solution**:
- Verify DATABASE_URL in Vercel environment variables
- Test connection string locally first
- Ensure your database allows connections from Vercel IPs

### Issue 4: CORS Errors

**Cause**: Frontend trying to call localhost API

**Solution**:
- Frontend automatically detects Vercel and uses relative URLs
- Verify `API_BASE_URL` is NOT set in Vercel env vars
- Check browser console for actual URL being called

## Local Development

To run locally:

1. **Start backend**:
   ```bash
   cd central-backend
   npm install
   npm run dev
   ```

2. **Start frontend** (in new terminal):
   ```bash
   npm install
   npm start
   ```

3. Frontend runs on `http://localhost:3000`
4. Backend runs on `http://localhost:3001`
5. Frontend calls backend via `API_BASE_URL=http://localhost:3001`

## Project Structure Explained

### `/api/index.js`
- Entry point for Vercel serverless functions
- Imports Express app from `central-backend/src/app.js`
- Handles initialization and request forwarding

### `vercel.json`
- Configures routing
- Specifies build settings
- Sets function memory and timeout

### `central-backend/src/app.js`
- Express application
- Route definitions
- Middleware setup
- Works both locally (with `app.listen()`) and on Vercel (as serverless)

### Frontend API Configuration
- `src/config/api.js` auto-detects environment
- Uses relative URLs on Vercel
- Uses `localhost:3001` for local development

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] `BETTER_AUTH_URL` updated to production domain
- [ ] Root directory is empty in Vercel settings
- [ ] Backend dependencies added to root `package.json`
- [ ] `.env` file in `.gitignore` (never commit secrets)
- [ ] `API_BASE_URL` is NOT set in Vercel env vars
- [ ] Test all API endpoints after deployment
- [ ] Check Vercel logs for any errors

## Monitoring & Logs

View real-time logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click on "Logs" or "Functions"
4. Monitor serverless function invocations

## Troubleshooting Commands

```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod --force

# Test API locally
curl http://localhost:3001/health

# Test API on Vercel
curl https://your-app.vercel.app/health
```

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Docusaurus Docs: https://docusaurus.io/docs
- Express on Vercel: https://vercel.com/guides/using-express-with-vercel
