# Full Page Translation Guide

## Overview
Your digital book now supports **automatic full-page translation** through the header language toggle. When users select a language (Urdu or Spanish) from the dropdown in the navbar, the entire page content is automatically translated using the Gemini API.

## How It Works

### For Users:
1. **Click the language dropdown** in the top-right corner of the navbar
2. **Select a language**: Urdu (اردو) or Español
3. **Watch the magic happen**: The entire page content translates automatically
4. **Switch back to English** anytime to see the original content

### Visual Feedback:
- **Translation Banner**: Appears at the top showing translation progress
- **Floating Indicator**: Shows in the bottom-right during translation
- **Success Message**: Brief confirmation when translation completes

## What Was Implemented

### 1. Translation Context (`src/contexts/TranslationContext.jsx`)
**Purpose**: Manages translation state and API calls across the entire app

**Features**:
- Tracks current language from Docusaurus i18n system
- Manages translation cache to avoid repeated API calls
- Saves original content for each page
- Provides `translatePage()` function for full page translation
- Handles switching back to English (restores original content)

**Key Functions**:
- `translateText(text, targetLang)` - Translates individual text strings
- `translatePage(targetLang)` - Translates entire page content
- Automatically caches translations for performance

### 2. Page Translator Component (`src/components/PageTranslator/`)
**Purpose**: Monitors language changes and triggers translations

**Features**:
- Listens to Docusaurus locale changes
- Automatically translates page when language changes
- Shows translation progress banners
- Clears translations when switching pages
- Restores original content when switching to English

**Visual Components**:
- Translation progress banner (top of page)
- Floating translation indicator (bottom-right)
- Auto-hiding success message

### 3. Integration in Root Component
**Location**: `src/theme/Root.js`

**Changes**:
- Wrapped app with `TranslationProvider`
- Added `PageTranslator` component
- Translation context available throughout the app

## Supported Languages

Currently configured languages (can be extended):
- **English (en)** - Original content
- **Urdu (ur)** - اردو
- **Spanish (es)** - Español

To add more languages, edit `docusaurus.config.ts`:
```typescript
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'ur', 'es', 'hi', 'ar'], // Add more language codes
}
```

And update `src/contexts/TranslationContext.jsx`:
```javascript
const LANGUAGE_MAP = {
  en: { name: 'English', native: 'English', code: 'en' },
  ur: { name: 'Urdu', native: 'اردو', code: 'ur' },
  es: { name: 'Spanish', native: 'Español', code: 'es' },
  hi: { name: 'Hindi', native: 'हिन्दी', code: 'hi' }, // Add new language
};
```

## How Translation Works Technically

### Step 1: User Changes Language
User clicks the language dropdown in navbar and selects a language (e.g., Urdu)

### Step 2: PageTranslator Detects Change
The `PageTranslator` component listens to `i18n.currentLocale` and detects the change

### Step 3: Extract Content
The system:
1. Finds the main `<article>` element (Docusaurus content area)
2. Walks through all text nodes using `TreeWalker`
3. Skips code blocks and empty text
4. Saves original content for restoration

### Step 4: Translate in Batches
To avoid overwhelming the API:
- Translates 5 text segments at a time
- Uses Promise.all for parallel translation
- Caches results to avoid re-translating
- Applies translations progressively (visible to user)

### Step 5: Apply Translations
Each text node's content is replaced with the translation

### Step 6: Restore on English
When switching back to English:
- Retrieves saved original content for the page
- Restores all text nodes to their original state
- No API call needed (instant restoration)

## Performance Optimizations

### 1. Caching
**Implementation**: Translations are cached with key `${lang}:${text.substring(0, 100)}`

**Benefit**: If the same text appears multiple times or on different pages, it's only translated once

### 2. Batch Processing
**Implementation**: Translates 5 segments at a time

**Benefit**: Balances speed with API rate limits

### 3. Progressive Translation
**Implementation**: Translations are applied as they complete, not all at once

