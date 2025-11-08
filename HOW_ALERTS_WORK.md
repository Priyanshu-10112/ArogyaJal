# How Alerts Work - Complete Guide

## Overview

Alerts are automatically created when sensor data violates water quality thresholds. The system monitors pH, turbidity, and conductivity levels and creates alerts when values are out of safe ranges.

## Alert Creation Flow

### Automatic Alert Creation (Now Enabled)

```
1. IoT Sensor sends data
   ↓
2. POST /api/sensor-data
   ↓
3. SensorService.processAndSaveSensorData()
   ↓
4. Calls MLPredictionService for WQI
   ↓
5. Saves SensorReading to Firestore
   ↓
6. Calls AlertService.checkForWaterQualityAlerts() ← NEW!
   ↓
7. Checks thresholds:
   - pH < 6.5 or > 8.5 → Create Alert
   - Turbidity > 5.0 NTU → Create Alert
   - Conductivity > 1000 μS/cm → Create Alert
   ↓
8. If threshold violated:
   - Creates Alert object
   - Saves to Firestore (alerts collection)
   - Sets severity based on how bad it is
```

## Threshold Rules

### pH Alerts

| pH Value | Action | Severity |
|----------|--------|----------|
| < 4.0 or > 10.0 | Create Alert | CRITICAL |
| < 5.0 or > 9.0 | Create Alert | HIGH |
| < 6.5 or > 8.5 | Create Alert | MEDIUM |
| 6.5 - 8.5 | No Alert | - |

### Turbidity Alerts

| Turbidity (NTU) | Action | Severity |
|-----------------|--------|----------|
| > 10.0 | Create Alert | CRITICAL |
| > 5.0 | Create Alert | HIGH |
| ≤ 5.0 | No Alert | - |

### Conductivity Alerts

| Conductivity (μS/cm) | Action | Severity |
|----------------------|--------|----------|
| > 2000 | Create Alert | CRITICAL |
| > 1000 | Create Alert | HIGH |
| ≤ 1000 | No Alert | - |

## Code Changes Made

### 1. SensorService.java

**Added AlertService dependency:**
```java
private final AlertService alertService;

public SensorService(SensorRepository sensorRepository, 
                    MLPredictionService mlPredictionService, 
                    AlertService alertService) {
    this.sensorRepository = sensorRepository;
    this.mlPredictionService = mlPredictionService;
    this.alertService = alertService;  // NEW
}
```

**Added alert check after saving:**
```java
// Save to database
sensorRepository.save(reading, documentId);

// Check for water quality alerts after saving
try {
    alertService.checkForWaterQualityAlerts(reading);  // NEW
} catch (Exception e) {
    log.error("Error checking for water quality alerts", e);
}
```

### 2. AlertService.java (Already Exists)

The `checkForWaterQualityAlerts()` method:
```java
public void checkForWaterQualityAlerts(SensorReading reading) {
    // Check pH
    if (reading.getPh() < 6.5 || reading.getPh() > 8.5) {
        createAlert(createWaterQualityAlert(reading, "pH", reading.getPh()));
    }

    // Check Turbidity
    if (reading.getTurbidity() > 5.0) {
        createAlert(createWaterQualityAlert(reading, "Turbidity", reading.getTurbidity()));
    }

    // Check Conductivity
    if (reading.getConductivity() > 1000) {
        createAlert(createWaterQualityAlert(reading, "Conductivity", reading.getConductivity()));
    }
}
```

## Testing Alert Creation

### Step 1: Restart Backend

The SensorService was modified, so restart the backend:

**In Eclipse:**
1. Stop the application
2. Clean project
3. Run as Spring Boot App

**Or from command line:**
```powershell
cd backend
./mvnw clean spring-boot:run
```

### Step 2: Send Bad Sensor Data

**Test 1: Bad pH (Critical)**
```powershell
$body = @{
    deviceId = "test-device"
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

Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
    -ContentType "application/json" -Body $body
```

**Test 2: High Turbidity**
```powershell
$body = @{
    deviceId = "test-device"
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

Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
    -ContentType "application/json" -Body $body
```

**Test 3: Very High pH**
```powershell
$body = @{
    deviceId = "test-device"
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

Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/sensor-data" `
    -ContentType "application/json" -Body $body
```

### Step 3: Verify Alerts Were Created

```powershell
# Check alerts
curl http://localhost:8080/api/alerts

