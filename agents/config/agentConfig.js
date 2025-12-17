/**
 * AGENT CONFIGURATION
 *
 * Central configuration for all agents and subagents.
 * Defines default settings, model parameters, and feature flags.
 *
 * REUSABILITY: Single source of truth for agent behavior across the project.
 */

export const agentConfig = {
  // LLM Configuration
  llm: {
    provider: 'openrouter',
    model: 'google/gemini-2.0-flash-exp:free',
    defaultTemperature: 0.7,
    defaultMaxTokens: 4000,

    // Model-specific temperatures for different tasks
    temperatures: {
      creative: 0.8,     // Chapter writing, explanations
      balanced: 0.7,     // General content generation
      precise: 0.4,      // Refinement, translation
      deterministic: 0.2 // Technical accuracy, code generation
    }
  },

  // Embedding Configuration
  embeddings: {
    provider: 'openrouter',
    model: 'text-embedding-3-small',
    dimensions: 1536
  },

  // Vector Database Configuration
  vectorDb: {
    provider: 'qdrant',
    collectionName: 'book_content',
    autoUpload: false // Set to true to auto-upload RAG chunks
  },

  // BookAgent Configuration
  bookAgent: {
    defaultLanguages: ['en'],
    autoTranslate: false,
    autoRAG: true,
    autoQuiz: true,
    autoGlossary: false
  },

  // ChapterWriterSubagent Configuration
  chapterWriter: {
    defaultTargetAudience: 'intermediate',
    defaultWordCount: 2000,
    defaultStyle: 'tutorial',
    autoRefine: true,
    includeQuiz: true,
    prepareRAG: true,

    // Target audiences and their characteristics
    audiences: {
      eli5: {
        wordCount: 800,
        style: 'simple',
        includeAnalogies: true
      },
      beginner: {
        wordCount: 1500,
        style: 'explanatory',
        includeExamples: true
      },
      intermediate: {
        wordCount: 2000,
        style: 'tutorial',
        includeCode: true
      },
      advanced: {
        wordCount: 2500,
        style: 'technical',
        includeAdvancedTopics: true
      },
      expert: {
        wordCount: 3000,
        style: 'research',
        includeReferences: true
      }
    }
  },

  // ContentRefinerSubagent Configuration
  contentRefiner: {
    defaultImprovements: ['clarity', 'grammar', 'structure'],
    defaultIterations: 1,

    // Available improvement types
    improvementTypes: [
      'clarity',        // Make content clearer
      'grammar',        // Fix grammar and spelling
      'structure',      // Improve organization
      'examples',       // Add more examples
      'conciseness',    // Make more concise
      'technical',      // Improve technical accuracy
      'engagement',     // Make more engaging
      'accessibility'   // Improve accessibility
    ]
  },

  // ConceptExplainerSubagent Configuration
  conceptExplainer: {
    defaultLevel: 'intermediate',
    defaultContext: 'robotics and AI',
    includeAnalogy: true,
    includeCode: true,
    includeVisual: false,

    // Explanation levels
    levels: ['eli5', 'beginner', 'intermediate', 'advanced', 'expert']
  },

  // QuizGeneratorSubagent Configuration
  quizGenerator: {
    defaultQuestionCount: 5,
    defaultDifficulty: 'medium',
    defaultQuestionTypes: ['mcq', 'true-false'],
    includeExplanations: true,

    // Available question types
    questionTypes: ['mcq', 'true-false', 'short-answer', 'code', 'fill-blank'],

    // Difficulty settings
    difficulties: {
      easy: {
        questionCount: 3,
        questionTypes: ['mcq', 'true-false']
      },
      medium: {
        questionCount: 5,
        questionTypes: ['mcq', 'true-false', 'short-answer']
      },
      hard: {
        questionCount: 7,
        questionTypes: ['mcq', 'true-false', 'short-answer', 'code']
      }
    }
  },

  // RAGPrepSubagent Configuration
  ragPrep: {
    chunkSize: 300,           // Words per chunk
    chunkOverlap: 50,         // Overlap between chunks
    collectionName: 'book_content',
    autoUpload: false,

    // Quality thresholds
    quality: {
      minChunkSize: 100,      // Minimum acceptable chunk size
      maxChunkSize: 500,      // Maximum chunk size
      optimalRange: {
        min: 250,             // Optimal minimum
        max: 350              // Optimal maximum
      }
    }
  },

  // TranslationSubagent Configuration
  translator: {
    defaultSourceLanguage: 'auto',
    defaultStyle: 'natural',
    preserveFormatting: true,
    preserveCodeBlocks: true,

    // Available translation styles
    styles: {
      literal: 'Word-for-word translation',
      natural: 'Natural, fluent translation',
      technical: 'Technical, precise translation'
    },

    // Supported languages
    supportedLanguages: {
      en: 'English',
      ur: 'Urdu',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
      ja: 'Japanese',
      ar: 'Arabic',
      pt: 'Portuguese',
      ru: 'Russian'
    },

    // Technical term glossaries (can be extended)
    glossary: {
      en: {},
      ur: {
        'ROS2': 'ROS2',
        'URDF': 'URDF',
        'Gazebo': 'Gazebo',
        'Isaac Sim': 'Isaac Sim',
        'Nav2': 'Nav2'
      },
      es: {
        'ROS2': 'ROS2',
        'URDF': 'URDF',
        'Gazebo': 'Gazebo'
      }
    }
  },

  // Rate Limiting Configuration
  rateLimiting: {
    enableDelays: true,
    delayBetweenChapters: 2000,    // ms
    delayBetweenQuizzes: 1000,      // ms
    delayBetweenTranslations: 1000, // ms
    delayBetweenEmbeddings: 500,    // ms
    delayBetweenConcepts: 300       // ms
  },

  // Batch Processing Configuration
  batchProcessing: {
    maxConcurrentChapters: 1,      // Process chapters sequentially
    maxConcurrentTranslations: 3,   // Allow 3 parallel translations
    maxConcurrentEmbeddings: 5,     // Allow 5 parallel embeddings
    enableProgressLogging: true
  },

  // Error Handling Configuration
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,             // ms
    continueOnError: true,         // Continue batch operations if one item fails
    logErrors: true
  },

  // Book Structure Configuration
  bookStructure: {
    totalChapters: 21,
    capstoneChapters: 1,
    tutorialChapters: 16,

    // Chapter categories
    categories: {
      foundations: [1, 2, 3, 4],
      ros2: [5, 6, 7, 8],
      simulation: [9, 10, 11],
      hardware: [12, 13, 14],
      perception: [15, 16],
      navigation: [17, 18],
      manipulation: [19, 20],
      integration: [21]
    }
  }
};

