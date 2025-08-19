import React from 'react';
import OrderTable from '../components/OrderTable';

const OrdersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">订单管理</h1>
              <p className="mt-2 text-sm text-gray-600">
                查看和管理所有订单信息
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-blue-900">总订单数</div>
                <div className="text-2xl font-bold text-blue-600">-</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-green-900">已完成</div>
                <div className="text-2xl font-bold text-green-600">-</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-yellow-900">处理中</div>
                <div className="text-2xl font-bold text-yellow-600">-</div>
              </div>
            </div>
          </div>
        </div>

        {/* 订单表格 */}
        <OrderTable />
      </div>
    </div>
  );
};

export default OrdersPage;
