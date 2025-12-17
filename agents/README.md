# Reusable Agent System

A comprehensive, modular agent system for generating, managing, and enhancing educational content using Claude Code Subagents and Agent Skills.

## Architecture

```
agents/
├── BookAgent.js                    # Main orchestrator
├── subagents/                      # Specialized subagents
│   ├── ChapterWriterSubagent.js
│   ├── ContentRefinerSubagent.js
│   ├── ConceptExplainerSubagent.js
│   ├── QuizGeneratorSubagent.js
│   ├── RAGPrepSubagent.js
│   └── TranslationSubagent.js
├── skills/                         # Reusable functions
│   ├── write_chapter.js
│   ├── refine_content.js
│   ├── explain_concept.js
│   ├── generate_quiz.js
│   ├── prepare_rag_context.js
│   └── translate_content.js
├── config/
│   └── agentConfig.js             # Central configuration
└── utils/
    ├── agentHelpers.js            # Helper utilities
    └── initializeAgents.js        # Initialization functions
```

## Design Principles

### 1. Reusability
- **Skills** are pure functions that can be called by any agent
- **Subagents** encapsulate related skills into cohesive workflows
- **BookAgent** orchestrates subagents for complex multi-step operations

### 2. Modularity
- Each subagent is independent and can be used standalone
- Skills have no dependencies on each other
- Clear separation of concerns

### 3. Configuration-Driven
- Centralized configuration in `config/agentConfig.js`
- Runtime configuration overrides supported
- Environment-specific settings

### 4. Provider-Agnostic
- LLM function injection (works with any LLM provider)
- Embedding function injection (works with any embedding provider)
- Vector database agnostic (Qdrant, Pinecone, Weaviate, etc.)

## Components

### Main Agent

#### BookAgent
Coordinates all subagents to provide comprehensive workflows:
- Generate complete chapters with quiz, RAG, and glossary
- Batch process entire books
- Refine existing content
- Translate books to multiple languages
- Prepare content for RAG chatbot
- Generate educational packages
- Update existing chapters

### Subagents

#### ChapterWriterSubagent
- Generate chapters from topics
- Optional automatic refinement
- Include quiz generation
- Prepare RAG context
- Batch chapter generation

#### ContentRefinerSubagent
- Improve content quality
- Multiple refinement passes
- Focus on specific areas (clarity, examples, structure)
- Add glossary sections

#### ConceptExplainerSubagent
- Explain concepts at different levels (eli5 to expert)
- Generate glossaries
- Create FAQs
- Multi-level adaptive explanations
- Auto-extract concepts from content

#### QuizGeneratorSubagent
- Generate quizzes with multiple question types
- Progressive difficulty (easy → medium → hard)
- Topic-specific quizzes
- Batch quiz generation

#### RAGPrepSubagent
- Intelligent content chunking
- Generate embeddings
- Upload to vector database
- Quality analysis
- Re-indexing support

#### TranslationSubagent
- Multi-language translation
- Glossary management for consistency
- Preserve formatting and code blocks
- Translation quality validation
- Batch translation

### Skills

#### write_chapter
Pure function to generate a chapter from topics.

**Input**: `{ chapterNumber, title, topics, targetAudience, wordCount, style, llmFunction }`
**Output**: `{ success, content, metadata }`

#### refine_content
Pure function to improve content quality.

**Input**: `{ content, improvements, targetAudience, focusArea, llmFunction }`
**Output**: `{ success, refinedContent, metadata }`

#### explain_concept
Pure function to explain a concept.

**Input**: `{ concept, context, level, includeAnalogy, includeCode, llmFunction }`
**Output**: `{ success, explanation, metadata }`

#### generate_quiz
Pure function to create quiz questions.

**Input**: `{ content, questionCount, questionTypes, difficulty, llmFunction }`
**Output**: `{ success, quiz, metadata }`

#### prepare_rag_context
Pure function to chunk and embed content.

**Input**: `{ content, chapterTitle, chapterNumber, chunkSize, embeddingFunction }`
**Output**: `{ success, chunks, metadata }`

#### translate_content
Pure function to translate content.

**Input**: `{ content, targetLanguage, sourceLanguage, style, llmFunction }`
**Output**: `{ success, translatedContent, metadata }`

## Usage

### Quick Start

