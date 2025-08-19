// 验证订单输入数据
const validateOrderInput = (req, res, next) => {
  const { user_id, products, shipping_address, notes } = req.body;
  
  // 验证必需字段
  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: '用户ID是必需的',
      error: 'MISSING_USER_ID'
    });
  }
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: '产品列表是必需的且不能为空',
      error: 'MISSING_OR_EMPTY_PRODUCTS'
    });
  }
  
  // 验证用户ID格式
  if (typeof user_id !== 'string' && typeof user_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: '用户ID必须是有效的字符串或数字',
      error: 'INVALID_USER_ID_FORMAT'
    });
  }
  
  // 验证产品列表
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    if (!product.product_id) {
      return res.status(400).json({
        success: false,
        message: `产品列表第${i + 1}项缺少product_id`,
        error: 'MISSING_PRODUCT_ID',
        index: i
      });
    }
    
    if (!product.quantity || typeof product.quantity !== 'number' || product.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `产品列表第${i + 1}项的quantity必须是大于0的数字`,
        error: 'INVALID_QUANTITY',
        index: i
      });
    }
    
    // 验证数量是否为整数
    if (!Number.isInteger(product.quantity)) {
      return res.status(400).json({
        success: false,
        message: `产品列表第${i + 1}项的quantity必须是整数`,
        error: 'QUANTITY_MUST_BE_INTEGER',
        index: i
      });
    }
    
    // 验证产品ID格式
    if (typeof product.product_id !== 'string' && typeof product.product_id !== 'number') {
      return res.status(400).json({
        success: false,
        message: `产品列表第${i + 1}项的product_id格式无效`,
        error: 'INVALID_PRODUCT_ID_FORMAT',
        index: i
      });
    }
  }
  
  // 验证可选字段
  if (shipping_address && typeof shipping_address !== 'string') {
    return res.status(400).json({
      success: false,
      message: '收货地址必须是字符串',
      error: 'INVALID_SHIPPING_ADDRESS_FORMAT'
    });
  }
  
  if (notes && typeof notes !== 'string') {
    return res.status(400).json({
      success: false,
      message: '订单备注必须是字符串',
      error: 'INVALID_NOTES_FORMAT'
    });
  }
  
  // 验证产品列表长度限制
  if (products.length > 100) {
    return res.status(400).json({
      success: false,
      message: '单次订单最多支持100种产品',
      error: 'TOO_MANY_PRODUCTS'
    });
  }
  
  // 验证单个产品数量限制
  for (let i = 0; i < products.length; i++) {
    if (products[i].quantity > 10000) {
      return res.status(400).json({
        success: false,
        message: `产品列表第${i + 1}项的数量超过限制(最大10000)`,
        error: 'QUANTITY_TOO_LARGE',
        index: i
      });
    }
  }
  
  // 检查是否有重复的产品ID
  const productIds = products.map(p => p.product_id);
  const uniqueProductIds = new Set(productIds);
  
  if (productIds.length !== uniqueProductIds.size) {
    return res.status(400).json({
      success: false,
      message: '订单中不能包含重复的产品',
      error: 'DUPLICATE_PRODUCTS'
    });
  }
  
  next();
};

// 验证订单状态更新
const validateOrderStatusUpdate = (req, res, next) => {
  const { status, payment_status } = req.body;
  
  if (!status && !payment_status) {
    return res.status(400).json({
      success: false,
      message: '至少需要提供status或payment_status中的一个',
      error: 'MISSING_UPDATE_FIELDS'
    });
  }
  
  // 验证状态值
  if (status) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的订单状态',
        error: 'INVALID_STATUS',
        valid_statuses: validStatuses
      });
    }
  }
  
  // 验证支付状态值
  if (payment_status) {
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: '无效的支付状态',
        error: 'INVALID_PAYMENT_STATUS',
        valid_payment_statuses: validPaymentStatuses
      });
    }
  }
  
  next();
};

// 验证分页参数
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: '页码必须是大于0的数字',
      error: 'INVALID_PAGE'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: '每页数量必须是1-100之间的数字',
      error: 'INVALID_LIMIT'
    });
  }
  
  next();
};

module.exports = {
  validateOrderInput,
  validateOrderStatusUpdate,
  validatePagination
};
