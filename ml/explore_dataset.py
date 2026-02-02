import pandas as pd
import numpy as np
import os

print("=" * 60)
print("CREDIT CARD FRAUD DATASET EXPLORATION")
print("=" * 60)

# Step 1: Load dataset
print("\n Loading dataset...")
try:
    dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'creditcard.csv')
    df = pd.read_csv(dataset_path)
    print(" Dataset loaded successfully!")
except FileNotFoundError:
    print(" Error: creditcard.csv not found!")
    print(f"   Expected location: {os.path.join(os.path.dirname(__file__), 'datasets', 'creditcard.csv')}")
    exit(1)

# Step 2: Basic info
print("\n" + "=" * 60)
print("BASIC INFORMATION")
print("=" * 60)

print(f"\n Dataset Shape: {df.shape}")
print(f"   - Rows (Transactions): {df.shape[0]:,}")
print(f"   - Columns (Features): {df.shape[1]}")

print(f"\n Column Names:")
print(f"   {list(df.columns)}")

print(f"\n Dataset Size:")
print(f"   - Memory Usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

# Step 3: Check for missing values
print("\n" + "=" * 60)
print("DATA QUALITY CHECK")
print("=" * 60)

missing = df.isnull().sum()
print(f"\n Missing Values:")
if missing.sum() == 0:
    print("   No missing values! Dataset is clean.")
else:
    print(f"   Total missing: {missing.sum()}")
    print(missing[missing > 0])

# Step 4: Class distribution (වැදගත්!)
print("\n" + "=" * 60)
print("FRAUD vs NORMAL DISTRIBUTION")
print("=" * 60)

class_counts = df['Class'].value_counts()
fraud_count = class_counts[1]
normal_count = class_counts[0]
fraud_percentage = (fraud_count / len(df)) * 100

print(f"\n Transaction Counts:")
print(f"   - Normal (Class 0): {normal_count:,} ({100-fraud_percentage:.2f}%)")
print(f"   - Fraud (Class 1):  {fraud_count:,} ({fraud_percentage:.2f}%)")

print(f"\n Class Imbalance:")
print(f"   - Imbalance Ratio: 1:{int(normal_count/fraud_count)}")
print(f"   - මේකෙන් පේනවා fraud transactions ඉතා අඩුයි!")
print(f"   - Model train කරද්දි special handling අවශ්‍යයි")

# Step 5: Feature statistics
print("\n" + "=" * 60)
print("FEATURE STATISTICS")
print("=" * 60)

print("\n Time Feature:")
print(f"   - Min Time: {df['Time'].min():.0f} seconds")
print(f"   - Max Time: {df['Time'].max():.0f} seconds")
print(f"   - Duration: {df['Time'].max()/3600:.1f} hours")

print("\n Amount Feature:")
print(f"   - Min Amount: ${df['Amount'].min():.2f}")
print(f"   - Max Amount: ${df['Amount'].max():.2f}")
print(f"   - Mean Amount: ${df['Amount'].mean():.2f}")
print(f"   - Median Amount: ${df['Amount'].median():.2f}")

print("\n V1-V28 Features:")
print("   - මේවා PCA transformed features (anonymized)")
print("   - Real feature names කියන්නේ නැහැ (privacy)")
print("   - But ML model එකට use කරන්න පුළුවන්!")

# Step 6: Fraud vs Normal comparison
print("\n" + "=" * 60)
print("FRAUD vs NORMAL COMPARISON")
print("=" * 60)

fraud_df = df[df['Class'] == 1]
normal_df = df[df['Class'] == 0]

print("\n Amount Comparison:")
print(f"   - Normal Average: ${normal_df['Amount'].mean():.2f}")
print(f"   - Fraud Average:  ${fraud_df['Amount'].mean():.2f}")

# Step 7: Sample data
print("\n" + "=" * 60)
print("SAMPLE DATA (First 5 rows)")
print("=" * 60)
print("\n", df.head())

print("\n" + "=" * 60)
print("FRAUD EXAMPLES (First 5 fraud transactions)")
print("=" * 60)
print("\n", fraud_df.head())

# Step 8: Summary
print("\n" + "=" * 60)
print("SUMMARY & RECOMMENDATIONS")
print("=" * 60)

print("\n Dataset is ready for training!")
print("\n  Important Notes:")
print("   1. Highly imbalanced dataset (0.17% fraud)")
print("   2. Need to handle imbalance:")
print("      - Use SMOTE (Synthetic Minority Oversampling)")
print("      - Or use class_weight='balanced'")
print("   3. All features are numeric (no preprocessing needed)")
print("   4. No missing values (clean dataset)")


print("\n" + "=" * 60)
print("EXPLORATION COMPLETE!")
print("=" * 60)