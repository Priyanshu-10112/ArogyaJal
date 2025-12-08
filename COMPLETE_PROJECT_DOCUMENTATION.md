# ArogyaJal - Complete Project Documentation

**Comprehensive Technical Documentation for Smart India Hackathon 2025**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [ML Pipeline](#ml-pipeline)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Deployment Guide](#deployment-guide)
8. [Testing & Validation](#testing--validation)

---

## 1. Project Overview

### 1.1 Problem Statement

North East India faces significant challenges with waterborne diseases due to:
- Limited real-time water quality monitoring
- Delayed outbreak detection
- Lack of integrated health-water quality systems
- Poor coordination between health and water departments

### 1.2 Solution

ArogyaJal provides an integrated platform that:
- Monitors water quality in real-time using IoT sensors
- Predicts disease outbreaks using hybrid ML architecture
- Enables citizen symptom reporting
- Provides actionable insights for health officials
- Generates automated reports for decision-makers

### 1.3 Key Innovations

1. **Hybrid ML Fusion**: Combines rule-based (WHO/BIS thresholds) with ML predictions
2. **Temporal Intelligence**: Trend analysis to distinguish spikes from sustained patterns
3. **Geographic Correlation**: Links symptom clusters to water quality issues
4. **Complete Explainability**: Full transparency in risk calculations
5. **Never Underestimates Risk**: max(ML, Rule) fusion ensures safety

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Dashboard | Trends | Alerts | Map | ML Dashboard | Reports │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / WebSocket
┌────────────────────────┴────────────────────────────────────┐
│              Backend (Spring Boot)                           │
│  Controllers | Services | Schedulers | Repositories          │
└────────┬───────────────┬────────────────────┬───────────────┘
         │               │                    │
    ┌────┴────┐    ┌────┴────┐         ┌────┴────┐
    │ Firebase│    │   ML    │         │   N8N   │
    │Firestore│    │ Service │         │ Webhook │
    └─────────┘    └─────────┘         └─────────┘
         │              │
    ┌────┴────┐    ┌────┴────┐
    │ Sensors │    │ DBSCAN  │
    │ (IoT)   │    │Clustering│
    └─────────┘    └─────────┘
```

### 2.2 Component Breakdown

**Frontend Components:**
- Dashboard: Real-time sensor data display
- Trends: Historical data visualization
- Alerts: Alert management interface
- Map: Interactive cluster visualization
- ML Dashboard: Outbreak prediction display
- Reports: PDF report generation

**Backend Services:**
- SensorService: Sensor data processing
- SymptomService: Symptom report management
- MLPayloadService: ML payload assembly
- OutbreakPredictionService: Prediction with fusion
- HistoricalDataService: Trend calculation
- AlertService: Alert management
- ReportService: PDF generation

**Schedulers:**
- MLSyncScheduler: Runs every 5 minutes
- HistoricalSnapshotScheduler: Runs every hour

---

## 3. Technology Stack

### 3.1 Frontend

**Core:**
- React 18.2.0
- TypeScript 4.9.5
- React Router DOM 6.15.0

**UI & Visualization:**
- Leaflet 1.9.4 (Maps)
- Chart.js 4.4.0 (Charts)
- React-Chartjs-2 5.2.0
- FontAwesome 6.5.0 (Icons)

**PDF Generation:**
- jsPDF 3.0.4
- jspdf-autotable 5.0.2
- html2canvas 1.4.1

**HTTP & State:**
- Axios 1.6.2
- Context API (built-in)

### 3.2 Backend

**Core:**
- Spring Boot 3.5.5
- Java 17
- Maven 3.8+

**Key Dependencies:**
- Spring Web (REST APIs)
- Spring WebSocket (Real-time)
- Firebase Admin SDK (Firestore)
- Lombok (Boilerplate reduction)
- Swagger/OpenAPI (API docs)

### 3.3 ML Service

**Core:**
- Python 3.9+
- Flask 2.0.0
- Flask-CORS 3.0.0

**ML Libraries:**
- scikit-learn 1.0.0+ (DBSCAN)
- NumPy 1.21.0+
- Pandas 1.3.0+
- Joblib 1.0.0+ (Model persistence)

### 3.4 Database

**Primary:**
- Google Cloud Firestore (NoSQL)

**Collections:**
- sensor_readings
- symptom_reports
- alerts
- outbreak_predictions
- symptom_clusters
- historical_snapshots
- devices
- users

---

## 4. ML Pipeline

### 4.1 Complete Workflow

```
Step 1: Data Collection
├─ Sensors submit data every 5-15 minutes
├─ Citizens submit symptom reports
└─ Stored in Firestore

Step 2: Data Aggregation (Every 5 minutes)
├─ MLPayloadService.assembleMLPayload()
├─ Fetch latest sensor readings (deduplicated)
├─ Fetch symptom reports (last 7 days)
├─ Fetch active alerts (last 24h)
├─ Calculate current metrics
└─ Calculate trends (24h, 7d)

Step 3: ML Prediction
├─ POST to http://localhost:5000/api/ml/predict-outbreak
├─ DBSCAN clustering (eps=5km, min_samples=3)
├─ Risk calculation:
│   ├─ Cluster Factor (0-50)
│   ├─ Report Factor (0-20)
│   ├─ Quality Factor (0-20)
│   ├─ Source Factor (0-10)
│   └─ Alert Factor (0-10)
├─ Apply trend multipliers (0.7x - 2.0x)
└─ Return: risk_score, risk_level, confidence, factors

Step 4: Rule-Based Risk
├─ RuleBasedRiskCalculator.calculateRuleBasedRisk()
├─ Calculate avgWQI from sensors
├─ Count poor sensors (WQI > 50)
├─ Base risk from avgWQI:
│   ├─ WQI ≥ 90: +50
│   ├─ WQI ≥ 75: +40
│   ├─ WQI ≥ 50: +25
│   └─ WQI ≥ 25: +10
├─ Ratio risk: (poor_sensors / total) × 40
└─ Critical override if WQI > 90

Step 5: Hybrid Fusion
├─ final_risk = max(ml_risk, rule_risk)
├─ Adjust confidence if rule >> ML
└─ Store fusion metadata

Step 6: Storage & Display
├─ Store in outbreak_predictions collection
├─ Include: ml_risk, rule_risk, final_risk
└─ Dashboard fetches and displays
```


### 4.2 DBSCAN Clustering

**Algorithm:** Density-Based Spatial Clustering of Applications with Noise

**Parameters:**
- `eps`: 5 km (maximum distance between points)
- `min_samples`: 3 (minimum reports to form cluster)
- `metric`: haversine (great-circle distance)

**Process:**
1. Extract lat/lng from symptom reports
2. Apply DBSCAN to find dense regions
3. Calculate cluster severity based on:
   - Number of reports in cluster
   - Severity of individual reports
   - Dominant symptoms
4. Assign reportIds to clusters

**Output:**
```json
{
  "clusters": [
    {
      "id": "cluster_0",
      "location": "Tezpur, Riverside",
      "severity_score": 75.0,
      "report_count": 3,
      "dominant_symptoms": ["DIARRHEA", "VOMITING"],
      "reportIds": ["report_1", "report_2", "report_3"]
    }
  ],
  "cluster_count": 1,
  "total_reports": 17
}
```

### 4.3 Risk Calculation Formulas

**ML Risk Score (0-100):**
```
cluster_factor = max_cluster_severity / 2  (0-50)
report_factor = min(total_reports / 10, 20)  (0-20)
quality_factor = (poor_sensors / total_sensors) × 20  (0-20)
source_factor = (contaminated_sources / total_sources) × 10  (0-10)
alert_factor = min(active_alerts × 2, 10)  (0-10)

base_risk = cluster_factor + report_factor + quality_factor + source_factor + alert_factor

# Apply trend multipliers
if wqi_trend_24h > 15: multiplier *= 1.4
if report_trend_24h > 10: multiplier *= 1.3
if alert_trend_24h > 5: multiplier *= 1.2
if cluster_growth_rate_7d > 1.0: multiplier *= 1.5
if all trends improving: multiplier *= 0.7

ml_risk = base_risk × multiplier
```

**Rule-Based Risk Score (0-100):**
```
# Base risk from average WQI
if avgWQI >= 90: base_risk += 50
elif avgWQI >= 75: base_risk += 40
elif avgWQI >= 50: base_risk += 25
elif avgWQI >= 25: base_risk += 10

# Poor sensor ratio risk
poor_ratio = poor_sensors / total_sensors
ratio_risk = poor_ratio × 40
base_risk += ratio_risk

# Critical breach override
if any sensor WQI > 90:
    base_risk = max(base_risk, 60)

rule_risk = clamp(base_risk, 0, 100)
```

**Hybrid Fusion:**
```
final_risk = max(ml_risk, rule_risk)

# Adjust confidence
if rule_risk > ml_risk + 20:
    confidence = confidence × 0.9
```

### 4.4 Confidence Calculation

```
confidence = (available_features / total_features) × 100

Available features:
- Sensor data (4 parameters × sensor_count)
- Symptom reports (last 7 days)
- Active alerts (last 24h)
- Historical data (24h, 7d snapshots)
- Cluster data

Confidence ranges:
- 80-100%: Excellent data availability
- 60-79%: Good data availability
- 40-59%: Moderate data availability
- 20-39%: Limited data availability
- 0-19%: Insufficient data
```

---

## 5. API Reference

### 5.1 Sensor Data APIs

#### Submit Sensor Data
```http
POST /api/sensor-data
Content-Type: application/json

{
  "deviceId": "WQ001",
  "location": {
    "lat": 26.1445,
    "lon": 91.7362
  },
  "sensors": {
    "PH": 7.2,
    "Turbidity_NTU": 2.5,
    "TDS_ppm": 150,
    "Temperature_C": 25.0
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.0,
    "isCharging": false
  }
}

Response: 200 OK
{
  "status": "success",
  "message": "Data received and processed successfully",
  "deviceId": "WQ001",
  "timestamp": "2025-12-08T09:30:00Z"
}
```

#### Get Latest Sensor Data
```http
GET /api/sensor-data/latest

Response: 200 OK
{
  "deviceId": "WQ001",
  "location": "26.1445,91.7362",
  "ph": 7.2,
  "temperature": 25.0,
  "turbidity": 2.5,
  "totalDissolvedSolids": 150,
  "wqi": 12.5,
  "qualityStatus": "Excellent",
  "timestamp": "2025-12-08T09:30:00Z"
}
```

#### Get Water Quality Assessment
```http
GET /api/sensor-data/water-quality/{deviceId}

Response: 200 OK
{
  "deviceId": "WQ001",
  "wqi": 12.5,
  "finalStatus": "Excellent",
  "statusReason": "All parameters within acceptable limits",
  "parameters": {
    "ph": {"value": 7.2, "status": "GOOD"},
    "turbidity": {"value": 2.5, "status": "GOOD"},
    "tds": {"value": 150, "status": "GOOD"},
    "temperature": {"value": 25.0, "status": "GOOD"}
  }
}
```

### 5.2 Symptom Report APIs

#### Submit Symptom Report
```http
POST /api/symptoms
Content-Type: application/json

{
  "userId": "user_001",
  "location": "Guwahati, Assam",
  "geoLocation": {
    "lat": 26.1445,
    "lng": 91.7362
  },
  "symptoms": ["DIARRHEA", "VOMITING", "FEVER"],
  "severity": "MODERATE",
  "waterSource": "HANDPUMP",
  "duration": "DAYS",
  "waterConsumption": 5,
  "additionalNotes": "Symptoms started after drinking local water"
}

Response: 201 Created
{
  "id": "symptom_report_123",
  "userId": "user_001",
  "location": "Guwahati, Assam",
  "symptoms": ["DIARRHEA", "VOMITING", "FEVER"],
  "severity": "MODERATE",
  "status": "PENDING",
  "reportedAt": "2025-12-08T09:30:00Z"
}
```

#### Get Symptom Reports
```http
GET /api/symptoms/reports

Response: 200 OK
[
  {
    "id": "symptom_report_123",
    "userId": "user_001",
    "location": "Guwahati, Assam",
    "symptoms": ["DIARRHEA", "VOMITING"],
    "severity": "MODERATE",
    "reportedAt": "2025-12-08T09:30:00Z"
  }
]
```

### 5.3 ML & Outbreak Prediction APIs

#### Get Latest Outbreak Prediction
```http
GET /api/outbreak-predictions/latest

Response: 200 OK
{
  "status": "success",
  "risk_score": 91.7,
  "risk_level": "CRITICAL",
  "confidence": 50.0,
  "contributing_factors": {
    "cluster_factor": 37.5,
    "report_factor": 0.3,
    "quality_factor": 0.0,
    "source_factor": 0.0,
    "alert_factor": 4.0,
    "ml_risk_score": 91.7,
    "rule_risk_score": 10.7,
    "final_risk_score": 91.7,
    "fusion_method": 1.0
  },
  "recommendations": [
    "PRIORITY: Immediate intervention required",
    "PRIORITY: Deploy emergency medical teams",
    "Activate outbreak response protocol",
    "Issue public health advisory"
  ]
}
```

#### Get Symptom Clusters
```http
GET /api/symptom-clusters

Response: 200 OK
{
  "clusters": [
    {
      "id": "cluster_0",
      "location": "Tezpur, Riverside",
      "severity_score": 75.0,
      "report_count": 3,
      "dominant_symptoms": ["DIARRHEA", "VOMITING"],
      "status": "ACTIVE"
    }
  ],
  "cluster_count": 1,
  "total_reports": 17
}
```

#### Trigger ML Clustering
```http
POST /api/symptom-clusters/analyze

Response: 200 OK
{
  "success": true,
  "message": "Clustering analysis completed",
  "clusters_found": 1
}
```

### 5.4 Alert APIs

#### Get All Alerts
```http
GET /api/alerts

Response: 200 OK
[
  {
    "id": "alert_123",
    "alertType": "WATER_QUALITY",
    "severity": "HIGH",
    "title": "High Turbidity Detected",
    "description": "Sensor WQ001 reports turbidity of 45 NTU",
    "location": "Guwahati",
    "status": "ACTIVE",
    "createdAt": "2025-12-08T09:00:00Z"
  }
]
```

#### Acknowledge Alert
```http
POST /api/alerts/{id}/acknowledge

Response: 200 OK
{
  "success": true,
  "message": "Alert acknowledged",
  "alertId": "alert_123"
}
```

#### Resolve Alert
```http
POST /api/alerts/{id}/resolve

Response: 200 OK
{
  "success": true,
  "message": "Alert resolved and deleted",
  "alertId": "alert_123"
}
```

### 5.5 Location APIs

#### Get States
```http
GET /api/locations/states

Response: 200 OK
["Assam", "Meghalaya", "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura", "Sikkim"]
```

#### Get Districts
```http
GET /api/locations/districts?state=Assam

Response: 200 OK
["Kamrup Metropolitan", "Jorhat", "Dibrugarh", "Tezpur", ...]
```

### 5.6 Report APIs

#### Generate PDF Report
```http
GET /api/report?state=Assam&district=Kamrup Metropolitan&range=24h

Response: 200 OK (application/pdf)
Binary PDF data
```

---

## 6. Database Schema

### 6.1 Firestore Collections

#### sensor_readings
```json
{
  "id": "reading_123",
  "sensorId": "WQ001",
  "location": "26.1445,91.7362",
  "ph": 7.2,
  "temperature": 25.0,
  "turbidity": 2.5,
  "totalDissolvedSolids": 150,
  "dissolvedOxygen": 6.5,
  "wqi": 12.5,
  "qualityStatus": "Excellent",
  "severity": "LOW",
  "batteryLevel": 85.0,
  "batteryVoltage": 3.7,
  "signalStrength": -65,
  "uptime": 345600,
  "timestamp": "2025-12-08T09:30:00Z"
}
```

#### symptom_reports
```json
{
  "id": "symptom_report_123",
  "userId": "user_001",
  "location": "Guwahati, Assam",
  "geoLocation": {
    "lat": 26.1445,
    "lng": 91.7362
  },
  "symptoms": ["DIARRHEA", "VOMITING", "FEVER"],
  "severity": "MODERATE",
  "waterSource": "HANDPUMP",
  "duration": "DAYS",
  "waterConsumption": 5,
  "additionalNotes": "Symptoms started after drinking local water",
  "status": "PENDING",
  "reportedAt": "2025-12-08T09:30:00Z"
}
```

#### outbreak_predictions
```json
{
  "id": "pred_123",
  "location": "Tezpur, Riverside",
  "riskScore": 91.7,
  "riskLevel": "CRITICAL",
  "confidence": 50.0,
  "contributingFactors": {
    "cluster_factor": 37.5,
    "report_factor": 0.3,
    "quality_factor": 0.0,
    "source_factor": 0.0,
    "alert_factor": 4.0,
    "ml_risk_score": 91.7,
    "rule_risk_score": 10.7,
    "final_risk_score": 91.7,
    "fusion_method": 1.0
  },
  "recommendedActions": [
    "PRIORITY: Immediate intervention required",
    "Deploy emergency medical teams"
  ],
  "status": "ACTIVE",
  "modelVersion": "1.2.0-FUSION",
  "predictionHorizon": 7,
  "predictedDate": "2025-12-08T09:30:00Z",
  "createdAt": "2025-12-08T09:30:00Z"
}
```

#### symptom_clusters
```json
{
  "id": "cluster_0",
  "location": "Tezpur, Riverside",
  "clusterScore": 75.0,
  "reportCount": 3,
  "dominantSymptoms": ["DIARRHEA", "VOMITING"],
  "reportIds": ["report_1", "report_2", "report_3"],
  "status": "ACTIVE",
  "createdAt": "2025-12-08T09:00:00Z"
}
```

#### historical_snapshots
```json
{
  "id": "snapshot_123",
  "timestamp": "2025-12-08T09:00:00Z",
  "avgWQI": 23.5,
  "reportCount": 17,
  "alertCount": 4,
  "clusterCount": 1,
  "poorSensorCount": 4,
  "totalSensorCount": 15
}
```

#### alerts
```json
{
  "id": "alert_123",
  "alertType": "WATER_QUALITY",
  "severity": "HIGH",
  "title": "High Turbidity Detected",
  "description": "Sensor WQ001 reports turbidity of 45 NTU",
  "location": "Guwahati",
  "deviceId": "WQ001",
  "status": "ACTIVE",
  "createdAt": "2025-12-08T09:00:00Z",
  "acknowledgedAt": null,
  "resolvedAt": null
}
```

---

## 7. Deployment Guide

### 7.1 Prerequisites

**System Requirements:**
- Ubuntu 20.04+ or Windows 10+
- 4GB RAM minimum (8GB recommended)
- 20GB disk space
- Internet connection

**Software Requirements:**
- Java 17 (OpenJDK or Oracle)
- Node.js 18+ and npm
- Python 3.9+
- Maven 3.8+
- Git

**Cloud Services:**
- Google Cloud Platform account
- Firebase project with Firestore enabled
- (Optional) N8N instance for webhooks

### 7.2 Backend Deployment

**Step 1: Clone Repository**
```bash
git clone <repository-url>
cd arogyajal/backend
```

**Step 2: Configure Firebase**
```bash
# Download serviceAccountKey.json from Firebase Console
# Place in backend/src/main/resources/
```

**Step 3: Configure application.properties**
```properties
# backend/src/main/resources/application.properties
firebase.credentials.path=classpath:serviceAccountKey.json
ml.service.url=http://localhost:5000
ml.sync.enabled=true
n8n.webhook.url=https://your-n8n-instance.com/webhook/alerts
n8n.webhook.enabled=false
```

**Step 4: Build and Run**
```bash
./mvnw clean package -DskipTests
./mvnw spring-boot:run
```

**Backend will start on:** `http://localhost:8080`

### 7.3 Frontend Deployment

**Step 1: Navigate to Frontend**
```bash
cd DashBoard_Frontend
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Configure Environment**
```bash
# Create .env file
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ML_API_URL=http://localhost:5000
```

**Step 4: Start Development Server**
```bash
npm start
```

**Frontend will start on:** `http://localhost:3000`

**Step 5: Build for Production**
```bash
npm run build
# Output in build/ directory
```

### 7.4 ML Service Deployment

**Step 1: Navigate to ML Directory**
```bash
cd ML
```

**Step 2: Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**Step 3: Install Dependencies**
```bash
pip install -r requirements.txt
```

**Step 4: Start ML Service**
```bash
python start_ml_service.py
```

**ML Service will start on:** `http://localhost:5000`

### 7.5 Production Deployment

**Backend (Spring Boot):**
```bash
# Build JAR
./mvnw clean package -DskipTests

# Run with production profile
java -jar target/arogyajal-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Frontend (React):**
```bash
# Build for production
npm run build

# Serve with nginx or Apache
# Or deploy to Firebase Hosting
firebase deploy --only hosting
```

**ML Service (Flask):**
```bash
# Use gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

---

## 8. Testing & Validation

### 8.1 Unit Testing

**Backend:**
```bash
cd backend
./mvnw test
```

**Frontend:**
```bash
cd DashBoard_Frontend
npm test
```

### 8.2 Integration Testing

**Test Sensor Data Submission:**
```bash
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST001",
    "location": {"lat": 26.1445, "lon": 91.7362},
    "sensors": {
      "PH": 7.2,
      "Turbidity_NTU": 2.5,
      "TDS_ppm": 150,
      "Temperature_C": 25.0
    }
  }'
```

**Test ML Prediction:**
```bash
curl http://localhost:8080/api/outbreak-predictions/latest
```

### 8.3 End-to-End Testing

**Scenario 1: Normal Water Quality**
1. Submit sensor data with good parameters
2. Verify WQI calculation (should be < 25)
3. Check rule-based risk (should be LOW)
4. Verify no alerts generated

**Scenario 2: Poor Water Quality**
1. Submit sensor data with poor parameters (pH > 9, Turbidity > 50)
2. Verify WQI calculation (should be > 75)
3. Check rule-based risk (should be HIGH)
4. Verify alert generated

**Scenario 3: Symptom Outbreak**
1. Submit 5+ symptom reports in same area
2. Wait for ML sync (5 minutes)
3. Verify clustering (should detect 1 cluster)
4. Check ML risk (should be HIGH)
5. Verify fusion selects maximum risk

### 8.4 Performance Testing

**Load Testing:**
- Concurrent sensor submissions: 100 requests/second
- Dashboard refresh rate: 10-60 seconds
- ML sync frequency: 5 minutes
- Expected response time: < 500ms for API calls

**Stress Testing:**
- Maximum sensors: 1000+ devices
- Maximum symptom reports: 10,000+ reports
- Maximum alerts: 500+ active alerts
- Database queries: < 1 second

---

## 9. Troubleshooting

### 9.1 Common Issues

**Backend won't start:**
- Check Java version: `java -version` (should be 17+)
- Verify Firebase credentials path
- Check port 8080 is not in use

**Frontend won't connect:**
- Verify backend is running on port 8080
- Check CORS configuration
- Verify .env file has correct API URL

**ML Service errors:**
- Check Python version: `python --version` (should be 3.9+)
- Verify all dependencies installed
- Check port 5000 is not in use

**ML Sync not working:**
- Check ML service is running
- Verify ml.service.url in application.properties
- Check backend logs for sync errors

### 9.2 Logs

**Backend Logs:**
```bash
tail -f backend/logs/arogyajal-backend.log
```

**Frontend Logs:**
- Browser console (F12)
- Network tab for API calls

**ML Service Logs:**
- Console output
- Check Flask logs

---

## 10. Future Enhancements

### 10.1 Planned Features

1. **Mobile App**: Native Android/iOS apps
2. **Advanced ML**: Deep learning models for better prediction
3. **Real-time Alerts**: Push notifications
4. **Multi-language Support**: Regional languages
5. **Offline Mode**: Offline-first architecture
6. **Advanced Analytics**: Predictive analytics dashboard
7. **Integration**: Integration with government health systems

### 10.2 Scalability

**Horizontal Scaling:**
- Multiple backend instances with load balancer
- ML service clustering
- Firestore automatic scaling

**Vertical Scaling:**
- Increase server resources
- Optimize database queries
- Implement caching layers

---

## 11. Contact & Support

**Project Team:**
- Smart India Hackathon 2025 Team

**Documentation:**
- README.md - Quick start guide
- COMPLETE_PROJECT_DOCUMENTATION.md - This document

**Support:**
- GitHub Issues
- Email: support@arogyajal.in (if available)

---

**Last Updated**: December 8, 2025  
**Version**: 1.1.0  
**Status**: Production Ready

**© 2025 ArogyaJal. Smart India Hackathon 2025. Government of India.**
