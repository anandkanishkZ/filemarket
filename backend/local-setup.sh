#!/bin/bash

# Exit on error
set -e

echo "Starting local setup..."

# Create necessary directories
echo "Creating directories..."
mkdir -p logs uploads

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file for local development
echo "Creating .env file..."
cat > .env << EOL
# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=dev_secret_key_123
JWT_EXPIRES_IN=1d

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=file_market

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=100
ALLOWED_FILE_TYPES=pdf,doc,docx,zip,rar
EOL

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "Local setup completed!"
echo "Please make sure MySQL is running and update the .env file with your database credentials if needed." 