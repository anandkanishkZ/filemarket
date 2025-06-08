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
  BarChart2,
  Tag,
  UserPlus,
  DollarSign,
  Edit,
  Trash2,
  Upload,
  Users,
  LogOut,
  FileIcon
} from 'lucide-react';
import { 
  getFiles, 
  getCategories, 
  getPurchases,
  createFile,
  updateFile,
  deleteFile,
  createCategory,
  updateCategory,
  deleteCategory,
  updatePurchaseStatus,
  getFileById,
  deletePurchase,
  getAllInvoices,
  getAllUsers
} from '../../data/apiService';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../types/database';

type File = Database['public']['Tables']['files']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'];
type User = {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
};

interface FileWithCategory extends File {
  category: Category | null;
}

interface PurchaseWithDetails extends Purchase {
  file_title: string;
  preview_url: string;
  user_name: string;
  user_email: string;
}

interface InvoiceDetails {
  invoice_id: string;
  purchase_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  file_id: string;
  file_title: string;
  item_price: number;
  amount_paid: number;
  purchase_date: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [files, setFiles] = useState<FileWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // File state
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileDescription, setNewFileDescription] = useState('');
  const [newFileCategory, setNewFileCategory] = useState('');
  const [newFilePrice, setNewFilePrice] = useState<number>(0);
  const [newFileIsFree, setNewFileIsFree] = useState<boolean>(false);
  const [newFileIsDownloadable, setNewFileIsDownloadable] = useState<boolean>(true);
  const [newFileDownloadLimitDays, setNewFileDownloadLimitDays] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileToUpload, setFileToUpload] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load files
      const filesResponse = await getFiles();
      if (filesResponse.error) throw filesResponse.error;
      setFiles(filesResponse.data || []);

      // Load categories
      const categoriesResponse = await getCategories();
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      } else {
        console.error('Invalid categories data format:', categoriesResponse.data);
        setCategories([]);
      }

      // Load purchases
      const purchasesResponse = await getPurchases();
      if (purchasesResponse.error) throw purchasesResponse.error;
      if (Array.isArray(purchasesResponse.data)) {
        setPurchases(purchasesResponse.data);
      } else {
        console.error('Invalid purchases data format:', purchasesResponse.data);
        setPurchases([]);
      }

      // Load invoices
      const invoicesResponse = await getAllInvoices();
      if (invoicesResponse.error) throw invoicesResponse.error;
      if (Array.isArray(invoicesResponse.data)) {
        setInvoices(invoicesResponse.data);
      } else {
        console.error('Invalid invoices data format:', invoicesResponse.data);
        setInvoices([]);
      }

      // Load users
      const usersResponse = await getAllUsers();
      if (usersResponse.error) throw usersResponse.error;
      setUsers(usersResponse.data || []);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const resetFileForm = () => {
    setSelectedFile(null);
    setNewFileTitle('');
    setNewFileDescription('');
    setNewFileCategory('');
    setNewFilePrice(0);
    setNewFileIsFree(false);
    setNewFileIsDownloadable(true);
    setNewFileDownloadLimitDays(null);
    setFileToUpload(null);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('title', newFileTitle);
    formData.append('description', newFileDescription);
    formData.append('category_id', newFileCategory);
    formData.append('price', newFilePrice.toString());
    formData.append('is_free', newFileIsFree.toString());
    formData.append('is_downloadable', newFileIsDownloadable.toString());
    if (newFileIsDownloadable && newFileDownloadLimitDays !== null) {
      formData.append('download_limit_days', newFileDownloadLimitDays.toString());
    }

    try {
      const { data, error } = await createFile(formData as any);
      if (error) throw error;
      if (data) {
        alert('File created successfully!');
        resetFileForm();
        await loadData();
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file.' + error);
    }
  };

  const handleUpdateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    if (fileToUpload) {
      formData.append('file', fileToUpload);
    }
    formData.append('title', newFileTitle);
    formData.append('description', newFileDescription);
    formData.append('category_id', newFileCategory);
    formData.append('price', newFilePrice.toString());
    formData.append('is_free', newFileIsFree.toString());
    formData.append('is_downloadable', newFileIsDownloadable.toString());
    formData.append('download_limit_days', newFileDownloadLimitDays !== null ? newFileDownloadLimitDays.toString() : '');

    try {
      const { data, error } = await updateFile(selectedFile.id, formData as any);
      if (error) throw error;
      if (data) {
        alert('File updated successfully!');
        resetFileForm();
        await loadData();
      }
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Failed to update file.' + error);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const { error } = await deleteFile(id);
        if (error) throw error;
        alert('File deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file.' + error);
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: newCategoryName,
        slug: newCategorySlug,
        description: newCategoryDescription
      };
      const { data, error } = await createCategory(categoryData);
      if (error) throw error;
      if (data) {
        setNewCategoryName('');
        setNewCategorySlug('');
        setNewCategoryDescription('');
        await loadData();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, updates: Database['public']['Tables']['categories']['Update']) => {
    try {
      const { data, error } = await updateCategory(id, updates);
      if (error) throw error;
      if (data) {
        setEditingCategory(null);
        await loadData();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const { error } = await deleteCategory(id);
        if (error) throw error;
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleUpdatePurchaseStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await updatePurchaseStatus(id, status);
      if (error) throw error;
      if (data) {
        await loadData();
      }
    } catch (error) {
      console.error('Error updating purchase status:', error);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const { error } = await deletePurchase(id);
        if (error) throw error;
        alert('Purchase deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Failed to delete purchase.' + error);
      }
    }
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement user edit functionality
    toast.info('User edit functionality coming soon');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // TODO: Implement user delete functionality
        toast.info('User delete functionality coming soon');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FileText size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Files</p>
            <p className="text-2xl font-semibold text-gray-900">{files.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <Tag size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Categories</p>
            <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <ShoppingBag size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
            <p className="text-2xl font-semibold text-gray-900">
              {purchases.filter(p => p.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Files</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedFile ? 'Edit File' : 'Upload New File'}
        </h3>
        <form onSubmit={selectedFile ? handleUpdateFile : handleCreateFile} className="space-y-4">
          <div>
            <label htmlFor="fileTitle" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="fileTitle"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newFileTitle}
              onChange={(e) => setNewFileTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="fileDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="fileDescription"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newFileDescription}
              onChange={(e) => setNewFileDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="fileCategory" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="fileCategory"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newFileCategory}
              onChange={(e) => setNewFileCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filePrice" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              id="filePrice"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newFilePrice}
              onChange={(e) => setNewFilePrice(parseFloat(e.target.value))}
              step="0.01"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fileIsFree"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={newFileIsFree}
              onChange={(e) => setNewFileIsFree(e.target.checked)}
            />
            <label htmlFor="fileIsFree" className="ml-2 block text-sm text-gray-900">Is Free</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fileIsDownloadable"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={newFileIsDownloadable}
              onChange={(e) => setNewFileIsDownloadable(e.target.checked)}
            />
            <label htmlFor="fileIsDownloadable" className="ml-2 block text-sm text-gray-900">Is Downloadable</label>
          </div>
          {newFileIsDownloadable && (
            <div>
              <label htmlFor="fileDownloadLimitDays" className="block text-sm font-medium text-gray-700">Download Limit (Days)</label>
              <input
                type="number"
                id="fileDownloadLimitDays"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={newFileDownloadLimitDays || ''}
                onChange={(e) => setNewFileDownloadLimitDays(e.target.value === '' ? null : parseInt(e.target.value))}
                min="0"
              />
            </div>
          )}
          <div>
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">File Upload {selectedFile && `(Current: ${selectedFile.file_name})`}</label>
            <input
              type="file"
              id="fileUpload"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
              {...(!selectedFile && { required: true })}
            />
          </div>
          <Button type="submit" className="flex items-center">
            {selectedFile ? (
              <><Edit size={16} className="mr-2" />Update File</>
            ) : (
              <><Upload size={16} className="mr-2" />Upload File</>
            )}
          </Button>
          {selectedFile && (
            <Button type="button" variant="outline" onClick={resetFileForm} className="ml-2">
              Cancel Edit
            </Button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloadable
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Download Limit
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="text-sm text-gray-500">
                          {file.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {file.category?.name || 'Uncategorized'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {file.is_free ? 'Free' : `$${file.price.toFixed(2)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      file.is_free ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {file.is_free ? 'Free' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      file.is_downloadable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {file.is_downloadable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {file.download_limit_days !== null ? `${file.download_limit_days} days` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2" 
                      onClick={() => {
                        setSelectedFile(file);
                        setNewFileTitle(file.title);
                        setNewFileDescription(file.description || '');
                        setNewFileCategory(file.category_id || '');
                        setNewFilePrice(file.price);
                        setNewFileIsFree(file.is_free);
                        setNewFileIsDownloadable(file.is_downloadable);
                        setNewFileDownloadLimitDays(file.download_limit_days);
                      }}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50" 
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Categories</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </h3>
        <form onSubmit={editingCategory ? (e) => {
          e.preventDefault();
          handleUpdateCategory(editingCategory.id, {
            name: newCategoryName,
            slug: newCategorySlug,
            description: newCategoryDescription
          });
        } : handleCreateCategory} className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="categoryName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="categorySlug" className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              id="categorySlug"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="categoryDescription"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            ></textarea>
          </div>
          <Button type="submit">
            {editingCategory ? 'Update Category' : 'Create Category'}
          </Button>
          {editingCategory && (
            <Button type="button" variant="outline" onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setNewCategorySlug('');
              setNewCategoryDescription('');
            }} className="ml-2">
              Cancel
            </Button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {category.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {category.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2" 
                      onClick={() => {
                        setEditingCategory(category);
                        setNewCategoryName(category.name);
                        setNewCategorySlug(category.slug);
                        setNewCategoryDescription(category.description || '');
                      }}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50" 
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Purchases</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                          src={purchase.preview_url}
                          alt={purchase.file_title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {purchase.file_title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {purchase.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {purchase.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${purchase.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      purchase.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : purchase.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select
                      value={purchase.status}
                      onChange={(e) => handleUpdatePurchaseStatus(purchase.id, e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50 mt-2" 
                      onClick={() => handleDeletePurchase(purchase.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Invoices</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoice_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.purchase_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.file_title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${invoice.amount_paid.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(invoice.purchase_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      // onClick={() => handleViewInvoice(invoice.invoice_id)} // Implement this function if needed
                    >
                      <FileText size={16} className="mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Users</h2>
        <button
          onClick={() => setActiveTab('add-user')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Settings functionality coming soon...</p>
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
      case 'files':
        return renderFiles();
      case 'categories':
        return renderCategories();
      case 'purchases':
        return renderPurchases();
      case 'invoices':
        return renderInvoices();
      case 'users':
        return renderUsers();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  const renderSidebar = () => (
    <div className="w-64 bg-white shadow-md h-screen fixed left-0 top-0">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Admin Dashboard</h2>
        <nav>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart2 size={20} className="mr-3" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'files' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileIcon size={20} className="mr-3" />
            Files
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'categories' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Tag size={20} className="mr-3" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'purchases' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={20} className="mr-3" />
            Purchases
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'invoices' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CreditCard size={20} className="mr-3" />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={20} className="mr-3" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center w-full p-3 mb-2 rounded-lg ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} className="mr-3" />
            Settings
          </button>
          <button
            onClick={signOut}
            className="flex items-center w-full p-3 mb-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {renderSidebar()}
      <div className="ml-64 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'files' && renderFiles()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'purchases' && renderPurchases()}
            {activeTab === 'invoices' && renderInvoices()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;