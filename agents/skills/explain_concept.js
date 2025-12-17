/**
 * AGENT SKILL: explain_concept
 *
 * Reusable skill for generating clear concept explanations.
 * Can be called by any subagent to explain technical concepts at different levels.
 *
 * @param {Object} params - Explanation parameters
 * @param {string} params.concept - Concept name to explain
 * @param {string} params.context - Context within robotics/AI
 * @param {string} params.level - Explanation level (eli5/beginner/intermediate/advanced/expert)
 * @param {boolean} params.includeAnalogy - Whether to include analogies
 * @param {boolean} params.includeCode - Whether to include code examples
 * @param {boolean} params.includeVisual - Whether to describe visualizations
 * @param {Function} llmFunction - LLM API function
 * @returns {Promise<Object>} Concept explanation
 */
export async function explain_concept({
  concept,
  context = 'robotics and AI',
  level = 'intermediate',
  includeAnalogy = true,
  includeCode = true,
  includeVisual = false,
  llmFunction
}) {
  // Validate inputs
  if (!concept) {
    throw new Error('explain_concept: Concept name is required');
  }

  if (!llmFunction || typeof llmFunction !== 'function') {
    throw new Error('explain_concept: llmFunction must be provided');
  }

  // Define explanation depth by level
  const levelGuidelines = {
    eli5: 'Explain like I\'m 5 years old. Use simple language, everyday analogies, no jargon.',
    beginner: 'Explain for someone new to the field. Define all technical terms, use simple examples.',
    intermediate: 'Explain for someone with basic knowledge. Use technical terms with brief definitions.',
    advanced: 'Explain for practitioners. Assume familiarity with fundamentals, focus on nuances.',
    expert: 'Explain for experts. Use precise technical language, discuss edge cases and research.'
  };

  const selectedGuideline = levelGuidelines[level] || levelGuidelines['intermediate'];

  // Build explanation prompt
  const prompt = `You are an expert educator in ${context}.

TASK: Explain the concept of "${concept}"

EXPLANATION LEVEL: ${level}
${selectedGuideline}

STRUCTURE YOUR EXPLANATION:
1. **What it is**: Define the concept clearly
${includeAnalogy ? '2. **Analogy**: Provide a real-world analogy to make it intuitive\n' : ''}
${level !== 'eli5' ? '3. **Why it matters**: Explain its importance and applications\n' : ''}
4. **How it works**: Describe the underlying mechanism or process
${includeCode ? '5. **Code Example**: Provide a simple, practical code example (Python/ROS2)\n' : ''}
${includeVisual ? '6. **Visualization**: Describe how to visualize this concept (diagram/plot description)\n' : ''}
${level !== 'eli5' && level !== 'beginner' ? '7. **Common Pitfalls**: Mention typical mistakes or misconceptions\n' : ''}
8. **Key Takeaway**: Summarize in 1-2 sentences

Keep the explanation ${level === 'eli5' ? '100-150' : level === 'beginner' ? '200-300' : '300-500'} words.

Use Markdown formatting. Be clear, accurate, and engaging.

Explain the concept now:`;

  try {
    // Call LLM for explanation
    const explanation = await llmFunction([
      { role: 'system', content: 'You are an expert educator skilled at explaining complex concepts clearly.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.6, // Balanced creativity and accuracy
      maxTokens: level === 'eli5' ? 300 : level === 'expert' ? 1500 : 800
    });

    // Return structured result
    return {
      success: true,
      concept,
      explanation,
      metadata: {
        level,
        context,
        includeAnalogy,
        includeCode,
        includeVisual,
        wordCount: explanation.split(/\s+/).length,
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('explain_concept skill error:', error);
    throw new Error(`Failed to explain concept: ${error.message}`);
  }
}

/**
 * REUSABILITY NOTES:
 * - Used by ConceptExplainerSubagent for generating concept glossaries
 * - Can be called by ChapterWriterSubagent to explain terms inline
 * - Reusable across different educational materials (not just this book)
 * - Level parameter makes it adaptable for different audiences
 * - Can generate explanations for chatbot responses
 * - Integrates with existing RAG system for concept Q&A
 */
