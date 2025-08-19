import React, { useState } from 'react';
import {
  FRONTEND_PRIORITIES,
  PRIORITY_LEVELS,
  COMPONENT_STATUS,
  updateComponentStatus,
  addBlocker,
  resolveBlocker
} from '../priorities';

const FrontendKanban = () => {
  const [components, setComponents] = useState(FRONTEND_PRIORITIES);
  const [draggedComponent, setDraggedComponent] = useState(null);

  // 看板列配置
  const columns = [
    { id: 'PENDING', title: '待开始', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: '进行中', color: 'bg-blue-100' },
    { id: 'REVIEW', title: '代码审查', color: 'bg-purple-100' },
    { id: 'TESTING', title: '测试中', color: 'bg-yellow-100' },
    { id: 'COMPLETED', title: '已完成', color: 'bg-green-100' },
    { id: 'BLOCKED', title: '受阻', color: 'bg-red-100' }
  ];

  // 更新组件状态
  const handleStatusUpdate = (componentName, newStatus) => {
    updateComponentStatus(componentName, newStatus);
    setComponents([...FRONTEND_PRIORITIES]);
  };

  // 添加阻塞项
  const handleAddBlocker = (componentName, blockerDescription) => {
    addBlocker(componentName, blockerDescription);
    setComponents([...FRONTEND_PRIORITIES]);
  };

  // 解决阻塞项
  const handleResolveBlocker = (componentName, blockerId) => {
    resolveBlocker(componentName, blockerId);
    setComponents([...FRONTEND_PRIORITIES]);
  };

  // 拖拽开始
  const handleDragStart = (e, component) => {
    setDraggedComponent(component);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  // 拖拽悬停
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 拖拽放置
  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedComponent && draggedComponent.status !== status) {
      handleStatusUpdate(draggedComponent.component, status);
    }
  };

  // 获取优先级标签
  const getPriorityBadge = (priority) => {
    const priorityConfig = PRIORITY_LEVELS[priority];
    return (
      <span
        className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white mb-2"
        style={{ backgroundColor: priorityConfig.color }}
      >
        {priorityConfig.label}
      </span>
    );
  };

  // 获取依赖标签
  const getDependencyBadges = (dependencies) => {
    return dependencies.map(dep => (
      <span
        key={dep}
        className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
      >
        {dep}
      </span>
    ));
  };

  // 获取阻塞项列表
  const getBlockerList = (component) => {
    if (!component.blockers || component.blockers.length === 0) return null;

    return (
      <div className="mt-2">
        <div className="text-xs font-medium text-red-600 mb-1">阻塞项:</div>
        {component.blockers.map(blocker => (
          <div key={blocker.id} className="text-xs bg-red-50 p-2 rounded mb-1">
            <div className="text-red-700">{blocker.description}</div>
            <div className="text-red-500 text-xs mt-1">
              {new Date(blocker.date).toLocaleDateString()}
            </div>
            {!blocker.resolved && (
              <button
                onClick={() => handleResolveBlocker(component.component, blocker.id)}
                className="mt-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                解决
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 获取操作按钮
  const getActionButtons = (component) => {
    switch (component.status) {
      case 'PENDING':
        return (
          <button
            onClick={() => handleStatusUpdate(component.component, 'IN_PROGRESS')}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            开始开发
          </button>
        );
      
      case 'IN_PROGRESS':
        return (
          <div className="space-y-2">
            <button
              onClick={() => handleStatusUpdate(component.component, 'REVIEW')}
              className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              代码审查
            </button>
            <button
              onClick={() => {
                const blocker = prompt('描述阻塞原因:');
                if (blocker) handleAddBlocker(component.component, blocker);
              }}
              className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              添加阻塞
            </button>
          </div>
        );
      
      case 'REVIEW':
        return (
          <button
            onClick={() => handleStatusUpdate(component.component, 'TESTING')}
            className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            开始测试
          </button>
        );
      
      case 'TESTING':
        return (
          <button
            onClick={() => handleStatusUpdate(component.component, 'COMPLETED')}
            className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            完成
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          前端开发看板
        </h1>
        <p className="text-gray-600">
          拖拽组件卡片来更新状态，实时跟踪开发进度
        </p>
      </div>

      {/* 看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {columns.map(column => (
          <div key={column.id} className="space-y-4">
            {/* 列标题 */}
            <div className={`${column.color} p-4 rounded-lg`}>
              <h3 className="font-semibold text-gray-900">
                {column.title}
              </h3>
              <div className="text-sm text-gray-600">
                {components.filter(c => c.status === column.id).length} 个组件
              </div>
            </div>

            {/* 列内容 */}
            <div
              className="min-h-[600px] p-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {components
                .filter(component => component.status === column.id)
                .map(component => (
                  <div
                    key={component.component}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-lg shadow border mb-4 cursor-move hover:shadow-md transition-shadow"
                  >
                    {/* 组件标题 */}
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {component.component}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {component.description}
                      </p>
                    </div>

                    {/* 优先级标签 */}
                    {getPriorityBadge(component.priority)}

                    {/* 依赖项 */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">依赖:</div>
                      {getDependencyBadges(component.dependencies)}
                    </div>

                    {/* 时间估算 */}
                    <div className="text-xs text-gray-600 mb-3">
                      预计: {component.estimated}
                    </div>

                    {/* 阻塞项 */}
                    {getBlockerList(component)}

                    {/* 操作按钮 */}
                    <div className="mt-3">
                      {getActionButtons(component)}
                    </div>

                    {/* 时间信息 */}
                    {component.startDate && (
                      <div className="text-xs text-gray-500 mt-2">
                        开始: {new Date(component.startDate).toLocaleDateString()}
                      </div>
                    )}
                    {component.completionDate && (
                      <div className="text-xs text-gray-500">
                        完成: {new Date(component.completionDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 拖拽提示 */}
      {draggedComponent && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            拖拽 {draggedComponent.component} 到目标列
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontendKanban;
