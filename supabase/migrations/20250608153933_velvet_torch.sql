-- Create database
CREATE DATABASE IF NOT EXISTS file_market;
USE file_market;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    bio TEXT,
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token),
    INDEX idx_verification_token (email_verification_token)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    preview_url VARCHAR(500),
    download_url VARCHAR(500),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    category_id VARCHAR(36),
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_downloadable BOOLEAN DEFAULT TRUE,
    download_limit_days INT NULL,
    tags TEXT,
    meta_keywords TEXT,
    meta_description TEXT,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_free (is_free),
    INDEX idx_active (is_active),
    INDEX idx_featured (featured),
    INDEX idx_created (created_at),
    FULLTEXT idx_search (title, description, tags)
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    details JSON NOT NULL,
    instructions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_type (type)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    payment_method_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_details JSON NOT NULL,
    payment_instructions TEXT NOT NULL,
    admin_notes TEXT,
    verified_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_file (file_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    payment_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    download_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_file (user_id, file_id),
    INDEX idx_user (user_id),
    INDEX idx_file (file_id),
    INDEX idx_status (status)
);

-- Downloads table (to track file downloads)
CREATE TABLE IF NOT EXISTS downloads (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    download_count INT DEFAULT 1,
    last_downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_file (user_id, file_id),
    INDEX idx_user (user_id),
    INDEX idx_file (file_id),
    INDEX idx_downloaded (last_downloaded_at)
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(36) PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key_name),
    INDEX idx_public (is_public)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_file_review (user_id, file_id),
    INDEX idx_file (file_id),
    INDEX idx_rating (rating),
    INDEX idx_approved (is_approved)
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_file_wishlist (user_id, file_id),
    INDEX idx_user (user_id),
    INDEX idx_file (file_id)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    min_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_expires (expires_at)
);

-- Coupon usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id VARCHAR(36) PRIMARY KEY,
    coupon_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    purchase_id VARCHAR(36) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    INDEX idx_coupon (coupon_id),
    INDEX idx_user (user_id)
);

-- Search logs table (for analytics)
CREATE TABLE IF NOT EXISTS search_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    search_query VARCHAR(500) NOT NULL,
    results_count INT DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_query (search_query),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- Insert default site settings
INSERT INTO site_settings (id, key_name, value, description, type, is_public) VALUES
(UUID(), 'site_name', 'FileMarket', 'The name of the website', 'string', true),
(UUID(), 'site_description', 'A marketplace for digital files', 'The description of the website', 'string', true),
(UUID(), 'site_logo', '', 'URL to the site logo', 'string', true),
(UUID(), 'currency', 'USD', 'The default currency for the website', 'string', true),
(UUID(), 'currency_symbol', '$', 'The currency symbol', 'string', true),
(UUID(), 'max_file_size', '100', 'Maximum file size in MB', 'number', false),
(UUID(), 'allowed_file_types', 'pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,jpg,jpeg,png,gif,svg,ai,psd,eps,mp4,mov,avi,mp3,wav', 'Allowed file types for upload', 'string', false),
(UUID(), 'tax_rate', '0', 'The tax rate for purchases (in percentage)', 'number', false),
(UUID(), 'enable_reviews', 'true', 'Enable file reviews', 'boolean', true),
(UUID(), 'enable_wishlists', 'true', 'Enable wishlists', 'boolean', true),
(UUID(), 'enable_coupons', 'true', 'Enable coupon system', 'boolean', false),
(UUID(), 'maintenance_mode', 'false', 'Enable maintenance mode', 'boolean', false),
(UUID(), 'contact_email', 'support@filemarket.com', 'Contact email address', 'string', true),
(UUID(), 'support_phone', '+1-234-567-8900', 'Support phone number', 'string', true),
(UUID(), 'social_facebook', '', 'Facebook page URL', 'string', true),
(UUID(), 'social_twitter', '', 'Twitter profile URL', 'string', true),
(UUID(), 'social_instagram', '', 'Instagram profile URL', 'string', true),
(UUID(), 'social_linkedin', '', 'LinkedIn profile URL', 'string', true);

-- Insert default payment methods
INSERT INTO payment_methods (id, name, type, details, instructions, sort_order) VALUES
(UUID(), 'Stripe', 'stripe', '{"publishable_key": "pk_test_..."}', 'Pay securely with your credit or debit card.', 1),
(UUID(), 'PayPal', 'paypal', '{"client_id": "your_paypal_client_id"}', 'Pay with your PayPal account.', 2),
(UUID(), 'Bank Transfer', 'bank', '{"bank_name": "Example Bank", "account_number": "1234567890", "account_name": "FileMarket", "routing_number": "123456789"}', 'Transfer the exact amount to our bank account. Include your order number in the transfer description.', 3);

-- Create indexes for better performance
CREATE INDEX idx_files_search ON files(title, description);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
CREATE INDEX idx_purchases_user_status ON purchases(user_id, status);
CREATE INDEX idx_downloads_file_count ON downloads(file_id, download_count);
CREATE INDEX idx_reviews_file_rating ON reviews(file_id, rating, is_approved);