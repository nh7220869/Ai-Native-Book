/**
 * AGENT SKILL: refine_content
 *
 * Reusable skill for improving existing content quality.
 * Can be called by any subagent to enhance clarity, fix errors, improve flow.
 *
 * @param {Object} params - Refinement parameters
 * @param {string} params.content - Original content to refine
 * @param {string[]} params.improvements - Types of improvements (clarity/grammar/structure/examples/conciseness)
 * @param {string} params.targetAudience - Target audience level
 * @param {string} params.focusArea - Specific area to focus on (optional)
 * @param {Function} llmFunction - LLM API function
 * @returns {Promise<Object>} Refined content with change summary
 */
export async function refine_content({
  content,
  improvements = ['clarity', 'grammar', 'structure'],
  targetAudience = 'intermediate',
  focusArea = null,
  llmFunction
}) {
  // Validate inputs
  if (!content) {
    throw new Error('refine_content: Content is required');
  }

  if (!llmFunction || typeof llmFunction !== 'function') {
    throw new Error('refine_content: llmFunction must be provided');
  }

  // Build refinement prompt based on requested improvements
  const improvementTypes = Array.isArray(improvements) ? improvements : [improvements];

  const improvementGuidelines = {
    clarity: 'Make explanations clearer and more understandable. Remove ambiguity.',
    grammar: 'Fix grammar, spelling, and punctuation errors.',
    structure: 'Improve logical flow and organization. Ensure smooth transitions.',
    examples: 'Add or improve practical examples and code snippets.',
    conciseness: 'Remove redundancy while maintaining completeness.',
    technical: 'Ensure technical accuracy and add missing details.',
    engagement: 'Make content more engaging and reader-friendly.'
  };

  const selectedGuidelines = improvementTypes
    .map(type => improvementGuidelines[type] || type)
    .join('\n- ');

  const prompt = `You are a professional content editor for technical educational materials.

TASK: Refine and improve the following content.

TARGET AUDIENCE: ${targetAudience}
${focusArea ? `FOCUS AREA: ${focusArea}\n` : ''}
IMPROVEMENTS NEEDED:
- ${selectedGuidelines}

ORIGINAL CONTENT:
${content}

INSTRUCTIONS:
1. Carefully review the content
2. Apply the requested improvements while preserving the author's voice
3. Maintain all technical accuracy
4. Keep the same Markdown formatting structure
5. Do NOT remove important information
6. Return ONLY the refined content (no explanations)

REFINED CONTENT:`;

  try {
    // Call LLM to refine content
    const refinedContent = await llmFunction([
      { role: 'system', content: 'You are an expert content editor specializing in technical documentation.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.4, // Lower temperature for precise editing
      maxTokens: Math.ceil(content.length * 1.2) // Allow some expansion
    });

    // Calculate improvement metrics (simple heuristics)
    const originalWordCount = content.split(/\s+/).length;
    const refinedWordCount = refinedContent.split(/\s+/).length;
    const changePercentage = Math.abs((refinedWordCount - originalWordCount) / originalWordCount * 100);

    // Return structured result (reusable)
    return {
      success: true,
      originalContent: content,
      refinedContent,
      improvements: improvementTypes,
      metadata: {
        originalWordCount,
        refinedWordCount,
        changePercentage: changePercentage.toFixed(2),
        targetAudience,
        focusArea,
        refinedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('refine_content skill error:', error);
    throw new Error(`Failed to refine content: ${error.message}`);
  }
}

/**
 * REUSABILITY NOTES:
 * - Used by ContentRefinerSubagent for systematic content improvement
 * - Can be called by ChapterWriterSubagent to polish newly generated content
 * - Usable in batch processing pipelines for entire book refinement
 * - Improvement types are configurable for different quality goals
 * - Provider-agnostic through LLM function injection
 */
