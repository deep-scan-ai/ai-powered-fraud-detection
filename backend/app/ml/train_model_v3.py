import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, 
    roc_curve, precision_recall_curve, f1_score
)
import xgboost as xgb

from preprocessor import FraudPreprocessor

print("=" * 80)
print("ADVANCED FRAUD DETECTION MODEL TRAINING")
print("=" * 80)

# STEP 1: Load Dataset
print("\n Step 1: Loading dataset...")

script_dir = Path(__file__).resolve().parent
dataset_path = script_dir / "../../../ml/datasets/creditcard.csv"

if not dataset_path.exists():
    print(f" Dataset not found: {dataset_path}")
    exit(1)

df = pd.read_csv(dataset_path)
print(f" Dataset loaded: {df.shape}")
print(f"   Transactions: {len(df):,}")
print(f"   Fraud: {df['Class'].sum():,} ({df['Class'].mean()*100:.2f}%)")


# STEP 2: Prepare Data

print("\n Step 2: Preparing data...")

X = df.drop('Class', axis=1)
y = df['Class']

print(f"   Features shape: {X.shape}")
print(f"   Target shape: {y.shape}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"   Train: {len(X_train):,} | Test: {len(X_test):,}")
print(f"   Train fraud: {y_train.sum()} | Test fraud: {y_test.sum()}")


# STEP 3: Feature Engineering

print("\n Step 3: Feature engineering...")

preprocessor = FraudPreprocessor()
X_train_processed = preprocessor.fit_transform(X_train, y_train)
X_test_processed = preprocessor.transform(X_test)

print(f"   Original features: {X_train.shape[1]}")
print(f"   Engineered features: {X_train_processed.shape[1]}")
print(f"   Added: {X_train_processed.shape[1] - X_train.shape[1]} new features")


preprocessor.save('fraud_preprocessor_v3.pkl')



# STEP 4: Train Multiple Models

print("\n Step 4: Training and comparing models...")
print("   This may take 5-10 minutes...")

models = {
    'RandomForest': RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=4,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
        verbose=0
    ),
    # 'GradientBoosting': GradientBoostingClassifier(
    #     n_estimators=100,
    #     max_depth=5,
    #     learning_rate=0.1,
    #     subsample=0.8,
    #     random_state=42,
    #     verbose=0
    # ),
    'XGBoost': xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=577,  # Imbalance ratio
        random_state=42,
        n_jobs=-1,
        eval_metric='logloss'
    )
}

results = {}

for name, model in models.items():
    print(f"\n   Training {name}...")
    
    # Train
    model.fit(X_train_processed, y_train)
    
    # Predict
    y_pred = model.predict(X_test_processed)
    y_pred_proba = model.predict_proba(X_test_processed)[:, 1]
    
    # Evaluate
    from sklearn.metrics import precision_score, recall_score, accuracy_score
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    results[name] = {
        'model': model,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }
    
    print(f"      Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"      Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"      Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"      F1-Score:  {f1:.4f}")
    print(f"      ROC-AUC:   {roc_auc:.4f}")




# STEP 5: Select Best Model

print("\n Step 5: Selecting best model...")


best_model_name = max(results.keys(), key=lambda k: results[k]['f1'])
best_result = results[best_model_name]
best_model = best_result['model']

print(f"\n   Best Model: {best_model_name}")
print(f"   F1-Score: {best_result['f1']:.4f}")
print(f"   Accuracy: {best_result['accuracy']:.4f}")
print(f"   Recall: {best_result['recall']:.4f}")




# STEP 6: Cross-Validation

print("\n Step 6: Cross-validation...")

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(
    best_model, 
    X_train_processed, 
    y_train,
    cv=cv,
    scoring='f1',
    n_jobs=-1
)

print(f"   CV F1-Scores: {cv_scores}")
print(f"   Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")




# STEP 7: Detailed Evaluation

print("\n Step 7: Detailed evaluation...")

y_pred = best_result['y_pred']
y_pred_proba = best_result['y_pred_proba']


cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()

print("\n   Confusion Matrix:")
print("                  Predicted")
print("                Normal  Fraud")
print(f"   Actual Normal  {tn:5d}  {fp:5d}")
print(f"          Fraud   {fn:5d}  {tp:5d}")

print(f"\n   True Positives:  {tp} (correctly detected frauds)")
print(f"   False Positives: {fp} (false alarms)")
print(f"   True Negatives:  {tn} (correctly identified normal)")
print(f"   False Negatives: {fn} (missed frauds)")


print("\n   Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Fraud']))

# Add after Step 7
import matplotlib
matplotlib.use('Agg')  # For non-GUI backend

# Plot ROC curve
fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, label=f'ROC curve (AUC = {best_result["roc_auc"]:.3f})')
plt.plot([0, 1], [0, 1], 'k--', label='Random')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title(f'{best_model_name} - ROC Curve')
plt.legend()
plt.grid(True)
plt.savefig('roc_curve.png')
print("   ✅ ROC curve saved: roc_curve.png")


# STEP 8: Feature Importance

print("\n Step 8: Feature importance...")

if hasattr(best_model, 'feature_importances_'):
    feature_names = X_train_processed.columns
    importances = best_model.feature_importances_
    
   
    indices = np.argsort(importances)[::-1]
    
    print("\n   Top 15 Important Features:")
    for i in range(min(15, len(indices))):
        idx = indices[i]
        print(f"      {i+1}. {feature_names[idx]:20s}: {importances[idx]:.4f}")


# STEP 9: Save Best Model

print("\n Step 9: Saving model...")

# Save model
joblib.dump(best_model, 'fraud_model_v3.pkl')
print(f"    Model saved: fraud_model_v3.pkl")


metadata = {
    'model_type': best_model_name,
    'accuracy': float(best_result['accuracy']),
    'precision': float(best_result['precision']),
    'recall': float(best_result['recall']),
    'f1_score': float(best_result['f1']),
    'roc_auc': float(best_result['roc_auc']),
    'cv_f1_mean': float(cv_scores.mean()),
    'cv_f1_std': float(cv_scores.std()),
    'n_features': X_train_processed.shape[1],
    'training_samples': len(X_train),
    'fraud_samples_train': int(y_train.sum()),
    'fraud_samples_test': int(y_test.sum())
}

joblib.dump(metadata, 'model_metadata_v3.pkl')
print(f"    Metadata saved: model_metadata_v3.pkl")

# Save feature names
joblib.dump(list(X_train_processed.columns), 'feature_names_v3.pkl')
print(f"    Feature names saved: feature_names_v3.pkl")



# FINAL SUMMARY

print("\n" + "=" * 80)
print("TRAINING COMPLETE!")
print("=" * 80)

print(f"\n Best Model: {best_model_name}")
print(f" Accuracy:  {best_result['accuracy']*100:.2f}%")
print(f" Precision: {best_result['precision']*100:.2f}%")
print(f" Recall:    {best_result['recall']*100:.2f}%")
print(f" F1-Score:  {best_result['f1']:.4f}")
print(f" ROC-AUC:   {best_result['roc_auc']:.4f}")

# Check if targets met
meets_accuracy = best_result['accuracy'] >= 0.95
meets_recall = best_result['recall'] >= 0.80

print(f"\n Target Achievement:")
print(f"   Accuracy >95%: {' YES' if meets_accuracy else ' NO'} ({best_result['accuracy']*100:.2f}%)")
print(f"   Recall >80%:   {' YES' if meets_recall else ' NO'} ({best_result['recall']*100:.2f}%)")

if meets_accuracy and meets_recall:
    print("\n All targets achieved!")
else:
    print("\n  Some targets not met. Consider:")
    print("   - Hyperparameter tuning")
    print("   - More feature engineering")
    print("   - Ensemble methods")

print("\n Files created:")
print("   - fraud_model_v3.pkl")
print("   - fraud_preprocessor_v3.pkl")
print("   - model_metadata_v3.pkl")
print("   - feature_names_v3.pkl")

print("\n Next: Update model_loader.py to use v3 model")
print("=" * 80)