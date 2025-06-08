#!/bin/bash

# Exit on error
set -e

echo "Setting up local database..."

# Read database credentials from .env
source .env

# Create database and tables
echo "Creating database and tables..."
mysql -u$DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
USE $DB_NAME;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    preview_url VARCHAR(255),
    download_url VARCHAR(255) NOT NULL,
    category_id VARCHAR(36),
    price DECIMAL(10, 2) NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    details JSON NOT NULL,
    instructions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    payment_method_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_details JSON NOT NULL,
    payment_instructions TEXT NOT NULL,
    admin_notes TEXT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    payment_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(36) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
    id VARCHAR(36) PRIMARY KEY,
    purchase_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_files_category ON files(category_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_file ON payments(file_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_file ON purchases(file_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_downloads_purchase ON downloads(purchase_id);
CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_file ON downloads(file_id);

-- Insert default data
INSERT INTO site_settings (id, key_name, value, description) VALUES
(UUID(), 'site_name', 'File Market', 'The name of the website'),
(UUID(), 'site_description', 'A marketplace for digital files', 'The description of the website'),
(UUID(), 'currency', 'USD', 'The default currency for payments'),
(UUID(), 'tax_rate', '0', 'The tax rate for purchases (in percentage)'),
(UUID(), 'max_file_size', '100', 'Maximum file size in MB'),
(UUID(), 'allowed_file_types', 'pdf,doc,docx,zip,rar', 'Allowed file types for upload');

-- Insert default payment methods
INSERT INTO payment_methods (id, name, type, details, instructions) VALUES
(UUID(), 'Bank Transfer', 'bank', '{"bank_name": "Example Bank", "account_number": "1234567890", "account_name": "File Market"}', 'Please transfer the exact amount to the bank account provided. Include your order number in the transfer description.'),
(UUID(), 'PayPal', 'paypal', '{"email": "payments@filemarket.com"}', 'Send payment to our PayPal account. Make sure to include your order number in the payment note.'),
(UUID(), 'Cash on Delivery', 'cash', '{"instructions": "Pay when you receive the file"}', 'You will receive the file after payment is made in person.');

-- Create admin user (password: admin123)
INSERT INTO users (id, name, email, password, is_admin) VALUES
(UUID(), 'Admin User', 'admin@filemarket.com', '$2a$10$rQnM1.5qB5qB5qB5qB5qB.5qB5qB5qB5qB5qB5qB5qB5qB5qB5qB', TRUE);

-- Create sample categories
INSERT INTO categories (id, name, slug, description) VALUES
(UUID(), 'Documents', 'documents', 'Various document files'),
(UUID(), 'Software', 'software', 'Software and applications'),
(UUID(), 'Templates', 'templates', 'Design and document templates'),
(UUID(), 'E-books', 'e-books', 'Digital books and publications');

-- Create sample files
INSERT INTO files (id, title, description, preview_url, download_url, category_id, price, is_free) VALUES
(UUID(), 'Sample Document', 'A sample document file', 'https://example.com/preview/doc1.pdf', 'https://example.com/download/doc1.pdf', 
 (SELECT id FROM categories WHERE slug = 'documents'), 9.99, FALSE),
(UUID(), 'Free Template', 'A free template file', 'https://example.com/preview/template1.zip', 'https://example.com/download/template1.zip',
 (SELECT id FROM categories WHERE slug = 'templates'), 0.00, TRUE);
EOF

echo "Database setup completed successfully!" 