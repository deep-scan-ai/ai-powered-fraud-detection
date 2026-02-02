import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, 
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score
)
from sklearn.preprocessing import StandardScaler
import joblib
from pathlib import Path


print("=" * 70)
print("FRAUD DETECTION MODEL TRAINING - Real Kaggle Dataset")
print("=" * 70)

# Validation function
def validate_dataset(df):
    """Dataset validation before training"""
    print("\n Validating dataset...")
    
    errors = []
    
    # Check 1: Required columns
    required_cols = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount', 'Class']
    missing_cols = set(required_cols) - set(df.columns)
    if missing_cols:
        errors.append(f"Missing columns: {missing_cols}")
    
    # Check 2: Data types
    for col in df.columns:
        if not pd.api.types.is_numeric_dtype(df[col]):
            errors.append(f"Column {col} is not numeric")
    
    # Check 3: Missing values
    if df.isnull().sum().sum() > 0:
        errors.append(f"Dataset contains missing values")
    
    # Check 4: Class values
    if not set(df['Class'].unique()).issubset({0, 1}):
        errors.append(f"Class column contains invalid values")
    
    # Check 5: Negative values
    if df['Amount'].min() < 0:
        errors.append("Amount column contains negative values")
    
    # Check 6: Sample count
    if len(df) < 100000:
        print(f"   Warning: Only {len(df):,} samples (expected ~280K)")
    
    if errors:
        print("   Validation failed:")
        for error in errors:
            print(f"      - {error}")
        return False
    
    print("   Dataset validation passed")
    return True


# STEP 1: Load Dataset

print("\nStep 1: Loading Kaggle dataset...")

dataset_path = Path("../../../ml/datasets/creditcard.csv")

if not dataset_path.exists():
    print(f" Error: Dataset not found!")
    print(f"   Expected: {dataset_path.absolute()}")
    print("\n   Please download from:")
    print("   https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud")
    exit(1)

df = pd.read_csv(dataset_path)
print(f" Dataset loaded successfully!")
print(f"   Shape: {df.shape}")
print(f"   Transactions: {len(df):,}")

if not validate_dataset(df):
    print("\n Dataset validation failed. Stopping.")
    exit(1)


# STEP 2: Data Analysis

print("\nStep 2: Analyzing data...")

fraud_count = df['Class'].sum()
normal_count = len(df) - fraud_count
fraud_percentage = (fraud_count / len(df)) * 100

print(f"\n   Class Distribution:")
print(f"   - Normal: {normal_count:,} ({100-fraud_percentage:.2f}%)")
print(f"   - Fraud:  {fraud_count:,} ({fraud_percentage:.2f}%)")
print(f"   - Imbalance Ratio: 1:{int(normal_count/fraud_count)}")


# STEP 3: Prepare Features

print("\nStep 3: Preparing features...")

# Separate features and target
X = df.drop('Class', axis=1)
y = df['Class']

print(f"   Features (X): {X.shape}")
print(f"   Target (y): {y.shape}")

# Feature names save
feature_names = X.columns.tolist()
print(f"   Feature count: {len(feature_names)}")


# STEP 4: Train-Test Split

print("\nStep 4: Splitting data...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2,        # 20% for testing
    random_state=42,       # Reproducibility
    stratify=y             # Class balance maintain
)

print(f"   Train set: {X_train.shape[0]:,} samples")
print(f"   Test set:  {X_test.shape[0]:,} samples")
print(f"   Train fraud count: {y_train.sum()}")
print(f"   Test fraud count: {y_test.sum()}")


# STEP 5: Feature Scaling (For Amount column)

print("\nStep 5: Scaling features...")

# Amount feature scaling
# (V1-V28 already PCA scaled, Time is fine)
scaler = StandardScaler()
X_train_scaled = X_train.copy()
X_test_scaled = X_test.copy()

X_train_scaled['Amount'] = scaler.fit_transform(X_train[['Amount']])
X_test_scaled['Amount'] = scaler.transform(X_test[['Amount']])

print("    Amount feature scaled")

# Scaler save
joblib.dump(scaler, 'amount_scaler.pkl')
print("    Scaler saved: amount_scaler.pkl")


# STEP 6: Train Model (Class Imbalance Handling)

print("\nStep 6: Training Random Forest model...")
print("   This may take 2-3 minutes...")

