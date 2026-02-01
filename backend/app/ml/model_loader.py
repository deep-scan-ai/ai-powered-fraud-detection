"""
ML Model Loader
Loads the trained fraud detection model and provides prediction interface
Loads the model and uses it to check transactions

Request Path:
Frontend 
  → api.js 
    → main.py 
      → routes.py 
        → model_loader.py 
          → (preprocessor.py) OPTIONAL
            → fraud_model.pkl (predict)
              → model_loader.py (result)
                → routes.py (format)
                  → api.js (receive)
                    → Frontend (display)


Training Path:
    train_model.py → fraud_model.pkl (created)                    
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional

class FraudDetector:
    """Fraud Detection Model Wrapper with Preprocessor"""
    
    def __init__(self, model_path: str = "app/ml/fraud_model_v3.pkl"):
        self.model_path = model_path
        self.preprocessor_path = model_path.replace('fraud_model', 'fraud_preprocessor')
        self.metadata_path = model_path.replace('fraud_model', 'model_metadata')
        
        self.model = None
        self.preprocessor = None
        self.metadata = None
        self.is_loaded = False
    
    def load_model(self) -> bool:
        """Load model, preprocessor, and metadata"""
        try:
            model_file = Path(self.model_path)
            preprocessor_file = Path(self.preprocessor_path)
            
            if not model_file.exists():
                print(f"Model file not found: {self.model_path}")
                print("   Using fallback detection")
                return False
            
            # Load model
            self.model = joblib.load(self.model_path)
            print(f"Model loaded: {self.model_path}")
            
            # Load preprocessor
            if preprocessor_file.exists():
                self.preprocessor = joblib.load(self.preprocessor_path)
                print(f"Preprocessor loaded: {self.preprocessor_path}")
            else:
                print(f"Preprocessor not found, using model without preprocessing")
            
            # Load metadata
            metadata_file = Path(self.metadata_path)
            if metadata_file.exists():
                self.metadata = joblib.load(self.metadata_path)
                print(f"Metadata loaded")
                print(f"   Model: {self.metadata.get('model_type', 'Unknown')}")
                print(f"   Accuracy: {self.metadata.get('accuracy', 0)*100:.2f}%")
                print(f"   Recall: {self.metadata.get('recall', 0)*100:.2f}%")
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            self.is_loaded = False
            return False
    
    def predict(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict fraud for a transaction
        
        Args:
            transaction_data: Dict with transaction features
            
        Returns:
            Dict with prediction results
        """
        if not self.is_loaded:
            return self._fallback_detection(transaction_data)
        
        try:
            df = self._prepare_dataframe(transaction_data)
            
            if self.preprocessor:
                df = self.preprocessor.transform(df)
            
            # Predict
            prediction = self.model.predict(df)[0]
            probabilities = self.model.predict_proba(df)[0]
            
            return {
                "is_fraud": bool(prediction),
                "risk_score": float(probabilities[1]),
                "confidence": float(max(probabilities)),
                "method": "ml_model_v3",
                "model_type": self.metadata.get('model_type', 'Unknown') if self.metadata else 'Unknown'
            }
            
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            return self._fallback_detection(transaction_data)
    
    def _prepare_dataframe(self, transaction_data: Dict) -> pd.DataFrame:
        """Convert transaction dict to DataFrame with correct features"""
        
        features = {}
        
        features['Time'] = transaction_data.get('time', 0)
        
        for i in range(1, 29):
            features[f'V{i}'] = transaction_data.get(f'V{i}', 0.0)
        
        features['Amount'] = transaction_data.get('amount', 0.0)
        
        return pd.DataFrame([features])
    
    def _fallback_detection(self, transaction_data: Dict) -> Dict:
        """Simple rule-based detection when model unavailable"""
        amount = transaction_data.get('amount', 0)
        
        risk = 0.0
        if amount > 50000:
            risk += 0.4
        if amount > 100000:
            risk += 0.3
            
        return {
            "is_fraud": risk > 0.5,
            "risk_score": min(risk, 1.0),
            "confidence": 0.6,
            "method": "rule_based",
            "model_type": "fallback"
        }

# Global instance
fraud_detector = FraudDetector()