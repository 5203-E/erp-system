# Orders API 测试指南

## 🎯 测试概述

本测试套件为Orders API端点提供了全面的测试覆盖，包括：

- ✅ **成功创建订单** - 验证正常业务流程
- ❌ **库存不足错误** - 验证业务规则和错误处理
- ❌ **未授权访问** - 通过验证中间件测试访问控制
- ✅ **数据完整性** - 验证事务处理和数据库一致性
- ✅ **边界条件** - 测试极限情况和约束验证

## 🚀 快速开始

### 1. 安装测试依赖

```bash
npm install
```

### 2. 运行测试

```bash
# 运行所有测试
npm test

# 运行Orders API测试
npm run test:orders

# 生成覆盖率报告
npm run test:coverage

# 监听模式（文件变化时自动运行）
npm run test:watch
```

### 3. 使用Windows批处理工具

```bash
# 双击运行
run-tests.bat
```

## 📁 测试文件结构

```
tests/
├── setup.js              # Jest测试设置
├── factories.js          # 测试数据工厂
├── orders.test.js        # Orders API测试套件
└── __mocks__/            # 模拟文件（如果需要）

jest.config.js            # Jest配置文件
```

## 🧪 测试套件详解

### POST /api/orders - 创建订单

#### 成功场景测试
- ✅ **正常情况** - 验证订单创建成功，响应结构正确
- ✅ **多个产品** - 验证多产品订单的总金额计算
- ✅ **最小必需字段** - 验证只提供必需字段时的成功情况

#### 错误场景测试
- ❌ **库存不足** - 单个产品和多个产品的库存不足情况
- ❌ **用户不存在** - 引用不存在的用户ID
- ❌ **用户账户被禁用** - 验证用户状态检查
- ❌ **产品不存在** - 引用不存在的产品ID
- ❌ **产品被禁用** - 验证产品状态检查

#### 验证错误测试
- ❌ **缺少用户ID** - 验证必需字段检查
- ❌ **缺少产品列表** - 验证产品列表验证
- ❌ **产品数量为0** - 验证数量范围检查
- ❌ **产品数量为负数** - 验证数量有效性
- ❌ **产品数量不是整数** - 验证数量类型检查
- ❌ **重复产品ID** - 验证产品唯一性
- ❌ **产品数量超过限制** - 验证数量上限
- ❌ **产品种类过多** - 验证产品种类限制
- ❌ **无效字段格式** - 验证数据类型检查

### GET /api/orders - 获取订单列表

#### 成功场景测试
- ✅ **默认分页** - 验证分页参数和响应结构
- ✅ **自定义分页** - 验证自定义分页参数
- ✅ **按状态过滤** - 验证状态过滤功能
- ✅ **按用户过滤** - 验证用户过滤功能
- ✅ **关联数据** - 验证包含用户和订单项信息

#### 验证错误测试
- ❌ **无效页码** - 验证页码验证
- ❌ **无效每页数量** - 验证数量限制检查

### GET /api/orders/:id - 获取订单详情

#### 成功场景测试
- ✅ **订单详情** - 验证订单信息完整性

#### 错误场景测试
- ❌ **订单不存在** - 验证404错误处理
- ❌ **无效ID格式** - 验证ID格式验证

### PATCH /api/orders/:id/status - 更新订单状态

#### 成功场景测试
- ✅ **更新状态** - 验证状态更新成功
- ✅ **更新支付状态** - 验证支付状态更新
- ✅ **同时更新** - 验证状态和支付状态同时更新

#### 错误场景测试
- ❌ **订单不存在** - 验证404错误处理
- ❌ **无效状态转换** - 验证状态转换规则
- ❌ **缺少更新字段** - 验证字段验证
- ❌ **无效状态值** - 验证状态值验证
- ❌ **无效支付状态值** - 验证支付状态值验证

## 🔧 测试数据工厂

### 主要函数

