/**
 * AGENT INITIALIZATION UTILITIES
 *
 * Factory functions to initialize agents with project defaults.
 * Integrates with existing OpenRouter API, embeddings, and Qdrant.
 *
 * REUSABILITY: Centralized agent initialization for the entire project.
 */

import { BookAgent } from '../BookAgent.js';
import { ChapterWriterSubagent } from '../subagents/ChapterWriterSubagent.js';
import { ContentRefinerSubagent } from '../subagents/ContentRefinerSubagent.js';
import { ConceptExplainerSubagent } from '../subagents/ConceptExplainerSubagent.js';
import { QuizGeneratorSubagent } from '../subagents/QuizGeneratorSubagent.js';
import { RAGPrepSubagent } from '../subagents/RAGPrepSubagent.js';
import { TranslationSubagent } from '../subagents/TranslationSubagent.js';
import agentConfig from '../config/agentConfig.js';

/**
 * Create LLM function wrapper for OpenRouter
 *
 * REUSABLE: Wraps OpenRouter API for use by all agents
 *
 * @param {Function} openRouterClient - Existing OpenRouter client from backend
 * @returns {Function} LLM function compatible with agent skills
 */
export function createLLMFunction(openRouterClient) {
  return async (messages, options = {}) => {
    const temperature = options.temperature ?? agentConfig.llm.defaultTemperature;
    const maxTokens = options.maxTokens ?? agentConfig.llm.defaultMaxTokens;
    const model = options.model ?? agentConfig.llm.model;

    try {
      const response = await openRouterClient.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      return response.choices[0].message.content;

    } catch (error) {
      console.error('LLM API Error:', error);
      throw new Error(`LLM API failed: ${error.message}`);
    }
  };
}

/**
 * Create embedding function wrapper
 *
 * REUSABLE: Wraps embedding API for RAG preparation
 *
 * @param {Function} embeddingClient - Existing embedding client
 * @returns {Function} Embedding function compatible with RAG subagent
 */
export function createEmbeddingFunction(embeddingClient) {
  return async (text) => {
    try {
      const response = await embeddingClient.embeddings.create({
        model: agentConfig.embeddings.model,
        input: text
      });

      return response.data[0].embedding;

    } catch (error) {
      console.error('Embedding API Error:', error);
      throw new Error(`Embedding API failed: ${error.message}`);
    }
  };
}

/**
 * Initialize BookAgent with project defaults
 *
 * REUSABLE: Main entry point for creating the BookAgent
 *
 * @param {Object} clients - API clients (openRouter, embedding, qdrant)
 * @param {Object} customOptions - Custom configuration overrides
 * @returns {BookAgent} Fully initialized BookAgent
 */
export function initializeBookAgent({ openRouterClient, embeddingClient, qdrantClient }, customOptions = {}) {
  console.log('🚀 Initializing BookAgent with project configuration...');

  // Create function wrappers
  const llmFunction = createLLMFunction(openRouterClient);
  const embeddingFunction = embeddingClient ? createEmbeddingFunction(embeddingClient) : null;

  // Merge custom options with defaults
  const options = {
    defaultLanguages: customOptions.defaultLanguages || agentConfig.bookAgent.defaultLanguages,
    autoTranslate: customOptions.autoTranslate ?? agentConfig.bookAgent.autoTranslate,
    autoRAG: customOptions.autoRAG ?? agentConfig.bookAgent.autoRAG,
    autoQuiz: customOptions.autoQuiz ?? agentConfig.bookAgent.autoQuiz,
    autoGlossary: customOptions.autoGlossary ?? agentConfig.bookAgent.autoGlossary,

    // Pass subagent configurations
    chapterWriter: { ...agentConfig.chapterWriter, ...customOptions.chapterWriter },
    contentRefiner: { ...agentConfig.contentRefiner, ...customOptions.contentRefiner },
    conceptExplainer: { ...agentConfig.conceptExplainer, ...customOptions.conceptExplainer },
    quizGenerator: { ...agentConfig.quizGenerator, ...customOptions.quizGenerator },
    ragPrep: { ...agentConfig.ragPrep, ...customOptions.ragPrep },
    translator: { ...agentConfig.translator, ...customOptions.translator }
  };

  const bookAgent = new BookAgent({
    llmFunction,
    embeddingFunction,
    vectorDbClient: qdrantClient,
    options
  });

  console.log('✅ BookAgent initialized successfully');

  return bookAgent;
}

/**
 * Initialize individual ChapterWriterSubagent
 *
 * REUSABLE: For when you only need chapter generation
 */
export function initializeChapterWriter({ openRouterClient, embeddingClient }, customOptions = {}) {
  const llmFunction = createLLMFunction(openRouterClient);
  const embeddingFunction = embeddingClient ? createEmbeddingFunction(embeddingClient) : null;

  return new ChapterWriterSubagent({
    llmFunction,
    embeddingFunction,
    options: { ...agentConfig.chapterWriter, ...customOptions }
  });
}

/**
 * Initialize individual ContentRefinerSubagent
 *
 * REUSABLE: For content refinement only
 */
export function initializeContentRefiner({ openRouterClient }, customOptions = {}) {
  const llmFunction = createLLMFunction(openRouterClient);

  return new ContentRefinerSubagent({
    llmFunction,
    options: { ...agentConfig.contentRefiner, ...customOptions }
  });
}

/**
 * Initialize individual ConceptExplainerSubagent
 *
 * REUSABLE: For explanations and glossaries only
 */
