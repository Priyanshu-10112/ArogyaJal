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
- Conductivity (µS/cm)

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
- Conductivity > 1000 µS/cm → MEDIUM

### 3. Outbreak Prediction

**ML Model:**
- Algorithm: DBSCAN clustering
- Input: Symptom reports + Water quality + Location
- Output: Risk score (0-100) + Confidence (%)

**Risk Levels:**
- CRITICAL: 75-100
- HIGH: 50-75
- MEDIUM: 25-50
- LOW: 0-25

**Contributing Factors:**
- Cluster Factor (0-50 points)
- Report Factor (0-20 points)
- Quality Factor (0-20 points)
- Water Source Factor (0-10 points)

**Update Frequency:**
- Prediction: Every 60 seconds
- Clustering: On new symptom reports
- Dashboard: Auto-refresh 30s

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
  dissolvedOxygen: number,
  conductivity: number,
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

**Document Version**: 1.0.0  
**Last Updated**: November 25, 2025  
**Status**: Production Ready ✅
