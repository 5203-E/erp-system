# ERP系统订单API文档

## 🎯 概述

本文档描述了ERP系统的订单管理API，包括创建订单、查询订单、更新订单状态等功能。

## 🌐 基础信息

- **基础URL**: `http://localhost:5000`
- **API版本**: v1
- **数据格式**: JSON
- **认证方式**: 暂无（可根据需要添加JWT认证）

## 📋 API端点

### 1. 创建订单

**POST** `/api/orders`

创建新的订单记录。

#### 请求参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| user_id | string/number | ✅ | 用户ID |
| products | array | ✅ | 产品列表 |
| shipping_address | string | ❌ | 收货地址 |
| notes | string | ❌ | 订单备注 |

#### 产品对象结构

```json
{
  "product_id": "string/number",
  "quantity": "number"
}
```

#### 请求示例

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "products": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    },
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    }
  ],
  "shipping_address": "北京市朝阳区某某街道123号",
  "notes": "请尽快发货"
}
```

#### 响应示例

**成功响应 (201)**

```json
{
  "success": true,
  "message": "订单创建成功",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440003",
    "order_number": "ORD-1703123456789-abc123def",
    "total_amount": "2199.97",
    "status": "pending",
    "items_count": 2,
    "created_at": "2023-12-21T10:30:56.789Z"
  }
}
```

**错误响应 (400)**

```json
{
  "success": false,
  "message": "产品 笔记本电脑 库存不足。当前库存: 5, 需要: 10",
  "error": "INSUFFICIENT_STOCK",
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "笔记本电脑",
    "current_stock": 5,
    "requested_quantity": 10
  }
}
```

#### 业务逻辑

1. **验证用户存在**: 检查用户ID是否有效且账户激活
2. **检查库存**: 验证每个产品的库存是否充足
3. **计算金额**: 根据产品单价和数量计算总金额
4. **创建订单**: 在事务中创建订单和订单明细
5. **更新库存**: 减少相应产品的库存数量

### 2. 获取订单列表

**GET** `/api/orders`

获取订单列表，支持分页和筛选。

#### 查询参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| page | number | ❌ | 页码，默认1 |
| limit | number | ❌ | 每页数量，默认10，最大100 |
| status | string | ❌ | 订单状态筛选 |
| user_id | string | ❌ | 用户ID筛选 |

#### 请求示例

```
GET /api/orders?page=1&limit=5&status=pending
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "orderNumber": "ORD-1703123456789-abc123def",
        "totalAmount": "2199.97",
        "status": "pending",
        "paymentStatus": "pending",
        "createdAt": "2023-12-21T10:30:56.789Z",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "张三",
          "email": "zhangsan@example.com"
        },
        "orderItems": [
          {
            "id": "550e8400-e29b-41d4-a716-446655440004",
            "quantity": 2,
            "unitPrice": "999.99",
            "totalPrice": "1999.98",
            "product": {
              "id": "550e8400-e29b-41d4-a716-446655440001",
              "name": "笔记本电脑",
              "sku": "LAP001"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "pages": 5
    }
  }
}
```

### 3. 获取订单详情

**GET** `/api/orders/:id`

根据订单ID获取订单详细信息。

#### 路径参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 订单ID |

#### 请求示例

```
GET /api/orders/550e8400-e29b-41d4-a716-446655440003
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "orderNumber": "ORD-1703123456789-abc123def",
    "totalAmount": "2199.97",
    "status": "pending",
    "paymentStatus": "pending",
    "shippingAddress": "北京市朝阳区某某街道123号",
    "notes": "请尽快发货",
    "createdAt": "2023-12-21T10:30:56.789Z",
    "updatedAt": "2023-12-21T10:30:56.789Z",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "张三",
      "email": "zhangsan@example.com"
    },
    "orderItems": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "quantity": 2,
        "unitPrice": "999.99",
        "totalPrice": "1999.98",
        "product": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "笔记本电脑",
          "sku": "LAP001",
          "price": "999.99"
        }
      }
    ]
  }
}
```

### 4. 更新订单状态

**PATCH** `/api/orders/:id/status`

更新订单状态和支付状态。

#### 路径参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 订单ID |

#### 请求体

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| status | string | ❌ | 订单状态 |
| payment_status | string | ❌ | 支付状态 |

#### 状态值说明

**订单状态 (status)**
- `pending`: 待处理
- `processing`: 处理中
- `completed`: 已完成
- `cancelled`: 已取消

**支付状态 (payment_status)**
- `pending`: 待支付
- `paid`: 已支付
- `failed`: 支付失败

#### 状态转换规则

| 当前状态 | 允许转换到 |
|----------|------------|
| pending | processing, cancelled |
| processing | completed, cancelled |
| completed | 无 |
| cancelled | 无 |

#### 请求示例

```json
{
  "status": "processing",
  "payment_status": "paid"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "订单状态更新成功",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440003",
    "status": "processing",
    "payment_status": "paid",
    "updated_at": "2023-12-21T11:00:00.000Z"
  }
}
```

## 🔒 错误处理

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": "错误代码",
  "details": "详细错误信息（可选）"
}
```

