const { sequelize } = require('../config/database.js');
const { User, Product, Order, OrderItem } = require('../models/index.js');
const { Op } = require('sequelize');

// 创建新订单
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { user_id, products, shipping_address, notes } = req.body;
    
    // 1. 验证用户存在
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        error: 'USER_NOT_FOUND'
      });
    }
    
    if (!user.isActive) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '用户账户已被禁用',
        error: 'USER_INACTIVE'
      });
    }
    
    // 2. 检查每个产品的库存是否充足
    const productIds = products.map(p => p.product_id);
    const dbProducts = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        isActive: true
      },
      transaction
    });
    
    if (dbProducts.length !== productIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '部分产品不存在或已被禁用',
        error: 'PRODUCTS_NOT_FOUND'
      });
    }
    
    // 创建产品ID到产品对象的映射
    const productMap = new Map();
    dbProducts.forEach(product => {
      productMap.set(product.id, product);
    });
    
    // 验证库存和计算总金额
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of products) {
      const product = productMap.get(item.product_id);
      
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `产品ID ${item.product_id} 不存在`,
          error: 'PRODUCT_NOT_FOUND'
        });
      }
      
      if (product.stockQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `产品 ${product.name} 库存不足。当前库存: ${product.stockQuantity}, 需要: ${item.quantity}`,
          error: 'INSUFFICIENT_STOCK',
          product: {
            id: product.id,
            name: product.name,
            current_stock: product.stockQuantity,
            requested_quantity: item.quantity
          }
        });
      }
      
      // 计算小计金额
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      // 准备订单明细数据
      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal
      });
    }
    
    // 3. 创建订单记录
    const order = await Order.create({
      userId: user_id,
      orderNumber: Order.generateOrderNumber(),
      totalAmount: totalAmount.toFixed(2),
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      notes
    }, { transaction });
    
    // 4. 创建订单明细
    const createdOrderItems = await Promise.all(
      orderItems.map(item => 
        OrderItem.create({
          orderId: order.id,
          ...item
        }, { transaction })
      )
    );
    
    // 5. 减少产品库存
    for (const item of orderItems) {
      await Product.update(
        {
          stockQuantity: sequelize.literal(`stock_quantity - ${item.quantity}`)
        },
        {
          where: { id: item.product_id },
          transaction
        }
      );
    }
    
    // 提交事务
    await transaction.commit();
    
    // 6. 返回成功响应
    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: {
        order_id: order.id,
        order_number: order.orderNumber,
        total_amount: order.totalAmount,
        status: order.status,
        items_count: createdOrderItems.length,
        created_at: order.createdAt
      }
    });
    
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    
    console.error('创建订单失败:', error);
    
    // 根据错误类型返回相应的状态码
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        error: 'VALIDATION_ERROR',
        details: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: '订单号重复，请重试',
        error: 'DUPLICATE_ORDER_NUMBER'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '创建订单失败，请稍后重试',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// 获取所有订单
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user_id } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (user_id) whereClause.userId = user_id;
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// 根据ID获取订单
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'price']
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// 更新订单状态
const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '订单不存在',
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    // 验证状态转换的合法性
    const validStatusTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    
    if (status && !validStatusTransitions[order.status].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `订单状态不能从 ${order.status} 直接转换为 ${status}`,
        error: 'INVALID_STATUS_TRANSITION'
      });
    }
    
    // 更新订单
    const updateData = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.paymentStatus = payment_status;
    
    await order.update(updateData, { transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: '订单状态更新成功',
      data: {
        order_id: order.id,
        status: order.status,
        payment_status: order.paymentStatus,
        updated_at: order.updatedAt
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('更新订单状态失败:', error);
    
    res.status(500).json({
      success: false,
      message: '更新订单状态失败',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
