import axios from 'axios';

// 配置axios默认设置
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并重定向到登录页
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.status - 订单状态筛选
 * @param {string} params.user_id - 用户ID筛选
 * @returns {Promise<Object>} 订单数据和分页信息
 */
export const fetchOrders = async (params = {}) => {
  try {
    const response = await api.get('/api/orders', { params });
    return response.data;
  } catch (error) {
    console.error('获取订单失败:', error);
    throw error;
  }
};

/**
 * 获取单个订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 订单详情
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    throw error;
  }
};

/**
 * 创建新订单
 * @param {Object} orderData - 订单数据
 * @param {string} orderData.user_id - 用户ID
 * @param {Array} orderData.products - 产品数组
 * @returns {Promise<Object>} 创建的订单信息
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('创建订单失败:', error);
    throw error;
  }
};

/**
 * 更新订单状态
 * @param {string} orderId - 订单ID
 * @param {Object} updateData - 更新数据
 * @param {string} updateData.status - 新状态
 * @param {string} updateData.payment_status - 支付状态
 * @returns {Promise<Object>} 更新后的订单信息
 */
export const updateOrderStatus = async (orderId, updateData) => {
  try {
    const response = await api.patch(`/api/orders/${orderId}/status`, updateData);
    return response.data;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
};

/**
 * 删除订单
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('删除订单失败:', error);
    throw error;
  }
};

/**
 * 获取订单统计信息
 * @returns {Promise<Object>} 订单统计数据
 */
export const fetchOrderStats = async () => {
  try {
    const response = await api.get('/api/orders/stats');
    return response.data;
  } catch (error) {
    console.error('获取订单统计失败:', error);
    throw error;
  }
};

export default api;
