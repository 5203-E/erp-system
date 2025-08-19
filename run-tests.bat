@echo off
echo 🧪 Orders API 测试套件
echo.

echo 📋 选择测试模式:
echo 1. 运行所有测试
echo 2. 运行Orders API测试
echo 3. 运行测试并生成覆盖率报告
echo 4. 监听模式（文件变化时自动运行）
echo 5. 清理测试缓存
echo 6. 退出
echo.

set /p choice="请输入选择 (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🚀 运行所有测试...
    npm test
) else if "%choice%"=="2" (
    echo.
    echo 🎯 运行Orders API测试...
    npm run test:orders
) else if "%choice%"=="3" (
    echo.
    echo 📊 运行测试并生成覆盖率报告...
    npm run test:coverage
    echo.
    echo 📁 覆盖率报告已生成在 coverage/ 目录中
    echo 🌐 打开 coverage/lcov-report/index.html 查看详细报告
) else if "%choice%"=="4" (
    echo.
    echo 👀 启动监听模式...
    echo 按 Ctrl+C 停止监听
    npm run test:watch
) else if "%choice%"=="5" (
    echo.
    echo 🧹 清理测试缓存...
    if exist ".jest-cache" (
        rmdir /s /q ".jest-cache"
        echo ✅ Jest缓存已清理
    ) else (
        echo ℹ️  没有找到Jest缓存
    )
    
    if exist "coverage" (
        rmdir /s /q "coverage"
        echo ✅ 覆盖率报告已清理
    ) else (
        echo ℹ️  没有找到覆盖率报告
    )
    
    echo.
    echo 🧹 清理完成！
) else if "%choice%"=="6" (
    echo 退出程序
    exit /b 0
) else (
    echo 无效选择，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo 📖 测试说明:
echo   - 测试文件: tests/orders.test.js
echo   - 测试数据工厂: tests/factories.js
echo   - 测试设置: tests/setup.js
echo   - Jest配置: jest.config.js
echo.
echo 🎯 主要测试场景:
echo   ✅ 成功创建订单
echo   ❌ 库存不足时的错误响应
echo   ❌ 未授权访问（通过验证中间件）
echo   ✅ 获取订单列表和详情
echo   ✅ 更新订单状态
echo   ✅ 数据完整性验证
echo   ✅ 边界条件测试
echo.
pause
