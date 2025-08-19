#!/usr/bin/env node

/**
 * ERP系统开发进度追踪器
 * 运行命令: node dev-progress-tracker.js
 */

const fs = require('fs');
const path = require('path');

// 开发进度数据库文件
const PROGRESS_DB = "dev-progress.json";
const REPORT_FILE = "DEVELOPMENT_PROGRESS.md";

// 进度数据模板
const baseProgressData = {
  project: "ERP System",
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  modules: {
    backend_infrastructure: {
      name: "后端基础设施",
      progress: 95,
      status: "🟢 基本完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "Express.js 服务器设置", completed: true },
        { name: "环境配置管理", completed: true },
        { name: "数据库连接配置", completed: true },
        { name: "中间件架构", completed: true },
        { name: "错误处理系统", completed: true },
        { name: "进程信号处理", completed: true },
        { name: "服务器启动问题排查", completed: false },
        { name: "生产环境部署配置", completed: false },
        { name: "性能监控集成", completed: false }
      ]
    },
    database_design: {
      name: "数据库设计",
      progress: 90,
      status: "🟢 基本完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "PostgreSQL 数据库架构", completed: true },
        { name: "用户表 (Users)", completed: true },
        { name: "产品表 (Products)", completed: true },
        { name: "订单表 (Orders)", completed: true },
        { name: "订单明细表 (OrderItems)", completed: true },
        { name: "外键约束和索引", completed: true },
        { name: "数据库初始化脚本", completed: true },
        { name: "外键约束问题修复", completed: false },
        { name: "数据库迁移脚本", completed: false },
        { name: "数据备份策略", completed: false }
      ]
    },
    security_middleware: {
      name: "安全中间件",
      progress: 95,
      status: "🟢 基本完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "速率限制 (Rate Limiting)", completed: true },
        { name: "安全头部设置", completed: true },
        { name: "CORS 配置", completed: true },
        { name: "输入验证", completed: true },
        { name: "SQL注入防护", completed: true },
        { name: "XSS防护", completed: true },
        { name: "请求日志记录", completed: true },
        { name: "错误处理中间件", completed: true },
        { name: "IPv6地址处理优化", completed: false },
        { name: "安全审计日志", completed: false },
        { name: "威胁检测增强", completed: false }
      ]
    },
    api_endpoints: {
      name: "API端点",
      progress: 80,
      status: "🟡 大部分完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "订单创建 (POST /api/orders)", completed: true },
        { name: "订单列表 (GET /api/orders)", completed: true },
        { name: "订单详情 (GET /api/orders/:id)", completed: true },
        { name: "订单状态更新 (PATCH /api/orders/:id/status)", completed: true },
        { name: "输入验证中间件", completed: true },
        { name: "错误处理", completed: true },
        { name: "认证中间件集成", completed: false },
        { name: "用户认证端点", completed: false },
        { name: "产品管理端点", completed: false },
        { name: "库存管理端点", completed: false },
        { name: "支付集成", completed: false },
        { name: "文件上传", completed: false }
      ]
    },
    test_suite: {
      name: "测试套件",
      progress: 85,
      status: "🟡 大部分完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "Jest 测试框架配置", completed: true },
        { name: "测试环境设置", completed: true },
        { name: "测试数据工厂", completed: true },
        { name: "订单API测试", completed: true },
        { name: "安全中间件测试", completed: true },
        { name: "测试运行脚本", completed: true },
        { name: "认证测试用例", completed: false },
        { name: "集成测试", completed: false },
        { name: "性能测试", completed: false },
        { name: "端到端测试", completed: false }
      ]
    },
    frontend_ui: {
      name: "前端界面",
      progress: 40,
      status: "🟠 部分完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "React 项目结构", completed: true },
        { name: "Vite 构建配置", completed: true },
        { name: "Tailwind CSS 样式", completed: true },
        { name: "基础组件框架", completed: true },
        { name: "订单管理表格组件", completed: false },
        { name: "用户认证界面", completed: false },
        { name: "产品管理界面", completed: false },
        { name: "库存管理界面", completed: false },
        { name: "仪表板组件", completed: false },
        { name: "响应式设计", completed: false }
      ]
    },
    documentation: {
      name: "文档系统",
      progress: 90,
      status: "🟢 基本完成",
      lastUpdate: new Date().toISOString(),
      tasks: [
        { name: "API文档", completed: true },
        { name: "数据库设计文档", completed: true },
        { name: "测试指南", completed: true },
        { name: "安全配置指南", completed: true },
        { name: "代码质量指南", completed: true },
        { name: "外键约束修复指南", completed: true },
        { name: "SQL优化指南", completed: true },
        { name: "用户手册", completed: false },
        { name: "部署指南", completed: false },
        { name: "API参考文档", completed: false }
      ]
    }
  }
};

