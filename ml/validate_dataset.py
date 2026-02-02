import pandas as pd
import numpy as np
from pathlib import Path
import sys

class DatasetValidator:
    """Validates the credit card fraud dataset"""
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.df = None
        self.errors = []
        self.warnings = []
        
    def validate(self) -> bool:
        """Run all validation checks"""
        print("=" * 70)
        print("DATASET VALIDATION")
        print("=" * 70)
        
        # Check 1: File exists
        if not self._check_file_exists():
            return False
            
        # Check 2: Load dataset
        if not self._load_dataset():
            return False
            
        # Check 3: Schema validation
        self._validate_schema()
        
        # Check 4: Data quality
        self._validate_data_quality()
        
        # Check 5: Value ranges
        self._validate_value_ranges()
        
        # Check 6: Class distribution
        self._validate_class_distribution()
        
        # Print results
        self._print_results()
        
        # Return success/failure
        return len(self.errors) == 0
    
    def _check_file_exists(self) -> bool:
        """Check if dataset file exists"""
        print("\n Check 1: File Existence")
        
        if not self.dataset_path.exists():
            self.errors.append(f"Dataset file not found: {self.dataset_path}")
            print(f"    File not found: {self.dataset_path}")
            return False
        
        # Check file size
        file_size_mb = self.dataset_path.stat().st_size / (1024 * 1024)
        print(f"   File exists: {self.dataset_path}")
        print(f"   File size: {file_size_mb:.2f} MB")
        
        if file_size_mb < 100:
            self.warnings.append(f"File size ({file_size_mb:.2f} MB) seems small. Expected ~150 MB")
            print(f"   Warning: File might be incomplete")
        
        return True
    
    def _load_dataset(self) -> bool:
        """Load dataset into memory"""
        print("\n Check 2: Loading Dataset")
        
        try:
            self.df = pd.read_csv(self.dataset_path)
            print(f"   Dataset loaded successfully")
            print(f"   Shape: {self.df.shape}")
            return True
        except Exception as e:
            self.errors.append(f"Failed to load dataset: {str(e)}")
            print(f"   Loading failed: {str(e)}")
            return False
    
    def _validate_schema(self):
        """Validate column names and count"""
        print("\n Check 3: Schema Validation")
        
        # Expected columns
        expected_columns = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount', 'Class']
        actual_columns = self.df.columns.tolist()
        
        # Check column count
        if len(actual_columns) != 31:
            self.errors.append(f"Expected 31 columns, found {len(actual_columns)}")
            print(f"   Column count mismatch: {len(actual_columns)} (expected 31)")
        else:
            print(f"   Column count: 31")
        
        # Check column names
        missing_columns = set(expected_columns) - set(actual_columns)
        extra_columns = set(actual_columns) - set(expected_columns)
        
        if missing_columns:
            self.errors.append(f"Missing columns: {missing_columns}")
            print(f"   Missing columns: {missing_columns}")
        
        if extra_columns:
            self.warnings.append(f"Extra columns found: {extra_columns}")
            print(f"   Extra columns: {extra_columns}")
        
        if not missing_columns and not extra_columns:
            print(f"   All expected columns present")
    
    def _validate_data_quality(self):
        """Check for missing values, duplicates, etc."""
        print("\n Check 4: Data Quality")
        
        # Check missing values
        missing = self.df.isnull().sum()
        total_missing = missing.sum()
        
        if total_missing > 0:
            self.errors.append(f"Found {total_missing} missing values")
            print(f"   Missing values found: {total_missing}")
            print("\n   Columns with missing values:")
            for col, count in missing[missing > 0].items():
                print(f"      - {col}: {count}")
        else:
            print(f"   No missing values")
        
        # Check duplicates
        duplicates = self.df.duplicated().sum()
        if duplicates > 0:
            self.warnings.append(f"Found {duplicates} duplicate rows")
            print(f"   Duplicate rows: {duplicates}")
        else:
            print(f"   No duplicate rows")
        
        # Check data types
        print(f"\n   Data Types:")
        non_numeric = []
        for col in self.df.columns:
            if not pd.api.types.is_numeric_dtype(self.df[col]):
                non_numeric.append(col)
                print(f"      {col}: {self.df[col].dtype} (should be numeric)")
        
        if non_numeric:
            self.errors.append(f"Non-numeric columns found: {non_numeric}")
        else:
            print(f"      All columns are numeric")
    
    def _validate_value_ranges(self):
        """Validate value ranges for key columns"""
        print("\n Check 5: Value Range Validation")
        
        # Check Time column
        time_min = self.df['Time'].min()
        time_max = self.df['Time'].max()
        print(f"\n   Time column:")
        print(f"      Range: {time_min:.0f} - {time_max:.0f} seconds")
        
        if time_min < 0:
            self.errors.append("Time values cannot be negative")
            print(f"      Negative time values found")
        else:
            print(f"      Time values valid")
        
        # Check Amount column
        amount_min = self.df['Amount'].min()
        amount_max = self.df['Amount'].max()
        amount_mean = self.df['Amount'].mean()
        print(f"\n   Amount column:")
        print(f"      Min: ${amount_min:.2f}")
        print(f"      Max: ${amount_max:.2f}")
        print(f"      Mean: ${amount_mean:.2f}")
        
        if amount_min < 0:
            self.errors.append("Amount values cannot be negative")
            print(f"      Negative amounts found")
        else:
            print(f"      Amount values valid")
        
        # Check for infinity or NaN
        inf_count = np.isinf(self.df.select_dtypes(include=[np.number])).sum().sum()
        if inf_count > 0:
            self.errors.append(f"Found {inf_count} infinite values")
            print(f"      Infinite values: {inf_count}")
        else:
            print(f"      No infinite values")
        
        # Check Class column
        unique_classes = self.df['Class'].unique()
        print(f"\n   Class column:")
        print(f"      Unique values: {sorted(unique_classes)}")
        
        if not set(unique_classes).issubset({0, 1}):
            self.errors.append(f"Class column should only contain 0 and 1, found: {unique_classes}")
            print(f"      Invalid class values")
        else:
            print(f"      Class values valid (0, 1)")
    
    def _validate_class_distribution(self):
        """Check class imbalance"""
        print("\n Check 6: Class Distribution")
        
        class_counts = self.df['Class'].value_counts()
        fraud_count = class_counts.get(1, 0)
        normal_count = class_counts.get(0, 0)
        total = len(self.df)
        
        fraud_percentage = (fraud_count / total) * 100
        
        print(f"\n   Distribution:")
        print(f"      Normal (0): {normal_count:,} ({100-fraud_percentage:.2f}%)")
        print(f"      Fraud (1):  {fraud_count:,} ({fraud_percentage:.2f}%)")
        print(f"      Total:      {total:,}")
        
        # Expected range: 0.15% - 0.20% fraud
        if fraud_percentage < 0.1 or fraud_percentage > 0.5:
            self.warnings.append(
                f"Fraud percentage ({fraud_percentage:.2f}%) outside expected range (0.15%-0.20%)"
            )
            print(f"      Unusual fraud percentage")
        else:
            print(f"      Fraud percentage within expected range")
        
        # Check minimum samples
        if fraud_count < 100:
            self.warnings.append(f"Only {fraud_count} fraud samples (might be too few)")
            print(f"      Low fraud sample count")
        
        if total < 100000:
            self.warnings.append(f"Only {total:,} total samples (expected ~280K)")
            print(f"      Dataset might be incomplete")
    
    def _print_results(self):
        """Print validation summary"""
        print("\n" + "=" * 70)
        print("VALIDATION RESULTS")
        print("=" * 70)
        
        # Errors
        if self.errors:
            print(f"\n ERRORS FOUND: {len(self.errors)}")
            for i, error in enumerate(self.errors, 1):
                print(f"   {i}. {error}")
        else:
            print(f"\n NO ERRORS FOUND")
        
        # Warnings
        if self.warnings:
            print(f"\n WARNINGS: {len(self.warnings)}")
            for i, warning in enumerate(self.warnings, 1):
                print(f"   {i}. {warning}")
        else:
            print(f"\n NO WARNINGS")
        
        # Final verdict
        print("\n" + "=" * 70)
        if len(self.errors) == 0:
            print(" DATASET VALIDATION PASSED")
            print("   Dataset is ready for training!")
        else:
            print(" DATASET VALIDATION FAILED")
            print("   Please fix the errors above before training")
        print("=" * 70)


def main():
    """Main execution"""
    dataset_path = "../ml/datasets/creditcard.csv"
    
    validator = DatasetValidator(dataset_path)
    is_valid = validator.validate()
    
    # Exit with appropriate code
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()