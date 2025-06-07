import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Database helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getFiles = async () => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getFilesByCategory = async (categorySlug: string) => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  return { data, error };
};

export const getPurchases = async (userId?: string) => {
  let query = supabase
    .from('purchases')
    .select(`
      *,
      files (
        id,
        title,
        preview_url,
        price
      ),
      profiles (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createFile = async (fileData: {
  title: string;
  description: string;
  preview_url: string;
  download_url: string;
  category_id: string;
  price: number;
  is_free: boolean;
}) => {
  const { data, error } = await supabase
    .from('files')
    .insert([fileData])
    .select()
    .single();
  return { data, error };
};

export const updateFile = async (id: string, updates: Partial<{
  title: string;
  description: string;
  preview_url: string;
  download_url: string;
  category_id: string;
  price: number;
  is_free: boolean;
}>) => {
  const { data, error } = await supabase
    .from('files')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteFile = async (id: string) => {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id);
  return { error };
};

export const updatePurchaseStatus = async (id: string, status: 'pending' | 'approved' | 'declined') => {
  const { data, error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const createPurchase = async (purchaseData: {
  file_id: string;
  user_id: string;
  payment_method: string;
  amount: number;
}) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchaseData])
    .select()
    .single();
  return { data, error };
};