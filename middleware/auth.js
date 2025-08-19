const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT 密钥（应该从环境变量获取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证 JWT 令牌并获取用户信息
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失',
        error: 'MISSING_TOKEN'
      });
    }

    // 验证 JWT 令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 将用户ID添加到请求对象中
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('JWT 验证错误:', error);
    return res.status(500).json({
      success: false,
      message: '令牌验证失败',
      error: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// 检查用户是否为管理员
const checkAdmin = async (req, res, next) => {
  try {
    // 首先验证 JWT 令牌
    await authenticateToken(req, res, async (err) => {
      if (err) return next(err);
      
      // 从数据库中查询用户信息
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
          error: 'USER_NOT_FOUND'
        });
      }

      // 检查用户是否激活
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: '用户账户已被禁用',
          error: 'USER_DISABLED'
        });
      }

      // 检查用户角色是否为管理员
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足，需要管理员权限',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRole: 'admin',
          currentRole: user.role
        });
      }

      // 将用户信息添加到请求对象中，供后续中间件使用
      req.user = user;
      
      next();
    });
  } catch (error) {
    console.error('管理员权限检查错误:', error);
    
    // Sequelize 错误处理
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: '数据库查询失败',
        error: 'DATABASE_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_VERIFICATION_FAILED'
    });
  }
};

// 检查用户是否为员工或管理员
const checkEmployeeOrAdmin = async (req, res, next) => {
  try {
    // 首先验证 JWT 令牌
    await authenticateToken(req, res, async (err) => {
      if (err) return next(err);
      
      // 从数据库中查询用户信息
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
          error: 'USER_NOT_FOUND'
        });
      }

      // 检查用户是否激活
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: '用户账户已被禁用',
          error: 'USER_DISABLED'
        });
      }

      // 检查用户角色是否为员工或管理员
      if (user.role !== 'employee' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足，需要员工或管理员权限',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: ['employee', 'admin'],
          currentRole: user.role
        });
      }

      // 将用户信息添加到请求对象中
      req.user = user;
      
      next();
    });
  } catch (error) {
    console.error('员工权限检查错误:', error);
    
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: '数据库查询失败',
        error: 'DATABASE_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_VERIFICATION_FAILED'
    });
  }
};

// 生成 JWT 令牌的辅助函数
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '24h' } // 令牌24小时后过期
  );
};

module.exports = {
  authenticateToken,
  checkAdmin,
  checkEmployeeOrAdmin,
  generateToken
};
