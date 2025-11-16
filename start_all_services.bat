@echo off
echo ============================================
echo Starting ArogyaJal Services
echo ============================================

echo.
echo Starting Python ML Service...
start "ML Service" cmd /k "cd ML && python start_ml_service.py"

echo Waiting 5 seconds for ML service to start...
timeout /t 5 /nobreak

echo.
echo Starting Java Backend...
start "Java Backend" cmd /k "cd backend && mvn spring-boot:run"

echo.
echo ============================================
echo Both services are starting!
echo ============================================
echo ML Service: http://localhost:5000
echo Java Backend: http://localhost:8080
echo ============================================
echo.
echo Press any key to exit (services will keep running)...
pause
