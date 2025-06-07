import { User, File, Purchase, Category } from '../types';

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: false,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    isAdmin: true,
    createdAt: new Date('2022-12-10'),
  },
];

export const categories: Category[] = [
  { id: '1', name: 'PDF Files', slug: 'pdf' },
  { id: '2', name: 'Word Documents', slug: 'word' },
  { id: '3', name: 'Excel Spreadsheets', slug: 'excel' },
  { id: '4', name: 'PowerPoint', slug: 'powerpoint' },
  { id: '5', name: 'Images', slug: 'images' },
  { id: '6', name: 'Vector Files', slug: 'vector' },
];

export const files: File[] = [
  {
    id: '1',
    title: 'Professional Resume Template',
    description: 'A clean, modern resume template perfect for job applications in any industry. Includes matching cover letter template.',
    previewUrl: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg',
    category: 'word',
    price: 5.99,
    isFree: false,
    downloadUrl: '/downloads/resume-template.docx',
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-10'),
  },
  {
    id: '2',
    title: 'Business Proposal Template',
    description: 'Comprehensive business proposal template with professional formatting and sample content.',
    previewUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
    category: 'pdf',
    price: 9.99,
    isFree: false,
    downloadUrl: '/downloads/business-proposal.pdf',
    createdAt: new Date('2023-04-22'),
    updatedAt: new Date('2023-06-15'),
  },
  {
    id: '3',
    title: 'Financial Planning Spreadsheet',
    description: 'Comprehensive Excel template for personal and business financial planning with built-in formulas.',
    previewUrl: 'https://images.pexels.com/photos/5417636/pexels-photo-5417636.jpeg',
    category: 'excel',
    price: 12.99,
    isFree: false,
    downloadUrl: '/downloads/financial-planning.xlsx',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05'),
  },
  {
    id: '4',
    title: 'Project Timeline Template',
    description: 'Professional PowerPoint template for project timelines and milestones.',
    previewUrl: 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg',
    category: 'powerpoint',
    price: 0,
    isFree: true,
    downloadUrl: '/downloads/project-timeline.pptx',
    createdAt: new Date('2023-02-18'),
    updatedAt: new Date('2023-02-18'),
  },
  {
    id: '5',
    title: 'Monthly Budget Calculator',
    description: 'Track your monthly expenses and income with this easy-to-use Excel template.',
    previewUrl: 'https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg',
    category: 'excel',
    price: 0,
    isFree: true,
    downloadUrl: '/downloads/budget-calculator.xlsx',
    createdAt: new Date('2023-01-30'),
    updatedAt: new Date('2023-01-30'),
  },
  {
    id: '6',
    title: 'Corporate Identity Package',
    description: 'Complete vector package including logo templates, business cards, and letterhead designs.',
    previewUrl: 'https://images.pexels.com/photos/326501/pexels-photo-326501.jpeg',
    category: 'vector',
    price: 14.99,
    isFree: false,
    downloadUrl: '/downloads/corporate-identity.zip',
    createdAt: new Date('2023-06-02'),
    updatedAt: new Date('2023-06-02'),
  },
  {
    id: '7',
    title: 'Social Media Kit',
    description: 'Professional social media templates for various platforms in both vector and image formats.',
    previewUrl: 'https://images.pexels.com/photos/5417636/pexels-photo-5417636.jpeg',
    category: 'images',
    price: 19.99,
    isFree: false,
    downloadUrl: '/downloads/social-media-kit.zip',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15'),
  },
  {
    id: '8',
    title: 'Invoice Template',
    description: 'Professional invoice template with automatic calculations and tax handling.',
    previewUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
    category: 'excel',
    price: 7.99,
    isFree: false,
    downloadUrl: '/downloads/invoice-template.xlsx',
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20'),
  },
];

export const purchases: Purchase[] = [
  {
    id: '1',
    fileId: '1',
    userId: '1',
    paymentMethod: 'eSewa',
    amount: 5.99,
    status: 'approved',
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-21'),
  },
  {
    id: '2',
    fileId: '3',
    userId: '1',
    paymentMethod: 'Khalti',
    amount: 12.99,
    status: 'pending',
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date('2023-07-05'),
  },
];

// Helper function to get a file by ID
export const getFileById = (id: string): File | undefined => {
  return files.find(file => file.id === id);
};

// Helper function to get purchases by user ID
export const getPurchasesByUserId = (userId: string): Purchase[] => {
  return purchases.filter(purchase => purchase.userId === userId);
};

// Helper function to get files by category
export const getFilesByCategory = (category: string): File[] => {
  return files.filter(file => file.category === category);
};

// Helper function to get featured files (just for demo purposes)
export const getFeaturedFiles = (): File[] => {
  return files.slice(0, 3);
};