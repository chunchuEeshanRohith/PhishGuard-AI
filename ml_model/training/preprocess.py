import os
import pandas as pd
from sklearn.model_selection import train_test_split

def create_preprocessing_pipeline():
    print("🚀 Starting Data Preprocessing Pipeline...")
    
    # 1. Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_dir = os.path.join(base_dir, 'dataset')
    
    raw_data_path = os.path.join(dataset_dir, 'phishing.csv')
    processed_data_path = os.path.join(dataset_dir, 'processed_phishing.csv')
    
    x_train_path = os.path.join(dataset_dir, 'X_train.csv')
    x_test_path = os.path.join(dataset_dir, 'X_test.csv')
    y_train_path = os.path.join(dataset_dir, 'y_train.csv')
    y_test_path = os.path.join(dataset_dir, 'y_test.csv')
    
    # 2. Read dataset
    if not os.path.exists(raw_data_path):
        raise FileNotFoundError(f"Raw dataset not found at {raw_data_path}")
    
    df = pd.read_csv(raw_data_path)
    initial_shape = df.shape
    print(f"✅ Loaded raw dataset: {initial_shape[0]} rows, {initial_shape[1]} columns")
    
    # 3. Drop 'id' column
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
        print("✅ Dropped 'id' column")
        
    # 4. Verify no missing values
    missing_values = df.isnull().sum().sum()
    if missing_values > 0:
        print(f"⚠️ Warning: Found {missing_values} missing values. Dropping them.")
        df = df.dropna()
    else:
        print("✅ Verified: No missing values found.")
        
    # 5. Verify & Drop duplicates (UPDATED: Retain duplicates)
    # Since the dataset features are purely categorical (-1, 0, 1), it is highly probable 
    # that two entirely different URLs share the exact same feature vector. 
    # Removing these would destroy natural frequency distributions.
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        print(f"✅ Verified: Found {duplicates} duplicate feature vectors. Keeping them as they represent distinct websites.")
    else:
        print("✅ Verified: No duplicate rows found.")
        
    # 6. Convert Result (-1 -> 0, 1 -> 1)
    if 'Result' in df.columns:
        # We assume 1 is Legitimate and -1 is Phishing
        df['Result'] = df['Result'].map({1: 1, -1: 0})
        print("✅ Converted Target 'Result': -1 -> 0 (Phishing), 1 -> 1 (Legitimate)")
    else:
        raise ValueError("Target column 'Result' not found in dataset.")
        
    # 7. Save the processed dataset
    df.to_csv(processed_data_path, index=False)
    print(f"✅ Saved processed dataset to: {processed_data_path}")
    
    # 8. Split into X and y
    X = df.drop(columns=['Result'])
    y = df['Result']
    
    # 9. Perform 80/20 Stratified Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print("✅ Performed 80/20 Stratified Train/Test split.")
    
    # 10. Save splits
    X_train.to_csv(x_train_path, index=False)
    X_test.to_csv(x_test_path, index=False)
    y_train.to_csv(y_train_path, index=False)
    y_test.to_csv(y_test_path, index=False)
    print("✅ Saved X_train, X_test, y_train, y_test to ml_model/dataset/")
    
    # 11. Print Summary
    print("\n" + "="*50)
    print("📊 PREPROCESSING SUMMARY")
    print("="*50)
    print(f"Original Dataset Shape : {initial_shape}")
    print(f"Cleaned Dataset Shape  : {df.shape}")
    print(f"Features (X)           : {X.shape[1]}")
    print(f"Training Set (80%)     : {X_train.shape[0]} rows")
    print(f"Testing Set (20%)      : {X_test.shape[0]} rows")
    print("\nTarget Class Distribution (Cleaned):")
    dist = y.value_counts(normalize=True) * 100
    print(f"  1 (Legitimate) : {dist.get(1, 0):.2f}%")
    print(f"  0 (Phishing)   : {dist.get(0, 0):.2f}%")
    print("="*50)
    print("🚀 Preprocessing Complete. Ready for Model Training.\n")

if __name__ == "__main__":
    create_preprocessing_pipeline()
