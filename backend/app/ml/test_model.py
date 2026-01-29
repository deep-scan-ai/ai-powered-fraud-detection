import joblib
import pandas as pd

print(" Testing Model Loading...")

# Load model
model = joblib.load('fraud_model_v2.pkl')
print(" Model loaded")
# Load scaler
scaler = joblib.load('amount_scaler.pkl')
print(" Scaler loaded")

# Load feature names
features = joblib.load('feature_names.pkl')
print(f" Features loaded ({len(features)} features)")
# Load metadata
metadata = joblib.load('model_metadata.pkl')
print(f"\n Model Info:")
print(f"   Precision: {metadata['precision']*100:.2f}%")
print(f"   Recall: {metadata['recall']*100:.2f}%")
print(f"   F1-Score: {metadata['f1_score']:.4f}")

print("\n All files loaded successfully!")