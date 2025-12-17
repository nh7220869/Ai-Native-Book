/**
 * AGENT SKILL: generate_quiz
 *
 * Reusable skill for generating assessment quizzes from content.
 * Can be called by any subagent to create learning assessments.
 *
 * @param {Object} params - Quiz parameters
 * @param {string} params.content - Content to generate quiz from
 * @param {number} params.questionCount - Number of questions (default: 5)
 * @param {string[]} params.questionTypes - Types of questions (mcq/true-false/short-answer/code)
 * @param {string} params.difficulty - Question difficulty (easy/medium/hard)
 * @param {boolean} params.includeExplanations - Include answer explanations
 * @param {Function} llmFunction - LLM API function
 * @returns {Promise<Object>} Generated quiz with questions and answers
 */
export async function generate_quiz({
  content,
  questionCount = 5,
  questionTypes = ['mcq', 'true-false'],
  difficulty = 'medium',
  includeExplanations = true,
  llmFunction
}) {
  // Validate inputs
  if (!content) {
    throw new Error('generate_quiz: Content is required');
  }

  if (!llmFunction || typeof llmFunction !== 'function') {
    throw new Error('generate_quiz: llmFunction must be provided');
  }

  // Validate question types
  const validTypes = ['mcq', 'true-false', 'short-answer', 'code', 'fill-blank'];
  const selectedTypes = questionTypes.filter(type => validTypes.includes(type));

  if (selectedTypes.length === 0) {
    throw new Error('generate_quiz: No valid question types provided');
  }

  // Build quiz generation prompt
  const typeDescriptions = {
    mcq: 'Multiple Choice Questions (4 options, 1 correct)',
    'true-false': 'True/False Questions',
    'short-answer': 'Short Answer Questions (1-2 sentences)',
    code: 'Code-based Questions (write/debug code)',
    'fill-blank': 'Fill in the Blank Questions'
  };

  const selectedTypesList = selectedTypes.map(t => typeDescriptions[t]).join(', ');

  const prompt = `You are an educational assessment expert.

TASK: Generate a quiz based on the following content.

CONTENT TO ASSESS:
${content.substring(0, 3000)}${content.length > 3000 ? '\n...(content truncated)' : ''}

QUIZ REQUIREMENTS:
- Total Questions: ${questionCount}
- Question Types: ${selectedTypesList}
- Difficulty: ${difficulty}
- Include Answer Explanations: ${includeExplanations ? 'Yes' : 'No'}

INSTRUCTIONS:
1. Create questions that test understanding of key concepts
2. For ${difficulty} difficulty:
   ${difficulty === 'easy' ? '- Test basic recall and comprehension' : ''}
   ${difficulty === 'medium' ? '- Test application and analysis' : ''}
   ${difficulty === 'hard' ? '- Test synthesis, evaluation, and problem-solving' : ''}
3. Distribute questions across different question types
4. For MCQ: Make distractors plausible but clearly incorrect
5. For code questions: Keep them practical and executable
${includeExplanations ? '6. Provide clear, educational explanations for correct answers' : ''}

OUTPUT FORMAT (JSON):
{
  "quiz": {
    "title": "Quiz Title",
    "questions": [
      {
        "id": 1,
        "type": "mcq",
        "question": "Question text?",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correctAnswer": "B",
        "explanation": "Explanation why B is correct..."
      },
      {
        "id": 2,
        "type": "true-false",
        "question": "Statement is true or false?",
        "correctAnswer": true,
        "explanation": "Explanation..."
      }
    ]
  }
}

Generate the quiz now as valid JSON:`;

  try {
    // Call LLM to generate quiz
    const quizResponse = await llmFunction([
      { role: 'system', content: 'You are an expert at creating educational assessments. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7, // Balanced creativity
      maxTokens: questionCount * 200 // Estimate tokens per question
    });

    // Parse JSON response (handle potential formatting issues)
    let quiz;
    try {
      // Try to extract JSON if wrapped in code blocks
      const jsonMatch = quizResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : quizResponse;
      quiz = JSON.parse(jsonStr);
    } catch (parseError) {
      throw new Error(`Failed to parse quiz JSON: ${parseError.message}`);
    }

    // Validate quiz structure
    if (!quiz.quiz || !Array.isArray(quiz.quiz.questions)) {
      throw new Error('Invalid quiz format: missing quiz.questions array');
    }

    // Return structured result
    return {
      success: true,
      quiz: quiz.quiz,
      metadata: {
        questionCount: quiz.quiz.questions.length,
        questionTypes: selectedTypes,
        difficulty,
        includeExplanations,
        generatedAt: new Date().toISOString(),
        contentLength: content.length
      }
    };

  } catch (error) {
    console.error('generate_quiz skill error:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

/**
 * REUSABILITY NOTES:
 * - Used by QuizGeneratorSubagent for chapter-end assessments
 * - Can be called by ChapterWriterSubagent to add inline knowledge checks
 * - Reusable for different difficulty levels (adaptive learning)
 * - Question types are configurable for different learning objectives
 * - Can integrate with frontend for interactive quiz UI
 * - Useful for spaced repetition and learning analytics
 */
