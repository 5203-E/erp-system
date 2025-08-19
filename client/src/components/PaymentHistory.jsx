import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: ''
  });

  useEffect(() => {
    fetchPaymentHistory();
  }, [filters]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/api/payments/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data.success) {
        setPayments(response.data.data.payments);
      } else {
        setError('获取支付历史失败');
      }
    } catch (err) {
      console.error('获取支付历史失败:', err);
      setError(err.response?.data?.error || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', paymentMethod: '' });
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { label: '待处理', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      processing: { label: '处理中', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 border-green-200' },
      failed: { label: '失败', className: 'bg-red-100 text-red-800 border-red-200' },
      cancelled: { label: '已取消', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      refunding: { label: '退款中', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      refunded: { label: '已退款', className: 'bg-purple-100 text-purple-800 border-purple-200' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const PaymentMethodBadge = ({ method }) => {
    const methodConfig = {
      credit_card: { label: '信用卡', icon: '💳', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      debit_card: { label: '借记卡', icon: '🏦', className: 'bg-green-100 text-green-800 border-green-200' },
      bank_transfer: { label: '银行转账', icon: '💸', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      digital_wallet: { label: '数字钱包', icon: '📱', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      cash: { label: '现金', icon: '💰', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };

    const config = methodConfig[method] || methodConfig.credit_card;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && payments.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">获取支付历史失败</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchPaymentHistory}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* 筛选栏 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              状态:
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
              <option value="cancelled">已取消</option>
              <option value="refunding">退款中</option>
              <option value="refunded">已退款</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="method-filter" className="text-sm font-medium text-gray-700">
              支付方式:
            </label>
            <select
              id="method-filter"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">全部方式</option>
              <option value="credit_card">信用卡</option>
              <option value="debit_card">借记卡</option>
              <option value="bank_transfer">银行转账</option>
              <option value="digital_wallet">数字钱包</option>
              <option value="cash">现金</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            清除筛选
          </button>

          <button
            onClick={fetchPaymentHistory}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                交易信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                支付金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                支付方式
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-semibold">{payment.transactionId}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.transactionDate).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <Link
                      to={`/orders/${payment.orderId}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      {payment.order?.orderNumber || '未知订单'}
                    </Link>
                    <span className="text-xs text-gray-500">
                      订单金额: ¥{payment.order?.totalAmount || '0.00'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-semibold text-green-600">
                    ¥{parseFloat(payment.amount).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentMethodBadge method={payment.paymentMethod} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      to={`/payments/${payment.id}`}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      查看详情
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {!loading && payments.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无支付记录</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(f => f) ? '没有找到匹配的支付记录' : '还没有任何支付记录'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
