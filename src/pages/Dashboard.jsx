import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import SearchBar from '../components/SearchBar';
import { loadDemoData } from '../utils/demoData';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');

    // Load demo data if no notes exist
    if (savedNotes.length === 0) {
      const demoLoaded = loadDemoData();
      if (demoLoaded) {
        const demoNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        const sortedDemoNotes = demoNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotes(sortedDemoNotes);
        setFilteredNotes(sortedDemoNotes);
        return;
      }
    }

    // Sort notes by creation date (newest first)
    const sortedNotes = savedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setNotes(sortedNotes);
    setFilteredNotes(sortedNotes);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleViewNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = (noteData) => {
    const updatedNotes = editingNote
      ? notes.map(note => note.id === editingNote.id ? noteData : note)
      : [...notes, noteData];

    // Sort notes by creation date (newest first)
    const sortedNotes = updatedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setNotes(sortedNotes);
    setFilteredNotes(sortedNotes);
    localStorage.setItem('notes', JSON.stringify(sortedNotes));
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteToDelete) => {
    const updatedNotes = notes.filter(note => note.id !== noteToDelete.id);
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleSearchResults = (results) => {
    setFilteredNotes(results);
  };

  const handleClearSearch = () => {
    setFilteredNotes(notes);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <NoteEditor
          existingNote={editingNote}
          onSave={handleSaveNote}
          onCancel={() => setShowEditor(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Notes Vault
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.displayName || user?.email}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* AI Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400" title="Using secure mock AI - no API keys exposed">
                  AI: Secure
                </span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Role: {user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Search and Controls */}
          <div className="mb-8">
            <SearchBar
              notes={notes}
              onResults={handleSearchResults}
              onClear={handleClearSearch}
            />

            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Notes ({filteredNotes.length})
                </h2>

                {/* View Mode Toggle */}
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateNote}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* Notes Grid/List */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {notes.length === 0 ? 'No notes yet' : 'No notes found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {notes.length === 0
                  ? 'Start creating your AI-powered notes!'
                  : 'Try adjusting your search terms.'
                }
              </p>
              {notes.length === 0 && (
                <button
                  onClick={handleCreateNote}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Your First Note
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onView={handleViewNote}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
