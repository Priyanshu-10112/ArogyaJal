# ArogyaJal - Complete System Documentation

## Project Overview

**ArogyaJal** is an integrated water quality monitoring and health surveillance system designed for North East India, covering 8 states: Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim.

**Current Status:** ✅ **FULLY OPERATIONAL**
- Backend: Running on http://localhost:8080
- Frontend: Running on http://localhost:3000  
- ML Service: Running on http://localhost:5000
- Admin User: Created and functional

## Admin Access

### Default Admin Credentials
- **Email:** admin@arogyajal.gov.in
- **Password:** admin123
- **Role:** STATE_ADMIN
- **Permissions:** Full system access

### Admin Features
- User registration and management
- System-wide data access
- Alert management
- Report generation
- Configuration management

**Security Note:** Change default password in production environment.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   IoT Sensors   │────▶│  Backend (Java)  │────▶│  Firebase DB    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               │                         │
┌─────────────────┐            │                  ┌─────────────────┐
│   ML Service    │────────────┤                  │   n8n Webhook   │
│   (Python)      │            │                  └─────────────────┘
└─────────────────┘            │
                               │
                               ▼
┌─────────────────┐     ┌──────────────────┐
│  Web Dashboard  │◀────│  REST API        │
│  (React)        │     └──────────────────┘
└─────────────────┘
```

### Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.5.5
- Firebase Admin SDK
- Maven
- Spring Security

**Frontend:**
- React 18
- TypeScript
- React Router v6
- Firebase JS SDK
- Government Theme (Indian Tricolor)

**Database:**
- Firebase Firestore (NoSQL)
- **arogyajal2** - Main data (sensors, symptoms, alerts)
- **arogyajal-user** - User authentication (separate for security)

**ML Service:**
- Python 3.14
- Scikit-learn 1.8.0
- Flask API
- Random Forest Regressor

**ML Endpoints:**
- Health Check: http://localhost:5000/health
- Predict WQI: http://localhost:5000/predict
- Batch Predict: http://localhost:5000/batch-predict
- Model Info: http://localhost:5000/model-info

**Integration:**
- n8n workflow automation
- REST APIs
- Webhooks

## Database Schema

### Firebase Collections

#### 1. sensor_readings (arogyajal2)
```javascript
{
  id: "auto-generated",
  deviceId: "SENSOR_001",
  location: {
    lat: 26.1445,
    lon: 91.7362
  },
  sensors: {
    PH: 7.5,
    Turbidity_NTU: 3.2,
    TDS_ppm: 450,
    Temperature_C: 25.5
  },
  battery: {
    voltage: 3.7
  },
  timestamp: Timestamp,
  qualityStatus: "GOOD"
}
```

#### 2. symptom_reports (arogyajal2)
```javascript
{
  id: "auto-generated",
  userId: "USER_001",
  location: "Village, District",
  geoLocation: { lat: 26.1445, lon: 91.7362 },
  waterSource: "TUBE_WELL",
  patientName: "Patient Name",
  patientAge: 35,
  patientGender: "MALE",
  symptoms: ["DIARRHEA", "FEVER"],
  severity: "MODERATE",
  reportedAt: Timestamp,
  status: "PENDING"
}
```

#### 3. alerts (arogyajal2)
```javascript
{
  id: "auto-generated",
  alertType: "WATER_QUALITY",
  severity: "HIGH",
  title: "pH Level HIGH Alert",
  description: "pH reading: 9.5 (confirmed). Possible diseases: Diarrhea, Skin irritation",
  location: "Village, District",
  sensorId: "SENSOR_001",
  parameter: "pH",
  actualValue: 9.5,
  status: "ACTIVE",
  triggeredAt: Timestamp,
  acknowledgedAt: Timestamp,
  resolvedAt: Timestamp
}
```

#### 4. symptom_clusters (arogyajal2)
```javascript
{
  id: "auto-generated",
  location: "Village, District",
  reportCount: 6,
  reportIds: ["id1", "id2", ...],
  overallSeverity: "SEVERE",
  detectionMethod: "HYBRID",
  clusterScore: 75.5,
  alertId: "alert-id",
  detectedAt: Timestamp,
  status: "ACTIVE"
}
```

#### 5. users (arogyajal-users)
```javascript
{
  id: "auto-generated",
  fullName: "User Name",
  email: "user@example.com",
  phoneNumber: "+91-1234567890",
  role: "DISTRICT_OFFICIAL",
  designation: "Health Officer",
  employeeId: "EMP001",
  jurisdiction: {
    state: "Assam",
    district: "Kamrup",
    block: null,
    village: null
  },
  permissions: {
    canRegisterUsers: false,
    canUpdateSensors: true,
    canInvestigateReports: true,
    canResolveReports: true
  },
  createdAt: Timestamp,
  isActive: true
}
```

## Backend Services

### 1. SensorService
**Responsibilities:**
- Process sensor data
- Validate readings
- Store in Firestore
- Trigger alert checks

**Key Methods:**
- `processAndSaveSensorData(SensorData)`
- `getRecentReadings(limit)`
- `getLatestSensorData()`

### 2. SmartAlertService
**Responsibilities:**
- Intelligent alert generation
- Confirmation-based alerts (2 readings)
- Rate limiting
- Deduplication

**Key Methods:**
- `processSensorReading(SensorReading)`
- `createSmartAlert(reading, severity, confirmed)`
- `checkRateLimit(sensorId)`

**Alert Logic:**
```
1st Reading (HIGH/CRITICAL) → Unconfirmed Alert
2nd Reading (same parameter) → Confirmed Alert → n8n Webhook
Rate Limit: 30 minutes between alerts
```

### 3. AlertService
**Responsibilities:**
- Alert CRUD operations
- n8n webhook integration
- Disease name mapping
- Alert status management

**Key Methods:**
- `createAlert(Alert)`
- `sendAlertToN8N(alertId, severity, location, description, title)`
- `acknowledgeAlert(id, userId)`
- `resolveAlert(id, resolvedBy, notes)`

**n8n Payload:**
```java
{
  "villageName": extracted from location,
  "districtName": extracted from location,
  "issueDetected": determined from parameter/symptoms,
  "reason": specific threshold violation,
  "possibleDiseases": mapped from parameter/symptoms,
  "riskLevel": severity (low/medium/high/critical),
  "action": recommended action based on severity
}
```

### 4. SymptomService
**Responsibilities:**
- Symptom report management
- Cluster detection trigger
- Spike detection

**Key Methods:**
- `saveSymptomReport(SymptomRequest)`
- `getSymptomReports(filters)`
- `updateReportStatus(id, status)`

### 5. SymptomClusterService
**Responsibilities:**
- Detect symptom clusters
- Calculate cluster scores
- Generate cluster alerts

**Key Methods:**
- `createCluster(SymptomCluster)`
- `detectClusters(location, timeRange)`
- `calculateClusterScore(cluster)`

**Cluster Detection:**
```
Threshold: 5+ reports in 24 hours
Score = (reportCount × 10) + (severeCount × 5) + (moderateCount × 2)
Alert if score ≥ 50 or reportCount ≥ 10
```

### 6. AuthService
**Responsibilities:**
- User authentication
- Token management
- Permission validation

**Key Methods:**
- `login(email, password)`
- `logout(token)`
- `validateToken(token)`
- `checkPermission(user, permission)`

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── GovHeader.tsx
│   │   ├── GovSidebar.tsx
│   │   └── GovFooter.tsx
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   └── ui/
├── features/
│   ├── landing/
│   │   └── LandingPage.tsx
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   └── GovDashboard.tsx
│   ├── water-quality/
│   │   ├── WaterQualityA1.tsx
│   │   ├── WaterQualityA2.tsx
│   │   └── WaterQualityA3.tsx
│   ├── disease/
│   │   └── DiseaseSurveillance.tsx
│   ├── symptomReports/
│   │   └── SymptomReportsPage.tsx
│   ├── ml/
│   │   └── MLDashboard.tsx
│   ├── alerts/
│   │   └── AlertsPage.tsx
│   ├── map/
│   │   └── MapPage.tsx
│   └── reports/
│       └── ReportsPage.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── GlobalFilterContext.tsx
│   └── ToastContext.tsx
├── services/
│   └── api.ts
└── App.tsx
```

### State Management

**AuthContext:**
- User authentication state
- Token management
- Permissions
- Jurisdiction

**GlobalFilterContext:**
- State/District/Village filters
- Date range filters
- Shared across components

**ToastContext:**
- Success/Error notifications
- User feedback

### Routing

```typescript
/ → LandingPage (public)
/login → LoginPage (public)
/dashboard → GovDashboard (protected)
/water-quality/a1 → WaterQualityA1 (protected)
/disease-surveillance → DiseaseSurveillance (protected)
/alerts → AlertsPage (protected)
/admin/register-user → UserRegistration (admin only)
```

## UI/UX Design

### Government Theme

**Colors:**
- Saffron: #FF9933
- White: #FFFFFF
- Green: #138808
- Navy Blue: #000080

**Design Principles:**
- Clean, professional layout
- Accessibility compliant
- Mobile responsive
- Government branding

### Landing Page
- Tricolor gradient background
- Feature showcase
- Contact information
- Help resources

### Login Page
- Government emblem
- Secure authentication
- Official design
- Error handling

### Dashboard
- Real-time metrics
- Water quality overview
- Disease surveillance stats
- Quick actions

### Alerts Page
- **Disease Names Display:**
  - Yellow highlighted box
  - ⚠️ Warning icon
  - Extracted from description
  - Prominent placement

