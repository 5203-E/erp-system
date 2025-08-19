# 🔒 ERP系统安全配置指南

## 📋 概述

本指南详细介绍了ERP系统的安全配置，包括安全中间件、配置管理和最佳实践。

## 🏗️ 安全架构

### 1. 安全中间件层

```
客户端请求 → 安全中间件 → 业务逻辑 → 响应
                ↓
         [速率限制、输入验证、安全头部等]
```

### 2. 核心安全组件

- **`config/security.js`** - 安全配置管理
- **`middleware/security.js`** - 安全中间件实现
- **环境变量** - 敏感配置存储

## 🔧 安全中间件详解

### 速率限制 (Rate Limiting)

```javascript
// 全局速率限制
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 最多100次请求
});

// 严格速率限制（敏感操作）
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5 // 最多5次请求
});

// 登录速率限制
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3 // 最多3次登录尝试
});
```

**特性：**
- 基于IP和用户ID的键生成
- 跳过健康检查路由
- 自定义错误响应
- 重试时间头

### 安全头部 (Security Headers)

```javascript
// 自动设置的安全头部
X-Frame-Options: deny                    // 防止点击劫持
X-Content-Type-Options: nosniff         // 防止MIME类型嗅探
X-XSS-Protection: 1; mode=block        // XSS保护
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

**HSTS (HTTP Strict Transport Security):**
- 生产环境自动启用
- 包含子域名
- 预加载支持

### 输入验证 (Input Validation)

#### 请求体大小限制
```javascript
// 最大10MB
const maxSize = 10 * 1024 * 1024;
```

#### Content-Type验证
```javascript
// 只允许application/json
if (!contentType.includes('application/json')) {
  return res.status(400).json({
    error: 'INVALID_CONTENT_TYPE'
  });
}
```

### SQL注入防护

**检测模式：**
- SQL关键字检测
- 联合查询检测
- 条件语句检测
- 聚合函数检测

**示例：**
```javascript
// 检测到的恶意输入
q: "'; DROP TABLE users; --"
// 响应: 400 Bad Request
```

### XSS防护

**检测模式：**
- `<script>` 标签
- `javascript:` 协议
- 事件处理器 (`onclick`, `onload` 等)
- 危险HTML元素

**示例：**
```javascript
// 检测到的恶意输入
script: '<script>alert("xss")</script>'
// 响应: 400 Bad Request
```

## ⚙️ 配置管理

### 环境变量配置

```bash
# 数据库配置
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=your_secure_password_here
DB_NAME=erp_db
DB_PORT=5432

# JWT配置
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_chars
JWT_EXPIRES_IN=24h

# 安全配置
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS配置
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# 日志配置
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

### 配置验证

```javascript
// 自动验证配置安全性
const validateSecurityConfig = () => {
  // JWT密钥强度检查
  if (securityConfig.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET 必须至少32个字符');
  }
  
  // 密码策略检查
  if (securityConfig.password.bcryptRounds < 10) {
    throw new Error('BCRYPT_ROUNDS 必须至少为10');
  }
  
  // 生产环境检查
  if (securityConfig.environment.isProduction) {
    if (securityConfig.cors.origin === 'http://localhost:3000') {
      throw new Error('生产环境必须设置正确的CORS_ORIGIN');
    }
  }
};
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install express-rate-limit helmet
```

### 2. 应用安全中间件

```javascript
const { applySecurityMiddleware } = require('./middleware/security');

// 在Express应用中应用所有安全中间件
applySecurityMiddleware(app);
```

### 3. 运行安全测试

```bash
node test-security.js
```

## 📊 安全测试

### 测试覆盖范围

1. **正常请求测试** - 验证基本功能
2. **安全头部测试** - 验证安全头部设置
3. **CORS测试** - 验证跨域配置
4. **输入验证测试** - 验证请求验证
5. **SQL注入防护测试** - 验证注入防护
6. **XSS防护测试** - 验证XSS防护
7. **速率限制测试** - 验证限流功能
8. **健康检查测试** - 验证特殊路由处理

### 运行测试

```bash
# 运行安全测试
node test-security.js

# 运行Jest测试套件
npm test

# 运行特定测试
npm run test:orders
```

## 🛡️ 安全最佳实践

### 1. 密码安全

```javascript
// 使用强密码策略
const passwordConfig = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// 使用bcrypt加密
const bcryptRounds = 12; // 至少10轮
```

### 2. JWT安全

```javascript
// 使用强密钥
const jwtSecret = '至少32位随机字符串';

// 设置合理的过期时间
const jwtExpiresIn = '24h';
const refreshExpiresIn = '7d';
```

### 3. 数据库安全

```javascript
// 连接池配置
const poolConfig = {
  min: 2,
  max: 10,
  acquire: 30000,
  idle: 10000
};

// 事务隔离级别
const isolationLevel = 'READ_COMMITTED';
```

### 4. 日志安全

```javascript
// 敏感信息脱敏
const redactFields = ['password', 'token', 'secret', 'key'];

// 生产环境不暴露错误详情
if (isProduction) {
  return res.status(500).json({
    message: '服务器内部错误'
  });
}
```

## 🔍 监控和调试

### 1. 请求日志

```javascript
// 启用请求日志
ENABLE_REQUEST_LOGGING=true

// 日志格式
📥 GET /api/orders - 127.0.0.1 - 2024-01-01T00:00:00.000Z
📤 GET /api/orders - 200 - 45ms - INFO
```

### 2. 错误监控

```javascript
// 错误详情记录
console.error('🚨 错误详情:', {
  message: err.message,
  stack: err.stack,
  url: req.url,
  method: req.method,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### 3. 健康检查

```javascript
// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ERP System API',
    timestamp: new Date().toISOString()
  });
});
```

## 🚨 安全事件响应

### 1. 检测到攻击

```javascript
// 自动阻止恶意请求
if (sqlInjectionDetected || xssDetected) {
  return res.status(400).json({
    success: false,
    message: '检测到潜在的安全威胁',
    error: 'SECURITY_THREAT_DETECTED'
  });
}
```

### 2. 速率限制触发

```javascript
// 返回429状态码
res.status(429).json({
  success: false,
  message: '请求过于频繁，请稍后再试',
  error: 'RATE_LIMIT_EXCEEDED',
  retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
});
```

### 3. 错误处理

```javascript
// 生产环境错误处理
if (securityConfig.isProduction()) {
  return res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: 'INTERNAL_SERVER_ERROR'
  });
}
```

## 📚 相关文档

- [Express.js 安全最佳实践](https://expressjs.com/en/advanced/best-practices-security.html)
- [OWASP 安全指南](https://owasp.org/www-project-top-ten/)
- [Helmet.js 文档](https://helmetjs.github.io/)
- [Express Rate Limit 文档](https://github.com/nfriedly/express-rate-limit)

## 🤝 贡献

如果您发现安全漏洞或有改进建议，请：

1. 不要公开披露
2. 联系安全团队
3. 提交安全报告

---

**记住：安全是一个持续的过程，需要定期审查和更新！** 🔒
