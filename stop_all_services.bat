@echo off
echo ============================================
echo Stopping ArogyaJal Services
echo ============================================

echo.
echo Stopping Python ML Service (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a 2>nul

echo.
echo Stopping Java Backend (Port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do taskkill /F /PID %%a 2>nul

echo.
echo ============================================
echo All services stopped!
echo ============================================
pause
