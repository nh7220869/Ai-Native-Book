/**
 * SUBAGENT: RAGPrepSubagent
 *
 * Reusable subagent for preparing content for RAG (Retrieval-Augmented Generation).
 * Handles chunking, embedding generation, and vector database preparation.
 *
 * REUSABILITY: Works with any text content and any vector database.
 */

import { prepare_rag_context } from '../skills/prepare_rag_context.js';

export class RAGPrepSubagent {
  /**
   * @param {Object} config - Subagent configuration
   * @param {Function} config.embeddingFunction - Embedding API function
   * @param {Object} config.vectorDbClient - Vector database client (optional, for direct uploads)
   * @param {Object} config.options - Default options
   */
  constructor({ embeddingFunction, vectorDbClient = null, options = {} }) {
    if (!embeddingFunction) {
      throw new Error('RAGPrepSubagent: embeddingFunction is required');
    }

    this.embeddingFunction = embeddingFunction;
    this.vectorDbClient = vectorDbClient;
    this.options = {
      chunkSize: options.chunkSize || 300,
      chunkOverlap: options.chunkOverlap || 50,
      collectionName: options.collectionName || 'book_content',
      autoUpload: options.autoUpload ?? false, // Auto-upload to vector DB
      ...options
    };

    console.log('RAGPrepSubagent initialized');
  }

  /**
   * Prepare single chapter for RAG
   *
   * REUSABLE: Works with any chapter or document
   */
  async prepareChapter({ content, chapterTitle, chapterNumber, chunkSize, chunkOverlap }) {
    const cSize = chunkSize || this.options.chunkSize;
    const cOverlap = chunkOverlap || this.options.chunkOverlap;

    console.log(`\n🔍 RAGPrepSubagent: Preparing Chapter ${chapterNumber} for RAG...`);

    try {
      const result = await prepare_rag_context({
        content,
        chapterTitle,
        chapterNumber,
        chunkSize: cSize,
        chunkOverlap: cOverlap,
        embeddingFunction: this.embeddingFunction
      });

      console.log(`✅ Chapter ${chapterNumber} prepared: ${result.chunks.length} chunks generated`);

      // Optionally upload to vector database
      if (this.options.autoUpload && this.vectorDbClient) {
        await this.uploadToVectorDb(result.chunks);
      }

      return result;

    } catch (error) {
      console.error(`Failed to prepare Chapter ${chapterNumber}:`, error);
      throw error;
    }
  }

