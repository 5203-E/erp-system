@echo off
echo 🚀 ERP系统开发进度追踪器
echo.

echo 📋 选择操作:
echo 1. 生成进度报告
echo 2. 更新模块进度
echo 3. 查看进度摘要
echo 4. 退出
echo.

set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" (
    echo.
    echo 📊 生成开发进度报告...
    node dev-progress-tracker.js
    echo.
    echo 📁 报告文件: DEVELOPMENT_PROGRESS.md
    echo 🌐 使用Markdown查看器打开文件
) else if "%choice%"=="2" (
    echo.
    echo 🔄 更新模块进度...
    echo.
    echo 📋 可用模块:
    echo   - backend_infrastructure (后端基础设施)
    echo   - database_design (数据库设计)
    echo   - security_middleware (安全中间件)
    echo   - api_endpoints (API端点)
    echo   - test_suite (测试套件)
    echo   - frontend_ui (前端界面)
    echo   - documentation (文档系统)
    echo.
    set /p module="请输入模块键名: "
    set /p progress="请输入新进度 (0-100): "
    set /p tasks="请输入已完成的任务 (用逗号分隔，如: 任务1,任务2): "
    
    echo.
    echo 🔄 正在更新进度...
    node -e "
    const tracker = require('./dev-progress-tracker.js');
    const completedTasks = '${tasks}'.split(',').filter(t => t.trim());
    tracker.updateModuleProgress('${module}', ${progress}, completedTasks);
    console.log('✅ 进度更新完成！');
    "
) else if "%choice%"=="3" (
    echo.
    echo 📊 查看进度摘要...
    node -e "
    const tracker = require('./dev-progress-tracker.js');
    const data = tracker.initProgressDB();
    tracker.showProgressSummary(data);
    "
) else if "%choice%"=="4" (
    echo 退出程序
    exit /b 0
) else (
    echo 无效选择，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo 📖 使用说明:
echo   - 进度报告: DEVELOPMENT_PROGRESS.md
echo   - 进度数据: dev-progress.json
echo   - 主程序: dev-progress-tracker.js
echo.
echo 🎯 建议定期更新进度以保持报告准确性
echo.
pause
