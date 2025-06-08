import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Download, 
  ShoppingBag, 
  Clock, 
  Settings, 
  FileText, 
  User,
  CreditCard,
  Heart,
  History,
  Shield,
  BarChart2
} from 'lucide-react';
import { getPurchases, getFileById } from '../../data/apiService';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../types/database';

type File = Database['public']['Tables']['files']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'];

interface PurchaseWithFile extends Purchase {
  file: File;
  profile: Profile;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseWithFile[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: purchasesData, error } = await getPurchases(user!.id);
      if (error) throw error;
      
      if (Array.isArray(purchasesData)) {
        // Map the purchases data to include file details
        const purchasesWithFiles = purchasesData.map(purchase => ({
          ...purchase,
          file: {
            id: purchase.file_id,
            title: purchase.file_title,
            preview_url: purchase.preview_url || '/placeholder.png'
          }
        }));
        setPurchases(purchasesWithFiles);
      } else {
        console.error('Invalid purchases data format:', purchasesData);
        setPurchases([]);
        toast.error('Failed to load purchases data');
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setPurchases([]);
      toast.error(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Purchases</p>
            <p className="text-2xl font-semibold text-gray-900">{purchases.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <Download size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Available Downloads</p>
            <p className="text-2xl font-semibold text-gray-900">
              {purchases.filter(p => p.status === 'approved').length}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <CreditCard size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchases = () => (
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
                            src={purchase.file.preview_url} 
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
                        {new Date(purchase.created_at).toLocaleDateString()}
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

  const renderDownloads = () => (
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
                              src={purchase.file.preview_url} 
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
                          {new Date(purchase.created_at).toLocaleDateString()}
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

  const renderAccount = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user?.name}
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
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
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
            
            <Button type="submit">Save Changes</Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Danger Zone</h3>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'purchases':
        return renderPurchases();
      case 'downloads':
        return renderDownloads();
      case 'account':
        return renderAccount();
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <div className="flex space-x-4">
            {user?.is_admin && (
              <Link to="/admin">
                <Button variant="outline" className="flex items-center">
                  <Shield size={16} className="mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => loadUserData()}>
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart2 size={16} className="inline-block mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'purchases'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag size={16} className="inline-block mr-2" />
                Purchases
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'downloads'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Download size={16} className="inline-block mr-2" />
                Downloads
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'account'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={16} className="inline-block mr-2" />
                Account
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;