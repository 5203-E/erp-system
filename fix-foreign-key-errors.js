const { Sequelize } = require('sequelize');
const { sequelize } = require('./config/database');

// 修复外键约束错误的脚本
async function fixForeignKeyErrors() {
  try {
    console.log('🔧 开始修复外键约束错误...\n');

    // 1. 检查数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 2. 检查外键约束状态
    console.log('📋 检查外键约束状态:');
    const [constraints] = await sequelize.query(`
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
    `);

    console.table(constraints);

    // 3. 检查数据完整性
    console.log('\n🔍 检查数据完整性:');

    // 检查order_items表中无效的order_id引用
    const [invalidOrderRefs] = await sequelize.query(`
      SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL;
    `);

    if (invalidOrderRefs.length > 0) {
      console.log('⚠️  发现无效的订单引用:');
      console.table(invalidOrderRefs);
      
      // 修复：删除无效的订单项
      console.log('🔄 删除无效的订单项...');
      await sequelize.query(`
        DELETE FROM order_items 
        WHERE order_id NOT IN (SELECT id FROM orders);
      `);
      console.log('✅ 无效订单项已清理');
    } else {
      console.log('✅ 所有订单引用都有效');
    }

    // 检查order_items表中无效的product_id引用
    const [invalidProductRefs] = await sequelize.query(`
      SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE p.id IS NULL;
    `);

    if (invalidProductRefs.length > 0) {
      console.log('⚠️  发现无效的产品引用:');
      console.table(invalidProductRefs);
      
      // 修复：删除无效的产品引用
      console.log('🔄 删除无效的产品引用...');
      await sequelize.query(`
        DELETE FROM order_items 
        WHERE product_id NOT IN (SELECT id FROM products);
      `);
      console.log('✅ 无效产品引用已清理');
    } else {
      console.log('✅ 所有产品引用都有效');
    }

    // 4. 检查UUID格式
    console.log('\n🔍 检查UUID格式:');
    
    const [invalidUUIDs] = await sequelize.query(`
      SELECT 
          id,
          order_id,
          product_id
      FROM order_items 
      WHERE order_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         OR product_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    `);

    if (invalidUUIDs.length > 0) {
      console.log('⚠️  发现无效的UUID格式:');
      console.table(invalidUUIDs);
    } else {
      console.log('✅ 所有UUID格式都正确');
    }

    // 5. 重新创建外键约束（如果需要）
    console.log('\n🔧 检查外键约束:');
    
    // 检查order_items表的外键约束
    const [orderItemsConstraints] = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'order_items' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%order_id%';
    `);

    if (orderItemsConstraints.length === 0) {
      console.log('⚠️  order_items.order_id 外键约束缺失，正在创建...');
      await sequelize.query(`
        ALTER TABLE order_items 
        ADD CONSTRAINT fk_order_items_order_id 
        FOREIGN KEY (order_id) REFERENCES orders(id) 
        ON DELETE CASCADE;
      `);
      console.log('✅ order_id 外键约束已创建');
    } else {
      console.log('✅ order_id 外键约束已存在');
    }

    // 检查product_id外键约束
    const [productConstraints] = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'order_items' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%product_id%';
    `);

    if (productConstraints.length === 0) {
      console.log('⚠️  order_items.product_id 外键约束缺失，正在创建...');
      await sequelize.query(`
        ALTER TABLE order_items 
        ADD CONSTRAINT fk_order_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) 
        ON DELETE RESTRICT;
      `);
      console.log('✅ product_id 外键约束已创建');
    } else {
      console.log('✅ product_id 外键约束已存在');
    }

    // 6. 验证修复结果
    console.log('\n✅ 验证修复结果:');
    
    const [finalCheck] = await sequelize.query(`
      SELECT 
          COUNT(*) as total_order_items,
          COUNT(CASE WHEN o.id IS NOT NULL THEN 1 END) as valid_order_refs,
          COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as valid_product_refs
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id;
    `);

    console.table(finalCheck);

    if (finalCheck[0].total_order_items === finalCheck[0].valid_order_refs &&
        finalCheck[0].total_order_items === finalCheck[0].valid_product_refs) {
      console.log('🎉 所有外键约束错误已修复！');
    } else {
      console.log('⚠️  仍有部分数据需要手动处理');
    }

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    console.error('详细错误:', error);
  } finally {
    await sequelize.close();
  }
}

// 预防性检查函数
async function checkDataIntegrity() {
  try {
    await sequelize.authenticate();
    console.log('🔍 执行数据完整性检查...\n');

    // 检查各表的记录数量
    const [tableCounts] = await sequelize.query(`
      SELECT 
          'users' as table_name,
          COUNT(*) as record_count
      FROM users
      UNION ALL
      SELECT 
          'products' as table_name,
          COUNT(*) as record_count
      FROM products
      UNION ALL
      SELECT 
          'orders' as table_name,
          COUNT(*) as record_count
      FROM orders
      UNION ALL
      SELECT 
          'order_items' as table_name,
          COUNT(*) as record_count
      FROM order_items;
    `);

    console.log('📊 各表记录数量:');
    console.table(tableCounts);

    // 检查孤立数据
    const [orphanedData] = await sequelize.query(`
      SELECT 
          'order_items without orders' as issue,
          COUNT(*) as count
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
      UNION ALL
      SELECT 
          'order_items without products' as issue,
          COUNT(*) as count
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE p.id IS NULL
      UNION ALL
      SELECT 
          'orders without users' as issue,
          COUNT(*) as count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE u.id IS NULL;
    `);

    console.log('\n🔍 孤立数据检查:');
    console.table(orphanedData);

  } catch (error) {
    console.error('❌ 数据完整性检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--check-only')) {
    await checkDataIntegrity();
  } else {
    await fixForeignKeyErrors();
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  fixForeignKeyErrors,
  checkDataIntegrity
};
