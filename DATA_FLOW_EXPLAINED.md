# Data Flow: Real-time vs Static

## Quick Answer

**All data is REAL** - it comes from actual IoT sensors → Backend → Firestore database.

**Update method varies by page:**
- **Trends Page:** Real data with auto-refresh (10s) or manual refresh
- **Dashboard (New):** Real data with auto-refresh (5s) or manual refresh  
- **Dashboard (Old):** Real data with true real-time Firebase updates

## Detailed Data Flow

### 1. Data Collection (Real-time)

```
IoT Sensor → Measures water quality
     ↓
Sends HTTP POST to backend
     ↓
Backend receives data
     ↓
Backend calls ML service for WQI prediction
     ↓
Backend saves to Firestore with quality status
```

**This happens in real-time** when sensors send data.

### 2. Data Display (Different methods)

#### Option A: Trends Page (Polling - 10 seconds)

```
Frontend → GET /api/dashboard/water-quality/trends
         ↓
Backend queries Firestore
         ↓
Returns data to frontend
         ↓
Frontend displays charts
         ↓
Wait 10 seconds (if auto-refresh enabled)
         ↓
Repeat
```

**Update frequency:** Every 10 seconds (configurable)
**Method:** HTTP polling
**Pros:** Simple, reliable, works everywhere
**Cons:** 10-second delay for new data

#### Option B: Dashboard New (Polling - 5 seconds)

```
Frontend → GET /api/sensor-data/device/{id}
         ↓
Backend queries Firestore
         ↓
Returns latest reading
         ↓
Frontend displays data
         ↓
Wait 5 seconds (if auto-refresh enabled)
         ↓
Repeat
```

**Update frequency:** Every 5 seconds (configurable)
**Method:** HTTP polling
**Pros:** Faster updates than Trends
**Cons:** 5-second delay for new data

#### Option C: Dashboard Old (True Real-time)

```
Frontend → Firebase onSnapshot listener
         ↓
Firestore detects new data
         ↓
Pushes update to frontend instantly
         ↓
Frontend displays data immediately
```

**Update frequency:** Instant (< 1 second)
**Method:** WebSocket/Firebase real-time
**Pros:** Instant updates, no polling
**Cons:** More complex, requires Firebase SDK

## Comparison Table

| Feature | Trends Page | Dashboard New | Dashboard Old |
|---------|-------------|---------------|---------------|
| **Data Source** | Real (Backend API) | Real (Backend API) | Real (Firebase Direct) |
| **Update Method** | Polling (10s) | Polling (5s) | WebSocket (instant) |
| **Auto-refresh** | ✅ Toggle on/off | ✅ Toggle on/off | ✅ Always on |
| **Manual Refresh** | ✅ Button | ✅ Button | ❌ Not needed |
| **Delay** | 10 seconds | 5 seconds | < 1 second |
| **Network Usage** | Low | Medium | Medium |
| **Complexity** | Simple | Simple | Complex |
| **Backend Required** | ✅ Yes | ✅ Yes | ❌ No |

## What "Real-time" Means

### True Real-time (Dashboard Old)
- Data appears **instantly** when sensor sends it
- Uses WebSocket connection
- No polling, no delay
- Like a live video stream

### Near Real-time (Dashboard New)
- Data appears within **5 seconds**
- Polls backend every 5 seconds
- Small delay, but acceptable for most use cases
- Like checking your email every 5 seconds

### Periodic Updates (Trends Page)
- Data appears within **10 seconds**
- Polls backend every 10 seconds
- Suitable for trend analysis
- Like checking weather every 10 minutes

## Example Timeline

### Scenario: Sensor sends data at 10:00:00

**Dashboard Old (True Real-time):**
```
10:00:00.000 - Sensor sends data
10:00:00.100 - Backend saves to Firestore
10:00:00.200 - Frontend receives update via WebSocket
10:00:00.300 - User sees new data
```
**Total delay: ~300ms**

**Dashboard New (5s polling):**
```
10:00:00.000 - Sensor sends data
10:00:00.100 - Backend saves to Firestore
10:00:03.000 - Frontend polls backend (scheduled)
10:00:03.100 - User sees new data
```
**Total delay: ~3 seconds** (depends on polling schedule)

**Trends Page (10s polling):**
```
10:00:00.000 - Sensor sends data
10:00:00.100 - Backend saves to Firestore
10:00:08.000 - Frontend polls backend (scheduled)
10:00:08.100 - User sees new data
```
**Total delay: ~8 seconds** (depends on polling schedule)

## Why Different Methods?

### Trends Page (10s polling)
- **Purpose:** Analyze historical trends
- **Need:** Don't need instant updates
- **Benefit:** Less network traffic, better for charts with lots of data

