# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Java 17+
- Node.js 16+
- Python 3.8+ (for ML service)
- Maven

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
./mvnw spring-boot:run
```

Wait for: `Started ArogyajalBackendApplication`

### Step 2: Start ML Service (Terminal 2) - Optional

```bash
cd ML
pip install -r requirements.txt
python start_ml_service.py
```

Wait for: `✅ Model loaded successfully`

### Step 3: Start Frontend (Terminal 3)

```bash
cd DashBoard_Frontend
npm install  # First time only
npm start
```

Browser opens at: `http://localhost:3000`

### Step 4: Send Test Data

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
    },
    "battery": {"voltage": 7.2}
  }'
```

### Step 5: View Dashboard

Navigate to:
- **Dashboard:** `http://localhost:3000/` (old) or `/dashboard-new` (new)
- **Trends:** `http://localhost:3000/trends`
- **Map:** `http://localhost:3000/map`
- **Alerts:** `http://localhost:3000/alerts`

## 🎯 What You'll See

### Dashboard
- Latest sensor readings
- Device selector
- Auto-refresh every 5 seconds
- All water quality parameters

### Trends Page
- Time range selector (1h to 30 days)
- Interactive charts for 5 parameters
- Click any parameter to focus
- Latest values display

## 🔧 Configuration

### Backend URL
Edit `DashBoard_Frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

### ML Service URL
Edit `backend/src/main/resources/application.properties`:
```properties
ml.service.url=http://localhost:5000
```

## ✅ Verify Everything Works

```bash
# Check backend
curl http://localhost:8080/api/health

# Check ML service
curl http://localhost:5000/health

# Check devices
curl http://localhost:8080/api/sensor-data/device-ids

# Check trends
curl http://localhost:8080/api/dashboard/water-quality/trends?hours=24
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Java version
java -version  # Should be 17+

# Clean and rebuild
cd backend
./mvnw clean install
```

### Frontend won't start
```bash
# Clear cache
cd DashBoard_Frontend
rm -rf node_modules package-lock.json
npm install
```

### No data showing
```bash
# Send more test data
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/sensor-data \
    -H "Content-Type: application/json" \
    -d "{
      \"deviceId\": \"test-device\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
      \"location\": {\"lat\": 26.91, \"lon\": 75.78},
      \"sensors\": {
        \"pH\": $((7 + i * 0.1)),
        \"turbidity_NTU\": $((20 + i * 5)),
        \"TDS_ppm\": $((400 + i * 20)),
        \"DO_mgL\": $((7 + i * 0.2)),
        \"temperature_C\": $((25 + i * 0.3))
      }
    }"
  sleep 1
done
```

## 📚 Documentation

- **Architecture:** `BACKEND_CENTERED_ARCHITECTURE.md`
- **Migration:** `DashBoard_Frontend/MIGRATION_GUIDE.md`
- **Trends Guide:** `DashBoard_Frontend/TRENDS_GUIDE.md`
- **Complete Summary:** `IMPLEMENTATION_COMPLETE.md`

## 🎓 Key Concepts

### Backend-Centered Architecture
```
IoT → Backend → Firestore ← Backend → Frontend
         ↓
    ML Service
```

### Data Flow
1. IoT sends data to backend
2. Backend calls ML for WQI prediction
3. Backend saves to Firestore
4. Frontend fetches from backend API
5. Frontend displays data

## 🚦 Ports

- **Backend:** 8080
- **Frontend:** 3000
- **ML Service:** 5000
- **Firestore:** Cloud-hosted

## 📝 API Endpoints

### Most Used
- `POST /api/sensor-data` - Submit data
- `GET /api/sensor-data/latest` - Get latest
- `GET /api/sensor-data/device/{id}` - Get by device
- `GET /api/dashboard/water-quality/trends` - Get trends

### Full List
See `BACKEND_CENTERED_ARCHITECTURE.md`

## 🎨 Features

### Dashboard
✅ Device selection
✅ Auto-refresh (5s)
✅ Manual refresh
✅ All sensor parameters
✅ Battery status
✅ Location display

### Trends
✅ Time range selection
✅ 5 water quality parameters
✅ Interactive charts
✅ Latest values
✅ Device count

## 🔐 Security Notes

- Firebase credentials only in backend
- No direct database access from frontend
- CORS configured for localhost
- Ready for authentication layer

## 📊 Performance

- Dashboard: 5-second polling
- Trends: Efficient time-based queries
- Charts: Smooth with 100+ points
- Backend: Handles concurrent requests

## 🎯 Next Steps

1. **Test with real IoT devices**
2. **Customize time ranges**
3. **Add more parameters**
4. **Implement authentication**
5. **Deploy to production**

## 💡 Tips

- Use auto-refresh for monitoring
- Click parameter cards in Trends to focus
- Check backend logs for debugging
- Send multiple test data points for better trends

## 🆘 Need Help?

1. Check logs: `tail -f backend/logs/arogyajal-backend.log`
2. Check browser console (F12)
3. Verify all services are running
4. Review documentation files

---

**Ready to go!** 🎉

Start all three services, send test data, and explore the dashboard and trends pages.
