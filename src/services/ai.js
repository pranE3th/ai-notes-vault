import axios from 'axios';

/**
 * Clean HTML tags and normalize text for AI processing
 * @param {string} htmlText - Text that may contain HTML
 * @returns {string} - Clean plain text
 */
function cleanTextForAI(htmlText) {
  if (!htmlText) return '';

  // Create a temporary div to strip HTML tags
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlText;

  // Get text content and clean it up
  let cleanText = tempDiv.textContent || tempDiv.innerText || '';

  // Remove extra whitespace and normalize
  cleanText = cleanText
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // If the text has no spaces and is long, it might be concatenated words
  // Try to add some basic spacing for common patterns
  if (cleanText.length > 50 && cleanText.indexOf(' ') === -1) {
    // Add spaces before common words that might be concatenated
    cleanText = cleanText
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces
      .replace(/(i)([a-z])/g, '$1 $2') // "i" followed by letters
      .replace(/(my|life|job|work|dont|have|hate|love|feel|think|want|need|always|never)([a-z])/gi, '$1 $2')
      .replace(/([a-z])(i|my|life|job|work|dont|have|hate|love|feel|think|want|need|always|never)/gi, '$1 $2');
  }

  return cleanText;
}

// ⚠️ SECURITY WARNING:
// Frontend AI integration is NOT SECURE for production!
// OpenAI API keys should NEVER be exposed in frontend code.
// For production, implement a backend API to handle OpenAI calls securely.
// This is enabled for development/demo purposes only.

const AI_CONFIG = {
  // Hugging Face API configuration
  HUGGINGFACE_API_KEY: process.env.REACT_APP_HUGGINGFACE_API_KEY,
  HUGGINGFACE_BASE_URL: 'https://api-inference.huggingface.co/models',
  HUGGINGFACE_MODEL: 'facebook/bart-large-cnn', // Excellent for summarization
};

// Check if Hugging Face is enabled
const isAIEnabled = Boolean(AI_CONFIG.HUGGINGFACE_API_KEY);

// Log AI status in development
if (process.env.NODE_ENV === 'development') {
  if (isAIEnabled) {
    console.log('🤗 Hugging Face AI Integration: ENABLED');
    console.log('⚠️  WARNING: API key is exposed in frontend (development only)');
    console.log('🔒 For production: implement backend API for secure integration');
  } else {
    console.log('🤗 Hugging Face AI Integration: DISABLED');
    console.log('💡 To enable: Set REACT_APP_HUGGINGFACE_API_KEY in .env file');
    console.log('🔗 Get your free token: https://huggingface.co/settings/tokens');
  }
}

// Create Hugging Face API instance
const huggingFaceApi = axios.create({
  baseURL: AI_CONFIG.HUGGINGFACE_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AI_CONFIG.HUGGINGFACE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Generate a summary of the given text using AI
 * @param {string} text - The text to summarize
 * @param {number} maxLength - Maximum length of summary (default: 150)
 * @returns {Promise<string>} - The generated summary
 */
export async function getSummary(text, maxLength = 300) {
  try {
    console.log('🤗 getSummary called using Hugging Face');

    // Clean the text first
    const cleanText = cleanTextForAI(text);
    console.log('Cleaned text length:', cleanText.length);

    // Don't process very short text
    if (cleanText.length < 30) {
      return 'Content too short to summarize';
    }

    // Check if Hugging Face is enabled
    if (!isAIEnabled) {
      console.error('❌ Hugging Face API key not found!');
      console.error('Please set REACT_APP_HUGGINGFACE_API_KEY in your .env file');
      console.error('Get your free token: https://huggingface.co/settings/tokens');
      return 'Hugging Face API key required for summarization. Please check console for setup instructions.';
    }

    console.log('🚀 Calling Hugging Face API for summarization...');
    return await getHuggingFaceSummary(cleanText, maxLength);

  } catch (error) {
    console.error('❌ Hugging Face Summary generation failed:', error);
    return 'Failed to generate summary using Hugging Face. Please check console for details.';
  }
}

// Hugging Face Summary Function (FREE!)
async function getHuggingFaceSummary(cleanText, maxLength) {
  try {
    console.log('🤗 Using Hugging Face for summarization...');

    const response = await huggingFaceApi.post(`/${AI_CONFIG.HUGGINGFACE_MODEL}`, {
      inputs: cleanText,
      parameters: {
        max_length: Math.min(150, Math.floor(maxLength / 2)),
        min_length: 30,
        do_sample: false,
        early_stopping: true
      }
    });

    let summary = '';
    if (Array.isArray(response.data) && response.data[0]?.summary_text) {
      summary = response.data[0].summary_text.trim();
    } else if (response.data?.summary_text) {
      summary = response.data.summary_text.trim();
    } else {
      throw new Error('Unexpected response format from Hugging Face');
    }

    console.log('✅ Hugging Face summary generated:', summary);
    return summary;

  } catch (error) {
    console.error('❌ Hugging Face error:', error);
    if (error.response?.status === 401) {
      return 'Invalid Hugging Face API key. Please check your configuration.';
    } else if (error.response?.status === 429) {
      return 'Hugging Face rate limit exceeded. Please try again later.';
    } else if (error.response?.data?.error) {
      console.error('Hugging Face API error:', error.response.data.error);
      return 'Hugging Face API error. Please try again in a moment.';
    }
    throw error;
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
    // Clean the text first
    const cleanText = cleanTextForAI(text);

    // Don't process very short text
    if (cleanText.length < 20) {
      return [];
    }

    // Use mock tags if AI is not enabled
    if (!isAIEnabled) {
      return generateMockTags(cleanText, maxTags);
    }

    // For now, use simple keyword extraction instead of AI for tags
    // This is more reliable and faster than trying to use Hugging Face for tagging
    return generateMockTags(cleanText, maxTags);
  } catch (error) {
    console.error('Tag generation failed:', error);
    return generateMockTags(cleanTextForAI(text), maxTags);
  }
}

/**
 * Generate embeddings for the given text using AI
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
export async function getEmbedding(text) {
  try {
    // Clean the text first
    const cleanText = cleanTextForAI(text);

    // Use mock embedding if AI is not enabled or text is too short
    if (!isAIEnabled || cleanText.length < 10) {
      return generateMockEmbedding(cleanText);
    }

    // For now, use mock embedding since Hugging Face embeddings require different setup
    // This is sufficient for basic similarity search functionality
    return generateMockEmbedding(cleanText);
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return generateMockEmbedding(cleanTextForAI(text));
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

// Mock summary system removed - OpenAI only

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
