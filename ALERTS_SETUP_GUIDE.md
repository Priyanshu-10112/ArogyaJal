# Alerts Page Setup Guide

## Issue: Backend Needs Restart

The AlertController was just added, so the backend needs to be recompiled and restarted.

## Step 1: Restart Backend

### Option A: If backend is running in terminal

1. Press `Ctrl+C` to stop the backend
2. Restart it:
```bash
cd backend
./mvnw spring-boot:run
```

### Option B: If using IDE

1. Stop the running application
2. Clean and rebuild:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Option C: Quick restart

```bash
cd backend
./mvnw clean spring-boot:run
```

## Step 2: Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:8080/api/health

# Should return: {"status":"healthy"}
```

## Step 3: Check Alerts Endpoint

```bash
# Check if alerts endpoint works
curl http://localhost:8080/api/alerts

# Should return: [] (empty array if no alerts)
```

## Step 4: Create Test Alerts

### Method 1: Send Bad Sensor Data (Automatic Alert Creation)

The backend automatically creates alerts when water quality parameters are out of range.

```bash
# Send data with bad pH (< 6.5 or > 8.5)
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 4.5,
      "turbidity_NTU": 25,
      "TDS_ppm": 450,
      "DO_mgL": 7.5,
      "temperature_C": 26.0
    }
  }'

# Send data with high turbidity (> 5 NTU)
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 7.2,
      "turbidity_NTU": 50,
      "TDS_ppm": 450,
      "DO_mgL": 7.5,
      "temperature_C": 26.0
    }
  }'

# Send data with high conductivity (> 1000 μS/cm)
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 7.2,
      "turbidity_NTU": 25,
      "TDS_ppm": 450,
      "DO_mgL": 7.5,
      "temperature_C": 26.0
    }
  }'
```

**Note:** The backend checks these conditions in `AlertService.checkForWaterQualityAlerts()`:
- pH < 6.5 or pH > 8.5 → Creates alert
- Turbidity > 5.0 NTU → Creates alert
- Conductivity > 1000 μS/cm → Creates alert

### Method 2: Create Alert Directly (Manual)

```bash
curl -X POST http://localhost:8080/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alertType": "WATER_QUALITY",
    "severity": "HIGH",
    "title": "High pH Alert - Test Location",
    "description": "pH value of 9.2 is outside the normal range",
    "location": "26.91,75.78",
    "sensorId": "test-device",
    "parameter": "pH",
    "actualValue": 9.2,
    "thresholdValue": 8.5,
    "status": "ACTIVE"
  }'
```

## Step 5: Verify Alerts Were Created

```bash
# Get all alerts
curl http://localhost:8080/api/alerts

# Get active alerts only
curl http://localhost:8080/api/alerts/active

# Get alert statistics
curl http://localhost:8080/api/alerts/statistics
```

## Step 6: View in Frontend

1. Open browser: `http://localhost:3000/alerts`
2. You should see the alerts you created
3. Try filtering by status/severity
4. Try acknowledging or resolving an alert

## Troubleshooting

### Backend Won't Start

**Error:** Port 8080 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Then restart backend
cd backend
./mvnw spring-boot:run
```

### Compilation Errors

**Error:** Cannot find symbol AlertController

**Solution:**
```bash
cd backend
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

### No Alerts Created from Sensor Data

**Check:**
1. Backend logs for errors
2. Sensor data was saved: `curl http://localhost:8080/api/sensor-data/all-readings`
3. AlertService is being called

**Solution:**
- Check backend logs: Look for "Checking for water quality alerts"
- Verify sensor values trigger thresholds
- Check Firestore for alerts collection

### Frontend Shows "Failed to load alerts"

**Check:**
1. Backend is running: `curl http://localhost:8080/api/health`
2. Alerts endpoint works: `curl http://localhost:8080/api/alerts`
3. CORS is enabled (already added in AlertController)
4. Browser console for errors

**Solution:**
- Restart backend
- Clear browser cache
- Check network tab in browser dev tools

## Quick Test Script

Save this as `test-alerts.sh` (Linux/Mac) or `test-alerts.ps1` (Windows):

### Windows PowerShell (test-alerts.ps1)

```powershell
# Test alerts setup

Write-Host "1. Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health"
    Write-Host "✓ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "Please start backend: cd backend && ./mvnw spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n2. Creating test alerts..." -ForegroundColor Yellow

# Bad pH
$body1 = @{
    deviceId = "test-device"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{ lat = 26.91; lon = 75.78 }
    sensors = @{
        pH = 4.5
        turbidity_NTU = 25
        TDS_ppm = 450
        DO_mgL = 7.5
        temperature_C = 26.0
    }
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
    -ContentType "application/json" -Body $body1
Write-Host "✓ Created bad pH alert" -ForegroundColor Green

# High turbidity
$body2 = @{
    deviceId = "test-device"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    location = @{ lat = 26.91; lon = 75.78 }
    sensors = @{
        pH = 7.2
        turbidity_NTU = 50
        TDS_ppm = 450
        DO_mgL = 7.5
        temperature_C = 26.0
    }
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
    -ContentType "application/json" -Body $body2
Write-Host "✓ Created high turbidity alert" -ForegroundColor Green

Write-Host "`n3. Checking alerts..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$alerts = Invoke-RestMethod -Uri "http://localhost:8080/api/alerts"
Write-Host "✓ Found $($alerts.Count) alerts" -ForegroundColor Green

Write-Host "`n4. Alert statistics:" -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:8080/api/alerts/statistics"
$stats | ConvertTo-Json

Write-Host "`nDone! Open http://localhost:3000/alerts to view" -ForegroundColor Green
```

### Run the test script:

```powershell
# Windows
.\test-alerts.ps1

# Or manually:
cd backend
./mvnw spring-boot:run

# Wait for backend to start, then in another terminal:
cd DashBoard_Frontend
npm start
```

## Expected Result

After following these steps, you should see:

1. **Backend running** on port 8080
2. **Frontend running** on port 3000
3. **Alerts page** showing test alerts
4. **Statistics** showing alert counts
5. **Filters** working correctly
6. **Actions** (Acknowledge/Resolve) working

## Next Steps

Once alerts are showing:

1. **Test filtering** - Try different status/severity filters
2. **Test actions** - Acknowledge and resolve alerts
3. **Test auto-refresh** - Enable auto-refresh checkbox
4. **Test search** - Search for specific alerts
5. **Create more alerts** - Send more bad sensor data

## Summary

The alerts system is fully functional, but requires:
1. ✅ Backend restart (to load new AlertController)
2. ✅ Test data (to create alerts)
3. ✅ Frontend refresh (to see alerts)

Follow the steps above and you'll have a working alerts system!
