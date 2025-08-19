# 代码质量配置说明

## 🎯 概述

本项目已配置 ESLint 和 Prettier 来保证代码质量和一致性。

## 📦 已安装的包

### ESLint 相关
- `eslint` - 主要的代码检查工具
- `eslint-config-prettier` - 禁用与 Prettier 冲突的 ESLint 规则
- `eslint-plugin-prettier` - 将 Prettier 作为 ESLint 规则运行
- `eslint-plugin-node` - Node.js 特定的 ESLint 规则

### Prettier 相关
- `prettier` - 代码格式化工具

## ⚙️ 配置文件

### ESLint 配置 (`eslint.config.js`)
- 使用新的 ESLint v9 配置格式
- 支持 JavaScript 和 React 代码
- 包含代码质量规则和最佳实践

### Prettier 配置 (`.prettierrc`)
- 单引号
- 2 空格缩进
- 80 字符行宽
- 自动换行符处理

### VS Code 配置 (`.vscode/settings.json`)
- 保存时自动格式化
- 保存时自动修复 ESLint 问题
- 集成 ESLint 和 Prettier

## 🚀 使用方法

### 命令行工具

```bash
# 检查代码质量
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check

# 运行完整的代码质量检查
npm run code-quality
```

### VS Code 集成

1. 安装推荐的扩展：
   - ESLint
   - Prettier - Code formatter

2. 功能特性：
   - 保存时自动格式化
   - 实时 ESLint 错误提示
   - 自动修复功能

## 📋 代码规范

### JavaScript/Node.js
- 使用 `const` 和 `let`，避免 `var`
- 使用单引号
- 使用分号
- 2 空格缩进
- 使用模板字符串
- 使用对象简写语法

### React (前端)
- 禁用 PropTypes 检查
- 遵循 React Hooks 规则
- 使用函数组件

### 错误处理
- 使用 Promise 拒绝错误
- 避免抛出字面量

## 🔧 自定义配置

### 添加新规则
在 `eslint.config.js` 中的 `rules` 部分添加新规则。

### 忽略文件
在 `eslint.config.js` 中的 `ignores` 数组添加要忽略的文件模式。

### 修改格式化规则
在 `.prettierrc` 中修改 Prettier 配置。

## 📝 最佳实践

1. **提交前检查**：在提交代码前运行 `npm run code-quality`
2. **IDE 集成**：使用 VS Code 的自动格式化功能
3. **团队协作**：确保所有团队成员都安装了必要的扩展
4. **持续集成**：在 CI/CD 流程中包含代码质量检查

## 🐛 常见问题

### ESLint 警告
- `no-console`: 生产环境应避免使用 console.log
- `no-unused-vars`: 未使用的变量，使用 `_` 前缀忽略

### 格式化问题
- 换行符问题：Prettier 会自动处理
- 缩进问题：确保使用 2 空格

## 📚 相关链接

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [ESLint v9 迁移指南](https://eslint.org/docs/latest/use/configure/migration-guide)