```javascript
import { initializeBookAgent } from './agents/utils/initializeAgents.js';

// Initialize with your LLM and embedding functions
const bookAgent = initializeBookAgent({
  openRouterClient: yourOpenRouterClient,
  embeddingClient: yourEmbeddingClient,
  qdrantClient: yourQdrantClient
});

// Generate a complete chapter
const chapter = await bookAgent.generateCompleteChapter({
  chapterNumber: '1',
  title: 'Introduction to ROS2',
  topics: ['ROS2 Architecture', 'Nodes', 'Topics', 'Services'],
  options: {
    targetAudience: 'intermediate',
    wordCount: 2000,
    includeQuiz: true,
    includeRAG: true,
    includeGlossary: true
  }
});
```

### Using Individual Subagents

```javascript
import { initializeChapterWriter } from './agents/utils/initializeAgents.js';

// Initialize only the subagent you need
const chapterWriter = initializeChapterWriter({
  openRouterClient: yourOpenRouterClient,
  embeddingClient: yourEmbeddingClient
});

// Use it
const result = await chapterWriter.generateChapter({
  chapterNumber: '1',
  title: 'Introduction to ROS2',
  topics: ['ROS2', 'Nodes', 'Topics']
});
```

### Using Skills Directly

```javascript
import { write_chapter } from './agents/skills/write_chapter.js';

// Use skill as a pure function
const result = await write_chapter({
  chapterNumber: '1',
  title: 'Introduction to ROS2',
  topics: ['ROS2 Architecture', 'Nodes'],
  targetAudience: 'intermediate',
  wordCount: 2000,
  style: 'tutorial',
  llmFunction: yourLLMFunction
});
```

## Configuration

### Global Configuration

Edit `agents/config/agentConfig.js`:

```javascript
export const agentConfig = {
  llm: {
    model: 'google/gemini-2.0-flash-exp:free',
    defaultTemperature: 0.7,
    defaultMaxTokens: 4000
  },

  chapterWriter: {
    defaultWordCount: 2000,
    defaultStyle: 'tutorial',
    autoRefine: true,
    includeQuiz: true,
    prepareRAG: true
  },

  // ... more configurations
};
```

### Runtime Configuration

Override defaults at initialization:

```javascript
const bookAgent = initializeBookAgent(
  { openRouterClient, embeddingClient, qdrantClient },
  {
    // Custom options
    autoTranslate: true,
    defaultLanguages: ['en', 'ur', 'es'],
    chapterWriter: {
      defaultWordCount: 3000,
      autoRefine: false
    }
  }
);
```

## Workflows

### Workflow 1: Generate Complete Chapter
```javascript
const chapter = await bookAgent.generateCompleteChapter({
  chapterNumber: '1',
  title: 'Introduction',
  topics: ['Topic 1', 'Topic 2'],
  options: { includeQuiz: true, includeRAG: true }
});
```

**Output**: Chapter content + quiz + RAG chunks + (optional) glossary + (optional) translations

### Workflow 2: Generate Complete Book
```javascript
const book = await bookAgent.generateCompleteBook({
  chapters: [
    { chapterNumber: '1', title: 'Intro', topics: [...] },
    { chapterNumber: '2', title: 'Basics', topics: [...] }
  ]
});
```

**Output**: All chapters with full pipeline

### Workflow 3: Refine Existing Content
```javascript
const refined = await bookAgent.refineBook({
  chapters: existingChapters,
  improvements: ['clarity', 'examples', 'structure'],
  iterations: 2
});
```

**Output**: Improved versions of all chapters

### Workflow 4: Translate Book
```javascript
const translated = await bookAgent.translateBook({
  chapters: existingChapters,
  targetLanguages: ['ur', 'es', 'fr']
});
```

**Output**: Translated chapters in all target languages

### Workflow 5: Prepare for RAG
```javascript
const ragReady = await bookAgent.prepareBookForRAG({
  chapters: existingChapters,
  uploadToDb: true
});
```

**Output**: Chunked and embedded content + quality analysis

### Workflow 6: Educational Package
```javascript
const eduPackage = await bookAgent.generateEducationalPackage({
  chapterNumber: '1',
  title: 'Introduction',
  topics: ['Topic 1', 'Topic 2'],
  targetAudience: 'beginner'
});
```

**Output**: Chapter + progressive quizzes + glossary + FAQ + topic quizzes

### Workflow 7: Update Chapter
```javascript
const updated = await bookAgent.updateChapter({
  chapterNumber: '1',
  title: 'Introduction',
  content: existingContent,
  updateOptions: {
    refine: true,
    addGlossary: true,
    regenerateQuiz: true,
    updateRAG: true,
    concepts: ['ROS2', 'URDF']
  }
});
```

**Output**: Refined content + glossary + new quiz + updated RAG

