# ERP 系统 CI/CD 流水线配置

## 概述

本项目配置了 GitHub Actions CI/CD 流水线，用于自动化测试、构建和代码质量检查。

## 配置文件

### 1. 完整版 CI 配置 (`.github/workflows/ci.yml`)

包含完整的测试环境，包括：
- PostgreSQL 数据库服务
- 数据库迁移
- 完整的后端测试
- 前端测试
- 生产构建
- 测试覆盖率上传

### 2. 简化版 CI 配置 (`.github/workflows/ci-simple.yml`)

适用于快速验证，包含：
- 单元测试
- 前端测试
- 构建验证
- 代码质量检查

## 使用方法

### 本地测试

```bash
# 后端测试
npm run test

# 前端测试
cd client
npm run test

# 代码质量检查
npm run code-quality
```

### CI 脚本

```bash
# 安装依赖
npm run ci:setup

# 运行测试
npm run ci:test

# 构建项目
npm run ci:build
```

## 测试配置

### 后端测试 (Jest)
- 配置文件：`jest.config.js`
- 测试目录：`tests/`
- 覆盖率报告：`coverage/`

### 前端测试 (Vitest)
- 配置文件：`client/vitest.config.js`
- 测试目录：`client/src/components/__tests__/`
- 测试环境：jsdom

## 环境变量

CI 环境中的测试环境变量：
```bash
NODE_ENV=test
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=erp_test
JWT_SECRET=test_jwt_secret_key_for_ci_pipeline
JWT_REFRESH_SECRET=test_refresh_secret_for_ci_pipeline
```

## 触发条件

- `push`：推送到任何分支
- `pull_request`：创建或更新 Pull Request

## 工作流程

1. **代码检出**：从 GitHub 仓库检出代码
2. **环境设置**：配置 Node.js 和依赖
3. **依赖安装**：安装后端和前端依赖
4. **数据库准备**：启动 PostgreSQL 服务（完整版）
5. **测试执行**：运行后端和前端测试
6. **构建验证**：验证生产构建
7. **质量检查**：运行 ESLint 和 Prettier 检查
8. **覆盖率上传**：上传测试覆盖率报告（完整版）

## 故障排除

### 常见问题

1. **测试失败**：检查测试环境配置和依赖
2. **构建失败**：验证构建脚本和依赖
3. **数据库连接失败**：检查 PostgreSQL 服务状态

### 本地调试

```bash
# 运行特定测试
npm run test:orders

# 查看测试覆盖率
npm run test:coverage

# 前端测试 UI 模式
cd client
npm run test:ui
```

## 自定义配置

### 添加新的测试脚本

在 `package.json` 的 `scripts` 部分添加：

```json
{
  "scripts": {
    "test:custom": "jest --testPathPattern=custom.test.js"
  }
}
```

### 修改测试环境

编辑 `jest.config.js` 或 `vitest.config.js` 文件。

## 最佳实践

1. **测试覆盖**：确保新功能有相应的测试
2. **代码质量**：在提交前运行 `npm run code-quality`
3. **依赖管理**：使用 `npm ci` 而不是 `npm install`
4. **环境隔离**：测试环境使用独立的数据库和配置

## 联系信息

如有问题，请检查：
1. GitHub Actions 日志
2. 本地测试结果
3. 项目配置文件
