const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController.js');
const { validateOrderInput } = require('../middleware/validation.js');

const router = express.Router();

// 创建新订单
router.post('/', validateOrderInput, createOrder);

// 获取所有订单
router.get('/', getOrders);

// 根据ID获取订单
router.get('/:id', getOrderById);

// 更新订单状态
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
