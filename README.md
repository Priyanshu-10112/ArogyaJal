# ArogyaJal - Water Quality Monitoring System

## Overview
Real-time water quality monitoring system with IoT integration, ML-powered predictions, and automatic alert generation.

## System Architecture

```
IoT Devices → Backend (Spring Boot) → Firebase Firestore → Frontend (React)
                  ↓
            ML Service (Flask)
```

## Features

### 🎯 Core USP: ML-Powered Water Quality Prediction
- **Random Forest ML model** trained on real water quality data
- **Scientific WQI scores (0-100)** for accurate assessment
- **Complex parameter analysis** beyond simple thresholds
- **Continuous learning** from collected data

### Additional Features
- ✅ Real-time water quality monitoring
- ✅ IoT device integration (ESP32, Arduino, Raspberry Pi)
- ✅ Automatic alert generation
- ✅ Multi-device support
- ✅ Trend analysis with charts
- ✅ Geographic distribution
- ✅ Battery monitoring

## Quick Start

### 1. Backend Setup
```bash
cd backend
mvn spring-boot:run
```

### 2. Frontend Setup
```bash
cd DashBoard_Frontend
npm install
npm start
```

### 3. ML Service (REQUIRED - USP)
```bash
cd ML
python api.py
# Or use: python start_ml_service.py
```
**Note:** ML service is the core feature of ArogyaJal and should always be running in production.

### 4. Generate Demo Data
```bash
.\send-20-readings.ps1
```

## API Endpoints

### Sensor Data
- `POST /api/sensor-data` - Submit sensor data
- `GET /api/sensor-data/latest` - Get latest reading
- `GET /api/sensor-data/device/{deviceId}` - Get device data
- `GET /api/sensor-data/all-readings` - Get all readings
- `GET /api/sensor-data/device-ids` - List all devices

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/{id}` - Get specific alert
- `POST /api/alerts` - Create alert (manual)
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

## IoT Integration

### JSON Format
```json
{
  "deviceId": "sensor-001",
  "location": {"lat": 28.6139, "lon": 77.2090},
  "sensors": {
    "PH": 7.2,
    "Temperature_C": 22.5,
    "TDS_ppm": 95,
    "DO_mgL": 9.2,
    "Turbidity_NTU": 0.5
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.5,
    "charging": false
  }
}
```

### ESP32 Example
```cpp
#include <HTTPClient.h>
#include <ArduinoJson.h>

HTTPClient http;
http.begin("http://your-server:8080/api/sensor-data");
http.addHeader("Content-Type", "application/json");
http.POST(jsonString);
```

### Python Example
```python
import requests

data = {
    "deviceId": "pi-sensor-001",
    "location": {"lat": 28.6139, "lon": 77.2090},
    "sensors": {
        "PH": 7.2,
        "Temperature_C": 22.5,
        "TDS_ppm": 95,
        "DO_mgL": 9.2,
        "Turbidity_NTU": 0.5
    }
}

requests.post("http://your-server:8080/api/sensor-data", json=data)
```

## Water Quality Thresholds

| Parameter | Excellent | Good | Moderate | Poor | Critical |
|-----------|-----------|------|----------|------|----------|
| pH | 6.5-7.5 | 6.0-8.0 | 5.5-8.5 | 5.0-9.0 | <5.0 or >9.0 |
| Temperature | <25°C | <28°C | <30°C | <32°C | >32°C |
| TDS | <150 ppm | <300 ppm | <500 ppm | <750 ppm | >750 ppm |
| DO | >8 mg/L | >7 mg/L | >6 mg/L | >5 mg/L | <5 mg/L |
| Turbidity | <1 NTU | <3 NTU | <5 NTU | <7 NTU | >7 NTU |

## Automatic Alerts

Alerts are automatically generated when:
- pH < 6.5 or > 8.5
- Temperature > 30°C
- TDS > 500 ppm
- DO < 5 mg/L
- Turbidity > 5 NTU

Alert Severity:
- **CRITICAL**: Immediate action required
- **HIGH**: Urgent attention needed
- **MEDIUM**: Monitor closely
- **LOW**: Informational

## Configuration

### Backend (application.properties)
```properties
server.port=8080
firebase.credentials.path=path/to/serviceAccountKey.json
ml.service.url=http://localhost:5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Database Structure

### Collections

#### sensor_readings
```
{
  id: string
  sensorId: string
  timestamp: Timestamp
  location: string
  ph: number
  temperature: number
  turbidity: number
  dissolvedOxygen: number
  totalDissolvedSolids: number
  qualityStatus: string
}
```

#### alerts
```
{
  id: string
  alertType: string
  severity: string
  deviceId: string
  message: string
  status: string
  triggeredAt: Timestamp
}
```

## Deployment

### Production Checklist
- [ ] Configure production URLs
- [ ] Set up SSL/TLS certificates
- [ ] Configure Firebase security rules
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Enable authentication
- [ ] Set up rate limiting

### Docker Deployment
```bash
# Backend
docker build -t arogyajal-backend ./backend
docker run -p 8080:8080 arogyajal-backend

# Frontend
docker build -t arogyajal-frontend ./DashBoard_Frontend
docker run -p 3000:3000 arogyajal-frontend
```

## Monitoring

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### System Status
```bash
curl http://localhost:8080/api/sensor-data/statistics
```

## Troubleshooting

### Backend not starting
- Check Firebase credentials
- Verify port 8080 is available
- Check Java version (17+)

### No data showing
- Verify backend is running
- Check Firebase connection
- Verify API URL in frontend

### Alerts not generating
- Restart backend to load AlertService
- Check sensor values exceed thresholds
- Verify Firebase write permissions

## Support

For issues or questions:
1. Check logs: `backend/logs/arogyajal.log`
2. Verify configuration files
3. Test with demo data: `.\send-20-readings.ps1`

## License
MIT License

## Contributors
SIH 2024 Team - ArogyaJal