model = RandomForestClassifier(
    n_estimators=100,           # 100 trees
    max_depth=10,               # Prevent overfitting
    min_samples_split=10,       # Minimum samples to split
    min_samples_leaf=5,         # Minimum samples per leaf
    class_weight='balanced',    # Handles class imbalance
    random_state=42,
    n_jobs=-1,                  # Use all CPU cores
    verbose=1                   # Show progress
)

model.fit(X_train_scaled, y_train)

print("\n Model training complete!")


# STEP 7: Evaluate Model

print("\n Step 7: Evaluating model...")

# Predictions
y_pred = model.predict(X_test_scaled)

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()

print("\n Confusion Matrix:")
print("                 Predicted")
print("               Normal  Fraud")
print(f"Actual Normal   {tn:5d}  {fp:5d}")
print(f"       Fraud    {fn:5d}  {tp:5d}")

# Metrics
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f"\n Model Performance:")
print(f"   - Precision: {precision:.4f} ({precision*100:.2f}%)")
print(f"      (How Many 100% Correct fraud?)")
print(f"   - Recall:    {recall:.4f} ({recall*100:.2f}%)")
print(f"      (Did we identify every fraud?)")
print(f"   - F1-Score:  {f1:.4f}")
print(f"      (Overall performance)")

# Detailed report
print("\n Detailed Classification Report:")
print(classification_report(y_test, y_pred, 
                           target_names=['Normal', 'Fraud']))

# Feature importance
print("\n Top 10 Important Features:")
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.head(10).iterrows():
    print(f"   {row['feature']:10s}: {row['importance']:.4f}")

# STEP 8: Save Model

print("\n Step 8: Saving model...")

# Model save
model_path = 'fraud_model_v2.pkl'
joblib.dump(model, model_path)
print(f"    Model saved: {model_path}")

# Feature names save
joblib.dump(feature_names, 'feature_names.pkl')
print(f"    Feature names saved: feature_names.pkl")

# Model metadata save 
metadata = {
    'model_type': 'RandomForestClassifier',
    'n_estimators': 100,
    'training_samples': len(X_train),
    'fraud_samples': y_train.sum(),
    'precision': float(precision),
    'recall': float(recall),
    'f1_score': float(f1),
    'feature_count': len(feature_names)
}
joblib.dump(metadata, 'model_metadata.pkl')
print(f"    Metadata saved: model_metadata.pkl")


# STEP 9: Test Predictions

print("\n Step 9: Testing sample predictions...")

# Test samples
fraud_samples = X_test_scaled[y_test == 1]
normal_samples = X_test_scaled[y_test == 0]

if len(fraud_samples) > 0 and len(normal_samples) > 0:
    #  FIX: Pass as DataFrame (not list)
    sample_fraud_df = fraud_samples.iloc[[0]]  # Double brackets = DataFrame
    sample_normal_df = normal_samples.iloc[[0]]  # Double brackets = DataFrame
    
    pred_fraud = model.predict(sample_fraud_df)[0]
    pred_normal = model.predict(sample_normal_df)[0]
    
    print(f"\n   Test 1 (Actual Fraud):")
    print(f"   → Predicted: {'Fraud' if pred_fraud == 1 else 'Normal'}")
    print(f"   → {' Correct!' if pred_fraud == 1 else ' Missed'}")
    
    print(f"\n   Test 2 (Actual Normal):")
    print(f"   → Predicted: {'Fraud' if pred_normal == 1 else 'Normal'}")
    print(f"   → {' Correct!' if pred_normal == 0 else ' False Alarm'}")
else:
    print("     Not enough samples for testing")


# FINAL SUMMARY

print("\n" + "=" * 70)
print("TRAINING COMPLETE! ")
print("=" * 70)

print("\n Summary:")
print(f"    Dataset: {len(df):,} transactions")
print(f"    Model: Random Forest (100 trees)")
print(f"    Precision: {precision*100:.2f}%")
print(f"    Recall: {recall*100:.2f}%")
print(f"    F1-Score: {f1:.4f}")

print("\n Saved Files:")
print(f"   - fraud_model_v2.pkl")
print(f"   - amount_scaler.pkl")
print(f"   - feature_names.pkl")
print(f"   - model_metadata.pkl")

print("\n Next Steps:")
print("   1. Update model_loader.py to use fraud_model_v2.pkl")
print("   2. Test with backend API")
print("   3. Integrate with frontend")

print("\n" + "=" * 70)