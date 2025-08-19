@echo off
echo 🚀 启动ERP系统...
echo.

echo 📊 启动后端服务器...
start "ERP Backend" cmd /k "npm run dev"

echo ⏳ 等待后端启动...
timeout /t 5 /nobreak >nul

echo 🌐 启动前端应用...
cd client
start "ERP Frontend" cmd /k "npm start"

echo.
echo ✅ ERP系统启动完成！
echo 📊 后端: http://localhost:5000
echo 🌐 前端: http://localhost:3000
echo.
echo 按任意键退出...
pause >nul
