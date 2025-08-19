const jwt = require('jsonwebtoken');

// 测试配置
const JWT_SECRET = 'test-secret-key';
const testUserId = 'test-admin-123';

console.log('🔐 认证中间件测试\n');

// 1. 生成测试令牌
console.log('1. 生成测试令牌:');
const token = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '1h' });
console.log('✅ 令牌生成成功:', token.substring(0, 50) + '...');
console.log('');

// 2. 验证令牌
console.log('2. 验证令牌:');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ 令牌验证成功');
  console.log('   用户ID:', decoded.userId);
  console.log('   过期时间:', new Date(decoded.exp * 1000).toLocaleString());
} catch (error) {
  console.log('❌ 令牌验证失败:', error.message);
}
console.log('');

// 3. 模拟中间件逻辑
console.log('3. 模拟中间件逻辑:');
const mockUser = {
  id: testUserId,
  name: '测试管理员',
  role: 'admin',
  isActive: true
};

// 模拟 checkAdmin 中间件
function simulateCheckAdmin(userId) {
  if (userId === testUserId && mockUser.isActive && mockUser.role === 'admin') {
    return { success: true, user: mockUser };
  } else {
    return { success: false, error: '权限不足' };
  }
}

const result = simulateCheckAdmin(testUserId);
if (result.success) {
  console.log('✅ 管理员权限验证通过');
  console.log('   用户:', result.user.name);
  console.log('   角色:', result.user.role);
} else {
  console.log('❌ 权限验证失败:', result.error);
}
console.log('');

// 4. 错误情况测试
console.log('4. 错误情况测试:');
const invalidToken = 'invalid.token.here';
try {
  jwt.verify(invalidToken, JWT_SECRET);
} catch (error) {
  console.log('✅ 无效令牌被正确拒绝:', error.message);
}

const expiredToken = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '0s' });
setTimeout(() => {
  try {
    jwt.verify(expiredToken, JWT_SECRET);
  } catch (error) {
    console.log('✅ 过期令牌被正确拒绝:', error.message);
  }
}, 1000);

console.log('');

// 5. 使用说明
console.log('5. 使用说明:');
console.log('   - 在请求头中添加: Authorization: Bearer <token>');
console.log('   - 中间件会自动验证令牌和权限');
console.log('   - 只有管理员可以访问受保护的路由');
console.log('   - 无效或过期令牌会返回401错误');
console.log('   - 权限不足会返回403错误');

console.log('\n🎉 认证中间件测试完成！');