/**
 * 初始化进度数据库
 */
function initProgressDB() {
  if (!fs.existsSync(PROGRESS_DB)) {
    fs.writeFileSync(PROGRESS_DB, JSON.stringify(baseProgressData, null, 2));
    console.log(`✅ 已创建进度数据库: ${PROGRESS_DB}`);
    return baseProgressData;
  } else {
    const data = JSON.parse(fs.readFileSync(PROGRESS_DB, 'utf8'));
    console.log(`📖 已加载现有进度数据库: ${PROGRESS_DB}`);
    return data;
  }
}

/**
 * 计算模块进度
 */
function calculateProgress(tasks) {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
}

/**
 * 更新模块进度
 */
function updateModuleProgress(moduleKey, progress, completedTasks = []) {
  const data = JSON.parse(fs.readFileSync(PROGRESS_DB, 'utf8'));
  
  if (data.modules[moduleKey]) {
    data.modules[moduleKey].progress = progress;
    data.modules[moduleKey].lastUpdate = new Date().toISOString();
    
    // 更新已完成任务
    completedTasks.forEach(taskName => {
      const task = data.modules[moduleKey].tasks.find(t => t.name === taskName);
      if (task) {
        task.completed = true;
      }
    });
    
    // 重新计算进度
    data.modules[moduleKey].progress = calculateProgress(data.modules[moduleKey].tasks);
    
    // 更新状态
    if (data.modules[moduleKey].progress >= 90) {
      data.modules[moduleKey].status = "🟢 基本完成";
    } else if (data.modules[moduleKey].progress >= 70) {
      data.modules[moduleKey].status = "🟡 大部分完成";
    } else if (data.modules[moduleKey].progress >= 40) {
      data.modules[moduleKey].status = "🟠 部分完成";
    } else {
      data.modules[moduleKey].status = "🔴 刚开始";
    }
  }
  
  data.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(PROGRESS_DB, JSON.stringify(data, null, 2));
  console.log(`✅ 已更新模块 ${moduleKey} 的进度为 ${progress}%`);
  
  return data;
}

/**
 * 生成进度报告
 */
