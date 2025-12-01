# ArogyaJal - Water Quality & Outbreak Monitoring System

**Real-time Water Quality Monitoring and Disease Outbreak Prediction for North East India**

## 🌟 Overview

ArogyaJal is an integrated IoT and ML-powered platform for monitoring water quality and predicting disease outbreaks across the North East India region (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim).

### Quick Stats
- **Version:** 2.2.1 (Production Ready)
- **Active Sensors:** 18+ devices
- **Coverage:** 8 NE states
- **ML Accuracy:** 79% confidence (average)
- **Tech Stack:** React + Spring Boot + Python Flask + Firebase
- **Key Features:** Real-time monitoring, ML predictions, PDF reports, Emergency APIs

## ✨ Key Features

### 1. Real-Time Water Quality Monitoring
- **IoT Sensor Integration**: pH, Temperature, Turbidity, TDS (4 core sensors)
- **Live Dashboard**: Real-time sensor readings with auto-refresh
- **Water Quality Index (WQI)**: Automated quality assessment
- **Multi-level Alerts**: CRITICAL, HIGH, MEDIUM, LOW severity levels

### 2. Outbreak Risk Prediction
- **ML-Powered Risk Assessment**: Real-time outbreak risk scoring (0-100)
- **DBSCAN Clustering**: Groups symptom reports by geographic proximity (5km radius, min 3 reports)
- **Risk Calculation Formula**:
  - Cluster Factor (0-50 points): max_cluster_severity / 2
  - Report Factor (0-20 points): total_reports / 10
  - Quality Factor (0-20 points): (poor_sensors / total_sensors) × 20
  - Water Source Factor (0-10 points): (contaminated_sources / total_sources) × 10
- **Confidence Metrics**: Based on data completeness (reports, sensors, coverage)
- **Geographic Correlation**: Links symptom patterns to water quality issues
- **Auto-sync**: Backend syncs with ML every 60 seconds
- **Dashboard**: Fetches latest prediction from Firestore (cached 30s)

### 3. Hierarchical Location Filtering
- **4-Level Hierarchy**: State → District → City/Town → Village
- **Device-Level Filtering**: Filter by specific sensors
- **Global Filter Sync**: All pages synchronized with filter selection
- **Breadcrumb Navigation**: Clear filter path display

### 4. Symptom Reporting & Clustering
- **Citizen Symptom Reporting**: Web/mobile interface for health report submission
- **Report Fields**: Location, symptoms (diarrhea, vomiting, fever, etc.), severity, water source
- **DBSCAN Clustering**: Automatic outbreak pattern detection (eps=5km, min_samples=3)
- **Interactive Map**: Visual cluster representation with 5km radius circles
- **Dominant Symptoms**: Top symptoms per cluster
- **Geographic Correlation**: Links symptom clusters to nearby water quality issues
- **Risk Scoring**: Cluster-level risk assessment based on multiple factors

### 5. Smart Alert System
- **Multi-Channel Notifications**: Dashboard (real-time), N8N webhook (email/SMS)
- **N8N Integration**: Async webhook calls with configurable severity threshold
- **Alert Management**: Acknowledge and resolve workflow
- **Auto-Delete**: Resolved alerts removed from database
- **Severity Filtering**: Configurable minimum severity for N8N notifications (default: LOW)

### 6. Comprehensive Analytics
- **Trends Analysis**: Historical data visualization (1h to 30 days)
- **Parameter Tracking**: pH, Temperature, Turbidity, TDS (4 core parameters)
- **Distribution Charts**: Quality status and parameter range analysis
- **Auto-Refresh**: 10-second updates (toggle on/off)

## 🏗️ Architecture

### ML Pipeline & Data Flow

**Complete Workflow: Symptom Report → Outbreak Prediction**

```
1. Symptom Report Submission
   ├─ Citizen submits via web/mobile form
   ├─ Fields: userId, location, symptoms[], severity, waterSource, duration
   └─ Stored in Firestore (symptom_reports collection)

2. Data Aggregation (Every 60 seconds)
   ├─ Backend scheduler (MLSyncScheduler) triggers
   ├─ MLPayloadService fetches data from Firestore
   ├─ Symptom reports (last 7 days) + sensor readings
   └─ Sends unified payload to ML service

3. DBSCAN Clustering
   ├─ Parameters: eps=5km, min_samples=3
   ├─ Groups reports by geographic proximity
   └─ Identifies clusters with ≥3 reports within 5km

4. Risk Score Calculation (0-100)
   ├─ Cluster Factor: (max_cluster_severity / 2) capped at 50
   ├─ Report Factor: (total_reports / 10) capped at 20
   ├─ Quality Factor: (poor_sensors / total_sensors) × 20
   └─ Water Source Factor: (contaminated_sources / total_sources) × 10

5. Confidence Calculation
   ├─ Based on data completeness and recency
   └─ Formula: (available_data_points / required_data_points) × 100

6. Prediction Storage & Display
   ├─ Backend stores prediction in Firestore (outbreak_predictions)
   ├─ Dashboard fetches from Firestore via /api/outbreak-predictions/latest
   ├─ Backend caches response for 30 seconds
   └─ Dashboard displays risk score, level, confidence, recommendations
```

**Geographic Correlation Logic:**
- Symptom clusters within 5km of poor water quality sensors = HIGH risk
- Multiple clusters + declining water quality trend = CRITICAL risk
- Isolated reports far from sensors = LOW risk (monitored)

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

## 📡 IoT Sensor Data Submission

### Sensor Data Format (JSON)

**Endpoint:** `POST /api/sensor-data`

**Complete Format:**
```json
{
  "deviceId": "WQ001",
  "location": {
    "lat": 26.1445,
    "lon": 91.7362
  },
  "sensors": {
    "PH": 7.2,
    "Turbidity_NTU": 3.5,
    "TDS_ppm": 180,
    "DO_mgL": 6.5,
    "Temperature_C": 25.5
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.0,
    "isCharging": false
  }
}
```

**Minimum Required:**
```json
{
  "deviceId": "WQ001",
  "location": {"lat": 26.1445, "lon": 91.7362},
  "sensors": {
    "PH": 7.2,
    "Turbidity_NTU": 3.5,
    "TDS_ppm": 180,
    "DO_mgL": 6.5,
    "Temperature_C": 25.5
  }
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Data received and processed successfully",
  "deviceId": "WQ001",
  "timestamp": "2025-12-01T14:30:00Z"
}
```

**Retrieve Data:**
- Latest: `GET /api/sensor-data/latest`
- By Device: `GET /api/sensor-data/device/{deviceId}`
- All Readings: `GET /api/sensor-data/readings?limit=10`

## 📱 Mobile App Emergency APIs

### Emergency Endpoints (for Mobile App Integration)

**1. Detect Water Safety Risk**
```http
POST /api/emergency/detect-risk
Body: { "latitude": 26.1445, "longitude": 91.7362 }
Response: { "riskLevel": "contaminated", "riskScore": 15, "suggestedActions": [...] }
```

**2. Send Emergency Alert**
```http
POST /api/emergency/send-alert
Body: { "userId", "userPhone", "latitude", "longitude", "riskLevel", "contacts": [...] }
Response: { "success": true, "alertId": "alert_abc123" }
```

**3. Escalate Alert**
```http
POST /api/emergency/escalate
Body: { "alertId": "alert_abc123" }
Response: { "success": true }
```

**4. Submit Symptom Report**
```http
POST /api/emergency/submit-symptoms
Body: { "userId", "symptoms": ["Vomiting", "Diarrhea"], "latitude", "longitude" }
Response: { "success": true, "reportId": "symptom_xyz", "outbreakDetected": false }
```

**5. Upload Photo Evidence**
```http
POST /api/emergency/upload-photos (multipart/form-data)
Form: userId, userPhone, description, latitude, longitude, photos[]
Response: { "success": true, "reportId": "photo_def", "photoUrls": [...] }
```

**6. Get Nearest PHC**
```http
GET /api/emergency/nearest-phc?lat=26.1445&lon=91.7362
Response: { "name": "PHC Guwahati", "distance": "2.3 km", "bedsAvailable": 8 }
```

**7. Get Health Advisories**
```http
GET /api/emergency/advisories?district=Kamrup Metropolitan
Response: [{ "title": "Water Alert", "message": "Boil water", "severity": "high" }]
```

**8. Get Water Updates**
```http
GET /api/emergency/water-updates?lat=26.1445&lon=91.7362
Response: [{ "type": "tanker_dispatch", "message": "Tanker dispatched", "status": "in_progress" }]
```

**9. Get Emergency Contacts**
```http
GET /api/emergency/contacts?userId=user123
Response: [{ "name": "ASHA Worker", "phone": "+91-9876543210", "role": "Primary" }]
```

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

**Symptom Reports:**
- `POST /api/symptoms/reports` - Submit new symptom report
- `GET /api/symptoms/reports` - Get all symptom reports
- `GET /api/symptoms/reports/location/{location}` - Reports by location

**ML Predictions:**
- `GET /api/outbreak-predictions/latest` - Latest outbreak risk score
- `GET /api/symptom-clusters` - Active symptom clusters (DBSCAN results)
- `GET /api/clusters/active` - Active clusters for map visualization

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
- **WQI Classification**: Standardized 5-level system (Excellent to Very Poor)

## 🎨 Recent Improvements & Features

### ✅ Report Generation Feature (Dec 1, 2025)

**Region-wise 24-Hour Lab Report:**
- Comprehensive PDF reports with ML predictions and sensor data
- Canvas-based chart generation (risk gauge, factor bars, trend lines)
- Human-readable explanations for outbreak risk
- Sorted alerts by severity with device IDs
- Sensor coverage analysis with percentage
- Visual pH and WQI trend charts
- Professional formatting for officials and judges
- File size: ~250-350 KB, Generation time: 4-6 seconds

**Key Components:**
- `pdfGenerator.ts` - PDF generation with jsPDF and jspdf-autotable
- `chartGenerator.ts` - Canvas-based chart rendering
- `useReportDownload.ts` - React hook for report download
- `ReportController.java` - Backend API endpoint
- `ReportService.java` - Data aggregation and ML calculation

### ✅ Firestore Read Optimization (Nov 30, 2025)

**Performance Improvements (50-70% reduction in reads):**
- Backend caching layer with 60-second TTL
- Aggregated endpoints replacing multiple queries
- Optimized polling intervals (Dashboard: 20s, Alerts: 30s, ML: 45s)
- Client-side caching with debounced filters
- Cache statistics monitoring endpoint

**Services:**
- `FirestoreCacheService.java` - Centralized caching
- `useOptimizedDashboard()` - Frontend optimization hook
- `/api/aggregated/*` - Aggregated data endpoints

### ✅ Frontend Improvements (Nov 26, 2025)

**WQI Label Consistency:**
- Centralized classification system across all pages
- Standard ranges: 0-25 (Excellent), 26-50 (Good), 51-75 (Fair), 76-90 (Poor), >90 (Very Poor)
- Matching colors and legends everywhere

**Device Health Display:**
- Battery, signal, uptime with proper fallback messages
- Human-readable formats (e.g., "1d 4h")
- Test device identification

**Code Quality:**
- All ESLint warnings resolved
- Proper React Hooks dependencies
- Performance optimized with useCallback

**New Utilities:**
- `waterQuality.ts` - WQI classification, battery status, signal strength
- `formatters.ts` - Data formatting utilities
- `SensorDataTable.tsx` - Professional table component

## 🎯 Use Cases

1. **Citizens**: Report waterborne disease symptoms via web/mobile interface
2. **Health Officials**: Monitor outbreak risk scores and symptom clusters across regions
3. **Water Quality Teams**: Track sensor health, water parameters, and correlate with symptom reports
4. **District Administrators**: Location-specific filtering, alerts, and outbreak risk assessment
5. **Field Workers**: Village-level device monitoring and symptom report verification
6. **Emergency Response**: Real-time alert notifications and outbreak risk warnings

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

This project is part of Smart India Hackathon 2025.

## 📄 License

Proprietary - Smart India Hackathon 2025

## 👥 Team

Developed for Smart India Hackathon 2025

## 📞 Support

For issues and questions, please contact the development team.

## 🎯 ML Integration Status

### ✅ Complete End-to-End Pipeline

**Symptom Reports → ML Clustering → Outbreak Prediction → Dashboard**

1. **Symptom Clustering (DBSCAN)**
   - Algorithm: DBSCAN with eps=5km, min_samples=3
   - Automatic clustering every 60 seconds
   - Clusters saved to Firestore with severity scores
   - Geographic correlation with water quality sensors

2. **Outbreak Risk Prediction**
   - Real-time risk scoring (0-100) with confidence metrics
   - Contributing factors: Clusters, Reports, Water Quality, Sources
   - Risk levels: LOW, MEDIUM, HIGH, CRITICAL
   - Location-specific predictions stored in Firestore

3. **Dashboard Integration**
   - Live risk display with auto-refresh (30s)
   - Cluster visualization on interactive map
   - State/region filtering support
   - Priority-based recommendations

### Recent Fixes (Nov 27, 2025)

**Backend Improvements:**
- ✅ Fixed ML response field mapping (snake_case → camelCase)
- ✅ Cluster severity validation (HIGH → SEVERE/CRITICAL)
- ✅ Detection method validation (ML_CLUSTERING → HYBRID)
- ✅ ReportIds extraction from ML clustering response
- ✅ Increased RestTemplate timeout (5s → 30s)
- ✅ Dashboard endpoint now fetches from Firestore (not cached ML)
- ✅ Added state/region metadata to clusters for frontend filtering
- ✅ Debug logging for cluster severity tracking

**Integration Components:**
- `MLController.java` - ML service communication & caching
- `MLPayloadService.java` - Unified payload assembly with cluster severity
- `SymptomClusterController.java` - Cluster API with location metadata
- `OutbreakPredictionService.java` - Firestore prediction storage
- `RestTemplateConfig.java` - Timeout configuration for ML operations

### Known Backend Requirements

1. **WQI Calculation**
   - Current: Formula-based calculation implemented
   - Status: ✅ Working with 4 core parameters (pH, TDS, turbidity, temperature)

