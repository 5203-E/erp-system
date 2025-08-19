// 文件：src/priorities.js
// ERP系统前端开发优先级配置

/**
 * 前端组件开发优先级配置
 * 优先级级别：CRITICAL > HIGH > MEDIUM > LOW
 * 依赖关系：确保API端点先于前端组件完成
 */

export const FRONTEND_PRIORITIES = [
  {
    component: 'OrderManagementTable',
    priority: 'CRITICAL',
    dependencies: ['API/orders'],
    estimated: '2天',
    description: '订单管理表格组件，核心业务功能',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'AuthInterface',
    priority: 'HIGH',
    dependencies: ['API/auth', 'middleware/auth'],
    estimated: '1.5天',
    description: '用户认证界面，登录注册功能',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'Dashboard',
    priority: 'MEDIUM',
    dependencies: ['API/analytics', 'API/orders'],
    estimated: '2天',
    description: '系统仪表板，数据概览和统计',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'ProductManagement',
    priority: 'HIGH',
    dependencies: ['API/products', 'API/categories'],
    estimated: '2.5天',
    description: '产品管理界面，增删改查功能',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'InventoryManagement',
    priority: 'HIGH',
    dependencies: ['API/inventory', 'API/products'],
    estimated: '2天',
    description: '库存管理界面，库存跟踪和预警',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'UserManagement',
    priority: 'MEDIUM',
    dependencies: ['API/users', 'middleware/admin'],
    estimated: '1.5天',
    description: '用户管理界面，角色权限管理',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'OrderDetails',
    priority: 'MEDIUM',
    dependencies: ['API/orders', 'OrderManagementTable'],
    estimated: '1天',
    description: '订单详情页面，订单状态跟踪',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'Reports',
    priority: 'LOW',
    dependencies: ['API/reports', 'Dashboard'],
    estimated: '3天',
    description: '报表系统，数据导出和图表',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'Settings',
    priority: 'LOW',
    dependencies: ['API/settings'],
    estimated: '1天',
    description: '系统设置界面，配置管理',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  },
  {
    component: 'Notifications',
    priority: 'LOW',
    dependencies: ['API/notifications', 'WebSocket'],
    estimated: '2天',
    description: '通知系统，实时消息推送',
    status: 'PENDING',
    assignee: null,
    startDate: null,
    completionDate: null,
    blockers: []
  }
];

/**
 * 优先级级别定义
 */
export const PRIORITY_LEVELS = {
  CRITICAL: {
    level: 1,
    color: '#ef4444',
    label: '紧急',
    description: '核心功能，必须优先完成'
  },
  HIGH: {
    level: 2,
    color: '#f97316',
    label: '高',
    description: '重要功能，影响用户体验'
  },
  MEDIUM: {
    level: 3,
    color: '#eab308',
    label: '中',
    description: '一般功能，提升系统完整性'
  },
  LOW: {
    level: 4,
    color: '#22c55e',
    label: '低',
    description: '优化功能，非必需'
  }
};

/**
 * 组件状态定义
 */
export const COMPONENT_STATUS = {
  PENDING: {
    value: 'PENDING',
    label: '待开始',
    color: '#6b7280'
  },
  IN_PROGRESS: {
    value: 'IN_PROGRESS',
    label: '进行中',
    color: '#3b82f6'
  },
  REVIEW: {
    value: 'REVIEW',
    label: '代码审查',
    color: '#8b5cf6'
  },
  TESTING: {
    value: 'TESTING',
    label: '测试中',
    color: '#f59e0b'
  },
  COMPLETED: {
    value: 'COMPLETED',
    label: '已完成',
    color: '#10b981'
  },
  BLOCKED: {
    value: 'BLOCKED',
    label: '受阻',
    color: '#ef4444'
  }
};

/**
 * 获取按优先级排序的组件列表
 */
