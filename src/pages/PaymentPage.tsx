import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFileById } from '../data/mockData';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';
import { File } from '../types';
import { useAuth } from '../context/AuthContext';

const PaymentMethodCard: React.FC<{
  name: string;
  logo: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}> = ({ name, logo, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="mr-3">{logo}</div>
    <div className="font-medium">{name}</div>
    {selected && (
      <div className="ml-auto">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    )}
  </div>
);

const PaymentPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/payment/${fileId}` } });
      return;
    }

    if (!fileId) {
      navigate('/browse');
      return;
    }

    // Fetch file details
    const fileDetails = getFileById(fileId);
    
    if (!fileDetails || fileDetails.isFree) {
      navigate('/browse');
      return;
    }
    
    setFile(fileDetails);
    setLoading(false);
  }, [fileId, navigate, isAuthenticated]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    setProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to success page
    navigate(`/payment/success/${fileId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse bg-gray-200 h-8 w-1/3 rounded mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  if (!file) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">File not found</h2>
          <p className="text-gray-600 mb-6">The file you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate(`/file/${file.id}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to file
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Checkout</h1>
              <p className="text-gray-600">Complete your purchase to get immediate access to this file.</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="md:w-2/3 md:pr-6 mb-8 md:mb-0">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
                  
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="space-y-3 mb-6">
                      <PaymentMethodCard
                        name="eSewa"
                        logo={<div className="text-green-500"><CreditCard size={24} /></div>}
                        selected={paymentMethod === 'esewa'}
                        onClick={() => setPaymentMethod('esewa')}
                      />
                      
                      <PaymentMethodCard
                        name="Khalti"
                        logo={<div className="text-purple-500"><CreditCard size={24} /></div>}
                        selected={paymentMethod === 'khalti'}
                        onClick={() => setPaymentMethod('khalti')}
                      />
                      
                      <PaymentMethodCard
                        name="IME Pay"
                        logo={<div className="text-blue-500"><CreditCard size={24} /></div>}
                        selected={paymentMethod === 'imepay'}
                        onClick={() => setPaymentMethod('imepay')}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      fullWidth 
                      size="lg"
                      isLoading={processingPayment}
                      disabled={!paymentMethod || processingPayment}
                    >
                      Complete Purchase
                    </Button>
                  </form>
                </div>
                
                <div className="md:w-1/3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                    
                    <div className="flex mb-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={file.previewUrl} 
                          alt={file.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-800">{file.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{file.description}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium">${file.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                        <span>Total</span>
                        <span>${file.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> This is a demo application. No actual payment will be processed.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentPage;