# ERP系统支付模块说明

## 概述

支付模块是ERP系统的重要组成部分，负责处理订单支付、退款、支付历史记录等核心功能。本模块采用模块化设计，包含完整的后端服务和前端界面。

## 系统架构

### 后端架构
```
services/
├── paymentService.js      # 支付业务逻辑服务
├── models/
│   └── Payment.js         # 支付数据模型
├── routes/
│   └── payment.js         # 支付API路由
└── middleware/
    └── paymentValidation.js # 支付数据验证
```

### 前端架构
```
components/
├── PaymentForm.jsx        # 支付表单组件
├── PaymentHistory.jsx     # 支付历史组件
└── pages/
    └── PaymentPage.jsx    # 支付管理页面
```

## 功能特性

### 🏦 支付处理
- **多种支付方式支持**
  - 信用卡 💳
  - 借记卡 🏦
  - 银行转账 💸
  - 数字钱包 📱
  - 现金 💰

- **支付流程**
  1. 订单验证
  2. 支付方式选择
  3. 金额验证
  4. 支付处理（模拟）
  5. 状态更新
  6. 订单状态同步

### 📊 支付管理
- **支付历史查询**
  - 按状态筛选
  - 按支付方式筛选
  - 分页显示
  - 实时刷新

- **支付统计**
  - 日/周/月/年统计
  - 支付成功率
  - 收入统计
  - 趋势分析

### 💰 退款系统
- **退款申请**
  - 退款原因填写
  - 退款状态跟踪
  - 退款处理流程

- **退款规则**
  - 30天内可退款
  - 现金支付不支持退款
  - 退款成功率95%

## API接口

### 支付处理
```http
POST /api/payments/process
Content-Type: application/json
Authorization: Bearer <token>

{
  "orderId": "uuid",
  "paymentMethod": "credit_card",
  "amount": 299.99,
  "notes": "支付备注"
}
```

### 支付历史
```http
GET /api/payments/history?page=1&limit=10&status=completed&paymentMethod=credit_card
Authorization: Bearer <token>
```

### 支付统计
```http
GET /api/payments/stats?period=monthly
Authorization: Bearer <token>
```

### 退款申请
```http
POST /api/payments/:paymentId/refund
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "商品质量问题，申请退款"
}
```

### 支付方式列表
```http
GET /api/payments/methods
```

### 支付状态说明
```http
GET /api/payments/statuses
```

## 数据模型

### Payment模型字段
```javascript
{
  id: UUID,                    // 支付ID
  orderId: UUID,              // 订单ID
  userId: UUID,               // 用户ID
  amount: DECIMAL(10,2),      // 支付金额
  paymentMethod: ENUM,        // 支付方式
  status: ENUM,               // 支付状态
  transactionId: STRING,      // 交易ID
  processedAt: DATE,          // 处理时间
  transactionDate: DATE,      // 交易日期
  refundReason: TEXT,         // 退款原因
  refundRequestedAt: DATE,    // 退款申请时间
  refundedAt: DATE,           // 退款完成时间
  refundTransactionId: STRING, // 退款交易ID
  notes: TEXT,                // 支付备注
  gatewayResponse: JSON,      // 网关响应
  errorMessage: TEXT,         // 错误信息
  retryCount: INTEGER,        // 重试次数
  lastRetryAt: DATE,          // 最后重试时间
  createdAt: DATE,            // 创建时间
  updatedAt: DATE             // 更新时间
}
```

### 支付状态枚举
- `pending` - 待处理
- `processing` - 处理中
- `completed` - 已完成
- `failed` - 失败
- `cancelled` - 已取消
- `refunding` - 退款中
- `refunded` - 已退款

### 支付方式枚举
- `credit_card` - 信用卡
- `debit_card` - 借记卡
- `bank_transfer` - 银行转账
- `digital_wallet` - 数字钱包
- `cash` - 现金

## 安全特性

### 🔐 认证授权
- JWT Token验证
- 用户权限检查
- 订单所有权验证

### 🛡️ 数据验证
- 输入数据验证
- 金额范围检查
- 支付方式验证
- UUID格式验证

### 💾 事务安全
- 数据库事务处理
- 支付失败回滚
- 数据一致性保证

### 📝 审计日志
- 支付操作记录
- 错误日志记录
- 安全事件追踪

## 前端组件

### PaymentForm组件
- **功能特性**
  - 支付方式选择
  - 金额输入验证
  - 支付备注
  - 实时状态反馈
  - 错误处理

- **用户体验**
  - 响应式设计
  - 加载状态指示
  - 成功反馈
  - 安全提示

### PaymentHistory组件
- **功能特性**
  - 支付记录列表
  - 状态筛选
  - 支付方式筛选
  - 分页显示
  - 操作按钮

- **数据展示**
  - 交易信息
  - 订单关联
  - 状态徽章
  - 时间显示

## 部署配置

### 环境变量
```env
# 支付配置
PAYMENT_GATEWAY_URL=https://api.payment.com
PAYMENT_API_KEY=your_api_key
PAYMENT_SECRET=your_secret

# 数据库配置
DB_HOST=localhost
DB_USER=erp_user
DB_PASSWORD=secure_password
DB_NAME=erp_db

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### 依赖安装
```bash
# 后端依赖
npm install express-validator
npm install sequelize
npm install pg

# 前端依赖
npm install axios
npm install react-router-dom
```

## 测试指南

### 单元测试
```bash
# 运行支付服务测试
npm test -- --testPathPattern=payment

# 运行支付路由测试
npm test -- --testPathPattern=payment.test.js
```

### 集成测试
```bash
# 测试支付流程
npm run test:integration:payment

# 测试退款流程
npm run test:integration:refund
```

### API测试
```bash
# 使用Postman或curl测试API
curl -X POST http://localhost:3000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"orderId":"uuid","paymentMethod":"credit_card","amount":100}'
```

## 监控和维护

### 性能监控
- 支付响应时间
- 成功率统计
- 错误率监控
- 数据库性能

### 日志分析
- 支付操作日志
- 错误日志分析
- 安全事件监控
- 用户行为分析

### 故障处理
- 支付失败重试
- 网络异常处理
- 数据库连接恢复
- 服务降级策略

## 扩展计划

### 🚀 近期计划
- [ ] 集成真实支付网关
- [ ] 添加支付通知功能
- [ ] 实现批量支付处理
- [ ] 添加支付报表功能

### 🔮 长期规划
- [ ] 多币种支持
- [ ] 跨境支付
- [ ] 移动支付集成
- [ ] 区块链支付支持

## 技术支持

### 文档资源
- API文档：`/api/docs`
- 开发指南：`/docs/development`
- 部署手册：`/docs/deployment`

### 联系方式
- 技术支持：support@erp.com
- 开发团队：dev@erp.com
- 紧急联系：+86-400-123-4567

### 问题反馈
- GitHub Issues：https://github.com/erp-system/issues
- 在线支持：https://support.erp.com
- 社区论坛：https://community.erp.com

---

**注意**：本支付系统目前使用模拟支付处理，生产环境需要集成真实的支付网关服务。
