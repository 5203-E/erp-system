-- 修复外键约束错误的SQL脚本
-- 执行前请备份数据库！

-- =======================================================
-- 1. 检查当前外键约束状态
-- =======================================================

-- 查看所有外键约束
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('order_items', 'orders')
ORDER BY tc.table_name, kcu.column_name;

-- =======================================================
-- 2. 检查数据完整性
-- =======================================================

-- 检查order_items表中无效的order_id引用
SELECT 
    'Invalid order_id references' as issue,
    COUNT(*) as count
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- 检查order_items表中无效的product_id引用
SELECT 
    'Invalid product_id references' as issue,
    COUNT(*) as count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL;

-- 检查orders表中无效的user_id引用
SELECT 
    'Invalid user_id references' as issue,
    COUNT(*) as count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- =======================================================
-- 3. 清理无效数据（谨慎操作！）
-- =======================================================

-- 删除无效的订单项（引用不存在的订单）
-- DELETE FROM order_items 
-- WHERE order_id NOT IN (SELECT id FROM orders);

-- 删除无效的订单项（引用不存在的产品）
-- DELETE FROM order_items 
-- WHERE product_id NOT IN (SELECT id FROM products);

-- 删除无效的订单（引用不存在的用户）
-- DELETE FROM orders 
-- WHERE user_id NOT IN (SELECT id FROM users);

-- =======================================================
-- 4. 重新创建外键约束
-- =======================================================

-- 如果外键约束不存在，重新创建它们

-- 为order_items.order_id创建外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%order_id%'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT fk_order_items_order_id 
        FOREIGN KEY (order_id) REFERENCES orders(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Created fk_order_items_order_id constraint';
    ELSE
        RAISE NOTICE 'fk_order_items_order_id constraint already exists';
    END IF;
END $$;

-- 为order_items.product_id创建外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%product_id%'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT fk_order_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) 
        ON DELETE RESTRICT;
        RAISE NOTICE 'Created fk_order_items_product_id constraint';
    ELSE
        RAISE NOTICE 'fk_order_items_product_id constraint already exists';
    END IF;
END $$;

-- 为orders.user_id创建外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT fk_orders_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE RESTRICT;
        RAISE NOTICE 'Created fk_orders_user_id constraint';
    ELSE
        RAISE NOTICE 'fk_orders_user_id constraint already exists';
    END IF;
END $$;

-- =======================================================
-- 5. 验证修复结果
-- =======================================================

-- 最终检查：所有外键引用都应该有效
SELECT 
    'Final integrity check' as check_type,
    COUNT(*) as total_order_items,
    COUNT(CASE WHEN o.id IS NOT NULL THEN 1 END) as valid_order_refs,
    COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as valid_product_refs,
    CASE 
        WHEN COUNT(*) = COUNT(CASE WHEN o.id IS NOT NULL THEN 1 END) 
         AND COUNT(*) = COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END)
        THEN 'PASS'
        ELSE 'FAIL'
    END as integrity_status
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id;

-- =======================================================
-- 6. 预防性措施
-- =======================================================

-- 创建触发器来防止插入无效的外键引用
CREATE OR REPLACE FUNCTION validate_order_item_references()
RETURNS TRIGGER AS $$
BEGIN
    -- 检查订单是否存在
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = NEW.order_id) THEN
        RAISE EXCEPTION 'Order with id % does not exist', NEW.order_id;
    END IF;
    
    -- 检查产品是否存在
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = NEW.product_id) THEN
        RAISE EXCEPTION 'Product with id % does not exist', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'tr_validate_order_item_references'
    ) THEN
        CREATE TRIGGER tr_validate_order_item_references
        BEFORE INSERT OR UPDATE ON order_items
        FOR EACH ROW
        EXECUTE FUNCTION validate_order_item_references();
        RAISE NOTICE 'Created validation trigger';
    ELSE
        RAISE NOTICE 'Validation trigger already exists';
    END IF;
END $$;

-- =======================================================
-- 7. 更新表统计信息
-- =======================================================

-- 更新所有相关表的统计信息
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;

-- =======================================================
-- 8. 检查索引状态
-- =======================================================

-- 检查外键字段的索引
SELECT 
    t.table_name,
    c.column_name,
    CASE WHEN i.indexname IS NOT NULL THEN 'Indexed' ELSE 'Not Indexed' END as index_status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_indexes i ON t.table_name = i.tablename AND c.column_name = i.indexdef
WHERE t.table_name IN ('orders', 'order_items')
  AND c.column_name IN ('user_id', 'order_id', 'product_id')
  AND t.table_schema = 'public'
ORDER BY t.table_name, c.column_name;

-- =======================================================
-- 使用说明
-- =======================================================

/*
执行步骤：

1. 首先运行检查查询，了解当前状态
2. 如果发现无效数据，取消注释相应的DELETE语句
3. 执行外键约束创建
4. 运行验证查询确认修复成功
5. 检查触发器是否正常工作

注意事项：
- 执行前请备份数据库
- DELETE语句会永久删除数据，请谨慎使用
- 在生产环境中建议在维护窗口期间执行
- 如果数据量很大，建议分批处理

常见问题解决：
1. 如果外键约束创建失败，检查数据类型是否匹配
2. 如果触发器创建失败，检查函数语法
3. 如果仍有错误，检查UUID格式是否正确
*/
