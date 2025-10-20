"""
Flask API for Water Quality Prediction ML Service

This service exposes REST endpoints for WQI prediction.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from model import WaterQualityPredictor
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load the trained model
predictor = None

def load_model():
    """Load the trained ML model."""
    global predictor
    try:
        predictor = WaterQualityPredictor()
        model_path = predictor.model_path
        
        if os.path.exists(model_path):
            predictor.load_model()
            logger.info(f"✅ Model loaded successfully from {model_path}")
        else:
            logger.warning("⚠️ No trained model found. Training a new model...")
            from preprocess import generate_sample_data
            from train import train_model
            
            # Generate sample data and train
            data = generate_sample_data(n_samples=1000)
            X = data[['ph', 'temperature', 'tds', 'dissolved_oxygen', 'turbidity']]
            y = data['wqi']
            
            predictor = train_model(X, y)
            logger.info("✅ New model trained and loaded")
            
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        raise

# Load model on startup
load_model()

def get_quality_status(wqi):
    """Convert WQI score to quality status."""
    if wqi >= 90:
        return "Excellent"
    elif wqi >= 70:
        return "Good"
    elif wqi >= 50:
        return "Medium"
    elif wqi >= 25:
        return "Poor"
    else:
        return "Very Poor"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Prediction Service',
        'model_loaded': predictor is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict WQI from sensor data.
    
    Expected JSON format:
    {
        "ph": 7.2,
        "temperature": 25.5,
        "tds": 350,
        "dissolved_oxygen": 6.8,
        "turbidity": 2.1
    }
    
    Or with alternative field names:
    {
        "pH": 7.2,
        "temperature_C": 25.5,
        "TDS_ppm": 350,
        "DO_mgL": 6.8,
        "turbidity_NTU": 2.1
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Request body must contain sensor data in JSON format'
            }), 400
        
        # Normalize field names (handle different naming conventions)
        normalized_data = {
            'ph': data.get('ph') or data.get('pH') or data.get('PH'),
            'temperature': data.get('temperature') or data.get('temperature_C') or data.get('temp'),
            'tds': data.get('tds') or data.get('TDS_ppm') or data.get('TDS'),
            'dissolved_oxygen': data.get('dissolved_oxygen') or data.get('DO_mgL') or data.get('DO'),
            'turbidity': data.get('turbidity') or data.get('turbidity_NTU')
        }
        
        # Validate required fields
        missing_fields = [k for k, v in normalized_data.items() if v is None]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields,
                'message': 'All sensor readings (ph, temperature, tds, dissolved_oxygen, turbidity) are required'
            }), 400
        
        # Convert to DataFrame for prediction
        df = pd.DataFrame([normalized_data])
        
        # Make prediction
        wqi_prediction = predictor.predict(df)[0]
        
        # Get quality status
        quality_status = get_quality_status(wqi_prediction)
        
        # Prepare response
        response = {
            'wqi': round(float(wqi_prediction), 2),
            'quality_status': quality_status,
            'input_data': normalized_data,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        logger.info(f"Prediction: WQI={wqi_prediction:.2f}, Status={quality_status}")
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """
    Predict WQI for multiple sensor readings.
    
    Expected JSON format:
    {
        "readings": [
            {"ph": 7.2, "temperature": 25.5, ...},
            {"ph": 6.8, "temperature": 24.0, ...}
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'readings' not in data:
            return jsonify({
                'error': 'Invalid format',
                'message': 'Request body must contain "readings" array'
            }), 400
        
        readings = data['readings']
        
        if not isinstance(readings, list) or len(readings) == 0:
            return jsonify({
                'error': 'Invalid readings',
                'message': 'Readings must be a non-empty array'
            }), 400
        
        # Process each reading
        results = []
        for idx, reading in enumerate(readings):
            try:
                # Normalize field names
                normalized = {
                    'ph': reading.get('ph') or reading.get('pH'),
                    'temperature': reading.get('temperature') or reading.get('temperature_C'),
                    'tds': reading.get('tds') or reading.get('TDS_ppm'),
                    'dissolved_oxygen': reading.get('dissolved_oxygen') or reading.get('DO_mgL'),
                    'turbidity': reading.get('turbidity') or reading.get('turbidity_NTU')
                }
                
                df = pd.DataFrame([normalized])
                wqi = predictor.predict(df)[0]
                
                results.append({
                    'index': idx,
                    'wqi': round(float(wqi), 2),
                    'quality_status': get_quality_status(wqi),
                    'input': normalized
                })
            except Exception as e:
                results.append({
                    'index': idx,
                    'error': str(e)
                })
        
        return jsonify({
            'predictions': results,
            'total': len(results),
            'timestamp': pd.Timestamp.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error during batch prediction: {e}")
        return jsonify({
            'error': 'Batch prediction failed',
            'message': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model."""
    try:
        return jsonify({
            'model_type': predictor.model_type,
            'features': predictor.features,
            'model_path': str(predictor.model_path),
            'scaler_path': str(predictor.scaler_path)
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to get model info',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
