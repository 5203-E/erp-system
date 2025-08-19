const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Mock orders endpoint
app.get('/api/orders', (req, res) => {
  const mockOrders = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      orderNumber: 'ORD-20231221-001',
      totalAmount: '999.99',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      user: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: '张三',
        email: 'zhangsan@example.com'
      },
      orderItems: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          quantity: 2,
          unitPrice: '499.99',
          totalPrice: '999.98',
          product: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: '笔记本电脑',
            sku: 'LAP001'
          }
        }
      ]
    }
  ];

  res.json({
    success: true,
    data: {
      orders: mockOrders,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      }
    }
  });
});

// Mock order detail endpoint
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  const mockOrder = {
    id: id,
    orderNumber: 'ORD-20231221-001',
    totalAmount: '999.99',
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '北京市朝阳区某某街道123号',
    notes: '请尽快发货',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: '张三',
      email: 'zhangsan@example.com'
    },
    orderItems: [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        quantity: 2,
        unitPrice: '499.99',
        totalPrice: '999.98',
        product: {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: '笔记本电脑',
          sku: 'LAP001'
        }
      }
    ]
  };

  res.json({
    success: true,
    data: mockOrder
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ERP System simple server running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: http://localhost:3000`);
});