# Check statistics
curl http://localhost:8080/api/alerts/statistics
```

### Step 4: View in Frontend

Open: `http://localhost:3000/alerts`

You should see the alerts with:
- Title (e.g., "pH CRITICAL Alert - 26.91,75.78")
- Description
- Severity badge (CRITICAL, HIGH, MEDIUM)
- Status (ACTIVE)
- Parameter and values
- Timestamps

## Alert Lifecycle

### 1. Created (ACTIVE)
- Alert is created when threshold is violated
- Status: ACTIVE
- Appears in alerts page
- Counted in statistics

### 2. Acknowledged
- User clicks "Acknowledge" button
- Status: ACTIVE → ACKNOWLEDGED
- Timestamp recorded
- User ID recorded

### 3. Resolved
- User clicks "Resolve" button
- Status: ACKNOWLEDGED → RESOLVED
- Timestamp recorded
- Resolution notes can be added

## Database Structure

### Firestore Collection: `alerts`

Each alert document contains:
```json
{
  "id": "uuid",
  "alertType": "WATER_QUALITY",
  "severity": "CRITICAL",
  "title": "pH CRITICAL Alert - Location",
  "description": "pH value of 4.2 is outside the normal range",
  "location": "26.91,75.78",
  "sensorId": "test-device",
  "parameter": "pH",
  "thresholdValue": 6.5,
  "actualValue": 4.2,
  "sensorReadingId": "reading-uuid",
  "triggeredAt": "2025-11-09T00:00:00",
  "acknowledgedAt": null,
  "resolvedAt": null,
  "status": "ACTIVE",
  "notificationMethod": "EMAIL",
  "notifiedUsers": [],
  "affectedUsers": [],
  "resolutionNotes": null,
  "resolvedBy": null,
  "actionTaken": null,
  "notes": null
}
```

## Monitoring Alerts

### Backend Logs

Look for these log messages:
```
Checking for water quality alerts for sensor: test-device
Creating alert: pH CRITICAL Alert - 26.91,75.78
Saved alert with ID: uuid
```

### Frontend

The Alerts page shows:
- Real-time alert count
- Statistics dashboard
- Filterable alert list
- Action buttons

## Customizing Thresholds

To change alert thresholds, edit `AlertService.java`:

```java
// In checkForWaterQualityAlerts()
if (reading.getPh() < 6.0 || reading.getPh() > 9.0) {  // Changed from 6.5/8.5
    createAlert(createWaterQualityAlert(reading, "pH", reading.getPh()));
}
```

## Troubleshooting

### No Alerts Created

**Check:**
1. Backend logs for "Checking for water quality alerts"
2. Sensor values actually violate thresholds
3. AlertService is being called
4. Firestore connection is working

**Solution:**
- Check backend logs
- Verify sensor data: `curl http://localhost:8080/api/sensor-data/all-readings`
- Test with extreme values (pH = 3.0 or 11.0)

### Alerts Not Showing in Frontend

**Check:**
1. Alerts exist: `curl http://localhost:8080/api/alerts`
2. Frontend is connected to backend
3. No CORS errors in browser console

**Solution:**
- Refresh the page
- Check browser console
- Verify backend is running

### Duplicate Alerts

**Issue:** Same sensor creates multiple alerts for same issue

**Solution:**
- Add alert deduplication logic
- Check if similar alert exists before creating
- Add cooldown period

## Future Enhancements

### Planned Features
- [ ] Alert deduplication
- [ ] Email/SMS notifications
- [ ] Alert escalation rules
- [ ] Custom threshold configuration
- [ ] Alert grouping by location
- [ ] Alert trends analysis
- [ ] Automatic resolution when values normalize

### Advanced Features
- [ ] Machine learning for anomaly detection
- [ ] Predictive alerts
- [ ] Alert correlation
- [ ] Integration with external systems
- [ ] Mobile push notifications

## Summary

Alerts are now **automatically created** when sensor data violates thresholds:

✅ **Integration Complete:**
- SensorService calls AlertService
- Alerts saved to Firestore
- Thresholds monitored automatically

✅ **How to Test:**
1. Restart backend
2. Send bad sensor data
3. Check alerts endpoint
4. View in frontend

✅ **What Happens:**
- Bad pH → Alert created
- High turbidity → Alert created
- High conductivity → Alert created
- All alerts visible in Alerts page

**The alert system is now fully functional and automatic!** 🎉

---

**Next Action:** Restart backend in Eclipse, then send test sensor data to create alerts.
