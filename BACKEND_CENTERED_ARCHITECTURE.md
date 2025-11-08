# Backend-Centered Architecture

## Overview

The application now uses a **backend-centered architecture** where the Spring Boot backend serves as the single source of truth for all data operations.

## Architecture Diagram

```
┌─────────────┐
│ IoT Sensors │
└──────┬──────┘
       │ POST /api/sensor-data
       ↓
┌──────────────────────────────────────┐
│     Spring Boot Backend (Port 8080)  │
│  ┌────────────────────────────────┐  │
│  │  Controllers                   │  │
│  │  - SensorController            │  │
│  │  - DashboardController         │  │
│  │  - AlertController             │  │
│  └────────────┬───────────────────┘  │
│               ↓                      │
│  ┌────────────────────────────────┐  │
│  │  Services                      │  │
│  │  - SensorService               │  │
│  │  - MLPredictionService ────────┼──┐
│  │  - AlertService                │  │
│  └────────────┬───────────────────┘  │
│               ↓                      │
│  ┌────────────────────────────────┐  │
│  │  Firestore Repository          │  │
│  │  - Read/Write sensor data      │  │
│  │  - Query by time range         │  │
│  │  - Filter by device            │  │
│  └────────────┬───────────────────┘  │
└───────────────┼──────────────────────┘
                ↓                      │
       ┌────────────────┐              │
       │   Firestore    │              │
       │   Database     │              │
       └────────────────┘              │
                                       │
                                       ↓
                              ┌─────────────────┐
                              │  ML Service     │
                              │  (Flask:5000)   │
                              │  - WQI Predict  │
                              └─────────────────┘
                ↑
                │ REST API calls
                │
┌───────────────┴──────────────────────┐
│  React Frontend (Port 3000)          │
│  ┌────────────────────────────────┐  │
│  │  Pages                         │  │
│  │  - Dashboard (NEW)             │  │
│  │  - Trends                      │  │
│  │  - Map                         │  │
│  │  - Alerts                      │  │
│  └────────────┬───────────────────┘  │
│               ↓                      │
│  ┌────────────────────────────────┐  │
│  │  API Service                   │  │
│  │  - Axios HTTP client           │  │
│  │  - All backend endpoints       │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Why Backend-Centered?

### Benefits

1. **Single Source of Truth**
   - All data flows through backend
   - Consistent data format
   - Centralized business logic

2. **Security**
   - Firebase credentials only in backend
   - No direct database access from frontend
   - API-level authentication/authorization possible

3. **ML Integration**
   - Backend calls ML service for predictions
   - WQI calculated and stored with sensor data
   - Quality status determined server-side

4. **Data Processing**
   - Time-based filtering in backend
   - Data aggregation and grouping
   - Efficient queries with Firestore indexes

5. **Scalability**
   - Easy to add caching layer
   - Can implement rate limiting
   - Backend can be load-balanced

6. **Maintainability**
   - Clear separation of concerns
   - Frontend focuses on UI/UX
   - Backend handles data logic

## Data Flow Examples

### 1. Sensor Data Submission

```
IoT Device → POST /api/sensor-data
           ↓
Backend receives data
           ↓
Calls ML service for WQI prediction
           ↓
Saves to Firestore with quality status
           ↓
Returns success response
```

### 2. Dashboard View

```
Frontend → GET /api/sensor-data/device/{deviceId}
         ↓
Backend queries Firestore
         ↓
Returns latest sensor reading
         ↓
Frontend displays data
```

### 3. Trends View

```
Frontend → GET /api/dashboard/water-quality/trends?hours=24
         ↓
Backend queries Firestore for time range
         ↓
Groups data by parameter
         ↓
Returns trends data
         ↓
Frontend renders charts
```

## API Endpoints

### Sensor Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensor-data` | Submit sensor data from IoT |
| GET | `/api/sensor-data/latest` | Get latest reading from any device |
| GET | `/api/sensor-data/device/{id}` | Get latest reading for specific device |
| GET | `/api/sensor-data/readings` | Get recent readings (paginated) |
| GET | `/api/sensor-data/all-readings` | Get all sensor readings |
| GET | `/api/sensor-data/device-ids` | Get list of all device IDs |
| GET | `/api/sensor-data/statistics` | Get sensor statistics |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/overview` | Get complete dashboard overview |
| GET | `/api/dashboard/water-quality/trends` | Get trends data with time range |
| GET | `/api/dashboard/sensors/status` | Get sensor health status |
| GET | `/api/dashboard/locations/summary` | Get location-based summary |

### Alert Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/alerts/summary` | Get alerts summary |
| GET | `/api/sensor-data/readings/critical` | Get critical readings |