### 常见错误代码

| HTTP状态码 | 错误代码 | 说明 |
|------------|----------|------|
| 400 | VALIDATION_ERROR | 输入数据验证失败 |
| 400 | MISSING_USER_ID | 缺少用户ID |
| 400 | MISSING_OR_EMPTY_PRODUCTS | 缺少或空的产品列表 |
| 400 | INSUFFICIENT_STOCK | 库存不足 |
| 400 | INVALID_STATUS_TRANSITION | 无效的状态转换 |
| 404 | USER_NOT_FOUND | 用户不存在 |
| 404 | ORDER_NOT_FOUND | 订单不存在 |
| 404 | PRODUCTS_NOT_FOUND | 产品不存在 |
| 409 | DUPLICATE_ORDER_NUMBER | 订单号重复 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |

## 📝 使用示例

### 使用cURL创建订单

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "products": [
      {
        "product_id": "550e8400-e29b-41d4-a716-446655440001",
        "quantity": 2
      }
    ],
    "shipping_address": "北京市朝阳区某某街道123号"
  }'
```

### 使用JavaScript创建订单

```javascript
const createOrder = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        products: [
          {
            product_id: '550e8400-e29b-41d4-a716-446655440001',
            quantity: 2
          }
        ],
        shipping_address: '北京市朝阳区某某街道123号'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('订单创建成功:', result.data);
    } else {
      console.error('订单创建失败:', result.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};
```

## 🧪 测试

### 运行测试

```bash
# 启动服务器
npm run dev

# 在另一个终端运行测试
node test-api.js
```

### 测试数据

测试前请确保数据库中有以下数据：
- 用户记录（ID: 550e8400-e29b-41d4-a716-446655440000）
- 产品记录（ID: 550e8400-e29b-41d4-a716-446655440001, 550e8400-e29b-41d4-a716-446655440002）

## 🔧 开发说明

### 技术栈

- **后端框架**: Express.js
- **ORM**: Sequelize
- **数据库**: PostgreSQL
- **事务管理**: Sequelize Transactions
- **错误处理**: 自定义错误处理中间件
- **数据验证**: 自定义验证中间件

### 文件结构

```
erp-system/
├── routes/
│   └── orders.js              # 订单路由
├── controllers/
│   └── orderController.js     # 订单控制器
├── middleware/
│   ├── validation.js          # 输入验证
│   └── errorHandler.js        # 错误处理
├── models/                    # 数据模型
├── database/                  # 数据库配置
├── server.js                  # 主服务器文件
├── test-api.js               # API测试文件
└── API_DOCUMENTATION.md      # API文档
```

### 扩展建议

1. **添加认证**: 集成JWT或Session认证
2. **权限控制**: 基于角色的访问控制
3. **日志记录**: 添加操作日志和审计功能
4. **缓存**: 集成Redis缓存热门数据
5. **限流**: 添加API调用频率限制
6. **监控**: 集成性能监控和告警
