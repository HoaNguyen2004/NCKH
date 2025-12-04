# PowerShell script để khởi động tất cả services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   KHỞI ĐỘNG TẤT CẢ SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Thư mục gốc
$basePath = "D:\nghiencuukhoahoc\NCKH(1)\NCKH"

# 1. Khởi động Backend Server (Port 5000)
Write-Host "🚀 Khởi động Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\server'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 3

# 2. Khởi động Scraper Server (Port 3001)
Write-Host "🚀 Khởi động Scraper Server (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\clon chromium\clon chromium'; Write-Host 'Scraper Server Starting...' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 3

# 3. Khởi động Frontend (Port 3000)
Write-Host "🚀 Khởi động Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath'; Write-Host 'Frontend Starting...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ĐÃ KHỞI ĐỘNG TẤT CẢ SERVICES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "Scraper:   http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vui lòng đợi vài giây để các services khởi động..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 5

Write-Host "Đang mở trình duyệt..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Hoàn tất! Các cửa sổ PowerShell đã mở." -ForegroundColor Green
Write-Host "   Đóng các cửa sổ này sẽ dừng services tương ứng." -ForegroundColor Yellow


