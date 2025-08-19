@echo off
echo 🚀 启动ERP系统（带认证中间件）
echo.

echo 📦 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
) else (
    echo 依赖已安装 ✓
)

echo.
echo 🔐 设置环境变量...
set JWT_SECRET=your-super-secret-jwt-key-here

echo.
echo 🗄️ 启动数据库（如果使用Docker）...
echo 注意：请确保PostgreSQL数据库正在运行

echo.
echo ⚡ 启动后端服务器...
start "ERP Backend" cmd /k "npm run dev"

echo.
echo ⏳ 等待后端启动...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 启动前端应用...
start "ERP Frontend" cmd /k "cd client && npm start"

echo.
echo ✅ ERP系统启动完成！
echo.
echo 📍 后端API: http://localhost:5000
echo 📍 前端应用: http://localhost:3000
echo.
echo 🔑 测试认证中间件:
echo   - 使用 test-auth-simple.js 生成测试令牌
echo   - 在API请求中添加: Authorization: Bearer <token>
echo.
pause
