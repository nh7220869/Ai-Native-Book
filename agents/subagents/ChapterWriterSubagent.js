/**
 * SUBAGENT: ChapterWriterSubagent
 *
 * Reusable subagent for generating new book chapters.
 * Uses write_chapter skill and can orchestrate multiple skills for comprehensive chapter creation.
 *
 * REUSABILITY: Can be instantiated for any chapter in any book project.
 */

import { write_chapter } from '../skills/write_chapter.js';
import { refine_content } from '../skills/refine_content.js';
import { generate_quiz } from '../skills/generate_quiz.js';
import { prepare_rag_context } from '../skills/prepare_rag_context.js';

export class ChapterWriterSubagent {
  /**
   * @param {Object} config - Subagent configuration
   * @param {Function} config.llmFunction - LLM API function
   * @param {Function} config.embeddingFunction - Embedding API function
   * @param {Object} config.options - Default options
   */
  constructor({ llmFunction, embeddingFunction, options = {} }) {
    if (!llmFunction) {
      throw new Error('ChapterWriterSubagent: llmFunction is required');
    }

    this.llmFunction = llmFunction;
    this.embeddingFunction = embeddingFunction;
    this.options = {
      autoRefine: options.autoRefine ?? true,       // Auto-refine generated content
      includeQuiz: options.includeQuiz ?? true,     // Include chapter quiz
      prepareRAG: options.prepareRAG ?? true,       // Prepare content for RAG
      targetAudience: options.targetAudience || 'intermediate',
      style: options.style || 'tutorial',
      wordCount: options.wordCount || 2000,
      ...options
    };

    console.log('ChapterWriterSubagent initialized with options:', this.options);
  }

  /**
   * Generate a complete chapter with optional refinement, quiz, and RAG preparation
   *
   * REUSABLE: Can be called for any chapter across any book
   *
   * @param {Object} chapterParams - Chapter parameters
   * @returns {Promise<Object>} Complete chapter package
   */
  async generateChapter(chapterParams) {
    const {
      chapterNumber,
      title,
      topics,
      targetAudience = this.options.targetAudience,
      wordCount = this.options.wordCount,
      style = this.options.style
    } = chapterParams;

    console.log(`\n📝 ChapterWriterSubagent: Generating Chapter ${chapterNumber}: ${title}`);

    try {
      // STEP 1: Generate initial chapter content using write_chapter skill
      console.log('Step 1/4: Generating initial content...');
      const initialChapter = await write_chapter({
        chapterNumber,
        title,
        topics,
        targetAudience,
        wordCount,
        style,
        llmFunction: this.llmFunction
      });

      let finalContent = initialChapter.content;
      let refinedMetadata = null;

      // STEP 2: Optionally refine content using refine_content skill
      if (this.options.autoRefine) {
        console.log('Step 2/4: Refining content...');
        const refined = await refine_content({
          content: finalContent,
          improvements: ['clarity', 'structure', 'examples'],
          targetAudience,
          llmFunction: this.llmFunction
        });
        finalContent = refined.refinedContent;
        refinedMetadata = refined.metadata;
      } else {
        console.log('Step 2/4: Skipping refinement (autoRefine disabled)');
      }

      // STEP 3: Optionally generate quiz using generate_quiz skill
      let quiz = null;
      if (this.options.includeQuiz) {
        console.log('Step 3/4: Generating chapter quiz...');
        quiz = await generate_quiz({
          content: finalContent,
          questionCount: 5,
          questionTypes: ['mcq', 'true-false'],
          difficulty: targetAudience === 'beginner' ? 'easy' : 'medium',
          includeExplanations: true,
          llmFunction: this.llmFunction
        });
      } else {
        console.log('Step 3/4: Skipping quiz generation (includeQuiz disabled)');
      }

      // STEP 4: Optionally prepare for RAG using prepare_rag_context skill
      let ragContext = null;
      if (this.options.prepareRAG && this.embeddingFunction) {
        console.log('Step 4/4: Preparing RAG context...');
        ragContext = await prepare_rag_context({
          content: finalContent,
          chapterTitle: title,
          chapterNumber,
          embeddingFunction: this.embeddingFunction
        });
      } else {
        console.log('Step 4/4: Skipping RAG preparation (prepareRAG disabled or no embedding function)');
      }

      // Return comprehensive chapter package
      console.log(`✅ Chapter ${chapterNumber} generation complete!`);

      return {
        success: true,
        chapter: {
          chapterNumber,
          title,
          content: finalContent,
          metadata: {
            ...initialChapter.metadata,
            refined: this.options.autoRefine,
            refinedMetadata,
            generatedBy: 'ChapterWriterSubagent',
            generatedAt: new Date().toISOString()
          }
        },
        quiz: this.options.includeQuiz ? quiz : null,
        ragContext: this.options.prepareRAG ? ragContext : null
      };

    } catch (error) {
      console.error(`❌ ChapterWriterSubagent error for Chapter ${chapterNumber}:`, error);
      throw new Error(`Failed to generate chapter: ${error.message}`);
    }
  }

  /**
   * Generate multiple chapters in batch
   *
   * REUSABLE: Can process entire book or specific sections
   */
  async generateChaptersBatch(chaptersList) {
    console.log(`\n📚 ChapterWriterSubagent: Batch generating ${chaptersList.length} chapters...`);

    const results = [];

    for (const chapterParams of chaptersList) {
      try {
        const result = await this.generateChapter(chapterParams);
        results.push(result);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to generate chapter ${chapterParams.chapterNumber}:`, error);
        results.push({
          success: false,
          chapterNumber: chapterParams.chapterNumber,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Batch generation complete: ${successCount}/${chaptersList.length} chapters generated successfully`);

    return {
      success: true,
      results,
      summary: {
        total: chaptersList.length,
        successful: successCount,
        failed: chaptersList.length - successCount
      }
    };
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. CROSS-CHAPTER REUSE:
 *    - Same subagent instance can generate all 21 book chapters
 *    - Just call generateChapter() with different parameters
 *
 * 2. CROSS-BOOK REUSE:
 *    - Can be used for completely different book projects
 *    - Configure via options during instantiation
 *
 * 3. SKILL COMPOSITION:
 *    - Orchestrates multiple skills (write, refine, quiz, rag)
 *    - Skills are independent and can be toggled on/off
 *
 * 4. INTEGRATION POINTS:
 *    - Integrates with existing OpenRouter API (llmFunction)
 *    - Integrates with existing Qdrant (embeddingFunction)
 *    - Output format compatible with existing docs/ structure
 *
 * 5. USAGE EXAMPLES:
 *    ```javascript
 *    // Create subagent
 *    const chapterWriter = new ChapterWriterSubagent({
 *      llmFunction: callOpenRouterCompletion,
 *      embeddingFunction: callOpenRouterEmbeddings,
 *      options: { autoRefine: true, includeQuiz: true }
 *    });
 *
 *    // Generate single chapter
 *    const result = await chapterWriter.generateChapter({
 *      chapterNumber: "1",
 *      title: "Introduction to Physical AI",
 *      topics: ["What is Physical AI", "Applications", "Key Concepts"]
 *    });
 *
 *    // Generate multiple chapters
 *    const batch = await chapterWriter.generateChaptersBatch([...]);
 *    ```
 */
