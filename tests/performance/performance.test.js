// tests/performance/performance.test.js
const request = require('supertest');
const app = require('../../server');

describe('ERP系统性能测试', () => {
  const baseURL = 'http://localhost:3000';
  
  test('API响应时间测试', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // 响应时间应该在100ms以内
    expect(responseTime).toBeLessThan(100);
    console.log(`健康检查响应时间: ${responseTime}ms`);
  });
  
  test('并发用户测试', async () => {
    const concurrentUsers = 10;
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        request(app)
          .get('/api/health')
          .expect(200)
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const totalTime = endTime - startTime;
    const avgResponseTime = totalTime / concurrentUsers;
    
    // 平均响应时间应该在200ms以内
    expect(avgResponseTime).toBeLessThan(200);
    console.log(`并发${concurrentUsers}用户测试 - 总时间: ${totalTime}ms, 平均响应时间: ${avgResponseTime}ms`);
    
    // 所有请求都应该成功
    results.forEach(result => {
      expect(result.status).toBe(200);
    });
  });
  
  test('数据库查询性能测试', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // 产品列表查询应该在500ms以内
    expect(responseTime).toBeLessThan(500);
    console.log(`产品列表查询响应时间: ${responseTime}ms`);
    
    // 验证返回数据
    expect(response.body).toHaveProperty('products');
    expect(Array.isArray(response.body.products)).toBe(true);
  });
  
  test('订单创建性能测试', async () => {
    const orderData = {
      items: [
        { productId: 1, quantity: 2 }
      ]
    };
    
    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(201);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // 订单创建应该在1000ms以内
    expect(responseTime).toBeLessThan(1000);
    console.log(`订单创建响应时间: ${responseTime}ms`);
    
    // 验证返回数据
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status');
  });
  
  test('内存使用测试', async () => {
    const initialMemory = process.memoryUsage();
    
    // 执行一系列操作
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/health');
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // 内存增长应该在10MB以内
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    console.log(`内存使用增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  });
  
  test('负载测试 - 连续请求', async () => {
    const requestCount = 50;
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < requestCount; i++) {
      try {
        await request(app).get('/api/health');
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const requestsPerSecond = requestCount / (totalTime / 1000);
    
    // 成功率应该在95%以上
    const successRate = (successCount / requestCount) * 100;
    expect(successRate).toBeGreaterThan(95);
    
    // 每秒处理请求数应该在10以上
    expect(requestsPerSecond).toBeGreaterThan(10);
    
    console.log(`负载测试结果:`);
    console.log(`- 总请求数: ${requestCount}`);
    console.log(`- 成功请求: ${successCount}`);
    console.log(`- 失败请求: ${errorCount}`);
    console.log(`- 成功率: ${successRate.toFixed(2)}%`);
    console.log(`- 总时间: ${totalTime}ms`);
    console.log(`- 每秒请求数: ${requestsPerSecond.toFixed(2)}`);
  });
});
