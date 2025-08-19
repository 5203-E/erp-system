const express = require('express');
const { checkAdmin, checkEmployeeOrAdmin } = require('../middleware/auth');

const router = express.Router();

// 示例：只有管理员可以访问的路由
router.get('/admin-only', checkAdmin, (req, res) => {
  res.json({
    success: true,
    message: '欢迎管理员！',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// 示例：管理员可以删除用户
router.delete('/users/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 这里可以添加删除用户的逻辑
    // 由于已经通过了 checkAdmin 中间件，我们可以确保当前用户是管理员
    
    res.json({
      success: true,
      message: '用户删除成功',
      deletedUserId: id,
      deletedBy: req.user.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除用户失败',
      error: error.message
    });
  }
});

// 示例：管理员可以查看系统统计信息
router.get('/system-stats', checkAdmin, async (req, res) => {
  try {
    // 这里可以添加获取系统统计信息的逻辑
    
    res.json({
      success: true,
      message: '系统统计信息',
      stats: {
        totalUsers: 150,
        totalOrders: 1250,
        totalRevenue: 50000,
        activeUsers: 120
      },
      requestedBy: req.user.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取系统统计信息失败',
      error: error.message
    });
  }
});

// 示例：员工或管理员都可以访问的路由
router.get('/employee-access', checkEmployeeOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: '员工或管理员都可以访问',
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

module.exports = router;
