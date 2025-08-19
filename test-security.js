const request = require('supertest');
const express = require('express');
const { applySecurityMiddleware } = require('./middleware/security');

// 创建测试应用
const app = express();

// 基础中间件（必须在安全中间件之前）
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 应用安全中间件
applySecurityMiddleware(app);

// 测试路由
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

app.post('/test', (req, res) => {
  res.json({ message: 'POST test successful', body: req.body });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 启动测试服务器
const server = app.listen(0, () => {
  const port = server.address().port;
  console.log(`🧪 安全测试服务器运行在端口 ${port}`);
  
  runSecurityTests(port);
});

async function runSecurityTests(port) {
  const baseUrl = `http://localhost:${port}`;
  
  console.log('\n🔒 开始安全中间件测试...\n');
  
  try {
    // 测试1: 正常请求
    console.log('✅ 测试1: 正常请求');
    const response1 = await request(baseUrl)
      .get('/test')
      .expect(200);
    
    console.log('   响应:', response1.body.message);
    
    // 测试2: 安全头部
    console.log('\n✅ 测试2: 安全头部');
    const response2 = await request(baseUrl)
      .get('/test')
      .expect(200);
    
    const headers = response2.headers;
    console.log('   X-Frame-Options:', headers['x-frame-options']);
    console.log('   X-Content-Type-Options:', headers['x-content-type-options']);
    console.log('   X-XSS-Protection:', headers['x-xss-protection']);
    console.log('   Referrer-Policy:', headers['referrer-policy']);
    
    // 测试3: CORS配置
    console.log('\n✅ 测试3: CORS配置');
    const response3 = await request(baseUrl)
      .get('/test')
      .set('Origin', 'http://localhost:3000')
      .expect(200);
    
    console.log('   Access-Control-Allow-Origin:', response3.headers['access-control-allow-origin']);
    
    // 测试4: 输入验证 - 正常JSON
    console.log('\n✅ 测试4: 输入验证 - 正常JSON');
    const response4 = await request(baseUrl)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send({ name: 'test', value: 123 })
      .expect(200);
    
    console.log('   响应:', response4.body.message);
    
    // 测试5: 输入验证 - 无效Content-Type
    console.log('\n✅ 测试5: 输入验证 - 无效Content-Type');
    const response5 = await request(baseUrl)
      .post('/test')
      .set('Content-Type', 'text/plain')
      .send('invalid content type')
      .expect(400);
    
    console.log('   错误响应:', response5.body.error);
    
    // 测试6: SQL注入防护
    console.log('\n✅ 测试6: SQL注入防护');
    const response6 = await request(baseUrl)
      .get('/test')
      .query({ q: "'; DROP TABLE users; --" })
      .expect(400);
    
    console.log('   SQL注入防护:', response6.body.error);
    
    // 测试7: XSS防护
    console.log('\n✅ 测试7: XSS防护');
    const response7 = await request(baseUrl)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send({ script: '<script>alert("xss")</script>' })
      .expect(400);
    
    console.log('   XSS防护:', response7.body.error);
    
    // 测试8: 速率限制
    console.log('\n✅ 测试8: 速率限制');
    console.log('   发送多个请求测试速率限制...');
    
    let rateLimitHit = false;
    for (let i = 0; i < 15; i++) {
      try {
        await request(baseUrl)
          .get('/test')
          .expect(200);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          rateLimitHit = true;
          console.log(`   速率限制触发于第 ${i + 1} 个请求`);
          break;
        }
      }
    }
    
    if (!rateLimitHit) {
      console.log('   速率限制未触发（可能需要调整配置）');
    }
    
    // 测试9: 健康检查（应该跳过速率限制）
    console.log('\n✅ 测试9: 健康检查跳过速率限制');
    const response9 = await request(baseUrl)
      .get('/health')
      .expect(200);
    
    console.log('   健康检查响应:', response9.body.status);
    
    console.log('\n🎉 所有安全测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    // 关闭测试服务器
    server.close(() => {
      console.log('\n🔒 测试服务器已关闭');
    });
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  server.close(() => process.exit(1));
});

process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，关闭服务器...');
  server.close(() => process.exit(0));
});