```javascript
// 创建测试用户
const user = await createTestUser({
  name: '测试用户',
  email: 'test@example.com',
  role: 'employee'
});

// 创建测试产品
const product = await createTestProduct({
  name: '测试产品',
  price: 99.99,
  stockQuantity: 100
});

// 创建完整测试订单
const { user, product, order, orderItem } = await createCompleteTestOrder();

// 创建多个测试产品
const products = await createMultipleTestProducts(5);

// 清理测试数据
await cleanupTestData();
```

### 数据覆盖

- **用户角色**: admin, employee
- **用户状态**: active, inactive
- **产品状态**: active, inactive
- **订单状态**: pending, processing, completed, cancelled
- **支付状态**: pending, paid, failed
- **库存数量**: 各种边界值（0, 1, 1000, 10000, 10001）

## 📊 测试覆盖率

### 目标覆盖率
- **语句覆盖率**: 80%+
- **分支覆盖率**: 80%+
- **函数覆盖率**: 80%+
- **行覆盖率**: 80%+

### 覆盖率报告
运行 `npm run test:coverage` 后，查看 `coverage/lcov-report/index.html` 获取详细报告。

## 🚨 测试注意事项

### 1. 数据库设置
- 测试使用独立的测试数据库
- 每个测试后自动清理数据
- 使用事务确保数据一致性

### 2. 异步测试
- 所有测试都是异步的
- 使用 `async/await` 处理异步操作
- 设置适当的超时时间（30秒）

### 3. 测试隔离
- 每个测试独立运行
- 测试间不共享状态
- 使用 `beforeEach` 和 `afterEach` 清理数据

### 4. 错误处理
- 验证错误响应的状态码
- 检查错误消息和错误代码
- 测试边界条件和异常情况

## 🔍 调试测试

### 1. 启用详细日志
```javascript
// 在测试中启用详细日志
console.log('测试数据:', testData);
console.log('响应:', response.body);
```

### 2. 单步调试
```bash
# 运行单个测试
npm test -- --testNamePattern="成功创建订单"

# 运行特定测试套件
npm test -- --testPathPattern="orders.test.js"
```

### 3. 查看测试输出
```bash
# 详细输出
npm test -- --verbose

# 显示测试位置
npm test -- --testLocationInResults
```

## 📈 性能测试

### 1. 测试执行时间
- 单个测试: < 1秒
- 完整套件: < 30秒
- 包含覆盖率: < 60秒

### 2. 内存使用
- 测试期间内存使用稳定
- 无内存泄漏
- 自动清理资源

## 🛠️ 扩展测试

### 1. 添加新测试
```javascript
test('✅ 新功能测试', async () => {
  // 测试代码
  const response = await request(app)
    .post('/api/orders')
    .send(testData)
    .expect(201);
  
  expect(response.body.success).toBe(true);
});
```

### 2. 添加新的测试数据工厂
```javascript
// 在 factories.js 中添加
const createTestOrderWithSpecialCase = async (overrides = {}) => {
  // 工厂逻辑
  return await Order.create({ ...defaultData, ...overrides });
};
```

### 3. 添加新的测试套件
```javascript
describe('新功能测试套件', () => {
  test('测试用例1', async () => {
    // 测试逻辑
  });
  
  test('测试用例2', async () => {
    // 测试逻辑
  });
});
```

## 📋 测试检查清单

### 部署前检查
- [ ] 所有测试通过
- [ ] 覆盖率达标（80%+）
- [ ] 测试执行时间合理
- [ ] 无测试警告或错误

### 代码变更后检查
- [ ] 运行相关测试
- [ ] 验证新功能测试
- [ ] 检查测试覆盖率变化
- [ ] 确保测试稳定性

## 🎉 最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 包含预期结果
- 使用emoji标识测试类型

### 2. 测试结构
- 使用 `describe` 组织相关测试
- 使用 `beforeEach` 和 `afterEach` 设置和清理
- 保持测试独立和可重复

### 3. 断言
- 验证响应状态码
- 检查响应结构
- 验证业务逻辑
- 测试边界条件

### 4. 数据管理
- 使用工厂函数创建测试数据
- 避免硬编码测试数据
- 及时清理测试数据

---

**总结：通过全面的测试覆盖，确保Orders API的可靠性、稳定性和正确性！** 🎯
