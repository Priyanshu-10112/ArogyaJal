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

# ============================================================================
# NEW ML ENDPOINTS FOR OUTBREAK PREDICTION AND CLUSTERING
# ============================================================================

@app.route('/api/ml/cluster', methods=['POST'])
def cluster_symptoms():
    """
    Cluster symptom reports using DBSCAN.
    
    Expected JSON format:
    {
        "reports": [
            {
                "id": "report_1",
                "location": "Village A",
                "symptoms": ["fever", "diarrhea"],
                "severity": "MODERATE",
                "reportDate": "2024-01-15T10:00:00",
                "geoLocation": {"latitude": 28.6139, "longitude": 77.2090}
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        reports = data.get('reports', [])
        
        if not reports:
            return jsonify({'error': 'No reports provided'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(reports)
        
        # Perform clustering
        clusters = perform_symptom_clustering(df)
        
        return jsonify({
            'status': 'success',
            'clusters': clusters,
            'cluster_count': len(clusters)
        }), 200
        
    except Exception as e:
        logger.error(f"Clustering error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/predict-outbreak', methods=['POST'])
def predict_outbreak():
    """
    Predict outbreak probability based on clusters and water quality.
    
    Expected JSON format:
    {
        "clusters": [...],
        "water_tests": [...],
        "reports": [...]
    }
    """
    try:
        data = request.json
        
        # Extract features
        features = extract_outbreak_features(data)
        
        # Make prediction
        prediction = predict_outbreak_probability(features)
        
        # Generate recommendations based on risk level
        recommendations = []
        if prediction['risk_level'] == 'CRITICAL':
            recommendations = [
                'PRIORITY: Immediate intervention required',
                'PRIORITY: Deploy emergency medical teams',
                'Activate outbreak response protocol',
                'Issue public health advisory'
            ]
        elif prediction['risk_level'] == 'HIGH':
            recommendations = [
                'PRIORITY: Increase surveillance and monitoring',
                'Prepare emergency response resources',
                'Issue health advisory to community',
                'Conduct water quality testing'
            ]
        elif prediction['risk_level'] == 'MEDIUM':
            recommendations = [
                'Continue monitoring situation closely',
                'Increase testing frequency',
                'Conduct preventive health education',
                'Monitor water sources'
            ]
        else:
            recommendations = [
                'Continue routine surveillance',
                'Maintain regular monitoring schedule'
            ]
        
        return jsonify({
            'status': 'success',
            'risk_score': float(prediction['risk_score']),
            'risk_level': prediction['risk_level'],
            'confidence': float(prediction['confidence']),
            'contributing_factors': prediction['factors'],
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        logger.error(f"Outbreak prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/assess-risk', methods=['POST'])
def assess_risk():
    """
    Assess comprehensive health risk for a location.
    
    Expected JSON format:
    {
        "reports": [...],
        "clusters": [...],
        "water_tests": [...]
    }
    """
    try:
        data = request.json
        
        # Calculate risk components
        risk_assessment = calculate_location_risk(data)
        
        return jsonify({
            'status': 'success',
            'overall_risk_score': risk_assessment['overall_risk'],
            'risk_category': risk_assessment['category'],
            'component_scores': risk_assessment['components'],
            'recommendations': risk_assessment['recommendations']
        }), 200
        
    except Exception as e:
        logger.error(f"Risk assessment error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# HELPER FUNCTIONS FOR ML ENDPOINTS
# ============================================================================

def perform_symptom_clustering(df):
    """Perform DBSCAN clustering on symptom reports using haversine distance."""
    from sklearn.cluster import DBSCAN
    from math import radians, cos, sin, asin, sqrt
    import numpy as np
    
    cluster_data = []
    coordinates = []
    
    for idx, row in df.iterrows():
        if 'geoLocation' in row and row['geoLocation']:
            lat = row['geoLocation'].get('latitude', 0)
            lon = row['geoLocation'].get('longitude', 0)
            
            # Store coordinates in radians for haversine
            coordinates.append([radians(lat), radians(lon)])
            
            cluster_data.append({
                'id': row.get('id', f'report_{idx}'),
                'location': row.get('location', 'Unknown'),
                'symptoms': row.get('symptoms', []),
                'severity': row.get('severity', 'MILD'),
                'lat': lat,
                'lon': lon,
                'reportDate': row.get('reportDate', '')
            })
    
    if len(coordinates) < 2:
        return []
    
    # Convert to numpy array
    coords_array = np.array(coordinates)
    
    # Perform DBSCAN clustering with haversine metric
    # eps in kilometers: 0.5 km = 500 meters
    # Earth radius = 6371 km, so eps in radians = 0.5/6371 ≈ 0.000078
    # Using eps=0.01 for ~100km radius (more lenient for testing)
    dbscan = DBSCAN(eps=0.01, min_samples=2, metric='haversine')
    cluster_labels = dbscan.fit_predict(coords_array)
    
    # Group reports by cluster
    clusters = {}
    for i, label in enumerate(cluster_labels):
        if label != -1:  # Ignore noise points
            if label not in clusters:
                clusters[label] = {
                    'cluster_id': f'cluster_{label}',
                    'reports': [],
                    'centroid': {'lat': 0, 'lon': 0},
                    'report_count': 0
                }
            clusters[label]['reports'].append(cluster_data[i])
    
    # Calculate cluster properties
    result_clusters = []
    for cluster_id, cluster in clusters.items():
        reports = cluster['reports']
        cluster['report_count'] = len(reports)
        
        # Calculate centroid
        avg_lat = sum(r['lat'] for r in reports) / len(reports)
        avg_lon = sum(r['lon'] for r in reports) / len(reports)
        cluster['centroid'] = {'lat': avg_lat, 'lon': avg_lon}
        
        # Analyze symptoms
        all_symptoms = []
        for r in reports:
            all_symptoms.extend(r['symptoms'])
        
        symptom_counts = {}
        for symptom in all_symptoms:
            symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1
        
        cluster['dominant_symptoms'] = sorted(
            symptom_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:3]
        
        # Calculate cluster score
        cluster['cluster_score'] = min(len(reports) * 15 + len(symptom_counts) * 5, 100)
        
        result_clusters.append(cluster)
    
    return result_clusters

def extract_outbreak_features(data):
    """Extract features for outbreak prediction."""
    # Handle both direct input and nested structure
    symptom_clusters = data.get('symptom_clusters', 0)
    water_quality_alerts = data.get('water_quality_alerts', 0)
    recent_reports = data.get('recent_reports', 0)
    
    # If direct values provided, use them
    if symptom_clusters or water_quality_alerts or recent_reports:
        features = {
            'cluster_count': symptom_clusters,
            'total_reports': recent_reports,
            'avg_cluster_score': min(symptom_clusters * 15, 100),
            'water_quality_score': min(water_quality_alerts * 0.5, 100),
            'temporal_trend': 0
        }
    else:
        # Otherwise extract from nested structure
        features = {
            'cluster_count': len(data.get('clusters', [])),
            'total_reports': sum(c.get('report_count', 0) for c in data.get('clusters', [])),
            'avg_cluster_score': 0,
            'water_quality_score': 0,
            'temporal_trend': 0
        }
        
        # Calculate average cluster score
        clusters = data.get('clusters', [])
        if clusters:
            features['avg_cluster_score'] = sum(c.get('cluster_score', 0) for c in clusters) / len(clusters)
        
        # Water quality factor
        water_tests = data.get('water_tests', [])
        if water_tests:
            unsafe_count = sum(1 for t in water_tests 
                              if t.get('quality_status') in ['UNSAFE', 'CONTAMINATED'])
            features['water_quality_score'] = (unsafe_count / len(water_tests)) * 100
    
    return features

def predict_outbreak_probability(features):
    """Predict outbreak probability based on features."""
    risk_score = 0
    
    # RECALIBRATED SCORING SYSTEM
    # Cluster factor (0-35 points) - More weight on clusters
    cluster_score = min(features['cluster_count'] * 5, 35)
    risk_score += cluster_score
    
    # Report count factor (0-35 points) - Increased weight
    report_score = min(features['total_reports'] * 0.5, 35)
    risk_score += report_score
    
    # Cluster quality factor (0-20 points)
    quality_score = min(features['avg_cluster_score'] * 0.2, 20)
    risk_score += quality_score
    
    # Water quality factor (0-10 points)
    water_score = min(features['water_quality_score'] * 0.1, 10)
    risk_score += water_score
    
    # Determine risk level with RECALIBRATED thresholds
    if risk_score >= 70:
        risk_level = 'CRITICAL'
    elif risk_score >= 50:
        risk_level = 'HIGH'
    elif risk_score >= 30:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'LOW'
    
    # Calculate confidence based on data quality
    confidence = min(60 + features['cluster_count'] * 5 + (features['total_reports'] * 0.3), 95)
    
    return {
        'risk_score': risk_score,
        'risk_level': risk_level,
        'confidence': confidence,
        'factors': {
            'cluster_factor': cluster_score,
            'report_factor': report_score,
            'quality_factor': quality_score,
            'water_factor': water_score
        }
    }

def calculate_location_risk(data):
    """Calculate comprehensive risk assessment for a location."""
    reports = data.get('reports', [])
    clusters = data.get('clusters', [])
    water_tests = data.get('water_tests', [])
    
    # Calculate component risks
    symptom_risk = calculate_symptom_risk(reports)
    cluster_risk = calculate_cluster_risk(clusters)
    water_risk = calculate_water_risk(water_tests)
    
    # Overall risk (weighted average)
    overall_risk = (symptom_risk * 0.4 + cluster_risk * 0.4 + water_risk * 0.2)
    
    # Determine category
    if overall_risk >= 75:
        category = 'CRITICAL'
    elif overall_risk >= 60:
        category = 'HIGH'
    elif overall_risk >= 40:
        category = 'MEDIUM'
    elif overall_risk >= 20:
        category = 'LOW'
    else:
        category = 'MINIMAL'
    
    # Generate recommendations
    recommendations = generate_recommendations(category, symptom_risk, cluster_risk, water_risk)
    
    return {
        'overall_risk': overall_risk,
        'category': category,
        'components': {
            'symptom_risk': symptom_risk,
            'cluster_risk': cluster_risk,
            'water_risk': water_risk
        },
        'recommendations': recommendations
    }

def calculate_symptom_risk(reports):
    """Calculate risk from symptom reports."""
    if not reports:
        return 0
    
    risk = 0
    severe_count = sum(1 for r in reports if r.get('severity') in ['SEVERE', 'CRITICAL'])
    risk += (severe_count / len(reports)) * 50
    risk += min(len(reports) * 2, 50)
    
    return min(risk, 100)

def calculate_cluster_risk(clusters):
    """Calculate risk from clusters."""
    if not clusters:
        return 0
    
    avg_score = sum(c.get('cluster_score', 0) for c in clusters) / len(clusters)
    cluster_factor = min(len(clusters) * 20, 40)
    
    return min(avg_score * 0.6 + cluster_factor, 100)

def calculate_water_risk(water_tests):
    """Calculate risk from water quality."""
    if not water_tests:
        return 50  # Assume moderate risk if no data
    
    unsafe_count = sum(1 for t in water_tests 
                      if t.get('quality_status') in ['UNSAFE', 'CONTAMINATED'])
    
    return (unsafe_count / len(water_tests)) * 100

def generate_recommendations(category, symptom_risk, cluster_risk, water_risk):
    """Generate recommendations based on risk assessment."""
    recommendations = []
    
    if category == 'CRITICAL':
        recommendations.extend([
            'Immediate intervention required',
            'Deploy emergency medical teams',
            'Activate outbreak response protocol'
        ])
    elif category == 'HIGH':
        recommendations.extend([
            'Increase surveillance and monitoring',
            'Prepare emergency response resources',
            'Issue health advisory to community'
        ])
    elif category == 'MEDIUM':
        recommendations.extend([
            'Continue monitoring situation',
            'Increase testing frequency',
            'Conduct preventive health education'
        ])
    else:
        recommendations.append('Continue routine surveillance')
    
    if water_risk > 60:
        recommendations.append('PRIORITY: Address water quality issues')
    
    if cluster_risk > 70:
        recommendations.append('PRIORITY: Investigate active clusters')
    
    if symptom_risk > 70:
        recommendations.append('PRIORITY: Increase medical support')
    
    return recommendations

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
