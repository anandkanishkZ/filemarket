import React from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, Download, CreditCard, Clock } from 'lucide-react';
import { getFeaturedFiles, files } from '../data/mockData';
import FileGrid from '../components/files/FileGrid';
import Button from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';

const HomePage: React.FC = () => {
  const featuredFiles = getFeaturedFiles();
  const recentFiles = [...files].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Discover & Download Premium Digital Files
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Access thousands of high-quality templates, graphics, documents and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    Browse Files
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-500">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="bg-white p-6 rounded-lg shadow-xl transform rotate-2">
                <img 
                  src="https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg" 
                  alt="Featured files" 
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Find the perfect file for your project
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for templates, graphics, documents..."
                className="w-full py-4 px-6 pl-12 rounded-lg shadow-md border-0 focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-4 top-4 text-gray-400">
                <SearchIcon size={24} />
              </div>
              <div className="absolute right-3 top-3">
                <Button>Search</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Files Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Files</h2>
            <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium mt-2 md:mt-0">
              View All Files →
            </Link>
          </div>
          <FileGrid files={featuredFiles} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse & Find</h3>
              <p className="text-gray-600">
                Search through our extensive collection of high-quality digital files.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Purchase</h3>
              <p className="text-gray-600">
                Buy the files you need with our secure payment system.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Download</h3>
              <p className="text-gray-600">
                Get instant access to your files after purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Files Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Recent Files</h2>
            <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium mt-2 md:mt-0">
              View All Files →
            </Link>
          </div>
          <FileGrid files={recentFiles} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find the perfect digital files?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found exactly what they need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse Files
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-gray-800">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;