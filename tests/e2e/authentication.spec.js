// tests/e2e/authentication.spec.js
const { test, expect } = require('@playwright/test');

test.describe('用户认证端到端测试', () => {
  test('管理员登录测试', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 填写登录信息
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('.user-info')).toContainText('admin@erp.com');
    await expect(page.locator('.user-role')).toContainText('管理员');
    
    // 验证管理员权限
    await expect(page.locator('text=系统管理')).toBeVisible();
    await expect(page.locator('text=用户管理')).toBeVisible();
  });

  test('员工登录测试', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 填写登录信息
    await page.fill('input[name="email"]', 'employee@erp.com');
    await page.fill('input[name="password"]', 'EmployeePass123!');
    await page.click('button[type="submit"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('.user-info')).toContainText('employee@erp.com');
    await expect(page.locator('.user-role')).toContainText('员工');
    
    // 验证员工权限（不应看到系统管理）
    await expect(page.locator('text=系统管理')).not.toBeVisible();
    await expect(page.locator('text=订单管理')).toBeVisible();
  });

  test('登录失败测试', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 使用错误的密码
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    // 验证错误消息
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('用户名或密码错误');
    
    // 验证仍在登录页面
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('用户注册测试', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // 填写注册信息
    await page.fill('input[name="name"]', '测试用户');
    await page.fill('input[name="email"]', 'test@erp.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.selectOption('select[name="role"]', 'employee');
    await page.click('button[type="submit"]');
    
    // 验证注册成功
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('注册成功');
    
    // 验证跳转到登录页面
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('密码重置测试', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    
    // 填写邮箱
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.click('button:has-text("发送重置链接")');
    
    // 验证发送成功
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('重置链接已发送');
  });

  test('用户登出测试', async ({ page }) => {
    // 先登录
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    
    // 点击登出
    await page.click('.user-menu');
    await page.click('text=登出');
    
    // 验证登出成功
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('text=请登录')).toBeVisible();
  });
});
