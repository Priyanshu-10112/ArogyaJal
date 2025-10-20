import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.abspath('.'))

from ML.preprocess import generate_sample_data
from ML.train import train_model
from ML.predict import predict_wqi
from ML.evaluate import print_evaluation_metrics

def main():
    print("=== Testing ML Pipeline ===\n")
    
    # 1. Generate sample data
    print("1. Generating sample data...")
    data = generate_sample_data(n_samples=1000)
    print(f"Generated {len(data)} samples")
    
    # 2. Prepare features and target
    X = data[['ph', 'temperature', 'tds', 'dissolved_oxygen', 'turbidity']]
    y = data['wqi']
    
    # 3. Split data (simple holdout for testing)
    split_idx = int(0.8 * len(data))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # 4. Train the model
    print("\n2. Training model...")
    model = train_model(X_train, y_train)
    print("✅ Model trained successfully")
    
    # 5. Make predictions
    print("\n3. Making predictions...")
    y_pred = model.predict(X_test)
    
    # 6. Evaluate
    print("\n4. Evaluation Metrics:")
    from ML.train import evaluate_model as eval_model
    metrics = eval_model(model, X_test, y_test)
    print_evaluation_metrics(metrics)
    
    # 7. Test single prediction
    print("\n5. Testing single prediction...")
    test_sample = {
        'ph': 7.2,
        'temperature': 25.5,
        'tds': 350,
        'dissolved_oxygen': 6.8,
        'turbidity': 2.1
    }
    
    # Convert test sample to DataFrame for prediction
    import pandas as pd
    test_df = pd.DataFrame([test_sample])
    prediction = model.predict(test_df)[0]
    
    print(f"\nTest sample prediction:")
    print(f"Input: {test_sample}")
    print(f"Predicted WQI: {prediction:.2f}")
    
    print("\n=== ML Pipeline Test Completed Successfully ===")

if __name__ == "__main__":
    main()
