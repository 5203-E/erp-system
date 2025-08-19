import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取订单详情
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/orders/${id}`);
      
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('获取订单详情失败');
      }
    } catch (err) {
      console.error('获取订单详情失败:', err);
      setError(err.response?.data?.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // 状态徽章组件
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        label: '待处理',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      processing: {
        label: '处理中',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      completed: {
        label: '已完成',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        label: '已取消',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // 支付状态徽章
  const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        label: '待支付',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      paid: {
        label: '已支付',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      failed: {
        label: '支付失败',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">获取订单详情失败</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchOrderDetail}
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">订单不存在</h3>
        <p className="mt-2 text-sm text-gray-500">找不到指定的订单信息</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
            <p className="mt-1 text-sm text-gray-500">
              订单号: {order.orderNumber}
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            返回列表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 订单基本信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">订单状态</dt>
                <dd className="mt-1">
                  <StatusBadge status={order.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">支付状态</dt>
                <dd className="mt-1">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">总金额</dt>
                <dd className="mt-1 text-lg font-semibold text-green-600">
                  ¥{parseFloat(order.totalAmount).toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </dd>
              </div>
            </div>
          </div>

          {/* 客户信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">客户信息</h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">客户姓名</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.user?.name || '未知'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.user?.email || '未知'}</dd>
              </div>
              {order.shippingAddress && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">收货地址</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.shippingAddress}</dd>
                </div>
              )}
            </div>
          </div>

          {/* 订单明细 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单明细</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.product?.name || '未知产品'}</h3>
                    <p className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">数量: {item.quantity}</p>
                    <p className="text-sm text-gray-500">单价: ¥{parseFloat(item.unitPrice).toFixed(2)}</p>
                    <p className="text-sm font-medium text-green-600">小计: ¥{parseFloat(item.totalPrice).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 备注信息 */}
          {order.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">备注信息</h2>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 订单摘要 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单摘要</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">订单ID</span>
                <span className="text-sm font-medium text-gray-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">订单号</span>
                <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">商品数量</span>
                <span className="text-sm font-medium text-gray-900">{order.orderItems?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">更新时间</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(order.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">操作</h2>
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                打印订单
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回列表
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
