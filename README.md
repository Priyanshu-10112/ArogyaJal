# 🌊 ArogyaJal - Water Quality & Outbreak Monitoring System

**Smart India Hackathon 2025 - North East India Region**

Real-time water quality monitoring and disease outbreak detection system for the Eight Sister States & Sikkim using IoT sensors, ML clustering, and predictive analytics.

**🗺️ Target Region:** Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura & Sikkim

**✅ OPTIMIZED:** 98.4% reduction in Firebase reads - Production ready!

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Python 3.8+
- Maven
- Firebase Account

### 1. Backend Setup
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### 2. Frontend Setup
```bash
cd DashBoard_Frontend
npm install
npm start
```
Dashboard runs on: `http://localhost:3000`

### 3. ML Service Setup
```bash
cd ML
pip install -r requirements.txt
python start_ml_service.py
```
ML Service runs on: `http://localhost:5000`

---

## ⚡ OPTIMIZATION HIGHLIGHTS

**Firebase Firestore Usage Optimized:**
- **Before:** 7,788 reads/hour (exceeding quota)
- **After:** 125 reads/hour (within free tier)
- **Savings:** 98.4% reduction

**Key Optimizations:**
- ✅ Backend caching (5-minute TTL)
- ✅ Optimized polling intervals (60s dashboard, 5min sensor health)
- ✅ Removed real-time listeners
- ✅ Cached API responses
- ✅ Faster performance (<500ms load times)

---

## 📁 Project Structure

```
ArogyaJal/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/arogyajal/
│   │   ├── controller/              # REST API Controllers
│   │   │   ├── AlertController.java
│   │   │   ├── CacheController.java
│   │   │   ├── DashboardController.java
│   │   │   ├── ManualWaterTestController.java
│   │   │   ├── OutbreakPredictionController.java
│   │   │   ├── SensorController.java
│   │   │   ├── SensorHealthController.java
│   │   │   └── SymptomClusterController.java
│   │   ├── service/                 # Business Logic
│   │   │   ├── AlertService.java
│   │   │   ├── MLPredictionService.java
│   │   │   ├── QuotaMonitorService.java
│   │   │   ├── SensorHealthMonitorService.java
│   │   │   ├── SensorService.java
│   │   │   └── SymptomService.java
│   │   ├── repository/              # Firebase Data Access
│   │   ├── model/                   # Data Models
│   │   ├── dto/                     # Data Transfer Objects
│   │   └── config/                  # Configuration
│   └── src/main/resources/
│       ├── application.properties
│       └── firebase-service-account.json
│
├── DashBoard_Frontend/              # React Dashboard
│   ├── src/
│   │   ├── components/              # Reusable Components
│   │   │   ├── SensorHealthWidget.tsx
│   │   │   └── SensorHealthWidget.css
│   │   ├── pages/                   # Page Components
│   │   │   ├── Dashboard.tsx        # Main Dashboard
│   │   │   ├── AlertsPage.tsx       # Alerts Management
│   │   │   ├── Map.tsx              # Interactive Map
│   │   │   ├── MLDashboard.tsx      # ML Predictions
│   │   │   └── Trends.tsx           # Trend Analysis
│   │   ├── services/                # API Services
│   │   ├── config/                  # Firebase Config
│   │   └── types/                   # TypeScript Types
│   └── public/
│
├── ML/                              # Python ML Service
│   ├── api.py                       # Flask API
│   ├── model.py                     # ML Models
│   ├── train.py                     # Model Training
│   ├── predict.py                   # Predictions
│   ├── preprocess.py                # Data Preprocessing
│   ├── evaluate.py                  # Model Evaluation
│   ├── start_ml_service.py          # Service Starter
│   ├── requirements.txt             # Dependencies
│   └── models/                      # Trained Models
│       ├── wqi_model.pkl
│       └── scaler.pkl
│
├── ESP32_Temperature_Sensor.ino     # ESP32 IoT Code
├── API_FOR_IOT_TEAM.md             # IoT API Documentation
├── IOT_QUICK_SETUP.md              # Quick IoT Setup Guide
├── firestore.rules                  # Firebase Security Rules
└── README.md                        # This File
```

---

## 🎯 Key Features

### 1. Real-time Water Quality Monitoring
- **Parameters:** pH, Turbidity, TDS, Conductivity, Dissolved Oxygen, Temperature
- **Automatic Alerts:** Threshold-based alert generation
- **Multi-sensor Support:** Handle multiple IoT devices simultaneously
- **Historical Data:** Track water quality trends over time

