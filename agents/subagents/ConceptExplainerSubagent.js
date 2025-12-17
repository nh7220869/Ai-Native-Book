/**
 * SUBAGENT: ConceptExplainerSubagent
 *
 * Reusable subagent for generating concept explanations at different levels.
 * Can create glossaries, FAQs, and adaptive learning materials.
 *
 * REUSABILITY: Works for any domain, configurable for different audiences.
 */

import { explain_concept } from '../skills/explain_concept.js';

export class ConceptExplainerSubagent {
  /**
   * @param {Object} config - Subagent configuration
   * @param {Function} config.llmFunction - LLM API function
   * @param {Object} config.options - Default options
   */
  constructor({ llmFunction, options = {} }) {
    if (!llmFunction) {
      throw new Error('ConceptExplainerSubagent: llmFunction is required');
    }

    this.llmFunction = llmFunction;
    this.options = {
      defaultLevel: options.defaultLevel || 'intermediate',
      defaultContext: options.defaultContext || 'robotics and AI',
      includeAnalogy: options.includeAnalogy ?? true,
      includeCode: options.includeCode ?? true,
      includeVisual: options.includeVisual ?? false,
      ...options
    };

    console.log('ConceptExplainerSubagent initialized');
  }

  /**
   * Explain a single concept
   *
   * REUSABLE: Can explain any concept for any audience level
   */
  async explainConcept({ concept, level, context, includeAnalogy, includeCode, includeVisual }) {
    console.log(`\n💡 ConceptExplainerSubagent: Explaining "${concept}" at ${level || this.options.defaultLevel} level...`);

    try {
      const result = await explain_concept({
        concept,
        context: context || this.options.defaultContext,
        level: level || this.options.defaultLevel,
        includeAnalogy: includeAnalogy ?? this.options.includeAnalogy,
        includeCode: includeCode ?? this.options.includeCode,
        includeVisual: includeVisual ?? this.options.includeVisual,
        llmFunction: this.llmFunction
      });

      console.log(`✅ Concept "${concept}" explained successfully`);

      return result;

    } catch (error) {
      console.error(`Failed to explain concept "${concept}":`, error);
      throw error;
    }
  }

  /**
   * Generate a comprehensive glossary
   *
   * REUSABLE: Creates glossaries for any list of terms
   */
  async generateGlossary({ concepts, level = this.options.defaultLevel, context = this.options.defaultContext }) {
    console.log(`\n📖 ConceptExplainerSubagent: Generating glossary for ${concepts.length} concepts...`);

    const glossary = {};
    const errors = [];

    for (const concept of concepts) {
      try {
        const result = await this.explainConcept({
          concept,
          level,
          context
        });

        glossary[concept] = {
          explanation: result.explanation,
          metadata: result.metadata
        };

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Failed to explain "${concept}":`, error.message);
        errors.push({ concept, error: error.message });
        glossary[concept] = {
          explanation: '[Explanation unavailable]',
          error: error.message
        };
      }
    }

    console.log(`✅ Glossary generated: ${concepts.length - errors.length}/${concepts.length} successful`);

    return {
      success: true,
      glossary,
      metadata: {
        totalConcepts: concepts.length,
        successfulExplanations: concepts.length - errors.length,
        failedExplanations: errors.length,
        level,
        context,
        errors,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate multi-level explanations for adaptive learning
   *
   * REUSABLE: Creates progressive explanations for adaptive UIs
   */
  async generateAdaptiveExplanations({ concept, levels = ['beginner', 'intermediate', 'advanced'], context }) {
    console.log(`\n🎯 ConceptExplainerSubagent: Generating adaptive explanations for "${concept}"...`);

    const explanations = {};

    for (const level of levels) {
      try {
        const result = await this.explainConcept({
          concept,
          level,
          context: context || this.options.defaultContext
        });

        explanations[level] = result.explanation;

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Failed to generate ${level} explanation:`, error);
        explanations[level] = `[${level} explanation unavailable]`;
      }
    }

    console.log(`✅ Adaptive explanations generated for "${concept}"`);

