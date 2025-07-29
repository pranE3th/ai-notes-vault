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

  return cleanText;
}

// ⚠️ SECURITY WARNING:
// Frontend AI integration is NOT SECURE for production!
// OpenAI API keys should NEVER be exposed in frontend code.
// This implementation uses mock AI for security.

const AI_CONFIG = {
  // For security, we don't use real API keys in frontend
  OPENAI_API_KEY: null, // Intentionally disabled for security
  OPENAI_BASE_URL: 'https://api.openai.com/v1',

  // Model configurations (for reference)
  SUMMARY_MODEL: 'gpt-3.5-turbo',
  EMBEDDING_MODEL: 'text-embedding-ada-002',
  TAGGING_MODEL: 'gpt-3.5-turbo',
};

// AI is intentionally disabled in frontend for security
const isAIEnabled = false;

// Log security notice in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 AI Security Notice:');
  console.log('Real OpenAI integration is disabled for security reasons.');
  console.log('Frontend apps should not contain API keys.');
  console.log('Using enhanced mock AI instead.');
  console.log('For production: implement backend API for secure OpenAI integration.');
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
    console.log('getSummary called with text:', text.substring(0, 100));

    // Clean the text first
    const cleanText = cleanTextForAI(text);
    console.log('Cleaned text:', cleanText.substring(0, 100));

    // Don't process very short text
    if (cleanText.length < 50) {
      console.log('Text too short, returning as-is');
      return cleanText.length > 0 ? cleanText : 'No content to summarize';
    }

    // Use mock summary if AI is not enabled
    if (!isAIEnabled) {
      console.log('AI not enabled, using mock summary');
      const mockSummary = generateMockSummary(cleanText, maxLength);
      console.log('Mock summary generated:', mockSummary);
      return mockSummary;
    }

    const response = await openaiApi.post('/chat/completions', {
      model: AI_CONFIG.SUMMARY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that creates concise, professional summaries. Create a summary of the given text in approximately ${maxLength} characters or less. Focus on the main points and key information. Return only the summary without any additional text or formatting.`
        },
        {
          role: 'user',
          content: `Please summarize this text: ${cleanText}`
        }
      ],
      max_tokens: Math.ceil(maxLength / 3), // Rough estimate for token count
      temperature: 0.3,
    });

    const summary = response.data.choices[0].message.content.trim();

    // Ensure the summary is not just repeating the original text
    if (summary.length > cleanText.length * 0.8) {
      return generateMockSummary(cleanText, maxLength);
    }

    return summary;
  } catch (error) {
    console.error('Summary generation failed:', error);
    return generateMockSummary(cleanTextForAI(text), maxLength);
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

    const response = await openaiApi.post('/chat/completions', {
      model: AI_CONFIG.TAGGING_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates relevant tags for content. Generate up to ${maxTags} relevant, concise tags for the given text. Return only the tags as a comma-separated list, no additional text. Tags should be single words or short phrases, relevant to the content.`
        },
        {
          role: 'user',
          content: `Generate tags for this text: ${cleanText}`
        }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const tagsString = response.data.choices[0].message.content.trim();
    const tags = tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);

    // Remove duplicates and limit to maxTags
    return [...new Set(tags)].slice(0, maxTags);
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

    const response = await openaiApi.post('/embeddings', {
      model: AI_CONFIG.EMBEDDING_MODEL,
      input: cleanText,
    });

    return response.data.data[0].embedding;
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

// Mock functions for demo purposes
function generateMockSummary(text, maxLength) {
  if (!text || text.length < 10) {
    return 'No content to summarize';
  }

  const cleanText = text.toLowerCase().trim();

  // If text is already short enough, return as is
  if (text.length <= maxLength) {
    return text;
  }

  // Intelligent content analysis for better summaries
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);

  // Detect content type and create appropriate summary
  if (cleanText.includes('recipe') || cleanText.includes('ingredients') || cleanText.includes('cook')) {
    return 'Recipe with cooking instructions and ingredients list.';
  }

  if (cleanText.includes('meeting') || cleanText.includes('standup') || cleanText.includes('attendees')) {
    return 'Meeting notes with discussion points and action items.';
  }

  if (cleanText.includes('project') || cleanText.includes('plan') || cleanText.includes('phase')) {
    return 'Project planning document with timeline and objectives.';
  }

  if (cleanText.includes('learn') || cleanText.includes('study') || cleanText.includes('concept')) {
    return 'Educational notes covering key concepts and learning materials.';
  }

  // Personal/emotional content
  if (cleanText.includes('life') || cleanText.includes('feel') || cleanText.includes('hate') || cleanText.includes('job')) {
    return 'Personal reflection and thoughts about life circumstances.';
  }

  // Technical content
  if (cleanText.includes('code') || cleanText.includes('function') || cleanText.includes('api')) {
    return 'Technical documentation or code-related notes.';
  }

  // Default intelligent summary
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (sentences.length > 0) {
    // Take the first sentence if it's not too long
    const firstSentence = sentences[0].trim();
    if (firstSentence.length <= maxLength) {
      return firstSentence + '.';
    }
  }

  // Extract key themes from the text
  const keyWords = words.filter(word =>
    word.length > 4 &&
    !['that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word)
  );

  if (keyWords.length > 0) {
    const themes = keyWords.slice(0, 3).join(', ');
    return `Note covering topics related to ${themes}.`;
  }

  // Final fallback
  const targetWords = Math.floor(maxLength / 6);
  const summary = words.slice(0, targetWords).join(' ');
  return summary + (words.length > targetWords ? '...' : '');
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