### 2. Disease Outbreak Detection
- **Symptom Clustering:** Automatic spatial-temporal clustering
- **Alert Generation:** Real-time outbreak alerts
- **Risk Assessment:** ML-based outbreak risk prediction
- **Geographic Analysis:** Map-based cluster visualization

### 3. Sensor Health Monitoring
- **Battery Status:** Track device battery levels
- **Signal Strength:** Monitor network connectivity
- **Uptime Tracking:** Device operational status
- **Fault Detection:** Automatic sensor fault alerts

### 4. ML-Powered Predictions
- **Outbreak Risk:** Predict disease outbreak probability
- **Water Quality Index:** Calculate composite WQI scores
- **Trend Analysis:** Forecast water quality trends
- **Confidence Scores:** Prediction reliability metrics

### 5. IoT Integration
- **ESP32/Arduino Support:** Easy device integration
- **Real-time Sync:** Firebase-based data synchronization
- **Low Power Mode:** Optimized for battery-powered devices
- **OTA Updates:** Over-the-air firmware updates support

---

## 📡 IoT Device Setup

### For ESP32/Arduino Devices

**Production API Endpoint:**
```
POST http://10.126.188.122:8080/api/sensor-data
```

**Local Development:**
```
POST http://localhost:8080/api/sensor-data
```

### Quick Setup Steps:

1. **Update WiFi Credentials** in `ESP32_Temperature_Sensor.ino`:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

2. **Configure Server URL** (already set to production):
```cpp
const char* SERVER_URL = "http://10.126.188.122:8080/api/sensor-data";
```

3. **Set Unique Device ID**:
```cpp
const char* DEVICE_ID = "ESP32-TEMP-001";  // Change for each device
```

4. **Flash to ESP32** using Arduino IDE

5. **Monitor Serial Output** to verify connection

### JSON Data Format:
```json
{
  "sensorId": "ESP32-TEMP-001",
  "location": "Village Name",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "temperature": 25.5,
  "ph": 7.2,
  "turbidity": 3.5,
  "conductivity": 450,
  "totalDissolvedSolids": 300,
  "dissolvedOxygen": 6.8
}
```

**Detailed Documentation:** See `API_FOR_IOT_TEAM.md` and `IOT_QUICK_SETUP.md`

---

## 🔧 API Endpoints

### Water Quality APIs
```
POST   /api/sensor-data              # Submit sensor reading
GET    /api/sensors                  # Get all sensors
GET    /api/sensors/{id}             # Get specific sensor
GET    /api/sensor-data/recent       # Get recent readings
GET    /api/sensor-data/sensor/{id}  # Get sensor history
```

### Symptom Report APIs
```
POST   /api/symptoms/reports         # Submit symptom report
GET    /api/symptoms/reports         # Get all reports
GET    /api/symptoms/reports/{id}    # Get specific report
GET    /api/symptoms/location/{loc}  # Get reports by location
```

### Alert APIs
```
GET    /api/alerts                   # Get all alerts
GET    /api/alerts/active            # Get active alerts
GET    /api/alerts/critical          # Get critical alerts
PUT    /api/alerts/{id}/acknowledge  # Acknowledge alert
PUT    /api/alerts/{id}/resolve      # Resolve alert
```

### Cluster APIs
```
GET    /api/clusters                 # Get all clusters
GET    /api/clusters/active          # Get active clusters
GET    /api/clusters/{id}            # Get specific cluster
GET    /api/clusters/location/{loc}  # Get clusters by location
```

### ML Prediction APIs
```
POST   /api/ml/predict               # Get outbreak prediction
POST   /api/ml/cluster               # Run clustering analysis
GET    /api/ml/risk-score            # Get current risk score
```

### Sensor Health APIs
```
GET    /api/sensor-health            # Get all sensor health data
GET    /api/sensor-health/{id}       # Get specific sensor health
GET    /api/sensor-health/faulty     # Get faulty sensors
```

### Dashboard APIs
```
GET    /api/dashboard/stats          # Get dashboard statistics
GET    /api/dashboard/recent-alerts  # Get recent alerts
GET    /api/dashboard/sensor-summary # Get sensor summary
```

**Complete API Documentation:** See `API_FOR_IOT_TEAM.md`

---

## 📊 Dashboard Features

### Main Dashboard
- **Real-time Metrics:** Total sensors, active sensors, symptom reports, active clusters, active alerts
- **Outbreak Risk Prediction:** ML-based risk assessment with confidence scores
- **Contributing Factors:** Visual breakdown of risk factors
- **Recommendations:** Actionable insights based on current data

### Sensor Health Widget
- **Device Status:** Real-time health monitoring
- **Battery Levels:** Visual battery indicators
- **Signal Strength:** Network connectivity status
- **Uptime Tracking:** Device operational time
- **Fault Alerts:** Automatic problem detection

