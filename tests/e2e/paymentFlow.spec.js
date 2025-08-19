// tests/e2e/paymentFlow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('支付流程端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    // 登录管理员账户
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('信用卡支付流程测试', async ({ page }) => {
    // 导航到支付页面
    await page.click('text=支付管理');
    
    // 选择订单进行支付
    await page.click('.order-item:first-child');
    await page.click('button:has-text("支付")');
    
    // 填写支付信息
    await page.selectOption('select[name="paymentMethod"]', 'credit_card');
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardholderName"]', '测试用户');
    await page.fill('input[name="expiry"]', '12/26');
    await page.fill('input[name="cvc"]', '123');
    await page.fill('input[name="billingAddress"]', '测试地址');
    
    // 提交支付
    await page.click('button:has-text("确认支付")');
    
    // 验证支付结果
    await expect(page.locator('.payment-success')).toBeVisible();
    await expect(page.locator('.transaction-id')).toContainText('TX');
    
    // 验证订单状态更新
    await page.click('text=订单管理');
    const orderStatus = await page.textContent('.order-status');
    expect(orderStatus).toContain('已支付');
  });

  test('支付失败处理测试', async ({ page }) => {
    // 导航到支付页面
    await page.click('text=支付管理');
    
    // 选择订单进行支付
    await page.click('.order-item:first-child');
    await page.click('button:has-text("支付")');
    
    // 使用无效卡号
    await page.selectOption('select[name="paymentMethod"]', 'credit_card');
    await page.fill('input[name="cardNumber"]', '4000000000000002'); // 模拟失败卡号
    await page.fill('input[name="expiry"]', '12/26');
    await page.fill('input[name="cvc"]', '123');
    
    // 提交支付
    await page.click('button:has-text("确认支付")');
    
    // 验证支付失败处理
    await expect(page.locator('.payment-error')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('支付失败');
    
    // 验证订单状态未改变
    await page.click('text=订单管理');
    const orderStatus = await page.textContent('.order-status');
    expect(orderStatus).toContain('待支付');
  });

  test('退款流程测试', async ({ page }) => {
    // 导航到支付历史页面
    await page.click('text=支付管理');
    await page.click('text=支付历史');
    
    // 选择已支付的订单
    await page.click('.payment-item:first-child');
    await page.click('button:has-text("申请退款")');
    
    // 填写退款信息
    await page.fill('textarea[name="refundReason"]', '客户要求退款');
    await page.selectOption('select[name="refundType"]', 'full');
    
    // 提交退款申请
    await page.click('button:has-text("提交退款")');
    
    // 验证退款状态
    await expect(page.locator('.refund-pending')).toBeVisible();
    
    // 管理员审批退款
    await page.click('text=系统管理');
    await page.click('text=退款审批');
    await page.click('.refund-item:first-child');
    await page.click('button:has-text("批准退款")');
    
    // 验证退款完成
    await expect(page.locator('.refund-approved')).toBeVisible();
  });
});
