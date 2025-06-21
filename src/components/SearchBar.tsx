import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}

interface FilterOptions {
  priceRange: [number, number];
  thcRange: [number, number];
  category: string;
  inStock: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 200],
    thcRange: [0, 30],
    category: 'all',
    inStock: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 200],
      thcRange: [0, 30],
      category: 'all',
      inStock: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="card mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Filters</h4>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Clear all
            </button>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <div className="flex space-x-2">
              <input
                type="range"
                min="0"
                max="200"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange({ priceRange: [0, parseInt(e.target.value)] })}
                className="flex-1"
              />
            </div>
          </div>

          {/* THC Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              THC Content: {filters.thcRange[0]}% - {filters.thcRange[1]}%
            </label>
            <div className="flex space-x-2">
              <input
                type="range"
                min="0"
                max="30"
                value={filters.thcRange[1]}
                onChange={(e) => handleFilterChange({ thcRange: [0, parseInt(e.target.value)] })}
                className="flex-1"
              />
            </div>
          </div>

          {/* In Stock Only */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="inStock" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              In stock only
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 