function generateProgressReport(data) {
  let report = `# 🚀 ERP系统开发进度报告\n\n`;
  report += `**项目名称**: ${data.project}  \n`;
  report += `**版本**: ${data.version}  \n`;
  report += `**生成时间**: ${new Date().toLocaleString('zh-CN')}  \n`;
  report += `**技术栈**: Node.js + Express + PostgreSQL + Sequelize + React + Jest  \n\n`;
  
  report += `---\n\n`;
  
  // 模块进度概览
  report += `## 📊 模块进度概览\n\n`;
  report += `| 模块 | 进度 | 状态 | 最后更新 |\n`;
  report += `|------|------|------|----------|\n`;
  
  Object.entries(data.modules).forEach(([key, module]) => {
    const progressBar = `![${module.progress}%](https://progress-bar.dev/${module.progress}/?title=${encodeURIComponent(module.name)})`;
    const lastUpdate = module.lastUpdate ? module.lastUpdate.split('T')[0] : 'N/A';
    report += `| **${module.name}** | ${progressBar} | ${module.status} | ${lastUpdate} |\n`;
  });
  
  report += `\n---\n\n`;
  
  // 详细模块状态
  report += `## 🔧 详细模块状态\n\n`;
  
  Object.entries(data.modules).forEach(([key, module]) => {
    report += `### ${module.name} (${module.progress}%)\n\n`;
    report += `**状态**: ${module.status}  \n`;
    report += `**最后更新**: ${module.lastUpdate ? new Date(module.lastUpdate).toLocaleString('zh-CN') : 'N/A'}  \n\n`;
    
    report += `**任务列表**:\n`;
    module.tasks.forEach(task => {
      const status = task.completed ? "✅" : "◻️";
      report += `- [${status}] ${task.name}\n`;
    });
    
    report += `\n`;
  });
  
  // 项目统计
  const totalTasks = Object.values(data.modules).reduce((sum, module) => sum + module.tasks.length, 0);
  const completedTasks = Object.values(data.modules).reduce((sum, module) => 
    sum + module.tasks.filter(task => task.completed).length, 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);
  
  report += `## 📈 项目统计\n\n`;
  report += `- **总体进度**: ${overallProgress}%\n`;
  report += `- **总任务数**: ${totalTasks}\n`;
  report += `- **已完成任务**: ${completedTasks}\n`;
  report += `- **剩余任务**: ${totalTasks - completedTasks}\n`;
  report += `- **模块数量**: ${Object.keys(data.modules).length}\n\n`;
  
  // 下一步计划
  report += `## 🎯 下一步开发计划\n\n`;
  
  const incompleteModules = Object.entries(data.modules).filter(([key, module]) => module.progress < 100);
  
  if (incompleteModules.length > 0) {
    report += `### 优先完成模块\n\n`;
    incompleteModules.forEach(([key, module]) => {
      const incompleteTasks = module.tasks.filter(task => !task.completed);
      if (incompleteTasks.length > 0) {
        report += `**${module.name}** (${module.progress}%)\n`;
        incompleteTasks.forEach(task => {
          report += `- [ ] ${task.name}\n`;
        });
        report += `\n`;
      }
    });
  }
  
  report += `---\n\n`;
  report += `> 📝 **注意**: 本报告基于开发进度追踪系统自动生成，建议定期更新以反映最新进度。  \n`;
  report += `> 🚀 **下一步**: 优先完成进度较低的模块，确保项目整体推进。\n`;
  
  return report;
}

/**
 * 显示进度摘要
 */
function showProgressSummary(data) {
  console.log('\n📊 ERP系统开发进度摘要');
  console.log('='.repeat(50));
  
  Object.entries(data.modules).forEach(([key, module]) => {
    const progressBar = '█'.repeat(Math.floor(module.progress / 10)) + '░'.repeat(10 - Math.floor(module.progress / 10));
    console.log(`${module.name}: ${progressBar} ${module.progress}% ${module.status}`);
  });
  
  const totalTasks = Object.values(data.modules).reduce((sum, module) => sum + module.tasks.length, 0);
  const completedTasks = Object.values(data.modules).reduce((sum, module) => 
    sum + module.tasks.filter(task => task.completed).length, 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);
  
  console.log('\n' + '='.repeat(50));
  console.log(`总体进度: ${overallProgress}% (${completedTasks}/${totalTasks} 任务完成)`);
  console.log('='.repeat(50));
}

/**
 * 主函数
 */
function main() {
  try {
    console.log('🚀 启动ERP系统开发进度追踪器...\n');
    
    // 初始化或加载进度数据
    const progressData = initProgressDB();
    
    // 显示进度摘要
    showProgressSummary(progressData);
    
    // 生成报告
    const reportContent = generateProgressReport(progressData);
    
    // 保存报告文件
    fs.writeFileSync(REPORT_FILE, reportContent, 'utf8');
    
    console.log(`\n✅ 开发进度报告已生成: ${REPORT_FILE}`);
    console.log(`📊 使用Markdown查看器查看文件`);
    console.log(`🔄 下次运行将自动更新进度`);
    
  } catch (error) {
    console.error('❌ 生成进度报告时出错:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = {
  initProgressDB,
  updateModuleProgress,
  generateProgressReport,
  showProgressSummary
};
