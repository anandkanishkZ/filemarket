# File Market Backend

A Node.js/Express backend for the File Market application with MySQL database.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- PM2 (for production deployment)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=file_market

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=100
ALLOWED_FILE_TYPES=pdf,doc,docx,zip,rar
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Create necessary directories:
```bash
mkdir -p logs uploads
```

4. Set up the database:
```bash
npm run migrate
```

## Development

Run the development server:
```bash
npm run dev
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start ecosystem.config.js
```

Or use the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Users
- GET /api/users - Get all users (admin)
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Files
- GET /api/files - Get all files
- GET /api/files/:id - Get file by ID
- POST /api/files - Create file (admin)
- PUT /api/files/:id - Update file (admin)
- DELETE /api/files/:id - Delete file (admin)

### Payments
- GET /api/payments - Get user payments
- GET /api/payments/:id - Get payment by ID
- POST /api/payments - Create payment
- GET /api/payments/:id/invoice - Get payment invoice
- GET /api/payments/methods - Get payment methods (admin)
- POST /api/payments/methods - Create payment method (admin)
- PUT /api/payments/methods/:id - Update payment method (admin)
- DELETE /api/payments/methods/:id - Delete payment method (admin)
- POST /api/payments/:id/verify - Verify payment (admin)

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Logging

Logs are stored in the `logs` directory:
- `error.log` - Error logs
- `combined.log` - All logs
- `pm2-error.log` - PM2 error logs
- `pm2-out.log` - PM2 output logs
- `pm2-combined.log` - PM2 combined logs 