import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { categories } from '../../data/mockData';

const CategoryFilter: React.FC = () => {
  const location = useLocation();
  const currentCategory = location.pathname.split('/browse/')[1] || '';

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            to="/browse"
            className={`block px-3 py-2 rounded-md transition-colors ${
              !currentCategory
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Files
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/browse/${category.slug}`}
              className={`block px-3 py-2 rounded-md transition-colors ${
                currentCategory === category.slug
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter;