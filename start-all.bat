@echo off
echo ========================================
echo    KHỞI ĐỘNG TẤT CẢ SERVICES
echo ========================================
echo.

REM Tạo các cửa sổ mới cho mỗi service
start "Backend Server (Port 5000)" cmd /k "cd /d D:\nghiencuukhoahoc\NCKH(1)\NCKH\server && echo Starting Backend Server... && npm run dev"
timeout /t 3 /nobreak >nul

start "Scraper Server (Port 3001)" cmd /k "cd /d D:\nghiencuukhoahoc\NCKH(1)\NCKH\clon chromium\clon chromium && echo Starting Scraper Server... && npm run dev"
timeout /t 3 /nobreak >nul

start "Frontend (Port 3000)" cmd /k "cd /d D:\nghiencuukhoahoc\NCKH(1)\NCKH && echo Starting Frontend... && npm run dev"

echo.
echo ========================================
echo    ĐÃ KHỞI ĐỘNG TẤT CẢ SERVICES
echo ========================================
echo.
echo Backend:   http://localhost:5000
echo Scraper:   http://localhost:3001
echo Frontend:  http://localhost:3000
echo.
echo Vui lòng đợi vài giây để các services khởi động...
echo.
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo Đã mở trình duyệt!
pause


