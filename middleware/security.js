const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const securityConfig = require('../config/security');

// 速率限制中间件
const createRateLimiter = (options = {}) => {
  const defaultOptions = securityConfig.getRateLimitConfig();
  
  return rateLimit({
    windowMs: options.windowMs || defaultOptions.windowMs,
    max: options.max || defaultOptions.max,
    message: {
      success: false,
      message: options.message || defaultOptions.message,
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: defaultOptions.standardHeaders,
    legacyHeaders: defaultOptions.legacyHeaders,
    // 自定义键生成器（基于IP和用户ID）
    keyGenerator: (req) => {
      const userId = req.user?.id || 'anonymous';
      // 使用 ipKeyGenerator 助手函数处理IPv6地址
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return `${ip}-${userId}`;
    },
    // 跳过某些路由
    skip: (req) => {
      // 跳过健康检查
      return req.path === '/health' || req.path === '/healthz';
    },
    // 自定义处理函数
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      });
    }
  });
};

// 全局速率限制
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000 // 最多1000次请求
});

// 严格速率限制（用于敏感操作）
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次请求
  message: '操作过于频繁，请稍后再试'
});

// 登录速率限制
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3, // 最多3次登录尝试
  message: '登录尝试过多，请稍后再试'
});

// 安全头部中间件
const securityHeaders = (req, res, next) => {
  if (!securityConfig.getSecurityHeaders().enabled) {
    return next();
  }

  const headers = securityConfig.getSecurityHeaders();
  
  // 内容安全策略
  if (headers.contentSecurityPolicy) {
    res.setHeader('Content-Security-Policy', headers.contentSecurityPolicy);
  }
  
  // HSTS
  if (securityConfig.isProduction()) {
    res.setHeader('Strict-Transport-Security', 
      `max-age=${headers.hsts.maxAge}; includeSubDomains; preload`);
  }
  
  // XSS 保护
  if (headers.xssProtection) {
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  
  // 防止点击劫持
  if (headers.frameguard) {
    res.setHeader('X-Frame-Options', headers.frameguard);
  }
  
  // 防止MIME类型嗅探
  if (headers.noSniff) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  
  // 引用策略
  if (headers.referrerPolicy) {
    res.setHeader('Referrer-Policy', headers.referrerPolicy);
  }
  
  // 权限策略
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=()');
  
  next();
};

// CORS 中间件
const corsMiddleware = cors(securityConfig.getCorsConfig());

// 输入验证中间件
const inputValidation = (req, res, next) => {
  // 检查请求体大小
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: '请求体过大',
      error: 'PAYLOAD_TOO_LARGE',
      maxSize: maxSize
    });
  }
  
  // 检查Content-Type
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type必须是application/json',
        error: 'INVALID_CONTENT_TYPE'
      });
    }
  }
  
  next();
};

// SQL注入防护中间件
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i,
    /(\b(and|or)\b\s+\d+\s*[=<>])/i,
    /(\b(union|select)\b\s+.*\bfrom\b)/i,
    /(\b(union|select)\b\s+.*\bwhere\b)/i,
    /(\b(union|select)\b\s+.*\border\s+by\b)/i,
    /(\b(union|select)\b\s+.*\bgroup\s+by\b)/i,
    /(\b(union|select)\b\s+.*\bhaving\b)/i,
    /(\b(union|select)\b\s+.*\blimit\b)/i,
    /(\b(union|select)\b\s+.*\boffset\b)/i,
    /(\b(union|select)\b\s+.*\btop\b)/i,
    /(\b(union|select)\b\s+.*\bdistinct\b)/i,
    /(\b(union|select)\b\s+.*\bcount\b)/i,
    /(\b(union|select)\b\s+.*\bsum\b)/i,
    /(\b(union|select)\b\s+.*\bavg\b)/i,
    /(\b(union|select)\b\s+.*\bmin\b)/i,
    /(\b(union|select)\b\s+.*\bmax\b)/i
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          return false;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (!checkValue(value[key])) {
          return false;
        }
      }
    }
    return true;
  };
  
  // 检查查询参数
  if (!checkValue(req.query)) {
    return res.status(400).json({
      success: false,
      message: '检测到潜在的SQL注入攻击',
      error: 'SQL_INJECTION_DETECTED'
    });
  }
  
  // 检查请求体
  if (!checkValue(req.body)) {
    return res.status(400).json({
      success: false,
      message: '检测到潜在的SQL注入攻击',
      error: 'SQL_INJECTION_DETECTED'
    });
  }
  
  // 检查URL参数
  if (!checkValue(req.params)) {
    return res.status(400).json({
      success: false,
      message: '检测到潜在的SQL注入攻击',
      error: 'SQL_INJECTION_DETECTED'
    });
  }
  
  next();
};

// XSS防护中间件
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script/i,           // <script 标签
    /javascript:/i,        // javascript: 协议
    /on\w+\s*=/i,         // 事件处理器 (onclick, onload 等)
    /<iframe/i,            // iframe 标签
    /<object/i,            // object 标签
    /<embed/i,             // embed 标签
    /<form/i,              // form 标签
    /<input/i,             // input 标签
    /<textarea/i,          // textarea 标签
    /<button/i,            // button 标签
    /<select/i,            // select 标签
    /<option/i,            // option 标签
    /<label/i,             // label 标签
    /<fieldset/i,          // fieldset 标签
    /<legend/i,            // legend 标签
    /<optgroup/i           // optgroup 标签
  ];
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          console.log(`XSS检测到: ${value} 匹配模式: ${pattern}`);
          return false;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (!checkValue(value[key])) {
          return false;
        }
      }
    }
    return true;
  };
  
  // 检查所有输入
  if (!checkValue(req.query) || !checkValue(req.body) || !checkValue(req.params)) {
    return res.status(400).json({
      success: false,
      message: '检测到潜在的XSS攻击',
      error: 'XSS_DETECTED'
    });
  }
  
  next();
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  if (!securityConfig.logging?.enableRequestLogging) {
    return next();
  }
  
  const start = Date.now();
  
  // 记录请求开始
  console.log(`📥 ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
  
  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${logLevel}`);
    
    // 记录错误详情
    if (res.statusCode >= 400) {
      console.error(`❌ 请求失败: ${req.method} ${req.path} - ${res.statusCode}`);
    }
  });
  
  next();
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误
  console.error('🚨 错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // 生产环境不暴露错误详情
  if (securityConfig.isProduction()) {
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
  
  // 开发环境显示详细错误
  res.status(500).json({
    success: false,
    message: err.message,
    error: err.name,
    stack: err.stack
  });
};

module.exports = {
  // 速率限制器
  globalRateLimiter,
  strictRateLimiter,
  loginRateLimiter,
  createRateLimiter,
  
  // 安全中间件
  securityHeaders,
  corsMiddleware,
  inputValidation,
  sqlInjectionProtection,
  xssProtection,
  
  // 日志和错误处理
  requestLogger,
  errorHandler,
  
  // 便捷方法
  applySecurityMiddleware: (app) => {
    // 基础安全中间件
    app.use(helmet());
    app.use(corsMiddleware);
    app.use(securityHeaders);
    app.use(inputValidation);
    
    // 全局速率限制
    app.use(globalRateLimiter);
    
    // 安全防护（先检查XSS，再检查SQL注入）
    app.use(xssProtection);
    app.use(sqlInjectionProtection);
    
    // 日志
    app.use(requestLogger);
    
    // 错误处理（放在最后）
    app.use(errorHandler);
  }
};
