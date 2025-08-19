import React, { useState, useEffect } from 'react';
import {
  FRONTEND_PRIORITIES,
  PRIORITY_LEVELS,
  COMPONENT_STATUS,
  getPrioritizedComponents,
  getComponentsByPriority,
  getComponentsByStatus,
  getReadyComponents,
  updateComponentStatus,
  addBlocker,
  resolveBlocker,
  calculateFrontendProgress,
  getTimeEstimates
} from '../priorities';

const FrontendPriorityManager = () => {
  const [components, setComponents] = useState(FRONTEND_PRIORITIES);
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddBlocker, setShowAddBlocker] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [blockerDescription, setBlockerDescription] = useState('');

  // 计算进度统计
  const progress = calculateFrontendProgress();
  const timeEstimates = getTimeEstimates();

  // 获取可开始开发的组件
  const readyComponents = getReadyComponents(['API/orders']); // 假设订单API已完成

  // 更新组件状态
  const handleStatusUpdate = (componentName, newStatus, assignee = null) => {
    updateComponentStatus(componentName, newStatus, assignee);
    setComponents([...FRONTEND_PRIORITIES]);
  };

  // 添加阻塞项
  const handleAddBlocker = () => {
    if (selectedComponent && blockerDescription.trim()) {
      addBlocker(selectedComponent, blockerDescription.trim());
      setComponents([...FRONTEND_PRIORITIES]);
      setBlockerDescription('');
      setShowAddBlocker(false);
      setSelectedComponent(null);
    }
  };

  // 解决阻塞项
  const handleResolveBlocker = (componentName, blockerId) => {
    resolveBlocker(componentName, blockerId);
    setComponents([...FRONTEND_PRIORITIES]);
  };

  // 过滤组件
  const filteredComponents = components.filter(component => {
    const priorityMatch = selectedPriority === 'ALL' || component.priority === selectedPriority;
    const statusMatch = selectedStatus === 'ALL' || component.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

  // 获取状态标签样式
  const getStatusBadge = (status) => {
    const statusConfig = COMPONENT_STATUS[status];
    return (
      <span
        className="px-2 py-1 text-xs font-medium rounded-full text-white"
        style={{ backgroundColor: statusConfig.color }}
      >
        {statusConfig.label}
      </span>
    );
  };

  // 获取优先级标签样式
  const getPriorityBadge = (priority) => {
    const priorityConfig = PRIORITY_LEVELS[priority];
    return (
      <span
        className="px-2 py-1 text-xs font-medium rounded-full text-white"
        style={{ backgroundColor: priorityConfig.color }}
      >
        {priorityConfig.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          前端开发优先级管理
        </h1>
        
        {/* 进度概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">总体进度</div>
            <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
            <div className="text-sm text-gray-600">{progress.completed}/{progress.total} 组件</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">进行中</div>
            <div className="text-2xl font-bold text-orange-600">{progress.inProgress}</div>
            <div className="text-sm text-gray-600">正在开发</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">受阻</div>
            <div className="text-2xl font-bold text-red-600">{progress.blocked}</div>
            <div className="text-sm text-gray-600">需要解决</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm font-medium text-gray-500">时间估算</div>
            <div className="text-2xl font-bold text-green-600">{timeEstimates.remaining}天</div>
            <div className="text-sm text-gray-600">剩余工作量</div>
          </div>
        </div>

        {/* 可开始开发的组件 */}
        {readyComponents.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-green-800 mb-2">
              🚀 可开始开发的组件 ({readyComponents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyComponents.map(component => (
                <div key={component.component} className="bg-white p-3 rounded border border-green-200">
                  <div className="font-medium text-green-900">{component.component}</div>
                  <div className="text-sm text-green-700">{component.description}</div>
                  <div className="text-xs text-green-600 mt-1">预计: {component.estimated}</div>
                  <button
                    onClick={() => handleStatusUpdate(component.component, 'IN_PROGRESS')}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    开始开发
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 过滤器 */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">全部优先级</option>
              {Object.keys(PRIORITY_LEVELS).map(priority => (
                <option key={priority} value={priority}>
                  {PRIORITY_LEVELS[priority].label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">全部状态</option>
              {Object.keys(COMPONENT_STATUS).map(status => (
                <option key={status} value={status}>
                  {COMPONENT_STATUS[status].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 组件列表 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  组件
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优先级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  依赖
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  估算
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComponents.map(component => (
                <tr key={component.component} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {component.component}
                      </div>
                      <div className="text-sm text-gray-500">
                        {component.description}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {getPriorityBadge(component.priority)}
                  </td>
                  
                  <td className="px-6 py-4">
                    {getStatusBadge(component.status)}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {component.dependencies.map(dep => (
                        <span
                          key={dep}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {component.estimated}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      {component.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(component.component, 'IN_PROGRESS')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          开始开发
                        </button>
                      )}
                      
                      {component.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(component.component, 'REVIEW')}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            代码审查
                          </button>
                          <button
                            onClick={() => {
                              setSelectedComponent(component.component);
                              setShowAddBlocker(true);
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            添加阻塞
                          </button>
                        </>
                      )}
                      
                      {component.status === 'REVIEW' && (
                        <button
                          onClick={() => handleStatusUpdate(component.component, 'TESTING')}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          开始测试
                        </button>
                      )}
                      
                      {component.status === 'TESTING' && (
                        <button
                          onClick={() => handleStatusUpdate(component.component, 'COMPLETED')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          完成
                        </button>
                      )}
                      
                      {component.status === 'BLOCKED' && (
                        <div className="text-xs text-red-600">
                          {component.blockers.length} 个阻塞项
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 阻塞项管理模态框 */}
      {showAddBlocker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                添加阻塞项 - {selectedComponent}
              </h3>
              <textarea
                value={blockerDescription}
                onChange={(e) => setBlockerDescription(e.target.value)}
                placeholder="描述阻塞原因..."
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                rows="3"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddBlocker(false);
                    setSelectedComponent(null);
                    setBlockerDescription('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  onClick={handleAddBlocker}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  添加阻塞
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontendPriorityManager;
