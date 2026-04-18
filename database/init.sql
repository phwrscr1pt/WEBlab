-- ThaiMart Labs Database Schema
-- PostgreSQL 16

-- ============================================
-- Lab 03: SQL Playground (Educational, NOT vulnerable)
-- ============================================

CREATE TABLE playground_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100)
);

INSERT INTO playground_products (name, price, stock, category) VALUES
('iPhone 15 Pro Max', 48900, 50, 'อิเล็กทรอนิกส์'),
('Samsung Galaxy S24', 35900, 30, 'อิเล็กทรอนิกส์'),
('MacBook Pro 14"', 69900, 15, 'คอมพิวเตอร์'),
('AirPods Pro 2', 8990, 100, 'อุปกรณ์เสริม'),
('เสื้อยืด Cotton', 299, 500, 'แฟชั่น'),
('กางเกงยีนส์', 890, 200, 'แฟชั่น'),
('รองเท้าวิ่ง Nike', 4500, 80, 'กีฬา'),
('กระเป๋าเป้', 1290, 60, 'กระเป๋า'),
('นาฬิกา Smart Watch', 2990, 40, 'อุปกรณ์เสริม'),
('หูฟัง Bluetooth', 1590, 120, 'อุปกรณ์เสริม');

-- ============================================
-- Lab 04: Auth Bypass (SQLi Vulnerable)
-- ============================================

CREATE TABLE seller_accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    shop_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'seller'
);

INSERT INTO seller_accounts (username, password, shop_name, role) VALUES
('seller1', 'securepass99', 'ร้านสมชาย Shop', 'seller'),
('seller2', 'mypassword', 'นภา Store', 'seller'),
('admin', 'admin123', 'ThaiMart Admin', 'admin');

-- ============================================
-- Lab 05: Union-Based SQLi
-- ============================================

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100)
);

CREATE TABLE admin_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50)
);

INSERT INTO staff (name, department, position) VALUES
('สมชาย วงศ์ไทย', 'IT', 'Senior Developer'),
('สมหญิง รักไทย', 'IT', 'DevOps Engineer'),
('วิชัย มั่งมี', 'Marketing', 'Marketing Manager'),
('นภา สุขใจ', 'Marketing', 'Content Creator'),
('ประยุทธ์ ดีใจ', 'Sales', 'Sales Manager'),
('สุดา รักดี', 'Sales', 'Sales Representative'),
('มานะ อดทน', 'HR', 'HR Manager'),
('สุภา ใจดี', 'HR', 'Recruiter'),
('วีระ กล้าหาญ', 'Finance', 'CFO'),
('นิดา รอบคอบ', 'Finance', 'Accountant');

-- Secret admin credentials (target for extraction)
-- MD5('thaimart2026') = 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918 (but we'll use simpler hash)
INSERT INTO admin_credentials (username, password_hash, role) VALUES
('superadmin', 'e10adc3949ba59abbe56e057f20f883e', 'administrator'),
('backup_admin', '5f4dcc3b5aa765d61d8327deb882cf99', 'administrator');

-- ============================================
-- Lab 06: SQLmap Target
-- ============================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE category_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id)
);

-- Secret table for sqlmap to discover
CREATE TABLE secret_orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    card_number VARCHAR(20),
    amount DECIMAL(10,2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name) VALUES
('อิเล็กทรอนิกส์'),
('แฟชั่น'),
('บ้านและสวน'),
('เกมและของเล่น'),
('หนังสือ');

INSERT INTO category_products (name, price, category_id) VALUES
-- Electronics (1)
('iPhone 15 Pro', 45900, 1),
('Samsung Galaxy S24', 35900, 1),
('iPad Pro 12.9"', 42900, 1),
('MacBook Air M3', 44900, 1),
('Sony WH-1000XM5', 12900, 1),
-- Fashion (2)
('เสื้อโปโล Lacoste', 3500, 2),
('กางเกงขาสั้น Uniqlo', 590, 2),
('รองเท้า Adidas', 3200, 2),
('กระเป๋า Coach', 8900, 2),
-- Home & Garden (3)
('หม้อหุงข้าว Panasonic', 2990, 3),
('พัดลม Hatari', 1290, 3),
('เครื่องฟอกอากาศ', 5900, 3),
-- Games & Toys (4)
('PlayStation 5', 18900, 4),
('Nintendo Switch', 11900, 4),
('LEGO Star Wars', 2490, 4),
-- Books (5)
('Atomic Habits (Thai)', 350, 5),
('Python for Beginners', 450, 5),
('Thai Cooking 101', 290, 5);

-- Fake credit card data for sqlmap to find
INSERT INTO secret_orders (customer_name, card_number, amount) VALUES
('สมชาย ใจดี', '4532-XXXX-XXXX-1234', 15900),
('มาลี สุขสันต์', '5412-XXXX-XXXX-5678', 8900),
('วิชัย มั่งมี', '4916-XXXX-XXXX-9012', 42900);

-- ============================================
-- Lab 07: Reflected XSS - Search Products
-- ============================================

CREATE TABLE search_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT
);

INSERT INTO search_products (name, price, description) VALUES
('iPhone 15 Pro Max 256GB', 48900, 'สมาร์ทโฟนรุ่นใหม่ล่าสุด'),
('iPhone 15 Pro 128GB', 42900, 'สมาร์ทโฟนขนาดกะทัดรัด'),
('iPhone 15 Plus', 38900, 'หน้าจอใหญ่ แบตอึด'),
('Samsung Galaxy S24 Ultra', 45900, 'สมาร์ทโฟน Android ระดับพรีเมียม'),
('Samsung Galaxy Z Fold5', 62900, 'สมาร์ทโฟนพับได้'),
('Laptop ASUS ROG', 55900, 'โน้ตบุ๊คเล่นเกม'),
('Laptop MacBook Pro 16"', 89900, 'โน้ตบุ๊คสำหรับมืออาชีพ'),
('หูฟัง AirPods Pro', 8990, 'หูฟังไร้สาย ตัดเสียงรบกวน'),
('หูฟัง Sony WH-1000XM5', 12900, 'หูฟังครอบหูระดับไฮเอนด์'),
('กระเป๋าเป้ Anello', 1590, 'กระเป๋าเป้แฟชั่น');

-- ============================================
-- Lab 09: Stored XSS - Reviews
-- ============================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER DEFAULT 1,
    reviewer_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-seed some normal reviews
INSERT INTO reviews (product_id, reviewer_name, content) VALUES
(1, 'สมชาย ก.', 'สินค้าดีมากครับ ส่งไว แพ็คแน่น ประทับใจ!'),
(1, 'นภา ส.', 'ใช้งานได้ดี คุ้มค่ากับราคา แนะนำเลยค่ะ'),
(1, 'วิชัย ม.', 'ซื้อมาให้แฟน ชอบมากครับ จะกลับมาซื้ออีก');

-- ============================================
-- Logger table (optional, can use in-memory)
-- ============================================

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(50),
    params TEXT,
    user_agent TEXT,
    cookies TEXT
);
