/**
 * SUBAGENT: ContentRefinerSubagent
 *
 * Reusable subagent for improving existing content quality.
 * Can refine individual chapters, sections, or entire books.
 *
 * REUSABILITY: Works with any text content, not just book chapters.
 */

import { refine_content } from '../skills/refine_content.js';
import { explain_concept } from '../skills/explain_concept.js';

export class ContentRefinerSubagent {
  /**
   * @param {Object} config - Subagent configuration
   * @param {Function} config.llmFunction - LLM API function
   * @param {Object} config.options - Default options
   */
  constructor({ llmFunction, options = {} }) {
    if (!llmFunction) {
      throw new Error('ContentRefinerSubagent: llmFunction is required');
    }

    this.llmFunction = llmFunction;
    this.options = {
      defaultImprovements: options.defaultImprovements || ['clarity', 'grammar', 'structure'],
      targetAudience: options.targetAudience || 'intermediate',
      iterations: options.iterations || 1, // Number of refinement passes
      ...options
    };

    console.log('ContentRefinerSubagent initialized');
  }

  /**
   * Refine content with optional multiple passes
   *
   * REUSABLE: Can refine any text content (chapters, sections, explanations)
   *
   * @param {Object} params - Refinement parameters
   * @returns {Promise<Object>} Refined content with improvement report
   */
  async refineContent({ content, improvements, focusArea, iterations }) {
    const improvementTypes = improvements || this.options.defaultImprovements;
    const passCount = iterations || this.options.iterations;

    console.log(`\n✨ ContentRefinerSubagent: Refining content (${passCount} pass${passCount > 1 ? 'es' : ''})...`);

    let currentContent = content;
    const refinementHistory = [];

    // Perform multiple refinement passes if requested
    for (let i = 0; i < passCount; i++) {
      console.log(`  Pass ${i + 1}/${passCount}: Applying ${improvementTypes.join(', ')}...`);

      try {
        const result = await refine_content({
          content: currentContent,
          improvements: improvementTypes,
          targetAudience: this.options.targetAudience,
          focusArea,
          llmFunction: this.llmFunction
        });

        refinementHistory.push({
          pass: i + 1,
          improvements: improvementTypes,
          changePercentage: result.metadata.changePercentage,
          wordCountChange: result.metadata.refinedWordCount - result.metadata.originalWordCount
        });

        currentContent = result.refinedContent;

        // Small delay between passes to avoid rate limiting
        if (i < passCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`Refinement pass ${i + 1} failed:`, error);
        throw error;
      }
    }

    console.log(`✅ Content refinement complete`);

    return {
      success: true,
      originalContent: content,
      refinedContent: currentContent,
      refinementHistory,
      metadata: {
        totalPasses: passCount,
        totalWordCountChange: currentContent.split(/\s+/).length - content.split(/\s+/).length,
        improvementsApplied: improvementTypes,
        refinedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Enhance content with concept explanations
   *
   * REUSABLE: Adds glossary-style explanations for technical terms
   */
  async enhanceWithExplanations({ content, concepts, level = 'intermediate' }) {
    console.log(`\n📚 ContentRefinerSubagent: Enhancing with ${concepts.length} concept explanations...`);

    const explanations = {};

    for (const concept of concepts) {
      try {
        const result = await explain_concept({
          concept,
          context: 'robotics and AI',
          level,
          includeAnalogy: level === 'beginner',
          includeCode: level !== 'eli5',
          llmFunction: this.llmFunction
        });

        explanations[concept] = result.explanation;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Failed to explain concept "${concept}":`, error);
        explanations[concept] = `[Explanation not available]`;
      }
    }

    // Append glossary section to content
    const glossary = `\n\n## Glossary\n\n${Object.entries(explanations)
      .map(([concept, explanation]) => `### ${concept}\n\n${explanation}`)
      .join('\n\n')}`;

    const enhancedContent = content + glossary;

    console.log(`✅ Content enhanced with explanations`);

    return {
      success: true,
      enhancedContent,
      explanations,
      metadata: {
        conceptsExplained: concepts.length,
        level,
        enhancedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Batch refine multiple content pieces
   *
   * REUSABLE: Can refine all chapters in a book or specific sections
   */
  async refineBatch(contentList) {
    console.log(`\n📦 ContentRefinerSubagent: Batch refining ${contentList.length} items...`);

    const results = [];

    for (const item of contentList) {
      try {
        const result = await this.refineContent({
          content: item.content,
          improvements: item.improvements,
          focusArea: item.focusArea,
          iterations: item.iterations
        });

        results.push({
          success: true,
          id: item.id || `item_${results.length + 1}`,
          ...result
        });

        // Delay between items
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to refine item ${item.id}:`, error);
        results.push({
          success: false,
          id: item.id,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Batch refinement complete: ${successCount}/${contentList.length} items refined`);

    return {
      success: true,
      results,
      summary: {
        total: contentList.length,
        successful: successCount,
        failed: contentList.length - successCount
      }
    };
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. CONTENT-AGNOSTIC:
 *    - Works with any text: chapters, blog posts, documentation, etc.
 *    - Not limited to book content
 *
 * 2. FLEXIBLE IMPROVEMENTS:
 *    - Configurable improvement types (clarity, grammar, structure, etc.)
 *    - Can focus on specific areas (e.g., "technical accuracy")
 *
 * 3. ITERATIVE REFINEMENT:
 *    - Supports multiple passes for progressive improvement
 *    - Tracks refinement history for quality metrics
 *
 * 4. CONCEPT ENHANCEMENT:
 *    - Can automatically add glossary sections
 *    - Uses explain_concept skill for consistent explanations
 *
 * 5. BATCH OPERATIONS:
 *    - Efficient for refining entire books or large documentation sets
 *    - Handles rate limiting automatically
 *
 * 6. USAGE EXAMPLES:
 *    ```javascript
 *    const refiner = new ContentRefinerSubagent({
 *      llmFunction: callOpenRouterCompletion,
 *      options: { iterations: 2 }
 *    });
 *
 *    // Refine single chapter
 *    const refined = await refiner.refineContent({
 *      content: chapterText,
 *      improvements: ['clarity', 'examples'],
 *      focusArea: 'code examples'
 *    });
 *
 *    // Add explanations
 *    const enhanced = await refiner.enhanceWithExplanations({
 *      content: chapterText,
 *      concepts: ['ROS2', 'URDF', 'Gazebo'],
 *      level: 'beginner'
 *    });
 *    ```
 */
