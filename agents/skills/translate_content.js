/**
 * AGENT SKILL: translate_content
 *
 * Reusable skill for translating content to different languages.
 * Can be called by any subagent for multi-language support.
 *
 * @param {Object} params - Translation parameters
 * @param {string} params.content - Content to translate
 * @param {string} params.targetLanguage - Target language (en/ur/es/fr/de/etc.)
 * @param {string} params.sourceLanguage - Source language (auto-detect if not provided)
 * @param {string} params.style - Translation style (literal/natural/technical)
 * @param {boolean} params.preserveFormatting - Preserve Markdown formatting
 * @param {boolean} params.preserveCodeBlocks - Keep code blocks untranslated
 * @param {Function} llmFunction - LLM API function
 * @returns {Promise<Object>} Translated content
 */
export async function translate_content({
  content,
  targetLanguage,
  sourceLanguage = 'auto',
  style = 'natural',
  preserveFormatting = true,
  preserveCodeBlocks = true,
  llmFunction
}) {
  // Validate inputs
  if (!content) {
    throw new Error('translate_content: Content is required');
  }

  if (!targetLanguage) {
    throw new Error('translate_content: Target language is required');
  }

  if (!llmFunction || typeof llmFunction !== 'function') {
    throw new Error('translate_content: llmFunction must be provided');
  }

  // Language name mapping for better prompts
  const languageNames = {
    en: 'English',
    ur: 'Urdu',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    zh: 'Chinese (Simplified)',
    ja: 'Japanese',
    ar: 'Arabic',
    pt: 'Portuguese',
    ru: 'Russian',
    hi: 'Hindi'
  };

  const targetLangName = languageNames[targetLanguage] || targetLanguage;
  const sourceLangName = sourceLanguage === 'auto' ? 'the source language' : languageNames[sourceLanguage];

  // Build translation instructions based on style
  const styleInstructions = {
    literal: 'Translate literally, word-for-word where possible. Maintain source language structure.',
    natural: 'Translate naturally, adapting idioms and expressions. Make it sound native to target language.',
    technical: 'Use precise technical terminology. Maintain accuracy for technical terms and concepts.'
  };

  const selectedStyle = styleInstructions[style] || styleInstructions['natural'];

  // Extract and preserve code blocks if requested
  let processedContent = content;
  const codeBlocks = [];

  if (preserveCodeBlocks) {
    // Extract code blocks and replace with placeholders
    processedContent = content.replace(/```[\s\S]*?```/g, (match, index) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });

    // Also preserve inline code
    processedContent = processedContent.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });
  }

  // Build translation prompt
  const prompt = `You are a professional translator specializing in technical and educational content.

TASK: Translate the following content from ${sourceLangName} to ${targetLangName}.

TRANSLATION STYLE: ${style}
${selectedStyle}

IMPORTANT RULES:
1. Translate the content accurately while maintaining the original meaning
2. ${preserveFormatting ? 'Preserve ALL Markdown formatting (headers, lists, bold, italic, links)' : 'You can adapt formatting if needed'}
3. ${preserveCodeBlocks ? 'DO NOT translate code block placeholders (they will be restored later)' : 'Translate code comments but keep code syntax'}
4. Maintain the same structure and organization
5. For technical terms, use standard ${targetLangName} terminology
6. Ensure the translation sounds natural to native ${targetLangName} speakers
7. Return ONLY the translated content, no explanations

CONTENT TO TRANSLATE:
${processedContent}

TRANSLATED CONTENT:`;

  try {
    // Call LLM for translation
    const translatedContent = await llmFunction([
      { role: 'system', content: `You are a professional translator. Translate from ${sourceLangName} to ${targetLangName}.` },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.3, // Lower temperature for consistent translation
      maxTokens: Math.ceil(content.length * 2) // Some languages expand significantly
    });

    // Restore code blocks if they were preserved
    let finalTranslatedContent = translatedContent;

    if (preserveCodeBlocks && codeBlocks.length > 0) {
      codeBlocks.forEach((codeBlock, index) => {
        const placeholder = codeBlock.startsWith('```')
          ? `__CODE_BLOCK_${index}__`
          : `__INLINE_CODE_${index}__`;
        finalTranslatedContent = finalTranslatedContent.replace(placeholder, codeBlock);
      });
    }

    // Calculate translation metrics
    const originalWordCount = content.split(/\s+/).length;
    const translatedWordCount = finalTranslatedContent.split(/\s+/).length;
    const expansionRatio = (translatedWordCount / originalWordCount).toFixed(2);

    // Return structured result
    return {
      success: true,
      originalContent: content,
      translatedContent: finalTranslatedContent,
      metadata: {
        sourceLanguage: sourceLanguage === 'auto' ? 'auto-detected' : sourceLangName,
        targetLanguage: targetLangName,
        style,
        preserveFormatting,
        preserveCodeBlocks,
        originalWordCount,
        translatedWordCount,
        expansionRatio,
        codeBlocksPreserved: codeBlocks.length,
        translatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('translate_content skill error:', error);
    throw new Error(`Failed to translate content: ${error.message}`);
  }
}

/**
 * REUSABILITY NOTES:
 * - Used by TranslationSubagent for multi-language book generation
 * - Can be called by any subagent to translate specific sections
 * - Integrates with existing translation API endpoint
 * - Preserves code blocks and Markdown formatting
 * - Reusable for translating documentation, tutorials, etc.
 * - Style parameter allows different translation approaches
 * - Can be used in batch translation pipelines
 * - Supports all major languages via LLM
 */