/**
 * Get configuration for specific agent
 *
 * REUSABLE: Retrieve agent-specific configuration
 */
export function getAgentConfig(agentName) {
  const configs = {
    bookAgent: agentConfig.bookAgent,
    chapterWriter: agentConfig.chapterWriter,
    contentRefiner: agentConfig.contentRefiner,
    conceptExplainer: agentConfig.conceptExplainer,
    quizGenerator: agentConfig.quizGenerator,
    ragPrep: agentConfig.ragPrep,
    translator: agentConfig.translator
  };

  return configs[agentName] || {};
}

/**
 * Get LLM parameters for specific task type
 *
 * REUSABLE: Consistent LLM parameters across agents
 */
export function getLLMParams(taskType = 'balanced') {
  const temperatureMap = {
    creative: agentConfig.llm.temperatures.creative,
    balanced: agentConfig.llm.temperatures.balanced,
    precise: agentConfig.llm.temperatures.precise,
    deterministic: agentConfig.llm.temperatures.deterministic
  };

  return {
    model: agentConfig.llm.model,
    temperature: temperatureMap[taskType] || agentConfig.llm.defaultTemperature,
    maxTokens: agentConfig.llm.defaultMaxTokens
  };
}

/**
 * Update configuration dynamically
 *
 * REUSABLE: Modify configuration at runtime
 */
export function updateConfig(path, value) {
  const keys = path.split('.');
  let current = agentConfig;

  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

export default agentConfig;