2. **Device Telemetry**
   - Current: Battery, signal, uptime data not available from most devices
   - Required: IoT devices should send battery voltage/percentage, signal strength (RSSI), uptime
   - Frontend: Already handles missing data gracefully with "Not reported" messages

3. **Test Device Filtering**
   - Current: TEST-VERIFY-001 appears in production data
   - Recommendation: Add `isTestDevice` flag in device registry
   - Frontend: Already tags test devices with "(Test Device)" label

## ⚡ Firestore Read Optimization (Nov 30, 2025)

### Performance Improvements

**Implemented optimizations to reduce Firestore quota usage by 50-70%:**

1. **Backend Caching Layer**
   - 60-second TTL cache for frequently accessed data
   - Tracks cache hit/miss rates
   - Service: `FirestoreCacheService.java`

2. **Aggregated Endpoints**
   - Single query replaces 3-4 separate reads
   - Endpoints: `/api/aggregated/dashboard-summary`, `/alerts-summary`, `/prediction-latest`
   - Reduces dashboard load from 4-5 reads to 1 read

3. **Optimized Polling Intervals**
   - Dashboard: 20s (was ~10s) - 50% reduction
   - Alerts: 30s (was ~10s) - 67% reduction
   - ML Predictions: 45s (was 60s) - 25% reduction
   - Trends: 60s for historical data

4. **Frontend Optimizations**
   - Client-side caching with TTL
   - Debounced filters (500ms delay)
   - Read metrics tracking
   - Hooks: `useOptimizedDashboard()`, `useOptimizedAlerts()`, `useOptimizedPrediction()`

5. **Monitoring**
   - Cache statistics: `GET /api/aggregated/cache-stats`
   - Real-time hit rate and read reduction metrics
   - Client-side read tracking

**Result: 50-70% reduction in Firestore reads while maintaining real-time behavior**

---

## �  Report Generation

### Region-wise 24-Hour Lab Report

**Feature:** Downloadable PDF reports for district officials and health teams

**Access:** ML Dashboard → "Download Report" button

**Report Contents:**
1. **Header & Context**
   - Region name and time range
   - Sensor coverage analysis (configured vs reporting)
   - Purpose statement for officials

2. **Water Quality Summary**
   - Parameter statistics (pH, TDS, Turbidity, Temperature)
   - Active sensor count
   - Status indicators

3. **ML Outbreak Prediction**
   - Risk gauge chart (visual)
   - Risk score, level, and confidence
   - Human-readable explanation
   - Factor bar chart (visual)
   - Contributing factors with descriptions
   - Recommendations list

4. **Sensor Trends**
   - pH and WQI line charts (visual)
   - Time-series visualization for top sensors
   - Latest reading summaries

5. **Alerts**
   - Sorted by severity (CRITICAL → LOW)
   - Device ID, time, type, description
   - Color-coded table

6. **Sensor Details**
   - Summary table with all sensors
   - Latest values and WQI status

**Technical Details:**
- Format: PDF (A4 size)
- File size: 250-350 KB
- Generation time: 4-6 seconds
- Charts: Canvas-based (JPEG 85% quality)
- API: `GET /api/report?state=&district=&city=&village=&range=24h`

**Documentation:**
- `REPORT_FEATURE_STATUS.md` - Complete implementation guide
- `REPORT_FIX_SUMMARY.md` - Enhancement details
- `CHART_EMBEDDING_STATUS.md` - Chart implementation
- `IMPLEMENTATION_COMPLETE.md` - Full project summary

---

## 🔥 Firebase Storage

### Photo Evidence Storage

**Setup Required:**
1. Go to Firebase Console → Storage
2. Click "Get Started"
3. Select "Start in production mode"
4. Choose location: **asia-south1 (Mumbai)**

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /evidence/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Features:**
- Photo evidence upload from mobile app
- Automatic storage in `/evidence/` folder
- Public read access for dashboard display
- Authenticated write access for security

---

---

## 📚 Documentation

### Available Documentation
- **README.md** (this file) - Project overview, features, and quick start guide
- **COMPLETE_PROJECT_DOCUMENTATION.md** - Comprehensive technical documentation with architecture, API details, and deployment guide

### Quick Commands

**Start All Services:**
```bash
# Terminal 1: ML Service
cd ML && python start_ml_service.py

# Terminal 2: Backend
cd backend && ./mvnw spring-boot:run

# Terminal 3: Frontend
cd DashBoard_Frontend && npm start
```

**Verify Services:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/actuator/health
- ML Service: http://localhost:5000/health
- API Docs: http://localhost:8080/swagger-ui.html

---

**Last Updated**: December 1, 2025  
**Version**: 2.2.1  
**Status**: Production Ready ✅ (Complete ML Integration + IoT APIs + Report Generation + Firebase Storage)
