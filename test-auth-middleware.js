const jwt = require('jsonwebtoken');

// 模拟测试数据
const JWT_SECRET = 'your-secret-key';

// 模拟用户数据
const mockUsers = {
  'admin-user': {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: '管理员张三',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true
  },
  'employee-user': {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: '员工李四',
    email: 'employee@example.com',
    role: 'employee',
    isActive: true
  },
  'disabled-user': {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: '禁用用户',
    email: 'disabled@example.com',
    role: 'employee',
    isActive: false
  }
};

// 生成测试令牌
function generateTestToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

// 测试令牌生成
console.log('🔐 测试令牌生成:');
console.log('管理员令牌:', generateTestToken('admin-user'));
console.log('员工令牌:', generateTestToken('employee-user'));
console.log('禁用用户令牌:', generateTestToken('disabled-user'));
console.log('');

// 测试令牌验证
function testTokenValidation(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ 令牌验证成功:', decoded);
    return decoded;
  } catch (error) {
    console.log('❌ 令牌验证失败:', error.message);
    return null;
  }
}

// 模拟中间件测试
function simulateMiddlewareTest() {
  console.log('🧪 模拟中间件测试:');
  console.log('');

  // 测试1: 有效管理员令牌
  console.log('测试1: 有效管理员令牌');
  const adminToken = generateTestToken('admin-user');
  const adminDecoded = testTokenValidation(adminToken);
  
  if (adminDecoded) {
    const user = mockUsers[adminDecoded.userId];
    if (user && user.isActive && user.role === 'admin') {
      console.log('✅ 管理员权限验证通过');
      console.log('用户信息:', {
        id: user.id,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      console.log('❌ 管理员权限验证失败');
    }
  }
  console.log('');

  // 测试2: 有效员工令牌
  console.log('测试2: 有效员工令牌');
  const employeeToken = generateTestToken('employee-user');
  const employeeDecoded = testTokenValidation(employeeToken);
  
  if (employeeDecoded) {
    const user = mockUsers[employeeDecoded.userId];
    if (user && user.isActive) {
      console.log('✅ 员工令牌验证通过');
      console.log('用户信息:', {
        id: user.id,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      });
      
      if (user.role === 'admin') {
        console.log('✅ 用户具有管理员权限');
      } else {
        console.log('❌ 用户不具有管理员权限，需要管理员权限的操作将被拒绝');
      }
    } else {
      console.log('❌ 员工令牌验证失败');
    }
  }
  console.log('');

  // 测试3: 无效令牌
  console.log('测试3: 无效令牌');
  const invalidToken = 'invalid.token.here';
  testTokenValidation(invalidToken);
  console.log('');

  // 测试4: 过期令牌
  console.log('测试4: 过期令牌');
  const expiredToken = jwt.sign({ userId: 'admin-user' }, JWT_SECRET, { expiresIn: '0s' });
  setTimeout(() => {
    testTokenValidation(expiredToken);
  }, 1000);
  console.log('');

  // 测试5: 禁用用户令牌
  console.log('测试5: 禁用用户令牌');
  const disabledUserToken = generateTestToken('disabled-user');
  const disabledUserDecoded = testTokenValidation(disabledUserToken);
  
  if (disabledUserDecoded) {
    const user = mockUsers[disabledUserDecoded.userId];
    if (user && !user.isActive) {
      console.log('❌ 用户账户已被禁用，无法访问受保护的资源');
    }
  }
}

// 运行测试
console.log('🚀 开始认证中间件测试\n');
simulateMiddlewareTest();

// 使用说明
console.log('📖 使用说明:');
console.log('1. 在请求头中添加: Authorization: Bearer <your-token>');
console.log('2. 中间件会自动验证令牌并检查用户权限');
console.log('3. 只有管理员可以访问使用 checkAdmin 中间件的路由');
console.log('4. 员工和管理员都可以访问使用 checkEmployeeOrAdmin 中间件的路由');
console.log('5. 无效令牌、过期令牌或权限不足都会返回相应的错误响应');
console.log('');

// 错误响应示例
console.log('📋 错误响应示例:');
console.log('401 - 令牌缺失或无效:');
console.log('  { "success": false, "message": "访问令牌缺失", "error": "MISSING_TOKEN" }');
console.log('');

console.log('403 - 权限不足:');
console.log('  { "success": false, "message": "权限不足，需要管理员权限", "error": "INSUFFICIENT_PERMISSIONS" }');
console.log('');

console.log('404 - 用户不存在:');
console.log('  { "success": false, "message": "用户不存在", "error": "USER_NOT_FOUND" }');
console.log('');

console.log('500 - 服务器错误:');
console.log('  { "success": false, "message": "权限验证失败", "error": "PERMISSION_VERIFICATION_FAILED" }');