### Workflow 8: Multi-Language Education
```javascript
const multiLang = await bookAgent.generateMultiLanguageEducation({
  chapterNumber: '1',
  title: 'Introduction',
  topics: ['Topic 1', 'Topic 2'],
  targetLanguages: ['en', 'ur', 'es']
});
```

**Output**: Chapter in all languages + localized glossaries

## Best Practices

### 1. Use the Right Level of Abstraction
- **BookAgent**: For complex multi-step workflows
- **Subagents**: For specific tasks (translation, quizzes, etc.)
- **Skills**: For low-level operations or custom workflows

### 2. Handle Errors Gracefully
```javascript
try {
  const result = await bookAgent.generateCompleteChapter({...});
  if (result.success) {
    // Process result
  }
} catch (error) {
  console.error('Chapter generation failed:', error.message);
  // Handle error
}
```

### 3. Respect Rate Limits
- Use built-in delays between batch operations
- Configure rate limits in `agentConfig.js`
- Monitor API usage

### 4. Customize for Your Needs
- Extend subagents with custom methods
- Create new skills for specific operations
- Override default configurations

### 5. Test Before Production
- Use mock functions for testing
- Test individual skills before using workflows
- Verify output quality

## Testing

### Unit Testing Skills
```javascript
import { createMockLLMFunction } from './agents/utils/initializeAgents.js';
import { write_chapter } from './agents/skills/write_chapter.js';

const mockLLM = createMockLLMFunction();
const result = await write_chapter({
  chapterNumber: '1',
  title: 'Test',
  topics: ['Topic 1'],
  llmFunction: mockLLM
});
```

### Integration Testing
```javascript
import { initializeForTesting } from './agents/utils/initializeAgents.js';

const agents = initializeForTesting({
  chapterWriter: { defaultWordCount: 500 }
});

const result = await agents.bookAgent.generateCompleteChapter({
  chapterNumber: '1',
  title: 'Test',
  topics: ['Topic 1']
});
```

## Extending the System

### Create a Custom Skill

```javascript
// agents/skills/my_custom_skill.js
export async function my_custom_skill({ input, options, llmFunction }) {
  // Your logic here
  const result = await llmFunction([
    { role: 'user', content: `Process this: ${input}` }
  ]);

  return {
    success: true,
    output: result,
    metadata: { /* ... */ }
  };
}
```

### Create a Custom Subagent

```javascript
// agents/subagents/MyCustomSubagent.js
import { my_custom_skill } from '../skills/my_custom_skill.js';

export class MyCustomSubagent {
  constructor({ llmFunction, options = {} }) {
    this.llmFunction = llmFunction;
    this.options = options;
  }

  async performCustomTask({ input }) {
    return await my_custom_skill({
      input,
      llmFunction: this.llmFunction
    });
  }
}
```

### Add to BookAgent

```javascript
// In BookAgent.js
import { MyCustomSubagent } from './subagents/MyCustomSubagent.js';

// In constructor
this.myCustom = new MyCustomSubagent({
  llmFunction,
  options: options.myCustom || {}
});
```

## Performance

### Optimization Tips

1. **Batch Operations**: Use batch methods instead of loops
2. **Parallel Processing**: Use `Promise.all()` for independent tasks
3. **Caching**: Cache frequently used glossaries and explanations
4. **Chunk Size**: Tune RAG chunk size for your use case
5. **Model Selection**: Use faster models for less critical tasks

### Resource Usage

- **Chapter Generation**: ~2-3 API calls (initial + refinement)
- **Quiz Generation**: 1 API call
- **Translation**: 1 API call per language
- **RAG Preparation**: N embedding API calls (N = number of chunks)
- **Glossary**: N API calls (N = number of concepts)

## Troubleshooting

### Common Issues

**Agent not initialized**
- Ensure all required clients are passed
- Check LLM and embedding functions are valid

**Rate limit errors**
- Reduce batch sizes
- Increase delays in config
- Wait for rate limit reset

**Poor content quality**
- Adjust LLM temperature
- Use refinement iterations
- Try different models

**RAG chunks too small/large**
- Tune `chunkSize` in config
- Adjust `chunkOverlap`
- Use quality analysis to optimize

## API Reference

See individual files for detailed API documentation:
- [BookAgent.js](./BookAgent.js)
- [Subagents](./subagents/)
- [Skills](./skills/)
- [Configuration](./config/agentConfig.js)
- [Utilities](./utils/)

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for comprehensive usage examples and patterns.

## License

Part of the Physical AI Humanoid Robotics Book project.
