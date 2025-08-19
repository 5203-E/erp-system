# ERP系统启动脚本
Write-Host "🚀 启动ERP系统..." -ForegroundColor Green
Write-Host ""

# 启动后端服务器
Write-Host "📊 启动后端服务器..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# 等待后端启动
Write-Host "⏳ 等待后端启动..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# 启动前端应用
Write-Host "🌐 启动前端应用..." -ForegroundColor Yellow
Set-Location client
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# 返回根目录
Set-Location ..

Write-Host ""
Write-Host "✅ ERP系统启动完成！" -ForegroundColor Green
Write-Host "📊 后端: http://localhost:5000" -ForegroundColor Blue
Write-Host "🌐 前端: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
