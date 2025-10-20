# IoT → Backend → ML → Dashboard Integration Guide

Complete guide to run the integrated ArogyaJal system with ML predictions.

## Architecture Overview

```
[IoT Device/Sensor]
        ↓ POST /api/sensor-data
[Spring Boot Backend :8080]
        ↓ Calls /predict
[ML Service (Flask) :5000]
        ↓ Returns WQI
[Firestore Database]
        ↓ WebSocket
[React Dashboard :3000]
```

## Quick Start

### Step 1: Install ML Dependencies

```bash
cd SihProject/ML
pip install -r requirements.txt
```

### Step 2: Start ML Service

```bash
# From SihProject directory
python ML/start_ml_service.py
```

Expected output:
```
==================================================
🚀 Starting ML Prediction Service
==================================================

Endpoints:
  - Health Check: http://localhost:5000/health
  - Predict WQI:  http://localhost:5000/predict
  ...
✅ Model loaded successfully
```

**Keep this terminal running!**

### Step 3: Start Backend

Open a **new terminal**:

```bash
cd SihProject/backend
./mvnw spring-boot:run
```

Or if using Maven directly:
```bash
mvn spring-boot:run
```

Expected output:
```
Started ArogyajalBackendApplication in X seconds
```

**Keep this terminal running!**

### Step 4: Start Dashboard (Optional)

Open a **new terminal**:

```bash
cd SihProject/DashBoard_Frontend
npm install
npm start
```

Dashboard will open at `http://localhost:3000`

## Testing the Integration

### Test 1: Verify ML Service

```bash
curl http://localhost:5000/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "ML Prediction Service",
  "model_loaded": true
}
```

### Test 2: Test ML Prediction Directly

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "ph": 7.2,
    "temperature": 25.5,
    "tds": 350,
    "dissolved_oxygen": 6.8,
    "turbidity": 2.1
  }'
```

Expected:
```json
{
  "wqi": 84.95,
  "quality_status": "Good",
  "input_data": {...},
  "timestamp": "..."
}
```

### Test 3: Send IoT Data to Backend

```bash
curl -X POST https://5d2ba242b144.ngrok-free.app/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "2025-10-19T22:30:00Z",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 6.8,
      "turbidity_NTU": 40,
      "TDS_ppm": 580,
      "DO_mgL": 6.1,
      "temperature_C": 27.5
    },
    "battery": {"voltage": 6.9}
  }'
```

Expected:
```json
{
  "status": "success",
  "message": "Data received and processed successfully",
  "deviceId": "test-device",
  "timestamp": "..."
}
```

### Test 4: Check Backend Logs

Look for ML prediction logs in the backend terminal:
```
ML Prediction - WQI: 75.23, Status: Good
```

### Test 5: Verify Data in Firestore

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check `sensorReadings` collection
4. Verify `qualityStatus` field is populated (e.g., "Good", "Excellent")

## Complete Data Flow Example

### 1. IoT Device Sends Data

```json
POST /api/sensor-data
{
  "deviceId": "mayankkk",
  "sensors": {
    "pH": 7.2,
    "temperature_C": 25.5,
    "TDS_ppm": 350,
    "DO_mgL": 6.8,
    "turbidity_NTU": 2.1
  }
}
```

### 2. Backend Receives & Processes

```java
SensorController → SensorService.processAndSaveSensorData()
```

### 3. Backend Calls ML Service

```java
MLPredictionService.predictWQI(7.2, 25.5, 350, 6.8, 2.1)
  → HTTP POST to http://localhost:5000/predict
```

### 4. ML Service Returns Prediction

```json
{
  "wqi": 84.95,
  "quality_status": "Good"
}
```

### 5. Backend Stores in Firestore

```java
SensorReading {
  sensorId: "mayankkk",
  ph: 7.2,
  temperature: 25.5,
  qualityStatus: "Good",  ← ML Prediction
  ...
}
```

### 6. WebSocket Broadcasts to Dashboard

```javascript
// Dashboard receives real-time update
{
  deviceId: "mayankkk",
  wqi: 84.95,
  status: "Good"
}
```

## Troubleshooting

### ML Service Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`

**Solution**:
```bash
pip install -r ML/requirements.txt
```

---

**Problem**: ML service not responding

**Solution**:
1. Check if port 5000 is in use: `netstat -ano | findstr :5000`
2. Kill the process or change port
3. Restart ML service

---

### Backend Issues

**Problem**: Backend can't connect to ML service

**Solution**:
1. Verify ML service is running: `curl http://localhost:5000/health`
2. Check `application.properties`: `ml.service.url=http://localhost:5000`
3. Check firewall settings

---

**Problem**: `MLPredictionService` not found

**Solution**:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

---

### Integration Issues

**Problem**: Data saved but no WQI prediction

**Solution**:
1. Check backend logs for ML service errors
2. Verify ML service is running
3. Check if all 5 sensor parameters are provided

---

**Problem**: Quality status shows "UNKNOWN"

**Solution**:
- ML service might be down
- Check backend logs for error messages
- Verify sensor data has all required fields

## Running in Production

### 1. Deploy ML Service

```bash
# Using Docker
docker build -t ml-service ./ML
docker run -p 5000:5000 ml-service
```

### 2. Update Backend Configuration

```properties
# application.properties
ml.service.url=http://ml-service:5000
```

### 3. Use ngrok for External Access

```bash
# For ML service
ngrok http 5000

# Update backend config with ngrok URL
ml.service.url=https://your-ngrok-url.ngrok-free.app
```

## Monitoring

### Check ML Service Health

```bash
curl http://localhost:5000/health
```

### Check Backend Health

```bash
curl http://localhost:8080/api/health
```

### View Logs

**ML Service**: Check terminal output

**Backend**: 
```bash
tail -f backend/logs/arogyajal-backend.log
```

## Performance Tips

1. **ML Service**: 
   - Use production WSGI server (gunicorn)
   - Enable caching for model loading
   - Scale horizontally for high load

2. **Backend**:
   - Implement retry logic for ML service calls
   - Add circuit breaker pattern
   - Cache predictions for similar inputs

3. **Database**:
   - Index frequently queried fields
   - Use batch writes for multiple readings

## Next Steps

- [ ] Add ML prediction confidence scores
- [ ] Implement alert thresholds based on WQI
- [ ] Add historical trend analysis
- [ ] Create prediction visualization in dashboard
- [ ] Add model retraining pipeline

## Support

For issues:
1. Check logs (ML service console + backend logs)
2. Verify all services are running
3. Test each component individually
4. Check network connectivity between services
