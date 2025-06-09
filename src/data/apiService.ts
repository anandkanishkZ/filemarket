import { Database } from '../types/database';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set up axios interceptor to add auth token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Type definitions
type User = Database['public']['Tables']['profiles']['Row'] & {
  is_active: boolean;
};

type Category = Database['public']['Tables']['categories']['Row'];
type File = Database['public']['Tables']['files']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'];

// API Response type
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Extended types for API responses
interface FileWithCategory extends File {
  category: Category | null;
}

interface PurchaseWithDetails {
  purchase_id: string;
  amount: number;
  purchase_status: string;
  created_at: string;
  file_title: string;
  preview_url: string;
  user_name: string;
  user_email: string;
  payment_method: string;
  transaction_id: string;
  payment_details: string;
  verified_at: string;
  download_count?: number;
  last_downloaded_at?: string;
}

interface InvoiceDetails {
  purchase_id: string;
  amount: number;
  purchase_status: string;
  created_at: string;
  file_title: string;
  preview_url: string;
  user_name: string;
  user_email: string;
  payment_method: string;
  transaction_id: string;
  payment_details: string;
  verified_at: string;
  download_count?: number;
  last_downloaded_at?: string;
}

// File operations
export const getFiles = async (): Promise<ApiResponse<FileWithCategory[]>> => {
  try {
    const response = await axios.get(`${API_URL}/files`);
    console.log('Frontend received files response:', response.data);
    
    if (response.data?.data) {
      return { data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    console.warn('Non-array files data format:', response.data);
    return { data: [] };
  } catch (error: any) {
    console.error('Error in getFiles API call:', error);
    return { error: error.message || 'Failed to fetch files' };
  }
};

export const getFileById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/files/${id}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: new Error('File not found') };
  }
};

export const getFilesByCategory = async (categoryId: string) => {
  const response = await axios.get(`${API_URL}/files/category/${categoryId}`);
  return { data: response.data, error: null };
};

export const createFile = async (file: Database['public']['Tables']['files']['Insert']) => {
  const response = await axios.post(`${API_URL}/files`, file);
  return { data: response.data, error: null };
};

export const updateFile = async (id: string, updates: Database['public']['Tables']['files']['Update']) => {
  const response = await axios.put(`${API_URL}/files/${id}`, updates);
  return { data: response.data, error: null };
};

export const deleteFile = async (id: string) => {
  await axios.delete(`${API_URL}/files/${id}`);
  return { error: null };
};

// Category operations
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    console.log('Frontend received categories response:', response.data);
    
    if (response.data?.data) {
      return { data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    console.warn('Non-array categories data format:', response.data);
    return { data: [] };
  } catch (error: any) {
    console.error('Error in getCategories API call:', error);
    return { error: error.message || 'Failed to fetch categories' };
  }
};

export const createCategory = async (category: Database['public']['Tables']['categories']['Insert']): Promise<ApiResponse<Category>> => {
  try {
    const response = await axios.post(`${API_URL}/categories`, category);
    if (response.data?.data) {
      return { data: response.data.data };
    }
    return { error: 'Invalid response format' };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { error: error.response?.data?.message || error.message || 'Failed to create category' };
  }
};

export const updateCategory = async (id: string, updates: Database['public']['Tables']['categories']['Update']) => {
  const response = await axios.put(`${API_URL}/categories/${id}`, updates);
  return { data: response.data, error: null };
};

export const deleteCategory = async (id: string) => {
  await axios.delete(`${API_URL}/categories/${id}`);
  return { error: null };
};

// Purchase operations
export const getPurchases = async (): Promise<ApiResponse<PurchaseWithDetails[]>> => {
  try {
    const response = await axios.get(`${API_URL}/purchases`);
    console.log('Frontend received purchases response:', response.data);
    
    if (response.data?.data) {
      return { data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    console.warn('Non-array purchases data format:', response.data);
    return { data: [] };
  } catch (error: any) {
    console.error('Error in getPurchases API call:', error);
    return { error: error.message || 'Failed to fetch purchases' };
  }
};

export const createPurchase = async (purchase: Database['public']['Tables']['purchases']['Insert']) => {
  const response = await axios.post(`${API_URL}/purchases`, purchase);
  return { data: response.data, error: null };
};

export const updatePurchaseStatus = async (id: string, status: string) => {
  const response = await axios.put(`${API_URL}/purchases/${id}/status`, { status });
  return { data: response.data, error: null };
};

export const deletePurchase = async (id: string) => {
  await axios.delete(`${API_URL}/purchases/${id}`);
  return { error: null };
};

// Profile operations
export const getProfile = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/profiles/${userId}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: new Error('Profile not found') };
  }
};

export const updateProfile = async (userId: string, updates: Database['public']['Tables']['profiles']['Update']) => {
  const response = await axios.put(`${API_URL}/profiles/${userId}`, updates);
  return { data: response.data, error: null };
};

// Auth operations
export const signIn = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data?.data?.token) {
      // Store the token in localStorage
      localStorage.setItem('token', response.data.data.token);
      // Set the token in axios defaults for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
    }
    return { data: response.data, error: null };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Invalid credentials';
    return { 
      data: null, 
      error: new Error(errorMessage)
    };
  }
};

export const signUp = async (email: string, password: string, name: string, confirmPassword: string): Promise<{ data: any; error: Error | null }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, { 
      email, 
      password, 
      name,
      confirmPassword 
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Validation failed';
      return { 
        data: null, 
        error: new Error(errorMessage)
      };
    }
    return { 
      data: null, 
      error: new Error('Registration failed. Please try again.') 
    };
  }
};

export const signOut = async () => {
  // Always clear local storage and axios headers first, regardless of backend call success.
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // Also clear the 'user' item in localStorage
  delete axios.defaults.headers.common['Authorization'];

  try {
    const token = localStorage.getItem('token'); // Re-get token after clearing, it should be null
    if (token) { // Only attempt backend call if token was actually present (should not be after previous clear)
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    return { error: null };
  } catch (error: any) {
    console.error('Error during backend logout API call:', error);
    // Local storage and headers are already cleared, so no need to repeat
    return { error: new Error(error.response?.data?.message || error.message || 'Logout failed on server') };
  }
};

// Invoice operations
export const getAllInvoices = async (): Promise<ApiResponse<InvoiceDetails[]>> => {
  try {
    const response = await axios.get(`${API_URL}/invoices`);
    console.log('Frontend received invoices response:', response.data);
    
    if (response.data?.data) {
      return { data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    console.warn('Non-array invoices data format:', response.data);
    return { data: [] };
  } catch (error: any) {
    console.error('Error in getAllInvoices API call:', error);
    return { error: error.message || 'Failed to fetch invoices' };
  }
};

export const getInvoiceById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/${id}`);
    return { data: response.data.data, error: null };
  } catch (error: any) {
    console.error('Error in getInvoiceById API call:', error);
    return { data: null, error: new Error(error.response?.data?.error || 'Failed to fetch invoice') };
  }
};

// User operations
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    console.log('Frontend received users response:', response.data);
    
    if (response.data?.data) {
      return { data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    
    console.warn('Non-array users data format:', response.data);
    return { data: [] };
  } catch (error: any) {
    console.error('Error in getAllUsers API call:', error);
    return { error: error.message || 'Failed to fetch users' };
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, updates);
    return { data: response.data.data };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { error: error.message || 'Failed to update user' };
  }
}; 