# ERP系统前端集成说明

## 概述

本系统现在包含两个主要的前端应用程序：

1. **ERP企业资源管理系统** - 核心业务功能
2. **前端开发管理工具** - 开发进度跟踪和管理

## 文件结构

```
client/src/
├── MainApp.jsx              # 主应用程序入口点
├── ERPApp.jsx               # ERP系统主应用
├── App.jsx                  # 开发管理工具（原版）
├── components/
│   ├── OrderTable.jsx       # 订单管理表格组件
│   ├── OrderDetail.jsx      # 订单详情组件
│   ├── FrontendPriorityManager.jsx  # 开发优先级管理
│   ├── FrontendKanban.jsx   # 开发看板
│   └── FrontendProgressReport.jsx   # 开发进度报告
├── pages/
│   └── OrdersPage.jsx       # 订单管理页面
├── api/
│   └── orderAPI.js          # 订单API模块
└── priorities.js            # 前端开发优先级配置
```

## 功能特性

### ERP系统功能
- 🏢 **仪表板** - 系统概览和快速操作
- 📋 **订单管理** - 完整的订单CRUD操作
- 📦 **产品管理** - 产品目录管理（开发中）
- 🏪 **库存管理** - 库存跟踪和预警（开发中）
- 👥 **用户管理** - 用户和权限管理（开发中）
- 📈 **报表系统** - 数据分析和报表（开发中）
- ⚙️ **系统设置** - 配置管理（开发中）

### 开发管理工具
- 🎯 **优先级管理** - 前端组件开发优先级
- 📋 **看板视图** - 任务状态可视化
- 📊 **进度报告** - 开发进度统计

## 快速开始

### 1. 启动前端应用

```bash
# Windows
start-frontend.bat

# 或手动启动
cd client
npm install
npm run dev
```

前端将在 `http://localhost:5173` 运行

### 2. 应用切换

在ERP系统中，右上角有一个"🛠️ 开发工具"按钮，点击可以切换到开发管理工具。

在开发管理工具中，右上角有一个"🏢 ERP系统"按钮，点击可以切换回ERP系统。

## 技术架构

### 核心技术
- **React 18** - 前端框架
- **React Router DOM** - 路由管理
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP客户端
- **Vite** - 构建工具

### 状态管理
- 使用 React Hooks (`useState`, `useEffect`)
- 组件级状态管理
- 路由状态管理

### API集成
- RESTful API调用
- 统一的错误处理
- 认证token管理
- 请求/响应拦截器

## 组件说明

### OrderTable.jsx
核心的订单管理表格组件，包含：

- 📊 数据分页
- 🔍 状态筛选
- 📱 响应式设计
- 🎨 状态徽章
- ⚡ 加载状态
- ❌ 错误处理
- 🔄 数据刷新

### OrdersPage.jsx
订单管理页面，包含：

- 📋 页面头部
- 📊 统计信息
- 🎯 快速操作
- 📋 订单表格

### ERPApp.jsx
ERP系统主应用，包含：

- 🧭 导航菜单
- 🏠 仪表板
- 🛣️ 路由配置
- 📱 响应式布局

## 开发指南

### 添加新页面
1. 在 `ERPApp.jsx` 中添加新路由
2. 创建对应的页面组件
3. 更新导航菜单

### 添加新API
1. 在 `api/` 目录下创建新的API模块
2. 使用统一的axios配置
3. 添加错误处理和类型定义

### 样式指南
- 使用 Tailwind CSS 类名
- 遵循响应式设计原则
- 保持一致的视觉风格

## 部署说明

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm run preview
```

### 环境变量
创建 `.env` 文件：
```env
REACT_APP_API_URL=http://localhost:3000
```

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查后端服务器是否运行
   - 验证API URL配置
   - 检查网络连接

2. **组件加载失败**
   - 检查依赖是否正确安装
   - 验证导入路径
   - 查看浏览器控制台错误

3. **样式问题**
   - 确保 Tailwind CSS 正确配置
   - 检查 PostCSS 配置
   - 验证类名拼写

### 调试技巧

- 使用浏览器开发者工具
- 检查网络请求
- 查看控制台日志
- 使用 React DevTools

## 下一步计划

- [ ] 实现产品管理功能
- [ ] 添加库存管理模块
- [ ] 完善用户权限系统
- [ ] 集成报表和图表
- [ ] 添加实时通知
- [ ] 实现数据导出功能

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 ISC 许可证。
