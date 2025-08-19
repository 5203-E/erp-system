const { Sequelize } = require('sequelize');
const securityConfig = require('./security');

// 获取数据库配置
const dbConfig = securityConfig.getDatabaseConfig();

// 创建 Sequelize 实例
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: dbConfig.host,
  username: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.name,
  port: dbConfig.port,
  
  // 连接池配置
  pool: {
    min: dbConfig.pool.min,
    max: dbConfig.pool.max,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  
  // 日志配置
  logging: securityConfig.isDevelopment() ? console.log : false,
  
  // 时区配置
  timezone: '+08:00',
  
  // 字符集配置
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  
  // 查询配置
  define: {
    // 使用下划线命名
    underscored: true,
    // 自动添加时间戳
    timestamps: true,
    // 时间戳字段名
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 删除字段名
    deletedAt: 'deleted_at',
    // 表名复数化
    freezeTableName: false
  },
  
  // 查询选项
  query: {
    raw: false
  },
  
  // 事务配置
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  
  // 连接重试配置
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /SequelizeConnectionAcquireTimeoutError/,
      /SequelizePoolAcquireTimeoutError/,
      /SequelizePoolConnectionTimeoutError/,
      /SequelizePoolConnectionAcquireTimeoutError/
    ]
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 获取连接信息（脱敏）
    const connectionInfo = {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.name,
      user: dbConfig.user,
      poolSize: `${dbConfig.pool.min}-${dbConfig.pool.max}`
    };
    
    console.log('📊 数据库连接信息:', connectionInfo);
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    
    // 生产环境连接失败时退出
    if (securityConfig.isProduction()) {
      console.error('🚨 生产环境数据库连接失败，系统退出');
      process.exit(1);
    }
    
    return false;
  }
};

// 健康检查
const healthCheck = async () => {
  try {
    const result = await sequelize.query('SELECT 1 as health_check');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConfig.name,
      connection: 'active'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbConfig.name,
      error: error.message,
      connection: 'inactive'
    };
  }
};

// 优雅关闭
const gracefulShutdown = async () => {
  try {
    console.log('🔄 正在关闭数据库连接...');
    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接时出错:', error.message);
  }
};

// 进程信号处理
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// 未捕获异常处理
process.on('uncaughtException', async (error) => {
  console.error('🚨 未捕获的异常:', error);
  await gracefulShutdown();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('🚨 未处理的Promise拒绝:', reason);
  await gracefulShutdown();
  process.exit(1);
});

module.exports = {
  sequelize,
  testConnection,
  healthCheck,
  gracefulShutdown,
  // 导出配置信息（脱敏）
  getConfig: () => ({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    user: dbConfig.user,
    pool: {
      min: dbConfig.pool.min,
      max: dbConfig.pool.max
    }
  })
};