export function getPrioritizedComponents() {
  return [...FRONTEND_PRIORITIES].sort((a, b) => {
    const priorityA = PRIORITY_LEVELS[a.priority].level;
    const priorityB = PRIORITY_LEVELS[b.priority].level;
    return priorityA - priorityB;
  });
}

/**
 * 获取特定优先级的组件
 */
export function getComponentsByPriority(priority) {
  return FRONTEND_PRIORITIES.filter(component => component.priority === priority);
}

/**
 * 获取特定状态的组件
 */
export function getComponentsByStatus(status) {
  return FRONTEND_PRIORITIES.filter(component => component.status === status);
}

/**
 * 检查组件依赖是否满足
 */
export function checkDependencies(component, completedAPIs = []) {
  const dependencies = component.dependencies || [];
  return dependencies.every(dep => completedAPIs.includes(dep));
}

/**
 * 获取可开始开发的组件
 */
export function getReadyComponents(completedAPIs = []) {
  return FRONTEND_PRIORITIES.filter(component => 
    checkDependencies(component, completedAPIs) && 
    component.status === 'PENDING'
  );
}

/**
 * 更新组件状态
 */
export function updateComponentStatus(componentName, status, assignee = null) {
  const component = FRONTEND_PRIORITIES.find(c => c.component === componentName);
  if (component) {
    component.status = status;
    component.assignee = assignee;
    
    if (status === 'IN_PROGRESS' && !component.startDate) {
      component.startDate = new Date().toISOString();
    }
    
    if (status === 'COMPLETED' && !component.completionDate) {
      component.completionDate = new Date().toISOString();
    }
  }
}

/**
 * 添加阻塞项
 */
export function addBlocker(componentName, blocker) {
  const component = FRONTEND_PRIORITIES.find(c => c.component === componentName);
  if (component) {
    component.blockers.push({
      id: Date.now(),
      description: blocker,
      date: new Date().toISOString(),
      resolved: false
    });
    component.status = 'BLOCKED';
  }
}

/**
 * 解决阻塞项
 */
export function resolveBlocker(componentName, blockerId) {
  const component = FRONTEND_PRIORITIES.find(c => c.component === componentName);
  if (component) {
    const blocker = component.blockers.find(b => b.id === blockerId);
    if (blocker) {
      blocker.resolved = true;
      blocker.resolvedDate = new Date().toISOString();
      
      // 如果没有未解决的阻塞项，恢复状态
      const unresolvedBlockers = component.blockers.filter(b => !b.resolved);
      if (unresolvedBlockers.length === 0) {
        component.status = 'PENDING';
      }
    }
  }
}

/**
 * 计算开发进度
 */
export function calculateFrontendProgress() {
  const total = FRONTEND_PRIORITIES.length;
  const completed = FRONTEND_PRIORITIES.filter(c => c.status === 'COMPLETED').length;
  const inProgress = FRONTEND_PRIORITIES.filter(c => c.status === 'IN_PROGRESS').length;
  const blocked = FRONTEND_PRIORITIES.filter(c => c.status === 'BLOCKED').length;
  
  return {
    total,
    completed,
    inProgress,
    blocked,
    pending: total - completed - inProgress - blocked,
    percentage: Math.round((completed / total) * 100)
  };
}

/**
 * 获取开发时间估算
 */
export function getTimeEstimates() {
  const total = FRONTEND_PRIORITIES.reduce((sum, c) => {
    const days = parseFloat(c.estimated.replace('天', ''));
    return sum + days;
  }, 0);
  
  const completed = FRONTEND_PRIORITIES
    .filter(c => c.status === 'COMPLETED')
    .reduce((sum, c) => {
      const days = parseFloat(c.estimated.replace('天', ''));
      return sum + days;
    }, 0);
  
  const remaining = total - completed;
  
  return {
    total: total.toFixed(1),
    completed: completed.toFixed(1),
    remaining: remaining.toFixed(1),
    percentage: Math.round((completed / total) * 100)
  };
}

export default FRONTEND_PRIORITIES;
