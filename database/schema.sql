-- ERP System Database Schema
-- PostgreSQL

-- 创建数据库（如果不存在）
-- CREATE DATABASE erp_db;

-- 连接到数据库
-- \c erp_db;

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品表
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 创建订单明细表
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 创建库存变动记录表
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'purchase_order', 'adjustment'
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    CONSTRAINT fk_inventory_transactions_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新updated_at的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建计算订单总金额的触发器函数
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新订单总金额
    UPDATE orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 为订单明细表创建触发器，自动更新订单总金额
CREATE TRIGGER update_order_total_after_item_change
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- 创建库存更新触发器函数
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 新增库存变动记录时，更新产品库存
        IF NEW.transaction_type = 'purchase' THEN
            UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.transaction_type = 'sale' THEN
            UPDATE products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.transaction_type = 'adjustment' THEN
            UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.transaction_type = 'return' THEN
            UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为库存变动表创建触发器
CREATE TRIGGER update_stock_after_transaction
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- 插入示例数据
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@erp.com', '$2b$10$example_hash', 'admin'),
('Employee User', 'employee@erp.com', '$2b$10$example_hash', 'employee');

INSERT INTO products (name, description, price, stock_quantity, category, sku) VALUES
('Laptop Computer', 'High-performance laptop', 999.99, 50, 'Electronics', 'LAP001'),
('Office Chair', 'Ergonomic office chair', 199.99, 25, 'Furniture', 'CHAIR001'),
('Printer Paper', 'A4 printer paper, 500 sheets', 9.99, 100, 'Office Supplies', 'PAPER001');

-- 创建视图：订单详情视图
CREATE VIEW order_details AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at as order_date,
    u.name as customer_name,
    u.email as customer_email,
    COUNT(oi.id) as total_items
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.total_amount, o.status, o.payment_status, o.created_at, u.name, u.email;

-- 创建视图：产品库存状态视图
CREATE VIEW product_inventory_status AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.price,
    p.stock_quantity,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity <= 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status,
    p.created_at,
    p.updated_at
FROM products p
WHERE p.is_active = true;

-- 创建视图：销售统计视图
CREATE VIEW sales_summary AS
SELECT 
    DATE_TRUNC('day', o.created_at) as sale_date,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as total_sales,
    AVG(o.total_amount) as average_order_value
FROM orders o
WHERE o.status = 'completed'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY sale_date DESC;

-- 授予权限（根据实际需要调整）
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_user;
