/**
 * SUBAGENT: TranslationSubagent
 *
 * Reusable subagent for multi-language content translation.
 * Handles batch translation, glossary consistency, and quality assurance.
 *
 * REUSABILITY: Works with any content in any language pair.
 */

import { translate_content } from '../skills/translate_content.js';

export class TranslationSubagent {
  /**
   * @param {Object} config - Subagent configuration
   * @param {Function} config.llmFunction - LLM API function
   * @param {Object} config.options - Default options
   */
  constructor({ llmFunction, options = {} }) {
    if (!llmFunction) {
      throw new Error('TranslationSubagent: llmFunction is required');
    }

    this.llmFunction = llmFunction;
    this.options = {
      defaultSourceLanguage: options.defaultSourceLanguage || 'auto',
      defaultStyle: options.defaultStyle || 'natural',
      preserveFormatting: options.preserveFormatting ?? true,
      preserveCodeBlocks: options.preserveCodeBlocks ?? true,
      glossary: options.glossary || {}, // Term translations for consistency
      ...options
    };

    console.log('TranslationSubagent initialized');
  }

  /**
   * Translate single content piece
   *
   * REUSABLE: Works with any text content and target language
   */
  async translateContent({ content, targetLanguage, sourceLanguage, style }) {
    const srcLang = sourceLanguage || this.options.defaultSourceLanguage;
    const transStyle = style || this.options.defaultStyle;

    console.log(`\n🌍 TranslationSubagent: Translating to ${targetLanguage}...`);

    try {
      // Apply glossary terms if available
      let processedContent = content;
      if (Object.keys(this.options.glossary).length > 0) {
        processedContent = this.applyGlossary(content, targetLanguage);
      }

      const result = await translate_content({
        content: processedContent,
        targetLanguage,
        sourceLanguage: srcLang,
        style: transStyle,
        preserveFormatting: this.options.preserveFormatting,
        preserveCodeBlocks: this.options.preserveCodeBlocks,
        llmFunction: this.llmFunction
      });

      console.log(`✅ Translation complete (${result.metadata.expansionRatio}x expansion)`);

      return result;

    } catch (error) {
      console.error(`Translation to ${targetLanguage} failed:`, error);
      throw error;
    }
  }

