# ArogyaJal System Architecture & Data Flow

## 🎯 ArogyaJal's Unique Selling Proposition (USP)

**Machine Learning-Powered Water Quality Prediction**

Unlike traditional water monitoring systems that use simple threshold-based rules, ArogyaJal uses a **trained Random Forest ML model** to:

- **Accurately predict Water Quality Index (WQI)** from sensor readings
- **Analyze complex parameter interactions** that simple rules miss
- **Provide scientific quality assessments** based on real water quality data
- **Continuously improve** as more data is collected

**This ML-powered prediction is the core feature that sets ArogyaJal apart from competitors.**

---

## Complete Data Flow

```
┌─────────────┐
│  IoT Device │ (ESP32, Arduino, Raspberry Pi)
└──────┬──────┘
       │ HTTP POST /api/sensor-data
       │ (JSON with sensor readings)
       ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 1. Receive sensor data                             │ │
│  │ 2. Validate & process                              │ │
│  │ 3. Call ML Service             ──────┐             │ │
│  │ 4. Calculate quality status          │             │ │
│  │ 5. Check alert thresholds            │             │ │
│  │ 6. Save to Firebase                  │             │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────┬───────────────┘
                        │                 │
                        │                 └──────────────┐
                        ▼                                │
              ┌──────────────────┐                       │
              │  Firebase        │                       │
              │  Firestore       │                       │
              │                  │                       │
              │  Collections:    │                       │
              │  -sensor_readings│                       │
              │  - alerts        │                       │
              └──────────────────┘                       │
                        ▲                                │
                        │                                │
                        │ Read data                      │
                        │                                │
              ┌─────────┴────────┐                       │
              │                  │                       │
              │  Frontend        │◄──────────────────────┘
              │  (React)         │   Backend API calls
              │                  │   /api/sensor-data/*
              │  - Dashboard     │   /api/alerts/*
              │  - Trends        │
              │  - Alerts        │
              └──────────────────┘

              ┌──────────────────────────────┐
              │  ML Service (Flask)          │
              │  🎯 PRIMARY - USP            │
              │                              │
              │  - Random Forest Model       │◄─── Called for EVERY reading
              │  - Predict WQI (0-100)       │     by Backend
              │  - Scientific Quality Status │
              │  - Trained on real data      │
              └──────────────────────────────┘
```

## Detailed Flow Steps

### 1. IoT Device → Backend

**Exact JSON Format Expected by Backend:**

```json
POST http://backend:8080/api/sensor-data
Content-Type: application/json

{
  "deviceId": "sensor-001",
  "timestamp": "2025-11-15T00:00:00.000Z",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  },
  "sensors": {
    "PH": 7.2,
    "Temperature_C": 22.5,
    "TDS_ppm": 95,
    "DO_mgL": 9.2,
    "Turbidity_NTU": 0.5
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.5,
    "temperature": 25.0,
    "health": "GOOD",
    "charging": false
  }
}
```

**Field Specifications:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `deviceId` | String | ✅ Yes | Unique device identifier | "sensor-001" |
| `timestamp` | String (ISO 8601) | ❌ No | Reading timestamp (auto-generated if not provided) | "2025-11-15T00:00:00.000Z" |
| `location.lat` | Number | ✅ Yes | Latitude in decimal degrees | 28.6139 |
| `location.lon` | Number | ✅ Yes | Longitude in decimal degrees | 77.2090 |
| `sensors.PH` | Number | ✅ Yes | pH level (0-14) | 7.2 |
| `sensors.Temperature_C` | Number | ✅ Yes | Water temperature in Celsius | 22.5 |
| `sensors.TDS_ppm` | Integer | ✅ Yes | Total Dissolved Solids in ppm | 95 |
| `sensors.DO_mgL` | Number | ✅ Yes | Dissolved Oxygen in mg/L | 9.2 |
| `sensors.Turbidity_NTU` | Number | ✅ Yes | Turbidity in NTU | 0.5 |
| `battery.voltage` | Number | ❌ No | Battery voltage in volts | 3.7 |
| `battery.level` | Number | ❌ No | Battery level (0-100%) | 85.5 |
| `battery.temperature` | Number | ❌ No | Battery temperature in °C | 25.0 |
| `battery.health` | String | ❌ No | Battery health status | "GOOD" |
| `battery.charging` | Boolean | ❌ No | Charging status | false |

**Important Notes:**
- Field names are **case-sensitive**
- Use exact field names: `PH`, `Temperature_C`, `TDS_ppm`, `DO_mgL`, `Turbidity_NTU`
- All 5 sensor readings are required for ML prediction
- Battery information is optional but recommended

### 2. Backend Processing
```java
// SensorService.processAndSaveSensorData()
1. Validate data
2. Set timestamp (if not provided)
3. Convert to SensorReading entity
4. **ML Prediction (PRIMARY METHOD - USP):**
   - Call ML Service: POST http://localhost:5000/predict
   - ML uses Random Forest model trained on water quality data
   - Returns WQI score (0-100) and quality status
   - **This is the core feature of ArogyaJal**
   - Fallback only used if ML service is temporarily unavailable
5. Calculate quality status from ML prediction
6. Check alert thresholds:
   - pH, Temperature, TDS, DO, Turbidity
   - Generate alerts if thresholds exceeded
7. Save to Firebase Firestore:
   - Collection: sensor_readings (with ML prediction)
   - Collection: alerts (if generated)
```

### 3. Backend → ML Service (PRIMARY - USP)
```
Backend calls ML Service for EVERY sensor reading:
POST http://localhost:5000/predict
{
  "ph": 7.2,
  "temperature": 22.5,
  "tds": 95,
  "dissolved_oxygen": 9.2,
  "turbidity": 0.5
}

ML Service (Random Forest Model) responds:
{
  "wqi": 94.5,
  "quality_status": "Excellent",
  "timestamp": "2025-11-15T00:00:00Z"
}

**Why ML is Critical:**
- Trained on real water quality datasets
- Considers complex parameter interactions
- More accurate than simple threshold rules
- Provides scientific WQI score (0-100)
- This is ArogyaJal's competitive advantage

Fallback calculation only used if ML service is down (rare)
```

### 4. Backend → Firebase
```
Backend writes to Firestore:

Collection: sensor_readings
{
  id: "uuid",
  sensorId: "sensor-001",
  timestamp: Timestamp,
  location: "28.6139,77.2090",
  ph: 7.2,
  temperature: 22.5,
  turbidity: 0.5,
  dissolvedOxygen: 9.2,
  totalDissolvedSolids: 95,
  qualityStatus: "EXCELLENT"
}

Collection: alerts (if thresholds exceeded)
{
  id: "uuid",
  alertType: "WATER_QUALITY",
  severity: "CRITICAL",
  deviceId: "sensor-001",
  message: "pH level critical",
  status: "ACTIVE",
  triggeredAt: Timestamp
}
```

### 5. Frontend → Backend → Firebase
```
Frontend requests:
GET http://backend:8080/api/sensor-data/latest
GET http://backend:8080/api/sensor-data/all-readings
GET http://backend:8080/api/alerts

Backend reads from Firebase and returns data to Frontend
```

## Key Points

### ✅ Correct Flow
```
IoT → Backend → Firebase
              ↓
           ML Service (optional)
              ↓
        Quality Status
              ↓
        Alert Generation
              ↓
        Save to Firebase

Frontend → Backend → Firebase (read data)
```

### ❌ NOT This Flow
```
IoT → Backend → Firebase → ML → Frontend  ❌
```

### Why This Architecture?

1. **Backend is Central Hub**
   - All data flows through backend
   - Backend controls ML calls
   - Backend manages Firebase

2. **ML Service is PRIMARY (USP)**
   - Backend ALWAYS calls ML for predictions
   - ML uses trained Random Forest model
   - Provides accurate WQI scores (0-100)
   - Fallback only for resilience (rare)

3. **Firebase is Storage Only**
   - No direct IoT → Firebase
   - No direct Frontend → Firebase
   - Backend manages all Firebase operations

4. **Frontend is Read-Only**
   - Frontend only reads via Backend API
   - No direct Firebase access
   - No direct ML calls

## API Endpoints

### IoT → Backend
- `POST /api/sensor-data` - Submit sensor readings

