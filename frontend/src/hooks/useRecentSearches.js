import { useState, useEffect } from 'react';

const STORAGE_KEY = 'todoist_recent_searches';
const MAX_SEARCHES = 4;

/**
 * Custom hook for managing recent searches with localStorage persistence
 * 
 * Features:
 * - Persists across sessions
 * - Max 4 searches (FIFO queue)
 * - Duplicate prevention (case-insensitive)
 * - Individual item removal
 * - Bulk clear functionality
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
      setRecentSearches([]);
    }
  }, []);

  // Save to localStorage whenever searches change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, [recentSearches]);

  /**
   * Add a search query to recent searches
   * - Removes duplicates (case-insensitive)
   * - Adds to front of array
   * - Keeps only MAX_SEARCHES items (FIFO)
   */
  const addSearch = (query) => {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return;
    }

    const trimmedQuery = query.trim();

    setRecentSearches((prev) => {
      // Remove duplicate (case-insensitive comparison)
      const filtered = prev.filter(
        (search) => search.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add to front and keep only MAX_SEARCHES items
      const updated = [trimmedQuery, ...filtered].slice(0, MAX_SEARCHES);
      
      return updated;
    });
  };

  /**
   * Remove a specific search from recent searches
   */
  const removeSearch = (query) => {
    setRecentSearches((prev) =>
      prev.filter((search) => search !== query)
    );
  };

  /**
   * Clear all recent searches
   */
  const clearSearches = () => {
    setRecentSearches([]);
  };

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
