import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ShoppingBag, Clock, Settings, FileText, User } from 'lucide-react';
import { getPurchasesByUserId, getFileById } from '../../data/mockData';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { Purchase, File } from '../../types';

interface PurchaseWithFile extends Purchase {
  file: File;
}

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseWithFile[]>([]);
  const [activeTab, setActiveTab] = useState('purchases');
  
  useEffect(() => {
    if (currentUser) {
      const userPurchases = getPurchasesByUserId(currentUser.id);
      
      // Get file details for each purchase
      const purchasesWithFiles = userPurchases.map(purchase => {
        const file = getFileById(purchase.fileId);
        return { ...purchase, file: file! };
      });
      
      setPurchases(purchasesWithFiles);
    }
  }, [currentUser]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'purchases':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Purchases</h2>
            
            {purchases.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchases.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img 
                                  className="h-10 w-10 rounded-md object-cover" 
                                  src={purchase.file.previewUrl} 
                                  alt={purchase.file.title} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {purchase.file.title}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${purchase.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              purchase.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : purchase.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {purchase.status === 'approved' ? (
                              <Button variant="outline" size="sm" className="ml-2">
                                <Download size={16} className="mr-1" />
                                Download
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-sm">Awaiting approval</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <ShoppingBag size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No purchases yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't purchased any files yet. Start browsing our collection.
                </p>
                <Link to="/browse">
                  <Button>Browse Files</Button>
                </Link>
              </div>
            )}
          </div>
        );
        
      case 'downloads':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Downloads</h2>
            
            {purchases.filter(p => p.status === 'approved').length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Purchased
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchases
                        .filter(p => p.status === 'approved')
                        .map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover" 
                                    src={purchase.file.previewUrl} 
                                    alt={purchase.file.title} 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {purchase.file.title}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(purchase.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="outline" size="sm">
                                <Download size={16} className="mr-1" />
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Download size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No downloads available</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any files available for download yet.
                </p>
                <Link to="/browse">
                  <Button>Browse Files</Button>
                </Link>
              </div>
            )}
          </div>
        );
        
      case 'account':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
                
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        defaultValue={currentUser?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        defaultValue={currentUser?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                  
                  <form>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit">Update Password</Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">You are not logged in</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">My Dashboard</h1>
          </div>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{currentUser.name}</h2>
                <p className="text-gray-600">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`w-full flex items-center px-4 py-3 rounded-md mb-1 transition-colors ${
                    activeTab === 'purchases'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag size={20} className="mr-3" />
                  My Purchases
                </button>
                
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`w-full flex items-center px-4 py-3 rounded-md mb-1 transition-colors ${
                    activeTab === 'downloads'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Download size={20} className="mr-3" />
                  Downloads
                </button>
                
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center px-4 py-3 rounded-md mb-1 transition-colors ${
                    activeTab === 'account'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  Account Settings
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;