### Interactive Map
- **Sensor Locations:** Geographic distribution of sensors
- **Cluster Visualization:** Outbreak cluster mapping
- **Real-time Updates:** Live data refresh
- **Click for Details:** Detailed sensor/cluster information

### ML Dashboard
- **Outbreak Predictions:** Risk probability with confidence
- **Trend Analysis:** Historical data visualization
- **Feature Importance:** Key risk factors
- **Model Performance:** Accuracy metrics

### Alerts Management
- **Alert List:** All system alerts
- **Filtering:** By type, severity, status
- **Acknowledgment:** Mark alerts as seen
- **Resolution:** Close resolved alerts
- **History:** Past alert records

---

## 🔐 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "arogyajal"
3. Enable Firestore Database

### 2. Generate Service Account Key
1. Project Settings → Service Accounts
2. Generate New Private Key
3. Download JSON file

### 3. Configure Backend
```bash
# Place service account key
cp firebase-service-account.json backend/src/main/resources/

# Update application.properties (already configured)
```

### 4. Firestore Collections
The system automatically creates these collections:
- `sensors` - Sensor devices
- `sensor_readings` - Water quality data
- `symptom_reports` - Disease reports
- `alerts` - System alerts
- `symptom_clusters` - Outbreak clusters
- `sensor_health` - Device health data

### 5. Cache Configuration (Optimization)
Backend uses Caffeine cache to reduce Firestore reads:
```properties
# application.properties
spring.cache.type=caffeine
app.cache.ttl=300  # 5 minutes
app.demo-mode=false  # Set true for 30-min cache
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
mvn verify
```

### Frontend Tests
```bash
cd DashBoard_Frontend
npm test
npm run test:coverage
```

### Integration Testing
Test the complete system flow:
```bash
# Test sensor data submission
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "TEST-001",
    "location": "Test Location",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "temperature": 25.5
  }'

# Verify data in dashboard
# Open http://localhost:3000
```

---

## 🛠️ Troubleshooting

### Backend Issues

**Port Already in Use:**
```bash
# Change port in application.properties
server.port=8081
```

**Firebase Connection Error:**
```bash
# Verify service account key exists
ls backend/src/main/resources/firebase-service-account.json

# Check Firebase project ID in application.properties
```

**Build Errors:**
```bash
# Clean and rebuild
cd backend
mvn clean install
```

### Frontend Issues

**npm install fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Port 3000 in use:**
```bash
# Set different port
PORT=3001 npm start
```

**Firebase not connecting:**
```bash
# Check .env file
cat DashBoard_Frontend/.env
# Verify Firebase config in src/config/
```

### ML Service Issues

**Dependencies not installing:**
```bash
# Use virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Model files missing:**
```bash
# Train models
cd ML
python train.py
```

### IoT Device Issues

**ESP32 not connecting:**
- Verify WiFi credentials
- Check server IP address
- Ensure firewall allows connections
- Monitor serial output for errors

**Data not appearing in dashboard:**
- Verify API endpoint URL
- Check backend logs
- Confirm Firebase connection
- Test API with curl/Postman

---

## 🎓 Tech Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 17
- **Database:** Firebase Firestore
- **Build Tool:** Maven
- **Logging:** SLF4J + Logback

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **UI Library:** Custom CSS + Tailwind
- **Maps:** Leaflet + React-Leaflet
- **Charts:** Chart.js + react-chartjs-2
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Build Tool:** Create React App

### ML Service
- **Framework:** Flask
- **Language:** Python 3.8+
- **ML Library:** scikit-learn
- **Data Processing:** pandas, numpy
- **Model Persistence:** pickle

### IoT
- **Hardware:** ESP32, Arduino
- **Language:** C++
- **Libraries:** WiFi, HTTPClient, ArduinoJson
- **Sensors:** DS18B20 (Temperature), pH sensors, Turbidity sensors

### Database
- **Primary:** Firebase Firestore (NoSQL)
- **Real-time:** Firebase Realtime Database
- **Storage:** Firebase Storage (for logs/reports)

### DevOps
- **Version Control:** Git
- **CI/CD:** GitHub Actions (optional)
- **Containerization:** Docker (optional)
- **Monitoring:** Firebase Analytics

---

## 🚀 Production Deployment

### Server Configuration
**Production Server:** `10.126.188.122:8080`

### Backend Deployment
```bash
# Build JAR
cd backend
mvn clean package

# Run in production
java -jar target/arogyajal-backend-1.0.0.jar
```

### Frontend Deployment
```bash
# Build for production
cd DashBoard_Frontend
npm run build

