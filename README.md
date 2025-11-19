# 🌊 ArogyaJal - Water Quality & Disease Outbreak Monitoring System

**Smart India Hackathon 2025 - Problem Statement ID: SIH25001**

Real-time IoT-based water quality monitoring and ML-powered disease outbreak detection for North East India.

**🗺️ Target Region:** Assam • Meghalaya • Arunachal Pradesh • Nagaland • Manipur • Mizoram • Tripura • Sikkim

**✅ STATUS:** Production Ready | 98.4% Firebase Optimized | All Services Integrated

---

## 🚀 Quick Start

### Prerequisites
- Java 17+, Node.js 18+, Python 3.8+, Maven
- Firebase Account with Firestore enabled

### Start All Services

```bash
# Terminal 1 - Backend (Spring Boot)
cd Backend
mvn spring-boot:run
# Runs on http://localhost:8080

# Terminal 2 - Frontend (React + TypeScript)
cd DashBoard_Frontend
npm install && npm start
# Runs on http://localhost:3000

# Terminal 3 - ML Service (Flask + scikit-learn)
cd ML
pip install -r requirements.txt
python start_ml_service.py
# Runs on http://localhost:5000
```

---

## 🎯 Key Features

✅ **Real-time Water Quality Monitoring** - pH, Turbidity, TDS, DO, Temperature  
✅ **ML-Powered Outbreak Detection** - DBSCAN clustering + Random Forest WQI prediction  
✅ **Smart Alerts** - Multi-severity automated notifications (LOW/MEDIUM/HIGH/CRITICAL)  
✅ **Interactive Dashboard** - Real-time visualization with maps, charts, and trends  
✅ **IoT Integration** - ESP32/Arduino sensor support with health monitoring  
✅ **Manual Water Testing** - Field worker data collection with offline support  
✅ **Symptom Reporting** - Community health tracking with geolocation  
✅ **Sensor Health Monitoring** - Battery, connectivity, data quality tracking  
✅ **98.4% Firebase Optimization** - 7,788 → 125 reads/hour

---

## 📁 Project Structure

```
ArogyaJal/
├── Backend/                    # Spring Boot REST API (Java 17)
│   ├── controller/            # 14 REST Controllers
│   ├── service/               # Business Logic + ML Integration
│   ├── repository/            # Firebase Firestore Access
│   ├── model/                 # 8 Data Models
│   └── config/                # Security, CORS, Cache, WebSocket
│
├── DashBoard_Frontend/        # React + TypeScript Dashboard
│   ├── pages/                 # Dashboard, Map, Alerts, ML, Trends
│   ├── components/            # Reusable UI Components
│   └── services/              # API Integration Layer
│
├── ML/                        # Python ML Service (Flask)
│   ├── api.py                 # Flask REST API
│   ├── model.py               # Random Forest WQI Predictor
│   ├── train.py               # Model Training
│   └── models/                # Trained Models (pkl)
│
└── COMPLETE_PROJECT_DOCUMENTATION.md  # Full Documentation
```

---

## 🔌 API Endpoints

### Sensor APIs
- `POST /api/sensor-data` - Submit sensor reading
- `GET /api/sensors/readings` - Get all readings
- `GET /api/sensor-health` - Device health status

### Symptom Report APIs
- `POST /api/symptoms/reports` - Submit symptom report
- `GET /api/symptoms/reports` - Get all reports

### Alert APIs
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/active` - Get active alerts

### ML APIs
- `GET /api/symptom-clusters` - Get outbreak clusters
- `GET /api/outbreak-predictions/latest` - Get outbreak prediction
- `POST /predict` - WQI prediction (ML Service)

**Complete API Documentation:** See `COMPLETE_PROJECT_DOCUMENTATION.md`

---

## 📊 System Architecture

```
┌─────────────┐
│ ESP32/IoT   │ ──HTTP POST──┐
│ Sensors     │              │
└─────────────┘              ▼
                    ┌─────────────────┐
                    │  Spring Boot    │
                    │  Backend API    │◄──────┐
                    └────────┬────────┘       │
                             │                │
                        ┌────▼────┐      ┌───▼────┐
                        │Firebase │      │   ML   │
                        │Firestore│      │Service │
                        └────┬────┘      └────────┘
                             │
                        ┌────▼────┐
                        │  React  │
                        │Dashboard│
                        └─────────┘
