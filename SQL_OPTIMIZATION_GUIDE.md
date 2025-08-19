# SQL查询优化指南

## 当前查询分析

```sql
SELECT * FROM orders 
WHERE user_id = ? AND status = 'completed'
ORDER BY created_at DESC;
```

## 🎯 优化建议

### 1. 索引优化

当前已有的索引：
- `idx_orders_user_id` - 单列索引 (user_id)
- `idx_orders_status` - 单列索引 (status)

**推荐添加复合索引：**

```sql
-- 最优复合索引：覆盖查询的所有列
CREATE INDEX idx_orders_user_status_created 
ON orders(user_id, status, created_at DESC);

-- 或者更具体的复合索引（如果经常查询completed状态）
CREATE INDEX idx_orders_completed_user_created 
ON orders(status, user_id, created_at DESC) 
WHERE status = 'completed';
```

### 2. 查询重写优化

**原始查询：**
```sql
SELECT * FROM orders 
WHERE user_id = ? AND status = 'completed'
ORDER BY created_at DESC;
```

**优化后的查询：**
```sql
-- 避免SELECT *，只选择需要的列
SELECT id, order_number, user_id, total_amount, status, 
       payment_status, created_at, updated_at
FROM orders 
WHERE user_id = ? AND status = 'completed'
ORDER BY created_at DESC;

-- 如果需要分页，添加LIMIT
SELECT id, order_number, user_id, total_amount, status, 
       payment_status, created_at, updated_at
FROM orders 
WHERE user_id = ? AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20 OFFSET ?;
```

### 3. 分区表优化（大数据量时）

如果订单表数据量很大，考虑按时间分区：

```sql
-- 创建分区表（PostgreSQL 10+）
CREATE TABLE orders_partitioned (
    LIKE orders INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE orders_2024 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE orders_2025 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## 📊 完整的索引策略

### 已有索引回顾
```sql
-- 当前索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 推荐的新增索引

```sql
-- 1. 复合索引：用户ID + 状态 + 创建时间（降序）
CREATE INDEX idx_orders_user_status_created_desc 
ON orders(user_id, status, created_at DESC);

-- 2. 复合索引：状态 + 创建时间（用于状态查询和时间排序）
CREATE INDEX idx_orders_status_created_desc 
ON orders(status, created_at DESC);

-- 3. 部分索引：只针对已完成订单
CREATE INDEX idx_orders_completed_user_created 
ON orders(user_id, created_at DESC) 
WHERE status = 'completed';

-- 4. 复合索引：支付状态 + 订单状态
CREATE INDEX idx_orders_payment_status 
ON orders(payment_status, status);

-- 5. 覆盖索引：包含常用查询的所有列
CREATE INDEX idx_orders_cover_user_status 
ON orders(user_id, status, created_at DESC, order_number, total_amount);
```

## 🔍 查询模式优化

### 常见查询模式和对应索引

#### 1. 按用户查询所有订单
```sql
-- 查询
SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC;

-- 优化索引
CREATE INDEX idx_orders_user_created_desc ON orders(user_id, created_at DESC);
```

#### 2. 按状态查询订单
```sql
-- 查询
SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC;

-- 优化索引
CREATE INDEX idx_orders_status_created_desc ON orders(status, created_at DESC);
```

#### 3. 时间范围查询
```sql
-- 查询
SELECT * FROM orders 
WHERE created_at >= ? AND created_at <= ?
ORDER BY created_at DESC;

-- 优化索引
CREATE INDEX idx_orders_created_at_desc ON orders(created_at DESC);
```

#### 4. 复合条件查询
```sql
-- 查询
SELECT * FROM orders 
WHERE user_id = ? AND status IN ('pending', 'processing')
ORDER BY created_at DESC;

-- 优化索引
CREATE INDEX idx_orders_user_status_array_created 
ON orders(user_id, status, created_at DESC);
```

## ⚡ 性能监控SQL

### 检查索引使用情况
```sql
-- 查看索引大小和使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE tablename = 'orders'
ORDER BY idx_tup_read DESC;
```

### 分析查询执行计划
```sql
-- 分析查询性能
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT id, order_number, total_amount, status, created_at
FROM orders 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' 
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;
```

### 查找缺失的索引
```sql
-- 查找可能需要索引的查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query ILIKE '%orders%'
ORDER BY total_time DESC
LIMIT 10;
```

## 🛠️ 索引维护

### 定期维护索引
```sql
-- 重建索引
REINDEX INDEX CONCURRENTLY idx_orders_user_status_created_desc;

-- 分析表统计信息
ANALYZE orders;

-- 查看索引碎片
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'orders';
```

### 删除未使用的索引
```sql
-- 找出从未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_tup_read = 0 
  AND idx_tup_fetch = 0
  AND tablename = 'orders';
```

## 📈 预期性能提升

### 优化前后对比

| 查询类型 | 优化前 | 优化后 | 提升 |
|---------|--------|--------|------|
| 用户订单查询 | 全表扫描 | 索引扫描 | 90%+ |
| 状态过滤 | 全表扫描 | 索引扫描 | 85%+ |
| 排序操作 | 内存排序 | 索引排序 | 70%+ |
| 复合查询 | 多次扫描 | 单次索引扫描 | 95%+ |

### 最佳实践建议

1. **使用复合索引**：将最常用的查询条件组合成复合索引
2. **避免SELECT ***：只选择需要的列
3. **使用LIMIT**：分页查询避免返回大量数据
4. **监控索引使用**：定期检查索引的使用情况
5. **定期维护**：定期分析表和重建索引

## 🎯 针对原始查询的最终建议

对于查询：
```sql
SELECT * FROM orders 
WHERE user_id = ? AND status = 'completed'
ORDER BY created_at DESC;
```

**最优索引：**
```sql
CREATE INDEX idx_orders_optimal_query 
ON orders(user_id, status, created_at DESC);
```

**优化后的查询：**
```sql
SELECT id, order_number, user_id, total_amount, status, 
       payment_status, shipping_address, created_at
FROM orders 
WHERE user_id = ? AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;
```

这将提供最佳的查询性能！🚀