  /**
   * Translate chapter to multiple languages
   *
   * REUSABLE: Multi-language support for any content
   */
  async translateChapterMultiLanguage({ content, chapterTitle, chapterNumber, targetLanguages }) {
    console.log(`\n🌐 TranslationSubagent: Translating Chapter ${chapterNumber} to ${targetLanguages.length} languages...`);

    const translations = {};

    for (const targetLang of targetLanguages) {
      try {
        const result = await this.translateContent({
          content,
          targetLanguage: targetLang
        });

        translations[targetLang] = {
          content: result.translatedContent,
          metadata: result.metadata
        };

        console.log(`  ✓ ${targetLang} translation complete`);

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ✗ ${targetLang} translation failed:`, error.message);
        translations[targetLang] = {
          content: null,
          error: error.message
        };
      }
    }

    const successCount = Object.values(translations).filter(t => t.content !== null).length;
    console.log(`✅ Multi-language translation: ${successCount}/${targetLanguages.length} successful`);

    return {
      success: true,
      chapterNumber,
      chapterTitle,
      translations,
      metadata: {
        sourceLanguage: this.options.defaultSourceLanguage,
        targetLanguages,
        successfulTranslations: successCount,
        failedTranslations: targetLanguages.length - successCount,
        translatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Translate entire book to target language(s)
   *
   * REUSABLE: Batch translation for books, documentation, courses
   */
  async translateBookBatch({ chapters, targetLanguages }) {
    console.log(`\n📚 TranslationSubagent: Batch translating ${chapters.length} chapters to ${targetLanguages.length} language(s)...`);

    const results = [];

    for (const chapter of chapters) {
      try {
        const result = await this.translateChapterMultiLanguage({
          content: chapter.content,
          chapterTitle: chapter.title,
          chapterNumber: chapter.chapterNumber,
          targetLanguages
        });

        results.push(result);

        console.log(`  [${results.length}/${chapters.length}] Chapter ${chapter.chapterNumber} translated`);

      } catch (error) {
        console.error(`Chapter ${chapter.chapterNumber} translation failed:`, error);
        results.push({
          success: false,
          chapterNumber: chapter.chapterNumber,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Book translation complete: ${successCount}/${chapters.length} chapters`);

    return {
      success: true,
      results,
      summary: {
        totalChapters: chapters.length,
        successfulChapters: successCount,
        failedChapters: chapters.length - successCount,
        targetLanguages
      }
    };
  }

  /**
   * Apply glossary terms for consistency
   *
   * REUSABLE: Ensures technical terms are translated consistently
   */
  applyGlossary(content, targetLanguage) {
    if (!this.options.glossary[targetLanguage]) {
      return content;
    }

    let processedContent = content;
    const glossary = this.options.glossary[targetLanguage];

    // Replace glossary terms with their approved translations
    // (Marked with special tags so LLM doesn't re-translate)
    Object.entries(glossary).forEach(([term, translation]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      processedContent = processedContent.replace(regex, `[GLOSSARY:${translation}]`);
    });

    return processedContent;
  }

  /**
   * Extract and translate technical terms
   *
   * REUSABLE: Creates translated glossaries automatically
   */
  async createTranslatedGlossary({ terms, targetLanguage }) {
    console.log(`\n📖 TranslationSubagent: Creating glossary for ${terms.length} terms in ${targetLanguage}...`);

    const glossary = {};

    // Use LLM to translate each term with context
    for (const term of terms) {
      try {
        const prompt = `Translate the technical term "${term}" from the context of Physical AI and Robotics to ${targetLanguage}.

Provide ONLY the translated term, no explanation. The translation should be:
1. Technically accurate
2. Commonly used in ${targetLanguage} robotics literature
3. Properly transliterated if necessary

Term in ${targetLanguage}:`;

        const translation = await this.llmFunction([
          { role: 'user', content: prompt }
        ], { temperature: 0.2, maxTokens: 50 });

        glossary[term] = translation.trim();

        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Failed to translate term "${term}":`, error);
        glossary[term] = term; // Keep original if translation fails
      }
    }

    console.log(`✅ Glossary created for ${targetLanguage}`);

    // Update internal glossary
    if (!this.options.glossary[targetLanguage]) {
      this.options.glossary[targetLanguage] = {};
    }
    Object.assign(this.options.glossary[targetLanguage], glossary);

    return {
      success: true,
      targetLanguage,
      glossary,
      termCount: terms.length
    };
  }

  /**
   * Quality check translation
   *
   * REUSABLE: Validates translation quality
   */
  async validateTranslation({ originalContent, translatedContent, targetLanguage }) {
    console.log(`\n✓ TranslationSubagent: Validating ${targetLanguage} translation quality...`);

    const prompt = `You are a professional translation quality assessor.

Compare the original content with its ${targetLanguage} translation and identify any issues:

ORIGINAL:
${originalContent.substring(0, 1000)}

TRANSLATION:
${translatedContent.substring(0, 1000)}

Check for:
1. Accuracy (meaning preserved)
2. Fluency (natural in target language)
3. Technical term consistency
4. Formatting preservation
5. Completeness (nothing missing)

Return a JSON object:
{
  "score": 0-100,
  "issues": ["issue 1", "issue 2"],
  "recommendations": ["recommendation 1"]
}

Quality Assessment (JSON):`;

    try {
      const assessmentStr = await this.llmFunction([
        { role: 'user', content: prompt }
      ], { temperature: 0.3, maxTokens: 500 });

      const jsonMatch = assessmentStr.match(/\{[\s\S]*\}/);
      const assessment = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        score: 0,
        issues: ['Failed to parse assessment'],
        recommendations: []
      };

      console.log(`Quality Score: ${assessment.score}/100`);

      return {
        success: true,
        assessment,
        targetLanguage
      };

    } catch (error) {
      console.error('Translation validation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. MULTI-LANGUAGE SUPPORT:
 *    - Works with any language pair
 *    - Currently configured for en/ur/es (expandable)
 *
 * 2. BATCH TRANSLATION:
 *    - Efficient book/documentation translation
 *    - Progress tracking and error handling
 *
 * 3. GLOSSARY MANAGEMENT:
 *    - Ensures technical term consistency
 *    - Auto-generates translated glossaries
 *
 * 4. QUALITY ASSURANCE:
 *    - Validates translation accuracy
 *    - Provides improvement recommendations
 *
 * 5. FORMAT PRESERVATION:
 *    - Preserves Markdown formatting
 *    - Keeps code blocks untranslated
 *
 * 6. INTEGRATION:
 *    - Works with existing translation API
 *    - Compatible with multi-language Docusaurus setup
 *
 * 7. USAGE EXAMPLES:
 *    ```javascript
 *    const translator = new TranslationSubagent({
 *      llmFunction: callOpenRouterCompletion,
 *      options: {
 *        glossary: {
 *          'ur': { 'ROS2': 'ROS2', 'URDF': 'URDF' }
 *        }
 *      }
 *    });
 *
 *    // Translate single chapter to multiple languages
 *    await translator.translateChapterMultiLanguage({
 *      content: chapterText,
 *      chapterNumber: '1',
 *      targetLanguages: ['ur', 'es']
 *    });
 *
 *    // Translate entire book
 *    await translator.translateBookBatch({
 *      chapters: allChapters,
 *      targetLanguages: ['ur', 'es', 'fr']
 *    });
 *
 *    // Create glossary
 *    await translator.createTranslatedGlossary({
 *      terms: ['ROS2', 'URDF', 'Gazebo'],
 *      targetLanguage: 'ur'
 *    });
 *    ```
 */
