import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, ShoppingCart, Check, AlertCircle, Star, Clock, FileText, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { File } from '../../types';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface FileDetailsProps {
  file: File;
  userHasPurchased?: boolean;
}

const FileDetails: React.FC<FileDetailsProps> = ({ file, userHasPurchased = false }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(file.previewUrl);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    if (file.isFree || userHasPurchased) {
      console.log(`Downloading file: ${file.title}`);
      alert(`Download started for ${file.title}`);
    }
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }
    navigate(`/payment/${file.id}`);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }
    addToCart(file);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const fileDetails = {
    format: file.category === 'pdf' ? 'PDF' : 
           file.category === 'word' ? 'DOCX' :
           file.category === 'excel' ? 'XLSX' :
           file.category === 'powerpoint' ? 'PPTX' :
           file.category === 'images' ? 'JPG/PNG' : 'Vector',
    size: '2.4 MB',
    pages: '12',
    lastUpdated: new Date(file.updatedAt).toLocaleDateString(),
    rating: 4.8,
    reviews: 124,
    downloads: 1567
  };

  const features = [
    'High-quality professional design',
    'Ready to use templates',
    'Easy to customize',
    'Print ready format',
    'Compatible with all major software'
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link to="/browse" className="hover:text-blue-600">Browse</Link>
          <span className="mx-2">›</span>
          <Link to={`/browse/${file.category}`} className="hover:text-blue-600 capitalize">{file.category}</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800">{file.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Image Preview */}
          <div className="lg:w-[45%]">
            <div className="sticky top-24">
              <div 
                ref={imageRef}
                className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in shadow-lg"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img 
                  src={selectedPreview} 
                  alt={file.title}
                  className="w-full h-full object-contain"
                />
                {isZoomed && (
                  <div 
                    className="absolute inset-0 pointer-events-none bg-white"
                    style={{
                      backgroundImage: `url(${selectedPreview})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: '200%',
                      backgroundRepeat: 'no-repeat',
                      opacity: 0.95,
                    }}
                  />
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="mt-6 grid grid-cols-6 gap-3">
                {[file.previewUrl, ...Array(3)].map((preview, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPreview(preview)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPreview === preview 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {file.isFree ? (
                  <Button 
                    onClick={handleDownload}
                    className="w-full bg-green-600 hover:bg-green-700 col-span-2"
                    size="lg"
                  >
                    <Download size={20} className="mr-2" />
                    Download Free
                  </Button>
                ) : userHasPurchased ? (
                  <Button 
                    onClick={handleDownload}
                    className="w-full bg-green-600 hover:bg-green-700 col-span-2"
                    size="lg"
                  >
                    <Download size={20} className="mr-2" />
                    Download File
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handlePurchase}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart size={20} className="mr-2" />
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-[55%] space-y-8">
            {showAuthAlert && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
                <AlertCircle className="text-yellow-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-yellow-700">You need to be logged in to purchase this file.</p>
                  <div className="mt-2 flex space-x-3">
                    <Link to="/login">
                      <Button size="sm">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="outline" size="sm">Register</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{file.title}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <div className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-full text-sm">
                    <span className="font-semibold mr-1">{fileDetails.rating}</span>
                    <Star size={14} className="fill-current" />
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    ({fileDetails.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {fileDetails.downloads.toLocaleString()} downloads
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-gray-900">
                  {file.isFree ? 'Free' : `$${file.price.toFixed(2)}`}
                </span>
                {!file.isFree && (
                  <span className="text-sm text-gray-500">One-time purchase</span>
                )}
              </div>
            </div>

            {/* File Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6">File Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block mb-1">Format</span>
                  <span className="font-medium text-lg">{fileDetails.format}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block mb-1">Size</span>
                  <span className="font-medium text-lg">{fileDetails.size}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block mb-1">Pages</span>
                  <span className="font-medium text-lg">{fileDetails.pages}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block mb-1">Last Updated</span>
                  <span className="font-medium text-lg">{fileDetails.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{file.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6">Key Features</h2>
              <div className="grid grid-cols-1 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Secure Purchase</h3>
                  <p className="text-blue-700">
                    Your purchase is protected by our secure payment system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;