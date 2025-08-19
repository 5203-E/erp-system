// tests/e2e/orderWorkflow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('ERP核心业务流程测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    // 登录管理员账户
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('完整订单流程测试', async ({ page }) => {
    // 1. 添加新产品
    await page.click('text=产品管理');
    await page.click('button:has-text("新增产品")');
    await page.fill('input[name="name"]', '端到端测试产品');
    await page.fill('input[name="price"]', '99.99');
    await page.fill('input[name="stock"]', '100');
    await page.click('button:has-text("保存")');
    
    // 2. 创建新订单
    await page.click('text=订单管理');
    await page.click('button:has-text("新建订单")');
    
    // 添加产品到订单
    await page.fill('.product-search input', '端到端测试产品');
    await page.click('.search-result-item:first-child');
    await page.fill('.quantity-input', '5');
    await page.click('button:has-text("添加")');
    
    // 提交订单
    await page.click('button:has-text("提交订单")');
    await expect(page.locator('.order-status')).toHaveText('待处理');
    
    // 3. 处理支付
    await page.click('button:has-text("支付")');
    await page.selectOption('select[name="paymentMethod"]', 'credit_card');
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="expiry"]', '12/26');
    await page.fill('input[name="cvc"]', '123');
    await page.click('button:has-text("确认支付")');
    await expect(page.locator('.payment-status')).toHaveText('支付成功');
    
    // 4. 更新订单状态
    await page.selectOption('select[name="status"]', 'shipped');
    await page.click('button:has-text("更新状态")');
    await expect(page.locator('.order-status')).toHaveText('已发货');
    
    // 5. 验证库存更新
    await page.click('text=产品管理');
    await page.fill('.search-input', '端到端测试产品');
    const stockCount = await page.textContent('.stock-count');
    expect(parseInt(stockCount)).toBe(95);
  });

  test('库存预警测试', async ({ page }) => {
    // 设置库存预警阈值
    await page.click('text=系统设置');
    await page.fill('input[name="inventoryThreshold"]', '10');
    await page.click('button:has-text("保存设置")');
    
    // 创建低库存产品
    await page.click('text=产品管理');
    await page.click('button:has-text("新增产品")');
    await page.fill('input[name="name"]', '低库存测试产品');
    await page.fill('input[name="price"]', '49.99');
    await page.fill('input[name="stock"]', '5');
    await page.click('button:has-text("保存")');
    
    // 检查预警通知
    await page.click('.notification-bell');
    const notificationText = await page.textContent('.notification-item:first-child');
    expect(notificationText).toContain('低库存测试产品');
    expect(notificationText).toContain('库存不足');
  });
});
