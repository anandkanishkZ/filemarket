# FileMarket - Digital File Marketplace

A comprehensive digital file marketplace built with React, TypeScript, Node.js, Express, and MySQL. This platform allows users to buy, sell, and download digital files with secure payment processing and admin management.

## 🚀 Features

### User Features
- **User Authentication**: Secure registration and login system
- **File Browsing**: Browse files by categories with advanced filtering
- **Search Functionality**: Powerful search with suggestions and filters
- **Shopping Cart**: Add files to cart and manage purchases
- **Secure Payments**: Multiple payment methods with Stripe integration
- **Download Management**: Track downloads with expiration limits
- **User Dashboard**: Manage purchases, downloads, and account settings
- **Wishlist**: Save favorite files for later
- **Reviews & Ratings**: Rate and review purchased files

### Admin Features
- **Admin Dashboard**: Comprehensive analytics and management
- **File Management**: Upload, edit, and manage digital files
- **Category Management**: Create and organize file categories
- **User Management**: Manage user accounts and permissions
- **Purchase Management**: Track and manage all transactions
- **Analytics**: Detailed insights into sales, downloads, and user activity
- **Content Moderation**: Review and approve user-generated content

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Security**: Rate limiting, input sanitization, and secure headers
- **File Upload**: Secure file upload with type and size validation
- **Email Notifications**: Automated emails for purchases and account actions
- **Search Engine**: Full-text search with relevance scoring
- **Caching**: Optimized performance with strategic caching
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Toastify** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MySQL** database
- **JWT** authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Nodemailer** for emails
- **Winston** for logging
- **Helmet** for security headers
- **Express Rate Limit** for rate limiting

### Additional Services
- **Stripe** for payment processing
- **Cloudinary** for file storage (optional)
- **Netlify** for frontend deployment

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd filemarket
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=file_market

# JWT
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# File Upload
MAX_FILE_SIZE=100
UPLOAD_PATH=./uploads
```

4. **Database Setup**
```bash
# Create database and tables
npm run migrate

# Seed with sample data
npm run seed
```

5. **Start the backend server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Frontend Setup

1. **Install frontend dependencies**
```bash
cd ../
npm install
```

2. **Environment Configuration**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

3. **Start the frontend development server**
```bash
npm run dev
```

## 🗄️ Database Schema

The application uses MySQL with the following main tables:

- **users**: User accounts and authentication
- **categories**: File categories and organization
- **files**: Digital files and metadata
- **purchases**: Purchase transactions
- **payments**: Payment processing records
- **downloads**: Download tracking and limits
- **reviews**: File reviews and ratings
- **wishlists**: User wishlists
- **coupons**: Discount codes and promotions

## 🔐 Security Features

- **Authentication**: JWT-based authentication with secure token handling
- **Authorization**: Role-based access control (User/Admin)
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **Security Headers**: Helmet.js for security headers
- **Password Security**: Bcrypt hashing with salt rounds
- **File Upload Security**: File type and size validation
- **CORS**: Configured CORS for secure cross-origin requests

## 📧 Email System

The application includes a comprehensive email system for:

- Welcome emails for new users
- Purchase confirmation emails
- Password reset emails
- Download notifications
- Admin notifications

## 💳 Payment Integration

Integrated with Stripe for secure payment processing:

- Credit/Debit card payments
- Multiple currency support
- Webhook handling for payment events
- Refund management
- Payment analytics

## 📊 Analytics & Reporting

Admin dashboard includes:

- Sales analytics and trends
- User activity metrics
- File download statistics
- Revenue tracking
- Popular content insights

## 🚀 Deployment

### Backend Deployment

1. **Build the application**
```bash
npm run build
```

2. **Set production environment variables**

3. **Deploy to your preferred platform** (AWS, DigitalOcean, etc.)

### Frontend Deployment

The frontend is configured for Netlify deployment:

```bash
npm run build
```

Deploy the `dist` folder to Netlify or your preferred hosting platform.

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd ../
npm test
```

## 📝 API Documentation

The API includes the following main endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Files
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get file by ID
- `POST /api/files` - Create file (Admin)
- `PUT /api/files/:id` - Update file (Admin)
- `DELETE /api/files/:id` - Delete file (Admin)

### Search
- `GET /api/search` - Search files
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/popular` - Get popular searches

### Purchases
- `GET /api/purchases` - Get user purchases
- `POST /api/purchases` - Create purchase
- `PUT /api/purchases/:id/status` - Update purchase status (Admin)

### Analytics (Admin)
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/files/:id` - File analytics
- `GET /api/analytics/users/:id` - User analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@filemarket.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added search functionality and analytics
- **v1.2.0** - Enhanced security and payment features

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Stripe for secure payment processing
- All contributors and testers

---

**Default Admin Account:**
- Email: admin@filemarket.com
- Password: admin123

**Default User Account:**
- Email: user@filemarket.com
- Password: user123

*Remember to change these credentials in production!*