## Security Implementation

### Authentication Flow

```
1. User enters credentials
2. POST /api/auth/login
3. Backend validates against Firebase Users
4. Generate JWT token
5. Return token + user data + permissions
6. Frontend stores in localStorage
7. Include token in all API requests
8. Backend validates token on each request
```

### Authorization

**Role-Based:**
```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyMethod() { }
```

**Permission-Based:**
```java
if (!user.getPermissions().canRegisterUsers()) {
    throw new UnauthorizedException();
}
```

**Jurisdiction-Based:**
```java
// Automatic filtering
if (user.getJurisdiction().getState() != null) {
    query.whereEqualTo("state", user.getJurisdiction().getState());
}
```

### Data Protection

1. **Separate Firebase Projects:**
   - Users in arogyajal-users
   - Data in arogyajal2
   - Prevents quota conflicts
   - Better security isolation

2. **Environment Variables:**
   - Never commit credentials
   - Use .env files
   - Different configs per environment

3. **Input Validation:**
   - @Valid annotations
   - Custom validators
   - Sanitize inputs

4. **CORS Configuration:**
   - Whitelist origins
   - Credentials allowed
   - Specific methods

## Performance Optimization

### Backend

**Caching:**
```java
@Cacheable("dashboard")
public DashboardStats getStats() { }
```

**Rate Limiting:**
```java
// 30-minute cooldown between alerts
if (isRateLimited(sensorId, 30)) {
    return;
}
```

**Batch Operations:**
```java
// Bulk acknowledge alerts
bulkAcknowledgeAlerts(List<String> alertIds)
```

### Frontend

**Code Splitting:**
```typescript
const MLDashboard = lazy(() => import('./features/ml/MLDashboard'));
```

**Memoization:**
```typescript
const filteredAlerts = useMemo(() => 
    alerts.filter(a => a.status === statusFilter),
    [alerts, statusFilter]
);
```

**Debouncing:**
```typescript
const debouncedSearch = debounce(searchAlerts, 300);
```

### Firebase

**Query Optimization:**
- Use indexes
- Limit results
- Pagination
- Composite queries

**Quota Management:**
- Cache frequently accessed data
- Batch writes
- Separate projects
- Monitor usage

## Monitoring & Logging

### Backend Logging

```java
log.info("Processing sensor reading: {}", sensorId);
log.warn("Alert rate limited: {}", sensorId);
log.error("Failed to send n8n webhook: {}", e.getMessage());
```

**Log Levels:**
- INFO: Normal operations
- WARN: Potential issues
- ERROR: Failures
- DEBUG: Detailed debugging

