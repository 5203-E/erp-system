@echo off
echo 🚀 启动ERP系统前端应用程序...
echo.

cd client

echo 📦 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已存在
)

echo.
echo 🌐 启动开发服务器...
echo 前端将在 http://localhost:5173 运行
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause
