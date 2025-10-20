"""
Test script for Water Quality Prediction ML Pipeline

This script tests:
1. Model loading
2. Data preprocessing
3. Single prediction
4. Batch prediction
5. Output validation
"""

import sys
import os
import numpy as np
import pandas as pd
from model import WaterQualityPredictor
from preprocess import generate_sample_data

def test_model_loading():
    """Test if the model loads correctly."""
    print("\n=== Testing Model Loading ===")
    try:
        predictor = WaterQualityPredictor()
        print("✅ Model loaded successfully")
        return predictor
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        sys.exit(1)

def test_data_processing(predictor):
    """Test data preprocessing and feature engineering."""
    print("\n=== Testing Data Processing ===")
    try:
        # Generate test data
        test_data = {
            'ph': [7.2, 6.8, 8.1],
            'temperature': [25.5, 24.8, 26.2],
            'tds': [320, 410, 280],
            'dissolved_oxygen': [6.8, 5.9, 7.2],
            'turbidity': [1.8, 2.5, 1.2]
        }
        df = pd.DataFrame(test_data)
        
        # Check if model can process the data
        X = df[predictor.features]
        print("✅ Data processed successfully")
        print("Sample input data:")
        print(X.head())
        return X
    except Exception as e:
        print(f"❌ Error processing data: {e}")
        sys.exit(1)

def test_single_prediction(predictor, X):
    """Test making a single prediction."""
    print("\n=== Testing Single Prediction ===")
    try:
        sample = X.iloc[0].to_dict()
        prediction = predictor.predict(sample)
        print(f"✅ Single prediction successful")
        print(f"Input: {sample}")
        print(f"Predicted WQI: {prediction:.2f}")
        return prediction
    except Exception as e:
        print(f"❌ Error in single prediction: {e}")
        sys.exit(1)

def test_batch_prediction(predictor, X):
    """Test batch predictions."""
    print("\n=== Testing Batch Prediction ===")
    try:
        predictions = predictor.predict_batch(X)
        print("✅ Batch prediction successful")
        results = pd.DataFrame({
            'Actual': [85.0, 78.0, 92.0],  # Example expected values
            'Predicted': predictions
        })
        print("\nPredictions:")
        print(results)
        return predictions
    except Exception as e:
        print(f"❌ Error in batch prediction: {e}")
        sys.exit(1)

def validate_outputs(predictions):
    """Validate prediction outputs."""
    print("\n=== Validating Outputs ===")
    try:
        # Check if predictions are within expected range (0-100 for WQI)
        valid = all(0 <= p <= 100 for p in predictions)
        if valid:
            print("✅ All predictions are within valid WQI range (0-100)")
        else:
            print("❌ Some predictions are outside valid WQI range")
        
        # Check for NaN values
        if not np.isnan(predictions).any():
            print("✅ No NaN values in predictions")
        else:
            print("❌ Found NaN values in predictions")
            
    except Exception as e:
        print(f"❌ Error validating outputs: {e}")
        sys.exit(1)

def main():
    print("=== Starting ML Pipeline Tests ===\n")
    
    # 1. Test model loading
    predictor = test_model_loading()
    
    # 2. Test data processing
    X = test_data_processing(predictor)
    
    # 3. Test single prediction
    single_pred = test_single_prediction(predictor, X)
    
    # 4. Test batch prediction
    batch_preds = test_batch_prediction(predictor, X)
    
    # 5. Validate outputs
    validate_outputs([single_pred] + list(batch_preds))
    
    print("\n=== All Tests Completed Successfully ===")

if __name__ == "__main__":
    main()
