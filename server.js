const express = require('express');
const { testConnection } = require('./config/database');

// 导入路由
const orderRoutes = require('./routes/orders.js');

// 导入中间件
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.js');
const { applySecurityMiddleware } = require('./middleware/security.js');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 基础中间件（必须在安全中间件之前）
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 应用安全中间件
applySecurityMiddleware(app);

// Test database connection
testConnection();

// API 路由
app.use('/api/orders', orderRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'ERP System API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      orders: '/api/orders',
      health: '/health'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ERP System API',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ERP System server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});

module.exports = app;
