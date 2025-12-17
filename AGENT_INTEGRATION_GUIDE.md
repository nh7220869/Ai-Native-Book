# Agent System Integration Guide

This guide explains how to integrate the new reusable agent system into your existing backend.

## Overview

The agent system provides:
- **1 Main Agent**: BookAgent (coordinates all operations)
- **6 Subagents**: ChapterWriter, ContentRefiner, ConceptExplainer, QuizGenerator, RAGPrep, Translation
- **6 Skills**: Reusable functions for chapter writing, refinement, explanations, quizzes, RAG, translation
- **API Routes**: REST endpoints to access all agent functionality

## Files Created

### Agent System Core
- `agents/BookAgent.js` - Main orchestrator agent
- `agents/subagents/ChapterWriterSubagent.js`
- `agents/subagents/ContentRefinerSubagent.js`
- `agents/subagents/ConceptExplainerSubagent.js`
- `agents/subagents/QuizGeneratorSubagent.js`
- `agents/subagents/RAGPrepSubagent.js`
- `agents/subagents/TranslationSubagent.js`

### Agent Skills
- `agents/skills/write_chapter.js`
- `agents/skills/refine_content.js`
- `agents/skills/explain_concept.js`
- `agents/skills/generate_quiz.js`
- `agents/skills/prepare_rag_context.js`
- `agents/skills/translate_content.js`

### Configuration & Utilities
- `agents/config/agentConfig.js` - Central configuration
- `agents/utils/agentHelpers.js` - Helper utilities
- `agents/utils/initializeAgents.js` - Initialization functions

### Backend Integration
- `central-backend/src/routes/agentsRoutes.js` - API endpoints
- `central-backend/src/utils/openRouterAdapter.js` - OpenRouter SDK adapter

## Integration Steps

### Step 1: Update `central-backend/src/app.js`

Add the following imports at the top of the file:

```javascript
// Import agent routes and adapter (ADD THESE LINES)
import agentsRoutes, { setupAgents } from './routes/agentsRoutes.js';
import { createOpenRouterClient, createEmbeddingClient } from './utils/openRouterAdapter.js';
import { getQdrantClient } from './utils/qdrantClient.js';
```

In the `initializeServices` function, **after** Qdrant is initialized (around line 54), add:

```javascript
console.log('✅ Qdrant connected');

// Initialize agent system (ADD THIS BLOCK)
console.log('🤖 Initializing agent system...');
try {
  const openRouterClient = createOpenRouterClient();
  const embeddingClient = createEmbeddingClient();
  const qdrantClient = getQdrantClient(); // Get initialized Qdrant client

  setupAgents({
    openRouterClient,
    embeddingClient,
    qdrantClient
  });

  console.log('✅ Agent system initialized');
} catch (error) {
  console.error('⚠️  Agent system initialization failed:', error.message);
  console.log('   Agent routes will not be available');
}
```

Mount the agent routes (add before line 114, where other routes are mounted):

```javascript
// Mount agent routes (ADD THIS LINE)
app.use('/api/agents', agentsRoutes);

// Mount translation routes
app.use('/api', translationRoutes);
```

Update the available endpoints list in the catch-all route (around line 62):

```javascript
availableEndpoints: [
  'GET /health',
  'GET /api/auth/auth-health',
  'POST /api/auth/sign-up/email',
  'POST /api/auth/sign-in/email',
  'POST /api/auth/sign-out',
  'GET /api/auth/session',
  'POST /api/gemini/translate',
  'POST /api/translate',
  'POST /api/personalize',
  'POST /chat',
  // ADD THESE AGENT ENDPOINTS
  'GET /api/agents/status',
  'POST /api/agents/generate-chapter',
  'POST /api/agents/generate-book',
  'POST /api/agents/refine-content',
  'POST /api/agents/generate-quiz',
  'POST /api/agents/explain-concept',
  'POST /api/agents/generate-glossary',
  'POST /api/agents/translate-content',
  'POST /api/agents/prepare-rag',
  'POST /api/agents/educational-package',
  'POST /api/agents/update-chapter',
  'POST /api/agents/translate-book'
]
```

### Step 2: Update `central-backend/src/utils/qdrantClient.js`

Add an export to get the initialized client:

```javascript
// ADD THIS EXPORT at the end of the file
export function getQdrantClient() {
  return qdrantClient;
}
```

### Step 3: Restart Backend Server

Stop the current backend server and restart it:

```bash
cd central-backend
npm start
```

You should see:
```
✅ Database connected
✅ Authentication routes mounted
✅ Qdrant connected
🤖 Initializing agent system...
✅ Agent system initialized
```

## API Endpoints

### Agent Status
```http
GET /api/agents/status
```

Returns agent system health and configuration.

### Generate Complete Chapter
```http
POST /api/agents/generate-chapter
Content-Type: application/json

{
  "chapterNumber": "1",
  "title": "Introduction to ROS2",
  "topics": ["ROS2 Architecture", "Nodes", "Topics", "Services"],
  "options": {
    "targetAudience": "intermediate",
    "wordCount": 2000,
    "includeQuiz": true,
    "includeRAG": true,
    "includeGlossary": true
  }
}
```

Returns chapter content with quiz, RAG chunks, and glossary.

### Generate Complete Book
```http
POST /api/agents/generate-book
Content-Type: application/json

{
  "chapters": [
    {
      "chapterNumber": "1",
      "title": "Introduction to ROS2",
      "topics": ["ROS2", "Nodes", "Topics"]
    },
    {
      "chapterNumber": "2",
      "title": "URDF Basics",
      "topics": ["URDF", "Links", "Joints"]
    }
  ],
  "options": {
    "targetAudience": "intermediate"
  }
}
```

Batch generates multiple chapters with full pipeline.

### Refine Content
```http
POST /api/agents/refine-content
Content-Type: application/json

{
  "content": "Chapter content here...",
  "improvements": ["clarity", "examples", "structure"],
  "iterations": 2
}
```

Improves existing content quality.

### Generate Quiz
```http
POST /api/agents/generate-quiz
Content-Type: application/json

{
  "content": "Chapter content...",
  "questionCount": 5,
  "difficulty": "medium",
  "questionTypes": ["mcq", "true-false", "short-answer"]
}
```

Creates assessment questions from content.

### Explain Concept
```http
POST /api/agents/explain-concept
Content-Type: application/json

{
  "concept": "ROS2",
  "level": "beginner",
  "context": "robotics"
}
```

Generates concept explanation at specified level.

### Generate Glossary
```http
POST /api/agents/generate-glossary
Content-Type: application/json

{
  "concepts": ["ROS2", "URDF", "Gazebo", "Nav2"],
  "level": "intermediate"
}
```

Creates glossary for multiple concepts.

### Translate Content
```http
POST /api/agents/translate-content
Content-Type: application/json

{
  "content": "Chapter content...",
  "targetLanguage": "ur",
  "sourceLanguage": "en",
  "style": "natural"
}
```

Translates content to target language.

### Prepare for RAG
```http
POST /api/agents/prepare-rag
Content-Type: application/json

{
  "content": "Chapter content...",
  "chapterTitle": "Introduction to ROS2",
  "chapterNumber": "1",
  "uploadToDb": true
}
```

Chunks content and generates embeddings for RAG.

### Generate Educational Package
```http
POST /api/agents/educational-package
Content-Type: application/json

{
  "chapterNumber": "1",
  "title": "Introduction to ROS2",
  "topics": ["ROS2", "Nodes", "Topics"],
  "targetAudience": "intermediate"
}
```

Creates comprehensive learning materials (chapter + progressive quizzes + glossary + FAQ).

### Update Chapter
```http
POST /api/agents/update-chapter
Content-Type: application/json

{
  "chapterNumber": "1",
  "title": "Introduction to ROS2",
  "content": "Existing chapter content...",
  "updateOptions": {
    "refine": true,
    "addGlossary": true,
    "regenerateQuiz": true,
    "updateRAG": true,
    "concepts": ["ROS2", "Nodes"]
  }
}
```

Updates existing chapter with refinements and enhancements.

### Translate Book
```http
POST /api/agents/translate-book
Content-Type: application/json

{
  "chapters": [
    {
      "chapterNumber": "1",
      "title": "Introduction",
      "content": "Chapter content..."
    }
  ],
  "targetLanguages": ["ur", "es", "fr"]
}
```

Batch translates entire book to multiple languages.

## Frontend Integration

### React/Next.js Example

