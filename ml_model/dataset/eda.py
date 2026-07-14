import pandas as pd
import numpy as np
import json

def analyze_dataset(file_path):
    print("--- 1. Reading Dataset ---")
    df = pd.read_csv(file_path)
    print("Dataset read successfully.\n")

    print("--- 2. Dataset Shape ---")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}\n")

    print("--- 3. First 10 Records ---")
    print(df.head(10).to_string())
    print("\n")

    print("--- 4. Column Names ---")
    print(df.columns.tolist())
    print("\n")

    print("--- 6. Target (Label) Column ---")
    target = 'Result' if 'Result' in df.columns else 'class' if 'class' in df.columns else 'Unknown'
    print(f"Target Column: {target}")
    print("\n")

    print("--- 7. Data Types ---")
    print(df.dtypes)
    print("\n")

    print("--- 8. Missing Values ---")
    print(df.isnull().sum())
    print("\n")

    print("--- 9. Duplicate Records ---")
    print(f"Number of duplicate records: {df.duplicated().sum()}")
    print("\n")

    print("--- 10. Class Distribution ---")
    if target != 'Unknown':
        print(df[target].value_counts(normalize=True) * 100)
    print("\n")

    print("--- 11. Descriptive Statistics ---")
    print(df.describe().to_string())
    print("\n")

    print("--- 12. Categorical & Numerical Columns ---")
    # In this dataset, all values are -1, 0, 1 but technically they are categorical features encoded as integers.
    print("Technically, all columns are numerical (int64), but logically they represent categorical states (-1, 0, 1).")
    print("\n")
    
if __name__ == "__main__":
    analyze_dataset('/Users/eeshanrohith/Desktop/mini/ml_model/dataset/phishing.csv')
