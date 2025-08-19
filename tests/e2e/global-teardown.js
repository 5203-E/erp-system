// tests/e2e/global-teardown.js

async function globalTeardown(config) {
  console.log('🧹 清理E2E测试环境...');
  
  try {
    // 清理测试数据
    console.log('🗑️ 清理测试数据...');
    
    // 这里可以添加数据库清理、测试文件删除等操作
    // 例如：删除测试用户、测试产品、测试订单等
    
    console.log('✅ 测试环境清理完成');
    
  } catch (error) {
    console.error('❌ 测试环境清理失败:', error);
    // 不抛出错误，避免影响测试结果
  }
}

module.exports = globalTeardown;