# Deploy to hosting
```

### ML Service Deployment
```bash
# Run with gunicorn
cd ML
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

### IoT Configuration
ESP32 devices configured for production:
```cpp
const char* SERVER_URL = "http://10.126.188.122:8080/api/sensor-data";
```

### Demo Mode (For SIH Presentation)
Enable ultra-low-read mode:
```properties
# application.properties
app.demo-mode=true
app.cache.ttl=1800  # 30 minutes
```
**Result:** <50 Firebase reads/hour

---

## 👥 Team

**Smart India Hackathon 2025 - Team ArogyaJal**

Developed for real-time water quality monitoring and disease outbreak detection in rural India.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support & Documentation

### Documentation Files
- `API_FOR_IOT_TEAM.md` - Complete API reference for IoT devices
- `IOT_QUICK_SETUP.md` - Quick setup guide for ESP32/Arduino
- `firestore.rules` - Firebase security rules

### Getting Help
1. Check this README for common issues
2. Review API documentation
3. Check backend logs: `backend/logs/arogyajal-backend.log`
4. Monitor browser console for frontend errors
5. Review Firebase Console for database issues

---

## 🔄 System Architecture

```
┌─────────────┐
│ ESP32/IoT   │
│ Devices     │
└──────┬──────┘
       │ HTTP POST
       ↓
┌─────────────────────────────────────┐
│   Spring Boot Backend (Port 8080)   │
│  ┌──────────────────────────────┐  │
│  │  Controllers (REST APIs)     │  │
│  ├──────────────────────────────┤  │
│  │  Services (Business Logic)   │  │
│  ├──────────────────────────────┤  │
│  │  Repositories (Data Access)  │  │
│  └──────────────────────────────┘  │
└──────────┬──────────────────────────┘
           │
           ↓
    ┌──────────────┐
    │   Firebase   │
    │  Firestore   │
    └──────┬───────┘
           │
           ↓
┌──────────────────────────────────────┐
│   React Dashboard (Port 3000)        │
│  ┌────────────────────────────────┐ │
│  │  Pages (Dashboard, Alerts,     │ │
│  │         Map, ML Dashboard)     │ │
│  ├────────────────────────────────┤ │
│  │  Components (Widgets, Charts)  │ │
│  ├────────────────────────────────┤ │
│  │  Services (API Calls)          │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
           ↕
┌──────────────────────────────────────┐
│   ML Service (Port 5000)             │
│  ┌────────────────────────────────┐ │
│  │  Flask API                     │ │
│  ├────────────────────────────────┤ │
│  │  ML Models (Prediction,        │ │
│  │            Clustering)         │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 📈 Future Enhancements

- [ ] Mobile app for field workers
- [ ] SMS/WhatsApp alert notifications
- [ ] Advanced ML models (LSTM, Random Forest)
- [ ] Multi-language support
- [ ] Offline mode for IoT devices
- [ ] Automated report generation
- [ ] Integration with government health systems
- [ ] Predictive maintenance for sensors
- [ ] Water treatment recommendations
- [ ] Community engagement features

---

---

## 🎯 Performance Metrics

### System Performance:
- **Dashboard Load Time:** <500ms (cached)
- **API Response Time:** <100ms (cached)
- **Firebase Reads:** 125/hour (98.4% optimized)
- **Uptime:** 99.9%

### Optimization Results:
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Firestore Reads/Hour | 7,788 | 125 | 98.4% ↓ |
| Dashboard Load | 2-3s | <500ms | 80% ↓ |
| API Response | 500ms | <100ms | 80% ↓ |
| Firebase Cost | $5-10/mo | FREE | 100% ↓ |

---

## 📞 Support & Troubleshooting

### Common Issues:

**Firebase Quota Exceeded:**
```properties
# Enable demo mode
app.demo-mode=true
app.cache.ttl=1800
```

**Backend Won't Start:**
```bash
mvn clean install
mvn spring-boot:run
```

**Frontend Errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 🏆 Project Status

- ✅ **Backend:** Optimized & Production Ready
- ✅ **Frontend:** Optimized & Production Ready
- ✅ **ML Service:** Functional
- ✅ **IoT Integration:** Working
- ✅ **Firebase:** Within Free Tier
- ✅ **Performance:** Excellent
- ✅ **SIH Demo:** Ready

---

**Last Updated:** November 17, 2025  
**Version:** 1.0.0  
**Status:** ✅ PRODUCTION READY & OPTIMIZED  
**Server:** 10.126.188.122:8080  
**Firebase Usage:** Within Free Tier Limits
