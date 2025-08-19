// 测试数据工厂
const { User, Product, Order, OrderItem } = require('../models');

// 生成测试用户数据
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: '测试用户',
    email: `test-${Date.now()}@example.com`,
    passwordHash: 'hashed-password-123',
    role: 'employee',
    isActive: true
  };

  return await User.create({ ...defaultUser, ...overrides });
};

// 生成测试产品数据
const createTestProduct = async (overrides = {}) => {
  const defaultProduct = {
    name: '测试产品',
    description: '这是一个测试产品',
    price: 99.99,
    stockQuantity: 100,
    category: '电子产品',
    sku: `SKU-${Date.now()}`,
    isActive: true
  };

  return await Product.create({ ...defaultProduct, ...overrides });
};

// 生成测试订单数据
const createTestOrder = async (user, overrides = {}) => {
  const defaultOrder = {
    userId: user.id,
    orderNumber: `ORD-${Date.now()}`,
    totalAmount: 199.98,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '测试地址 123号',
    notes: '测试订单'
  };

  return await Order.create({ ...defaultOrder, ...overrides });
};

// 生成测试订单项数据
const createTestOrderItem = async (order, product, overrides = {}) => {
  const defaultOrderItem = {
    orderId: order.id,
    productId: product.id,
    quantity: 2,
    unitPrice: product.price,
    totalPrice: product.price * 2
  };

  return await OrderItem.create({ ...defaultOrderItem, ...overrides });
};

// 生成完整的测试订单（包含用户、产品和订单项）
const createCompleteTestOrder = async (overrides = {}) => {
  const user = await createTestUser(overrides.user);
  const product = await createTestProduct(overrides.product);
  
  const order = await createTestOrder(user, overrides.order);
  const orderItem = await createTestOrderItem(order, product, overrides.orderItem);
  
  return { user, product, order, orderItem };
};

// 生成多个测试产品
const createMultipleTestProducts = async (count = 3) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    const product = await createTestProduct({
      name: `测试产品 ${i + 1}`,
      sku: `SKU-${Date.now()}-${i}`,
      price: (i + 1) * 50,
      stockQuantity: (i + 1) * 25
    });
    products.push(product);
  }
  return products;
};

// 生成多个测试用户
const createMultipleTestUsers = async (count = 3) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      name: `测试用户 ${i + 1}`,
      email: `test-${Date.now()}-${i}@example.com`,
      role: i === 0 ? 'admin' : 'employee'
    });
    users.push(user);
  }
  return users;
};

// 清理所有测试数据
const cleanupTestData = async () => {
  try {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });
  } catch (error) {
    console.error('清理测试数据失败:', error);
  }
};

module.exports = {
  createTestUser,
  createTestProduct,
  createTestOrder,
  createTestOrderItem,
  createCompleteTestOrder,
  createMultipleTestProducts,
  createMultipleTestUsers,
  cleanupTestData
};
