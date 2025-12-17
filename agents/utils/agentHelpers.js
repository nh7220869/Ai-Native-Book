/**
 * AGENT HELPER UTILITIES
 *
 * Reusable helper functions for common agent operations.
 * Provides utilities for error handling, retry logic, progress tracking, etc.
 *
 * REUSABILITY: Used across all agents and subagents for consistent behavior.
 */

import agentConfig from '../config/agentConfig.js';

/**
 * Sleep utility for rate limiting
 *
 * REUSABLE: Consistent delays across all agents
 */
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for API calls
 *
 * REUSABLE: Handles retries for any async function
 */
export async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries || agentConfig.errorHandling.maxRetries;
  const retryDelay = options.retryDelay || agentConfig.errorHandling.retryDelay;
  const onRetry = options.onRetry || (() => {});

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        console.log(`  ⚠️  Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
        onRetry(attempt, error);
        await sleep(retryDelay);
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Progress tracker for batch operations
 *
 * REUSABLE: Consistent progress logging
 */
export class ProgressTracker {
  constructor(total, operation = 'Processing') {
    this.total = total;
    this.current = 0;
    this.operation = operation;
    this.startTime = Date.now();
    this.successful = 0;
    this.failed = 0;
  }

  increment(success = true) {
    this.current++;
    if (success) {
      this.successful++;
    } else {
      this.failed++;
    }

    if (agentConfig.batchProcessing.enableProgressLogging) {
      const percentage = ((this.current / this.total) * 100).toFixed(1);
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`  [${this.current}/${this.total}] ${this.operation} - ${percentage}% (${elapsed}s elapsed)`);
    }
  }

  getSummary() {
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    return {
      total: this.total,
      processed: this.current,
      successful: this.successful,
      failed: this.failed,
      successRate: ((this.successful / this.total) * 100).toFixed(1) + '%',
      totalTime: `${totalTime}s`,
      averageTime: `${(parseFloat(totalTime) / this.current).toFixed(2)}s/item`
    };
  }
}

/**
 * Validate agent input parameters
 *
 * REUSABLE: Input validation for all agents
 */
export function validateInput(params, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (!params[field] && params[field] !== 0 && params[field] !== false) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}

/**
 * Sanitize content for LLM processing
 *
 * REUSABLE: Clean and prepare content for API calls
 */
export function sanitizeContent(content, maxLength = 10000) {
  if (!content) return '';

  // Trim and normalize whitespace
  let sanitized = content.trim().replace(/\s+/g, ' ');

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }

  return sanitized;
}

/**
 * Extract JSON from LLM response
 *
 * REUSABLE: Parse JSON from various LLM response formats
 */
export function extractJSON(response) {
  try {
    // Try direct parse first
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find JSON object in text
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    // Try to find JSON array in text
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    throw new Error('No valid JSON found in response');
  }
}

/**
 * Format chapter metadata
 *
 * REUSABLE: Consistent metadata structure
 */
export function formatChapterMetadata(chapter) {
  return {
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    wordCount: chapter.content ? chapter.content.split(/\s+/).length : 0,
    hasQuiz: !!chapter.quiz,
    hasRAG: !!chapter.ragContext,
    hasGlossary: !!chapter.glossary,
    hasTranslations: !!chapter.translations && Object.keys(chapter.translations).length > 0,
    generatedAt: chapter.metadata?.generatedAt || new Date().toISOString()
  };
}

/**
 * Calculate content similarity (simple word overlap)
 *
 * REUSABLE: Compare content versions
 */
export function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return (intersection.size / union.size) * 100;
}

/**
 * Estimate token count (rough approximation)
 *
 * REUSABLE: Prevent exceeding token limits
 */
export function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters or 0.75 words
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;

  return Math.ceil(Math.max(charCount / 4, wordCount / 0.75));
}

/**
 * Chunk large text for processing
 *
 * REUSABLE: Split content when exceeding limits
 */
export function chunkText(text, maxTokens = 3000) {
  const estimatedTokens = estimateTokens(text);

  if (estimatedTokens <= maxTokens) {
    return [text];
  }

  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      currentTokens = sentenceTokens;
    } else {
      currentChunk += ' ' + sentence;
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Generate unique ID
 *
 * REUSABLE: Create unique identifiers for chunks, questions, etc.
 */
export function generateId(prefix = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Format error message
 *
 * REUSABLE: Consistent error formatting
 */
export function formatError(error, context = '') {
  const message = error.message || String(error);
  const stack = error.stack || '';

  return {
    success: false,
    error: message,
    context,
    timestamp: new Date().toISOString(),
    stack: agentConfig.errorHandling.logErrors ? stack : undefined
  };
}

/**
 * Validate language code
 *
 * REUSABLE: Ensure valid language codes
 */
export function validateLanguage(langCode) {
  const supported = Object.keys(agentConfig.translator.supportedLanguages);

  if (!supported.includes(langCode)) {
    throw new Error(
      `Unsupported language: ${langCode}. Supported languages: ${supported.join(', ')}`
    );
  }

  return true;
}

/**
 * Calculate content quality score
 *
 * REUSABLE: Assess content quality metrics
 */
export function calculateQualityScore(content) {
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = (content.match(/[.!?]+/g) || []).length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Calculate various quality metrics
  const hasCodeBlocks = /```/.test(content);
  const hasHeadings = /^#{1,6}\s/m.test(content);
  const hasList = /^[-*+]\s/m.test(content) || /^\d+\.\s/m.test(content);

  let score = 50; // Base score

  // Adjust based on structure
  if (hasCodeBlocks) score += 10;
  if (hasHeadings) score += 10;
  if (hasList) score += 10;

  // Adjust based on sentence length (optimal: 15-20 words)
  if (avgSentenceLength >= 15 && avgSentenceLength <= 20) {
    score += 10;
  } else if (avgSentenceLength < 10 || avgSentenceLength > 30) {
    score -= 10;
  }

  // Adjust based on word count (optimal for tutorial: 1500-2500)
  if (wordCount >= 1500 && wordCount <= 2500) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Merge configurations
 *
 * REUSABLE: Deep merge configuration objects
 */
export function mergeConfigs(...configs) {
  return configs.reduce((merged, config) => {
    Object.keys(config).forEach(key => {
      if (typeof config[key] === 'object' && !Array.isArray(config[key])) {
        merged[key] = mergeConfigs(merged[key] || {}, config[key]);
      } else {
        merged[key] = config[key];
      }
    });
    return merged;
  }, {});
}

/**
 * Rate limiter utility
 *
 * REUSABLE: Enforce rate limits for API calls
 */
export class RateLimiter {
  constructor(maxPerMinute = 60) {
    this.maxPerMinute = maxPerMinute;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => time > oneMinuteAgo);

    if (this.requests.length >= this.maxPerMinute) {
      // Calculate wait time
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest);

      if (waitTime > 0) {
        console.log(`  ⏳ Rate limit reached, waiting ${(waitTime / 1000).toFixed(1)}s...`);
        await sleep(waitTime);
      }
    }

    this.requests.push(now);
  }
}

export default {
  sleep,
  withRetry,
  ProgressTracker,
  validateInput,
  sanitizeContent,
  extractJSON,
  formatChapterMetadata,
  calculateSimilarity,
  estimateTokens,
  chunkText,
  generateId,
  formatError,
  validateLanguage,
  calculateQualityScore,
  mergeConfigs,
  RateLimiter
};
