/**
 * AGENT SKILL: prepare_rag_context
 *
 * Reusable skill for preparing content for RAG (Retrieval-Augmented Generation).
 * Chunks content, generates embeddings, and prepares metadata for vector storage.
 *
 * @param {Object} params - RAG preparation parameters
 * @param {string} params.content - Content to prepare for RAG
 * @param {string} params.chapterTitle - Chapter title (for metadata)
 * @param {string} params.chapterNumber - Chapter number (for metadata)
 * @param {number} params.chunkSize - Target chunk size in words (default: 300)
 * @param {number} params.chunkOverlap - Overlap between chunks in words (default: 50)
 * @param {Function} embeddingFunction - Embedding API function (injected)
 * @returns {Promise<Object>} Prepared chunks with embeddings and metadata
 */
export async function prepare_rag_context({
  content,
  chapterTitle,
  chapterNumber,
  chunkSize = 300,
  chunkOverlap = 50,
  embeddingFunction
}) {
  // Validate inputs
  if (!content) {
    throw new Error('prepare_rag_context: Content is required');
  }

  if (!chapterTitle || !chapterNumber) {
    throw new Error('prepare_rag_context: Chapter metadata (title, number) is required');
  }

  if (!embeddingFunction || typeof embeddingFunction !== 'function') {
    throw new Error('prepare_rag_context: embeddingFunction must be provided');
  }

  try {
    // 1. Intelligent content chunking
    const chunks = intelligentChunking(content, chunkSize, chunkOverlap);

    console.log(`Preparing RAG context: ${chunks.length} chunks generated`);

    // 2. Generate embeddings for each chunk
    const chunksWithEmbeddings = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        // Generate embedding for this chunk
        const embedding = await embeddingFunction(chunk.text);

        // Add embedding and metadata
        chunksWithEmbeddings.push({
          id: `${chapterNumber}_chunk_${i + 1}`,
          text: chunk.text,
          embedding,
          metadata: {
            chapterNumber,
            chapterTitle,
            chunkIndex: i + 1,
            totalChunks: chunks.length,
            startPosition: chunk.startPosition,
            endPosition: chunk.endPosition,
            wordCount: chunk.wordCount,
            containsCode: chunk.containsCode,
            headings: chunk.headings
          }
        });

        // Progress logging
        if ((i + 1) % 10 === 0) {
          console.log(`Embedded ${i + 1}/${chunks.length} chunks...`);
        }

      } catch (embeddingError) {
        console.error(`Failed to embed chunk ${i + 1}:`, embeddingError);
        // Continue with next chunk instead of failing completely
      }
    }

    // 3. Return prepared RAG-ready chunks
    return {
      success: true,
      chunks: chunksWithEmbeddings,
      metadata: {
        chapterNumber,
        chapterTitle,
        totalChunks: chunksWithEmbeddings.length,
        chunkSize,
        chunkOverlap,
        averageChunkSize: chunksWithEmbeddings.reduce((sum, c) => sum + c.metadata.wordCount, 0) / chunksWithEmbeddings.length,
        embeddingDimension: chunksWithEmbeddings[0]?.embedding?.length || 0,
        preparedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('prepare_rag_context skill error:', error);
    throw new Error(`Failed to prepare RAG context: ${error.message}`);
  }
}

/**
 * Intelligent content chunking with awareness of markdown structure
 * @private
 */
function intelligentChunking(content, targetSize, overlap) {
  const chunks = [];
  const words = content.split(/\s+/);
  const lines = content.split('\n');

  // Extract headings for metadata
  const headings = lines
    .filter(line => line.match(/^#{1,6}\s+/))
    .map(line => line.replace(/^#{1,6}\s+/, '').trim());

  // Detect code blocks
  const hasCode = content.includes('```');

  let currentChunk = [];
  let currentSize = 0;
  let position = 0;

  for (let i = 0; i < words.length; i++) {
    currentChunk.push(words[i]);
    currentSize++;
    position++;

    // Check if we've reached target size
    if (currentSize >= targetSize) {
      // Try to break at sentence boundary
      const chunkText = currentChunk.join(' ');
      const lastSentenceEnd = Math.max(
        chunkText.lastIndexOf('.'),
        chunkText.lastIndexOf('!'),
        chunkText.lastIndexOf('?')
      );

      let finalChunkText;
      let actualEndPosition = position;

      if (lastSentenceEnd > targetSize * 0.7) {
        // Found a good break point
        finalChunkText = chunkText.substring(0, lastSentenceEnd + 1).trim();
        // Adjust position
        const wordsInFinalChunk = finalChunkText.split(/\s+/).length;
        actualEndPosition = position - currentSize + wordsInFinalChunk;
      } else {
        // Just use the whole chunk
        finalChunkText = chunkText.trim();
      }

      // Save chunk
      chunks.push({
        text: finalChunkText,
        startPosition: position - currentSize,
        endPosition: actualEndPosition,
        wordCount: finalChunkText.split(/\s+/).length,
        containsCode: finalChunkText.includes('```') || finalChunkText.includes('`'),
        headings: headings.slice(Math.max(0, chunks.length - 1), chunks.length + 1)
      });

      // Start new chunk with overlap
      currentChunk = currentChunk.slice(-overlap);
      currentSize = overlap;
    }
  }

  // Add remaining content as final chunk
  if (currentChunk.length > 0) {
    const finalText = currentChunk.join(' ').trim();
    chunks.push({
      text: finalText,
      startPosition: position - currentChunk.length,
      endPosition: position,
      wordCount: finalText.split(/\s+/).length,
      containsCode: finalText.includes('```') || finalText.includes('`'),
      headings: headings.slice(Math.max(0, chunks.length - 1))
    });
  }

  return chunks;
}

/**
 * REUSABILITY NOTES:
 * - Used by RAGPrepSubagent to prepare all book content for vector database
 * - Can be called after ChapterWriterSubagent generates new content
 * - Reusable for any Markdown content (not just book chapters)
 * - Chunking algorithm preserves context and structure
 * - Embedding function is injected, making it provider-agnostic
 * - Integrates with existing Qdrant vector database
 * - Chunks can be stored in any vector database (Pinecone, Weaviate, etc.)
 */