```javascript
// utils/agentApi.js
export async function generateChapter(chapterData) {
  const response = await fetch('http://localhost:3001/api/agents/generate-chapter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chapterData)
  });

  return response.json();
}

export async function refineContent(content, improvements) {
  const response = await fetch('http://localhost:3001/api/agents/refine-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, improvements })
  });

  return response.json();
}

// Use in component
import { generateChapter } from '../utils/agentApi';

function ChapterGenerator() {
  const handleGenerate = async () => {
    const result = await generateChapter({
      chapterNumber: '1',
      title: 'Introduction to ROS2',
      topics: ['ROS2 Architecture', 'Nodes', 'Topics'],
      options: {
        includeQuiz: true,
        includeRAG: true
      }
    });

    console.log('Generated chapter:', result);
  };

  return <button onClick={handleGenerate}>Generate Chapter</button>;
}
```

## Configuration

### Customizing Agent Behavior

Edit `agents/config/agentConfig.js` to change defaults:

```javascript
export const agentConfig = {
  // Change LLM model
  llm: {
    model: 'google/gemini-2.0-flash-exp:free',
    defaultTemperature: 0.7,
    defaultMaxTokens: 4000
  },

  // Change chapter defaults
  chapterWriter: {
    defaultWordCount: 2500, // Change from 2000
    autoRefine: true,
    includeQuiz: false // Disable quiz by default
  },

  // Change RAG chunking
  ragPrep: {
    chunkSize: 400, // Change from 300
    chunkOverlap: 75  // Change from 50
  }
};
```

## Direct Usage (Without API)

You can also use agents directly in your backend code:

```javascript
import { initializeBookAgent } from '../agents/utils/initializeAgents.js';
import { createOpenRouterClient, createEmbeddingClient } from './utils/openRouterAdapter.js';
import { getQdrantClient } from './utils/qdrantClient.js';

// Initialize
const bookAgent = initializeBookAgent({
  openRouterClient: createOpenRouterClient(),
  embeddingClient: createEmbeddingClient(),
  qdrantClient: getQdrantClient()
});

// Use directly
async function generateNewChapter() {
  const result = await bookAgent.generateCompleteChapter({
    chapterNumber: '1',
    title: 'Introduction to ROS2',
    topics: ['ROS2', 'Nodes', 'Topics']
  });

  console.log('Chapter generated:', result);
}
```

## Testing

### Test Agent Status

```bash
curl http://localhost:3001/api/agents/status
```

Expected response:
```json
{
  "success": true,
  "initialized": true,
  "subagents": {
    "chapterWriter": true,
    "contentRefiner": true,
    "conceptExplainer": true,
    "quizGenerator": true,
    "ragPrep": true,
    "translator": true
  },
  "configuration": {
    "hasLLM": true,
    "hasEmbedding": true,
    "hasVectorDb": true,
    "autoTranslate": false,
    "autoRAG": true,
    "autoQuiz": true,
    "defaultLanguages": ["en"]
  }
}
```

### Test Chapter Generation

```bash
curl -X POST http://localhost:3001/api/agents/generate-chapter \
  -H "Content-Type: application/json" \
  -d '{
    "chapterNumber": "1",
    "title": "Test Chapter",
    "topics": ["Topic 1", "Topic 2"],
    "options": {
      "wordCount": 500,
      "includeQuiz": false,
      "includeRAG": false
    }
  }'
```

## Troubleshooting

### Agents Not Initialized

**Error**: `503 Service Unavailable - Agents not initialized`

**Solution**: Check backend logs for agent initialization errors. Ensure OpenRouter API key is set in `.env`:
```
OPENROUTER_API_KEY=your_key_here
```

### Rate Limit Errors

**Error**: `429 Too Many Requests`

**Solution**:
1. Wait 10-15 minutes for rate limit to reset
2. Add credits to your OpenRouter account
3. Reduce batch sizes in agent config

### Qdrant Connection Issues

**Error**: RAG preparation fails with connection error

**Solution**:
1. Ensure Qdrant is running
2. Check `QDRANT_URL` in `.env`
3. Verify collection exists or set `autoUpload: false` in config

### Missing Embeddings

**Error**: Embedding function not available

**Solution**: Ensure `OPENROUTER_EMBEDDING_MODEL` is set in `.env`:
```
OPENROUTER_EMBEDDING_MODEL=text-embedding-3-small
```

## Next Steps

1. **Integrate into UI**: Create React components to use agent endpoints
2. **Add Authentication**: Protect agent routes with auth middleware
3. **Monitor Usage**: Add analytics to track agent usage and costs
4. **Extend Agents**: Create custom subagents for specific needs
5. **Batch Processing**: Use agent system to generate all book chapters

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Review agent configuration in `agents/config/agentConfig.js`
3. Test individual endpoints with curl or Postman
4. Verify all required environment variables are set