**Benefit**: Users see content appearing progressively, not all at once after a long wait

### 4. Original Content Preservation
**Implementation**: Saves original content in memory

**Benefit**: Instant restoration when switching to English (no re-fetch or API call)

### 5. Smart Node Walking
**Implementation**: Skips code blocks, empty nodes, and script tags

**Benefit**: Only translates user-readable content, preserves code examples

## Requirements

### Backend Service
**Gemini Translation API** must be running:

**Location**: `gemini-backend/`
**URL**: `http://localhost:5001/api/gemini/translate`
**API Key**: Configured in `gemini-backend/.env`

### Start the Backend:
```bash
cd gemini-backend
npm start
```

Expected output:
```
🚀 Gemini Backend Server Started
📡 Server running on: http://localhost:5001
🔑 Gemini API Key: ✅ Configured
```

## Testing the Feature

### Step 1: Start Services

**Terminal 1 - Gemini Backend**:
```bash
cd gemini-backend
npm start
```

**Terminal 2 - Docusaurus**:
```bash
npm start
```

### Step 2: Test Translation

1. Open your book: `http://localhost:3000`
2. Navigate to any documentation page (e.g., `/docs/intro`)
3. Click the **language dropdown** in the top-right corner
4. Select **"اردو (Urdu)"** or **"Español"**

**What to Expect**:
- Banner appears: "Translating page to Urdu..."
- Page content starts translating (top to bottom)
- Banner updates: "Page translated to Urdu ✓"
- Banner auto-hides after 3 seconds

### Step 3: Test Restoration

1. Click the language dropdown again
2. Select **"English"**

**What to Expect**:
- Content instantly restores to original English
- No loading or translation banner (instant)

### Step 4: Test Navigation

1. While in Urdu, click to another page
2. New page should automatically translate to Urdu
3. Translation state persists across navigation

## Troubleshooting

### Issue: Language dropdown not visible

**Solution**: Make sure you're on a page with the navbar visible (not a blank page)

### Issue: Translation shows error or doesn't work

**Causes & Solutions**:

1. **Gemini backend not running**
   ```bash
   # Check if backend is up
   curl http://localhost:5001/health

   # If not, start it
   cd gemini-backend
   npm start
   ```

2. **Invalid API key**
   - Check `gemini-backend/.env` has valid `GEMINI_API_KEY`
   - Verify key starts with `AIza`

3. **CORS errors**
   - Gemini backend should have CORS enabled (already configured)
   - Check browser console for errors (F12)

### Issue: Translation is slow

**Causes & Solutions**:

1. **Large page content**
   - Normal behavior for pages with lots of text
   - Content translates progressively (top to bottom)

2. **API rate limiting**
   - Gemini API has rate limits
   - Batch size can be increased in `TranslationContext.jsx` line 159:
     ```javascript
     const batchSize = 10; // Increase from 5 to 10
     ```

3. **Network issues**
   - Check internet connection
   - Translation requires API calls to Google's servers

### Issue: Some content doesn't translate

**Expected Behavior**:
- Code blocks are NOT translated (intentional)
- Navigation elements are NOT translated (Docusaurus UI)
- Only the main article content translates

**If other content should translate**:
- Check browser console for errors
- Verify the content is inside an `<article>` tag

### Issue: Translation doesn't restore when switching to English

**Solution**:
1. Refresh the page
2. Check browser console for errors
3. Original content might not have been saved properly

**Debug**:
- Open browser console (F12)
- Check for "originalContent" in TranslationContext state

## Features

✅ **Automatic translation** - No manual intervention needed
✅ **Full page support** - Translates entire documentation pages
✅ **Smart content detection** - Only translates readable text (skips code)
✅ **Visual feedback** - Clear progress indicators
✅ **Instant restoration** - Switching to English is immediate
✅ **Translation caching** - Repeated text only translated once
✅ **Progressive loading** - See translations appear as they complete
✅ **Navigation persistence** - Language choice persists across pages
✅ **Error handling** - Graceful fallbacks if translation fails
✅ **Mobile responsive** - Works on all device sizes

