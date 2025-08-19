const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');
const authMiddleware = require('../middleware/auth');
const { validatePaymentData, validateRefundData } = require('../middleware/validation');

/**
 * @route   POST /api/payments/process
 * @desc    处理支付
 * @access  Private
 */
router.post('/process', authMiddleware, validatePaymentData, async (req, res) => {
  try {
    const { orderId, paymentMethod, amount, notes } = req.body;
    
    // 处理支付
    const paymentResult = await PaymentService.processPayment({
      orderId,
      paymentMethod,
      amount,
      userId: req.user.id,
      notes
    });

    res.status(200).json({
      success: true,
      data: paymentResult,
      message: '支付处理成功'
    });
  } catch (error) {
    console.error('支付处理错误:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || '支付处理失败'
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    获取支付历史
 * @access  Private
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod } = req.query;
    
    const paymentHistory = await PaymentService.getPaymentHistory(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      paymentMethod
    });

    res.status(200).json({
      success: true,
      data: paymentHistory
    });
  } catch (error) {
    console.error('获取支付历史错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取支付历史失败'
    });
  }
});

/**
 * @route   GET /api/payments/stats
 * @desc    获取支付统计
 * @access  Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    const stats = await PaymentService.getPaymentStats(req.user.id, period);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取支付统计错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取支付统计失败'
    });
  }
});

/**
 * @route   POST /api/payments/:paymentId/refund
 * @desc    申请退款
 * @access  Private
 */
router.post('/:paymentId/refund', authMiddleware, validateRefundData, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    const refundResult = await PaymentService.processRefund(
      paymentId,
      req.user.id,
      reason
    );

    res.status(200).json({
      success: true,
      data: refundResult,
      message: '退款申请成功'
    });
  } catch (error) {
    console.error('退款处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '退款处理失败'
    });
  }
});

/**
 * @route   GET /api/payments/:paymentId
 * @desc    获取支付详情
 * @access  Private
 */
router.get('/:paymentId', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // 这里需要实现获取支付详情的逻辑
    // 暂时返回占位响应
    res.status(200).json({
      success: true,
      data: {
        id: paymentId,
        message: '支付详情功能正在开发中'
      }
    });
  } catch (error) {
    console.error('获取支付详情错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取支付详情失败'
    });
  }
});

/**
 * @route   GET /api/payments/order/:orderId
 * @desc    获取订单的支付记录
 * @access  Private
 */
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 这里需要实现获取订单支付记录的逻辑
    // 暂时返回占位响应
    res.status(200).json({
      success: true,
      data: {
        orderId,
        message: '订单支付记录功能正在开发中'
      }
    });
  } catch (error) {
    console.error('获取订单支付记录错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取订单支付记录失败'
    });
  }
});

/**
 * @route   POST /api/payments/:paymentId/retry
 * @desc    重试失败的支付
 * @access  Private
 */
router.post('/:paymentId/retry', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // 这里需要实现重试支付的逻辑
    // 暂时返回占位响应
    res.status(200).json({
      success: true,
      data: {
        paymentId,
        message: '重试支付功能正在开发中'
      }
    });
  } catch (error) {
    console.error('重试支付错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '重试支付失败'
    });
  }
});

/**
 * @route   GET /api/payments/methods
 * @desc    获取支持的支付方式
 * @access  Public
 */
router.get('/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'credit_card',
      name: '信用卡',
      description: '支持Visa、MasterCard、American Express等',
      icon: '💳',
      enabled: true
    },
    {
      id: 'debit_card',
      name: '借记卡',
      description: '支持各大银行发行的借记卡',
      icon: '🏦',
      enabled: true
    },
    {
      id: 'bank_transfer',
      name: '银行转账',
      description: '支持网银转账和手机银行转账',
      icon: '💸',
      enabled: true
    },
    {
      id: 'digital_wallet',
      name: '数字钱包',
      description: '支持支付宝、微信支付、Apple Pay等',
      icon: '📱',
      enabled: true
    },
    {
      id: 'cash',
      name: '现金支付',
      description: '仅支持线下门店支付',
      icon: '💰',
      enabled: false
    }
  ];

  res.status(200).json({
    success: true,
    data: paymentMethods
  });
});

/**
 * @route   GET /api/payments/statuses
 * @desc    获取支付状态说明
 * @access  Public
 */
router.get('/statuses', (req, res) => {
  const paymentStatuses = [
    {
      id: 'pending',
      name: '待处理',
      description: '支付请求已提交，等待处理',
      color: '#fbbf24'
    },
    {
      id: 'processing',
      name: '处理中',
      description: '支付正在处理中，请稍候',
      color: '#3b82f6'
    },
    {
      id: 'completed',
      name: '已完成',
      description: '支付成功完成',
      color: '#10b981'
    },
    {
      id: 'failed',
      name: '失败',
      description: '支付处理失败',
      color: '#ef4444'
    },
    {
      id: 'cancelled',
      name: '已取消',
      description: '支付已被取消',
      color: '#6b7280'
    },
    {
      id: 'refunding',
      name: '退款中',
      description: '退款申请正在处理中',
      color: '#f59e0b'
    },
    {
      id: 'refunded',
      name: '已退款',
      description: '退款已完成',
      color: '#8b5cf6'
    }
  ];

  res.status(200).json({
    success: true,
    data: paymentStatuses
  });
});

module.exports = router;
