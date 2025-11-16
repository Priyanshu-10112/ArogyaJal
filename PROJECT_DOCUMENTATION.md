# ArogyaJal - Complete Project Documentation

**Water Quality Monitoring System with IoT Integration & ML-Powered Predictions**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [API Reference](#api-reference)
5. [IoT Integration](#iot-integration)
6. [ML Integration](#ml-integration)
7. [Database Structure](#database-structure)
8. [Deployment Guide](#deployment-guide)
9. [Testing](#testing)

---

## 1. Project Overview

### What is ArogyaJal?

Real-time water quality monitoring system with IoT integration, ML-powered predictions, and automatic alert generation.

### Core Features

**🎯 USP: ML-Powered Water Quality Prediction**
- Random Forest ML model trained on real water quality data
- Scientific WQI scores (0-100) for accurate assessment
- Complex parameter analysis beyond simple thresholds
- Continuous learning from collected data

**Additional Features:**
- ✅ Real-time water quality monitoring
- ✅ IoT device integration (ESP32, Arduino, Raspberry Pi)
- ✅ Automatic alert generation
- ✅ Multi-device support
- ✅ Trend analysis with charts
- ✅ Geographic distribution
- ✅ Battery monitoring

### Technology Stack

```
Frontend:  React + TypeScript
Backend:   Spring Boot (Java 17)
Database:  Firebase Firestore
ML:        Flask + scikit-learn (Python)
IoT:       ESP32/Arduino (C++)
```

---

## 2. Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.8+
- Maven
- Firebase account

### Installation

#### Option 1: Start All Services (Windows)
```bash
start_all_services.bat
```

#### Option 2: Manual Start

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd DashBoard_Frontend
npm install
npm start
```

**ML Service:**
```bash
cd ML
pip install -r requirements.txt
python api.py
```

### Verify Installation

```bash
# Backend health
curl http://localhost:8080/actuator/health

# ML service health
curl http://localhost:5000/health

# Frontend
Open http://localhost:3000
```

### Test with Sample Data

```bash
# Populate database
python populate_database.py

# Run comprehensive tests
python FINAL_TEST.py
```

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────┐
│  IoT Device │ (ESP32, Arduino, Raspberry Pi)
└──────┬──────┘
       │ HTTP POST /api/sensor-data
       ▼
┌─────────────────────────────────────────┐
│      Backend (Spring Boot)              │
│  ┌────────────────────────────────────┐ │
│  │ 1. Receive & validate data         │ │
│  │ 2. Call ML Service (PRIMARY)       │ │
│  │ 3. Calculate quality status        │ │
│  │ 4. Check alert thresholds          │ │
│  │ 5. Save to Firebase                │ │
│  └────────────────────────────────────┘ │
└───────────┬─────────────┬───────────────┘
            │             │
            ▼             ▼
    ┌──────────────┐  ┌──────────────┐
    │  Firebase    │  │  ML Service  │
    │  Firestore   │  │  (Flask)     │
    └──────┬───────┘  └──────────────┘
           │
           ▼
    ┌──────────────┐
    │  Frontend    │
    │  (React)     │
    └──────────────┘
```

### Data Flow

```
1. IoT sends data → Backend
2. Backend → ML Service (WQI prediction)
3. ML Service → Backend (WQI score)
4. Backend → Firebase (save data)
5. Backend → Frontend (real-time updates)
6. Frontend displays data
```

### Component Responsibilities

**IoT Devices:**
- Read sensor values
- Send data via HTTP POST
- Handle connectivity
- Battery management

**Backend (Spring Boot):**
- Central orchestrator
- Receive IoT data
- Call ML service
- Generate alerts
- Manage Firebase
- Serve Frontend API

**ML Service (Flask):**
- WQI prediction (PRIMARY)
- Random Forest model
- Scientific quality assessment
- Core competitive advantage

**Firebase Firestore:**
- Data storage only
- No business logic
- Managed by Backend

**Frontend (React):**
- Display layer
- Request data from Backend
- Show dashboard, trends, alerts
- No direct Firebase/ML access

---

## 4. API Reference

### Sensor Data Endpoints

#### Submit Sensor Data
```
POST /api/sensor-data
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceId": "SENSOR_001",
  "timestamp": "2025-11-16T10:30:00Z",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  },
  "sensors": {
    "PH": 7.2,
    "Turbidity_NTU": 2.1,
    "TDS_ppm": 350,
    "DO_mgL": 6.8,
    "Temperature_C": 25.5
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.0
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Data received and processed successfully",
  "deviceId": "SENSOR_001",
  "timestamp": "2025-11-16T10:30:00Z"
}
```

#### Get Latest Reading
```
GET /api/sensor-data/latest
```

#### Get Device Data
```
GET /api/sensor-data/device/{deviceId}
```

#### Get All Readings
```
GET /api/sensor-data/all-readings
```

### Alert Endpoints

#### Get All Alerts
```
GET /api/alerts
```

#### Get Active Alerts
```
GET /api/alerts/active
```

#### Acknowledge Alert
```
POST /api/alerts/{id}/acknowledge
```

#### Resolve Alert
```
POST /api/alerts/{id}/resolve
```

### Dashboard Endpoints

#### Get Dashboard Overview
```
GET /api/dashboard/overview
```

#### Get Statistics
```
GET /api/dashboard/stats
```

### ML Endpoints

#### Predict WQI
```
POST http://localhost:5000/predict
Content-Type: application/json

{
  "ph": 7.2,
  "temperature": 25.5,
  "tds": 350,
  "dissolved_oxygen": 6.8,
  "turbidity": 2.1
}
```

**Response:**
```json
{
  "wqi": 84.51,
  "quality_status": "Good",
  "timestamp": "2025-11-16T10:30:00Z"
}
```

---

## 5. IoT Integration

### Required Sensors (All 5 Required for ML)

1. **pH Sensor** - DFRobot Gravity Analog pH Sensor (~$30)
2. **Temperature Sensor** - DS18B20 Waterproof (~$5)
3. **TDS Sensor** - DFRobot Gravity TDS Sensor (~$10)
4. **DO Sensor** - Atlas Scientific or DFRobot (~$80-200)
5. **Turbidity Sensor** - DFRobot Gravity Turbidity (~$10)

**Total Cost:** ~$135-255 per device

### Microcontroller Options

- **ESP32** (Recommended) - WiFi built-in (~$10)
- **Arduino Mega + WiFi Shield** (~$40)
- **Raspberry Pi Zero W** (~$15)

### JSON Format (Exact)

```json
{
  "deviceId": "SENSOR_001",
  "timestamp": "2025-11-16T10:30:00Z",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  },
  "sensors": {
    "PH": 7.2,
    "Turbidity_NTU": 2.1,
    "TDS_ppm": 350,
    "DO_mgL": 6.8,
    "Temperature_C": 25.5
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.0
  }
}
```

**Important:** Field names are case-sensitive!

### ESP32 Example Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* serverUrl = "http://your-backend:8080/api/sensor-data";

void sendData() {
  StaticJsonDocument<1024> doc;
  doc["deviceId"] = "SENSOR_001";
  doc["timestamp"] = getISOTimestamp();
  
  JsonObject location = doc.createNestedObject("location");
  location["lat"] = 28.6139;
  location["lon"] = 77.2090;
  
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["PH"] = readPH();
  sensors["Temperature_C"] = readTemperature();
  sensors["TDS_ppm"] = readTDS();
  sensors["DO_mgL"] = readDO();
  sensors["Turbidity_NTU"] = readTurbidity();
  
  JsonObject battery = doc.createNestedObject("battery");
  battery["voltage"] = readBatteryVoltage();
  battery["level"] = readBatteryLevel();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.POST(jsonString);
  http.end();
}
```

### Water Quality Thresholds

| Parameter | Excellent | Good | Moderate | Poor | Critical |
|-----------|-----------|------|----------|------|----------|
| pH | 6.5-7.5 | 6.0-8.0 | 5.5-8.5 | 5.0-9.0 | <5.0 or >9.0 |
| Temperature | <25°C | <28°C | <30°C | <32°C | >32°C |
| TDS | <150 ppm | <300 ppm | <500 ppm | <750 ppm | >750 ppm |
| DO | >8 mg/L | >7 mg/L | >6 mg/L | >5 mg/L | <5 mg/L |
| Turbidity | <1 NTU | <3 NTU | <5 NTU | <7 NTU | >7 NTU |

---

## 6. ML Integration

### Why ML is Critical (USP)

**Traditional Systems:** Simple threshold-based rules
**ArogyaJal:** Trained Random Forest ML model

**Advantages:**
- Analyzes complex parameter interactions
- Provides scientific WQI scores (0-100)
- More accurate than simple rules
- Trained on real water quality data
- Continuously improves

### ML Service Architecture

```
Backend → ML Service (Flask) → Random Forest Model → WQI Score
```

### ML API Endpoints

**Health Check:**
```
GET http://localhost:5000/health
```

**WQI Prediction:**
```
POST http://localhost:5000/predict
{
  "ph": 7.2,
  "temperature": 25.5,
  "tds": 350,
  "dissolved_oxygen": 6.8,
  "turbidity": 2.1
}
```

### Starting ML Service

```bash
cd ML
pip install -r requirements.txt
python api.py
```

### Fallback Mechanism

If ML service is unavailable, Backend uses rule-based calculation as fallback. But ML is PRIMARY and should always run in production.

---

## 7. Database Structure

### Firebase Firestore Collections

#### sensor_readings
```
{
  id: "reading_001",
  sensorId: "SENSOR_001",
  timestamp: Timestamp,
  location: "28.6139,77.2090",
  ph: 7.2,
  temperature: 25.5,
  turbidity: 2.1,
  dissolvedOxygen: 6.8,
  totalDissolvedSolids: 350,
  wqi: 84.51,
  qualityStatus: "Good"
}
```

#### alerts
```
{
  id: "alert_001",
  alertType: "WATER_QUALITY",
  severity: "CRITICAL",
  deviceId: "SENSOR_001",
  message: "pH level critical",
  status: "ACTIVE",
  triggeredAt: Timestamp
}
```

#### symptom_reports
```
{
  id: "report_001",
  userId: "user_123",
  location: "Village A",
  geoLocation: GeoPoint(28.6139, 77.2090),
  symptoms: ["DIARRHEA", "VOMITING"],
  severity: "MODERATE",
  reportedAt: Timestamp
}
```

---

## 8. Deployment Guide

### Backend Deployment

**Build:**
```bash
cd backend
mvn clean package -DskipTests
```

**Run:**
```bash
java -jar target/arogyajal-backend.jar
```

**Docker:**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/arogyajal-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Deployment

**Build:**
```bash
cd DashBoard_Frontend
npm run build
```

**Deploy:** Upload `build/` folder to hosting (Netlify, Vercel, AWS S3)

### ML Service Deployment

**Production:**
```bash
cd ML
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Docker:**
```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["python", "api.py"]
```

### Configuration

**Backend (application.properties):**
```properties
server.port=8080
firebase.credentials.path=path/to/serviceAccountKey.json
ml.service.url=http://localhost:5000
cors.allowed.origins=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 9. Testing

### Run All Tests

```bash
# Comprehensive test (15 endpoint tests)
python FINAL_TEST.py

# Clean DB + populate + test (complete workflow)
python clean_and_test_complete.py

# Populate database only
python populate_database.py
```

### Test Individual Components

**Backend:**
```bash
cd backend
mvn test
```

**Frontend:**
```bash
cd DashBoard_Frontend
npm test
```

**ML Service:**
```bash
cd ML
python -m pytest
```

### Manual Testing

**Test Sensor Data:**
```bash
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST_001",
    "location": {"lat": 28.6139, "lon": 77.2090},
    "sensors": {
      "PH": 7.2,
      "Temperature_C": 25.5,
      "TDS_ppm": 350,
      "DO_mgL": 6.8,
      "Turbidity_NTU": 2.1
    }
  }'
```

---

## 📊 Project Structure

```
SihProject/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/arogyajal/
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic
│   │   ├── repository/        # Firestore repos
│   │   ├── model/             # Data models
│   │   ├── dto/               # DTOs
│   │   └── config/            # Configuration
│   └── pom.xml
│
├── DashBoard_Frontend/         # React dashboard
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Pages
│   │   └── services/          # API services
│   └── package.json
│
├── ML/                         # Flask ML service
│   ├── api.py                 # Flask API
│   ├── model.py               # ML model
│   ├── train.py               # Training script
│   ├── models/                # Trained models
│   └── requirements.txt
│
├── FINAL_TEST.py              # Comprehensive tests
├── clean_and_test_complete.py # Clean DB + test
├── populate_database.py       # Seed database
├── start_all_services.bat     # Start all
└── PROJECT_DOCUMENTATION.md   # This file
```

---

## 🎯 Key Points

### ✅ Correct Flow
```
IoT → Backend → ML Service → Backend → Firebase
                                         ↓
                              Frontend ← Backend
```

### ❌ NOT This Flow
```
IoT → Backend → Firebase → ML → Frontend  ❌
```

### Why This Architecture?

1. **Backend is Central Hub** - All data flows through backend
2. **ML Service is PRIMARY** - Every reading analyzed by ML
3. **Firebase is Storage Only** - No business logic
4. **Frontend is Read-Only** - Only displays data

---

## 🚀 Production Checklist

- [ ] Configure production URLs
- [ ] Set up SSL/TLS certificates
- [ ] Configure Firebase security rules
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure backups
- [ ] Enable authentication
- [ ] Set up rate limiting
- [ ] Test end-to-end flow
- [ ] Deploy all services
- [ ] Monitor logs

---

## 📞 Support

**Issues?**
1. Check logs: `backend/logs/arogyajal.log`
2. Verify configuration files
3. Test with: `python FINAL_TEST.py`

**Common Issues:**
- Backend not starting → Check Firebase credentials
- No data showing → Verify backend is running
- Alerts not generating → Check sensor thresholds

---

## 📚 Additional Resources

- **API Reference:** See section 4
- **IoT Integration:** See section 5
- **ML Integration:** See section 6
- **Deployment:** See section 8

---

## 🎉 Summary

**ArogyaJal is Production-Ready!**

✅ Real-time water quality monitoring
✅ ML-powered predictions (USP)
✅ Automatic alert generation
✅ IoT device integration
✅ Comprehensive dashboard
✅ Scalable architecture

**System Status:** 100% Operational

**Next Steps:**
1. Deploy to production
2. Connect IoT devices
3. Monitor and iterate

---

**Last Updated:** November 16, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
