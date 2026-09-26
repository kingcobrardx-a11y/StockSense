import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by name, SKU, ref...',
  onClear,
  className = '',
}) {
  return (
    <div className={`search-bar-wrap ${className}`}>
      <Search size={16} className="search-icon" />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