  /**
   * Prepare entire book for RAG (batch processing)
   *
   * REUSABLE: Can process entire books, documentation sets, etc.
   */
  async prepareBookBatch(chapters) {
    console.log(`\n📚 RAGPrepSubagent: Batch preparing ${chapters.length} chapters for RAG...`);

    const results = [];
    let totalChunks = 0;

    for (const chapter of chapters) {
      try {
        const result = await this.prepareChapter({
          content: chapter.content,
          chapterTitle: chapter.title,
          chapterNumber: chapter.chapterNumber
        });

        results.push({
          success: true,
          chapterNumber: chapter.chapterNumber,
          chapterTitle: chapter.title,
          chunksGenerated: result.chunks.length,
          ...result
        });

        totalChunks += result.chunks.length;

        // Progress logging
        console.log(`  [${results.length}/${chapters.length}] Chapter ${chapter.chapterNumber} processed`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Failed to prepare Chapter ${chapter.chapterNumber}:`, error);
        results.push({
          success: false,
          chapterNumber: chapter.chapterNumber,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Batch RAG preparation complete:`);
    console.log(`   Chapters: ${successCount}/${chapters.length} successful`);
    console.log(`   Total chunks: ${totalChunks}`);

    return {
      success: true,
      results,
      summary: {
        totalChapters: chapters.length,
        successfulChapters: successCount,
        failedChapters: chapters.length - successCount,
        totalChunks,
        averageChunksPerChapter: (totalChunks / successCount).toFixed(2)
      }
    };
  }

  /**
   * Upload prepared chunks to vector database
   *
   * REUSABLE: Works with any vector database (Qdrant, Pinecone, Weaviate, etc.)
   */
  async uploadToVectorDb(chunks) {
    if (!this.vectorDbClient) {
      console.warn('No vector database client configured. Skipping upload.');
      return { success: false, message: 'No vector DB client' };
    }

    console.log(`\n☁️  RAGPrepSubagent: Uploading ${chunks.length} chunks to vector database...`);

    try {
      // Prepare points for Qdrant format (adapt for other DBs)
      const points = chunks.map(chunk => ({
        id: chunk.id,
        vector: chunk.embedding,
        payload: {
          text: chunk.text,
          ...chunk.metadata
        }
      }));

      // Upload to Qdrant (example - adapt for your vector DB)
      if (this.vectorDbClient.upsert) {
        await this.vectorDbClient.upsert(this.options.collectionName, {
          points
        });
      }

      console.log(`✅ Uploaded ${chunks.length} chunks to ${this.options.collectionName}`);

      return {
        success: true,
        uploadedChunks: chunks.length,
        collectionName: this.options.collectionName
      };

    } catch (error) {
      console.error('Vector DB upload failed:', error);
      throw new Error(`Failed to upload to vector database: ${error.message}`);
    }
  }

  /**
   * Re-index existing content with new embeddings
   *
   * REUSABLE: Useful when switching embedding models or updating content
   */
  async reindexContent({ chapters, newEmbeddingFunction }) {
    console.log(`\n🔄 RAGPrepSubagent: Re-indexing ${chapters.length} chapters with new embeddings...`);

    // Temporarily switch embedding function
    const originalEmbedding = this.embeddingFunction;
    this.embeddingFunction = newEmbeddingFunction || originalEmbedding;

    try {
      const result = await this.prepareBookBatch(chapters);

      // Restore original embedding function
      this.embeddingFunction = originalEmbedding;

      console.log(`✅ Re-indexing complete`);

      return result;

    } catch (error) {
      this.embeddingFunction = originalEmbedding;
      console.error('Re-indexing failed:', error);
      throw error;
    }
  }

  /**
   * Generate RAG quality metrics
   *
   * REUSABLE: Analyze chunk quality for optimization
   */
  async analyzeChunkQuality(chunks) {
    console.log(`\n📊 RAGPrepSubagent: Analyzing chunk quality...`);

    const analysis = {
      totalChunks: chunks.length,
      wordCounts: chunks.map(c => c.metadata.wordCount),
      containsCode: chunks.filter(c => c.metadata.containsCode).length,
      averageWordCount: 0,
      minWordCount: 0,
      maxWordCount: 0,
      optimalChunks: 0, // Chunks within target range
      tooShort: 0,
      tooLong: 0
    };

    if (chunks.length > 0) {
      analysis.averageWordCount = (analysis.wordCounts.reduce((a, b) => a + b, 0) / chunks.length).toFixed(2);
      analysis.minWordCount = Math.min(...analysis.wordCounts);
      analysis.maxWordCount = Math.max(...analysis.wordCounts);

      // Define optimal range (target ±30%)
      const targetSize = this.options.chunkSize;
      const minOptimal = targetSize * 0.7;
      const maxOptimal = targetSize * 1.3;

      analysis.optimalChunks = chunks.filter(c =>
        c.metadata.wordCount >= minOptimal && c.metadata.wordCount <= maxOptimal
      ).length;

      analysis.tooShort = chunks.filter(c => c.metadata.wordCount < minOptimal).length;
      analysis.tooLong = chunks.filter(c => c.metadata.wordCount > maxOptimal).length;

      analysis.qualityScore = ((analysis.optimalChunks / chunks.length) * 100).toFixed(2);
    }

    console.log(`✅ Quality analysis complete:`);
    console.log(`   Optimal chunks: ${analysis.optimalChunks}/${analysis.totalChunks} (${analysis.qualityScore}%)`);
    console.log(`   Avg word count: ${analysis.averageWordCount}`);

    return analysis;
  }
}

/**
 * REUSABILITY NOTES:
 *
 * 1. VECTOR DATABASE AGNOSTIC:
 *    - Works with any vector DB through injected client
 *    - Example integrations: Qdrant, Pinecone, Weaviate, Milvus
 *
 * 2. EMBEDDING PROVIDER AGNOSTIC:
 *    - Works with any embedding function (OpenAI, Cohere, HuggingFace)
 *    - Easy to switch providers
 *
 * 3. INTELLIGENT CHUNKING:
 *    - Preserves markdown structure and code blocks
 *    - Configurable chunk size and overlap
 *    - Sentence-aware boundaries
 *
 * 4. BATCH PROCESSING:
 *    - Efficient for entire books or large documentation
 *    - Progress tracking and error handling
 *
 * 5. QUALITY ANALYSIS:
 *    - Analyzes chunk quality for optimization
 *    - Helps tune chunking parameters
 *
 * 6. RE-INDEXING:
 *    - Can update existing content with new embeddings
 *    - Useful when switching models or updating content
 *
 * 7. INTEGRATION:
 *    - Works with existing Qdrant setup
 *    - Compatible with existing RAG chatbot
 *    - Can be called after ChapterWriterSubagent
 *
 * 8. USAGE EXAMPLES:
 *    ```javascript
 *    const ragPrep = new RAGPrepSubagent({
 *      embeddingFunction: callOpenRouterEmbeddings,
 *      vectorDbClient: qdrantClient,
 *      options: { autoUpload: true }
 *    });
 *
 *    // Prepare single chapter
 *    await ragPrep.prepareChapter({
 *      content: chapterText,
 *      chapterTitle: 'Introduction to ROS2',
 *      chapterNumber: '1'
 *    });
 *
 *    // Prepare entire book
 *    await ragPrep.prepareBookBatch(allChapters);
 *
 *    // Analyze quality
 *    const quality = await ragPrep.analyzeChunkQuality(preparedChunks);
 *    ```
 */
