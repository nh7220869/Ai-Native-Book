/**
 * MAIN AGENT: BookAgent
 *
 * Orchestrates all subagents to provide comprehensive book generation,
 * translation, refinement, and educational content workflows.
 *
 * COORDINATES:
 * - ChapterWriterSubagent: Generate chapters
 * - ContentRefinerSubagent: Refine content quality
 * - ConceptExplainerSubagent: Generate glossaries and explanations
 * - QuizGeneratorSubagent: Create assessments
 * - RAGPrepSubagent: Prepare content for RAG chatbot
 * - TranslationSubagent: Multi-language support
 */

import { ChapterWriterSubagent } from './subagents/ChapterWriterSubagent.js';
import { ContentRefinerSubagent } from './subagents/ContentRefinerSubagent.js';
import { ConceptExplainerSubagent } from './subagents/ConceptExplainerSubagent.js';
import { QuizGeneratorSubagent } from './subagents/QuizGeneratorSubagent.js';
import { RAGPrepSubagent } from './subagents/RAGPrepSubagent.js';
import { TranslationSubagent } from './subagents/TranslationSubagent.js';

export class BookAgent {
  /**
   * @param {Object} config - Main agent configuration
   * @param {Function} config.llmFunction - LLM API function for text generation
   * @param {Function} config.embeddingFunction - Embedding API function for RAG
   * @param {Object} config.vectorDbClient - Vector database client (optional)
   * @param {Object} config.options - Configuration options for subagents
   */
  constructor({ llmFunction, embeddingFunction, vectorDbClient = null, options = {} }) {
    if (!llmFunction) {
      throw new Error('BookAgent: llmFunction is required');
    }

    this.llmFunction = llmFunction;
    this.embeddingFunction = embeddingFunction;
    this.vectorDbClient = vectorDbClient;

    // Initialize all subagents
    console.log('📚 BookAgent: Initializing subagents...');

    this.chapterWriter = new ChapterWriterSubagent({
      llmFunction,
      embeddingFunction,
      options: options.chapterWriter || {}
    });

    this.contentRefiner = new ContentRefinerSubagent({
      llmFunction,
      options: options.contentRefiner || {}
    });

    this.conceptExplainer = new ConceptExplainerSubagent({
      llmFunction,
      options: options.conceptExplainer || {}
    });

    this.quizGenerator = new QuizGeneratorSubagent({
      llmFunction,
      options: options.quizGenerator || {}
    });

    this.ragPrep = new RAGPrepSubagent({
      embeddingFunction,
      vectorDbClient,
      options: options.ragPrep || {}
    });

    this.translator = new TranslationSubagent({
      llmFunction,
      options: options.translator || {}
    });

    this.options = {
      defaultLanguages: options.defaultLanguages || ['en'],
      autoTranslate: options.autoTranslate ?? false,
      autoRAG: options.autoRAG ?? true,
      autoQuiz: options.autoQuiz ?? true,
      autoGlossary: options.autoGlossary ?? false,
      ...options
    };

    console.log('✅ BookAgent initialized with all subagents');
  }