```

---

## ⚡ Performance Optimization

**Firebase Firestore Usage:**
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Reads/Hour | 7,788 | 125 | **98.4% ↓** |
| Reads/Day | 187K | 3,000 | **98.4% ↓** |
| Dashboard Load | 2-3s | <500ms | **80% ↓** |
| API Response | 500ms | <100ms | **80% ↓** |
| Firebase Cost | $5-10/mo | **FREE** | **100% ↓** |

**Optimization Techniques:**
- ✅ Backend caching (Caffeine, 5-min TTL)
- ✅ Optimized polling intervals
- ✅ Removed real-time listeners
- ✅ Cached API responses

---

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project: "arogyajal-demo2"
2. Enable Firestore Database
3. Generate service account key
4. Place in `Backend/src/main/resources/firebase-service-account.json`

### Backend Configuration
```properties
# Backend/src/main/resources/application.properties
server.port=8080
spring.cloud.gcp.project-id=arogyajal-demo2
ml.python.api.url=http://localhost:5000
app.cache.ttl=300  # 5 minutes
```

### Frontend Configuration
```env
# DashBoard_Frontend/.env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ML_API_URL=http://localhost:5000
```

---

## 🧪 Testing

```bash
# Backend Tests
cd Backend && mvn test

# Frontend Tests
cd DashBoard_Frontend && npm test

# Test Sensor Data API (CORRECT FORMAT)
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST-001",
    "location": {"lat": 26.1445, "lon": 91.7362},
    "sensors": {
      "PH": 7.2,
      "Temperature_C": 25.5,
      "TDS_ppm": 450,
      "DO_mgL": 6.8,
      "Turbidity_NTU": 3.2
    },
    "battery": {"voltage": 3.8}
  }'

# Test Symptom Report API (CORRECT FORMAT)
curl -X POST http://localhost:8080/api/symptoms/reports \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "location": "Test Location",
    "geoLocation": {"latitude": 26.1445, "longitude": 91.7362},
    "waterSource": "RIVER",
    "symptoms": ["DIARRHEA", "FEVER"],
    "severity": "MODERATE",
    "duration": "DAYS"
  }'
```

---

## 🐛 Troubleshooting

**Backend won't start:**
```bash
mvn clean install && mvn spring-boot:run
```

**Frontend errors:**
```bash
rm -rf node_modules package-lock.json
npm install && npm start
```

**Firebase quota exceeded:**
```properties
# Enable demo mode in application.properties
app.demo-mode=true
app.cache.ttl=1800
```

**Complete Troubleshooting Guide:** See `COMPLETE_PROJECT_DOCUMENTATION.md`

---

## 📚 Documentation

- **`COMPLETE_PROJECT_DOCUMENTATION.md`** - Full system documentation
- **`API_FOR_IOT_TEAM.md`** - IoT API reference
- **`IOT_QUICK_SETUP.md`** - ESP32/Arduino setup guide
- **`firestore.rules`** - Firebase security rules

---

## 🏆 Tech Stack

**Backend:** Spring Boot 3.5.5, Java 17, Firebase Firestore, Caffeine Cache  
**Frontend:** React 18, TypeScript, Leaflet, Chart.js, Axios  
**ML Service:** Flask, scikit-learn, pandas, numpy  
**IoT:** ESP32, Arduino, C++  
**Database:** Firebase Firestore (NoSQL)

---

## 🚀 Deployment

### Production Build
```bash
# Backend JAR
cd Backend && mvn clean package
java -jar target/arogyajal-backend-0.0.1-SNAPSHOT.jar

