import os
import pandas as pd
from sklearn.model_selection import train_test_split
import json

def main():
    print("🚀 Starting Reduced Feature Preprocessing (v2)...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_dir = os.path.join(base_dir, 'dataset')
    
    raw_path = os.path.join(dataset_dir, 'phishing.csv')
    processed_path = os.path.join(dataset_dir, 'processed_phishing_reduced.csv')
    
    # Ensure backend models directory exists for feature_order.json
    backend_models_dir = os.path.join(os.path.dirname(base_dir), 'backend', 'models')
    os.makedirs(backend_models_dir, exist_ok=True)
    
    df = pd.read_csv(raw_path)
    
    # 1. Define the strictly deployable feature set
    # These are the only features we can extract rapidly (< 1s) without paid APIs or deep scraping
    DEPLOYABLE_FEATURES = [
        'having_IP_Address',
        'URL_Length',
        'Shortining_Service',
        'having_At_Symbol',
        'double_slash_redirecting',
        'Prefix_Suffix',
        'having_Sub_Domain',
        'SSLfinal_State',
        'port',
        'HTTPS_token',
        'Redirect',
        'DNSRecord'
    ]
    
    # Check if 'id' exists
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
        
    # Map Target
    if 'Result' in df.columns:
        df['Result'] = df['Result'].map({1: 1, -1: 0})
        
    # 2. Filter dataset to only the deployable features + target
    columns_to_keep = DEPLOYABLE_FEATURES + ['Result']
    df_reduced = df[columns_to_keep].copy()
    
    # 3. Save feature order for the backend extractor
    feature_order_path = os.path.join(backend_models_dir, 'feature_order.json')
    with open(feature_order_path, 'w') as f:
        json.dump(DEPLOYABLE_FEATURES, f, indent=4)
    print(f"✅ Saved feature order to {feature_order_path}")
    
    # 4. Handle duplicates that arise from reducing 30 features to 12
    # In a 12-feature space, collisions are extremely common. We keep duplicates
    # to maintain the natural probability distribution of the data.
    
    df_reduced.to_csv(processed_path, index=False)
    print(f"✅ Saved reduced dataset to {processed_path} (Shape: {df_reduced.shape})")
    
    # 5. Stratified Split
    X = df_reduced.drop(columns=['Result'])
    y = df_reduced['Result']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    X_train.to_csv(os.path.join(dataset_dir, 'X_train_v2.csv'), index=False)
    X_test.to_csv(os.path.join(dataset_dir, 'X_test_v2.csv'), index=False)
    y_train.to_csv(os.path.join(dataset_dir, 'y_train_v2.csv'), index=False)
    y_test.to_csv(os.path.join(dataset_dir, 'y_test_v2.csv'), index=False)
    
    print("✅ Split and saved X_train_v2, X_test_v2, y_train_v2, y_test_v2")
    print(f"   Training Set: {X_train.shape[0]} rows, Features: {X_train.shape[1]}")
    print(f"   Testing Set:  {X_test.shape[0]} rows")
    
if __name__ == "__main__":
    main()
