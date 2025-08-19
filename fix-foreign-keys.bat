@echo off
echo 🔧 外键约束错误修复工具
echo.

echo 📋 选择修复方式:
echo 1. 自动修复（推荐）
echo 2. 只检查数据完整性
echo 3. 运行SQL修复脚本
echo 4. 退出
echo.

set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🚀 开始自动修复...
    node fix-foreign-key-errors.js
) else if "%choice%"=="2" (
    echo.
    echo 🔍 检查数据完整性...
    node fix-foreign-key-errors.js --check-only
) else if "%choice%"=="3" (
    echo.
    echo 📝 运行SQL修复脚本...
    echo 请确保PostgreSQL已安装并配置
    echo.
    set /p db_name="请输入数据库名称 (默认: erp_db): "
    if "%db_name%"=="" set db_name=erp_db
    
    echo 正在执行SQL修复脚本...
    psql -d %db_name% -f database/fix-foreign-keys.sql
) else if "%choice%"=="4" (
    echo 退出程序
    exit /b 0
) else (
    echo 无效选择，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo ✅ 修复完成！
echo.
echo 📖 查看详细文档:
echo   - SEQUELIZE_FOREIGN_KEY_GUIDE.md
echo   - 修复脚本: fix-foreign-key-errors.js
echo   - SQL脚本: database/fix-foreign-keys.sql
echo.
pause