# Frontend Build
cd DashBoard_Frontend && npm run build

# ML Service (Gunicorn)
cd ML && gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

---

## 📈 Future Enhancements

- [ ] SMS/WhatsApp alert notifications
- [ ] Mobile app for ASHA workers
- [ ] Multi-language support
- [ ] Advanced ML models (LSTM)
- [ ] Integration with government health systems
- [ ] Predictive maintenance for sensors

---

## 👥 Team

**Smart India Hackathon 2025 - Team ArogyaJal**

Developed for real-time water quality monitoring and disease outbreak detection in rural India.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For detailed documentation, troubleshooting, and API reference, see:
**`COMPLETE_PROJECT_DOCUMENTATION.md`**

---

**Last Updated:** November 20, 2025  
**Version:** 1.0.0  
**Status:** ✅ PRODUCTION READY & FULLY INTEGRATED  
**Firebase Usage:** Within Free Tier (98.4% optimized)  
**Services:** Backend (Spring Boot) + Frontend (React) + ML (Flask) - All Running

---

## 📊 Project Status

### ✅ Completed Components

**Backend Services (Spring Boot)**
- ✅ Sensor Data API with health monitoring
- ✅ Manual Water Test API with offline sync
- ✅ Symptom Report API with geolocation
- ✅ Alert Management System (4 severity levels)
- ✅ Sensor Health Monitoring Service
- ✅ ML Integration Service
- ✅ Firebase Firestore Integration
- ✅ Caching Layer (98.4% optimization)

**Frontend Dashboard (React + TypeScript)**
- ✅ Real-time Dashboard with live data
- ✅ Interactive Map with sensor locations
- ✅ Alert Management Interface
- ✅ Trend Analysis & Charts
- ✅ ML Predictions Display
- ✅ Responsive Design

**ML Service (Flask + Python)**
- ✅ Water Quality Index (WQI) Prediction
- ✅ Disease Outbreak Detection (DBSCAN)
- ✅ Random Forest Model Training
- ✅ REST API Integration

**IoT Integration**
- ✅ ESP32/Arduino Support
- ✅ Sensor Health Tracking
- ✅ Battery Monitoring
- ✅ Offline Data Handling

### 🎯 Key Metrics
- **API Endpoints:** 40+ REST endpoints
- **Controllers:** 14 Spring Boot controllers
- **Services:** 12 business logic services
- **Models:** 8 data models
- **Firebase Optimization:** 98.4% reduction in reads
- **Response Time:** <100ms average
- **Uptime:** Production ready

---

## 📝 JSON Format Quick Reference

### ✅ Sensor Data (CORRECT FORMAT)
```json
{
  "deviceId": "NER-ASS-GUW-001",
  "location": {
    "lat": 26.1445,
    "lon": 91.7362
  },
  "sensors": {
    "PH": 7.2,
    "Temperature_C": 25.5,
    "TDS_ppm": 450,
    "DO_mgL": 6.8,
    "Turbidity_NTU": 3.2
  },
  "battery": {
    "voltage": 3.8
  }
}
```

### ✅ Symptom Report (CORRECT FORMAT)
```json
{
  "userId": "user_001",
  "location": "Guwahati - Kamakhya",
  "geoLocation": {
    "latitude": 26.1445,
    "longitude": 91.7362
  },
  "waterSource": "RIVER",
  "reporterType": "ASHA",
  "reporterId": "ASHA_ASM_001",
  "patientAge": 35,
  "patientGender": "MALE",
  "symptoms": ["DIARRHEA", "FEVER", "VOMITING"],
  "severity": "SEVERE",
  "duration": "DAYS",
  "waterConsumption": 3,
  "additionalNotes": "Notes",
  "contactInfo": "Contact"
}
```

**Note:** Backend supports field name aliases (PH/pH/ph, Temperature_C/temperature_C/temperature, etc.)
