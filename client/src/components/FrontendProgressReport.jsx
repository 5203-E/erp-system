import React, { useState, useEffect } from 'react';
import {
  FRONTEND_PRIORITIES,
  PRIORITY_LEVELS,
  COMPONENT_STATUS,
  calculateFrontendProgress,
  getTimeEstimates,
  getComponentsByPriority,
  getComponentsByStatus,
  getReadyComponents
} from '../priorities';

const FrontendProgressReport = () => {
  const [components] = useState(FRONTEND_PRIORITIES);
  const [selectedView, setSelectedView] = useState('overview');

  // 计算进度统计
  const progress = calculateFrontendProgress();
  const timeEstimates = getTimeEstimates();

  // 获取可开始开发的组件
  const readyComponents = getReadyComponents(['API/orders']);

  // 按优先级分组的组件
  const componentsByPriority = Object.keys(PRIORITY_LEVELS).reduce((acc, priority) => {
    acc[priority] = getComponentsByPriority(priority);
    return acc;
  }, {});

  // 按状态分组的组件
  const componentsByStatus = Object.keys(COMPONENT_STATUS).reduce((acc, status) => {
    acc[status] = getComponentsByStatus(status);
    return acc;
  }, {});

  // 生成进度图表数据
  const generateChartData = () => {
    const labels = Object.keys(COMPONENT_STATUS).map(status => COMPONENT_STATUS[status].label);
    const data = Object.keys(COMPONENT_STATUS).map(status => 
      componentsByStatus[status]?.length || 0
    );
    const colors = Object.keys(COMPONENT_STATUS).map(status => COMPONENT_STATUS[status].color);

    return { labels, data, colors };
  };

  // 生成优先级分布数据
  const generatePriorityData = () => {
    const labels = Object.keys(PRIORITY_LEVELS).map(priority => PRIORITY_LEVELS[priority].label);
    const data = Object.keys(PRIORITY_LEVELS).map(priority => 
      componentsByPriority[priority]?.length || 0
    );
    const colors = Object.keys(PRIORITY_LEVELS).map(priority => PRIORITY_LEVELS[priority].color);

    return { labels, data, colors };
  };

  // 渲染进度条
  const renderProgressBar = (percentage, color = 'bg-blue-600') => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  // 渲染饼图（简化版）
  const renderPieChart = (data, colors) => {
    const total = data.reduce((sum, value) => sum + value, 0);
    
    return (
      <div className="flex items-center justify-center space-x-4">
        {data.map((value, index) => {
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={index} className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2"
                style={{ backgroundColor: colors[index] }}
              ></div>
              <div className="text-sm font-medium">{data.labels[index]}</div>
              <div className="text-xs text-gray-500">{value} ({percentage}%)</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          前端开发进度报告
        </h1>
        
        {/* 视图切换 */}
        <div className="flex space-x-2 mb-6">
          {['overview', 'priority', 'status', 'ready'].map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedView === view
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {view === 'overview' && '概览'}
              {view === 'priority' && '优先级分布'}
              {view === 'status' && '状态分布'}
              {view === 'ready' && '可开始开发'}
            </button>
          ))}
        </div>
      </div>

      {/* 概览视图 */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* 关键指标 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">总体进度</div>
                  <div className="text-2xl font-bold text-gray-900">{progress.percentage}%</div>
                </div>
              </div>
              <div className="mt-4">
                {renderProgressBar(progress.percentage)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">已完成</div>
                  <div className="text-2xl font-bold text-gray-900">{progress.completed}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                共 {progress.total} 个组件
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">进行中</div>
                  <div className="text-2xl font-bold text-gray-900">{progress.inProgress}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                正在开发
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">受阻</div>
                  <div className="text-2xl font-bold text-gray-900">{progress.blocked}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                需要解决
              </div>
            </div>
          </div>

          {/* 时间估算 */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">时间估算</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">总工作量</div>
                <div className="text-2xl font-bold text-gray-900">{timeEstimates.total} 天</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">已完成</div>
                <div className="text-2xl font-bold text-green-600">{timeEstimates.completed} 天</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">剩余</div>
                <div className="text-2xl font-bold text-orange-600">{timeEstimates.remaining} 天</div>
              </div>
            </div>
            <div className="mt-4">
              {renderProgressBar(timeEstimates.percentage, 'bg-green-600')}
            </div>
          </div>

          {/* 状态分布图表 */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">组件状态分布</h3>
            {renderPieChart(generateChartData())}
          </div>
        </div>
      )}

      {/* 优先级分布视图 */}
      {selectedView === 'priority' && (
        <div className="space-y-6">
          {Object.keys(PRIORITY_LEVELS).map(priority => {
            const priorityComponents = componentsByPriority[priority];
            const completed = priorityComponents.filter(c => c.status === 'COMPLETED').length;
            const percentage = priorityComponents.length > 0 ? Math.round((completed / priorityComponents.length) * 100) : 0;

            return (
              <div key={priority} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {PRIORITY_LEVELS[priority].label} 优先级
                  </h3>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full text-white"
                    style={{ backgroundColor: PRIORITY_LEVELS[priority].color }}
                  >
                    {priorityComponents.length} 个组件
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {PRIORITY_LEVELS[priority].description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>进度: {completed}/{priorityComponents.length}</span>
                    <span>{percentage}%</span>
                  </div>
                  {renderProgressBar(percentage, `bg-[${PRIORITY_LEVELS[priority].color}]`)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {priorityComponents.map(component => (
                    <div key={component.component} className="border rounded-lg p-3">
                      <div className="font-medium text-sm text-gray-900">{component.component}</div>
                      <div className="text-xs text-gray-500 mt-1">{component.description}</div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full text-white`}
                          style={{ backgroundColor: COMPONENT_STATUS[component.status].color }}
                        >
                          {COMPONENT_STATUS[component.status].label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 状态分布视图 */}
      {selectedView === 'status' && (
        <div className="space-y-6">
          {Object.keys(COMPONENT_STATUS).map(status => {
            const statusComponents = componentsByStatus[status];
            if (!statusComponents || statusComponents.length === 0) return null;

            return (
              <div key={status} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {COMPONENT_STATUS[status].label}
                  </h3>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full text-white"
                    style={{ backgroundColor: COMPONENT_STATUS[status].color }}
                  >
                    {statusComponents.length} 个组件
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {statusComponents.map(component => (
                    <div key={component.component} className="border rounded-lg p-3">
                      <div className="font-medium text-sm text-gray-900">{component.component}</div>
                      <div className="text-xs text-gray-500 mt-1">{component.description}</div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full text-white`}
                          style={{ backgroundColor: PRIORITY_LEVELS[component.priority].color }}
                        >
                          {PRIORITY_LEVELS[component.priority].label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">预计: {component.estimated}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 可开始开发视图 */}
      {selectedView === 'ready' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-800 mb-4">
              🚀 可开始开发的组件 ({readyComponents.length})
            </h3>
            <p className="text-green-700 mb-4">
              这些组件的依赖项已经满足，可以立即开始开发工作。
            </p>
            
            {readyComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyComponents.map(component => (
                  <div key={component.component} className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="font-medium text-green-900 mb-2">{component.component}</div>
                    <div className="text-sm text-green-700 mb-3">{component.description}</div>
                    
                    <div className="mb-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full text-white`}
                        style={{ backgroundColor: PRIORITY_LEVELS[component.priority].color }}
                      >
                        {PRIORITY_LEVELS[component.priority].label}
                      </span>
                    </div>
                    
                    <div className="text-sm text-green-600 mb-3">预计: {component.estimated}</div>
                    
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">依赖项:</div>
                      {component.dependencies.map(dep => (
                        <span
                          key={dep}
                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          ✓ {dep}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      开始开发
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-600 text-lg font-medium mb-2">
                  暂无可开始开发的组件
                </div>
                <p className="text-green-600">
                  请先完成相关API端点的开发，或者解决现有组件的阻塞问题。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontendProgressReport;
