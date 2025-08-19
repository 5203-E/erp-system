const request = require('supertest');
const express = require('express');
const { sequelize } = require('../config/database');
const orderRoutes = require('../routes/orders');
const { 
  createTestUser, 
  createTestProduct, 
  createCompleteTestOrder,
  createMultipleTestProducts,
  cleanupTestData 
} = require('./factories');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

// 全局测试数据
let testUser, testProduct, testProduct2;

describe('Orders API 测试套件', () => {
  
  // 在所有测试开始前设置测试数据
  beforeAll(async () => {
    try {
      // 创建测试用户
      testUser = await createTestUser({
        name: '订单测试用户',
        email: 'order-test@example.com',
        role: 'employee'
      });

      // 创建测试产品
      testProduct = await createTestProduct({
        name: '高库存产品',
        price: 99.99,
        stockQuantity: 1000
      });

      testProduct2 = await createTestProduct({
        name: '低库存产品',
        price: 49.99,
        stockQuantity: 5
      });

      console.log('✅ 测试数据设置完成');
    } catch (error) {
      console.error('❌ 测试数据设置失败:', error);
      throw error;
    }
  });

  // 在每个测试后清理数据
  afterEach(async () => {
    await cleanupTestData();
    
    // 重新创建基础测试数据
    testUser = await createTestUser({
      name: '订单测试用户',
      email: 'order-test@example.com',
      role: 'employee'
    });
    testProduct = await createTestProduct({
      name: '高库存产品',
      price: 99.99,
      stockQuantity: 1000
    });
    testProduct2 = await createTestProduct({
      name: '低库存产品',
      price: 49.99,
      stockQuantity: 5
    });
  });

  describe('POST /api/orders - 创建订单', () => {
    
    test('✅ 成功创建订单 - 正常情况', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 2
          }
        ],
        shipping_address: '北京市朝阳区测试街道123号',
        notes: '测试订单备注'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // 验证响应结构
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '订单创建成功');
      expect(response.body).toHaveProperty('data');

      const { data } = response.body;
      expect(data).toHaveProperty('order_id');
      expect(data).toHaveProperty('order_number');
      expect(data).toHaveProperty('total_amount');
      expect(data).toHaveProperty('status', 'pending');
      expect(data).toHaveProperty('items_count', 1);
      expect(data).toHaveProperty('created_at');

      // 验证订单号格式
      expect(data.order_number).toMatch(/^ORD-\d+$/);
      
      // 验证总金额计算
      const expectedTotal = (testProduct.price * 2).toFixed(2);
      expect(data.total_amount).toBe(expectedTotal);
    });

    test('✅ 成功创建订单 - 多个产品', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          },
          {
            product_id: testProduct2.id,
            quantity: 3
          }
        ],
        shipping_address: '上海市浦东新区测试路456号'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      const { data } = response.body;
      expect(data.items_count).toBe(2);
      
      // 验证总金额计算
      const expectedTotal = (testProduct.price * 1 + testProduct2.price * 3).toFixed(2);
      expect(data.total_amount).toBe(expectedTotal);
    });

    test('✅ 成功创建订单 - 最小必需字段', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    test('❌ 库存不足错误 - 单个产品', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct2.id, // 库存只有5个
            quantity: 10 // 请求10个
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INSUFFICIENT_STOCK');
      expect(response.body.message).toContain('库存不足');
      
      // 验证错误详情
      expect(response.body.product).toHaveProperty('id', testProduct2.id);
      expect(response.body.product).toHaveProperty('name', testProduct2.name);
      expect(response.body.product).toHaveProperty('current_stock', 5);
      expect(response.body.product).toHaveProperty('requested_quantity', 10);
    });

    test('❌ 库存不足错误 - 多个产品', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1000 // 刚好等于库存
          },
          {
            product_id: testProduct2.id,
            quantity: 6 // 超过库存
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INSUFFICIENT_STOCK');
      expect(response.body.message).toContain('库存不足');
    });

    test('❌ 用户不存在错误', async () => {
      const nonExistentUserId = '550e8400-e29b-41d4-a716-446655440999';
      
      const orderData = {
        user_id: nonExistentUserId,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USER_NOT_FOUND');
      expect(response.body.message).toBe('用户不存在');
    });

    test('❌ 用户账户被禁用错误', async () => {
      // 创建被禁用的用户
      const disabledUser = await createTestUser({
        name: '禁用用户',
        email: 'disabled@example.com',
        isActive: false
      });

      const orderData = {
        user_id: disabledUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USER_INACTIVE');
      expect(response.body.message).toBe('用户账户已被禁用');
    });

    test('❌ 产品不存在错误', async () => {
      const nonExistentProductId = '550e8400-e29b-41d4-a716-446655440888';
      
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: nonExistentProductId,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('PRODUCTS_NOT_FOUND');
      expect(response.body.message).toBe('部分产品不存在或已被禁用');
    });

    test('❌ 产品被禁用错误', async () => {
      // 创建被禁用的产品
      const disabledProduct = await createTestProduct({
        name: '禁用产品',
        isActive: false
      });

      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: disabledProduct.id,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('PRODUCTS_NOT_FOUND');
    });

    test('❌ 验证错误 - 缺少用户ID', async () => {
      const orderData = {
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_USER_ID');
      expect(response.body.message).toBe('用户ID是必需的');
    });

    test('❌ 验证错误 - 缺少产品列表', async () => {
      const orderData = {
        user_id: testUser.id
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_OR_EMPTY_PRODUCTS');
      expect(response.body.message).toBe('产品列表是必需的且不能为空');
    });

    test('❌ 验证错误 - 产品数量为0', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 0
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_QUANTITY');
      expect(response.body.message).toContain('quantity必须是大于0的数字');
    });

    test('❌ 验证错误 - 产品数量为负数', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: -1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_QUANTITY');
    });

    test('❌ 验证错误 - 产品数量不是整数', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1.5
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('QUANTITY_MUST_BE_INTEGER');
    });

    test('❌ 验证错误 - 重复产品ID', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          },
          {
            product_id: testProduct.id, // 重复的产品ID
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('DUPLICATE_PRODUCTS');
      expect(response.body.message).toBe('订单中不能包含重复的产品');
    });

    test('❌ 验证错误 - 产品数量超过限制', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 10001 // 超过10000的限制
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('QUANTITY_TOO_LARGE');
    });

    test('❌ 验证错误 - 产品数量过多', async () => {
      // 创建101个产品
      const manyProducts = [];
      for (let i = 0; i < 101; i++) {
        manyProducts.push({
          product_id: testProduct.id,
          quantity: 1
        });
      }

      const orderData = {
        user_id: testUser.id,
        products: manyProducts
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('TOO_MANY_PRODUCTS');
      expect(response.body.message).toBe('单次订单最多支持100种产品');
    });

    test('❌ 验证错误 - 无效的收货地址格式', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          }
        ],
        shipping_address: 12345 // 应该是字符串
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_SHIPPING_ADDRESS_FORMAT');
    });

    test('❌ 验证错误 - 无效的备注格式', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1
          }
        ],
        notes: true // 应该是字符串
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_NOTES_FORMAT');
    });
  });

  describe('GET /api/orders - 获取订单列表', () => {
    
    beforeEach(async () => {
      // 创建多个测试订单
      await createCompleteTestOrder({
        user: { id: testUser.id },
        order: { status: 'pending' }
      });
      
      await createCompleteTestOrder({
        user: { id: testUser.id },
        order: { status: 'completed' }
      });
    });

    test('✅ 成功获取订单列表 - 默认分页', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('pagination');

      const { orders, pagination } = response.body.data;
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      
      // 验证分页信息
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
      expect(pagination.total).toBeGreaterThan(0);
      expect(pagination.pages).toBeGreaterThan(0);
    });

    test('✅ 成功获取订单列表 - 自定义分页', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=5')
        .expect(200);

      const { pagination } = response.body.data;
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(5);
    });

    test('✅ 成功获取订单列表 - 按状态过滤', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .expect(200);

      const { orders } = response.body.data;
      expect(orders.length).toBeGreaterThan(0);
      
      // 验证所有订单都是pending状态
      orders.forEach(order => {
        expect(order.status).toBe('pending');
      });
    });

    test('✅ 成功获取订单列表 - 按用户过滤', async () => {
      const response = await request(app)
        .get(`/api/orders?user_id=${testUser.id}`)
        .expect(200);

      const { orders } = response.body.data;
      expect(orders.length).toBeGreaterThan(0);
      
      // 验证所有订单都属于指定用户
      orders.forEach(order => {
        expect(order.userId).toBe(testUser.id);
      });
    });

    test('✅ 成功获取订单列表 - 包含关联数据', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      const { orders } = response.body.data;
      expect(orders.length).toBeGreaterThan(0);
      
      // 验证订单包含用户信息
      const order = orders[0];
      expect(order).toHaveProperty('user');
      expect(order.user).toHaveProperty('id');
      expect(order.user).toHaveProperty('name');
      expect(order.user).toHaveProperty('email');
      
      // 验证订单包含订单项信息
      expect(order).toHaveProperty('orderItems');
      expect(Array.isArray(order.orderItems)).toBe(true);
      
      if (order.orderItems.length > 0) {
        const orderItem = order.orderItems[0];
        expect(orderItem).toHaveProperty('product');
        expect(orderItem.product).toHaveProperty('id');
        expect(orderItem.product).toHaveProperty('name');
        expect(orderItem.product).toHaveProperty('sku');
      }
    });

    test('❌ 验证错误 - 无效页码', async () => {
      const response = await request(app)
        .get('/api/orders?page=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_PAGE');
    });

    test('❌ 验证错误 - 无效每页数量', async () => {
      const response = await request(app)
        .get('/api/orders?limit=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_LIMIT');
    });

    test('❌ 验证错误 - 每页数量超过限制', async () => {
      const response = await request(app)
        .get('/api/orders?limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_LIMIT');
    });
  });

  describe('GET /api/orders/:id - 获取订单详情', () => {
    
    let testOrder;

    beforeEach(async () => {
      const { order } = await createCompleteTestOrder({
        user: { id: testUser.id }
      });
      testOrder = order;
    });

    test('✅ 成功获取订单详情', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testOrder.id);
      expect(response.body.data).toHaveProperty('orderNumber', testOrder.orderNumber);
      expect(response.body.data).toHaveProperty('totalAmount', testOrder.totalAmount);
      expect(response.body.data).toHaveProperty('status', testOrder.status);
      
      // 验证包含关联数据
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('orderItems');
    });

    test('❌ 订单不存在错误', async () => {
      const nonExistentOrderId = '550e8400-e29b-41d4-a716-446655440777';
      
      const response = await request(app)
        .get(`/api/orders/${nonExistentOrderId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ORDER_NOT_FOUND');
      expect(response.body.message).toBe('订单不存在');
    });

    test('❌ 无效的订单ID格式', async () => {
      const response = await request(app)
        .get('/api/orders/invalid-id')
        .expect(500); // Sequelize会抛出错误

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/orders/:id/status - 更新订单状态', () => {
    
    let testOrder;

    beforeEach(async () => {
      const { order } = await createCompleteTestOrder({
        user: { id: testUser.id },
        order: { status: 'pending' }
      });
      testOrder = order;
    });

    test('✅ 成功更新订单状态', async () => {
      const updateData = {
        status: 'processing'
      };

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('订单状态更新成功');
      expect(response.body.data.status).toBe('processing');
      expect(response.body.data).toHaveProperty('updated_at');
    });

    test('✅ 成功更新支付状态', async () => {
      const updateData = {
        payment_status: 'paid'
      };

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_status).toBe('paid');
    });

    test('✅ 成功更新状态和支付状态', async () => {
      const updateData = {
        status: 'completed',
        payment_status: 'paid'
      };

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.payment_status).toBe('paid');
    });

    test('❌ 订单不存在错误', async () => {
      const nonExistentOrderId = '550e8400-e29b-41d4-a716-446655440666';
      
      const response = await request(app)
        .patch(`/api/orders/${nonExistentOrderId}/status`)
        .send({ status: 'processing' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ORDER_NOT_FOUND');
    });

    test('❌ 无效状态转换错误', async () => {
      // 尝试从pending直接转换为completed（应该先转换为processing）
      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send({ status: 'completed' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_STATUS_TRANSITION');
      expect(response.body.message).toContain('订单状态不能从 pending 直接转换为 completed');
    });

    test('❌ 缺少更新字段错误', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_UPDATE_FIELDS');
    });

    test('❌ 无效状态值错误', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_STATUS');
    });

    test('❌ 无效支付状态值错误', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send({ payment_status: 'invalid_payment_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_PAYMENT_STATUS');
    });
  });

  describe('数据完整性测试', () => {
    
    test('✅ 创建订单后库存正确减少', async () => {
      const initialStock = testProduct.stockQuantity;
      const orderQuantity = 5;
      
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: orderQuantity
          }
        ]
      };

      // 创建订单
      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // 验证库存已减少
      const updatedProduct = await testProduct.reload();
      expect(updatedProduct.stockQuantity).toBe(initialStock - orderQuantity);
    });

    test('✅ 创建订单后正确创建订单项', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 3
          },
          {
            product_id: testProduct2.id,
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = response.body.data.order_id;
      
      // 验证订单项已创建
      const orderItems = await require('../models').OrderItem.findAll({
        where: { orderId: orderId }
      });
      
      expect(orderItems).toHaveLength(2);
      
      // 验证第一个订单项
      const firstItem = orderItems.find(item => item.productId === testProduct.id);
      expect(firstItem).toBeDefined();
      expect(firstItem.quantity).toBe(3);
      expect(firstItem.unitPrice).toBe(testProduct.price);
      expect(firstItem.totalPrice).toBe(testProduct.price * 3);
      
      // 验证第二个订单项
      const secondItem = orderItems.find(item => item.productId === testProduct2.id);
      expect(secondItem).toBeDefined();
      expect(secondItem.quantity).toBe(2);
      expect(secondItem.unitPrice).toBe(testProduct2.price);
      expect(secondItem.totalPrice).toBe(testProduct2.price * 2);
    });

    test('✅ 事务回滚 - 部分产品库存不足时', async () => {
      const initialStock1 = testProduct.stockQuantity;
      const initialStock2 = testProduct2.stockQuantity;
      
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 1 // 库存充足
          },
          {
            product_id: testProduct2.id,
            quantity: 10 // 库存不足
          }
        ]
      };

      // 尝试创建订单，应该失败
      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      // 验证库存没有变化（事务回滚）
      const updatedProduct1 = await testProduct.reload();
      const updatedProduct2 = await testProduct2.reload();
      
      expect(updatedProduct1.stockQuantity).toBe(initialStock1);
      expect(updatedProduct2.stockQuantity).toBe(initialStock2);
    });
  });

  describe('边界条件测试', () => {
    
    test('✅ 创建订单 - 最大允许产品数量', async () => {
      // 创建100个不同的产品
      const products = await createMultipleTestProducts(100);
      
      const orderData = {
        user_id: testUser.id,
        products: products.map(product => ({
          product_id: product.id,
          quantity: 1
        }))
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items_count).toBe(100);
    });

    test('❌ 创建订单 - 超过最大允许产品数量', async () => {
      // 创建101个不同的产品
      const products = await createMultipleTestProducts(101);
      
      const orderData = {
        user_id: testUser.id,
        products: products.map(product => ({
          product_id: product.id,
          quantity: 1
        }))
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('TOO_MANY_PRODUCTS');
    });

    test('✅ 创建订单 - 最大允许数量', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 10000 // 最大允许数量
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('❌ 创建订单 - 超过最大允许数量', async () => {
      const orderData = {
        user_id: testUser.id,
        products: [
          {
            product_id: testProduct.id,
            quantity: 10001 // 超过最大允许数量
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('QUANTITY_TOO_LARGE');
    });
  });
});
