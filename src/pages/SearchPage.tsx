import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, SortAsc } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import FileGrid from '../components/files/FileGrid';
import SearchBar from '../components/search/SearchBar';
import Button from '../components/ui/Button';
import { File } from '../types';

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  sortBy: string;
}

interface SearchResult {
  files: File[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    searchQuery?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isFree?: boolean;
    sortBy: string;
  };
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance'
  });

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, page, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '20',
        sortBy: filters.sortBy,
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice !== undefined && { minPrice: filters.minPrice.toString() }),
        ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.isFree !== undefined && { isFree: filters.isFree.toString() })
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setSearchResult(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', newQuery);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'business-documents', label: 'Business Documents' },
    { value: 'design-templates', label: 'Design Templates' },
    { value: 'presentations', label: 'Presentations' },
    { value: 'spreadsheets', label: 'Spreadsheets' },
    { value: 'graphics', label: 'Graphics' },
    { value: 'web-templates', label: 'Web Templates' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {query ? `Search Results for "${query}"` : 'Search Files'}
          </h1>
          
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for files, templates, graphics..."
            />
          </div>
        </div>

        {/* Results and Filters */}
        {searchResult && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={filters.isFree === undefined}
                        onChange={() => handleFilterChange({ isFree: undefined, minPrice: undefined, maxPrice: undefined })}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={filters.isFree === true}
                        onChange={() => handleFilterChange({ isFree: true, minPrice: undefined, maxPrice: undefined })}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Free</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={filters.isFree === false}
                        onChange={() => handleFilterChange({ isFree: false })}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Paid</span>
                    </label>
                  </div>

                  {filters.isFree === false && (
                    <div className="mt-3 space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ''}
                          onChange={(e) => handleFilterChange({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setFilters({ sortBy: 'relevance' })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:w-3/4">
              {/* Results Header */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-gray-700">
                      {loading ? 'Searching...' : `${searchResult.pagination.total} results found`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Mobile Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <Filter size={16} className="mr-2" />
                      Filters
                    </button>

                    {/* Sort */}
                    <div className="flex items-center space-x-2">
                      <SortAsc size={16} className="text-gray-500" />
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex border border-gray-300 rounded-md">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : searchResult.files.length > 0 ? (
                <>
                  <FileGrid files={searchResult.files} />
                  
                  {/* Pagination */}
                  {searchResult.pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex space-x-2">
                        {searchResult.pagination.hasPrev && (
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(searchResult.pagination.page - 1)}
                          >
                            Previous
                          </Button>
                        )}
                        
                        {Array.from({ length: Math.min(5, searchResult.pagination.totalPages) }, (_, i) => {
                          const pageNum = searchResult.pagination.page - 2 + i;
                          if (pageNum < 1 || pageNum > searchResult.pagination.totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === searchResult.pagination.page ? 'primary' : 'outline'}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        {searchResult.pagination.hasNext && (
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(searchResult.pagination.page + 1)}
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button onClick={() => handleFilterChange({ category: undefined, isFree: undefined, minPrice: undefined, maxPrice: undefined })}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchPage;