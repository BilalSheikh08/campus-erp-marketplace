/**
 * Search bar component with real-time search.
 */

import { Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search listings...' }) {
  const [query, setQuery] = useState('');

  // Debounce search
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      const debounceTimer = setTimeout(() => {
        onSearch(value);
      }, 300);
      return () => clearTimeout(debounceTimer);
    },
    [onSearch],
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
