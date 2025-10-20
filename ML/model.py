"""
Water Quality Prediction Model

This module contains the main WaterQualityPredictor class that implements
the machine learning model for predicting Water Quality Index (WQI).
"""

import os
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib

class WaterQualityPredictor:
    """
    A machine learning model for predicting Water Quality Index (WQI) from sensor data.
    
    This class handles model training, prediction, and persistence.
    """
    
    def __init__(self, model_type='random_forest'):
        """
        Initialize the water quality predictor.
        
        Args:
            model_type (str): Type of model to use ('random_forest' or 'gradient_boosting')
        """
        self.model = None
        self.scaler = StandardScaler()
        self.features = ['ph', 'temperature', 'tds', 'dissolved_oxygen', 'turbidity']
        self.target = 'wqi'
        self.model_type = model_type
        self.model_dir = Path(__file__).parent / 'models'
        self.model_path = self.model_dir / 'wqi_model.pkl'
        self.scaler_path = self.model_dir / 'scaler.pkl'
        
        # Create models directory if it doesn't exist
        os.makedirs(self.model_dir, exist_ok=True)
    
    def train(self, X, y):
        """
        Train the model on the given data.
        
        Args:
            X (pd.DataFrame): Feature matrix
            y (pd.Series): Target variable
        """
        # Scale the features
        X_scaled = self.scaler.fit_transform(X)
        
        # Initialize and train the model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_scaled, y)
        
        # Save the trained model and scaler
        self.save_model()
    
    def predict(self, X):
        """
        Make predictions on new data.
        
        Args:
            X (pd.DataFrame or dict): Input features
            
        Returns:
            np.ndarray: Predicted WQI values
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Model not trained. Call train() first or load a trained model.")
        
        # Convert dict to DataFrame if needed
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        
        # Ensure all required features are present
        missing_features = set(self.features) - set(X.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        # Select only the required features and in the correct order
        X = X[self.features]
        
        # Scale the input data
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        
        # Ensure predictions are within 0-100 range
        return np.clip(predictions, 0, 100)
    
    def save_model(self):
        """Save the trained model and scaler to disk."""
        if self.model is None:
            raise ValueError("No model to save. Train the model first.")
            
        # Save the model
        joblib.dump(self.model, self.model_path)
        
        # Save the scaler
        joblib.dump(self.scaler, self.scaler_path)
        
        print(f"Model saved to {self.model_path}")
        print(f"Scaler saved to {self.scaler_path}")
    
    def load_model(self):
        """Load the trained model and scaler from disk."""
        if not self.model_path.exists() or not self.scaler_path.exists():
            raise FileNotFoundError("Model or scaler file not found. Please train the model first.")
        
        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)
        print("Model and scaler loaded successfully.")
        
        return self
