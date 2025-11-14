# Complete IoT & Sensor Integration Guide

## 1. Sensor Data JSON Format

### API Endpoint
```
POST http://localhost:8080/api/sensor-data
Content-Type: application/json
```

### Complete Example (All Fields)
```json
{
  "deviceId": "sensor-device-001",
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

### Minimal Example (Required Fields Only)
```json
{
  "deviceId": "sensor-device-001",
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
  }
}
```

## Field Descriptions

### Root Level
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceId` | String | ✅ Yes | Unique identifier for the sensor device |
| `timestamp` | String (ISO 8601) | ❌ No | Timestamp of reading (auto-generated if not provided) |
| `location` | Object | ✅ Yes | Geographic coordinates |
| `sensors` | Object | ✅ Yes | Water quality sensor readings |
| `battery` | Object | ❌ No | Battery status information |

### Location Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | Number | ✅ Yes | Latitude (decimal degrees) |
| `lon` | Number | ✅ Yes | Longitude (decimal degrees) |

### Sensors Object (All Required for ML Prediction)
| Field | Type | Required | Description | Unit | Ideal Range | Sensor |
|-------|------|----------|-------------|------|-------------|--------|
| `PH` | Number | ✅ Yes | pH level | - | 6.5 - 8.5 | pH Sensor (DFRobot) |
| `Temperature_C` | Number | ✅ Yes | Water temperature | °C | 15 - 30 | DS18B20 |
| `TDS_ppm` | Integer | ✅ Yes | Total Dissolved Solids | ppm | 0 - 500 | TDS Sensor (DFRobot) |
| `DO_mgL` | Number | ✅ Yes | Dissolved Oxygen | mg/L | > 5 | DO Sensor (Atlas/DFRobot) |
| `Turbidity_NTU` | Number | ✅ Yes | Water turbidity | NTU | 0 - 5 | Turbidity Sensor (DFRobot) |

**Important:** All 5 sensor readings are **required** for ML model prediction. The Random Forest model needs all parameters to calculate accurate WQI.

### Battery Object (Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `voltage` | Number | ❌ No | Battery voltage in volts |
| `level` | Number | ❌ No | Battery level (0-100%) |
| `temperature` | Number | ❌ No | Battery temperature in °C |
| `health` | String | ❌ No | Battery health status |
| `charging` | Boolean | ❌ No | Whether battery is charging |

## Alert Thresholds

The backend automatically generates alerts when values exceed these thresholds:

| Parameter | CRITICAL | HIGH | MEDIUM |
|-----------|----------|------|--------|
| pH | < 4.0 or > 10.0 | < 5.0 or > 9.0 | < 6.5 or > 8.5 |
| Temperature | > 35°C | > 32°C | > 30°C |
| TDS | > 1000 ppm | > 750 ppm | > 500 ppm |
| DO | < 3.0 mg/L | < 4.0 mg/L | < 5.0 mg/L |
| Turbidity | > 10 NTU | > 7 NTU | > 5 NTU |

## Example Requests

### Excellent Water Quality
```json
{
  "deviceId": "riya-ji",
  "location": {"lat": 28.6139, "lon": 77.2090},
  "sensors": {
    "PH": 7.2,
    "Temperature_C": 22.5,
    "TDS_ppm": 95,
    "DO_mgL": 9.2,
    "Turbidity_NTU": 0.5
  }
}
```

### Poor Water Quality (Will Generate Alerts)
```json
{
  "deviceId": "polluted-sensor",
  "location": {"lat": 22.5726, "lon": 88.3639},
  "sensors": {
    "PH": 8.8,
    "Temperature_C": 32.0,
    "TDS_ppm": 950,
    "DO_mgL": 4.2,
    "Turbidity_NTU": 12.0
  }
}
```

### With Battery Information
```json
{
  "deviceId": "solar-sensor-01",
  "location": {"lat": 25.3176, "lon": 82.9739},
  "sensors": {
    "PH": 7.5,
    "Temperature_C": 24.0,
    "TDS_ppm": 180,
    "DO_mgL": 7.5,
    "Turbidity_NTU": 2.0
  },
  "battery": {
    "voltage": 3.7,
    "level": 85.5,
    "charging": true
  }
}
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Data received and processed successfully",
  "deviceId": "sensor-device-001",
  "timestamp": "2025-11-15T00:00:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Failed to process sensor data: [error details]"
}
```

## Required Sensors List

### 5 Water Quality Sensors (All Required)

1. **pH Sensor**
   - Measures: Acidity/Alkalinity (0-14 scale)
   - Recommended: DFRobot Gravity Analog pH Sensor Kit V2
   - JSON Field: `"PH": 7.2`
   - Price: ~$30

2. **Temperature Sensor**
   - Measures: Water temperature in Celsius
   - Recommended: DS18B20 Waterproof Digital Sensor
   - JSON Field: `"Temperature_C": 22.5`
   - Price: ~$5

3. **TDS Sensor**
   - Measures: Total Dissolved Solids in ppm
   - Recommended: DFRobot Gravity Analog TDS Sensor
   - JSON Field: `"TDS_ppm": 95`
   - Price: ~$10

4. **Dissolved Oxygen Sensor**
   - Measures: Oxygen content in water (mg/L)
   - Recommended: Atlas Scientific DO Kit or DFRobot Gravity DO Sensor
   - JSON Field: `"DO_mgL": 9.2`
   - Price: ~$80-200

5. **Turbidity Sensor**
   - Measures: Water clarity in NTU
   - Recommended: DFRobot Gravity Analog Turbidity Sensor
   - JSON Field: `"Turbidity_NTU": 0.5`
   - Price: ~$10

### Additional Components

- **Microcontroller:** ESP32 (~$10) or Arduino Mega (~$30)
- **GPS Module:** NEO-6M for location (~$10)
- **Power:** Solar panel + battery or power bank
- **Enclosure:** Waterproof IP65 rated

**Total Cost:** ~$155-275 per IoT device

## Important Notes

1. **Field Names are Case-Sensitive**: Use exact capitalization as shown
   - ✅ `PH` (correct)
   - ❌ `ph` or `Ph` (incorrect)
   
2. **Timestamp Format**: If provided, must be ISO 8601 format
   - ✅ `"2025-11-15T00:00:00.000Z"`
   - ❌ `"15/11/2025"` or `1763167786`

3. **Automatic Features**:
   - Timestamp is auto-generated if not provided
   - Quality status is calculated automatically
   - Alerts are created automatically for threshold violations
   - ML prediction is attempted (falls back to rule-based if unavailable)

4. **Data Types**:
   - `PH`, `Temperature_C`, `DO_mgL`, `Turbidity_NTU`: Number (can have decimals)
   - `TDS_ppm`: Integer (whole numbers only)
   - `lat`, `lon`: Number (decimal degrees)

5. **Validation**:
   - `deviceId` cannot be empty
   - `location` must have both `lat` and `lon`
   - At least one sensor value should be provided
