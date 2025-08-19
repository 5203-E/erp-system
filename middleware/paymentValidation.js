const { body, param, query, validationResult } = require('express-validator');

/**
 * 支付数据验证中间件
 */
const validatePaymentData = [
  body('orderId')
    .isUUID()
    .withMessage('订单ID必须是有效的UUID格式'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash'])
    .withMessage('支付方式必须是有效的选项'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('支付金额必须在0.01到999999.99之间'),
  
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('支付备注不能超过500个字符'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '支付数据验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 退款数据验证中间件
 */
const validateRefundData = [
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('退款原因必须在10到500个字符之间'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '退款数据验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 支付历史查询参数验证
 */
const validatePaymentHistoryQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1到100之间'),
  
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunding', 'refunded'])
    .withMessage('支付状态必须是有效的选项'),
  
  query('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash'])
    .withMessage('支付方式必须是有效的选项'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '查询参数验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 支付统计查询参数验证
 */
const validatePaymentStatsQuery = [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('统计周期必须是有效的选项'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '统计参数验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 支付ID参数验证
 */
const validatePaymentId = [
  param('paymentId')
    .isUUID()
    .withMessage('支付ID必须是有效的UUID格式'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '支付ID验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 订单ID参数验证
 */
const validateOrderId = [
  param('orderId')
    .isUUID()
    .withMessage('订单ID必须是有效的UUID格式'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '订单ID验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 支付金额验证中间件
 */
const validatePaymentAmount = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('支付金额必须在0.01到999999.99之间')
    .custom((value, { req }) => {
      // 这里可以添加额外的金额验证逻辑
      // 比如检查是否与订单金额匹配
      return true;
    }),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '支付金额验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 支付方式验证中间件
 */
const validatePaymentMethod = [
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cash'])
    .withMessage('支付方式必须是有效的选项')
    .custom((value, { req }) => {
      // 这里可以添加支付方式的额外验证逻辑
      // 比如检查用户是否有该支付方式的权限
      return true;
    }),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '支付方式验证失败',
        details: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validatePaymentData,
  validateRefundData,
  validatePaymentHistoryQuery,
  validatePaymentStatsQuery,
  validatePaymentId,
  validateOrderId,
  validatePaymentAmount,
  validatePaymentMethod
};
