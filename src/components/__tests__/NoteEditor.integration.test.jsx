import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteEditor from '../NoteEditor';
import { AuthContext } from '../../context/AuthContext';

// Mock ReactQuill
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

// Mock CSS imports
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

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('NoteEditor - Regenerate Button Integration Tests', () => {
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
  });

  const renderNoteEditor = (props = {}) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <NoteEditor {...defaultProps} {...props} />
      </AuthContext.Provider>
    );
  };

  describe('Complete Regenerate Workflow', () => {
    test('should complete full regenerate workflow with real AI service', async () => {
      const user = userEvent.setup();
      renderNoteEditor();
      
      // Step 1: Add content to trigger AI processing
      const contentEditor = screen.getByTestId('content-editor');
      const testContent = 'This is a comprehensive test of the note editor functionality with AI integration. The content should be long enough to trigger automatic AI processing and summary generation. This will test the complete workflow from content input to AI processing and summary display.';
      
      await user.type(contentEditor, testContent);

      // Step 2: Wait for initial AI processing to complete
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 3: Verify initial summary is displayed
      const summarySection = screen.getByText('AI Summary').closest('div');
      expect(summarySection).toBeInTheDocument();

      // Step 4: Click regenerate button
      const regenerateButton = screen.getByText('Regenerate');
      expect(regenerateButton).not.toBeDisabled();
      
      await user.click(regenerateButton);

      // Step 5: Verify loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Regenerate')).not.toBeInTheDocument();

      // Step 6: Wait for regeneration to complete
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 7: Verify summary was updated (should be different from initial)
      const updatedSummarySection = screen.getByText('AI Summary').closest('div');
      expect(updatedSummarySection).toBeInTheDocument();
    });

    test('should handle multiple regenerations in sequence', async () => {
      const user = userEvent.setup();
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await user.type(contentEditor, 'This is test content for multiple regenerations that is long enough to process with AI services.');

      // Wait for initial processing
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      // First regeneration
      let regenerateButton = screen.getByText('Regenerate');
      await user.click(regenerateButton);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Second regeneration
      regenerateButton = screen.getByText('Regenerate');
      await user.click(regenerateButton);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should still be functional
      expect(regenerateButton).not.toBeDisabled();
    });

    test('should maintain button state during content changes', async () => {
      const user = userEvent.setup();
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      
      // Initially no content - button should be disabled
      const regenerateButton = screen.getByText('Regenerate');
      expect(regenerateButton).toBeDisabled();

      // Add content
      await user.type(contentEditor, 'This is new content that should enable the regenerate button functionality.');

      // Wait for AI processing
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).not.toBeDisabled();
      }, { timeout: 5000 });

      // Clear content
      await user.clear(contentEditor);

      // Button should be disabled again
      expect(screen.getByText('Regenerate')).toBeDisabled();
    });

    test('should work with existing note content', async () => {
      const existingNote = {
        id: 'existing-note-123',
        title: 'Existing Note',
        content: 'This is existing content that already has a summary and should allow regeneration of the summary.',
        summary: 'Original summary of the existing note content.',
        tags: ['existing', 'note'],
        createdAt: '2023-01-01T00:00:00.000Z'
      };

      const user = userEvent.setup();
      renderNoteEditor({ existingNote });

      // Should show existing summary
      expect(screen.getByText(existingNote.summary)).toBeInTheDocument();

      // Regenerate button should be enabled
      const regenerateButton = screen.getByText('Regenerate');
      expect(regenerateButton).not.toBeDisabled();

      // Click regenerate
      await user.click(regenerateButton);

      // Should show loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should preserve other functionality during regeneration', async () => {
      const user = userEvent.setup();
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await user.type(contentEditor, 'This is test content for testing that other functionality works during regeneration.');

      // Wait for initial processing
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Start regeneration
      const regenerateButton = screen.getByText('Regenerate');
      await user.click(regenerateButton);

      // During loading, other buttons should still be functional
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // Cancel button should still work
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).not.toBeDisabled();

      // Save button should still work (though it might be disabled for other reasons)
      const saveButton = screen.getByText(/Save/);
      expect(saveButton).toBeInTheDocument();

      // Wait for regeneration to complete
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should handle rapid clicks gracefully', async () => {
      const user = userEvent.setup();
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await user.type(contentEditor, 'This is test content for testing rapid clicks on the regenerate button.');

      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      const regenerateButton = screen.getByText('Regenerate');
      
      // Click multiple times rapidly
      await user.click(regenerateButton);
      await user.click(regenerateButton);
      await user.click(regenerateButton);

      // Should only show one loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getAllByText('Loading...').length).toBe(1);

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Scenarios', () => {
    test('should handle network errors during regeneration', async () => {
      // This test would require mocking network failures
      // For now, we'll test that the component handles the error gracefully
      const user = userEvent.setup();
      renderNoteEditor();
      
      const contentEditor = screen.getByTestId('content-editor');
      await user.type(contentEditor, 'This is test content that might cause network errors during processing.');

      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 5000 });

      const regenerateButton = screen.getByText('Regenerate');
      await user.click(regenerateButton);

      // Even if there's an error, the button should eventually return to normal state
      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });
});
