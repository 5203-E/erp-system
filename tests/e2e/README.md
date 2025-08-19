# 🧪 ERP系统端到端测试指南

## 📋 概述

本目录包含ERP系统的端到端(E2E)测试，使用Playwright框架进行自动化测试。这些测试覆盖了完整的业务流程，确保系统各个组件能够正确协同工作。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Playwright
npm install

# 安装Playwright浏览器
npm run test:e2e:install
```

### 2. 启动测试环境

```bash
# 启动后端服务器
npm run dev

# 启动前端服务器（新终端）
cd client && npm run dev
```

### 3. 运行测试

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行特定测试文件
npx playwright test orderWorkflow.spec.js

# 使用UI模式运行测试
npm run test:e2e:ui

# 使用浏览器模式运行测试
npm run test:e2e:headed

# 调试模式运行测试
npm run test:e2e:debug
```

## 📁 测试文件结构

```
tests/e2e/
├── README.md                 # 本文件
├── global-setup.js          # 全局测试设置
├── global-teardown.js       # 全局测试清理
├── orderWorkflow.spec.js    # 订单流程测试
├── paymentFlow.spec.js      # 支付流程测试
└── authentication.spec.js   # 用户认证测试
```

## 🧪 测试用例说明

### 订单流程测试 (`orderWorkflow.spec.js`)

**测试覆盖**:
- ✅ 完整订单流程（产品添加 → 订单创建 → 支付处理 → 状态更新 → 库存验证）
- ✅ 库存预警机制
- ✅ 业务流程完整性验证

**关键验证点**:
- 产品管理功能
- 订单创建和状态管理
- 支付集成
- 库存自动更新
- 系统通知机制

### 支付流程测试 (`paymentFlow.spec.js`)

**测试覆盖**:
- ✅ 信用卡支付流程
- ✅ 支付失败处理
- ✅ 退款申请和审批流程

**关键验证点**:
- 支付表单验证
- 支付网关集成
- 错误处理机制
- 退款工作流
- 交易状态管理

### 用户认证测试 (`authentication.spec.js`)

**测试覆盖**:
- ✅ 管理员和员工登录
- ✅ 权限验证
- ✅ 用户注册
- ✅ 密码重置
- ✅ 登出功能

**关键验证点**:
- 角色权限控制
- 安全认证机制
- 用户会话管理
- 错误处理

## ⚙️ 配置说明

### Playwright配置 (`playwright.config.js`)

- **测试目录**: `./tests/e2e`
- **基础URL**: `http://localhost:3000`
- **浏览器支持**: Chrome, Firefox, Safari, 移动端
- **并行执行**: 支持并行测试
- **自动重试**: CI环境下自动重试失败测试
- **截图和视频**: 失败时自动记录

### 环境变量

```bash
# 测试环境
NODE_ENV=test

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASSWORD=test_pass
DB_NAME=erp_test

# 测试用户凭据
TEST_ADMIN_EMAIL=admin@erp.com
TEST_ADMIN_PASSWORD=AdminPass123!
TEST_EMPLOYEE_EMAIL=employee@erp.com
TEST_EMPLOYEE_PASSWORD=EmployeePass123!
```

## 🔧 测试数据管理

### 测试前准备

1. **数据库初始化**: 运行 `npm run db:init`
2. **测试用户创建**: 确保测试账户存在
3. **测试产品数据**: 准备测试产品信息

### 测试后清理

1. **数据清理**: 自动清理测试创建的数据
2. **状态重置**: 恢复系统到测试前状态
3. **日志清理**: 清理测试产生的日志文件

## 📊 测试报告

### 生成报告

```bash
# 生成HTML报告
npx playwright show-report

# 生成JUnit报告（CI集成）
npm run test:e2e
# 报告位置: test-results/e2e-results.xml
```

### 报告内容

- **测试结果**: 通过/失败统计
- **执行时间**: 每个测试的执行时长
- **错误详情**: 失败测试的详细错误信息
- **截图和视频**: 失败测试的视觉记录
- **性能指标**: 页面加载和响应时间

## 🚨 故障排除

### 常见问题

1. **浏览器启动失败**
   ```bash
   npm run test:e2e:install
   ```

2. **测试超时**
   - 检查服务器是否正常运行
   - 增加 `timeout` 配置值

3. **元素定位失败**
   - 检查页面结构是否变化
   - 使用 `page.pause()` 进行调试

4. **数据库连接问题**
   - 确认数据库服务运行状态
   - 检查连接配置

### 调试技巧

```bash
# 使用调试模式
npm run test:e2e:debug

# 使用UI模式
npm run test:e2e:ui

# 在测试中添加断点
await page.pause();
```

## 📈 持续集成

### GitHub Actions集成

```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e:install
    npm run test:e2e
  env:
    NODE_ENV: test
    DB_HOST: localhost
    DB_PORT: 5432
```

### 测试覆盖率

- **目标覆盖率**: 80%+
- **关键流程**: 100%覆盖
- **边缘情况**: 重点覆盖

## 📚 最佳实践

1. **测试独立性**: 每个测试应该独立运行
2. **数据隔离**: 使用独立的测试数据库
3. **清理机制**: 测试后自动清理测试数据
4. **错误处理**: 优雅处理测试失败情况
5. **性能考虑**: 避免不必要的等待时间

## 🤝 贡献指南

### 添加新测试

1. 创建新的测试文件
2. 遵循命名规范
3. 添加适当的注释
4. 更新README文档

### 测试命名规范

- 文件名: `功能模块.spec.js`
- 测试描述: 清晰描述测试目的
- 变量命名: 使用有意义的名称

---

**注意**: 运行E2E测试前，请确保开发环境已正确配置，数据库服务正常运行。
