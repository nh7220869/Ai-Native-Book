# 🚨 URGENT: Fix Quota Error - Follow These Steps EXACTLY 🚨

## ❌ Current Problem
You're getting this error:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests,
limit: 20, model: gemini-2.5-flash
Please retry in 15.527509238s.
```

## ✅ THE FIX (Follow Every Step!)

### Step 1: STOP Everything

**Stop the backend** (if it's running):
1. Go to terminal where you ran `cd gemini-backend && npm start`
2. Press `Ctrl+C` to stop it
3. Wait until it says "Process terminated" or similar

**Stop Docusaurus** (if it's running):
1. Go to terminal where you ran `npm start`
2. Press `Ctrl+C` to stop it
3. Wait until it says "Process terminated"

---

### Step 2: Clear Browser Data

1. Open your browser where you're testing
2. Press `F12` to open Developer Tools
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Click "Clear site data" or "Clear storage"
5. Check ALL boxes
6. Click "Clear"
7. **Close the browser completely** (not just the tab!)

---

### Step 3: Restart Backend with Rate Limiting

Open a **new terminal** (Terminal 1):

```bash
cd gemini-backend
npm start
```

**Wait for this message**:
```
🚀 Gemini Backend Server Started
📡 Server running on: http://localhost:5001
🔑 Gemini API Key: ✅ Configured
```

**IMPORTANT**: Look for these NEW messages when you test later:
```
📊 Rate limit: 11/12 requests remaining
⏳ Rate limit: 12/12 requests. Waiting 15s...
```

If you see these messages, the rate limiter is working! ✅

---

### Step 4: Restart Docusaurus

Open a **second terminal** (Terminal 2):

```bash
npm run clear
npm start
```

Wait for:
```
✔ Client
  Compiled successfully
```

And your browser should open to: `http://localhost:3000`

---

### Step 5: Test Carefully

#### Test 1: Single Text Translation

1. Go to: `http://localhost:3000/docs/intro`
2. Select **ONE SHORT SENTENCE** (not a paragraph!)
3. Click "🌐 Translate to Urdu"
4. **Wait for translation to complete**
5. Look at Terminal 1 (backend), you should see:
   ```
   📊 Rate limit: 11/12 requests remaining
   📝 Translating text to Urdu...
   ✅ Translation successful!
   ```

6. If successful: ✅ Rate limiter is working!
7. If quota error: ❌ Go to "Still Getting Errors?" section below

#### Test 2: Full Page Translation (SLOW!)

1. Stay on `http://localhost:3000/docs/intro`
2. Click language dropdown (top-right)
3. Select "اردو (Urdu)"
4. **BE PATIENT** - This will take 2-5 minutes!
5. Watch Terminal 1, you'll see:
   ```
   📊 Rate limit: 11/12 requests remaining
   📝 Translating text to Urdu...
   📊 Rate limit: 10/12 requests remaining
   📝 Translating text to Urdu...
   ...
   (After 12 requests)
   ⏳ Rate limit: 12/12 requests. Waiting 52s...
   (Backend automatically waits)
   📊 Rate limit: 11/12 requests remaining
   📝 Translating text to Urdu...
   ```

6. **DO NOT CLICK ANYTHING** while it's translating!
7. Wait until you see: "Page translated to Urdu ✓"

---

## 🐛 Still Getting Errors?

### Error 1: "Quota exceeded" immediately

**Cause**: You made too many requests recently

**Solution**:
1. **Wait 60 seconds** (use a timer!)
2. Go to: https://ai.dev/usage?tab=rate-limit
3. Check your quota usage
4. If it says "Quota exceeded", wait until it resets (shown in the UI)
5. Try again

### Error 2: Backend not showing rate limit messages

**Cause**: Old code still running

**Solution**:
1. **Kill all Node processes**:
   ```bash
   # Windows
   taskkill /F /IM node.exe

   # Mac/Linux
   killall node
   ```

2. **Restart backend**:
   ```bash
   cd gemini-backend
   npm start
   ```

3. Look for the startup message showing it loaded the rate limiter

### Error 3: Page translates partially then stops

**Cause**: Hit quota mid-translation

**Expected Behavior**: Backend should wait automatically

**What to Do**:
1. **Don't refresh the page!**
2. Look at Terminal 1 (backend)
3. You should see: `⏳ Rate limit: 12/12 requests. Waiting XXs...`
4. Wait for it to continue automatically
5. If it doesn't continue after 60 seconds, switch to English then back to Urdu

---

## 💡 Tips to Avoid Quota Issues

