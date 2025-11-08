# Test Alerts Setup Script
# This script creates test alerts for the Alerts page

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Alerts Page Test Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check backend health
Write-Host "Step 1: Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -ErrorAction Stop
    Write-Host "✓ Backend is healthy and running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "`nPlease start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  ./mvnw spring-boot:run" -ForegroundColor White
    Write-Host "`nOr if backend is running but crashed:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  ./mvnw clean spring-boot:run" -ForegroundColor White
    exit 1
}

# Step 2: Check alerts endpoint
Write-Host "`nStep 2: Checking alerts endpoint..." -ForegroundColor Yellow
try {
    $existingAlerts = Invoke-RestMethod -Uri "http://localhost:8080/api/alerts" -ErrorAction Stop
    Write-Host "✓ Alerts endpoint is working" -ForegroundColor Green
    Write-Host "  Current alerts: $($existingAlerts.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Alerts endpoint failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nThe backend needs to be restarted to load AlertController:" -ForegroundColor Yellow
    Write-Host "  1. Stop the backend (Ctrl+C)" -ForegroundColor White
    Write-Host "  2. cd backend" -ForegroundColor White
    Write-Host "  3. ./mvnw clean spring-boot:run" -ForegroundColor White
    exit 1
}

# Step 3: Create test alerts
Write-Host "`nStep 3: Creating test alerts..." -ForegroundColor Yellow

# Alert 1: Bad pH (Critical)
Write-Host "  Creating alert 1: Bad pH (Critical)..." -ForegroundColor Gray
$body1 = @{
    deviceId = "test-device-alerts"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{ lat = 26.91; lon = 75.78 }
    sensors = @{
        pH = 4.2
        turbidity_NTU = 3
        TDS_ppm = 450
        DO_mgL = 7.5
        temperature_C = 26.0
    }
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
        -ContentType "application/json" -Body $body1 -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Created: Bad pH alert (pH = 4.2)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to create alert 1" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Alert 2: High Turbidity (High)
Write-Host "  Creating alert 2: High Turbidity (High)..." -ForegroundColor Gray
$body2 = @{
    deviceId = "test-device-alerts"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{ lat = 26.91; lon = 75.78 }
    sensors = @{
        pH = 7.2
        turbidity_NTU = 15
        TDS_ppm = 450
        DO_mgL = 7.5
        temperature_C = 26.0
    }
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
        -ContentType "application/json" -Body $body2 -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Created: High Turbidity alert (15 NTU)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to create alert 2" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Alert 3: Very High pH (Critical)
Write-Host "  Creating alert 3: Very High pH (Critical)..." -ForegroundColor Gray
$body3 = @{
    deviceId = "test-device-alerts"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{ lat = 26.91; lon = 75.78 }
    sensors = @{
        pH = 10.5
        turbidity_NTU = 3
        TDS_ppm = 450
        DO_mgL = 7.5
        temperature_C = 26.0
    }
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
        -ContentType "application/json" -Body $body3 -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Created: Very High pH alert (pH = 10.5)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to create alert 3" -ForegroundColor Red
}

# Step 4: Wait and check results
Write-Host "`nStep 4: Verifying alerts were created..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $alerts = Invoke-RestMethod -Uri "http://localhost:8080/api/alerts" -ErrorAction Stop
    Write-Host "✓ Total alerts in system: $($alerts.Count)" -ForegroundColor Green
    
    $activeAlerts = $alerts | Where-Object { $_.status -eq "ACTIVE" }
    Write-Host "  Active alerts: $($activeAlerts.Count)" -ForegroundColor Gray
    
    $criticalAlerts = $alerts | Where-Object { $_.severity -eq "CRITICAL" }
    Write-Host "  Critical alerts: $($criticalAlerts.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to verify alerts" -ForegroundColor Red
}

# Step 5: Show statistics
Write-Host "`nStep 5: Alert Statistics:" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8080/api/alerts/statistics" -ErrorAction Stop
    Write-Host "  Total: $($stats.total)" -ForegroundColor White
    Write-Host "  Active: $($stats.active)" -ForegroundColor White
    Write-Host "  Acknowledged: $($stats.acknowledged)" -ForegroundColor White
    Write-Host "  Resolved: $($stats.resolved)" -ForegroundColor White
    Write-Host "  Critical: $($stats.critical)" -ForegroundColor White
    Write-Host "  High: $($stats.high)" -ForegroundColor White
    Write-Host "  Medium: $($stats.medium)" -ForegroundColor White
    Write-Host "  Low: $($stats.low)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed to get statistics" -ForegroundColor Red
}

# Final message
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Open browser: http://localhost:3000/alerts" -ForegroundColor White
Write-Host "  2. You should see the test alerts" -ForegroundColor White
Write-Host "  3. Try filtering by status/severity" -ForegroundColor White
Write-Host "  4. Try acknowledging or resolving alerts" -ForegroundColor White
Write-Host "`nIf alerts don't show:" -ForegroundColor Yellow
Write-Host "  - Refresh the page (F5)" -ForegroundColor White
Write-Host "  - Check browser console (F12)" -ForegroundColor White
Write-Host "  - Verify backend is running" -ForegroundColor White
Write-Host ""
