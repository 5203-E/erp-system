// Jest测试设置文件

// 全局测试超时设置
jest.setTimeout(30000);

// 设置测试环境
process.env.NODE_ENV = 'test';

// 模拟控制台输出，避免测试时产生过多日志
global.console = {
  ...console,
  // 保留错误和警告日志
  error: jest.fn(),
  warn: jest.fn(),
  // 静默其他日志
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