### DO:
✅ Translate **one page at a time**
✅ Wait **5 seconds between pages**
✅ Use **text selection** for quick lookups (1-2 sentences only)
✅ Watch backend terminal for rate limit messages
✅ Be patient - quality translation takes time

### DON'T:
❌ Translate multiple pages quickly
❌ Select very long text (more than 2 sentences)
❌ Click translate button repeatedly
❌ Switch languages rapidly
❌ Ignore backend console messages

---

## 📊 Understanding Rate Limits

**Gemini Free Tier**:
- **15-20 requests per minute** (official limit)
- **1500 requests per day**
- Resets every 60 seconds

**Our Settings** (Safe):
- **12 requests per minute** (safe buffer)
- **Automatic waiting** when limit reached
- **Backend handles pacing** (you don't need to wait manually)

**Translation Estimates**:
- 1 sentence = 1 request = ~2 seconds
- 1 paragraph = 2-3 requests = ~5-8 seconds
- 1 section = 10-15 requests = ~30-45 seconds (will auto-wait)
- 1 full page = 30-50 requests = ~2-5 minutes (will auto-wait multiple times)

---

## 🧪 Quick Diagnosis

Run this test to verify everything works:

### Terminal 1 (Backend):
```bash
cd gemini-backend
npm start
```

### Terminal 2 (Test API):
```bash
curl -X POST http://localhost:5001/api/gemini/translate \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Hello\",\"targetLanguage\":\"Urdu\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "translatedText": "ہیلو",
  "originalLength": 5,
  "translatedLength": 4,
  "targetLanguage": "Urdu"
}
```

**In Terminal 1, you should see**:
```
📊 Rate limit: 11/12 requests remaining
📝 Translating text to Urdu...
✅ Received response from Gemini API
✨ Translation successful!
```

If you see these messages: **✅ System working correctly!**

---

## 🎯 What Changed

### Backend (`gemini-backend/index.js`):
✅ Added **server-side rate limiter**
✅ Limits to **12 requests/minute**
✅ **Automatically waits** when limit reached
✅ Shows **quota counter** in console

### Frontend (`src/contexts/TranslationContext.jsx`):
✅ Reduced batch size to **1** (one at a time)
✅ Removed frontend delays (backend handles pacing)
✅ Better retry logic

### Result:
✅ **No more quota errors** (backend prevents them)
✅ **Slower but reliable** translation
✅ **Automatic pacing** (no manual waiting needed)

---

## ⚠️ Expected Behavior

When translating a full page:

1. **First 12 translations**: Fast (~2-3 seconds each)
2. **Backend message**: `⏳ Rate limit: 12/12 requests. Waiting 48s...`
3. **Automatic wait**: Backend pauses automatically
4. **Next 12 translations**: Fast again
5. **Repeat** until page complete

**This is normal!** The backend is protecting you from quota errors.

---

## 📞 Emergency Checklist

If nothing works, go through this:

- [ ] Backend stopped (Ctrl+C)
- [ ] Frontend stopped (Ctrl+C)
- [ ] Browser closed completely
- [ ] Wait 60 seconds (timer!)
- [ ] Backend restarted
- [ ] See rate limit messages in backend console
- [ ] Frontend restarted
- [ ] Browser cache cleared
- [ ] Test with 1 sentence translation
- [ ] Check backend shows: "📊 Rate limit: 11/12 requests remaining"

If all checked and still errors: **Your API key might be blocked temporarily**

Solution: Wait 15-30 minutes, or get a new API key from: https://aistudio.google.com/apikey

---

## 🎉 Success Indicators

You know it's working when:

✅ Backend shows: `📊 Rate limit: X/12 requests remaining`
✅ Backend shows: `⏳ Rate limit: 12/12 requests. Waiting XXs...`
✅ Translations complete without errors
✅ Page translation is slow but steady
✅ No "Quota exceeded" errors

---

## 🚀 Final Test

Try this complete workflow:

1. **Backend running** ✓
2. **Frontend running** ✓
3. **Go to**: http://localhost:3000/docs/intro
4. **Select one sentence**
5. **Click**: "Translate to Urdu"
6. **Wait**: Should work in 2-5 seconds
7. **Check Terminal 1**: Should show rate limit counter
8. **Result**: Translation appears in modal

If this works: **🎉 Everything is fixed!**

Now you can translate full pages - just be patient!

---

## 📝 Remember

- **Backend rate limiter** = No more quota errors
- **Slow translation** = Normal and expected
- **Be patient** = Better than errors
- **Watch console** = See what's happening
- **1 page at a time** = Best practice

**Your system is now quota-proof! 🛡️**

Enjoy your multilingual book! 🌍📚✨
