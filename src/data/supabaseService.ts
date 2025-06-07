import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

// Files
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

export const getFileById = async (id: string) => {
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
    .eq('id', id)
    .single();
  return { data, error };
};

export const getFilesByCategory = async (categorySlug: string) => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      categories!inner (
        id,
        name,
        slug
      )
    `)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createFile = async (fileData: Database['public']['Tables']['files']['Insert']) => {
  const { data, error } = await supabase
    .from('files')
    .insert([fileData])
    .select()
    .single();
  return { data, error };
};

export const updateFile = async (
  id: string, 
  updates: Database['public']['Tables']['files']['Update']
) => {
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

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  return { data, error };
};

// Purchases
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

export const createPurchase = async (purchaseData: Database['public']['Tables']['purchases']['Insert']) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchaseData])
    .select()
    .single();
  return { data, error };
};

export const updatePurchaseStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'declined'
) => {
  const { data, error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Profiles
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (
  userId: string, 
  updates: Database['public']['Tables']['profiles']['Update']
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};