# ArogyaJal - Water Quality & Outbreak Monitoring System

**Real-time Water Quality Monitoring and Disease Outbreak Prediction for North East India**

## 🌟 Overview

ArogyaJal is an integrated IoT and ML-powered platform for monitoring water quality and predicting disease outbreaks across the North East India region (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim).

### Quick Stats
- **Version:** 2.2.1 (Demo Ready - ML System 60% Complete)
- **Active Sensors:** 18+ devices
- **Coverage:** 8 NE states
- **ML Confidence:** 45-79% (varies by data availability)
- **Tech Stack:** React + Spring Boot + Python Flask + Firebase
- **Key Features:** Real-time monitoring, ML predictions (partial), PDF reports, Emergency APIs
- **Status:** ⚠️ Core features working, architecture enhancements needed for production

## ✨ Key Features

### 1. Real-Time Water Quality Monitoring
- **IoT Sensor Integration**: pH, Temperature, Turbidity, TDS (4 core sensors)
- **Live Dashboard**: Real-time sensor readings with auto-refresh
- **Water Quality Index (WQI)**: Automated quality assessment
- **Multi-level Alerts**: CRITICAL, HIGH, MEDIUM, LOW severity levels

### 2. Outbreak Risk Prediction ⚠️ (Partial Implementation - 60% Complete)

**✅ Working Features:**
- **ML-Powered Risk Assessment**: Real-time outbreak risk scoring (0-100)
- **DBSCAN Clustering**: Groups symptom reports by geographic proximity (5km radius, min 3 reports)
- **Risk Calculation Formula**:
  - Cluster Factor (0-50 points): max_cluster_severity / 2
  - Report Factor (0-20 points): total_reports / 10
  - Quality Factor (0-20 points): (poor_sensors / total_sensors) × 20
  - Water Source Factor (0-10 points): (contaminated_sources / total_sources) × 10
- **Confidence Metrics**: Based on data completeness (reports, sensors, coverage)
- **Geographic Correlation**: Links symptom patterns to water quality issues
- **Auto-sync**: Backend syncs with ML every 5 minutes (300 seconds)
- **Dashboard**: Fetches latest prediction from Firestore (auto-refresh 60s)

**❌ Missing Features (Needs Implementation):**
- **Hybrid Fusion Logic**: Rule-based WQI and ML predictions not combined
- **Temporal Trends**: No delta/rate-of-change features (cannot detect spike vs sustained)
- **Active Alerts Input**: Alert count not included in ML feature set
- **Historical Comparison**: No 24h/7d trend analysis

**Impact:** System works for demos but may generate false alarms from isolated events. Needs 2-3 days of work for production readiness.

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

## 📡 Mobile App Sync Endpoints

### 1. Water Tests Endpoint

**Upload water quality field test:**
```
POST /api/mobile/water-tests
```

**Request Body:**
```json
{
  "id": "water_test_1733234567890_abc123",
  "sourceType": "handpump",
  "sourceName": "Village Center Pump",
  "pH": "7.2",
  "tds": 450,
  "turbidity": "low",
  "riskLevel": "Medium",
  "latitude": 26.1234,
  "longitude": 91.5678,
  "reporterId": "ASHA001",
  "reporterType": "ASHA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Water test uploaded successfully",
  "data": {
    "id": "water_test_1733234567890_abc123",
    "uploadedAt": "2025-12-03T10:35:00.000Z"
  }
}
```

### 2. Household Surveys Endpoint

**Upload household health survey:**
```
POST /api/mobile/household-surveys
```

**Request Body:**
```json
{
  "id": "survey_1733234567890_xyz789",
  "state": "Assam",
  "district": "Jorhat",
  "village": "Kamalabari",
  "householdId": "AS-321-321101-2025-1234-7",
  "headOfHousehold": "Ram Kumar",
  "totalMembers": "5",
  "waterSource": "Handpump",
  "riskLevel": "Low"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Household survey uploaded successfully",
  "data": {
    "id": "survey_1733234567890_xyz789",
    "uploadedAt": "2025-12-03T10:35:00.000Z"
  }
}
```

### 3. Batch Sync Endpoint (Recommended)

**Upload multiple records in one request:**
```
POST /api/mobile/sync/batch
```

**Request Body:**
```json
{
  "userId": "ASHA001",
  "deviceId": "device_abc123",
  "syncTimestamp": "2025-12-03T10:35:00.000Z",
  "waterTests": [
    { "id": "water_test_123", "sourceType": "handpump", ... }
  ],
  "householdSurveys": [
    { "id": "survey_123", "state": "Assam", ... }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch sync completed",
  "results": {
    "waterTests": {
      "uploaded": 1,
      "failed": 0,
      "ids": ["water_test_123"]
    },
    "householdSurveys": {
      "uploaded": 1,
      "failed": 0,
      "ids": ["survey_123"]
    }
  },
  "syncedAt": "2025-12-03T10:35:00.000Z"
}
```

### Query Endpoints

**Get all water tests:**
```
GET /api/mobile/water-tests
GET /api/mobile/water-tests/{id}
GET /api/mobile/water-tests/reporter/{reporterId}
GET /api/mobile/water-tests/risk/{riskLevel}
```

**Get all household surveys:**
```
GET /api/mobile/household-surveys
GET /api/mobile/household-surveys/{id}
GET /api/mobile/household-surveys/village/{village}
GET /api/mobile/household-surveys/risk/{riskLevel}
```

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

**Mobile App APIs** (`/api/mobile/*`)

*Water Tests:*
- `POST /api/mobile/water-tests` - Upload single water test
- `GET /api/mobile/water-tests` - Get all water tests
- `GET /api/mobile/water-tests/{id}` - Get water test by ID
- `GET /api/mobile/water-tests/reporter/{reporterId}` - Get by reporter
- `GET /api/mobile/water-tests/risk/{riskLevel}` - Get by risk level

*Household Surveys:*
- `POST /api/mobile/household-surveys` - Upload single survey
- `GET /api/mobile/household-surveys` - Get all surveys
- `GET /api/mobile/household-surveys/{id}` - Get survey by ID
- `GET /api/mobile/household-surveys/village/{village}` - Get by village
- `GET /api/mobile/household-surveys/risk/{riskLevel}` - Get by risk level

*Health Reports (Symptom Reports):*
- `POST /api/symptoms` - Submit health/symptom report (mobile)
- `GET /api/symptoms/reports` - Get all health reports
- `GET /api/symptoms/reports/{id}` - Get report by ID
- `GET /api/symptoms/reports/location/{location}` - Get by location

*Issue Reports:*
- `POST /api/mobile/issue-reports` - Upload issue report
- `GET /api/mobile/issue-reports` - Get all issue reports
- `GET /api/mobile/issue-reports/{id}` - Get issue by ID
- `GET /api/mobile/issue-reports/reporter/{reporterId}` - Get by reporter
- `GET /api/mobile/issue-reports/severity/{severity}` - Get by severity
- `GET /api/mobile/issue-reports/status/{status}` - Get by status

*Batch Sync:*
- `POST /api/mobile/sync/batch` - Batch upload (waterTests, householdSurveys, healthReports, issueReports)

**Dashboard APIs** (`/api/*`)

*Sensor Data:*
- `GET /api/sensors/readings` - All sensor readings
- `GET /api/sensor-data/water-quality/{deviceId}` - Device quality assessment

