"""
Utility functions for the water quality prediction model.
"""

import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Union, Dict, List

def save_model_metadata(metrics: dict, model_dir: Union[str, Path] = None):
    """
    Save model metadata and evaluation metrics.
    
    Args:
        metrics (dict): Dictionary of evaluation metrics
        model_dir (str or Path, optional): Directory to save metadata
    """
    if model_dir is None:
        model_dir = Path(__file__).parent / 'models'
    else:
        model_dir = Path(model_dir)
    
    # Ensure the directory exists
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Add timestamp to metadata
    from datetime import datetime
    metadata = {
        'metrics': metrics,
        'last_trained': datetime.now().isoformat(),
        'features': ['ph', 'temperature', 'tds', 'dissolved_oxygen', 'turbidity'],
        'target': 'wqi',
        'model_type': 'RandomForestRegressor'
    }
    
    # Save to JSON
    with open(model_dir / 'model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

def load_model_metadata(model_dir: Union[str, Path] = None) -> dict:
    """
    Load model metadata.
    
    Args:
        model_dir (str or Path, optional): Directory containing the metadata
        
    Returns:
        dict: Model metadata
    """
    if model_dir is None:
        model_dir = Path(__file__).parent / 'models'
    else:
        model_dir = Path(model_dir)
    
    metadata_path = model_dir / 'model_metadata.json'
    
    if not metadata_path.exists():
        return None
    
    with open(metadata_path, 'r') as f:
        return json.load(f)

def validate_sensor_data(sensor_data: Union[dict, pd.DataFrame]) -> bool:
    """
    Validate sensor data format and values.
    
    Args:
        sensor_data: Input sensor data to validate
        
    Returns:
        bool: True if data is valid, False otherwise
    """
    required_fields = ['ph', 'temperature', 'tds', 'dissolved_oxygen', 'turbidity']
    
    if isinstance(sensor_data, dict):
        # Check for missing fields
        missing = [field for field in required_fields if field not in sensor_data]
        if missing:
            print(f"Missing required fields: {missing}")
            return False
            
        # Check for invalid values
        if not (6 <= sensor_data['ph'] <= 9):
            print("Warning: pH value outside typical range (6-9)")
        if not (0 <= sensor_data['temperature'] <= 50):
            print("Warning: Temperature value outside typical range (0-50°C)")
        if sensor_data['tds'] < 0:
            print("Warning: TDS cannot be negative")
            return False
        if sensor_data['turbidity'] < 0:
            print("Warning: Turbidity cannot be negative")
            return False
            
    elif isinstance(sensor_data, pd.DataFrame):
        # Check for missing columns
        missing = [field for field in required_fields if field not in sensor_data.columns]
        if missing:
            print(f"Missing required columns: {missing}")
            return False
            
        # Check for invalid values
        if (sensor_data['ph'] < 6).any() or (sensor_data['ph'] > 9).any():
            print("Warning: Some pH values outside typical range (6-9)")
        if (sensor_data['temperature'] < 0).any() or (sensor_data['temperature'] > 50).any():
            print("Warning: Some temperature values outside typical range (0-50°C)")
        if (sensor_data['tds'] < 0).any():
            print("Warning: TDS values cannot be negative")
            return False
        if (sensor_data['turbidity'] < 0).any():
            print("Warning: Turbidity values cannot be negative")
            return False
    
    return True

def get_feature_importance(model_path: Union[str, Path] = None) -> dict:
    """
    Get feature importance from the trained model.
    
    Args:
        model_path: Path to the trained model
        
    Returns:
        dict: Dictionary of feature importances
    """
    if model_path is None:
        model_path = Path(__file__).parent / 'models' / 'wqi_model.pkl'
    else:
        model_path = Path(model_path)
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    # Load the model
    model = joblib.load(model_path)
    
    # Get feature importances
    features = ['ph', 'temperature', 'tds', 'dissolved_oxygen', 'turbidity']
    importances = model.feature_importances_
    
    return dict(zip(features, importances))
