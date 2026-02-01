import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, RobustScaler
from datetime import datetime
import joblib

class FraudPreprocessor:
    """
    Preprocessing pipeline for fraud detection
    
    Features created:
    1. Time-based: hour, day_of_week, is_weekend, is_night
    2. Amount-based: scaled amount, amount categories
    3. Original V1-V28 features (already scaled by PCA)
    """
    
    def __init__(self):
        self.amount_scaler = RobustScaler()  # Better for outliers
        self.fitted = False
        
    def fit(self, X, y=None):
        """
        Learn scaling parameters from training data
        
        Args:
            X: DataFrame with columns [Time, V1-V28, Amount]
            y: Target (not used, but kept for sklearn compatibility)
        """
        print("Fitting preprocessor...")
        
        self.amount_scaler.fit(X[['Amount']])
        
        self.fitted = True
        print("Preprocessor fitted")
        return self
    
    def transform(self, X):
        """
        Transform features
        
        Args:
            X: DataFrame with raw features
            
        Returns:
            DataFrame with engineered features
        """
        if not self.fitted:
            raise ValueError("Preprocessor not fitted! Call fit() first.")
        
        X_transformed = X.copy()
        
        # 1. Time-based features
        X_transformed = self._add_time_features(X_transformed)
        
        # 2. Amount features
        X_transformed = self._add_amount_features(X_transformed)
        
        # 3. Interaction features
        X_transformed = self._add_interaction_features(X_transformed)
        
        return X_transformed
    
    def fit_transform(self, X, y=None):
        """Fit and transform in one step"""
        self.fit(X, y)
        return self.transform(X)
    
    def _add_time_features(self, X):
        """Extract time-based features from Time column"""
        
        X['Time_Hour'] = (X['Time'] / 3600) % 24
        
        X['Time_Day'] = (X['Time'] / 86400).astype(int)
        
        X['Time_Hour_Sin'] = np.sin(2 * np.pi * X['Time_Hour'] / 24)
        X['Time_Hour_Cos'] = np.cos(2 * np.pi * X['Time_Hour'] / 24)
        
        X['Is_Night'] = ((X['Time_Hour'] >= 22) | (X['Time_Hour'] < 6)).astype(int)
        
        X = X.drop('Time', axis=1)
        
        return X
    
    def _add_amount_features(self, X):
        """Add amount-based features"""
        
        X['Amount_Scaled'] = self.amount_scaler.transform(X[['Amount']])
        
        X['Amount_Very_Small'] = (X['Amount'] < 10).astype(int)
        X['Amount_Small'] = ((X['Amount'] >= 10) & (X['Amount'] < 100)).astype(int)
        X['Amount_Medium'] = ((X['Amount'] >= 100) & (X['Amount'] < 1000)).astype(int)
        X['Amount_Large'] = (X['Amount'] >= 1000).astype(int)
        
        X['Amount_Log'] = np.log1p(X['Amount'])  # log(1 + x) to handle 0s
        
        return X
    
    def _add_interaction_features(self, X):
        """Add interaction features between important variables"""
        
        X['Amount_Night_Interaction'] = X['Amount_Scaled'] * X['Is_Night']
        
        if 'V14' in X.columns:
            X['Amount_V14_Interaction'] = X['Amount_Scaled'] * X['V14']
        
        return X
    
    def get_feature_names(self):
        """Get list of all feature names after transformation"""
        pass
    
    def save(self, filepath):
        """Save preprocessor to file"""
        joblib.dump(self, filepath)
        print(f"Preprocessor saved: {filepath}")
    
    @staticmethod
    def load(filepath):
        """Load preprocessor from file"""
        return joblib.load(filepath)


# Quick test function
def test_preprocessor():
    """Test preprocessor with sample data"""
    print("\n" + "="*60)
    print("TESTING PREPROCESSOR")
    print("="*60)
    
    #sample data
    sample_data = pd.DataFrame({
        'Time': [0, 3600, 7200, 86400],  # 0h, 1h, 2h, 1 day
        'V1': [1.0, 2.0, 3.0, 4.0],
        'V14': [-1.0, 0.5, 2.0, -0.5],
        'Amount': [10.0, 100.0, 1000.0, 50.0]
    })
    
    print("\n Original data:")
    print(sample_data.head())
    
    # Create and fit preprocessor
    preprocessor = FraudPreprocessor()
    preprocessor.fit(sample_data)
    
    # Transform
    transformed = preprocessor.transform(sample_data)
    
    print("\n Transformed data:")
    print(transformed.head())
    print(f"\n   Original features: {len(sample_data.columns)}")
    print(f"   New features: {len(transformed.columns)}")
    print(f"   Added features: {len(transformed.columns) - len(sample_data.columns)}")
    
    print("\nPreprocessor test passed!")
    

if __name__ == "__main__":
    test_preprocessor()