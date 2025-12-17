/**
 * AGENT SKILL: write_chapter
 *
 * Reusable skill for generating book chapter content.
 * Can be called by any subagent (ChapterWriterSubagent, etc.)
 *
 * @param {Object} params - Chapter parameters
 * @param {string} params.chapterNumber - Chapter number (e.g., "1", "2.1")
 * @param {string} params.title - Chapter title
 * @param {string} params.topics - Key topics to cover (comma-separated or array)
 * @param {string} params.targetAudience - Target audience level (beginner/intermediate/advanced)
 * @param {number} params.wordCount - Target word count (default: 2000)
 * @param {string} params.style - Writing style (tutorial/academic/conversational)
 * @param {Function} llmFunction - LLM API function (injected for reusability)
 * @returns {Promise<Object>} Generated chapter content
 */
export async function write_chapter({
  chapterNumber,
  title,
  topics,
  targetAudience = 'intermediate',
  wordCount = 2000,
  style = 'tutorial',
  llmFunction
}) {
  // Validate inputs
  if (!chapterNumber || !title || !topics) {
    throw new Error('write_chapter: Missing required parameters (chapterNumber, title, topics)');
  }

  if (!llmFunction || typeof llmFunction !== 'function') {
    throw new Error('write_chapter: llmFunction must be provided');
  }

  // Normalize topics to array
  const topicsList = Array.isArray(topics)
    ? topics
    : topics.split(',').map(t => t.trim());

  // Build comprehensive chapter generation prompt
  const prompt = `You are an expert technical writer for a Physical AI and Humanoid Robotics textbook.

TASK: Write Chapter ${chapterNumber}: "${title}"

REQUIREMENTS:
- Target Audience: ${targetAudience}
- Writing Style: ${style}
- Approximate Word Count: ${wordCount} words
- Topics to Cover: ${topicsList.join(', ')}

STRUCTURE:
1. Introduction (10% of content)
   - Hook the reader with a real-world application
   - Explain why this chapter matters
   - Preview key concepts

2. Main Content (70% of content)
   - Cover each topic in detail with explanations
   - Include practical examples and code snippets where relevant
   - Use clear, progressive learning structure
   - Add diagrams/visualizations descriptions where helpful

3. Practical Application (15% of content)
   - Hands-on example or mini-project
   - Step-by-step implementation
   - Common pitfalls and solutions

4. Summary & Next Steps (5% of content)
   - Recap key takeaways
   - Connect to next chapter
   - Additional resources

TONE: Clear, engaging, educational. Avoid jargon without explanation.

FORMAT: Use Markdown with proper headers (##, ###), code blocks, lists, and emphasis.

Please generate the complete chapter content now:`;

  try {
    // Call LLM to generate chapter
    const chapterContent = await llmFunction([
      { role: 'system', content: 'You are an expert technical writer and educator specializing in robotics and AI.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.8, // Higher creativity for writing
      maxTokens: Math.ceil(wordCount * 1.5) // Estimate tokens needed
    });

    // Return structured result (reusable across different contexts)
    return {
      success: true,
      chapterNumber,
      title,
      content: chapterContent,
      metadata: {
        targetAudience,
        wordCount: chapterContent.split(' ').length,
        topics: topicsList,
        style,
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('write_chapter skill error:', error);
    throw new Error(`Failed to generate chapter: ${error.message}`);
  }
}

/**
 * REUSABILITY NOTES:
 * - This skill can be used by ChapterWriterSubagent for new chapters
 * - Can be used by ContentRefinerSubagent to regenerate sections
 * - Can be called directly via API or CLI
 * - LLM function is injected, making this provider-agnostic
 * - All parameters are configurable for different book projects
 */
