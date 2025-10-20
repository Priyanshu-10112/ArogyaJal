# Water Quality Prediction ML Service

This is a Flask-based microservice that provides real-time Water Quality Index (WQI) predictions using machine learning.

## Architecture

```
IoT Device → Backend (Spring Boot) → ML Service (Flask) → Prediction
                ↓
            Firestore + WebSocket → Dashboard
```

## Features

- **Real-time WQI Prediction**: Predicts water quality based on 5 sensor parameters
- **RESTful API**: Easy integration with any backend
- **Batch Processing**: Support for multiple predictions at once
- **Auto-training**: Trains model automatically if not found
- **Quality Classification**: Converts WQI to human-readable status

## Installation

### 1. Install Dependencies

```bash
cd ML
pip install -r requirements.txt
```

### 2. Train the Model (Optional)

```bash
python test_ml.py
```

This will generate a trained model in `ML/models/`

## Running the Service

### Start the ML API Server

```bash
python ML/start_ml_service.py
```

The service will start on `http://localhost:5000`

### Verify Service is Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ML Prediction Service",
  "model_loaded": true
}
```

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Predict WQI (Single)
```
POST /predict
Content-Type: application/json

{
  "ph": 7.2,
  "temperature": 25.5,
  "tds": 350,
  "dissolved_oxygen": 6.8,
  "turbidity": 2.1
}
```

**Response:**
```json
{
  "wqi": 84.95,
  "quality_status": "Good",
  "input_data": {...},
  "timestamp": "2025-10-19T22:30:00"
}
```

### 3. Batch Predict
```
POST /batch-predict
Content-Type: application/json

{
  "readings": [
    {"ph": 7.2, "temperature": 25.5, ...},
    {"ph": 6.8, "temperature": 24.0, ...}
  ]
}
```

### 4. Model Info
```
GET /model-info
```

## Testing

### Test the API

```bash
# Make sure ML service is running first
python ML/test_api.py
```

### Test ML Pipeline

```bash
python test_ml.py
```

## Integration with Backend

The Spring Boot backend automatically calls the ML service when sensor data is received.

### Backend Configuration

In `application.properties`:
```properties
ml.service.url=http://localhost:5000
```

### Flow

1. IoT device sends data to `/api/sensor-data`
2. Backend receives and validates data
3. Backend calls ML service at `/predict`
4. ML service returns WQI prediction
5. Backend stores data + prediction in Firestore
6. WebSocket broadcasts to dashboard

## Input Parameters

| Parameter | Description | Unit | Range |
|-----------|-------------|------|-------|
| ph | pH level | - | 0-14 |
| temperature | Water temperature | °C | 0-50 |
| tds | Total Dissolved Solids | ppm | 0-2000 |
| dissolved_oxygen | Dissolved Oxygen | mg/L | 0-20 |
| turbidity | Water turbidity | NTU | 0-100 |

## Output

| Field | Description | Example |
|-------|-------------|---------|
| wqi | Water Quality Index | 84.95 |
| quality_status | Quality classification | "Good" |

### Quality Status Mapping

- **Excellent**: WQI 90-100
- **Good**: WQI 70-89
- **Medium**: WQI 50-69
- **Poor**: WQI 25-49
- **Very Poor**: WQI 0-24

## Model Details

- **Algorithm**: Random Forest Regressor
- **Features**: 5 sensor parameters
- **Target**: WQI (0-100)
- **Accuracy**: ~77% R² score

## Troubleshooting

### ML Service Not Starting

1. Check if port 5000 is available
2. Verify all dependencies are installed
3. Check if model files exist in `ML/models/`

### Backend Can't Connect to ML Service

1. Verify ML service is running: `curl http://localhost:5000/health`
2. Check firewall settings
3. Verify `ml.service.url` in `application.properties`

### Poor Predictions

1. Retrain model with real data
2. Check input data quality
3. Verify sensor calibration

## Production Deployment

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "start_ml_service.py"]
```

### Environment Variables

```bash
export PORT=5000
export ML_MODEL_PATH=/app/models/wqi_model.pkl
```

## Future Enhancements

- [ ] Add anomaly detection
- [ ] Implement model versioning
- [ ] Add A/B testing for models
- [ ] Support for more water parameters
- [ ] Real-time model retraining
- [ ] Prediction confidence scores

## Support

For issues or questions, check the logs:
- ML Service: Console output
- Backend: `logs/arogyajal-backend.log`
