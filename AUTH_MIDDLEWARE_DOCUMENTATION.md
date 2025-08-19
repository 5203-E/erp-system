# 认证中间件文档

## 概述

本模块提供了完整的用户认证和权限控制中间件，包括 JWT 令牌验证、管理员权限检查等功能。

## 功能特性

- ✅ JWT 令牌验证
- ✅ 管理员权限检查
- ✅ 员工权限检查
- ✅ 用户状态验证
- ✅ 完整的错误处理
- ✅ 灵活的权限控制

## 安装依赖

```bash
npm install jsonwebtoken
```

## 中间件函数

### 1. `authenticateToken`

验证 JWT 令牌并获取用户ID。

**功能：**
- 从 `Authorization` 头中提取 Bearer 令牌
- 验证 JWT 令牌的有效性
- 将用户ID添加到 `req.userId`

**使用方式：**
```javascript
const { authenticateToken } = require('./middleware/auth');

// 保护需要登录的路由
router.get('/protected', authenticateToken, (req, res) => {
  // req.userId 包含当前用户的ID
  res.json({ message: '受保护的路由', userId: req.userId });
});
```

### 2. `checkAdmin`

检查用户是否为管理员。

**功能：**
- 验证 JWT 令牌
- 查询数据库获取用户信息
- 检查用户是否激活
- 验证用户角色是否为 `admin`
- 将用户信息添加到 `req.user`

**使用方式：**
```javascript
const { checkAdmin } = require('./middleware/auth');

// 只有管理员可以访问的路由
router.delete('/users/:id', checkAdmin, (req, res) => {
  // req.user 包含当前管理员用户的完整信息
  res.json({ 
    message: '用户删除成功', 
    deletedBy: req.user.name 
  });
});
```

### 3. `checkEmployeeOrAdmin`

检查用户是否为员工或管理员。

**功能：**
- 验证 JWT 令牌
- 查询数据库获取用户信息
- 检查用户是否激活
- 验证用户角色是否为 `employee` 或 `admin`
- 将用户信息添加到 `req.user`

**使用方式：**
```javascript
const { checkEmployeeOrAdmin } = require('./middleware/auth');

// 员工和管理员都可以访问的路由
router.get('/orders', checkEmployeeOrAdmin, (req, res) => {
  res.json({ 
    message: '订单列表', 
    requestedBy: req.user.name 
  });
});
```

### 4. `generateToken`

生成 JWT 令牌的辅助函数。

**功能：**
- 根据用户ID生成 JWT 令牌
- 设置令牌过期时间（默认24小时）

**使用方式：**
```javascript
const { generateToken } = require('./middleware/auth');

// 在登录成功后生成令牌
const token = generateToken(user.id);
res.json({ 
  success: true, 
  token,
  user: { id: user.id, name: user.name, role: user.role }
});
```

## 请求头格式

客户端需要在请求头中包含 JWT 令牌：

```
Authorization: Bearer <your-jwt-token>
```

## 错误响应

### 401 Unauthorized

**令牌缺失：**
```json
{
  "success": false,
  "message": "访问令牌缺失",
  "error": "MISSING_TOKEN"
}
```

**无效令牌：**
```json
{
  "success": false,
  "message": "无效的访问令牌",
  "error": "INVALID_TOKEN"
}
```

**令牌过期：**
```json
{
  "success": false,
  "message": "访问令牌已过期",
  "error": "TOKEN_EXPIRED"
}
```

### 403 Forbidden

**权限不足：**
```json
{
  "success": false,
  "message": "权限不足，需要管理员权限",
  "error": "INSUFFICIENT_PERMISSIONS",
  "requiredRole": "admin",
  "currentRole": "employee"
}
```

**用户被禁用：**
```json
{
  "success": false,
  "message": "用户账户已被禁用",
  "error": "USER_DISABLED"
}
```

### 404 Not Found

**用户不存在：**
```json
{
  "success": false,
  "message": "用户不存在",
  "error": "USER_NOT_FOUND"
}
```

### 500 Internal Server Error

**权限验证失败：**
```json
{
  "success": false,
  "message": "权限验证失败",
  "error": "PERMISSION_VERIFICATION_FAILED"
}
```

## 环境变量配置

在 `.env` 文件中配置 JWT 密钥：

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

## 使用示例

### 完整的路由配置

```javascript
const express = require('express');
const { checkAdmin, checkEmployeeOrAdmin } = require('./middleware/auth');

const router = express.Router();

// 公开路由 - 无需认证
router.get('/public', (req, res) => {
  res.json({ message: '公开信息' });
});

// 需要登录的路由
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: '用户资料', userId: req.userId });
});

// 员工和管理员都可以访问
router.get('/orders', checkEmployeeOrAdmin, (req, res) => {
  res.json({ message: '订单列表' });
});

// 只有管理员可以访问
router.post('/users', checkAdmin, (req, res) => {
  res.json({ message: '创建用户成功' });
});

router.delete('/users/:id', checkAdmin, (req, res) => {
  res.json({ message: '删除用户成功' });
});

module.exports = router;
```

### 在 Express 应用中使用

```javascript
const express = require('express');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 路由
app.use('/api/admin', adminRoutes);

// 错误处理
app.use(errorHandler);
```

## 安全注意事项

1. **JWT 密钥安全**：使用强随机密钥，不要硬编码
2. **令牌过期**：设置合理的过期时间，建议不超过24小时
3. **HTTPS**：在生产环境中使用 HTTPS 传输令牌
4. **令牌存储**：客户端安全存储令牌，避免 XSS 攻击
5. **权限最小化**：只给用户必要的权限

## 测试

运行测试文件验证中间件功能：

```bash
node test-auth-middleware.js
```

## 故障排除

### 常见问题

1. **"require is not defined"**：确保使用 CommonJS 语法
2. **"User is not defined"**：检查模型导入路径
3. **"JWT_SECRET is undefined"**：检查环境变量配置
4. **令牌验证失败**：检查令牌格式和密钥

### 调试技巧

1. 检查控制台错误日志
2. 验证 JWT 令牌格式
3. 确认数据库连接正常
4. 检查用户角色和状态

## 更新日志

- **v1.0.0**：初始版本，包含基本的认证和权限检查功能
- 支持 JWT 令牌验证
- 支持管理员和员工权限控制
- 完整的错误处理和响应
