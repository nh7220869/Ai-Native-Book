/**
 * SUBAGENT: QuizGeneratorSubagent
 *
 * Reusable subagent for generating educational assessments.
 * Creates quizzes, practice tests, and knowledge checks.
 *
 * REUSABILITY: Can generate assessments for any educational content.
 */

import { generate_quiz } from '../skills/generate_quiz.js';

export class QuizGeneratorSubagent {
  /**
   * @param {Object} config - Subagent configuration
   * @param {Function} config.llmFunction - LLM API function
   * @param {Object} config.options - Default options
   */
  constructor({ llmFunction, options = {} }) {
    if (!llmFunction) {
      throw new Error('QuizGeneratorSubagent: llmFunction is required');
    }

    this.llmFunction = llmFunction;
    this.options = {
      defaultQuestionCount: options.defaultQuestionCount || 5,
      defaultDifficulty: options.defaultDifficulty || 'medium',
      defaultQuestionTypes: options.defaultQuestionTypes || ['mcq', 'true-false'],
      includeExplanations: options.includeExplanations ?? true,
      ...options
    };

    console.log('QuizGeneratorSubagent initialized');
  }

  /**
   * Generate a quiz from content
   *
   * REUSABLE: Can generate quizzes for any educational material
   */
  async generateQuiz({ content, questionCount, questionTypes, difficulty, includeExplanations }) {
    const qCount = questionCount || this.options.defaultQuestionCount;
    const qTypes = questionTypes || this.options.defaultQuestionTypes;
    const qDifficulty = difficulty || this.options.defaultDifficulty;
    const includeExp = includeExplanations ?? this.options.includeExplanations;

    console.log(`\n📝 QuizGeneratorSubagent: Generating quiz (${qCount} questions, ${qDifficulty} difficulty)...`);

    try {
      const result = await generate_quiz({
        content,
        questionCount: qCount,
        questionTypes: qTypes,
        difficulty: qDifficulty,
        includeExplanations: includeExp,
        llmFunction: this.llmFunction
      });

      console.log(`✅ Quiz generated with ${result.quiz.questions.length} questions`);

      return result;

    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw error;
    }
  }

