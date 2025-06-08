import { Database } from '../types/database';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type File = Database['public']['Tables']['files']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'];

// File operations
export const getFiles = async () => {
  const response = await axios.get(`${API_URL}/files`);
  return { data: response.data, error: null };
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
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    const categories = response.data?.data || response.data;
    
    // Even if we get an invalid format, just return an empty array without error
    if (!Array.isArray(categories)) {
      console.warn('Non-array categories data format:', categories);
      return { data: [], error: null };
    }
    return { data: categories, error: null };
  } catch (error: any) {
    console.error('Error in getCategories API call:', error);
    // Return empty array and no error to prevent breaking the dashboard
    return { data: [], error: null };
  }
};

export const createCategory = async (category: Database['public']['Tables']['categories']['Insert']) => {
  const response = await axios.post(`${API_URL}/categories`, category);
  return { data: response.data, error: null };
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
export const getPurchases = async (userId?: string) => {
  const url = userId ? `${API_URL}/purchases?userId=${userId}` : `${API_URL}/purchases`;
  try {
    const response = await axios.get(url);
    console.log('Frontend received purchases response:', response.data);
    
    // Handle both array and object responses
    const purchases = response.data?.data || response.data;
    if (!purchases) {
      throw new Error('No purchases data received');
    }
    
    // Ensure we have an array
    const purchasesArray = Array.isArray(purchases) ? purchases : [purchases];
    return { data: purchasesArray, error: null };
  } catch (error: any) {
    console.error('Error in getPurchases API call:', error);
    return { 
      data: [], 
      error: new Error(error.response?.data?.message || error.message || 'Failed to fetch purchases') 
    };
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
export const getAllInvoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/invoices`);
    // Ensure we're returning an array of invoices
    const invoices = response.data?.data || response.data || [];
    if (!Array.isArray(invoices)) {
      console.error('Invalid invoices data format:', invoices);
      return { data: [], error: null }; // Return empty array instead of throwing
    }
    return { data: invoices, error: null };
  } catch (error: any) {
    console.error('Error in getAllInvoices API call:', error);
    return { 
      data: [], // Return empty array instead of null
      error: new Error(error.response?.data?.message || error.message || 'Failed to fetch invoices') 
    };
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
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    const users = response.data?.data;
    if (!Array.isArray(users)) {
      throw new Error('Invalid users data format');
    }
    return { data: users, error: null };
  } catch (error: any) {
    console.error('Error in getAllUsers API call:', error);
    return { 
      data: null, 
      error: new Error(error.response?.data?.message || error.message || 'Failed to fetch users') 
    };
  }
}; 