// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);
  
  // Sequelize 错误处理
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      error: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: '数据已存在',
      error: 'DUPLICATE_ENTRY',
      field: err.errors[0]?.path
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: '关联数据不存在',
      error: 'FOREIGN_KEY_VIOLATION',
      field: err.fields[0]
    });
  }
  
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: '数据库操作失败',
      error: 'DATABASE_ERROR'
    });
  }
  
  // 自定义业务错误
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.error || 'BUSINESS_ERROR'
    });
  }
  
  // 默认错误响应
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: 'INTERNAL_SERVER_ERROR'
  });
};

// 404 错误处理
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    error: 'NOT_FOUND',
    path: req.originalUrl
  });
};

// 异步错误包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
