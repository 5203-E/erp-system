# Sequelize 外键约束配置指南

## 🔍 错误分析

**错误信息：** `SequelizeForeignKeyConstraintError: insert or update on table 'OrderItems' violates foreign key constraint`

## 🚨 常见原因

### 1. 数据引用问题
- **引用的订单不存在**：`order_id` 指向的订单在 `orders` 表中不存在
- **引用的产品不存在**：`product_id` 指向的产品在 `products` 表中不存在
- **引用的用户不存在**：`user_id` 指向的用户在 `users` 表中不存在

### 2. 数据类型不匹配
- **UUID格式错误**：外键字段的UUID格式不正确
- **类型不一致**：外键字段类型与引用表主键类型不匹配

### 3. 外键约束缺失
- **约束未创建**：数据库中的外键约束没有正确创建
- **约束被删除**：外键约束在某个时候被意外删除

## 🛠️ 修复方案

### 方案1: 使用修复脚本（推荐）

```bash
# 运行自动修复脚本
node fix-foreign-key-errors.js

# 或者只检查数据完整性
node fix-foreign-key-errors.js --check-only
```

### 方案2: 手动SQL修复

```bash
# 连接到数据库
psql -d erp_db -f database/fix-foreign-keys.sql
```

### 方案3: 重新初始化数据库

```bash
# 完全重置数据库（会丢失所有数据）
npm run db:reset
```

## 🔧 Sequelize模型配置

### 正确的模型关联配置

```javascript
// models/index.js
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Product = require('./Product');

// 用户与订单：一对多
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
  onDelete: 'RESTRICT', // 防止删除有订单的用户
  onUpdate: 'CASCADE'
});

Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// 订单与订单项：一对多
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'orderItems',
  onDelete: 'CASCADE', // 删除订单时级联删除订单项
  onUpdate: 'CASCADE'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// 产品与订单项：一对多
Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'orderItems',
  onDelete: 'RESTRICT', // 防止删除有订单项的产品
  onUpdate: 'CASCADE'
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

module.exports = {
  User,
  Order,
  OrderItem,
  Product
};
```

### 模型定义中的外键配置

```javascript
// models/Order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    // ... 其他字段
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
  });

  return Order;
};

// models/OrderItem.js
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    // ... 其他字段
  }, {
    tableName: 'order_items',
    timestamps: true,
    underscored: true
  });

  return OrderItem;
};
```

## 🚀 最佳实践

### 1. 事务处理

```javascript
// 创建订单时使用事务
const createOrder = async (orderData) => {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. 验证用户存在
    const user = await User.findByPk(orderData.user_id, { transaction });
    if (!user) {
      throw new Error('User not found');
    }

    // 2. 验证产品存在
    for (const item of orderData.items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.id}`);
      }
    }

    // 3. 创建订单
    const order = await Order.create({
      user_id: orderData.user_id,
      order_number: generateOrderNumber(),
      total_amount: 0, // 稍后计算
      status: 'pending'
    }, { transaction });

    // 4. 创建订单项
    const orderItems = await Promise.all(
      orderData.items.map(item => 
        OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }, { transaction })
      )
    );

    // 5. 更新库存
    for (const item of orderData.items) {
      await Product.decrement('stockQuantity', {
        by: item.quantity,
        where: { id: item.product_id },
        transaction
      });
    }

    await transaction.commit();
    return { order, orderItems };
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

### 2. 数据验证

```javascript
// 中间件：验证外键引用
const validateForeignKeys = async (req, res, next) => {
  try {
    const { user_id, items } = req.body;
    
    // 验证用户存在
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: '用户不存在',
          error: 'USER_NOT_FOUND'
        });
      }
    }
    
    // 验证产品存在
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `产品 ${item.product_id} 不存在`,
              error: 'PRODUCT_NOT_FOUND',
              product_id: item.product_id
            });
          }
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// 在路由中使用
router.post('/orders', validateForeignKeys, createOrder);
```

### 3. 错误处理

```javascript
// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);
  
  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: '关联数据不存在',
      error: 'FOREIGN_KEY_VIOLATION',
      field: err.fields[0],
      table: err.table,
      value: err.value
    });
  }
  
  // 其他错误处理...
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: 'INTERNAL_SERVER_ERROR'
  });
};
```

## 📋 检查清单

### 部署前检查
- [ ] 所有外键约束已正确创建
- [ ] 模型关联配置正确
- [ ] 事务处理已实现
- [ ] 数据验证中间件已配置
- [ ] 错误处理已完善

### 运行时检查
- [ ] 插入数据前验证引用存在
- [ ] 使用事务保证数据一致性
- [ ] 监控外键约束错误
- [ ] 定期检查数据完整性

## 🚨 注意事项

1. **备份数据库**：修复外键约束前务必备份
2. **测试环境**：先在测试环境中验证修复方案
3. **维护窗口**：在生产环境中选择低峰期执行
4. **监控日志**：修复后持续监控错误日志
5. **数据一致性**：确保业务逻辑与数据库约束一致

## 🔍 调试技巧

### 1. 启用详细日志
```javascript
// 在数据库配置中启用详细日志
const sequelize = new Sequelize({
  // ... 其他配置
  logging: console.log, // 或使用自定义日志函数
  benchmark: true
});
```

### 2. 检查约束状态
```sql
-- 查看所有外键约束
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### 3. 验证数据完整性
```sql
-- 检查孤立数据
SELECT COUNT(*) as orphaned_items
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;
```

---

**总结：通过正确的模型配置、事务处理和数据验证，可以有效预防和解决外键约束错误！** 🎯