  /**
   * WORKFLOW 1: Generate Complete Chapter
   * Coordinates chapter writing, refinement, quiz, and RAG preparation
   *
   * REUSABLE: Single entry point for complete chapter generation
   */
  async generateCompleteChapter({ chapterNumber, title, topics, options = {} }) {
    console.log(`\n📖 BookAgent: Generating complete Chapter ${chapterNumber}: "${title}"`);

    const includeQuiz = options.includeQuiz ?? this.options.autoQuiz;
    const includeRAG = options.includeRAG ?? this.options.autoRAG;
    const includeGlossary = options.includeGlossary ?? this.options.autoGlossary;
    const targetLanguages = options.targetLanguages || this.options.defaultLanguages;

    try {
      // Step 1: Generate chapter using ChapterWriterSubagent
      const chapterResult = await this.chapterWriter.generateChapter({
        chapterNumber,
        title,
        topics,
        targetAudience: options.targetAudience,
        wordCount: options.wordCount,
        style: options.style,
        includeQuiz,
        includeRAG
      });

      const result = {
        success: true,
        chapterNumber,
        title,
        content: chapterResult.chapter,
        quiz: chapterResult.quiz,
        ragContext: chapterResult.ragContext,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      };

      // Step 2: Generate glossary if requested
      if (includeGlossary && topics && topics.length > 0) {
        console.log('  📖 Generating glossary...');
        const glossaryResult = await this.conceptExplainer.generateGlossary({
          concepts: topics.slice(0, 10), // Limit to 10 key concepts
          level: options.targetAudience || 'intermediate'
        });
        result.glossary = glossaryResult.glossary;
      }

      // Step 3: Translate if multi-language enabled
      if (this.options.autoTranslate && targetLanguages.length > 1) {
        console.log(`  🌐 Translating to ${targetLanguages.length - 1} language(s)...`);
        const translationResult = await this.translator.translateChapterMultiLanguage({
          content: chapterResult.chapter,
          chapterTitle: title,
          chapterNumber,
          targetLanguages: targetLanguages.filter(lang => lang !== 'en')
        });
        result.translations = translationResult.translations;
      }

      console.log(`✅ BookAgent: Chapter ${chapterNumber} generation complete`);

      return result;

    } catch (error) {
      console.error(`BookAgent: Failed to generate Chapter ${chapterNumber}:`, error);
      throw error;
    }
  }

