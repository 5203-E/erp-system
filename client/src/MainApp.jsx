import React, { useState } from 'react';
import ERPApp from './ERPApp';
import FrontendPriorityManager from './components/FrontendPriorityManager';
import FrontendKanban from './components/FrontendKanban';
import FrontendProgressReport from './components/FrontendPriorityManager';

const MainApp = () => {
  const [activeApp, setActiveApp] = useState('erp'); // 'erp' 或 'dev'

  if (activeApp === 'erp') {
    return (
      <div>
        {/* 应用切换器 */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <button
              onClick={() => setActiveApp('dev')}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              🛠️ 开发工具
            </button>
          </div>
        </div>
        
        <ERPApp />
      </div>
    );
  }

  // 开发管理工具
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 应用切换器 */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <button
            onClick={() => setActiveApp('erp')}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            🏢 ERP系统
          </button>
        </div>
      </div>

      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  🚀 ERP系统前端开发管理
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                基于 React + Tailwind CSS 构建
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 标签导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveApp('erp')}
              className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              🏢 ERP系统
            </button>
            <button
              className="py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
            >
              优先级管理
            </button>
            <button
              className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              看板视图
            </button>
            <button
              className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              进度报告
            </button>
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="py-6">
        <FrontendPriorityManager />
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>ERP系统前端开发管理工具</p>
            <p className="mt-1">
              使用现代化的React组件和Tailwind CSS样式构建
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;
