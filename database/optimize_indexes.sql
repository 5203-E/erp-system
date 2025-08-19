-- 订单表索引优化SQL脚本
-- 执行前请确保在生产环境中使用 CONCURRENTLY 选项

-- =======================================================
-- 针对原始查询的优化索引
-- =======================================================

-- 查询: SELECT * FROM orders WHERE user_id = ? AND status = 'completed' ORDER BY created_at DESC;

-- 1. 最优复合索引（推荐）
CREATE INDEX CONCURRENTLY idx_orders_user_status_created_desc 
ON orders(user_id, status, created_at DESC);

-- 2. 部分索引 - 只针对已完成订单（节省空间）
CREATE INDEX CONCURRENTLY idx_orders_completed_user_created 
ON orders(user_id, created_at DESC) 
WHERE status = 'completed';

-- =======================================================
-- 其他常用查询的优化索引
-- =======================================================

-- 3. 支持按状态和时间排序的查询
CREATE INDEX CONCURRENTLY idx_orders_status_created_desc 
ON orders(status, created_at DESC);

-- 4. 覆盖索引 - 包含常用查询的所有列
CREATE INDEX CONCURRENTLY idx_orders_cover_basic 
ON orders(user_id, status, created_at DESC, order_number, total_amount, payment_status);

-- 5. 支付状态相关查询
CREATE INDEX CONCURRENTLY idx_orders_payment_status_created 
ON orders(payment_status, created_at DESC);

-- 6. 订单号查询优化（如果需要模糊搜索）
CREATE INDEX CONCURRENTLY idx_orders_order_number_text 
ON orders USING gin(order_number gin_trgm_ops);
-- 注意：需要先启用 pg_trgm 扩展: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =======================================================
-- 时间范围查询优化
-- =======================================================

-- 7. 支持时间范围查询
CREATE INDEX CONCURRENTLY idx_orders_created_at_desc 
ON orders(created_at DESC);

-- 8. 按月分组查询优化
CREATE INDEX CONCURRENTLY idx_orders_monthly 
ON orders(DATE_TRUNC('month', created_at), status);

-- =======================================================
-- 联表查询优化
-- =======================================================

-- 9. 支持与用户表的联表查询
CREATE INDEX CONCURRENTLY idx_orders_user_created_for_join 
ON orders(user_id, created_at DESC, status, total_amount);

-- =======================================================
-- 统计查询优化
-- =======================================================

-- 10. 支持销售统计查询
CREATE INDEX CONCURRENTLY idx_orders_stats 
ON orders(status, created_at, total_amount) 
WHERE status = 'completed';

-- 11. 支持按用户的销售统计
CREATE INDEX CONCURRENTLY idx_orders_user_stats 
ON orders(user_id, status, total_amount, created_at) 
WHERE status = 'completed';

-- =======================================================
-- 删除可能重复或低效的索引
-- =======================================================

-- 检查现有单列索引是否仍然需要
-- 如果复合索引已经覆盖了单列索引的功能，可以考虑删除单列索引

-- 例如，如果创建了 (user_id, status, created_at) 的复合索引
-- 那么单独的 idx_orders_user_id 索引可能就不再需要了
-- DROP INDEX IF EXISTS idx_orders_user_id;

-- 但是，如果有单独查询 user_id 的情况，建议保留单列索引

-- =======================================================
-- 索引使用情况监控查询
-- =======================================================

-- 查看索引大小和使用情况
/*
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
*/

-- 查看索引碎片情况
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_total_relation_size(indexrelid)) as total_size,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_tup_read > 0 
        THEN round((idx_tup_fetch::numeric / idx_tup_read) * 100, 2) 
        ELSE 0 
    END as hit_ratio
FROM pg_stat_user_indexes 
WHERE tablename = 'orders'
ORDER BY pg_total_relation_size(indexrelid) DESC;
*/

-- =======================================================
-- 性能测试查询
-- =======================================================

-- 测试原始查询的性能
/*
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT id, order_number, user_id, total_amount, status, 
       payment_status, created_at
FROM orders 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' 
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;
*/

-- 测试不同查询模式的性能
/*
-- 1. 按用户查询
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10;

-- 2. 按状态查询  
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10;

-- 3. 时间范围查询
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC LIMIT 10;

-- 4. 复合条件查询
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE user_id = ? AND status IN ('pending', 'processing')
ORDER BY created_at DESC LIMIT 10;
*/

-- =======================================================
-- 维护脚本
-- =======================================================

-- 定期重建索引（在低峰期执行）
/*
REINDEX INDEX CONCURRENTLY idx_orders_user_status_created_desc;
REINDEX INDEX CONCURRENTLY idx_orders_completed_user_created;
REINDEX INDEX CONCURRENTLY idx_orders_status_created_desc;
*/

-- 更新表统计信息
-- ANALYZE orders;

-- =======================================================
-- 注意事项
-- =======================================================

/*
1. 在生产环境中创建索引时，请使用 CONCURRENTLY 选项以避免锁表
2. 大表创建索引可能需要较长时间，建议在低峰期进行
3. 创建索引后，请监控查询性能和索引使用情况
4. 定期清理未使用的索引以节省存储空间
5. 根据实际查询模式调整索引策略
6. 考虑使用部分索引来节省空间和提高性能
*/
