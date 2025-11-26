# ArogyaJal - Water Quality & Outbreak Monitoring System

**Real-time Water Quality Monitoring and Disease Outbreak Prediction for North East India**

## 🌟 Overview

ArogyaJal is an integrated IoT and ML-powered platform for monitoring water quality and predicting disease outbreaks across the North East India region (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim).

## ✨ Key Features

### 1. Real-Time Water Quality Monitoring
- **IoT Sensor Integration**: pH, Temperature, Turbidity, TDS, Conductivity
- **Live Dashboard**: Real-time sensor readings with auto-refresh
- **Water Quality Index (WQI)**: Automated quality assessment
- **Multi-level Alerts**: CRITICAL, HIGH, MEDIUM, LOW severity levels

### 2. Disease Outbreak Prediction
- **ML-Powered Risk Assessment**: Real-time outbreak risk scoring (0-100)
- **Confidence Metrics**: 79% prediction confidence
- **Contributing Factors Analysis**: Clusters, Reports, Water Quality, Sources
- **Auto-refresh**: Updates every 60 seconds

### 3. Hierarchical Location Filtering
- **4-Level Hierarchy**: State → District → City/Town → Village
- **Device-Level Filtering**: Filter by specific sensors
- **Global Filter Sync**: All pages synchronized with filter selection
- **Breadcrumb Navigation**: Clear filter path display

### 4. Symptom Cluster Detection
- **DBSCAN Clustering**: Automatic outbreak pattern detection
- **Interactive Map**: Visual cluster representation
- **Dominant Symptoms**: Top symptoms per cluster
- **Risk Scoring**: Cluster-level risk assessment

### 5. Smart Alert System
- **Multi-Channel Notifications**: Email, SMS, Dashboard
- **N8N Integration**: Automated workflow triggers
- **Alert Management**: Acknowledge and resolve workflow
- **Auto-Delete**: Resolved alerts removed from database

### 6. Comprehensive Analytics
- **Trends Analysis**: Historical data visualization (1h to 30 days)
- **Parameter Tracking**: pH, Temperature, Turbidity, TDS, Conductivity
- **Distribution Charts**: Quality status and parameter range analysis
- **Auto-Refresh**: 10-second updates (configurable)

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Leaflet for interactive maps
- Chart.js for data visualization
- Context API for global state management

**Backend:**
- Spring Boot 3.2.0
- Google Cloud Firestore
- RESTful API architecture
- Async processing for alerts

**ML Service:**
- Python Flask
- scikit-learn (DBSCAN clustering)
- NumPy/Pandas for data processing
- Real-time prediction API

**IoT Integration:**
- ESP32 microcontrollers
- Multi-parameter water sensors
- MQTT/HTTP protocols
- Battery monitoring

## 📊 System Components

### 1. Dashboard Pages

#### Main Dashboard
- Device selection and filtering
- Real-time water quality cards
- Location-based filtering
- Device health monitoring

#### Trends Page
- Historical data analysis
- Multi-parameter charts
- Quality distribution
- Auto-refresh (10s)

#### Alerts Page
- Active alert management
- Acknowledge/Resolve workflow
- Severity-based filtering
- Auto-refresh (10s)

#### Map Page
- Interactive sensor map
- Cluster visualization
- Alert markers
- Auto-refresh (15s)

#### ML Dashboard
- Outbreak risk prediction
- Device health cards
- Cluster map
- Quick actions
- Auto-refresh (30s)

### 2. API Endpoints

**Sensor Data:**
- `GET /api/sensors/readings` - All sensor readings
- `GET /api/sensor-data/water-quality/{deviceId}` - Device quality assessment

**Alerts:**
- `GET /api/alerts` - All alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/alerts/{id}/resolve` - Resolve and delete alert

**Locations:**
- `GET /api/locations/states` - All states
- `GET /api/locations/districts?state={state}` - Districts by state
- `GET /api/locations/cities?state={state}&district={district}` - Cities
- `GET /api/locations/villages?state={state}&district={district}&city={city}` - Villages
- `GET /api/locations/devices` - Devices by location hierarchy

**ML Predictions:**
- `GET /api/outbreak-predictions/latest` - Latest outbreak risk
- `GET /api/symptom-clusters` - Active symptom clusters
- `GET /api/clusters/active` - Active clusters for map

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Python 3.9+
- Firebase/Firestore account
- Maven 3.8+

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Frontend Setup

```bash
cd DashBoard_Frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

### ML Service Setup

```bash
cd ML
pip install -r requirements.txt
python api.py
```

ML Service runs on: `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

**Backend (`application.properties`):**
```properties
# Firebase
firebase.credentials.path=path/to/serviceAccountKey.json

# N8N Webhook
n8n.webhook.url=https://your-n8n-instance.com/webhook/alerts
n8n.webhook.enabled=true
n8n.webhook.min-severity=MEDIUM
```

**Frontend (`.env`):**
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ML_API_URL=http://localhost:5000
```

## 📈 Key Metrics

- **Sensors Monitored**: 18+ active devices
- **Coverage Area**: 8 NE states
- **Prediction Accuracy**: 79% confidence
- **Alert Response Time**: < 5 seconds
- **Dashboard Refresh**: 10-60 seconds (configurable)
- **Data Retention**: Real-time + historical

## 🎯 Use Cases

1. **Health Officials**: Monitor outbreak risk across regions
2. **Water Quality Teams**: Track sensor health and water parameters
3. **District Administrators**: Location-specific filtering and alerts
4. **Field Workers**: Village-level device monitoring
5. **Emergency Response**: Real-time alert notifications

## 🔐 Security Features

- Role-based access control (planned)
- Secure API endpoints
- Firebase authentication integration
- Data encryption at rest
- HTTPS/TLS for data transmission

## 📱 Mobile Responsiveness

- Fully responsive design
- Touch-optimized maps
- Mobile-friendly charts
- Adaptive layouts

## 🤝 Contributing

This project is part of Smart India Hackathon 2024.

## 📄 License

Proprietary - Smart India Hackathon 2024

## 👥 Team

Developed for Smart India Hackathon 2024

## 📞 Support

For issues and questions, please contact the development team.

---

**Last Updated**: November 25, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