export function initializeConceptExplainer({ openRouterClient }, customOptions = {}) {
  const llmFunction = createLLMFunction(openRouterClient);

  return new ConceptExplainerSubagent({
    llmFunction,
    options: { ...agentConfig.conceptExplainer, ...customOptions }
  });
}

/**
 * Initialize individual QuizGeneratorSubagent
 *
 * REUSABLE: For quiz generation only
 */
export function initializeQuizGenerator({ openRouterClient }, customOptions = {}) {
  const llmFunction = createLLMFunction(openRouterClient);

  return new QuizGeneratorSubagent({
    llmFunction,
    options: { ...agentConfig.quizGenerator, ...customOptions }
  });
}

/**
 * Initialize individual RAGPrepSubagent
 *
 * REUSABLE: For RAG preparation only
 */
export function initializeRAGPrep({ embeddingClient, qdrantClient }, customOptions = {}) {
  const embeddingFunction = createEmbeddingFunction(embeddingClient);

  return new RAGPrepSubagent({
    embeddingFunction,
    vectorDbClient: qdrantClient,
    options: { ...agentConfig.ragPrep, ...customOptions }
  });
}

/**
 * Initialize individual TranslationSubagent
 *
 * REUSABLE: For translation only
 */
export function initializeTranslator({ openRouterClient }, customOptions = {}) {
  const llmFunction = createLLMFunction(openRouterClient);

  return new TranslationSubagent({
    llmFunction,
    options: { ...agentConfig.translator, ...customOptions }
  });
}

/**
 * Initialize agents from Express backend
 *
 * REUSABLE: Integration point for backend API routes
 *
 * Usage in backend:
 * ```javascript
 * import { initializeFromBackend } from './agents/utils/initializeAgents.js';
 * import { openRouterClient, embeddingClient, qdrantClient } from './utils/clients.js';
 *
 * const agents = initializeFromBackend({
 *   openRouterClient,
 *   embeddingClient,
 *   qdrantClient
 * });
 *
 * // Use in routes
 * app.post('/api/agents/generate-chapter', async (req, res) => {
 *   const result = await agents.bookAgent.generateCompleteChapter(req.body);
 *   res.json(result);
 * });
 * ```
 */
export function initializeFromBackend({ openRouterClient, embeddingClient, qdrantClient }, customOptions = {}) {
  console.log('🔧 Initializing agents for backend integration...');

  const bookAgent = initializeBookAgent(
    { openRouterClient, embeddingClient, qdrantClient },
    customOptions
  );

  // Return all agents for flexible backend usage
  return {
    bookAgent,
    chapterWriter: bookAgent.chapterWriter,
    contentRefiner: bookAgent.contentRefiner,
    conceptExplainer: bookAgent.conceptExplainer,
    quizGenerator: bookAgent.quizGenerator,
    ragPrep: bookAgent.ragPrep,
    translator: bookAgent.translator
  };
}

/**
 * Create mock LLM function for testing
 *
 * REUSABLE: Test agents without real API calls
 */
export function createMockLLMFunction() {
  return async (messages, options = {}) => {
    console.log('[MOCK LLM] Called with messages:', messages.length);
    return 'Mock LLM response for testing';
  };
}

/**
 * Create mock embedding function for testing
 *
 * REUSABLE: Test RAG preparation without real embeddings
 */
export function createMockEmbeddingFunction() {
  return async (text) => {
    console.log('[MOCK EMBEDDING] Called with text length:', text.length);
    // Return mock embedding of correct dimensions
    return Array(agentConfig.embeddings.dimensions).fill(0).map(() => Math.random());
  };
}

/**
 * Initialize agents for testing
 *
 * REUSABLE: Create agents with mock functions for unit tests
 */
export function initializeForTesting(customOptions = {}) {
  console.log('🧪 Initializing agents for testing...');

  const mockClients = {
    openRouterClient: { chat: { completions: { create: () => {} } } },
    embeddingClient: { embeddings: { create: () => {} } },
    qdrantClient: null
  };

  // Override with mock functions
  const llmFunction = createMockLLMFunction();
  const embeddingFunction = createMockEmbeddingFunction();

  const options = {
    ...agentConfig.bookAgent,
    ...customOptions,
    chapterWriter: { ...agentConfig.chapterWriter, ...customOptions.chapterWriter },
    contentRefiner: { ...agentConfig.contentRefiner, ...customOptions.contentRefiner },
    conceptExplainer: { ...agentConfig.conceptExplainer, ...customOptions.conceptExplainer },
    quizGenerator: { ...agentConfig.quizGenerator, ...customOptions.quizGenerator },
    ragPrep: { ...agentConfig.ragPrep, autoUpload: false, ...customOptions.ragPrep },
    translator: { ...agentConfig.translator, ...customOptions.translator }
  };

  const bookAgent = new BookAgent({
    llmFunction,
    embeddingFunction,
    vectorDbClient: null,
    options
  });

  return {
    bookAgent,
    chapterWriter: bookAgent.chapterWriter,
    contentRefiner: bookAgent.contentRefiner,
    conceptExplainer: bookAgent.conceptExplainer,
    quizGenerator: bookAgent.quizGenerator,
    ragPrep: bookAgent.ragPrep,
    translator: bookAgent.translator
  };
}

export default {
  createLLMFunction,
  createEmbeddingFunction,
  initializeBookAgent,
  initializeChapterWriter,
  initializeContentRefiner,
  initializeConceptExplainer,
  initializeQuizGenerator,
  initializeRAGPrep,
  initializeTranslator,
  initializeFromBackend,
  createMockLLMFunction,
  createMockEmbeddingFunction,
  initializeForTesting
};
