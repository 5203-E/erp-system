const { Sequelize } = require('sequelize');
const { sequelize } = require('./config/database');

// 查询性能测试脚本
async function testQueryPerformance() {
  try {
    console.log('🚀 开始查询性能测试\n');

    // 测试原始查询（优化前）
    console.log('1. 测试原始查询性能:');
    console.log('SELECT * FROM orders WHERE user_id = ? AND status = \'completed\' ORDER BY created_at DESC;');
    
    const startTime1 = Date.now();
    const [results1] = await sequelize.query(`
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
      SELECT * FROM orders 
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' 
        AND status = 'completed'
      ORDER BY created_at DESC;
    `);
    const endTime1 = Date.now();
    
    console.log('执行计划:', JSON.stringify(results1[0], null, 2));
    console.log(`执行时间: ${endTime1 - startTime1}ms\n`);

    // 测试优化后的查询
    console.log('2. 测试优化后的查询性能:');
    console.log('SELECT 指定列 + LIMIT 优化');
    
    const startTime2 = Date.now();
    const [results2] = await sequelize.query(`
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
      SELECT id, order_number, user_id, total_amount, status, 
             payment_status, created_at
      FROM orders 
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' 
        AND status = 'completed'
      ORDER BY created_at DESC
      LIMIT 20;
    `);
    const endTime2 = Date.now();
    
    console.log('执行计划:', JSON.stringify(results2[0], null, 2));
    console.log(`执行时间: ${endTime2 - startTime2}ms\n`);

    // 测试索引使用情况
    console.log('3. 检查orders表的索引使用情况:');
    const [indexStats] = await sequelize.query(`
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
    `);
    
    console.table(indexStats);

    // 测试不同查询模式
    console.log('\n4. 测试其他常见查询模式:');
    
    // 按用户查询
    console.log('4.1 按用户查询所有订单:');
    const startTime3 = Date.now();
    await sequelize.query(`
      SELECT id, order_number, total_amount, status, created_at
      FROM orders 
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    const endTime3 = Date.now();
    console.log(`执行时间: ${endTime3 - startTime3}ms`);

    // 按状态查询
    console.log('4.2 按状态查询订单:');
    const startTime4 = Date.now();
    await sequelize.query(`
      SELECT id, order_number, user_id, total_amount, created_at
      FROM orders 
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    const endTime4 = Date.now();
    console.log(`执行时间: ${endTime4 - startTime4}ms`);

    // 时间范围查询
    console.log('4.3 时间范围查询:');
    const startTime5 = Date.now();
    await sequelize.query(`
      SELECT id, order_number, user_id, total_amount, status
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    const endTime5 = Date.now();
    console.log(`执行时间: ${endTime5 - startTime5}ms`);

    // 聚合查询
    console.log('4.4 用户订单统计:');
    const startTime6 = Date.now();
    await sequelize.query(`
      SELECT 
          user_id,
          COUNT(*) as total_orders,
          SUM(total_amount) as total_spent,
          AVG(total_amount) as avg_order_value
      FROM orders 
      WHERE status = 'completed'
      GROUP BY user_id
      ORDER BY total_spent DESC
      LIMIT 10;
    `);
    const endTime6 = Date.now();
    console.log(`执行时间: ${endTime6 - startTime6}ms`);

    console.log('\n📊 性能测试完成！');

  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
  }
}

// 检查索引建议
async function checkIndexRecommendations() {
  try {
    console.log('\n🔍 检查索引建议:');

    // 查找未使用的索引
    const [unusedIndexes] = await sequelize.query(`
      SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes 
      WHERE idx_tup_read = 0 
        AND idx_tup_fetch = 0
        AND tablename = 'orders';
    `);

    if (unusedIndexes.length > 0) {
      console.log('⚠️  发现未使用的索引:');
      console.table(unusedIndexes);
    } else {
      console.log('✅ 所有索引都在使用中');
    }

    // 检查表大小
    const [tableSize] = await sequelize.query(`
      SELECT 
          pg_size_pretty(pg_total_relation_size('orders')) as total_size,
          pg_size_pretty(pg_relation_size('orders')) as table_size,
          pg_size_pretty(pg_total_relation_size('orders') - pg_relation_size('orders')) as indexes_size;
    `);

    console.log('\n📏 表大小信息:');
    console.table(tableSize);

  } catch (error) {
    console.error('❌ 索引检查失败:', error.message);
  }
}

// 生成测试数据
async function generateTestData() {
  try {
    console.log('📝 检查测试数据...');
    
    const [orderCount] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
    
    if (orderCount[0].count < 1000) {
      console.log('🔄 生成测试数据以便进行性能测试...');
      
      // 获取现有用户ID
      const [users] = await sequelize.query('SELECT id FROM users LIMIT 10');
      
      if (users.length === 0) {
        console.log('⚠️  没有找到用户数据，请先运行数据库初始化脚本');
        return;
      }

      // 生成测试订单数据
      for (let i = 0; i < 1000; i++) {
        const userId = users[Math.floor(Math.random() * users.length)].id;
        const status = ['pending', 'processing', 'completed', 'cancelled'][Math.floor(Math.random() * 4)];
        const paymentStatus = ['pending', 'paid', 'failed'][Math.floor(Math.random() * 3)];
        const totalAmount = (Math.random() * 1000 + 10).toFixed(2);
        const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // 过去90天内的随机时间

        await sequelize.query(`
          INSERT INTO orders (user_id, order_number, total_amount, status, payment_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            userId,
            `ORD-${Date.now()}-${i}`,
            totalAmount,
            status,
            paymentStatus,
            createdAt
          ]
        });
      }
      
      console.log('✅ 测试数据生成完成');
    } else {
      console.log('✅ 测试数据已存在');
    }
  } catch (error) {
    console.error('❌ 生成测试数据失败:', error.message);
  }
}

// 主函数
async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    await generateTestData();
    await testQueryPerformance();
    await checkIndexRecommendations();

    console.log('\n🎯 优化建议:');
    console.log('1. 创建复合索引: (user_id, status, created_at DESC)');
    console.log('2. 避免 SELECT *，只选择需要的列');
    console.log('3. 使用 LIMIT 进行分页');
    console.log('4. 定期监控索引使用情况');
    console.log('5. 考虑使用部分索引来节省空间');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  testQueryPerformance,
  checkIndexRecommendations,
  generateTestData
};
