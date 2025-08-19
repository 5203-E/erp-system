const express = require('express');
const { applySecurityMiddleware } = require('./middleware/security.js');

// 设置测试环境
process.env.NODE_ENV = 'test';

const app = express();

// 基础中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 应用安全中间件
applySecurityMiddleware(app);

// 测试路由
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 启动服务器
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 简化测试服务器运行在端口 ${PORT}`);
  console.log('✅ 服务器启动成功！');
  console.log('🔗 测试URL: http://localhost:5001/test');
  console.log('🔗 健康检查: http://localhost:5001/health');
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('🚨 未捕获的异常:', error.message);
  console.error('堆栈:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 未处理的Promise拒绝:', reason);
  process.exit(1);
});
