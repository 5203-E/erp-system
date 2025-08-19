module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // 测试文件忽略模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // 覆盖率收集
  collectCoverage: false, // 默认关闭，使用 --coverage 参数开启
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // 覆盖率目录
  coverageDirectory: 'coverage',
  
  // 覆盖率报告器
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 测试超时时间（毫秒）
  testTimeout: 30000,
  
  // 详细输出
  verbose: true,
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json'],
  
  // 环境变量
  setupFiles: ['<rootDir>/tests/setup.js'],
  
  // 测试结果缓存
  cache: true,
  cacheDirectory: '.jest-cache',
  
  // 并行执行
  maxWorkers: '50%',
  
  // 通知
  notify: false,
  
  // 监听模式
  watch: false,
  watchman: false,
  
  // 错误报告
  errorOnDeprecated: true,
  
  // 强制退出
  forceExit: true,
  
  // 清理模拟
  clearMocks: true,
  
  // 恢复模拟
  restoreMocks: true,
  
  // 重置模拟
  resetMocks: false,
  
  // 重置模块
  resetModules: false,
  
  // 静默
  silent: false,
  
  // 测试位置
  testLocationInResults: false,
  
  // 转换
  transform: {},
  
  // 转换忽略模式
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  
  // 未模拟的模块
  unmockedModulePathPatterns: [],
  
  // 更新快照
  updateSnapshot: false,
  
  // 使用分支覆盖
  useStderr: false
};