*Alerts:*
- `GET /api/alerts` - All alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/alerts/{id}/resolve` - Resolve and delete alert

*Locations:*
- `GET /api/locations/states` - All states
- `GET /api/locations/districts?state={state}` - Districts by state
- `GET /api/locations/cities?state={state}&district={district}` - Cities
- `GET /api/locations/villages?state={state}&district={district}&city={city}` - Villages
- `GET /api/locations/devices` - Devices by location hierarchy

*ML Predictions:*
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

### ✅ Complete Data Validation & Report Standardization (Dec 2, 2025)

**Production-Ready Report System with 4-Layer Validation:**

1. **Data Validation & Normalization**
   - Region normalization (case-insensitive, special char handling)
   - Sensor data validation (pH 1-14, TDS 0-2000, Turbidity 0-300, Temp 0-80°C)
   - Missing value detection (0.00, null, NaN → "Sensor Not Installed")
   - Invalid readings filtered before aggregation

2. **Report Mode Classification**
   - FULL: All sensors reporting
   - PARTIAL: Some sensors offline
   - NO_DATA: No sensors reporting
   - Automatic mode detection and appropriate messaging

3. **Safety Override System**
   - Prevents false high risk when no data available
   - Suppresses ML prediction if 0 sensors reporting
   - Moves alerts to "Historical" section when no data
   - Clear "DATA_UNAVAILABLE" status

4. **PDF Rendering Fixes**
   - Text sanitization (emojis → text labels: ⚠️ → [Warning])
   - Hidden character removal (zero-width spaces, BOM)
   - HTML list conversion (<ul><li> → plain text bullets)
   - Smart typography normalization (smart quotes → ASCII)
   - Failsafe error handling with placeholders

**Key Improvements:**
- ✅ No false alarms when sensors offline
- ✅ Clean, government-standard PDF output
- ✅ Accurate risk assessment (missing sensors don't inflate scores)
- ✅ Professional messaging and formatting
- ✅ Complete validation metadata for monitoring

**Implementation:**
- `SensorDataValidator.java` - Validation engine
- `ReportService.java` - 4-layer processing pipeline
- `pdfGenerator.ts` - Enhanced text sanitization
- `ReportData.java` - Validation metrics and report modes

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

### ⚠️ PARTIAL IMPLEMENTATION - NEEDS ENHANCEMENT

**Current Status: 60% Complete - Core Features Working, Architecture Gaps Present**

#### ✅ **Working Components:**

1. **DBSCAN Clustering** ✓
   - Algorithm: DBSCAN with eps=5km, min_samples=3, haversine distance
   - Implementation: `ML/api.py` (lines 390-480)
   - Automatic clustering via `/api/ml/cluster` endpoint
   - Clusters saved to Firestore with severity scores
   - Geographic correlation with water quality sensors

2. **Outbreak Risk Prediction** ✓
   - Real-time risk scoring (0-100) with confidence metrics
   - Formula: cluster_factor (0-50) + report_factor (0-20) + quality_factor (0-20) + source_factor (0-10)
   - Risk levels: LOW (<25), MEDIUM (25-50), HIGH (50-75), CRITICAL (75+)
   - Location-specific predictions stored in Firestore
   - Backend sync every 5 minutes (300 seconds)

3. **Dashboard Integration** ✓
   - Live risk display with auto-refresh (60s)
   - Cluster visualization on interactive map
   - Contributing factors breakdown (4 factors)
   - Priority-based recommendations

4. **Rule-Based WQI Calculation** ✓
   - WHO/BIS threshold implementation in `WQICalculator.java`
   - Formula: (pH×0.25) + (Turbidity×0.30) + (TDS×0.25) + (Temperature×0.20)
   - 5-level classification: Excellent, Good, Fair, Poor, Very Poor

#### ❌ **Missing Critical Components:**

1. **NO HYBRID FUSION LOGIC** ⚠️
   - Rule-based WQI and ML predictions run **independently**
   - Missing: `final_risk = max(rule_risk, ml_risk)` fusion
   - Impact: Cannot combine threshold violations with ML predictions
   - **Required for production readiness**

2. **NO TEMPORAL TREND FEATURES** ⚠️
   - No delta/rate-of-change calculation
   - No historical comparison (24h, 7d trends)
   - Cannot distinguish "single spike" vs "sustained trend"
   - Impact: May generate false alarms from isolated events
   - **Required for robust outbreak detection**

3. **MISSING ACTIVE ALERTS INPUT** ⚠️
   - Active alerts count NOT extracted as ML feature
   - System ignores existing alert context
   - Impact: Incomplete risk assessment
   - **Should be included in feature set**

#### 📊 **ML Input Completeness: 70%**

**Present Inputs:**
- ✅ pH, TDS, Turbidity, Temperature (4 core sensors)
- ✅ WQI (calculated)
- ✅ Symptom report counts
- ✅ Spatial clustering features (DBSCAN)

**Missing Inputs:**
- ❌ Active alerts count
- ❌ Trend/delta features (temporal analysis)
- ❌ Historical comparison metrics

#### 🏗️ **Architecture Status: WEAK**

**Current Flow:**
```
Sensors → WQI Calculation (rule-based) → Stored separately
Sensors + Symptoms → ML Prediction → Stored separately
❌ NO FUSION STEP
```

**Required Flow:**
```
Sensors → Rule-based Risk (WQI thresholds)
              ↓
