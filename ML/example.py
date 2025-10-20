"""
Example usage of the Water Quality Prediction ML module.

This script demonstrates how to:
1. Train a model on sample data
2. Save the trained model
3. Load the model and make predictions
4. Evaluate the model
"""

import pandas as pd
from .preprocess import generate_sample_data
from .train import train_and_evaluate
from .predict import predict_wqi, batch_predict
from .utils import get_feature_importance

def main():
    print("=== Water Quality Prediction Example ===\n")
    
    # 1. Generate sample data
    print("1. Generating sample water quality data...")
    data = generate_sample_data(n_samples=1000)
    print(f"Generated {len(data)} samples with columns: {list(data.columns)}\n")
    
    # 2. Train and evaluate the model
    print("2. Training the model...")
    model, metrics = train_and_evaluate(data)
    
    # 3. Get feature importance
    print("\n3. Feature Importance:")
    feature_importance = get_feature_importance()
    for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        print(f"{feature}: {importance:.4f}")
    
    # 4. Make predictions on new data
    print("\n4. Making predictions...")
    
    # Single prediction
    test_sample_1 = {
        'ph': 7.2,
        'temperature': 22.5,
        'tds': 350.0,
        'dissolved_oxygen': 8.2,
        'turbidity': 2.1
    }
    
    prediction = predict_wqi(test_sample_1)
    print(f"\nPredicted WQI for sample 1: {prediction:.2f}")
    
    # Batch prediction
    test_samples = [
        {'ph': 7.2, 'temperature': 22.5, 'tds': 350.0, 'dissolved_oxygen': 8.2, 'turbidity': 2.1},
        {'ph': 6.8, 'temperature': 25.0, 'tds': 420.0, 'dissolved_oxygen': 7.8, 'turbidity': 1.5},
        {'ph': 8.1, 'temperature': 28.0, 'tds': 600.0, 'dissolved_oxygen': 6.5, 'turbidity': 5.0}
    ]
    
    predictions = batch_predict(test_samples)
    print("\nBatch predictions:")
    for i, pred in enumerate(predictions, 1):
        print(f"Sample {i}: {pred:.2f} WQI")
    
    print("\nExample completed successfully!")

if __name__ == "__main__":
    main()
