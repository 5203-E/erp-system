const User = require('./User.js');
const Product = require('./Product.js');
const Order = require('./Order.js');
const OrderItem = require('./OrderItem.js');

// 定义模型关联关系

// User - Order (一对多)
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'RESTRICT',
});

Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Order - OrderItem (一对多)
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'orderItems',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

// Product - OrderItem (一对多)
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems',
  onDelete: 'RESTRICT',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// 通过 OrderItem 建立 Order 和 Product 的多对多关系
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: 'orderId',
  otherKey: 'productId',
  as: 'products',
});

Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: 'productId',
  otherKey: 'orderId',
  as: 'orders',
});

// 导出所有模型
module.exports = {
  User,
  Product,
  Order,
  OrderItem,
};