Sensors + Symptoms → ML Risk
              ↓
         FUSION: max(rule_risk, ml_risk) → Final Risk
```

#### 🎯 **Recommendation for SIH Demo:**

**Current System:**
- ✅ Works for basic demos and happy path scenarios
- ✅ Shows ML capabilities (DBSCAN, risk scoring, explainability)
- ⚠️ Vulnerable to judge questions about architecture completeness

**Priority Fixes (2-3 days):**
1. **Implement hybrid fusion logic** (4 hours) - CRITICAL
2. **Add temporal trend features** (6 hours) - HIGH
3. **Include active alerts in features** (2 hours) - MEDIUM

**Without fixes:** Expect judges to rate as "prototype-level" rather than "production-ready"

### Recent Fixes & Known Issues (Dec 3, 2025)

**✅ Working Components:**
- ML response field mapping (snake_case → camelCase)
- Cluster severity validation and scoring
- ReportIds extraction from ML clustering
- RestTemplate timeout configuration (30s)
- Dashboard Firestore integration
- State/region metadata for filtering
- DBSCAN clustering with haversine distance

**⚠️ Known Architectural Gaps (Identified Dec 3, 2025):**
- **NO FUSION LOGIC**: Rule-based WQI and ML predictions not combined
- **NO TREND FEATURES**: Missing temporal delta/rate-of-change calculation
- **MISSING ALERTS INPUT**: Active alerts not included in ML feature set
- **STATIC RISK CALC**: No historical comparison or trend analysis

**Integration Components:**
- `MLController.java` - ML service communication & caching
- `MLPayloadService.java` - Unified payload assembly (needs trend features)
- `SymptomClusterController.java` - Cluster API with location metadata
- `OutbreakPredictionService.java` - Firestore prediction storage (needs fusion logic)
- `RestTemplateConfig.java` - Timeout configuration for ML operations
- `WQICalculator.java` - Rule-based thresholds (needs integration with ML)
- `ML/api.py` - DBSCAN clustering and risk prediction (needs trend inputs)

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

---

**Last Updated**: December 3, 2025  
**Version**: 2.2.1  
**Project Status**: ⚠️ **DEMO READY** (Core Features Working, Architecture Enhancements Needed)

**What's Working:**
- ✅ Real-time water quality monitoring with 18+ sensors
- ✅ IoT sensor data collection and storage
- ✅ DBSCAN clustering for symptom reports (eps=5km, min_samples=3)
- ✅ ML risk scoring (0-100) with 4 contributing factors
- ✅ Dashboard with risk visualization and explainability
- ✅ PDF report generation for officials
- ✅ Alert system with N8N webhook integration
- ✅ Hierarchical location filtering (State → District → City → Village)
- ✅ Mobile app sync endpoints (water tests, surveys, symptom reports)

**What's Missing (ML System - 40%):**
- ❌ Hybrid fusion logic (rule-based + ML combination)
- ❌ Temporal trend features (24h/7d deltas)
- ❌ Active alerts as ML input
- ❌ Historical comparison for spike detection

**Recommendation for SIH:**
- **Current State:** Suitable for demonstrations, shows ML capabilities
- **For Production:** Needs 2-3 days (18 hours) of focused work
- **Expected Score:** 6-7/10 as-is, 9-10/10 with fixes


---

## 🔬 ML SYSTEM DETAILED STATUS REPORT (Dec 3, 2025)

### Executive Summary

**Overall Status:** ⚠️ **60% Complete - Demo Ready, Production Enhancements Needed**

The ML system has **solid foundations** (DBSCAN clustering, risk scoring, explainability) but suffers from **critical architectural gaps** that will be exposed during SIH judging. The system works for basic demos but lacks the robustness expected for production deployment.

### Detailed Component Analysis

#### 1. Input Completeness: ❌ **70% (PARTIAL)**

**✅ Present Inputs:**
- pH, TDS, Turbidity, Temperature (4 core sensors)
- WQI (calculated via formula)
- Symptom report counts (aggregated)
- Spatial clustering features (DBSCAN results)
- Cluster severity scores
- Geographic coordinates

**❌ Missing Inputs:**
- **Active alerts count** - NOT extracted as feature
- **Trend/delta features** - NO temporal analysis
  - Missing: 24h WQI delta
  - Missing: 7d report trend
  - Missing: Cluster growth rate
- **Historical comparison** - NO time-series features

**Impact:** Cannot distinguish "single spike" vs "sustained trend", may generate false alarms.

---

#### 2. Output Completeness: ✅ **100% (PASS)**

**All Required Outputs Present:**
- ✅ Numeric Risk Score (0-100)
- ✅ Categorical Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
- ✅ Confidence score (%)
- ✅ Explanation layer (4 contributing factors)
- ✅ Recommendations (risk-level specific)

**Evidence:** `OutbreakPredictionPanel.tsx` displays all outputs with visual indicators.

---

#### 3. Architecture Validity: ❌ **WEAK - MISSING FUSION**

**✅ Present Components:**
- Rule-based engine (`WQICalculator.java`) - WHO/BIS thresholds
- ML inference layer (`ML/api.py`) - DBSCAN + risk prediction
- Backend orchestration (`MLSyncScheduler.java`) - 5-minute sync

**❌ Critical Missing Component:**
- **NO FUSION LOGIC** - Rule-based and ML predictions are **siloed**
- Missing: `final_risk = max(rule_risk, ml_risk)`
- WQI thresholds and ML predictions never combined

**Current Flow (WRONG):**
```
Sensors → WQI Calculation → Stored separately
Sensors + Symptoms → ML Prediction → Stored separately
❌ NO FUSION
```

**Required Flow (CORRECT):**
```
Sensors → Rule-based Risk (WQI thresholds)
              ↓
