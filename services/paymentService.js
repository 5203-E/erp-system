const { Order, User, Payment } = require('../models');
const { sequelize } = require('../config/database');

/**
 * 支付服务类
 * 处理订单支付相关的业务逻辑
 */
class PaymentService {
  /**
   * 处理支付
   * @param {Object} paymentData - 支付数据
   * @param {string} paymentData.orderId - 订单ID
   * @param {string} paymentData.paymentMethod - 支付方式
   * @param {number} paymentData.amount - 支付金额
   * @param {string} paymentData.userId - 用户ID
   * @returns {Promise<Object>} 支付结果
   */
  static async processPayment(paymentData) {
    const { orderId, paymentMethod, amount, userId } = paymentData;
    
    // 开启事务
    const transaction = await sequelize.transaction();
    
    try {
      // 1. 验证订单
      const order = await Order.findByPk(orderId, {
        include: [{ model: User, as: 'user' }],
        transaction
      });
      
      if (!order) {
        throw new Error('订单不存在');
      }
      
      if (order.userId !== userId) {
        throw new Error('无权操作此订单');
      }
      
      if (order.status === 'completed') {
        throw new Error('订单已完成，无需重复支付');
      }
      
      if (order.status === 'cancelled') {
        throw new Error('订单已取消，无法支付');
      }
      
      // 2. 验证支付金额
      if (Math.abs(order.totalAmount - amount) > 0.01) {
        throw new Error('支付金额与订单金额不匹配');
      }
      
      // 3. 验证支付方式
      const validPaymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        throw new Error('不支持的支付方式');
      }
      
      // 4. 创建支付记录
      const payment = await Payment.create({
        orderId,
        userId,
        amount,
        paymentMethod,
        status: 'pending',
        transactionDate: new Date()
      }, { transaction });
      
      // 5. 模拟支付处理（实际项目中这里会调用第三方支付API）
      const paymentResult = await this.simulatePaymentProcessing(payment, paymentMethod);
      
      if (paymentResult.success) {
        // 6. 更新支付状态
        await payment.update({
          status: 'completed',
          transactionId: paymentResult.transactionId,
          processedAt: new Date()
        }, { transaction });
        
        // 7. 更新订单状态
        await order.update({
          status: 'completed',
          paymentStatus: 'paid',
          paidAt: new Date()
        }, { transaction });
        
        // 8. 提交事务
        await transaction.commit();
        
        return {
          success: true,
          transactionId: paymentResult.transactionId,
          paymentId: payment.id,
          message: '支付成功',
          orderStatus: 'completed'
        };
      } else {
        // 支付失败，回滚事务
        await transaction.rollback();
        throw new Error(paymentResult.error || '支付处理失败');
      }
      
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 模拟支付处理（实际项目中会调用第三方支付API）
   * @param {Object} payment - 支付记录
   * @param {string} paymentMethod - 支付方式
   * @returns {Promise<Object>} 支付处理结果
   */
  static async simulatePaymentProcessing(payment, paymentMethod) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟支付成功率（90%）
    const successRate = 0.9;
    const random = Math.random();
    
    if (random < successRate) {
      // 支付成功
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      return {
        success: true,
        transactionId,
        message: '支付处理成功'
      };
    } else {
      // 支付失败
      const failureReasons = [
        '余额不足',
        '卡片已过期',
        '网络连接超时',
        '银行系统维护中',
        '支付限额超限'
      ];
      
      const randomReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      
      return {
        success: false,
        error: randomReason
      };
    }
  }
  
  /**
   * 获取支付历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 支付历史
   */
  static async getPaymentHistory(userId, options = {}) {
    const { page = 1, limit = 10, status, paymentMethod } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { userId };
    if (status) whereClause.status = status;
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;
    
    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'totalAmount', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      payments: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }
  
  /**
   * 获取支付统计
   * @param {string} userId - 用户ID
   * @param {string} period - 统计周期 (daily, weekly, monthly, yearly)
   * @returns {Promise<Object>} 支付统计
   */
  static async getPaymentStats(userId, period = 'monthly') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const stats = await Payment.findAll({
      where: {
        userId,
        status: 'completed',
        createdAt: {
          [sequelize.Op.gte]: startDate
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalPayments'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
      ]
    });
    
    const result = stats[0];
    
    return {
      period,
      totalAmount: parseFloat(result.dataValues.totalAmount || 0),
      totalPayments: parseInt(result.dataValues.totalPayments || 0),
      averageAmount: parseFloat(result.dataValues.averageAmount || 0),
      startDate,
      endDate: now
    };
  }
  
  /**
   * 退款处理
   * @param {string} paymentId - 支付ID
   * @param {string} userId - 用户ID
   * @param {string} reason - 退款原因
   * @returns {Promise<Object>} 退款结果
   */
  static async processRefund(paymentId, userId, reason) {
    const transaction = await sequelize.transaction();
    
    try {
      // 查找支付记录
      const payment = await Payment.findByPk(paymentId, {
        include: [{ model: Order, as: 'order' }],
        transaction
      });
      
      if (!payment) {
        throw new Error('支付记录不存在');
      }
      
      if (payment.userId !== userId) {
        throw new Error('无权操作此支付记录');
      }
      
      if (payment.status !== 'completed') {
        throw new Error('只有已完成的支付才能申请退款');
      }
      
      // 更新支付状态为退款中
      await payment.update({
        status: 'refunding',
        refundReason: reason,
        refundRequestedAt: new Date()
      }, { transaction });
      
      // 更新订单状态
      await payment.order.update({
        status: 'refunding',
        paymentStatus: 'refunding'
      }, { transaction });
      
      // 模拟退款处理
      const refundResult = await this.simulateRefundProcessing(payment);
      
      if (refundResult.success) {
        // 退款成功
        await payment.update({
          status: 'refunded',
          refundedAt: new Date(),
          refundTransactionId: refundResult.refundTransactionId
        }, { transaction });
        
        await payment.order.update({
          status: 'refunded',
          paymentStatus: 'refunded'
        }, { transaction });
        
        await transaction.commit();
        
        return {
          success: true,
          refundTransactionId: refundResult.refundTransactionId,
          message: '退款成功'
        };
      } else {
        // 退款失败
        await transaction.rollback();
        throw new Error(refundResult.error || '退款处理失败');
      }
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 模拟退款处理
   * @param {Object} payment - 支付记录
   * @returns {Promise<Object>} 退款处理结果
   */
  static async simulateRefundProcessing(payment) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟退款成功率（95%）
    const successRate = 0.95;
    const random = Math.random();
    
    if (random < successRate) {
      const refundTransactionId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      return {
        success: true,
        refundTransactionId,
        message: '退款处理成功'
      };
    } else {
      return {
        success: false,
        error: '银行系统繁忙，请稍后重试'
      };
    }
  }
}

module.exports = PaymentService;
