// tests/integration/erpIntegration.test.js
const request = require('supertest');
const app = require('../../server');
const { User, Product, Order } = require('../../models');
const jwt = require('jsonwebtoken');

describe('ERP系统集成测试', () => {
  let adminToken;
  let testProduct;
  let testOrder;
  
  beforeAll(async () => {
    // 创建测试用户
    const admin = await User.create({
      name: '集成测试管理员',
      email: 'integration@test.com',
      password: 'TestPass123!',
      role: 'admin'
    });
    
    // 生成JWT
    adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    
    // 创建测试产品
    testProduct = await Product.create({
      name: '集成测试产品',
      price: 49.99,
      stock_quantity: 100
    });
  });
  
  afterAll(async () => {
    // 清理测试数据
    await User.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Order.destroy({ where: {} });
  });
  
  test('创建订单流程', async () => {
    // 创建订单
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productId: testProduct.id, quantity: 3 }
        ]
      });
    
    expect(orderRes.statusCode).toBe(201);
    testOrder = orderRes.body;
    
    // 验证订单状态
    expect(testOrder.status).toBe('pending');
    expect(testOrder.total_amount).toBe(149.97);
    
    // 处理支付
    const paymentRes = await request(app)
      .post(`/api/orders/${testOrder.id}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        paymentMethod: 'credit_card',
        amount: 149.97
      });
    
    expect(paymentRes.statusCode).toBe(200);
    expect(paymentRes.body.status).toBe('paid');
    
    // 更新订单状态
    const updateRes = await request(app)
      .patch(`/api/orders/${testOrder.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' });
    
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('completed');
    
    // 验证库存更新
    const productRes = await request(app)
      .get(`/api/products/${testProduct.id}`);
    
    expect(productRes.statusCode).toBe(200);
    expect(productRes.body.stock_quantity).toBe(97);
  });
  
  test('用户权限验证', async () => {
    // 创建普通用户
    const user = await User.create({
      name: '普通用户',
      email: 'user@test.com',
      password: 'UserPass123!',
      role: 'user'
    });
    
    const userToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    
    // 尝试访问管理员接口
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('无权访问');
  });
  
  test('库存不足处理', async () => {
    // 尝试创建超过库存的订单
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { productId: testProduct.id, quantity: 200 }
        ]
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('库存不足');
  });
});
