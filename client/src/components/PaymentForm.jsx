import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PaymentForm = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    orderId: orderId || '',
    paymentMethod: 'credit_card',
    amount: '',
    notes: ''
  });
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 获取订单详情
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // 获取支付方式
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setOrderDetails(response.data.data);
        setFormData(prev => ({
          ...prev,
          amount: response.data.data.totalAmount
        }));
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      setError('获取订单详情失败');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/api/payments/methods');
      if (response.data.success) {
        setPaymentMethods(response.data.data);
      }
    } catch (error) {
      console.error('获取支付方式失败:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/payments/process', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('支付处理失败:', error);
      setError(error.response?.data?.error || '支付处理失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h2>
          <p className="text-gray-600 mb-4">您的订单已成功支付，正在跳转到订单详情页面...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">订单支付</h1>
          <p className="mt-2 text-sm text-gray-600">
            请选择支付方式并完成支付
          </p>
        </div>

        {/* 订单信息卡片 */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">订单信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">订单编号</dt>
                <dd className="text-sm text-gray-900">{orderDetails.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">订单金额</dt>
                <dd className="text-sm text-gray-900">¥{orderDetails.totalAmount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">订单状态</dt>
                <dd className="text-sm text-gray-900">{orderDetails.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </div>
          </div>
        )}

        {/* 支付表单 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* 支付方式选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择支付方式
              </label>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleInputChange}
                      disabled={!method.enabled}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {method.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </div>
                    </div>
                    {formData.paymentMethod === method.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 支付金额 */}
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                支付金额
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">¥</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  required
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* 支付备注 */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                支付备注（可选）
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请输入支付备注信息..."
              />
              <div className="mt-1 text-sm text-gray-500">
                {formData.notes.length}/500
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">支付失败</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/orders/${orderId}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </>
                ) : (
                  '确认支付'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 支付安全提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">支付安全提示</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>请确保在安全的网络环境下进行支付</li>
                  <li>不要向他人泄露您的支付信息</li>
                  <li>支付完成后请及时退出登录</li>
                  <li>如遇问题请联系客服：400-123-4567</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