### Frontend → Backend
- `GET /api/sensor-data/latest` - Latest reading
- `GET /api/sensor-data/device/{id}` - Device data
- `GET /api/sensor-data/all-readings` - All readings
- `GET /api/sensor-data/device-ids` - List devices
- `GET /api/alerts` - All alerts
- `GET /api/alerts/{id}` - Specific alert
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

### Backend → ML Service
- `POST http://localhost:5000/predict` - Get WQI prediction
- `GET http://localhost:5000/health` - Health check

## Data Processing Pipeline

```
1. IoT sends data
   ↓
2. Backend receives & validates
   ↓
3. 🎯 Backend calls ML Service (PRIMARY)
   ├─ ML Random Forest model predicts WQI
   ├─ Success (99% of time) → Use ML prediction ✅
   └─ Failure (rare) → Use fallback calculation
   ↓
4. Backend uses ML-predicted quality status
   ↓
5. Backend checks alert thresholds
   ├─ Threshold exceeded → Create alert
   └─ Normal → No alert
   ↓
6. Backend saves to Firebase
   ├─ sensor_readings collection
   └─ alerts collection (if needed)
   ↓
7. Frontend requests data from Backend
   ↓
8. Backend reads from Firebase
   ↓
9. Backend returns data to Frontend
   ↓
10. Frontend displays data
```

## Component Responsibilities

### IoT Devices
- Read sensor values
- Send data to Backend via HTTP POST
- Handle network connectivity
- Battery management

### Backend (Spring Boot)
- **Central orchestrator**
- Receive IoT data
- Call ML service
- Calculate quality status (with fallback)
- Generate alerts automatically
- Manage Firebase operations
- Serve Frontend API requests
- Handle authentication (future)

### ML Service (Flask)
- **PRIMARY prediction service (USP)**
- Random Forest model trained on water quality data
- Predicts accurate WQI (0-100) from sensor values
- Returns scientific quality status
- **Core competitive advantage of ArogyaJal**
- Should always be running in production

### Firebase Firestore
- **Data storage only**
- Store sensor readings
- Store alerts
- No business logic
- Managed entirely by Backend

### Frontend (React)
- **Display layer only**
- Request data from Backend
- Display dashboard, trends, alerts
- User interactions
- No direct Firebase access
- No direct ML access

## Advantages of This Architecture

1. **ML-Powered (USP)** - Every reading analyzed by trained ML model
2. **Accurate Predictions** - Random Forest model provides scientific WQI scores
3. **Centralized Control** - Backend orchestrates all operations
4. **Resilient** - Fallback ensures system availability (but ML is primary)
5. **Secure** - Frontend can't directly access Firebase
6. **Scalable** - Easy to add authentication, rate limiting
7. **Maintainable** - Clear separation of concerns
8. **IoT-Friendly** - Simple HTTP POST for devices

## Required Sensors & Hardware

### Water Quality Sensors (All Required)

#### 1. pH Sensor
- **Parameter:** pH Level
- **Range:** 0-14
- **Recommended:** DFRobot Gravity Analog pH Sensor Kit V2
- **Price:** ~$30
- **Interface:** Analog
- **Accuracy:** ±0.1 pH
- **JSON Field:** `"PH": 7.2`

#### 2. Temperature Sensor
- **Parameter:** Water Temperature
- **Range:** -55°C to +125°C
- **Recommended:** DS18B20 Waterproof Temperature Sensor
- **Price:** ~$5
- **Interface:** Digital (1-Wire)
- **Accuracy:** ±0.5°C
- **JSON Field:** `"Temperature_C": 22.5`

#### 3. TDS Sensor
- **Parameter:** Total Dissolved Solids
- **Range:** 0-1000 ppm
- **Recommended:** DFRobot Gravity Analog TDS Sensor
- **Price:** ~$10
- **Interface:** Analog
- **Accuracy:** ±10%
- **JSON Field:** `"TDS_ppm": 95`

#### 4. Dissolved Oxygen Sensor
- **Parameter:** Dissolved Oxygen
- **Range:** 0-20 mg/L
- **Recommended:** Atlas Scientific Dissolved Oxygen Kit
- **Price:** ~$200 (or DFRobot Gravity DO Sensor ~$80)
- **Interface:** I2C or Analog
- **Accuracy:** ±0.05 mg/L
- **JSON Field:** `"DO_mgL": 9.2`

