import { query } from './database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminId = uuidv4();
    
    await query(`
      INSERT IGNORE INTO users (id, name, email, password, is_admin) 
      VALUES (?, ?, ?, ?, ?)
    `, [adminId, 'Admin User', 'admin@filemarket.com', adminPassword, true]);

    // Create sample categories
    const categories = [
      { id: uuidv4(), name: 'Business Documents', slug: 'business-documents', description: 'Professional business templates and documents' },
      { id: uuidv4(), name: 'Design Templates', slug: 'design-templates', description: 'Creative design templates for various purposes' },
      { id: uuidv4(), name: 'Presentations', slug: 'presentations', description: 'PowerPoint and presentation templates' },
      { id: uuidv4(), name: 'Spreadsheets', slug: 'spreadsheets', description: 'Excel templates and calculators' },
      { id: uuidv4(), name: 'Graphics', slug: 'graphics', description: 'Images, icons, and graphic resources' },
      { id: uuidv4(), name: 'Web Templates', slug: 'web-templates', description: 'Website and web application templates' }
    ];

    for (const category of categories) {
      await query(`
        INSERT IGNORE INTO categories (id, name, slug, description) 
        VALUES (?, ?, ?, ?)
      `, [category.id, category.name, category.slug, category.description]);
    }

    // Create sample files
    const sampleFiles = [
      {
        id: uuidv4(),
        title: 'Professional Resume Template',
        description: 'A clean, modern resume template perfect for job applications in any industry.',
        preview_url: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg',
        download_url: '/uploads/resume-template.docx',
        category_id: categories[0].id,
        price: 9.99,
        is_free: false
      },
      {
        id: uuidv4(),
        title: 'Business Plan Template',
        description: 'Comprehensive business plan template with financial projections and market analysis.',
        preview_url: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
        download_url: '/uploads/business-plan.docx',
        category_id: categories[0].id,
        price: 19.99,
        is_free: false
      },
      {
        id: uuidv4(),
        title: 'Monthly Budget Calculator',
        description: 'Track your monthly expenses and income with this easy-to-use Excel template.',
        preview_url: 'https://images.pexels.com/photos/5417636/pexels-photo-5417636.jpeg',
        download_url: '/uploads/budget-calculator.xlsx',
        category_id: categories[3].id,
        price: 0,
        is_free: true
      },
      {
        id: uuidv4(),
        title: 'Corporate Presentation Template',
        description: 'Professional PowerPoint template for corporate presentations and pitches.',
        preview_url: 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg',
        download_url: '/uploads/corporate-presentation.pptx',
        category_id: categories[2].id,
        price: 14.99,
        is_free: false
      },
      {
        id: uuidv4(),
        title: 'Social Media Graphics Pack',
        description: 'Complete pack of social media templates for Instagram, Facebook, and Twitter.',
        preview_url: 'https://images.pexels.com/photos/326501/pexels-photo-326501.jpeg',
        download_url: '/uploads/social-media-pack.zip',
        category_id: categories[4].id,
        price: 24.99,
        is_free: false
      }
    ];

    for (const file of sampleFiles) {
      await query(`
        INSERT IGNORE INTO files (id, title, description, preview_url, download_url, category_id, price, is_free) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [file.id, file.title, file.description, file.preview_url, file.download_url, file.category_id, file.price, file.is_free]);
    }

    // Create sample regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const userId = uuidv4();
    
    await query(`
      INSERT IGNORE INTO users (id, name, email, password, is_admin) 
      VALUES (?, ?, ?, ?, ?)
    `, [userId, 'John Doe', 'user@filemarket.com', userPassword, false]);

    // Create sample purchases
    const samplePurchases = [
      {
        id: uuidv4(),
        user_id: userId,
        file_id: sampleFiles[0].id,
        payment_method: 'stripe',
        amount: sampleFiles[0].price,
        status: 'completed'
      },
      {
        id: uuidv4(),
        user_id: userId,
        file_id: sampleFiles[1].id,
        payment_method: 'stripe',
        amount: sampleFiles[1].price,
        status: 'pending'
      }
    ];

    for (const purchase of samplePurchases) {
      await query(`
        INSERT IGNORE INTO purchases (id, user_id, file_id, payment_method, amount, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [purchase.id, purchase.user_id, purchase.file_id, purchase.payment_method, purchase.amount, purchase.status]);
    }

    logger.info('Database seeding completed successfully!');
    logger.info('Sample accounts created:');
    logger.info('Admin: admin@filemarket.com / admin123');
    logger.info('User: user@filemarket.com / user123');
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };