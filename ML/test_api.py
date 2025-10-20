"""
Test script for ML API

This script tests the Flask API endpoints.
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint."""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_predict():
    """Test single prediction endpoint."""
    print("\n=== Testing Single Prediction ===")
    
    # Test data
    test_data = {
        "ph": 7.2,
        "temperature": 25.5,
        "tds": 350,
        "dissolved_oxygen": 6.8,
        "turbidity": 2.1
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Request: {json.dumps(test_data, indent=2)}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_predict_with_backend_format():
    """Test prediction with backend sensor data format."""
    print("\n=== Testing Prediction with Backend Format ===")
    
    # Backend format (from your IoT device)
    test_data = {
        "pH": 6.8,
        "turbidity_NTU": 40,
        "TDS_ppm": 580,
        "DO_mgL": 6.1,
        "temperature_C": 27.5
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Request: {json.dumps(test_data, indent=2)}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_batch_predict():
    """Test batch prediction endpoint."""
    print("\n=== Testing Batch Prediction ===")
    
    test_data = {
        "readings": [
            {
                "ph": 7.2,
                "temperature": 25.5,
                "tds": 350,
                "dissolved_oxygen": 6.8,
                "turbidity": 2.1
            },
            {
                "ph": 6.5,
                "temperature": 28.0,
                "tds": 450,
                "dissolved_oxygen": 5.5,
                "turbidity": 5.0
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/batch-predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_model_info():
    """Test model info endpoint."""
    print("\n=== Testing Model Info ===")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 50)
    print("🧪 Testing ML API Service")
    print("=" * 50)
    print("\nMake sure the ML service is running on http://localhost:5000")
    print("Start it with: python ML/start_ml_service.py")
    
    input("\nPress Enter to start tests...")
    
    results = {
        'Health Check': test_health(),
        'Single Prediction': test_predict(),
        'Backend Format Prediction': test_predict_with_backend_format(),
        'Batch Prediction': test_batch_predict(),
        'Model Info': test_model_info()
    }
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")

if __name__ == "__main__":
    main()
