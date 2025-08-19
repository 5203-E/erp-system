import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import OrdersPage from './pages/OrdersPage';
import OrderDetail from './components/OrderDetail';
import PaymentPage from './pages/PaymentPage';

// 导航组件
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '仪表板', icon: '📊' },
    { path: '/orders', label: '订单管理', icon: '📋' },
    { path: '/payments', label: '支付管理', icon: '💳' },
    { path: '/products', label: '产品管理', icon: '📦' },
    { path: '/inventory', label: '库存管理', icon: '🏪' },
    { path: '/users', label: '用户管理', icon: '👥' },
    { path: '/reports', label: '报表', icon: '📈' },
    { path: '/settings', label: '设置', icon: '⚙️' }
  ];

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">
                🏢 ERP企业资源管理系统
              </h1>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// 仪表板组件
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">系统仪表板</h1>
          <p className="mt-2 text-sm text-gray-600">
            欢迎使用ERP企业资源管理系统
          </p>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总订单数</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">产品总数</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">用户总数</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总收入</dt>
                    <dd className="text-lg font-medium text-gray-900">¥0.00</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 快速操作 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              快速操作
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/orders"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">创建订单</p>
                  <p className="text-sm text-gray-500">添加新的客户订单</p>
                </div>
              </Link>
              
              <Link
                to="/products"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">添加产品</p>
                  <p className="text-sm text-gray-500">管理产品目录</p>
                </div>
              </Link>
              
              <Link
                to="/users"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">用户管理</p>
                  <p className="text-sm text-gray-500">管理系统用户</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 占位组件
const PlaceholderPage = ({ title, description, icon }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-6xl mb-4 block">{icon}</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            返回仪表板
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// 主ERP应用组件
const ERPApp = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/payments" element={<PaymentPage />} />
          <Route 
            path="/products" 
            element={<PlaceholderPage 
              title="产品管理" 
              description="产品管理功能正在开发中..." 
              icon="📦" 
            />} 
          />
          <Route 
            path="/inventory" 
            element={<PlaceholderPage 
              title="库存管理" 
              description="库存管理功能正在开发中..." 
              icon="🏪" 
            />} 
          />
          <Route 
            path="/users" 
            element={<PlaceholderPage 
              title="用户管理" 
              description="用户管理功能正在开发中..." 
              icon="👥" 
            />} 
          />
          <Route 
            path="/reports" 
            element={<PlaceholderPage 
              title="报表系统" 
              description="报表系统功能正在开发中..." 
              icon="📈" 
            />} 
          />
          <Route 
            path="/settings" 
            element={<PlaceholderPage 
              title="系统设置" 
              description="系统设置功能正在开发中..." 
              icon="⚙️" 
            />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default ERPApp;
