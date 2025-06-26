import React, { useState, useEffect } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar instrumentos...",
  disabled = false,
  suggestions = [],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange("");
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
          onFocus={() =>
            value && setShowSuggestions(filteredSuggestions.length > 0)
          }
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />

        <div className="search-icons">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
          <div className="search-icon">
            <img src="/icons/search.svg" alt="Buscar" />
          </div>
        </div>
      </div>

      {showSuggestions && (
        <div className="search-suggestions">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-icon">🎵</span>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