### Dashboard New (5s polling)
- **Purpose:** Monitor current status
- **Need:** Quick updates, but not instant
- **Benefit:** Simple, reliable, backend-centered architecture

### Dashboard Old (instant)
- **Purpose:** Real-time monitoring
- **Need:** Instant updates critical
- **Benefit:** True real-time, no delay

## How to Change Update Frequency

### Trends Page

In `DashBoard_Frontend/src/pages/Trends.tsx`:

```typescript
// Change from 10 seconds to 5 seconds
const interval = setInterval(() => {
  fetchTrends();
  fetchAllReadings();
}, 5000); // Change 10000 to 5000
```

### Dashboard New

In `DashBoard_Frontend/src/pages/DashboardNew.tsx`:

```typescript
// Change from 5 seconds to 3 seconds
const interval = setInterval(() => {
  if (selectedDeviceId) {
    fetchSensorData(selectedDeviceId);
  } else {
    fetchLatestData();
  }
}, 3000); // Change 5000 to 3000
```

## Network Traffic Comparison

### 1 Hour of Monitoring

**Dashboard Old (WebSocket):**
- Initial connection: 1 request
- Updates: 0 requests (pushed by server)
- **Total: 1 request**

**Dashboard New (5s polling):**
- Polls: 720 requests (3600s / 5s)
- **Total: 720 requests**

**Trends Page (10s polling):**
- Polls: 360 requests (3600s / 10s)
- **Total: 360 requests**

**Note:** Polling uses more requests but is simpler and more reliable.

## When to Use Which?

### Use Trends Page (10s) When:
- ✅ Analyzing historical data
- ✅ Viewing trends over time
- ✅ Network bandwidth is limited
- ✅ Don't need instant updates

### Use Dashboard New (5s) When:
- ✅ Monitoring current status
- ✅ Need quick updates
- ✅ Want backend-centered architecture
- ✅ 5-second delay is acceptable

### Use Dashboard Old (instant) When:
- ✅ Need instant updates
- ✅ Monitoring critical parameters
- ✅ Real-time response required
- ✅ Already using Firebase extensively

## Future: WebSocket for All Pages

### Planned Enhancement

Replace polling with WebSocket for true real-time updates:

```
Frontend ←→ WebSocket ←→ Backend ←→ Firestore
```

**Benefits:**
- Instant updates for all pages
- Less network traffic
- Better user experience
- Still backend-centered

**Implementation:**
- Add WebSocket support to Spring Boot backend
- Update frontend to use WebSocket client
- Maintain backward compatibility with polling

## Testing Real-time Updates

### Test 1: Send Data and Watch

```bash
# Terminal 1: Watch Trends page
# Open http://localhost:3000/trends
# Enable auto-refresh

# Terminal 2: Send data
curl -X POST http://localhost:8080/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "location": {"lat": 26.91, "lon": 75.78},
    "sensors": {
      "pH": 7.2,
      "turbidity_NTU": 25,
      "TDS_ppm": 450,
      "DO_mgL": 7.5,
      "temperature_C": 26.0
    }
  }'

# Watch the Trends page - data appears within 10 seconds
```

### Test 2: Continuous Data Stream

```bash
# Send data every 3 seconds
while true; do
  curl -X POST http://localhost:8080/api/sensor-data \
    -H "Content-Type: application/json" \
    -d "{
      \"deviceId\": \"test-device\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
      \"location\": {\"lat\": 26.91, \"lon\": 75.78},
      \"sensors\": {
        \"pH\": $((RANDOM % 30 + 65))/10,
        \"turbidity_NTU\": $((RANDOM % 50 + 10)),
        \"TDS_ppm\": $((RANDOM % 400 + 300)),
        \"DO_mgL\": $((RANDOM % 40 + 50))/10,
        \"temperature_C\": $((RANDOM % 100 + 200))/10
      }
    }"
  sleep 3
done

# Watch charts update in real-time
```

## Summary

### Data is REAL
✅ All data comes from actual sensors
✅ Stored in Firestore database
✅ Processed by ML service for WQI
✅ No static/dummy data

### Updates are CONFIGURABLE
- **Instant:** Dashboard Old (WebSocket)
- **5 seconds:** Dashboard New (polling)
- **10 seconds:** Trends Page (polling)
- **Manual:** Click refresh button anytime

### You Control It
- Toggle auto-refresh on/off
- Click manual refresh anytime
- Change polling intervals in code
- Choose which dashboard to use

---

**Bottom Line:** Your data is 100% real and live. The only difference is how quickly the UI updates to show new data - from instant (WebSocket) to 10 seconds (polling).