    return {
      success: true,
      concept,
      explanations,
      levels,
      metadata: {
        levelsGenerated: Object.keys(explanations).length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate FAQ from concept list
   *
   * REUSABLE: Creates FAQ sections for documentation
   */
  async generateFAQ({ concepts, questionFormat = 'What is {concept}?', level = 'beginner' }) {
    console.log(`\n❓ ConceptExplainerSubagent: Generating FAQ for ${concepts.length} concepts...`);

    const faq = [];

    for (const concept of concepts) {
      try {
        const result = await this.explainConcept({
          concept,
          level,
          includeAnalogy: true,
          includeCode: false
        });

        const question = questionFormat.replace('{concept}', concept);

        faq.push({
          question,
          answer: result.explanation,
          concept
        });

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Failed to create FAQ entry for "${concept}":`, error);
      }
    }

    console.log(`✅ FAQ generated with ${faq.length} entries`);

    return {
      success: true,
      faq,
      metadata: {
        totalEntries: faq.length,
        level,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Extract and explain concepts from content automatically
   *
   * REUSABLE: Can analyze any text and create explanations
   */
  async explainConceptsFromContent({ content, maxConcepts = 10, level = this.options.defaultLevel }) {
    console.log(`\n🔍 ConceptExplainerSubagent: Extracting concepts from content...`);

    // Use LLM to extract key concepts
    const extractionPrompt = `Analyze the following content and identify the ${maxConcepts} most important technical concepts that would benefit from explanation.

Return ONLY a JSON array of concept names, no explanations yet.

Example: ["ROS2", "URDF", "Gazebo", "Nav2", "Isaac Sim"]

CONTENT:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

CONCEPTS (JSON array):`;

    try {
      const extractedConceptsStr = await this.llmFunction([
        { role: 'system', content: 'You are an expert at identifying key technical concepts. Return only valid JSON.' },
        { role: 'user', content: extractionPrompt }
      ], { temperature: 0.3, maxTokens: 500 });

      // Parse extracted concepts
      const jsonMatch = extractedConceptsStr.match(/\[.*\]/);
      const concepts = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      console.log(`Found ${concepts.length} concepts to explain`);

      // Generate explanations for extracted concepts
      const glossaryResult = await this.generateGlossary({
        concepts,
        level
      });

      return {
        success: true,
        extractedConcepts: concepts,
        ...glossaryResult
      };

    } catch (error) {
      console.error('Failed to extract and explain concepts:', error);
      throw error;
    }
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. MULTI-LEVEL EXPLANATIONS:
 *    - Can generate explanations for eli5, beginner, intermediate, advanced, expert
 *    - Perfect for adaptive learning systems
 *
 * 2. GLOSSARY GENERATION:
 *    - Auto-generates glossaries for any term list
 *    - Can be used in documentation, books, courses
 *
 * 3. FAQ AUTOMATION:
 *    - Transforms concept lists into FAQ entries
 *    - Customizable question formats
 *
 * 4. CONCEPT EXTRACTION:
 *    - Can analyze content and automatically identify key concepts
 *    - Useful for auto-generating supplementary materials
 *
 * 5. DOMAIN-AGNOSTIC:
 *    - Context parameter makes it adaptable to any field
 *    - Not limited to robotics/AI
 *
 * 6. INTEGRATION:
 *    - Can enhance chatbot responses with explanations
 *    - Can be used in real-time for user queries
 *
 * 7. USAGE EXAMPLES:
 *    ```javascript
 *    const explainer = new ConceptExplainerSubagent({
 *      llmFunction: callOpenRouterCompletion
 *    });
 *
 *    // Single concept
 *    await explainer.explainConcept({ concept: 'ROS2', level: 'beginner' });
 *
 *    // Glossary
 *    await explainer.generateGlossary({ concepts: ['ROS2', 'URDF', 'Gazebo'] });
 *
 *    // Adaptive explanations
 *    await explainer.generateAdaptiveExplanations({ concept: 'Nav2' });
 *
 *    // Auto-extract from content
 *    await explainer.explainConceptsFromContent({ content: chapterText });
 *    ```
 */