Sensors + Symptoms → ML Risk
              ↓
         FUSION: max(rule_risk, ml_risk) → Final Risk
```

**Impact:** Judges will immediately ask "How do you combine rule-based with ML?" and you'll have no answer.

---

#### 4. Behaviour Logic: ⚠️ **PARTIAL - LACKS TREND SENSITIVITY**

**✅ Logical Scenarios (Working):**
- High symptoms + normal water → Risk increases ✓
- Poor water + no symptoms → Medium risk ✓
- No symptoms + safe water → Low risk ✓

**❌ Missing Scenario:**
- **Single spike event** → System CANNOT detect "sustained trend"
- Reason: NO temporal delta features
- Risk calculated from **current snapshot only**

**Risk Formula (Static):**
```python
risk_score = cluster_score + report_score + quality_score + source_score
# Problem: No consideration of whether values are increasing/decreasing
```

**Impact:** May trigger false alarms from isolated events, cannot detect gradual deterioration.

---

#### 5. Explainability: ✅ **100% (PASS)**

**Complete Transparency:**
- ✅ Factor breakdown (4 components with individual scores)
- ✅ Recommendations (risk-level specific actions)
- ✅ Confidence calculation (data completeness based)
- ✅ Dashboard visualization (risk circle, factor bars, recommendations)

**Evidence:** Full explainability layer implemented in `OutbreakPredictionPanel.tsx`.

---

#### 6. Risk of Failure in SIH Judging: ⚠️ **MEDIUM**

**Strengths (Will Impress Judges):**
- ✅ DBSCAN clustering with proper haversine distance
- ✅ Complete output structure with explainability
- ✅ Good dashboard visualization
- ✅ Backend orchestration working

**Weaknesses (Will Be Questioned):**
- ❌ **NO FUSION LOGIC** - "How do you combine rule-based with ML?"
- ❌ **NO TREND FEATURES** - "How do you prevent false alarms from spikes?"
- ❌ **MISSING ALERTS INPUT** - "Why aren't existing alerts considered?"

**Expected Judge Questions:**
1. "Your WQI calculator uses thresholds, but how does that integrate with ML predictions?"
   - **Current Answer:** "They run separately" ❌
   - **Required Answer:** "We use max(rule_risk, ml_risk) fusion" ✅

2. "How do you distinguish a single spike from a sustained outbreak trend?"
   - **Current Answer:** "We don't have temporal features" ❌
   - **Required Answer:** "We calculate 24h/7d deltas and growth rates" ✅

3. "Do you consider existing alerts when predicting new outbreaks?"
   - **Current Answer:** "No, alerts aren't in the feature set" ❌
   - **Required Answer:** "Yes, active alert count is a key feature" ✅

---

### Top 3 Critical Issues

#### **Issue #1: MISSING HYBRID FUSION ARCHITECTURE** 🔴

**Problem:**
- Rule-based WQI and ML predictions run independently
- No `max(rule_risk, ml_risk)` fusion logic
- Cannot combine threshold violations with ML predictions

**Location:** `OutbreakPredictionService.storePredictionFromML()`

**Fix (4 hours):**
```java
// Add to OutbreakPredictionService.storePredictionFromML()
double ruleBasedRisk = calculateRuleBasedRisk(payload);
double mlRisk = mlResult.get("risk_score");
double finalRisk = Math.max(ruleBasedRisk, mlRisk);
String finalLevel = determineRiskLevel(finalRisk);

