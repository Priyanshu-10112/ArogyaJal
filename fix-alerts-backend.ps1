# Quick Fix for Alerts Backend
# This script helps restart the backend to load AlertController

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Alerts Backend Quick Fix" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "The AlertController was just created and needs to be compiled." -ForegroundColor Yellow
Write-Host "The backend must be restarted to load the new controller.`n" -ForegroundColor Yellow

Write-Host "Current status:" -ForegroundColor White
Write-Host "  ✓ AlertController.java exists" -ForegroundColor Green
Write-Host "  ✗ Backend hasn't loaded it yet" -ForegroundColor Red

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Option 1: Restart Backend (Recommended)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "If backend is running in a terminal:" -ForegroundColor Yellow
Write-Host "  1. Press Ctrl+C to stop it" -ForegroundColor White
Write-Host "  2. Run these commands:" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Gray
Write-Host "     ./mvnw clean spring-boot:run" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Option 2: Compile and Run" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$response = Read-Host "Do you want me to compile and run the backend now? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`nCompiling backend..." -ForegroundColor Yellow
    
    Push-Location backend
    
    try {
        Write-Host "Running: ./mvnw clean install -DskipTests" -ForegroundColor Gray
        & ./mvnw clean install -DskipTests
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Compilation successful!" -ForegroundColor Green
            Write-Host "`nStarting backend..." -ForegroundColor Yellow
            Write-Host "Running: ./mvnw spring-boot:run" -ForegroundColor Gray
            Write-Host "`nNote: This will start the backend in this window." -ForegroundColor Yellow
            Write-Host "Press Ctrl+C to stop it when needed.`n" -ForegroundColor Yellow
            
            & ./mvnw spring-boot:run
        } else {
            Write-Host "`n✗ Compilation failed!" -ForegroundColor Red
            Write-Host "Please check the error messages above." -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`nManual steps:" -ForegroundColor Yellow
    Write-Host "  1. Open a terminal" -ForegroundColor White
    Write-Host "  2. cd backend" -ForegroundColor White
    Write-Host "  3. ./mvnw clean spring-boot:run" -ForegroundColor White
    Write-Host "  4. Wait for 'Started ArogyajalBackendApplication'" -ForegroundColor White
    Write-Host "  5. Run: .\test-alerts.ps1" -ForegroundColor White
    Write-Host "  6. Open: http://localhost:3000/alerts" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  After Backend Starts" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Run this command to create test alerts:" -ForegroundColor Yellow
Write-Host "  .\test-alerts.ps1" -ForegroundColor White

Write-Host "`nThen open the alerts page:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/alerts" -ForegroundColor White

Write-Host ""