## Frontend Services

### api.service.ts

Centralized API service that handles all backend communication:

```typescript
// Dashboard
getDashboardOverview()
getWaterQualityTrends(hours)

// Sensor Data
getLatestSensorData()
getSensorDataByDeviceId(deviceId)
getAllSensorReadings()
getReadingsBySensorId(sensorId)
getLatestReadingBySensorId(sensorId)
getRecentReadings(limit)

// Metadata
getDeviceIds()
getSensorStatistics()
```

## Migration from Firebase-Direct to Backend-Centered

### Old Approach (Dashboard.tsx)
```typescript
// Direct Firebase access
import { getFirestore, collection, query } from 'firebase/firestore';
const db = getFirestore(firebaseApp);
const readings = await getDocs(query(collection(db, 'sensor_readings')));
```

### New Approach (DashboardNew.tsx)
```typescript
// Backend API access
import { getSensorDataByDeviceId } from '../services/api.service';
const data = await getSensorDataByDeviceId(deviceId);
```

## Configuration

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8080/api
```

### Backend (application.properties)
```properties
# Firebase configuration
# ML service URL
ml.service.url=http://localhost:5000
```

## Real-time Updates

### Current Implementation
- Frontend polls backend every 5 seconds (configurable)
- Auto-refresh can be toggled on/off
- Manual refresh button available

### Future Enhancement
- WebSocket support for true real-time updates
- Server-Sent Events (SSE) for push notifications
- Firebase Cloud Messaging for alerts

## Testing the Architecture

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Start ML Service (optional)
```bash
cd ML
python start_ml_service.py
```

### 3. Start Frontend
```bash
cd DashBoard_Frontend
npm start
```

### 4. Send Test Data
```bash
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "2025-11-08T15:00:00Z",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 7.2,
      "turbidity_NTU": 25,
      "TDS_ppm": 450,
      "DO_mgL": 7.5,
      "temperature_C": 26.0
    }
  }'
```

### 5. Verify in Frontend
- Dashboard shows latest reading
- Trends page shows data points
- Auto-refresh updates every 5 seconds

## Performance Considerations

### Backend Optimizations
- Firestore indexes for common queries
- Caching layer (Redis) for frequently accessed data
- Connection pooling for database
- Async processing for ML predictions

### Frontend Optimizations
- Debounced API calls
- Local state caching
- Lazy loading for charts
- Pagination for large datasets

## Security Best Practices

1. **API Authentication** (Future)
   - JWT tokens for API access
   - Role-based access control
   - API rate limiting

2. **Data Validation**
   - Backend validates all input
   - Type checking with TypeScript
   - Sanitization of user input

3. **CORS Configuration**
   - Configured in Spring Boot
   - Whitelist allowed origins
   - Secure headers

## Monitoring & Logging

### Backend Logs
```bash
# View backend logs
tail -f backend/logs/arogyajal-backend.log
```

### Frontend Console
- API call logging
- Error tracking
- Performance metrics

## Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:8080/api/health

# Check logs
tail -f backend/logs/arogyajal-backend.log
```

### No Data in Frontend
1. Verify backend is running
2. Check REACT_APP_API_URL in .env
3. Ensure sensor data exists in Firestore
4. Check browser console for errors

### CORS Errors
- Verify CORS configuration in backend
- Check allowed origins
- Ensure proper headers

## Next Steps

### Immediate
- [ ] Add error boundaries in React
- [ ] Implement loading skeletons
- [ ] Add request caching

### Short-term
- [ ] WebSocket for real-time updates
- [ ] API authentication
- [ ] Request rate limiting

### Long-term
- [ ] GraphQL API option
- [ ] Microservices architecture
- [ ] Event-driven architecture with Kafka

## Conclusion

The backend-centered architecture provides a solid foundation for scalability, security, and maintainability. All data flows through the backend, ensuring consistency and enabling advanced features like ML predictions, data aggregation, and centralized business logic.