**Log File:**
```
logs/arogyajal-backend.log
```

### Frontend Logging

```typescript
console.log('User logged in:', user.email);
console.error('API call failed:', error);
```

### Health Monitoring

**Backend:**
```
GET /actuator/health
GET /actuator/metrics
```

**Metrics:**
- API response times
- Error rates
- Alert counts
- User activity

## Deployment Guide

### Production Checklist

**Backend:**
- [ ] Update Firebase credentials
- [ ] Configure production database
- [ ] Set environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up logging
- [ ] Configure n8n webhook
- [ ] Test all endpoints

**Frontend:**
- [ ] Update API URL
- [ ] Configure Firebase
- [ ] Build production bundle
- [ ] Enable HTTPS
- [ ] Configure CDN
- [ ] Test all pages
- [ ] Verify authentication

**Database:**
- [ ] Create Firebase indexes
- [ ] Set security rules
- [ ] Configure backups
- [ ] Monitor quotas

### Deployment Steps

**Backend:**
```bash
mvn clean package
java -jar target/backend.jar --spring.profiles.active=prod
```

**Frontend:**
```bash
npm run build
# Deploy build/ to hosting (Firebase Hosting, Netlify, etc.)
```

### Environment Configuration

**Development:**
- Local Firebase emulators
- Debug logging
- CORS: localhost

**Production:**
- Production Firebase
- Error logging only
- CORS: production domains
- HTTPS required

## Maintenance

### Regular Tasks

**Daily:**
- Monitor alert counts
- Check error logs
- Verify n8n webhooks

**Weekly:**
- Review Firebase quotas
- Check system performance
- Update documentation

**Monthly:**
- Security updates
- Dependency updates
- Backup verification
- Performance optimization

### Backup Strategy

**Firebase:**
- Automatic daily backups
- Export to Cloud Storage
- Retention: 30 days

**Code:**
- Git repository
- Version tags
- Branch protection

## Troubleshooting Guide

### Common Issues

**Issue: Alerts not showing disease names**
```
Solution:
1. Restart backend
2. Clear browser cache
3. Create new alerts
4. Check alert description field
```

**Issue: n8n webhook failing**
```
Solution:
1. Verify webhook URL
2. Check n8n logs
3. Test with curl
4. Verify payload format
```

**Issue: User can't login**
```
Solution:
1. Check Firebase Users project
2. Verify user exists
3. Check password
4. Review backend logs
```

**Issue: Sensor data not saving**
```
Solution:
1. Check Firebase credentials
2. Verify JSON format
3. Check Firestore rules
4. Review backend logs
```

## API Reference

See COMPLETE_PROJECT_DOCUMENTATION.md for detailed API documentation.

## Support

For technical assistance:
- Check logs first
- Review documentation
- Contact system administrator
- Ministry of Jal Shakti support

---

**System Version:** 1.0.0
**Last Updated:** December 2024
**Maintained by:** Government of India - Ministry of Jal Shakti

## Quick Start Guide

### 1. Start All Services
```bash
# Backend (Spring Boot)
cd backend
./mvnw spring-boot:run

# Frontend (React)
cd DashBoard_Frontend
npm start

# ML Service (Python)
cd ML
python start_ml_service.py
```

### 2. Access System
- **Dashboard:** http://localhost:3000
- **Login:** admin@arogyajal.gov.in / admin123
- **Backend API:** http://localhost:8080
- **ML API:** http://localhost:5000

### 3. Test Data Scripts
```bash
# Send test sensor data
./test-sensor-data.bat

# Send test symptom reports  
./test-symptom-reports.bat

# Create additional admin users
./create-admin.bat
```

### 4. Verify System Health
- ✅ Backend: http://localhost:8080/actuator/health
- ✅ Frontend: http://localhost:3000 (loads dashboard)
- ✅ ML Service: http://localhost:5000/health

---

**System Status:** ✅ FULLY OPERATIONAL
**Version:** 1.0.0
**Last Updated:** January 2026
**Maintained by:** Government of India - Ministry of Jal Shakti