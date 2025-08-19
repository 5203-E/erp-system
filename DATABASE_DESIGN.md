# ERP系统数据库设计

## 🎯 概述

本文档描述了ERP系统的PostgreSQL数据库设计，包括表结构、关系、约束和业务逻辑。

## 🗄️ 数据库表结构

### 1. 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 用户唯一标识 |
| name | VARCHAR(100) | NOT NULL | 用户姓名 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 用户邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| role | VARCHAR(20) | ENUM('admin','employee') | 用户角色 |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引：**
- `idx_users_email` - 邮箱索引
- `idx_users_role` - 角色索引

### 2. 产品表 (products)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 产品唯一标识 |
| name | VARCHAR(200) | NOT NULL | 产品名称 |
| description | TEXT | NULL | 产品描述 |
| price | DECIMAL(10,2) | NOT NULL, >= 0 | 产品价格 |
| stock_quantity | INTEGER | NOT NULL, >= 0 | 库存数量 |
| category | VARCHAR(100) | NULL | 产品分类 |
| sku | VARCHAR(100) | UNIQUE | 产品SKU |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引：**
- `idx_products_name` - 产品名称索引
- `idx_products_category` - 分类索引
- `idx_products_sku` - SKU索引

### 3. 订单表 (orders)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 订单唯一标识 |
| user_id | UUID | FOREIGN KEY | 用户ID |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | 订单号 |
| total_amount | DECIMAL(10,2) | NOT NULL, >= 0 | 订单总金额 |
| status | VARCHAR(20) | ENUM('pending','processing','completed','cancelled') | 订单状态 |
| payment_status | VARCHAR(20) | ENUM('pending','paid','failed') | 支付状态 |
| shipping_address | TEXT | NULL | 收货地址 |
| notes | TEXT | NULL | 订单备注 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**外键约束：**
- `fk_orders_user_id` → `users(id)` (RESTRICT)

**索引：**
- `idx_orders_user_id` - 用户ID索引
- `idx_orders_status` - 状态索引
- `idx_orders_order_number` - 订单号索引

### 4. 订单明细表 (order_items)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 明细唯一标识 |
| order_id | UUID | FOREIGN KEY | 订单ID |
| product_id | UUID | FOREIGN KEY | 产品ID |
| quantity | INTEGER | NOT NULL, > 0 | 购买数量 |
| unit_price | DECIMAL(10,2) | NOT NULL, >= 0 | 单价 |
| total_price | DECIMAL(10,2) | NOT NULL, >= 0 | 小计金额 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**外键约束：**
- `fk_order_items_order_id` → `orders(id)` (CASCADE)
- `fk_order_items_product_id` → `products(id)` (RESTRICT)

**索引：**
- `idx_order_items_order_id` - 订单ID索引
- `idx_order_items_product_id` - 产品ID索引

### 5. 库存变动记录表 (inventory_transactions)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 记录唯一标识 |
| product_id | UUID | FOREIGN KEY | 产品ID |
| transaction_type | VARCHAR(20) | ENUM('purchase','sale','adjustment','return') | 变动类型 |
| quantity | INTEGER | NOT NULL | 变动数量 |
| reference_type | VARCHAR(50) | NULL | 引用类型 |
| reference_id | UUID | NULL | 引用ID |
| notes | TEXT | NULL | 备注 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |

**外键约束：**
- `fk_inventory_transactions_product_id` → `products(id)` (RESTRICT)

**索引：**
- `idx_inventory_transactions_product_id` - 产品ID索引

## 🔗 表关系

### 一对多关系
1. **User → Order**: 一个用户可以有多个订单
2. **Order → OrderItem**: 一个订单可以有多个明细项
3. **Product → OrderItem**: 一个产品可以在多个订单明细中出现

### 多对多关系
- **Order ↔ Product**: 通过OrderItem表实现多对多关系

## ⚙️ 数据库特性

### 1. 触发器 (Triggers)

#### 更新时间戳触发器
- 自动更新 `updated_at` 字段
- 适用于所有主要表

#### 订单总金额计算触发器
- 当订单明细变化时自动计算订单总金额
- 确保数据一致性

#### 库存更新触发器
- 根据库存变动类型自动更新产品库存
- 支持采购、销售、调整、退货等操作

### 2. 视图 (Views)

#### order_details
- 订单详情视图，包含用户信息和订单统计

#### product_inventory_status
- 产品库存状态视图，包含库存状态判断

#### sales_summary
- 销售统计视图，按日期统计销售数据

### 3. 约束 (Constraints)

#### 检查约束
- 价格必须 >= 0
- 库存数量必须 >= 0
- 订单数量必须 > 0

#### 枚举约束
- 用户角色：admin/employee
- 订单状态：pending/processing/completed/cancelled
- 支付状态：pending/paid/failed
- 库存变动类型：purchase/sale/adjustment/return

## 🚀 使用方法

### 1. 创建数据库
```sql
CREATE DATABASE erp_db;
CREATE USER admin WITH PASSWORD 'pass123';
GRANT ALL PRIVILEGES ON DATABASE erp_db TO admin;
```

### 2. 运行Schema脚本
```bash
psql -U admin -d erp_db -f database/schema.sql
```

### 3. 使用Sequelize同步
```bash
npm run db:init    # 初始化数据库
npm run db:reset   # 重置数据库
npm run db:sync    # 同步模型
```

## 📊 示例查询

### 1. 获取用户订单
```sql
SELECT o.*, u.name as user_name 
FROM orders o 
JOIN users u ON o.user_id = u.id 
WHERE o.user_id = 'user-uuid';
```

### 2. 获取订单详情
```sql
SELECT oi.*, p.name as product_name, p.price as product_price
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 'order-uuid';
```

### 3. 库存状态查询
```sql
SELECT * FROM product_inventory_status 
WHERE stock_status = 'Low Stock';
```

### 4. 销售统计
```sql
SELECT * FROM sales_summary 
WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days';
```

## 🔒 安全考虑

1. **密码安全**: 使用哈希存储密码
2. **权限控制**: 基于角色的访问控制
3. **数据验证**: 应用层和数据库层双重验证
4. **审计日志**: 记录所有重要操作

## 📈 性能优化

1. **索引策略**: 为常用查询字段创建索引
2. **分区表**: 大表可考虑按时间分区
3. **查询优化**: 使用视图和存储过程
4. **连接池**: 合理配置数据库连接池

## 🛠️ 维护建议

1. **定期备份**: 设置自动备份策略
2. **性能监控**: 监控慢查询和资源使用
3. **索引维护**: 定期重建和优化索引
4. **数据清理**: 定期清理过期数据
