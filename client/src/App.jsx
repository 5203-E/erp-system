import React, { useState } from 'react';
import FrontendPriorityManager from './components/FrontendPriorityManager';
import FrontendKanban from './components/FrontendKanban';
import FrontendProgressReport from './components/FrontendProgressReport';

const App = () => {
  const [activeTab, setActiveTab] = useState('priority');

  const tabs = [
    { id: 'priority', name: '优先级管理', component: FrontendPriorityManager },
    { id: 'kanban', name: '看板视图', component: FrontendKanban },
    { id: 'report', name: '进度报告', component: FrontendProgressReport }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
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
            {tabs.map(tab => (
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
      </div>

      {/* 主要内容 */}
      <main className="py-6">
        {ActiveComponent && <ActiveComponent />}
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

export default App;