  /**
   * Generate quizzes for multiple chapters
   *
   * REUSABLE: Batch quiz generation for entire books or courses
   */
  async generateQuizzesBatch(contentList) {
    console.log(`\n📚 QuizGeneratorSubagent: Batch generating ${contentList.length} quizzes...`);

    const results = [];

    for (const item of contentList) {
      try {
        const result = await this.generateQuiz({
          content: item.content,
          questionCount: item.questionCount,
          questionTypes: item.questionTypes,
          difficulty: item.difficulty
        });

        results.push({
          success: true,
          id: item.id || `quiz_${results.length + 1}`,
          chapterTitle: item.chapterTitle,
          ...result
        });

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to generate quiz for ${item.id}:`, error);
        results.push({
          success: false,
          id: item.id,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Batch quiz generation complete: ${successCount}/${contentList.length} successful`);

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

  /**
   * Generate progressive difficulty quizzes
   *
   * REUSABLE: Creates adaptive learning paths
   */
  async generateProgressiveQuizzes({ content, difficulties = ['easy', 'medium', 'hard'] }) {
    console.log(`\n📊 QuizGeneratorSubagent: Generating progressive quizzes (${difficulties.length} levels)...`);

    const quizzes = {};

    for (const difficulty of difficulties) {
      try {
        const result = await this.generateQuiz({
          content,
          difficulty,
          questionCount: difficulty === 'easy' ? 3 : difficulty === 'hard' ? 7 : 5
        });

        quizzes[difficulty] = result.quiz;

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to generate ${difficulty} quiz:`, error);
        quizzes[difficulty] = null;
      }
    }

    console.log(`✅ Progressive quizzes generated`);

    return {
      success: true,
      quizzes,
      difficulties,
      metadata: {
        levelsGenerated: Object.keys(quizzes).filter(k => quizzes[k] !== null).length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate mixed question type quiz
   *
   * REUSABLE: Creates comprehensive assessments
   */
  async generateComprehensiveQuiz({ content, totalQuestions = 10 }) {
    console.log(`\n🎯 QuizGeneratorSubagent: Generating comprehensive quiz (${totalQuestions} questions)...`);

    // Mix question types strategically
    const questionTypes = ['mcq', 'true-false', 'short-answer', 'code'];

    try {
      const result = await this.generateQuiz({
        content,
        questionCount: totalQuestions,
        questionTypes,
        difficulty: 'medium',
        includeExplanations: true
      });

      // Analyze question distribution
      const distribution = {};
      result.quiz.questions.forEach(q => {
        distribution[q.type] = (distribution[q.type] || 0) + 1;
      });

      console.log(`✅ Comprehensive quiz generated:`, distribution);

      return {
        ...result,
        distribution
      };

    } catch (error) {
      console.error('Failed to generate comprehensive quiz:', error);
      throw error;
    }
  }

  /**
   * Generate topic-specific quizzes
   *
   * REUSABLE: Creates focused assessments for specific learning objectives
   */
  async generateTopicQuizzes({ content, topics, questionsPerTopic = 3 }) {
    console.log(`\n🔖 QuizGeneratorSubagent: Generating quizzes for ${topics.length} topics...`);

    const topicQuizzes = {};

    // Use LLM to extract content relevant to each topic
    for (const topic of topics) {
      try {
        // Create focused prompt for topic
        const topicPrompt = `From the following content, extract ONLY the information related to "${topic}".

CONTENT:
${content.substring(0, 2000)}

EXTRACTED CONTENT FOR "${topic}":`;

        const topicContent = await this.llmFunction([
          { role: 'user', content: topicPrompt }
        ], { temperature: 0.3, maxTokens: 1000 });

        // Generate quiz for this topic
        const quizResult = await this.generateQuiz({
          content: topicContent,
          questionCount: questionsPerTopic,
          difficulty: 'medium'
        });

        topicQuizzes[topic] = {
          ...quizResult.quiz,
          topic
        };

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to generate quiz for topic "${topic}":`, error);
        topicQuizzes[topic] = null;
      }
    }

    console.log(`✅ Topic quizzes generated for ${topics.length} topics`);

    return {
      success: true,
      topicQuizzes,
      metadata: {
        topics: topics.length,
        questionsPerTopic,
        totalQuestions: topics.length * questionsPerTopic,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. FLEXIBLE ASSESSMENT TYPES:
 *    - MCQ, True/False, Short Answer, Code Questions, Fill-in-the-Blank
 *    - Mix and match based on learning objectives
 *
 * 2. ADAPTIVE DIFFICULTY:
 *    - Easy/Medium/Hard levels
 *    - Progressive quiz generation for spaced learning
 *
 * 3. BATCH PROCESSING:
 *    - Generate quizzes for entire books efficiently
 *    - Rate limiting handled automatically
 *
 * 4. TOPIC-SPECIFIC:
 *    - Can create focused quizzes on specific topics
 *    - Useful for targeted practice
 *
 * 5. COMPREHENSIVE ASSESSMENTS:
 *    - Mixed question types for thorough evaluation
 *    - Question distribution analysis
 *
 * 6. INTEGRATION:
 *    - JSON output compatible with quiz UIs
 *    - Can integrate with LMS platforms
 *    - Works with existing book structure
 *
 * 7. USAGE EXAMPLES:
 *    ```javascript
 *    const quizGen = new QuizGeneratorSubagent({
 *      llmFunction: callOpenRouterCompletion
 *    });
 *
 *    // Single quiz
 *    await quizGen.generateQuiz({ content: chapterText });
 *
 *    // Batch quizzes for all chapters
 *    await quizGen.generateQuizzesBatch([{ content: ch1, id: 'ch1' }, ...]);
 *
 *    // Progressive difficulty
 *    await quizGen.generateProgressiveQuizzes({ content: chapterText });
 *
 *    // Topic-specific
 *    await quizGen.generateTopicQuizzes({
 *      content: chapterText,
 *      topics: ['ROS2 Nodes', 'Topics', 'Services']
 *    });
 *    ```
 */