  /**
   * WORKFLOW 2: Generate Complete Book
   * Batch process all chapters with full pipeline
   *
   * REUSABLE: Entire book generation in one call
   */
  async generateCompleteBook({ chapters, options = {} }) {
    console.log(`\n📚 BookAgent: Generating complete book with ${chapters.length} chapters`);

    const results = [];

    for (const chapterSpec of chapters) {
      try {
        const chapterResult = await this.generateCompleteChapter({
          chapterNumber: chapterSpec.chapterNumber,
          title: chapterSpec.title,
          topics: chapterSpec.topics,
          options: {
            ...options,
            targetAudience: chapterSpec.targetAudience || options.targetAudience,
            wordCount: chapterSpec.wordCount || options.wordCount
          }
        });

        results.push(chapterResult);

        console.log(`  [${results.length}/${chapters.length}] Chapter ${chapterSpec.chapterNumber} complete`);

        // Delay between chapters to avoid rate limiting
        if (results.length < chapters.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`Failed to generate chapter ${chapterSpec.chapterNumber}:`, error);
        results.push({
          success: false,
          chapterNumber: chapterSpec.chapterNumber,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`\n✅ BookAgent: Book generation complete (${successCount}/${chapters.length} chapters)`);

    return {
      success: true,
      results,
      summary: {
        totalChapters: chapters.length,
        successfulChapters: successCount,
        failedChapters: chapters.length - successCount,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * WORKFLOW 3: Refine Existing Book
   * Improve quality of already-written chapters
   *
   * REUSABLE: Batch refinement pipeline
   */
  async refineBook({ chapters, improvements = ['clarity', 'structure', 'examples'], iterations = 1 }) {
    console.log(`\n✨ BookAgent: Refining ${chapters.length} chapters (${iterations} pass${iterations > 1 ? 'es' : ''})`);

    const contentList = chapters.map(ch => ({
      id: ch.chapterNumber,
      content: ch.content,
      improvements,
      iterations
    }));

    const result = await this.contentRefiner.refineBatch(contentList);

    console.log(`✅ BookAgent: Book refinement complete`);

    return result;
  }

  /**
   * WORKFLOW 4: Translate Entire Book
   * Multi-language translation for all chapters
   *
   * REUSABLE: Batch translation pipeline
   */
  async translateBook({ chapters, targetLanguages, glossary = {} }) {
    console.log(`\n🌍 BookAgent: Translating ${chapters.length} chapters to ${targetLanguages.length} language(s)`);

    // Set up glossary if provided
    if (Object.keys(glossary).length > 0) {
      this.translator.options.glossary = glossary;
    }

    const result = await this.translator.translateBookBatch({
      chapters,
      targetLanguages
    });

    console.log(`✅ BookAgent: Book translation complete`);

    return result;
  }

  /**
   * WORKFLOW 5: Prepare Book for RAG Chatbot
   * Process all chapters for vector database
   *
   * REUSABLE: Batch RAG preparation and upload
   */
  async prepareBookForRAG({ chapters, uploadToDb = true }) {
    console.log(`\n🔍 BookAgent: Preparing ${chapters.length} chapters for RAG`);

    // Temporarily set autoUpload option
    const originalAutoUpload = this.ragPrep.options.autoUpload;
    this.ragPrep.options.autoUpload = uploadToDb;

    try {
      const result = await this.ragPrep.prepareBookBatch(chapters);

      // Analyze chunk quality
      if (result.success && result.results.length > 0) {
        const allChunks = result.results
          .filter(r => r.success)
          .flatMap(r => r.chunks);

        const qualityAnalysis = await this.ragPrep.analyzeChunkQuality(allChunks);
        result.qualityAnalysis = qualityAnalysis;
      }

      console.log(`✅ BookAgent: RAG preparation complete`);

      return result;

    } finally {
      // Restore original setting
      this.ragPrep.options.autoUpload = originalAutoUpload;
    }
  }

  /**
   * WORKFLOW 6: Generate Comprehensive Educational Package
   * Creates chapter + quiz + glossary + adaptive explanations
   *
   * REUSABLE: Complete educational content generation
   */
  async generateEducationalPackage({ chapterNumber, title, topics, targetAudience = 'intermediate' }) {
    console.log(`\n🎓 BookAgent: Generating educational package for Chapter ${chapterNumber}`);

    // Step 1: Generate chapter
    const chapterResult = await this.chapterWriter.generateChapter({
      chapterNumber,
      title,
      topics,
      targetAudience,
      includeQuiz: false // We'll create a more comprehensive quiz
    });

    // Step 2: Generate comprehensive quiz (multiple difficulty levels)
    const progressiveQuiz = await this.quizGenerator.generateProgressiveQuizzes({
      content: chapterResult.chapter,
      difficulties: ['easy', 'medium', 'hard']
    });

    // Step 3: Generate glossary with adaptive explanations
    const glossary = await this.conceptExplainer.generateGlossary({
      concepts: topics,
      level: targetAudience
    });

    // Step 4: Generate FAQ
    const faq = await this.conceptExplainer.generateFAQ({
      concepts: topics.slice(0, 5),
      level: 'beginner'
    });

    // Step 5: Create topic-specific mini quizzes
    const topicQuizzes = await this.quizGenerator.generateTopicQuizzes({
      content: chapterResult.chapter,
      topics: topics.slice(0, 5),
      questionsPerTopic: 2
    });

    console.log(`✅ BookAgent: Educational package complete`);

    return {
      success: true,
      chapterNumber,
      title,
      content: chapterResult.chapter,
      progressiveQuiz,
      glossary: glossary.glossary,
      faq: faq.faq,
      topicQuizzes: topicQuizzes.topicQuizzes,
      metadata: {
        targetAudience,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * WORKFLOW 7: Update Existing Chapter
   * Refine, add explanations, regenerate quiz, update RAG
   *
   * REUSABLE: Complete chapter update pipeline
   */
  async updateChapter({ chapterNumber, title, content, updateOptions = {} }) {
    console.log(`\n🔄 BookAgent: Updating Chapter ${chapterNumber}`);

    const result = {
      success: true,
      chapterNumber,
      title,
      updatedContent: content
    };

    // Step 1: Refine content if requested
    if (updateOptions.refine) {
      console.log('  ✨ Refining content...');
      const refined = await this.contentRefiner.refineContent({
        content,
        improvements: updateOptions.improvements || ['clarity', 'examples'],
        iterations: updateOptions.iterations || 1
      });
      result.updatedContent = refined.refinedContent;
      result.refinementReport = refined.refinementHistory;
    }

    // Step 2: Add/update glossary if requested
    if (updateOptions.addGlossary && updateOptions.concepts) {
      console.log('  📖 Adding glossary...');
      const enhanced = await this.contentRefiner.enhanceWithExplanations({
        content: result.updatedContent,
        concepts: updateOptions.concepts,
        level: updateOptions.targetAudience || 'intermediate'
      });
      result.updatedContent = enhanced.enhancedContent;
      result.glossary = enhanced.explanations;
    }

    // Step 3: Regenerate quiz if requested
    if (updateOptions.regenerateQuiz) {
      console.log('  📝 Regenerating quiz...');
      const quiz = await this.quizGenerator.generateQuiz({
        content: result.updatedContent,
        questionCount: updateOptions.quizQuestions || 5,
        difficulty: updateOptions.quizDifficulty || 'medium'
      });
      result.quiz = quiz.quiz;
    }

    // Step 4: Update RAG context if requested
    if (updateOptions.updateRAG) {
      console.log('  🔍 Updating RAG context...');
      const ragContext = await this.ragPrep.prepareChapter({
        content: result.updatedContent,
        chapterTitle: title,
        chapterNumber
      });
      result.ragContext = ragContext;
    }

    console.log(`✅ BookAgent: Chapter ${chapterNumber} update complete`);

    return result;
  }

  /**
   * WORKFLOW 8: Generate Multi-Language Educational Content
   * Creates chapter in multiple languages with localized quizzes
   *
   * REUSABLE: Multi-language educational content pipeline
   */
  async generateMultiLanguageEducation({ chapterNumber, title, topics, targetLanguages }) {
    console.log(`\n🌐 BookAgent: Generating multi-language education for Chapter ${chapterNumber}`);

    // Step 1: Generate English chapter
    const enChapter = await this.chapterWriter.generateChapter({
      chapterNumber,
      title,
      topics,
      includeQuiz: true
    });

    // Step 2: Translate to target languages
    const translations = await this.translator.translateChapterMultiLanguage({
      content: enChapter.chapter,
      chapterTitle: title,
      chapterNumber,
      targetLanguages: targetLanguages.filter(lang => lang !== 'en')
    });

    // Step 3: Create glossary for each language
    const multiLangGlossary = {};
    for (const lang of targetLanguages) {
      if (lang === 'en') {
        const enGlossary = await this.conceptExplainer.generateGlossary({
          concepts: topics,
          level: 'intermediate'
        });
        multiLangGlossary.en = enGlossary.glossary;
      } else {
        const translatedGlossary = await this.translator.createTranslatedGlossary({
          terms: topics,
          targetLanguage: lang
        });
        multiLangGlossary[lang] = translatedGlossary.glossary;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ BookAgent: Multi-language education complete`);

    return {
      success: true,
      chapterNumber,
      title,
      content: {
        en: enChapter.chapter,
        ...Object.fromEntries(
          Object.entries(translations.translations).map(([lang, data]) => [lang, data.content])
        )
      },
      quiz: enChapter.quiz,
      glossary: multiLangGlossary,
      metadata: {
        languages: targetLanguages,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * UTILITY: Get Agent Status
   * Returns information about all initialized subagents
   *
   * REUSABLE: Health check and configuration info
   */
  getStatus() {
    return {
      initialized: true,
      subagents: {
        chapterWriter: !!this.chapterWriter,
        contentRefiner: !!this.contentRefiner,
        conceptExplainer: !!this.conceptExplainer,
        quizGenerator: !!this.quizGenerator,
        ragPrep: !!this.ragPrep,
        translator: !!this.translator
      },
      configuration: {
        hasLLM: !!this.llmFunction,
        hasEmbedding: !!this.embeddingFunction,
        hasVectorDb: !!this.vectorDbClient,
        autoTranslate: this.options.autoTranslate,
        autoRAG: this.options.autoRAG,
        autoQuiz: this.options.autoQuiz,
        defaultLanguages: this.options.defaultLanguages
      }
    };
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. COMPREHENSIVE ORCHESTRATION:
 *    - BookAgent coordinates all 6 subagents
 *    - Provides 8 high-level workflows for common tasks
 *    - Single entry point for complex multi-step operations
 *
 * 2. WORKFLOWS PROVIDED:
 *    - generateCompleteChapter: Full chapter with quiz, RAG, glossary
 *    - generateCompleteBook: Batch generate entire book
 *    - refineBook: Improve existing chapter quality
 *    - translateBook: Multi-language batch translation
 *    - prepareBookForRAG: Batch RAG preparation and upload
 *    - generateEducationalPackage: Comprehensive learning materials
 *    - updateChapter: Refine and update existing content
 *    - generateMultiLanguageEducation: Localized educational content
 *
 * 3. FLEXIBLE CONFIGURATION:
 *    - Each workflow accepts custom options
 *    - Global defaults can be set at initialization
 *    - Auto-enable features (autoRAG, autoQuiz, autoTranslate)
 *
 * 4. ERROR HANDLING:
 *    - Graceful failure handling in batch operations
 *    - Detailed error reporting
 *    - Partial success support (some chapters succeed, some fail)
 *
 * 5. PROGRESS TRACKING:
 *    - Console logging for all major steps
 *    - Batch operation progress indicators
 *    - Detailed metadata in results
 *
 * 6. INTEGRATION:
 *    - Works with existing OpenRouter LLM
 *    - Compatible with Qdrant vector database
 *    - Fits into current Docusaurus book structure
 *
 * 7. USAGE EXAMPLES:
 *    ```javascript
 *    import { BookAgent } from './agents/BookAgent.js';
 *    import { callOpenRouterCompletion } from './utils/openrouter.js';
 *    import { generateEmbedding } from './utils/embeddings.js';
 *    import { qdrantClient } from './utils/qdrant.js';
 *
 *    const bookAgent = new BookAgent({
 *      llmFunction: callOpenRouterCompletion,
 *      embeddingFunction: generateEmbedding,
 *      vectorDbClient: qdrantClient,
 *      options: {
 *        autoRAG: true,
 *        autoQuiz: true,
 *        defaultLanguages: ['en', 'ur', 'es']
 *      }
 *    });
 *
 *    // Generate single chapter with everything
 *    const chapter = await bookAgent.generateCompleteChapter({
 *      chapterNumber: '1',
 *      title: 'Introduction to ROS2',
 *      topics: ['ROS2 Architecture', 'Nodes', 'Topics', 'Services'],
 *      options: {
 *        targetAudience: 'intermediate',
 *        wordCount: 2000,
 *        includeGlossary: true
 *      }
 *    });
 *
 *    // Generate entire book
 *    const book = await bookAgent.generateCompleteBook({
 *      chapters: [
 *        { chapterNumber: '1', title: 'Intro to ROS2', topics: [...] },
 *        { chapterNumber: '2', title: 'URDF Basics', topics: [...] },
 *        // ... more chapters
 *      ],
 *      options: { targetAudience: 'intermediate' }
 *    });
 *
 *    // Translate existing book
 *    const translated = await bookAgent.translateBook({
 *      chapters: existingChapters,
 *      targetLanguages: ['ur', 'es', 'fr']
 *    });
 *
 *    // Prepare for RAG chatbot
 *    const ragReady = await bookAgent.prepareBookForRAG({
 *      chapters: existingChapters,
 *      uploadToDb: true
 *    });
 *
 *    // Generate educational package
 *    const eduPackage = await bookAgent.generateEducationalPackage({
 *      chapterNumber: '3',
 *      title: 'Gazebo Simulation',
 *      topics: ['Gazebo', 'URDF', 'Sensors', 'Physics'],
 *      targetAudience: 'beginner'
 *    });
 *    ```
 */
