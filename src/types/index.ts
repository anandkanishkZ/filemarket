export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface File {
  id: string;
  title: string;
  description: string;
  previewUrl: string;
  category: string;
  price: number;
  isFree: boolean;
  downloadUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  fileId: string;
  userId: string;
  paymentMethod: string;
  amount: number;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}