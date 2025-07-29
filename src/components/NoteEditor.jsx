import { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NoteEditor.css'; // Custom styling for dark/light mode
import { v4 as uuidv4 } from 'uuid';
import { getSummary, getTags, getEmbedding } from '../services/ai';
import { useAuth } from '../context/AuthContext';

export default function NoteEditor({ existingNote, onSave, onCancel }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [tags, setTags] = useState(existingNote?.tags || []);
  const [summary, setSummary] = useState(existingNote?.summary || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [embedding, setEmbedding] = useState(existingNote?.embedding || null);

  // Helper function to check if content has meaningful text
  const hasMeaningfulContent = (htmlContent) => {
    if (!htmlContent) return false;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return textContent.trim().length > 0;
  };

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = existingNote?.id || 'new-note-draft';
    const draft = {
      title,
      content,
      tags,
      timestamp: Date.now()
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [title, content, tags, existingNote?.id]);

  // Load draft on mount for new notes
  useEffect(() => {
    if (!existingNote) {
      const draft = localStorage.getItem('new-note-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setContent(parsed.content || '');
        setTags(parsed.tags || []);
      }
    }
  }, [existingNote]);

  // AI processing for content changes
  useEffect(() => {
    if (!content || content.length < 50) return; // Only process substantial content

    const timeout = setTimeout(async () => {
      await processWithAI();
    }, 1500); // Process with AI after 1.5 seconds of inactivity

    return () => clearTimeout(timeout);
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-save (wait for AI processing to complete)
  useEffect(() => {
    if (!title && !content) return;
    if (aiProcessing) return; // Don't auto-save while AI is processing

    const timeout = setTimeout(async () => {
      await handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity (increased to allow AI processing)

    return () => clearTimeout(timeout);
  }, [title, content, tags, aiProcessing]); // eslint-disable-line react-hooks/exhaustive-deps

  const processWithAI = useCallback(async () => {
    if (!content || content.length < 50) return;

    setAiProcessing(true);
    try {
      console.log('Processing with AI, content length:', content.length);
      console.log('Content preview:', content.substring(0, 100));

      const [aiSummary, aiTags, aiEmbedding] = await Promise.all([
        getSummary(content),
        getTags(content),
        getEmbedding(content)
      ]);

      console.log('AI Summary generated:', aiSummary);
      console.log('AI Tags generated:', aiTags);

      setSummary(aiSummary);
      setEmbedding(aiEmbedding);

      // Merge AI tags with existing tags, avoiding duplicates
      const allTags = [...tags, ...aiTags].filter((tag, index, arr) =>
        arr.findIndex(t => t.toLowerCase() === tag.toLowerCase()) === index
      );
      setTags(allTags);
    } catch (error) {
      console.error('AI processing failed:', error);
    } finally {
      setAiProcessing(false);
    }
  }, [content, tags]);

  const handleAutoSave = useCallback(async () => {
    if (!title && !content) return;

    setSaving(true);
    try {
      const noteData = {
        id: existingNote?.id || uuidv4(),
        title: title || 'Untitled',
        content,
        tags,
        summary,
        embedding,
        ownerId: user?.uid,
        updatedAt: new Date().toISOString(),
        createdAt: existingNote?.createdAt || new Date().toISOString(),
        versions: existingNote?.versions || []
      };

      // Here you would typically save to your backend/database
      // For now, we'll just save to localStorage
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      const existingIndex = savedNotes.findIndex(note => note.id === noteData.id);
      
      if (existingIndex >= 0) {
        savedNotes[existingIndex] = noteData;
      } else {
        savedNotes.push(noteData);
      }
      
      localStorage.setItem('notes', JSON.stringify(savedNotes));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [title, content, tags, summary, existingNote, embedding, user?.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const noteData = {
        id: existingNote?.id || uuidv4(),
        title: title || 'Untitled',
        content,
        tags,
        summary,
        embedding,
        ownerId: user?.uid,
        updatedAt: new Date().toISOString(),
        createdAt: existingNote?.createdAt || new Date().toISOString(),
        versions: existingNote?.versions || []
      };

      await handleAutoSave();
      onSave?.(noteData);
      
      // Clear draft for new notes
      if (!existingNote) {
        localStorage.removeItem('new-note-draft');
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.target.value = '';
    }
  };



  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {existingNote ? 'Edit Note' : 'New Note'}
          </h2>
          {aiProcessing && (
            <span className="text-sm text-purple-600 dark:text-purple-400 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
              AI Processing...
            </span>
          )}
          {saving && !aiProcessing && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Saving...
            </span>
          )}
          {lastSaved && !saving && !aiProcessing && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="w-full text-3xl font-bold border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 mb-4"
      />

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tags (press Enter)..."
          onKeyDown={handleAddTag}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
        />
      </div>

      {/* Content Editor */}
      <div className="mb-6">
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={quillModules}
          placeholder="Start writing your note..."
          className="bg-white dark:bg-gray-800"
          style={{ minHeight: '300px' }}
        />
      </div>

      {/* Summary section - always show if there's content */}
      {(summary || hasMeaningfulContent(content)) && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              AI Summary
            </h3>
          </div>
          {summary ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{summary}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">
              {aiProcessing ? 'Generating summary...' : 'Click "Regenerate" to create an AI summary'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