## How This Differs from Text Selection Translation

| Feature | Text Selection | Full Page Translation |
|---------|---------------|----------------------|
| **Trigger** | Select text, click button | Click language dropdown |
| **Scope** | Selected text only | Entire page |
| **Display** | Modal popup | In-place replacement |
| **Persistence** | One-time | Persists across navigation |
| **Restoration** | Close modal | Switch language dropdown |
| **Use Case** | Quick lookup | Read entire book in another language |

Both features work together! Users can:
1. Switch the entire book to Urdu using the dropdown
2. Still select specific text for deeper explanation or alternative translation

## Files Created/Modified

### Created:
- `src/contexts/TranslationContext.jsx` - Translation state management
- `src/components/PageTranslator/index.jsx` - Page translation component
- `src/components/PageTranslator/styles.module.css` - Styling
- `FULL-PAGE-TRANSLATION-GUIDE.md` - This documentation

### Modified:
- `src/theme/Root.js` - Added TranslationProvider and PageTranslator

### Existing (No Changes):
- `docusaurus.config.ts` - Already had i18n locales configured
- `src/components/Chatbot/` - Unchanged
- `src/components/TextSelectionPopup/` - Unchanged (still works independently)

## Customization

### Change Translation Speed
Edit `src/contexts/TranslationContext.jsx` line 159:
```javascript
const batchSize = 10; // Higher = faster but more API load
```

### Change Banner Duration
Edit `src/components/PageTranslator/index.jsx` line 29:
```javascript
const timer = setTimeout(() => {
  setShowBanner(false);
}, 5000); // Change from 3000 (3 seconds) to 5000 (5 seconds)
```

### Disable Visual Indicators
In `src/components/PageTranslator/index.jsx`, return `null` to disable banners:
```javascript
return null; // Hides all visual feedback
```

### Change Translation Prompt
Edit `src/contexts/TranslationContext.jsx` to customize how Gemini translates:
```javascript
const response = await fetch('http://localhost:5001/api/gemini/translate', {
  // ... existing code
  body: JSON.stringify({
    text: text,
    targetLanguage: targetLanguageName,
    style: 'formal', // Add custom parameters
    context: 'technical', // Add custom parameters
  }),
});
```

## Integration with Existing Features

### Works With:
✅ **Text Selection Translation** - Still works independently
✅ **Ask AI Chatbot** - Still works on translated content
✅ **Dark Mode** - Visual indicators support dark mode
✅ **Mobile Navigation** - Responsive on all devices
✅ **Page Navigation** - Persists language choice

### Doesn't Interfere With:
✅ Code blocks (remain in English)
✅ Navigation UI
✅ Search functionality
✅ Chatbot operation

## Future Enhancements

Possible improvements (not implemented yet):

1. **Save Translation Preference**
   - Remember user's language choice in localStorage
   - Auto-apply on next visit

2. **Offline Support**
   - Pre-translate common pages
   - Store in IndexedDB for offline access

3. **Multiple Translation Engines**
   - Fallback to DeepL or Google Translate if Gemini fails
   - Compare translations side-by-side

4. **Translation Quality Feedback**
   - Let users report bad translations
   - Improve prompts based on feedback

5. **Partial Page Translation**
   - Translate only specific sections
   - "Translate this chapter" button

## Support

If you encounter issues:

1. **Check backend is running**: `curl http://localhost:5001/health`
2. **Check browser console** (F12) for errors
3. **Verify API key** in `gemini-backend/.env`
4. **Test with small page** first (like `/docs/intro`)
5. **Check network tab** (F12) to see API requests

## Summary

You now have a powerful dual-translation system:

1. **Header Language Toggle** → Translates entire book
2. **Text Selection** → Translates specific passages

Users can:
- Read the entire book in their preferred language
- Get quick translations of specific technical terms
- Ask AI to explain content (in any language)

Enjoy your fully multilingual interactive digital book! 🌍📚✨
