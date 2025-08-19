import React, { useState } from 'react';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';

const PaymentPage = () => {
  const [activeTab, setActiveTab] = useState('history');

  const tabs = [
    { id: 'history', name: '支付历史', component: PaymentHistory },
    { id: 'form', name: '支付表单', component: PaymentForm }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">支付管理</h1>
              <p className="mt-2 text-sm text-gray-600">
                管理订单支付和查看支付历史
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-blue-900">总支付数</div>
                <div className="text-2xl font-bold text-blue-600">-</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-green-900">成功支付</div>
                <div className="text-2xl font-bold text-green-600">-</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-yellow-900">待处理</div>
                <div className="text-2xl font-bold text-yellow-600">-</div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 主要内容 */}
        <main>
          {ActiveComponent && <ActiveComponent />}
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;