// Store finalRisk instead of mlRisk
prediction.setRiskScore(finalRisk);
prediction.setRiskLevel(finalLevel);
```

**Impact if Not Fixed:**
- Judges will rate as "incomplete architecture"
- System cannot leverage both rule-based and ML strengths
- May miss outbreaks detected by rules but not ML (or vice versa)

---

#### **Issue #2: NO TEMPORAL TREND FEATURES** 🔴

**Problem:**
- No delta/rate-of-change calculation
- No historical comparison (24h, 7d trends)
- Cannot distinguish "single spike" vs "sustained trend"

**Location:** `MLPayloadService.assembleMLPayload()`

**Fix (6 hours):**
```java
// Add to MLPayloadService.assembleMLPayload()

// Fetch historical data (24h ago, 7d ago)
Map<String, Object> historical24h = getHistoricalData(24);
Map<String, Object> historical7d = getHistoricalData(168);

// Calculate deltas
double wqiDelta24h = currentAvgWQI - historical24h.get("avg_wqi");
double reportDelta24h = currentReports - historical24h.get("report_count");
double clusterDelta7d = currentClusters - historical7d.get("cluster_count");

// Add to payload
payload.put("wqi_trend_24h", wqiDelta24h);
payload.put("report_trend_24h", reportDelta24h);
payload.put("cluster_growth_rate_7d", clusterDelta7d / 7.0);
```

**Impact if Not Fixed:**
- False alarms from isolated events
- Cannot detect gradual deterioration
- Judges will question "How do you handle noise?"

---

#### **Issue #3: MISSING ACTIVE ALERTS INPUT** 🟡

**Problem:**
- Active alerts count NOT extracted as ML feature
- System ignores existing alert context

**Location:** `MLPayloadService.assembleMLPayload()`

**Fix (2 hours):**
```java
// Add to MLPayloadService.assembleMLPayload()
int activeAlerts = alertService.getActiveAlerts().size();
int criticalAlerts = alertService.getActiveAlertsBySeverity("CRITICAL").size();

payload.put("active_alerts", activeAlerts);
payload.put("critical_alerts", criticalAlerts);
```

**Impact if Not Fixed:**
- Incomplete risk assessment
- Judges will ask "Why aren't alerts considered?"

---

### Implementation Priority

**For SIH Demo (2-3 days):**

1. **Day 1 (8 hours):**
   - Morning: Implement hybrid fusion logic (4h)
   - Afternoon: Add temporal trend features (4h)

2. **Day 2 (6 hours):**
   - Morning: Complete trend feature integration (2h)
   - Afternoon: Include active alerts input (2h)
   - Evening: Test behavior consistency (2h)

3. **Day 3 (4 hours):**
   - Morning: Integration testing (2h)
   - Afternoon: Documentation update (2h)

**Total Effort:** 18 hours (2-3 days)

---

### Recommendation

**Current State:**
- ✅ **Demo Ready** - Works for basic demonstrations
- ⚠️ **Not Production Ready** - Missing critical architecture components

**For SIH Judging:**
- **Without Fixes:** Expect "prototype-level" rating, vulnerable to architecture questions
- **With Fixes:** Strong "production-ready" rating, can confidently answer all questions

**Decision:**
- If time permits (2-3 days): **Implement all fixes** for maximum score
- If time limited (<2 days): **Focus on fusion logic only** (Issue #1) - most critical

**Final Verdict:** ⚠️ **NEEDS FIX BEFORE DEMO** for production-ready rating.

---

**Report Generated:** December 3, 2025  
**Reviewer:** ML Pipeline Analysis System  
**Next Review:** After implementing priority fixes
