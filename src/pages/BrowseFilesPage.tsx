import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFilesByCategory, files } from '../data/mockData';
import FileGrid from '../components/files/FileGrid';
import CategoryFilter from '../components/files/CategoryFilter';
import MainLayout from '../components/layout/MainLayout';

const BrowseFilesPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [sortOption, setSortOption] = useState('newest');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    let result = category ? getFilesByCategory(category) : [...files];
    
    // Apply price filter
    if (priceFilter === 'free') {
      result = result.filter(file => file.isFree);
    } else if (priceFilter === 'paid') {
      result = result.filter(file => !file.isFree);
    }
    
    // Apply sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredFiles(result);
  }, [category, sortOption, priceFilter]);

  const categoryTitle = category 
    ? category.charAt(0).toUpperCase() + category.slice(1) 
    : 'All Files';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{categoryTitle}</h1>
          <p className="text-gray-600">Browse our collection of high-quality digital files</p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar Filters */}
          <div className="w-full md:w-1/4 md:pr-6 mb-6 md:mb-0">
            <CategoryFilter />
            
            <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Price</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === 'all'}
                    onChange={() => setPriceFilter('all')}
                    className="form-radio text-blue-600 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === 'free'}
                    onChange={() => setPriceFilter('free')}
                    className="form-radio text-blue-600 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700">Free</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === 'paid'}
                    onChange={() => setPriceFilter('paid')}
                    className="form-radio text-blue-600 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700">Paid</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <span className="text-gray-700 mr-2">Sort by:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-700">{filteredFiles.length} files found</span>
                </div>
              </div>
            </div>

            {filteredFiles.length > 0 ? (
              <FileGrid files={filteredFiles} />
            ) : (
              <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No files found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or browse a different category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BrowseFilesPage;