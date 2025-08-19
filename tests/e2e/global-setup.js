// tests/e2e/global-setup.js
const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 启动E2E测试环境...');
  
  // 启动浏览器
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 设置测试数据
    console.log('📊 准备测试数据...');
    
    // 这里可以添加数据库初始化、测试用户创建等操作
    // 例如：创建测试管理员账户、测试产品等
    
    console.log('✅ 测试环境准备完成');
    
  } catch (error) {
    console.error('❌ 测试环境准备失败:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
