import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  File as FileIcon, 
  Users, 
  ShoppingBag, 
  PlusCircle, 
  AlertTriangle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { 
  getFiles, 
  getCategories, 
  getPurchases, 
  createFile, 
  updateFile, 
  deleteFile, 
  updatePurchaseStatus 
} from '../../data/supabaseService';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import FileModal from '../../components/admin/FileModal';
import { Database } from '../../types/database';

type FileWithCategory = Database['public']['Tables']['files']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

type PurchaseWithDetails = Database['public']['Tables']['purchases']['Row'] & {
  files: Database['public']['Tables']['files']['Row'] | null;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

const AdminDashboard: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState<FileWithCategory[]>([]);
  const [categories, setCategories] = useState<Database['public']['Tables']['categories']['Row'][]>([]);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileWithCategory | null>(null);
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [filesResult, categoriesResult, purchasesResult] = await Promise.all([
        getFiles(),
        getCategories(),
        getPurchases()
      ]);

      if (filesResult.data) setFiles(filesResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (purchasesResult.data) setPurchases(purchasesResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = () => {
    setEditingFile(null);
    setIsFileModalOpen(true);
  };

  const handleEditFile = (file: FileWithCategory) => {
    setEditingFile(file);
    setIsFileModalOpen(true);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const { error } = await deleteFile(fileId);
      if (error) {
        alert('Error deleting file: ' + error.message);
      } else {
        setFiles(files.filter(f => f.id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleFileSubmit = async (fileData: any) => {
    try {
      if (editingFile) {
        const { data, error } = await updateFile(editingFile.id, fileData);
        if (error) {
          alert('Error updating file: ' + error.message);
          return;
        }
        if (data) {
          setFiles(files.map(f => f.id === editingFile.id ? { ...data, categories: f.categories } : f));
        }
      } else {
        const { data, error } = await createFile(fileData);
        if (error) {
          alert('Error creating file: ' + error.message);
          return;
        }
        if (data) {
          const category = categories.find(c => c.id === data.category_id);
          setFiles([{ ...data, categories: category || null }, ...files]);
        }
      }
      setIsFileModalOpen(false);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file');
    }
  };

  const handleApprove = async (purchaseId: string) => {
    try {
      const { error } = await updatePurchaseStatus(purchaseId, 'approved');
      if (error) {
        alert('Error approving purchase: ' + error.message);
      } else {
        setPurchases(purchases.map(p => 
          p.id === purchaseId ? { ...p, status: 'approved' } : p
        ));
      }
    } catch (error) {
      console.error('Error approving purchase:', error);
      alert('Error approving purchase');
    }
  };

  const handleDecline = async (purchaseId: string) => {
    try {
      const { error } = await updatePurchaseStatus(purchaseId, 'declined');
      if (error) {
        alert('Error declining purchase: ' + error.message);
      } else {
        setPurchases(purchases.map(p => 
          p.id === purchaseId ? { ...p, status: 'declined' } : p
        ));
      }
    } catch (error) {
      console.error('Error declining purchase:', error);
      alert('Error declining purchase');
    }
  };

  const pendingApprovals = purchases.filter(p => p.status === 'pending');

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'files':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Manage Files</h2>
              <Button onClick={handleCreateFile}>
                <PlusCircle size={16} className="mr-2" />
                Add New File
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={file.preview_url} 
                                alt={file.title} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {file.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {file.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {file.categories?.name || 'Uncategorized'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {file.is_free ? 'Free' : `$${file.price.toFixed(2)}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(file.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditFile(file)}
                            >
                              <Edit size={16} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'purchases':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">All Purchases</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {purchase.profiles?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {purchase.profiles?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {purchase.files?.title || 'Unknown File'}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {purchase.status === 'pending' && (
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(purchase.id)}
                              >
                                <Check size={16} className="mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDecline(purchase.id)}
                              >
                                <X size={16} className="mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-yellow-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <FileIcon size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">{files.length}</h3>
                    <p className="text-gray-600">Total Files</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">{purchases.length}</h3>
                    <p className="text-gray-600">Total Purchases</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">{pendingApprovals.length}</h3>
                    <p className="text-gray-600">Pending Approvals</p>
                  </div>
                </div>
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
                  onClick={() => setActiveTab('files')}
                  className={`w-full flex items-center px-4 py-3 rounded-md mb-1 transition-colors ${
                    activeTab === 'files'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileIcon size={20} className="mr-3" />
                  Manage Files
                </button>
                
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`w-full flex items-center px-4 py-3 rounded-md mb-1 transition-colors ${
                    activeTab === 'purchases'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag size={20} className="mr-3" />
                  All Purchases
                  {pendingApprovals.length > 0 && (
                    <span className="ml-auto bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {pendingApprovals.length}
                    </span>
                  )}
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

      {/* File Modal */}
      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSubmit={handleFileSubmit}
        categories={categories}
        file={editingFile}
      />
    </MainLayout>
  );
};

export default AdminDashboard;