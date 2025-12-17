# Text Selection Feature Guide

## Overview
This feature allows users to select any text in your digital book and perform two actions:
1. **Ask AI** - Sends the selected text to the AI chatbot for explanation
2. **Translate to Urdu** - Translates the selected text into Urdu using Gemini API

## How It Works

### For Users:
1. **Select any text** in your book by clicking and dragging
2. A **popup will appear** with two buttons:
   - 🤖 **Ask AI** - Opens the chatbot and asks AI to explain the selected text
   - 🌐 **Translate to Urdu** - Opens a modal showing the Urdu translation

### What Was Implemented:

#### 1. Text Selection Popup Component
- **Location**: `src/components/TextSelectionPopup/`
- **Features**:
  - Automatically detects text selection
  - Shows popup near the selected text
  - Two clearly labeled buttons
  - Responsive design (works on mobile)
  - Dark mode support

#### 2. Enhanced Chatbot
- **Location**: `src/components/Chatbot/index.jsx`
- **Changes**:
  - Added `forwardRef` to allow external components to send messages
  - Created `sendMessage()` method that can be called programmatically
  - When "Ask AI" is clicked, it opens the chatbot and automatically sends: "Explain this: [selected text]"
  - **Your existing chatbot functionality remains unchanged**

#### 3. Translation Modal
- **Location**: `src/components/TranslationModal/`
- **Features**:
  - Beautiful modal with original and translated text
  - Loading spinner while translating
  - Error handling with clear messages
  - Copy button to copy translation to clipboard
  - Right-to-left text display for Urdu
  - Dark mode support

#### 4. Integration in Root Component
- **Location**: `src/theme/Root.js`
- **Features**:
  - Connects all components together
  - Handles "Ask AI" by sending text to chatbot
  - Handles "Translate to Urdu" by calling Gemini backend
  - Manages translation modal state

## Requirements

### Backend Services:

#### 1. RAG API (for Chatbot)
- **URL**: `http://localhost:8000/chat`
- **Purpose**: Answers questions about your book
- **Status**: Already configured in your project

#### 2. Gemini Translation Backend
- **URL**: `http://localhost:5001/api/gemini/translate`
- **Purpose**: Translates text to Urdu
- **Location**: `gemini-backend/`
- **API Key**: Already configured in `gemini-backend/.env`

## How to Start the Services

### Step 1: Start the Gemini Translation Backend
```bash
cd gemini-backend
npm start
```

The server should start on `http://localhost:5001`

### Step 2: Start the RAG API (if not already running)
```bash
cd rag
python main.py
```

The API should start on `http://localhost:8000`

### Step 3: Start Docusaurus
```bash
npm start
```

Your book should open at `http://localhost:3000`

## Testing the Feature

1. **Open your book** in the browser
2. **Navigate to any documentation page** (e.g., `/docs/intro`)
3. **Select some text** by clicking and dragging
4. **You should see two buttons appear** near your selection

### Test "Ask AI":
1. Click the **🤖 Ask AI** button
2. The chatbot should open automatically
3. Your selected text should be sent with "Explain this: [text]"
4. Wait for the AI response

### Test "Translate to Urdu":
1. Select some text
2. Click the **🌐 Translate to Urdu** button
3. A modal should open with:
   - Original text
   - Loading spinner
   - Translated text (in Urdu, right-aligned)
4. Click the **📋 Copy** button to copy the translation
5. Close the modal when done

## Troubleshooting

### Issue: Translation shows "API configuration error"

**Solution**: Make sure the Gemini backend is running and has the correct API key

1. Check if backend is running:
```bash
curl http://localhost:5001/health
```

2. Check the API key in `gemini-backend/.env`:
```
GEMINI_API_KEY="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"
```

3. Restart the backend:
```bash
cd gemini-backend
npm start
```

### Issue: Chatbot doesn't open when clicking "Ask AI"

**Solution**: Make sure the RAG API is running

```bash
cd rag
python main.py
```

### Issue: Popup doesn't appear when selecting text

**Solution**:
1. Make sure you're on a documentation page (not the homepage)
2. Try refreshing the page
3. Check browser console for errors (F12)

## Features

✅ **Does not break existing chatbot** - All original functionality preserved
✅ **Clear UI** - Users understand what each button does
✅ **Only uses selected text** - No confusion about what's being processed
✅ **Works on all pages** - Available throughout your digital book
✅ **Mobile responsive** - Works on phones and tablets
✅ **Dark mode support** - Matches your site theme
✅ **Error handling** - Shows clear error messages if something goes wrong
✅ **Loading states** - Users see progress indicators
✅ **Copy to clipboard** - Easy to copy translations

## Files Modified/Created

### Created:
- `src/components/TextSelectionPopup/index.jsx`
- `src/components/TextSelectionPopup/styles.module.css`
- `src/components/TranslationModal/index.jsx`
- `src/components/TranslationModal/styles.module.css`

### Modified:
- `src/components/Chatbot/index.jsx` - Added forwardRef and sendMessage method
- `src/theme/Root.js` - Integrated all components
- `docusaurus.config.ts` - Added customFields for RAG API URL

## Customization

### Change Translation Language
To translate to a different language, edit `src/theme/Root.js` line 48:
```javascript
targetLanguage: 'Urdu',  // Change to 'Hindi', 'Spanish', etc.
```

### Change Button Styles
Edit `src/components/TextSelectionPopup/styles.module.css` to customize colors and appearance.

### Change Popup Position
Modify `src/components/TextSelectionPopup/index.jsx` around lines 21-25 to adjust positioning.

## Support

If you encounter any issues:
1. Check that all backend services are running
2. Check browser console for errors (F12)
3. Verify API keys are correct
4. Try restarting all services

Enjoy your enhanced interactive digital book! 📚✨