#### 5. Turbidity Sensor
- **Parameter:** Water Turbidity
- **Range:** 0-3000 NTU
- **Recommended:** DFRobot Gravity Analog Turbidity Sensor
- **Price:** ~$10
- **Interface:** Analog
- **Accuracy:** ±5%
- **JSON Field:** `"Turbidity_NTU": 0.5`

### Microcontroller Options

#### Option 1: ESP32 (Recommended)
- **WiFi:** Built-in
- **Analog Pins:** 18
- **Digital Pins:** 34
- **Price:** ~$10
- **Power:** 3.3V
- **Best For:** WiFi connectivity, multiple sensors

#### Option 2: Arduino Mega + WiFi Shield
- **Analog Pins:** 16
- **Digital Pins:** 54
- **Price:** ~$40 (with WiFi shield)
- **Power:** 5V
- **Best For:** More I/O pins needed

#### Option 3: Raspberry Pi Zero W
- **WiFi:** Built-in
- **GPIO Pins:** 40
- **Price:** ~$15
- **Power:** 5V
- **Best For:** Complex processing, Python code

### Additional Components

#### GPS Module (for location)
- **Recommended:** NEO-6M GPS Module
- **Price:** ~$10
- **Interface:** UART
- **Provides:** Latitude, Longitude

#### Power Supply
- **Option 1:** Solar Panel + Battery
  - 5W Solar Panel (~$10)
  - 18650 Li-ion Battery (~$5)
  - TP4056 Charging Module (~$2)
- **Option 2:** Power Bank
  - 10000mAh Power Bank (~$15)

### Complete IoT Device BOM (Bill of Materials)

| Component | Quantity | Price (USD) |
|-----------|----------|-------------|
| ESP32 Development Board | 1 | $10 |
| pH Sensor | 1 | $30 |
| Temperature Sensor (DS18B20) | 1 | $5 |
| TDS Sensor | 1 | $10 |
| Dissolved Oxygen Sensor | 1 | $80 |
| Turbidity Sensor | 1 | $10 |
| GPS Module (NEO-6M) | 1 | $10 |
| Solar Panel (5W) | 1 | $10 |
| 18650 Battery + Holder | 1 | $7 |
| TP4056 Charging Module | 1 | $2 |
| Waterproof Enclosure | 1 | $15 |
| Jumper Wires & Connectors | - | $5 |
| **Total** | | **~$194** |

### Wiring Diagram (ESP32)

```
ESP32 Pin Connections:
├─ pH Sensor → GPIO34 (Analog)
├─ Temperature Sensor → GPIO4 (Digital)
├─ TDS Sensor → GPIO35 (Analog)
├─ DO Sensor → GPIO32 (Analog)
├─ Turbidity Sensor → GPIO33 (Analog)
├─ GPS Module → GPIO16 (RX), GPIO17 (TX)
├─ Battery Monitor → GPIO36 (Analog)
└─ Power → 3.3V, GND
```

### Sample ESP32 Code Structure

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Sensor pins
#define PH_PIN 34
#define TEMP_PIN 4
#define TDS_PIN 35
#define DO_PIN 32
#define TURBIDITY_PIN 33
#define BATTERY_PIN 36

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://your-backend:8080/api/sensor-data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  // Initialize sensors
}

void loop() {
  // Read all sensors
  float ph = readPH();
  float temp = readTemperature();
  int tds = readTDS();
  float dissolvedOxygen = readDO();
  float turbidity = readTurbidity();
  float batteryVoltage = readBattery();
  
  // Get GPS location
  float lat = getLatitude();
  float lon = getLongitude();
  
  // Send to backend
  sendToBackend(ph, temp, tds, dissolvedOxygen, turbidity, 
                lat, lon, batteryVoltage);
  
  delay(300000); // Send every 5 minutes
}
```

## Summary

**Actual Flow:**
```
IoT → Backend (processes, calls ML, generates alerts) → Firebase
                                                           ↑
Frontend ← Backend (reads data) ←──────────────────────────┘
```

**NOT:**
```
IoT → Backend → Firebase → ML → Frontend  ❌
```

The Backend is the **central hub** that orchestrates everything!
