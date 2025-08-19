const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'ERP System API is running!',
    status: 'success',
    timestamp: new Date().toISOString()
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ERP System test server running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});
