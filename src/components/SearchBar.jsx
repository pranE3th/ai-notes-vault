import { useState, useEffect } from 'react';
import { semanticSearch } from '../services/ai';

export default function SearchBar({ notes, onResults, onClear }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('text'); // 'text' or 'semantic'
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      onClear?.();
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, notes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (!query.trim()) {
      onClear?.();
      return;
    }

    setIsSearching(true);

    try {
      let results = [];

      if (searchType === 'text') {
        // Simple text search
        results = notes.filter(note => {
          const searchText = query.toLowerCase();
          return (
            note.title?.toLowerCase().includes(searchText) ||
            note.content?.toLowerCase().includes(searchText) ||
            note.summary?.toLowerCase().includes(searchText) ||
            note.tags?.some(tag => tag.toLowerCase().includes(searchText))
          );
        });
      } else {
        // Semantic search (placeholder - would use AI embeddings in real implementation)
        results = await performSemanticSearch(query, notes);
      }

      // Sort by relevance (simple scoring for now)
      results.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, query);
        const scoreB = calculateRelevanceScore(b, query);
        return scoreB - scoreA;
      });

      onResults?.(results);
    } catch (error) {
      console.error('Search failed:', error);
      onResults?.([]);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRelevanceScore = (note, query) => {
    const searchText = query.toLowerCase();
    let score = 0;

    // Title matches get highest score
    if (note.title?.toLowerCase().includes(searchText)) {
      score += 10;
    }

    // Summary matches get medium score
    if (note.summary?.toLowerCase().includes(searchText)) {
      score += 5;
    }

    // Content matches get lower score
    if (note.content?.toLowerCase().includes(searchText)) {
      score += 2;
    }

    // Tag matches get medium score
    if (note.tags?.some(tag => tag.toLowerCase().includes(searchText))) {
      score += 7;
    }

    return score;
  };

  const performSemanticSearch = async (query, notes) => {
    try {
      const results = await semanticSearch(query, notes);
      return results;
    } catch (error) {
      console.error('Semantic search failed, falling back to text search:', error);
      return notes.filter(note => {
        const searchText = query.toLowerCase();
        return (
          note.title?.toLowerCase().includes(searchText) ||
          note.content?.toLowerCase().includes(searchText) ||
          note.summary?.toLowerCase().includes(searchText) ||
          note.tags?.some(tag => tag.toLowerCase().includes(searchText))
        );
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your notes..."
            className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Loading/Clear Button */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {isSearching ? (
              <div className="pr-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            ) : query ? (
              <button
                onClick={handleClear}
                className="pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Search Type Toggle */}
        <div className="flex justify-center mt-3">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setSearchType('text')}
              className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
                searchType === 'text'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Text Search
            </button>
            <button
              type="button"
              onClick={() => setSearchType('semantic')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
                searchType === 'semantic'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              AI Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
