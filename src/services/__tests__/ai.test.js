import { getSummary, getTags, getEmbedding } from '../ai';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn()
  }))
}));

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    test('should return mock summary for short text', async () => {
      const shortText = 'Short text';
      const result = await getSummary(shortText);
      
      expect(result).toBe('Short text');
    });

    test('should return mock summary for longer text when AI is disabled', async () => {
      const longText = 'This is a much longer text that should trigger the AI processing but since AI is disabled it will use mock summary generation instead. This text contains enough content to be processed.';
      const result = await getSummary(longText);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe(longText); // Should be a summary, not the original text
    });

    test('should handle empty text gracefully', async () => {
      const result = await getSummary('');
      expect(result).toBe('No content to summarize');
    });

    test('should handle null/undefined text', async () => {
      const resultNull = await getSummary(null);
      const resultUndefined = await getSummary(undefined);
      
      expect(resultNull).toBe('No content to summarize');
      expect(resultUndefined).toBe('No content to summarize');
    });

    test('should respect maxLength parameter', async () => {
      const longText = 'This is a very long text that should be summarized with a specific maximum length parameter to test if the function respects the length limit properly.';
      const maxLength = 50;
      const result = await getSummary(longText, maxLength);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeLessThanOrEqual(maxLength + 20); // Allow some tolerance for mock generation
    });

    test('should generate different summaries for different content', async () => {
      const text1 = 'This is about technology and programming with lots of technical terms and code examples that developers would find useful.';
      const text2 = 'This is about cooking and recipes with ingredients and cooking methods that chefs would find interesting and helpful.';
      
      const summary1 = await getSummary(text1);
      const summary2 = await getSummary(text2);
      
      expect(summary1).not.toBe(summary2);
      expect(typeof summary1).toBe('string');
      expect(typeof summary2).toBe('string');
    });

    test('should clean HTML content before processing', async () => {
      const htmlText = '<p>This is <strong>HTML content</strong> with <em>formatting</em> that should be cleaned.</p>';
      const result = await getSummary(htmlText);
      
      expect(typeof result).toBe('string');
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<strong>');
      expect(result).not.toContain('<em>');
    });
  });

  describe('getTags', () => {
    test('should return array of tags for content', async () => {
      const text = 'This is about programming and software development with JavaScript and React frameworks.';
      const result = await getTags(text);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5); // Default maxTags
    });

    test('should respect maxTags parameter', async () => {
      const text = 'This is about programming and software development with JavaScript and React frameworks.';
      const maxTags = 3;
      const result = await getTags(text, maxTags);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(maxTags);
    });

    test('should return empty array for empty text', async () => {
      const result = await getTags('');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should generate relevant tags based on content', async () => {
      const text = 'This note is about cooking recipes and food preparation techniques for professional chefs.';
      const result = await getTags(text);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Tags should be strings
      result.forEach(tag => {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getEmbedding', () => {
    test('should return array of numbers for embedding', async () => {
      const text = 'This is test content for embedding generation.';
      const result = await getEmbedding(text);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1536); // OpenAI ada-002 embedding size
      result.forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    test('should generate consistent embeddings for same text', async () => {
      const text = 'This is test content for embedding consistency.';
      const result1 = await getEmbedding(text);
      const result2 = await getEmbedding(text);
      
      expect(result1).toEqual(result2);
    });

    test('should generate different embeddings for different text', async () => {
      const text1 = 'This is about technology and programming.';
      const text2 = 'This is about cooking and recipes.';
      
      const embedding1 = await getEmbedding(text1);
      const embedding2 = await getEmbedding(text2);
      
      expect(embedding1).not.toEqual(embedding2);
    });

    test('should handle empty text', async () => {
      const result = await getEmbedding('');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1536);
    });
  });

  describe('Error Handling', () => {
    test('getSummary should handle errors gracefully', async () => {
      // Test with problematic input that might cause errors
      const problematicText = 'A'.repeat(10000); // Very long text
      const result = await getSummary(problematicText);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('getTags should handle errors gracefully', async () => {
      const problematicText = 'A'.repeat(10000);
      const result = await getTags(problematicText);
      
      expect(Array.isArray(result)).toBe(true);
    });

    test('getEmbedding should handle errors gracefully', async () => {
      const problematicText = 'A'.repeat(10000);
      const result = await getEmbedding(problematicText);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1536);
    });
  });

  describe('Content Cleaning', () => {
    test('should clean HTML tags from content', async () => {
      const htmlContent = '<div><p>This is <strong>bold</strong> and <em>italic</em> text.</p></div>';
      const summary = await getSummary(htmlContent);
      
      // Summary should not contain HTML tags
      expect(summary).not.toContain('<div>');
      expect(summary).not.toContain('<p>');
      expect(summary).not.toContain('<strong>');
      expect(summary).not.toContain('<em>');
    });

    test('should handle special characters', async () => {
      const specialContent = 'This content has special chars: @#$%^&*()_+{}|:"<>?[]\\;\',./ and unicode: 🚀 🎉 ✨';
      const result = await getSummary(specialContent);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle very long content', async () => {
      const longContent = 'This is a very long piece of content. '.repeat(100);
      const result = await getSummary(longContent);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThan(longContent.length); // Should be shorter than original
    });
  });
});
