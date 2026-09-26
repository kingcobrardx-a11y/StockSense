import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  width = '280px',
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`search-bar-wrap ${className}`} style={{ maxWidth: width }}>
      <Search size={16} className="search-icon" />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClear}
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
