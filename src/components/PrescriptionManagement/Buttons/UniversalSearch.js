import React, { useState, useRef, useEffect } from 'react';
import { BsSearch } from 'react-icons/bs';
import { debounce } from 'lodash';

const UniversalSearch = ({ 
  onSearch, 
  placeholder = "Search across all fields...",
  debounceTime = 300 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchRef = useRef();

  // Crear y actualizar la función debounced cuando cambian las dependencias
  useEffect(() => {
    debouncedSearchRef.current = debounce((term) => {
      onSearch(term);
    }, debounceTime);
    
    // Limpieza al desmontar el componente
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [onSearch, debounceTime]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(term);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSearchSubmit} className="universal-search-container">
      <div className="input-group">
        <span className="input-group-text">
          <BsSearch />
        </span>
        <input
          type="text" 
          className="form-control" 
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={clearSearch}
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
};

export default UniversalSearch;