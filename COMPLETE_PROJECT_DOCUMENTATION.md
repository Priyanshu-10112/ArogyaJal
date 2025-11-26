# ArogyaJal - Complete Project Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Deployment](#deployment)
7. [User Guide](#user-guide)

---

## System Overview

### Project Vision
ArogyaJal is a comprehensive water quality monitoring and disease outbreak prediction system designed specifically for the North East India region, covering 8 states with real-time IoT sensors and ML-powered analytics.

### Core Objectives
- Real-time water quality monitoring across NE India
- Early disease outbreak detection and prediction
- Hierarchical location-based filtering and analysis
- Automated alert system with multi-channel notifications
- Data-driven decision support for health officials

### Technology Stack Summary
- **Frontend**: React 18 + TypeScript + Leaflet + Chart.js
- **Backend**: Spring Boot 3.2.0 + Firestore
- **ML Service**: Python Flask + scikit-learn
- **IoT**: ESP32 + Multi-parameter sensors
- **Notifications**: N8N workflow automation

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     IoT Sensor Layer                         │
│  ESP32 Devices → Water Quality Sensors → MQTT/HTTP          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Spring Boot  │  │   Firestore  │  │  ML Service  │     │
│  │  REST API    │◄─┤   Database   │◄─┤    Flask     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                                      │             │
│         ▼                                      ▼             │
│  ┌──────────────┐                    ┌──────────────┐     │
│  │ Alert Service│                    │  Clustering  │     │
│  │   + N8N      │                    │   DBSCAN     │     │
│  └──────────────┘                    └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Dashboard                         │
│  React App → Global Filters → Real-time Updates            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Sensor Data Collection**
   - IoT devices collect water parameters
   - Data sent via HTTP POST to backend
   - Stored in Firestore with timestamp

2. **Alert Generation**
   - Backend monitors thresholds
   - Alerts created for violations
   - N8N webhook triggered for notifications

3. **ML Processing**
   - Symptom reports clustered using DBSCAN
   - Outbreak risk calculated
   - Predictions updated every 60s

4. **Dashboard Display**
   - Frontend fetches data via REST APIs
   - Global filters applied
   - Auto-refresh (10-60s intervals)

---

## Features

### 1. Global Filtering System

**Hierarchy Levels:**
```
State (8 NE states)
  └── District
      └── City/Town
          └── Village
              └── Device
```

**Implementation:**
- Context API for global state
- Cascading dropdowns
- Device registry-based filtering
- Breadcrumb navigation
- Filter persistence in localStorage

**Affected Pages:**
- ✅ Main Dashboard
- ✅ Trends
- ✅ Alerts
- ✅ Map
- ✅ ML Dashboard

### 2. Water Quality Monitoring

**Parameters Monitored:**
- pH (6.5-8.5 ideal)
- Temperature (°C)
- Turbidity (NTU)
- Total Dissolved Solids (ppm)

**Quality Status:**
- EXCELLENT (WQI 80-100)
- GOOD (WQI 60-80)
- FAIR (WQI 40-60)
- POOR (WQI 20-40)
- CRITICAL (WQI 0-20)

**Alert Thresholds:**
- pH < 6.5 or > 8.5 → CRITICAL
- Turbidity > 5 NTU → HIGH
- TDS > 500 ppm → MEDIUM

### 3. Symptom Reporting & Outbreak Prediction

#### Symptom Reporting Feature

**Purpose:**
Enable citizens to report waterborne disease symptoms for early outbreak detection.

**User Interface:**
- Web form accessible from dashboard
- Mobile-responsive design
- Simple, intuitive input fields

**Required Fields:**
```javascript
{
  userId: string,           // User identifier (can be anonymous)
  location: string,         // GPS coordinates or address
  symptoms: string[],       // Array: ["DIARRHEA", "VOMITING", "FEVER", "NAUSEA", "ABDOMINAL_PAIN"]
  severity: string,         // "MILD", "MODERATE", "SEVERE"
  waterSource: string,      // "TAP", "WELL", "RIVER", "POND", "HANDPUMP"
  duration: string,         // "HOURS", "DAYS", "WEEKS"
  reportedAt: Timestamp     // Auto-generated
}
```

**Submission Workflow:**
1. User accesses symptom reporting form
2. Fills required fields (location auto-detected if GPS enabled)
3. Submits report via `POST /api/symptoms/reports`
4. Backend validates and stores in Firestore
5. ML service picks up new report in next cycle (60s)
6. User receives confirmation message

**Privacy:**
- Reports can be submitted anonymously
- Location is required but user identity is optional
- Data used only for outbreak detection

#### ML-Based Outbreak Prediction

**Algorithm: DBSCAN (Density-Based Spatial Clustering)**

**Why DBSCAN?**
- Identifies clusters of arbitrary shape
- Handles noise (isolated reports)
- No need to specify number of clusters
- Perfect for geographic data

**Parameters:**
- **eps (epsilon)**: 5 kilometers
  - Rationale: Typical waterborne disease spread radius
  - Reports within 5km considered "neighbors"
- **min_samples**: 3 reports
  - Rationale: Minimum for statistical significance
  - Prevents false alarms from isolated cases

**Clustering Process:**
1. Fetch all symptom reports from last 7 days
2. Convert locations to coordinates (lat, lon)
3. Apply DBSCAN with eps=5km, min_samples=3
4. Identify core points (reports with ≥3 neighbors within 5km)
5. Form clusters by connecting core points
6. Label noise points (isolated reports)

**Risk Score Calculation (0-100):**

```python
# Cluster Factor (0-50 points)
cluster_factor = min(cluster_count × 10, 50)
# More clusters = higher risk, capped at 50

# Report Factor (0-20 points)
report_factor = min(total_reports / 10, 20)
# More reports = higher risk, capped at 20

# Quality Factor (0-20 points)
poor_sensors = count(sensors where WQI > 75)
quality_factor = (poor_sensors / total_sensors) × 20
# More poor quality sensors = higher risk

# Water Source Factor (0-10 points)
contaminated_sources = count(sources with recent issues)
source_factor = (contaminated_sources / total_sources) × 10
# More contaminated sources = higher risk

# Total Risk Score
risk_score = cluster_factor + report_factor + quality_factor + source_factor
# Range: 0-100
```

**Risk Levels:**
- **CRITICAL (75-100)**: Immediate action required
  - Multiple large clusters
  - High report volume
  - Poor water quality widespread
- **HIGH (50-75)**: Close monitoring needed
  - Several clusters detected
  - Moderate report volume
  - Some water quality issues
- **MEDIUM (25-50)**: Watch situation
  - Few small clusters
  - Low report volume
  - Isolated water quality issues
- **LOW (0-25)**: Normal conditions
  - No significant clusters
  - Minimal reports
  - Good water quality overall

**Confidence Calculation:**

```python
# Data Completeness Score
required_data_points = {
  'symptom_reports': 10,      # At least 10 reports
  'water_sensors': 5,         # At least 5 sensors
  'recent_data': True,        # Data within 24 hours
  'geographic_coverage': 0.8  # 80% of region covered
}

available_points = count_available_data()
confidence = (available_points / required_data_points) × 100

# Confidence Interpretation
# 80-100%: High confidence - reliable prediction
# 60-80%: Moderate confidence - use with caution
# <60%: Low confidence - insufficient data
```

**Geographic Correlation Logic:**

1. **Spatial Analysis:**
   - For each symptom cluster, find nearest water sensors (within 10km)
   - Calculate average WQI of nearby sensors
   - If avg WQI > 75 (Poor/Very Poor) → Strong correlation

2. **Temporal Analysis:**
   - Check if water quality declined before symptom reports increased
   - Time lag: 1-3 days (typical incubation period)
   - If quality dropped 3 days ago and reports spiked now → Likely causation

3. **Symptom-Parameter Matching:**
   - Diarrhea + High Turbidity → Bacterial contamination likely
   - Vomiting + High TDS → Chemical contamination possible
   - Fever + Poor overall WQI → Multiple contaminants

4. **Risk Amplification:**
   - Cluster near poor sensor + declining trend → Risk × 1.5
   - Multiple clusters + widespread poor quality → Risk × 2.0
   - Isolated cluster + good water quality → Risk × 0.5

**Update Frequency:**
- **ML Processing**: Every 60 seconds
- **Clustering**: Triggered by new reports or scheduled
- **Risk Calculation**: After each clustering run
- **Dashboard Update**: Auto-refresh every 30 seconds
- **Alert Generation**: Immediate if risk crosses threshold

### 4. Alert Management

**Alert Types:**
- WATER_QUALITY: Parameter violations
- SENSOR_HEALTH: Device issues
- SYMPTOM_CLUSTER: Outbreak patterns

**Alert Workflow:**
```
ACTIVE → ACKNOWLEDGED → RESOLVED (Deleted)
```

**Notification Channels:**
- Dashboard (real-time)
- Email (via N8N)
- SMS (via N8N - configurable)

**Alert Actions:**
- Acknowledge: Mark as seen
- Resolve: Fix issue and delete from DB
- Auto-delete: Resolved alerts removed

### 5. Interactive Maps

**Map Features:**
- Sensor markers (color-coded by WQI)
- Cluster circles (5km radius)
- Alert indicators
- Popup details
- Auto-refresh (15s)

**Color Coding:**
- 🟢 Green: Excellent/Good
- 🟡 Yellow: Fair
- 🟠 Orange: Poor
- 🔴 Red: Critical

### 6. Trends Analysis

**Time Ranges:**
- Last Hour
- Last 6 Hours
- Last 24 Hours
- Last 7 Days
- Last 30 Days

**Chart Types:**
- Line charts: Parameter trends
- Pie charts: Quality distribution
- Bar charts: Parameter ranges

**Features:**
- Auto-refresh toggle (10s)
- Parameter selection
- Device count display
- Latest values summary

---

## API Documentation

### Base URLs
- Backend: `http://localhost:8080/api`
- ML Service: `http://localhost:5000`

### Sensor Endpoints

#### Get All Sensor Readings
```http
GET /api/sensors/readings
Response: Array of SensorReading objects
```

#### Get Water Quality Assessment
```http
GET /api/sensor-data/water-quality/{deviceId}
Response: {
  finalStatus: "GOOD" | "MODERATE" | "HIGH" | "CRITICAL",
  statusReason: string,
  parameterStatus: {...},
  deviceHealth: {...},
  wqiScore: number
}
```

### Alert Endpoints

#### Get All Alerts
```http
GET /api/alerts
Response: Array of Alert objects
Cache: 30 seconds
```

#### Acknowledge Alert
```http
POST /api/alerts/{id}/acknowledge
Body: { userId: string }
Response: Updated Alert object
```

#### Resolve Alert
```http
POST /api/alerts/{id}/resolve
Body: { resolvedBy: string, resolutionNotes: string }
Response: { message: "Alert resolved and deleted successfully" }
Note: Alert is deleted from database
```

#### Get Alert Statistics
```http
GET /api/alerts/statistics
Response: {
  total: number,
  active: number,
  acknowledged: number,
  resolved: number,
  critical: number,
  high: number,
  medium: number,
  low: number
}
```

### Location Endpoints

#### Get States
```http
GET /api/locations/states
Response: Array of state names
```

#### Get Districts
```http
GET /api/locations/districts?state={state}
Response: Array of district names
```

#### Get Cities
```http
GET /api/locations/cities?state={state}&district={district}
Response: Array of city names
```

#### Get Villages
```http
GET /api/locations/villages?state={state}&district={district}&city={city}
Response: Array of village names
Note: city parameter is optional
```

#### Get Devices by Location
```http
GET /api/locations/devices?state={state}&district={district}&city={city}&village={village}
Response: Array of DeviceRegistry objects
Note: All parameters are optional
```

### Symptom Report Endpoints

#### Submit Symptom Report
```http
POST /api/symptoms/reports
Content-Type: application/json

Request Body:
{
  "userId": "user_001",
  "location": "Guwahati - Kamakhya",
  "symptoms": ["DIARRHEA", "FEVER"],
  "severity": "MODERATE",
  "waterSource": "HANDPUMP",
  "duration": "DAYS"
}

Response: 201 Created
{
  "id": "report_12345",
  "userId": "user_001",
  "location": "Guwahati - Kamakhya",
  "symptoms": ["DIARRHEA", "FEVER"],
  "severity": "MODERATE",
  "waterSource": "HANDPUMP",
  "duration": "DAYS",
  "reportedAt": "2025-11-26T10:30:00Z",
  "status": "PENDING"
}
```

#### Get All Symptom Reports
```http
GET /api/symptoms/reports
Response: Array of SymptomReport objects
```

#### Get Reports by Location
```http
GET /api/symptoms/reports/location/{location}
Response: Array of SymptomReport objects for specified location
```

#### Get Reports by User
```http
GET /api/symptoms/reports/user/{userId}
Response: Array of SymptomReport objects for specified user
```

#### Get Reports by Severity
```http
GET /api/symptoms/reports/severity/{severity}
Response: Array of SymptomReport objects (MILD, MODERATE, SEVERE)
```

#### Get Reports by Time Range
```http
GET /api/symptoms/reports/time-range?startSeconds={start}&endSeconds={end}
Response: Array of SymptomReport objects within time range
```

### ML Endpoints

#### Get Latest Outbreak Prediction
```http
GET /api/outbreak-predictions/latest
Response: {
  risk_score: number,
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  confidence: number,
  contributing_factors: {...},
  recommendations: Array<string>
}
```

#### Get Symptom Clusters
```http
GET /api/symptom-clusters
Response: {
  clusters: Array<Cluster>,
  total_reports: number,
  cluster_count: number
}
```

#### Get Active Clusters
```http
GET /api/clusters/active
Response: Array of active cluster objects
Cache: 30 seconds
```

---

## Database Schema

### Collections

#### sensor_readings
```javascript
{
  id: string,
  sensorId: string,
  location: string, // "lat,lon"
  ph: number,
  temperature: number,
  turbidity: number,
  totalDissolvedSolids: number,
  timestamp: Timestamp,
  qualityStatus: string,
  wqi: number,
  severity: string,
  notes: string
}
```

#### alerts
```javascript
{
  id: string,
  alertType: string,
  severity: string,
  title: string,
  description: string,
  location: string,
  sensorId: string,
  parameter: string,
  thresholdValue: number,
  actualValue: number,
  triggeredAt: Timestamp,
  acknowledgedAt: Timestamp,
  resolvedAt: Timestamp,
  status: string,
  resolvedBy: string,
  resolutionNotes: string
}
```

#### symptom_reports
```javascript
{
  id: string,
  location: string,
  symptoms: Array<string>,
  severity: string,
  waterSource: string,
  reportedAt: Timestamp,
  status: string
}
```

#### device_registry
```javascript
{
  deviceId: string,
  lat: number,
  lon: number,
  state: string,
  district: string,
  cityOrTown: string,
  village: string,
  waterSourceType: string,
  verified: boolean,
  geoSource: string,
  rawAddress: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Deployment

### Production Checklist

**Backend:**
- [ ] Configure Firebase credentials
- [ ] Set N8N webhook URL
- [ ] Enable HTTPS
- [ ] Configure CORS origins
- [ ] Set up monitoring
- [ ] Configure logging

**Frontend:**
- [ ] Update API URLs
- [ ] Build production bundle
- [ ] Configure CDN
- [ ] Enable compression
- [ ] Set up analytics

**ML Service:**
- [ ] Install dependencies
- [ ] Configure model paths
- [ ] Set up auto-restart
- [ ] Enable logging
- [ ] Configure health checks

### Environment Variables

**Backend:**
```properties
firebase.credentials.path=/path/to/serviceAccountKey.json
n8n.webhook.url=https://n8n.example.com/webhook/alerts
n8n.webhook.enabled=true
n8n.webhook.min-severity=MEDIUM
server.port=8080
```

**Frontend:**
```env
REACT_APP_API_URL=https://api.arogyajal.com
REACT_APP_ML_API_URL=https://ml.arogyajal.com
```

**ML Service:**
```env
FLASK_ENV=production
PORT=5000
```

---

## User Guide

### For Citizens: Reporting Symptoms

**When to Report:**
- Experiencing waterborne disease symptoms (diarrhea, vomiting, fever, nausea)
- Symptoms started after consuming water from local source
- Multiple family members affected

**How to Submit a Report:**

1. **Access the Reporting Form**
   - Open ArogyaJal dashboard
   - Click "Report Symptoms" button
   - Or use mobile app (if available)

2. **Fill Required Information**
   - **Location**: Auto-detected via GPS or enter manually
   - **Symptoms**: Select all that apply
     - Diarrhea
     - Vomiting
     - Fever
     - Nausea
     - Abdominal Pain
     - Other
   - **Severity**: 
     - Mild (manageable, no medical attention)
     - Moderate (uncomfortable, considering doctor)
     - Severe (requires immediate medical attention)
   - **Water Source**: Where did you get drinking water?
     - Tap water
     - Well
     - River
     - Pond
     - Handpump
     - Other
   - **Duration**: How long have you had symptoms?
     - Hours
     - Days
     - Weeks

3. **Submit Report**
   - Review information
   - Click "Submit Report"
   - Receive confirmation message

4. **What Happens Next**
   - Report stored in system
   - ML service analyzes within 60 seconds
   - If cluster detected, health officials notified
   - Water quality team may investigate nearby sources
   - You may be contacted for follow-up (if contact info provided)

**Privacy & Anonymity:**
- Reports can be submitted anonymously
- Location is required for outbreak detection
- Personal identity is optional
- Data used only for public health purposes

**Important Notes:**
- This is NOT a substitute for medical care
- Seek immediate medical attention for severe symptoms
- Report helps identify outbreak patterns
- Your report may help protect your community

### For Health Officials

**Dashboard Overview:**
1. Select your region using filters (State → District → City → Village)
2. View outbreak risk score (updates every 60s)
3. Monitor active alerts
4. Check sensor health status

**Responding to Alerts:**
1. Click on alert to view details
2. Click "Acknowledge" to mark as seen
3. Take necessary action
4. Click "Resolve & Delete" when fixed

### For Water Quality Teams

**Monitoring Sensors:**
1. Use Map page to see all sensors
2. Click on sensor markers for details
3. Check WQI and parameter values
4. Monitor battery levels

**Analyzing Trends:**
1. Go to Trends page
2. Select time range
3. Choose parameter to analyze
4. Enable auto-refresh for live monitoring

### For District Administrators

**Location-Based Monitoring:**
1. Set global filter to your district
2. All pages will show only your district data
3. View device count in your area
4. Monitor alerts specific to your region

**Generating Reports:**
1. Use Trends page for historical data
2. Export charts (screenshot)
3. View statistics on ML Dashboard
4. Check alert history

---

## Troubleshooting

### Common Issues

**Issue: Sensors not showing data**
- Check if backend is running
- Verify Firebase connection
- Check sensor device connectivity

**Issue: Filters not working**
- Clear browser cache
- Check localStorage
- Verify device registry data

**Issue: Alerts not sending emails**
- Check N8N webhook URL
- Verify webhook is enabled
- Check alert severity threshold

**Issue: ML predictions not updating**
- Check ML service status
- Verify symptom reports exist
- Check clustering parameters

**Issue: Symptom report not appearing in clusters**
- Wait 60 seconds for ML processing cycle
- Check if report meets clustering criteria (≥3 reports within 5km)
- Verify location coordinates are valid
- Check if report is within last 7 days

**Issue: Risk score seems incorrect**
- Verify all contributing factors:
  - Cluster count (check /api/symptom-clusters)
  - Total reports (check /api/symptoms/reports)
  - Water quality sensors (check /api/sensors/readings)
  - Water source status
- Check ML service logs for calculation details
- Ensure data is recent (within 24 hours for high confidence)

**Issue: Cannot submit symptom report**
- Check if all required fields are filled
- Verify location format (coordinates or address)
- Check backend API is running
- Verify Firestore connection
- Check browser console for errors

---

## Performance Optimization

### Caching Strategy
- Alerts: 30s cache
- Clusters: 30s cache
- Sensor readings: No cache (real-time)

### Auto-Refresh Intervals
- Trends: 10s (toggle)
- Alerts: 10s (toggle)
- Map: 15s (automatic)
- ML Dashboard: 30s (automatic)
- Outbreak Prediction: 60s (automatic)

### Database Optimization
- Indexed fields: status, severity, sensorId, location
- Compound indexes for complex queries
- Pagination for large datasets

---

## Glossary of Terms

### Core Concepts

**Symptom Reporting**
- User-submitted health reports indicating potential waterborne illness
- Includes location, symptoms, severity, and water source information

**Symptom Clustering**
- DBSCAN-based grouping of geographically proximate symptom reports
- Identifies patterns that may indicate disease outbreaks

**Outbreak Detection**
- Identification of symptom clusters that exceed threshold (≥3 reports within 5km)
- Triggers investigation and monitoring

**Risk Assessment**
- Comprehensive evaluation of outbreak likelihood
- Considers clusters, water quality, reports, and sources

**Outbreak Risk Prediction**
- ML-calculated score (0-100) indicating probability of disease outbreak
- Updated every 60 seconds based on latest data

**Prediction Confidence**
- Percentage (0-100%) indicating reliability of risk prediction
- Based on data completeness, recency, and geographic coverage

**Geographic Correlation**
- Spatial and temporal analysis linking symptom clusters to water quality issues
- Identifies potential contamination sources

**Water Quality Index (WQI)**
- Composite score (0-100+) indicating overall water quality
- Lower is better: 0-25 Excellent, 26-50 Good, 51-75 Fair, 76-90 Poor, >90 Very Poor

**DBSCAN Parameters**
- **eps (epsilon)**: 5km - maximum distance between neighboring points
- **min_samples**: 3 - minimum reports to form a cluster

### Risk Levels

**CRITICAL (75-100)**
- Immediate action required
- Multiple large clusters detected
- Widespread poor water quality

**HIGH (50-75)**
- Close monitoring needed
- Several clusters present
- Moderate water quality issues

**MEDIUM (25-50)**
- Watch situation
- Few small clusters
- Isolated quality issues

**LOW (0-25)**
- Normal conditions
- No significant patterns
- Good water quality

### Alert Types

**WATER_QUALITY**
- Triggered by sensor parameter violations
- Examples: pH out of range, high turbidity

**SENSOR_HEALTH**
- Device malfunction or connectivity issues
- Examples: Low battery, no data transmission

**SYMPTOM_CLUSTER**
- Outbreak pattern detected by ML
- Examples: Multiple reports in same area

### Data Sources

**IoT Sensors**
- ESP32-based devices measuring water parameters
- Transmit data via HTTP/MQTT

**Symptom Reports**
- Citizen-submitted health reports
- Stored in Firestore database

**Device Registry**
- Master list of all sensors with locations
- Used for filtering and mapping

**Outbreak Predictions**
- ML-generated risk scores
- Cached for 60 seconds

## Future Enhancements

1. **Mobile App**: Native iOS/Android apps
2. **Advanced ML**: Deep learning models
3. **Predictive Maintenance**: Sensor failure prediction
4. **Multi-language**: Support for regional languages
5. **Offline Mode**: PWA with offline capabilities
6. **Advanced Analytics**: Custom report generation
7. **Integration**: Government health systems
8. **Real-time Collaboration**: Multi-user features

---

## Recent Updates (November 26, 2025)

### Frontend Optimization for SIH Demo

#### ✅ Critical Fixes Implemented

**1. WQI Label Consistency**
- **Problem**: WQI 50.0 labeled as "GOOD" in some places, "FAIR" in others
- **Solution**: Created centralized `waterQuality.ts` utility
- **Standard Classification**:
  ```
  0-25   → Excellent (Green #10b981)
  26-50  → Good (Green #22c55e)
  51-75  → Fair (Amber #f59e0b)
  76-90  → Poor (Orange #f97316)
  >90    → Very Poor (Red #ef4444)
  ```
- **Impact**: Consistent labeling across Dashboard, Map, ML Dashboard, Trends pages

**2. Trends Page Enhancements**
- **Fixed**: pH chart Y-axis from 0-1 to proper 0-14 scale
- **Added**: Comprehensive "No Historical Data Available" empty state
- **Improved**: Context-aware messaging based on active filters
- **Changed**: "N/A" to "No data" for better clarity

**3. Device Health Display**
- **Battery**: Shows percentage or "Not reported" (not just "%")
- **Signal**: Shows status or "Not reported" (not "Unknown (dBm)")
- **Uptime**: Human-readable format (e.g., "1d 4h") or "Not available"
- **Warnings**: Aligned with actual battery levels (<30% = warning)

**4. Location Display**
- **Fixed**: Leading comma bug (", Barpeta" → "Barpeta")
- **Added**: `formatLocation()` utility for clean strings
- **Improved**: Coordinate-to-name mapping

**5. Device Management**
- **Deduplication**: Only latest reading per device shown in ML Dashboard
- **Test Devices**: Tagged with "(Test Device)" label
- **No Duplicates**: Eliminated multiple cards with different timestamps

**6. Code Quality**
- **ESLint**: All warnings resolved
- **React Hooks**: Proper dependencies with useCallback
- **Performance**: Optimized re-renders
- **Clean Code**: Removed unused imports and variables

#### 📁 New Files Created

**`DashBoard_Frontend/src/utils/waterQuality.ts`** (350+ lines)
- `getWaterQualityClassification(wqi)` - Returns label, severity, color, description
- `getBatteryStatus(percentage, voltage)` - Battery health with warnings
- `getSignalStatus(strength)` - Signal strength classification
- `formatUptime(seconds, lastSeen)` - Human-readable uptime
- `formatLocation(location)` - Clean location strings
- `getDeviceFriendlyName(deviceId, location)` - User-friendly names
- `isTestDevice(deviceId)` - Test device detection
- `WQI_LEGEND` - Standardized legend data for all pages

#### 📝 Modified Components

**`DeviceHealthCard.tsx`**
- Integrated centralized WQI classification
- Fixed battery/signal/uptime display
- Added test device tagging
- Cleaned location display

**`MapPage.tsx`**
- Unified legend using WQI_LEGEND constant
- Consistent marker colors
- Added WQI label in sensor popups

**`Trends.tsx`**
- Fixed pH chart Y-axis (0-14)
- Better empty state handling
- Improved data availability checks

**`MLDashboard.tsx`**
- Implemented sensor deduplication
- Shows only latest reading per device

#### 🐛 Known Issues (Backend Requirements)

**1. WQI Calculation**
- **Current**: Returns constant 50.0 for most devices
- **Required**: Implement actual calculation based on sensor parameters
- **Formula**: Weighted average of pH, TDS, turbidity, temperature (4 core parameters)
- **Frontend Status**: ✅ Displays consistently with proper labels

**2. Device Telemetry**
- **Current**: Battery, signal, uptime data not available
- **Required**: IoT devices should send battery voltage, RSSI, uptime
- **Frontend Status**: ✅ Handles gracefully with "Not reported" messages

**3. Test Device Filtering**
- **Current**: TEST-VERIFY-001 appears in production
- **Recommendation**: Add `isTestDevice` flag in device registry
- **Frontend Status**: ✅ Tags test devices clearly

#### 📊 Before vs After

**WQI Display:**
```
Before: WQI 50.0 = "GOOD" (inconsistent)
After:  WQI 50.0 = "Good" (consistent everywhere)
```

**Trends Page:**
```
Before: pH chart 0-1 scale, empty charts with no explanation
After:  pH chart 0-14 scale, clear "No data" messaging
```

**Device Health:**
```
Before: Battery: %  |  Signal: Unknown (dBm)  |  Uptime: N/A
After:  Battery: 85% or "Not reported"  |  Signal: Good (-65 dBm) or "Not reported"  |  Uptime: 1d 4h or "Not available"
```

#### 🎯 Demo Readiness

**Status**: ✅ **PRODUCTION READY FOR SIH DEMO**

All frontend issues resolved. The application now presents:
- Professional, polished interface
- Consistent labeling and terminology
- Clear messaging for missing data
- No confusing placeholders or technical jargon
- Proper handling of edge cases
- Clean, maintainable code

**Recommended Next Steps (Backend Team)**:
1. Implement actual WQI calculation logic
2. Ensure IoT devices send battery/signal telemetry
3. Add `isTestDevice` flag to device registry
4. Review and test complete flow end-to-end

---

**Document Version**: 1.1.0  
**Last Updated**: November 26, 2025  
**Status**: Production Ready ✅ (Frontend optimized for SIH Demo)
