import os
import pandas as pd
import numpy as np
import re
import json
from sklearn.model_selection import train_test_split

RANDOM_SEED = 42
BASE_DIR = '/Users/eeshanrohith/Desktop/mini/backend'
DATA_DIR = os.path.join(BASE_DIR, 'datasets')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def normalize_url(url):
    if not isinstance(url, str):
        return ""
    url = url.strip().lower()
    # Remove protocol
    url = re.sub(r"^https?://", "", url)
    # Remove www.
    url = re.sub(r"^www\.", "", url)
    return url

def main():
    print("Loading datasets...")
    # Load PhishTank
    pt_path = os.path.join(DATA_DIR, 'PhishTank_2026.csv')
    df_phish = pd.read_csv(pt_path)
    df_phish = df_phish[['URL']].copy()
    df_phish.columns = ['url']
    df_phish['label'] = 1
    
    # Load Top-1m
    top_path = os.path.join(DATA_DIR, 'top-1m.csv')
    df_legit = pd.read_csv(top_path, header=None)
    df_legit = df_legit[[1]].copy()
    df_legit.columns = ['url']
    df_legit['label'] = 0
    
    orig_phish = len(df_phish)
    orig_legit = len(df_legit)
    
    print("Normalizing URLs...")
    df_phish['url'] = df_phish['url'].apply(normalize_url)
    df_legit['url'] = df_legit['url'].apply(normalize_url)
    
    # Remove empty URLs
    df_phish = df_phish[df_phish['url'] != '']
    df_legit = df_legit[df_legit['url'] != '']
    
    # Remove duplicates within each dataset
    df_phish = df_phish.drop_duplicates(subset=['url'])
    df_legit = df_legit.drop_duplicates(subset=['url'])
    
    invalid_phish = orig_phish - len(df_phish)
    invalid_legit = orig_legit - len(df_legit)
    
    # Balance datasets
    num_phish = len(df_phish)
    # Since we have ~1 million legitimate, we sample to match phishing count exactly to avoid class imbalance.
    if len(df_legit) > num_phish:
        df_legit = df_legit.sample(n=num_phish, random_state=RANDOM_SEED)
        
    final_phish = len(df_phish)
    final_legit = len(df_legit)
    
    print("Combining datasets...")
    df_combined = pd.concat([df_phish, df_legit], ignore_index=True)
    
    # Drop any cross-duplicates (e.g., a URL that is in both legitimate and phishing)
    # Keeping False drops both to be absolutely safe and prevent noise.
    df_combined = df_combined.drop_duplicates(subset=['url'], keep=False)
    
    # Split datasets
    # 80% train, 10% val, 10% test
    # First split train and temp (20%)
    train_df, temp_df = train_test_split(df_combined, test_size=0.20, random_state=RANDOM_SEED, stratify=df_combined['label'])
    # Then split temp into val and test (50% of 20% = 10%)
    val_df, test_df = train_test_split(temp_df, test_size=0.50, random_state=RANDOM_SEED, stratify=temp_df['label'])
    
    print("Saving processed datasets...")
    train_df.to_csv(os.path.join(PROCESSED_DIR, 'train.csv'), index=False)
    val_df.to_csv(os.path.join(PROCESSED_DIR, 'validation.csv'), index=False)
    test_df.to_csv(os.path.join(PROCESSED_DIR, 'test.csv'), index=False)
    
    # Create character-level vocabulary from train_df to prevent test leakage
    print("Building vocabulary...")
    unique_chars = set()
    for url in train_df['url']:
        unique_chars.update(list(url))
        
    chars = sorted(list(unique_chars))
    # Reserve 0 for PAD, 1 for UNK
    char_to_idx = {"<PAD>": 0, "<UNK>": 1}
    for i, c in enumerate(chars):
        char_to_idx[c] = i + 2
        
    tokenizer_config = {
        "char_to_idx": char_to_idx,
        "vocab_size": len(char_to_idx),
        "max_len": 200 # Fixed max length based on typical URL limits for deep learning
    }
    
    with open(os.path.join(MODELS_DIR, 'tokenizer_config.json'), 'w') as f:
        json.dump(tokenizer_config, f, indent=4)
        
    print("\n--- PREPROCESSING REPORT ---")
    print(f"Original PhishTank rows: {orig_phish}")
    print(f"Original top-1m rows: {orig_legit}")
    print(f"Removed/Invalid/Duplicate Phishing: {invalid_phish}")
    print(f"Removed/Invalid/Duplicate Legitimate: {invalid_legit}")
    print(f"Final Phishing Count: {final_phish}")
    print(f"Final Legitimate Count: {final_legit} (sampled to balance)")
    print(f"Total Combined (after cross-deduplication): {len(df_combined)}")
    print(f"Train size: {len(train_df)}")
    print(f"Validation size: {len(val_df)}")
    print(f"Test size: {len(test_df)}")
    print(f"Train class distribution: Legitimate={len(train_df[train_df['label']==0])}, Phishing={len(train_df[train_df['label']==1])}")
    print(f"Tokenizer vocab size: {tokenizer_config['vocab_size']}")
    print("----------------------------\n")

if __name__ == "__main__":
    main()
