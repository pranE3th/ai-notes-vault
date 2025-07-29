import axios from 'axios';

// Configuration - In a real app, these would be environment variables
const AI_CONFIG = {
  // OpenAI API configuration
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || 'your-openai-api-key',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',

  // Model configurations
  SUMMARY_MODEL: 'gpt-3.5-turbo',
  EMBEDDING_MODEL: 'text-embedding-ada-002',
  TAGGING_MODEL: 'gpt-3.5-turbo',
};

// Check if AI features are enabled
const isAIEnabled = AI_CONFIG.OPENAI_API_KEY &&
  AI_CONFIG.OPENAI_API_KEY !== 'your-openai-api-key' &&
  AI_CONFIG.OPENAI_API_KEY.startsWith('sk-');

// Log AI status in development
if (process.env.NODE_ENV === 'development') {
  console.log('AI Features:', isAIEnabled ? 'Enabled (Real OpenAI)' : 'Disabled (Mock Mode)');
  if (!isAIEnabled) {
    console.log('To enable real AI features, add your OpenAI API key to REACT_APP_OPENAI_API_KEY');
  }
}

// Create axios instance for OpenAI API
const openaiApi = axios.create({
  baseURL: AI_CONFIG.OPENAI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Generate a summary of the given text using AI
 * @param {string} text - The text to summarize
 * @param {number} maxLength - Maximum length of summary (default: 150)
 * @returns {Promise<string>} - The generated summary
 */
export async function getSummary(text, maxLength = 150) {
  try {
    // Use mock summary if AI is not enabled
    if (!isAIEnabled) {
      return generateMockSummary(text, maxLength);
    }

    const response = await openaiApi.post('/chat/completions', {
      model: AI_CONFIG.SUMMARY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that creates concise summaries. Create a summary of the given text in approximately ${maxLength} characters or less. Focus on the main points and key information.`
        },
        {
          role: 'user',
          content: `Please summarize this text: ${text}`
        }
      ],
      max_tokens: Math.ceil(maxLength / 3), // Rough estimate for token count
      temperature: 0.3,
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Summary generation failed:', error);
    return generateMockSummary(text, maxLength);
  }
}

/**
 * Generate relevant tags for the given text using AI
 * @param {string} text - The text to analyze for tags
 * @param {number} maxTags - Maximum number of tags to generate (default: 5)
 * @returns {Promise<string[]>} - Array of generated tags
 */
export async function getTags(text, maxTags = 5) {
  try {
    // Use mock tags if AI is not enabled
    if (!isAIEnabled) {
      return generateMockTags(text, maxTags);
    }

    const response = await openaiApi.post('/chat/completions', {
      model: AI_CONFIG.TAGGING_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates relevant tags for content. Generate up to ${maxTags} relevant, concise tags for the given text. Return only the tags as a comma-separated list, no additional text.`
        },
        {
          role: 'user',
          content: `Generate tags for this text: ${text}`
        }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const tagsString = response.data.choices[0].message.content.trim();
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error('Tag generation failed:', error);
    return generateMockTags(text, maxTags);
  }
}

/**
 * Generate embeddings for the given text using AI
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
export async function getEmbedding(text) {
  try {
    // Use mock embedding if AI is not enabled
    if (!isAIEnabled) {
      return generateMockEmbedding(text);
    }

    const response = await openaiApi.post('/embeddings', {
      model: AI_CONFIG.EMBEDDING_MODEL,
      input: text,
    });

    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return generateMockEmbedding(text);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} - Cosine similarity score (0-1)
 */
export function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// Mock functions for demo purposes
function generateMockSummary(text, maxLength) {
  const words = text.split(' ');
  const summaryLength = Math.min(words.length, Math.floor(maxLength / 6)); // Rough estimate
  const summary = words.slice(0, summaryLength).join(' ');
  return summary + (words.length > summaryLength ? '...' : '');
}

function generateMockTags(text, maxTags) {
  const commonWords = ['note', 'idea', 'project', 'work', 'personal', 'important', 'draft', 'research'];
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const uniqueWords = [...new Set(words)];
  
  // Combine some actual words from text with common tags
  const tags = [...uniqueWords.slice(0, Math.floor(maxTags / 2)), ...commonWords.slice(0, Math.ceil(maxTags / 2))];
  return tags.slice(0, maxTags);
}

function generateMockEmbedding(text) {
  // Generate a deterministic but pseudo-random embedding based on text
  const hash = simpleHash(text);
  const embedding = [];
  
  for (let i = 0; i < 1536; i++) { // OpenAI ada-002 embedding size
    const seed = hash + i;
    embedding.push((Math.sin(seed) + Math.cos(seed * 2)) / 2);
  }
  
  return embedding;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Perform semantic search on notes using embeddings
 * @param {string} query - Search query
 * @param {Array} notes - Array of notes with embeddings
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Promise<Array>} - Array of notes sorted by relevance
 */
export async function semanticSearch(query, notes, limit = 10) {
  try {
    const queryEmbedding = await getEmbedding(query);
    
    const scoredNotes = notes
      .filter(note => note.embedding) // Only include notes with embeddings
      .map(note => ({
        ...note,
        similarity: cosineSimilarity(queryEmbedding, note.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scoredNotes;
  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}
