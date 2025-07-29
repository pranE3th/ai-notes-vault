import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteEditor from '../NoteEditor';
import { AuthContext } from '../../context/AuthContext';
import * as aiService from '../../services/ai';

// Mock the AI service
jest.mock('../../services/ai');

// Mock ReactQuill to avoid issues with rich text editor in tests
jest.mock('react-quill', () => {
  return function MockReactQuill({ value, onChange, placeholder }) {
    return (
      <textarea
        data-testid="content-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };
});

// Mock CSS import
jest.mock('react-quill/dist/quill.snow.css', () => {});
jest.mock('../NoteEditor.css', () => {});

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123'
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('NoteEditor - Regenerate Button', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com'
  };

  const mockAuthContext = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  };

  const defaultProps = {
    onSave: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Setup default AI service mocks
    aiService.getSummary.mockResolvedValue('Test summary');
    aiService.getTags.mockResolvedValue(['test', 'tag']);
    aiService.getEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
  });

  const renderNoteEditor = (props = {}) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <NoteEditor {...defaultProps} {...props} />
      </AuthContext.Provider>
    );
  };

  describe('Regenerate Button Functionality', () => {
    test('should show regenerate button when content exists', async () => {
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, 'This is some test content for the note that is long enough to trigger AI processing');
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });
    });

    test('should disable regenerate button when no content', () => {
      renderNoteEditor();
      
      const regenerateButton = screen.getByText('Regenerate');
      expect(regenerateButton).toBeDisabled();
    });

    test('should show "Loading..." text when regenerating', async () => {
      // Make getSummary take some time to resolve
      aiService.getSummary.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('New summary'), 100))
      );

      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, 'This is some test content for the note that is long enough');
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // Should show "Loading..." immediately after click
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Regenerate')).not.toBeInTheDocument();
    });

    test('should change back to "Regenerate" after loading completes', async () => {
      aiService.getSummary.mockResolvedValue('New regenerated summary');

      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, 'This is some test content for the note that is long enough');
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // Should show "Loading..." during processing
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for processing to complete
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      // Should no longer show "Loading..."
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    test('should call getSummary with correct content when regenerate is clicked', async () => {
      const testContent = 'This is test content for regeneration that is long enough to process';
      
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, testContent);
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(aiService.getSummary).toHaveBeenCalledWith(testContent);
      });
    });

    test('should update summary with new content after regeneration', async () => {
      const newSummary = 'This is a newly regenerated summary';
      aiService.getSummary.mockResolvedValue(newSummary);

      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, 'This is some test content for the note that is long enough');
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(screen.getByText(newSummary)).toBeInTheDocument();
      });
    });

    test('should disable regenerate button during processing', async () => {
      aiService.getSummary.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('New summary'), 100))
      );

      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, 'This is some test content for the note that is long enough');
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // Button should be disabled during processing
      const loadingButton = screen.getByText('Loading...');
      expect(loadingButton).toBeDisabled();
    });

    test('should handle regeneration errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      aiService.getSummary.mockRejectedValue(new Error('AI service error'));

      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await userEvent.type(contentEditor, 'This is some test content for the note that is long enough');
      
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for error handling to complete
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to regenerate summary:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    test('should not call getSummary if content is empty', async () => {
      renderNoteEditor();
      
      // Try to click regenerate without content
      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // getSummary should not be called
      expect(aiService.getSummary).not.toHaveBeenCalled();
    });
  });

  describe('Regenerate Button with Existing Note', () => {
    test('should work with existing note content', async () => {
      const existingNote = {
        id: 'existing-note-123',
        title: 'Existing Note',
        content: 'This is existing content that is long enough for AI processing',
        summary: 'Original summary',
        tags: ['existing'],
        createdAt: '2023-01-01T00:00:00.000Z'
      };

      renderNoteEditor({ existingNote });

      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });

      const regenerateButton = screen.getByText('Regenerate');
      expect(regenerateButton).not.toBeDisabled();

      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(aiService.getSummary).toHaveBeenCalledWith(existingNote.content);
      });
    });
  });
});
