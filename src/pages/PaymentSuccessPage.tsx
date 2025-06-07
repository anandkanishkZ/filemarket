import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFileById } from '../data/mockData';
import { CheckCircle, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';
import { File } from '../types';
import { useAuth } from '../context/AuthContext';

const PaymentSuccessPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!fileId) {
      navigate('/browse');
      return;
    }

    // Fetch file details
    const fileDetails = getFileById(fileId);
    
    if (!fileDetails) {
      navigate('/browse');
      return;
    }
    
    setFile(fileDetails);
  }, [fileId, navigate, isAuthenticated]);

  const handleDownload = () => {
    // In a real app, this would trigger the actual download
    if (file) {
      console.log(`Downloading file: ${file.title}`);
      // Simulate download with an alert
      alert(`Download started for ${file.title}`);
    }
  };

  if (!file) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-50 p-6 text-center">
            <div className="inline-block text-green-500 mb-4">
              <CheckCircle size={64} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Purchase Successful!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your transaction has been completed successfully.
            </p>
          </div>
          
          <div className="p-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Purchase Details</h2>
              
              <div className="flex mb-4 items-center">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={file.previewUrl} 
                    alt={file.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-800">{file.title}</h4>
                  <p className="text-gray-500 text-sm">Amount paid: ${file.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">
                  <strong>Transaction ID:</strong> TRX-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h2>
              <p className="text-gray-600 mb-6">
                Your file is now ready to download. You can download it now or access it later from your account dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button 
                  onClick={handleDownload}
                  className="flex justify-center items-center"
                >
                  <Download size={18} className="mr-2" />
                  Download Now
                </Button>
                
                <Link to="/dashboard">
                  <Button variant="outline">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                A confirmation email has been sent to your email address with download instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccessPage;