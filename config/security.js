const dotenv = require('dotenv');
const path = require('path');

// 根据环境加载不同的配置文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(process.cwd(), envFile) });

// 验证必需的环境变量
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// 在测试环境中使用默认值
if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
}

// 为测试环境提供默认值
if (process.env.NODE_ENV === 'test') {
  process.env.DB_HOST = process.env.DB_HOST || 'localhost';
  process.env.DB_USER = process.env.DB_USER || 'test_user';
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
  process.env.DB_NAME = process.env.DB_NAME || 'erp_test_db';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_purposes_only_32_chars';
}

// 安全配置对象
const securityConfig = {
  // 数据库配置
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
    // 连接池配置
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // JWT 算法
    algorithm: 'HS256'
  },

  // 密码安全配置
  password: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // 会话配置
  session: {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
  },

  // 速率限制配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: '请求过于频繁，请稍后再试',
    standardHeaders: true,
    legacyHeaders: false
  },

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  },

  // 安全头部配置
  securityHeaders: {
    enabled: process.env.SECURITY_HEADERS_ENABLED === 'true',
    // 内容安全策略
    contentSecurityPolicy: process.env.CSP_DIRECTIVES || "default-src 'self'",
    // 其他安全头部
    hsts: {
      maxAge: 31536000, // 1年
      includeSubDomains: true,
      preload: true
    },
    // XSS 保护
    xssProtection: true,
    // 防止点击劫持
    frameguard: 'deny',
    // 防止MIME类型嗅探
    noSniff: true,
    // 引用策略
    referrerPolicy: 'strict-origin-when-cross-origin'
  },

                // 日志配置
              logging: {
                level: process.env.LOG_LEVEL || 'info',
                filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
                maxSize: '10m',
                maxFiles: '5d',
                // 敏感信息过滤
                redact: ['password', 'token', 'secret', 'key'],
                // 请求日志
                enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true'
              },

  // 环境特定配置
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  }
};

// 验证配置安全性
const validateSecurityConfig = () => {
  const errors = [];

  // 验证JWT密钥强度
  if (securityConfig.jwt.secret.length < 32) {
    errors.push('JWT_SECRET 必须至少32个字符');
  }

  // 验证密码策略
  if (securityConfig.password.bcryptRounds < 10) {
    errors.push('BCRYPT_ROUNDS 必须至少为10');
  }

  // 验证数据库密码
  if (securityConfig.database.password === 'your_secure_password_here') {
    errors.push('请设置安全的数据库密码');
  }

  // 验证生产环境配置
  if (securityConfig.environment.isProduction) {
    if (securityConfig.cors.origin === 'http://localhost:3000') {
      errors.push('生产环境必须设置正确的CORS_ORIGIN');
    }
    if (!securityConfig.session.cookie.secure) {
      errors.push('生产环境必须启用安全Cookie');
    }
  }

  if (errors.length > 0) {
    throw new Error(`安全配置验证失败:\n${errors.join('\n')}`);
  }
};

// 初始化时验证配置
try {
  validateSecurityConfig();
  console.log('✅ 安全配置验证通过');
} catch (error) {
  console.error('❌ 安全配置验证失败:', error.message);
  if (securityConfig.environment.isProduction) {
    process.exit(1); // 生产环境配置错误时退出
  }
}

// 敏感信息脱敏函数
const sanitizeConfig = (config) => {
  const sanitized = JSON.parse(JSON.stringify(config));
  
  // 脱敏敏感字段
  if (sanitized.database) {
    sanitized.database.password = '***';
  }
  if (sanitized.jwt) {
    sanitized.jwt.secret = '***';
    sanitized.jwt.refreshSecret = '***';
  }
  if (sanitized.session) {
    sanitized.session.secret = '***';
  }
  
  return sanitized;
};

// 获取脱敏后的配置（用于日志记录）
const getSanitizedConfig = () => sanitizeConfig(securityConfig);

module.exports = {
  config: securityConfig,
  validate: validateSecurityConfig,
  getSanitizedConfig,
  // 便捷访问方法
  getDatabaseConfig: () => securityConfig.database,
  getJwtConfig: () => securityConfig.jwt,
  getPasswordConfig: () => securityConfig.password,
  getCorsConfig: () => securityConfig.cors,
  getSecurityHeaders: () => securityConfig.securityHeaders,
  getRateLimitConfig: () => securityConfig.rateLimit,
  isProduction: () => securityConfig.environment.isProduction,
  isDevelopment: () => securityConfig.environment.isDevelopment,
  isTest: () => securityConfig.environment.isTest
};
