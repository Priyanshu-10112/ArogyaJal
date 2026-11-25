# ArogyaJal - Water Quality & Health Surveillance System

**जल गुणवत्ता निगरानी प्रणाली**

A comprehensive water quality monitoring and health surveillance system for North East India, integrating IoT sensors, mobile health reporting, ML predictions, and GIS mapping.

## Project context and contribution

ArogyaJal is the SIH 2025 winning Team CORE_401 project, deployed for government use. Priyanshu Sharma contributed as a student backend developer from August 2025 to March 2026; this project contribution is not an employment position.

His work includes Spring Boot REST APIs, Firebase Firestore integration, real-time WebSocket alerts, offline synchronization and integration of sensor and ML-assisted workflows.

[Public project website](https://arogyajal.netlify.app/) · [Portfolio case study](https://priyanshu-sharma.tech/#projects)

## 🌊 Overview

ArogyaJal monitors water quality and tracks waterborne disease outbreaks across 8 states in North East India:
- Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Python 3.14+
- Firebase account (2 projects: sensors + users)
- Maven

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend runs on http://localhost:8080
```

### 2. Start Frontend
```bash
cd DashBoard_Frontend
npm start
# Frontend runs on http://localhost:3000
```

### 3. Start ML Service
```bash
cd ML
python start_ml_service.py
# ML Service runs on http://localhost:5000
```

### 4. Login to System

Open `http://localhost:3000` and sign in with an account created in your own local Firebase authentication project. Assign the appropriate role and jurisdiction for your test setup; deployment credentials are not distributed in this repository.


## 📊 Features

### Water Quality Monitoring
- **Real-time IoT Sensors**: pH, Turbidity, TDS, Temperature monitoring
- **Smart Alerts**: Automatic detection with disease risk assessment
- **A1/A2/A3 Classification**: Drinking water, bathing, treated water standards
- **n8n Integration**: Automated alert workflows

### Disease Surveillance
- **Symptom Reporting**: Mobile app for community health workers
- **Cluster Detection**: Automatic outbreak identification
- **ML Predictions**: Risk assessment and outbreak forecasting
- **GIS Mapping**: Geographic visualization of health data

### User Management
- **Role-Based Access**: Admin, State, District, Block, Village levels
- **Jurisdiction Control**: Automatic data filtering by user location
- **Separate Firebase**: Dedicated authentication system

## 🏗️ Architecture

### Backend (Spring Boot)
- **API**: RESTful endpoints for sensors, symptoms, alerts
- **Firebase**: Firestore for data storage
- **Smart Alerts**: Confirmation-based alert system
- **n8n Webhooks**: External workflow automation

### Frontend (React + TypeScript)
- **Government Theme**: Indian tricolor design
- **Dashboard**: Real-time water quality metrics
- **Alerts Page**: Disease names and risk levels
- **GIS Map**: Interactive geographic visualization

### ML Service (Python)
- Outbreak risk prediction
- Water quality forecasting
- Cluster analysis

## 🔧 Configuration

### Firebase Projects
1. **arogyajal2** (Main Data)
   - Sensor readings
   - Symptom reports
   - Alerts
   - Clusters

2. **arogyajal-user** (Authentication)
   - User accounts
   - Roles & permissions
   - Jurisdictions

### Environment Variables

**Backend (.env)**
```
FIREBASE_PROJECT_ID=arogyajal2
FIREBASE_USERS_PROJECT_ID=arogyajal-user
N8N_WEBHOOK_URL=<your-own-n8n-webhook-url>
```

**Frontend (.env)**
```
REACT_APP_FIREBASE_PROJECT_ID=arogyajal-user
REACT_APP_API_URL=http://localhost:8080
```

## 📡 API Endpoints

### Sensors
- `POST /api/sensor-data` - Submit sensor readings
- `GET /api/sensors/readings` - Get sensor data

### Symptoms
- `POST /api/symptoms/reports` - Submit symptom report
- `GET /api/symptoms/reports` - Get symptom reports

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/alerts/{id}/resolve` - Resolve alert

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Register new user (admin only)

## 🧪 Testing

Run test scripts to generate sample data:

```bash
# Test sensor data + symptom reports
test-all-data-fixed.bat

# Test sensor data only
test-sensor-data.bat

# Test symptom reports only
test-symptom-reports.bat

# Create additional admin users
create-admin.bat
```

## 🤖 ML Service

### Endpoints
- **Health Check:** http://localhost:5000/health
- **Predict WQI:** http://localhost:5000/predict
- **Batch Predict:** http://localhost:5000/batch-predict
- **Model Info:** http://localhost:5000/model-info

### Features
- Water Quality Index (WQI) prediction
- Outbreak risk assessment
- Real-time ML predictions
- Scikit-learn 1.8.0 compatibility

## 🎨 UI Features

### Landing Page
- Indian government tricolor theme
- Feature showcase
- Contact information

### Login Page
- Government emblem
- Secure authentication
- Official design

### Dashboard
- Water quality metrics
- Active alerts
- Disease surveillance stats
- GIS map integration

### Alerts Page
- Disease names highlighted
- Severity-based filtering
- Location tracking
- Acknowledge/Resolve actions

## 📱 Mobile App Integration

The system supports mobile data collection through:
- Water quality testing
- Household surveys
- Symptom reporting

API endpoints available at `/api/mobile/*`

## 🔐 Security

- Role-based access control
- Jurisdiction-based data filtering
- Separate Firebase for user authentication
- Token-based API authentication

## 📈 Monitoring

- Real-time sensor data
- 24/7 alert system
- Automatic cluster detection
- n8n workflow automation

## 🤝 Contributing

This is a government project for North East India water quality monitoring.

## 📄 License

Government of India - Ministry of Jal Shakti

## 📞 Support

For technical support, contact your system administrator.

---

**© 2026 Government of India. All rights reserved.**
**System Version:** 1.0.0 | **Status:** ✅ OPERATIONAL
