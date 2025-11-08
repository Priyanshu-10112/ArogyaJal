# Water Quality Trends Page

## Overview
The Trends page displays real-time water quality parameter trends over configurable time periods, helping you monitor and analyze water quality changes.

## Features

### 1. **Time Range Selection**
- Last Hour
- Last 6 Hours
- Last 24 Hours (default)
- Last 7 Days
- Last 30 Days

### 2. **Multiple Parameters Tracked**
- **pH Level** - Acidity/alkalinity of water
- **Temperature** (°C) - Water temperature
- **Turbidity** (NTU) - Water clarity
- **Dissolved Oxygen** (mg/L) - Oxygen content
- **Conductivity** (μS/cm) - Electrical conductivity

### 3. **Interactive Line Charts**
- Click on any parameter card to view it in the large chart
- Hover over data points to see exact values
- All parameters displayed in a grid below

### 4. **Pie Charts for Distribution Analysis**
- **Water Quality Status Distribution** - Shows percentage of readings in each quality category (Excellent, Good, Medium, Poor, Very Poor)
- **Parameter Range Distribution** - Shows how the selected parameter values are distributed across different ranges
- Color-coded for easy interpretation
- Hover to see exact counts and percentages

### 5. **Real-time Updates**
- Click "Refresh" button to fetch latest data
- Shows active device count
- Displays latest values for all parameters

## How to Use

### Starting the Application

1. **Start the Backend** (Spring Boot):
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start the ML Service** (if using predictions):
   ```bash
   cd ML
   python start_ml_service.py
   ```

3. **Start the Frontend**:
   ```bash
   cd DashBoard_Frontend
   npm start
   ```

4. Navigate to `http://localhost:3000` and click on "Trends" in the navigation

### Viewing Trends

1. **Select Time Range**: Choose from the dropdown (default: 24 hours)
2. **View Latest Values**: Check the parameter cards at the top
3. **Select Parameter**: Click any parameter card to view it in detail
4. **Refresh Data**: Click the "Refresh" button to get latest readings

### Sending Test Data

To populate the trends with test data:

```bash
# Send a single reading
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

## API Endpoints Used

- `GET /api/dashboard/water-quality/trends?hours={hours}` - Get trends data
- `GET /api/sensor-data/device-ids` - Get list of active devices

## Troubleshooting

### No Data Showing
- Ensure backend is running on `http://localhost:8080`
- Check if sensor data exists within the selected time range
- Verify Firebase/Firestore connection
- Send test data using the curl command above

### Backend Connection Error
- Check if `REACT_APP_API_URL` is set correctly in `.env`
- Default: `http://localhost:8080/api`
- Ensure backend is running and accessible

### Charts Not Rendering
- Check browser console for errors
- Ensure Chart.js is properly installed: `npm install chart.js react-chartjs-2`
- Clear browser cache and reload

## Technical Details

### Data Flow
```
IoT Device → Backend API → Firestore → Backend Trends Endpoint → Frontend
```

### Frontend Stack
- React + TypeScript
- Chart.js for visualizations
- Axios for API calls

### Backend Stack
- Spring Boot
- Firestore for data storage
- REST API endpoints

## Future Enhancements
- [ ] Export trends data to CSV
- [ ] Compare multiple devices
- [ ] Set custom date ranges
- [ ] Add WQI (Water Quality Index) trend
- [ ] Predictive analytics
- [ ] Alert threshold visualization
