import os
import json
import time
import random
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

try:
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.siamese_lstm_attention import SiameseLSTMAttention

BASE_DIR = '/Users/eeshanrohith/Desktop/mini/backend'
MODELS_DIR = os.path.join(BASE_DIR, 'models')
PROCESSED_DIR = os.path.join(BASE_DIR, 'datasets', 'processed')

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def encode_url(url, char_to_idx, max_len):
    url = str(url)
    encoded = [char_to_idx.get(c, char_to_idx["<UNK>"]) for c in url]
    encoded = encoded[:max_len]
    encoded = encoded + [char_to_idx["<PAD>"]] * (max_len - len(encoded))
    return encoded

class PhishingPairDataset(Dataset):
    def __init__(self, df, char_to_idx, max_len):
        self.df = df.reset_index(drop=True)
        self.char_to_idx = char_to_idx
        self.max_len = max_len
        self.phishing_urls = self.df[self.df['label'] == 1]['url'].tolist()

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        url_a = str(self.df.iloc[idx]['url'])
        label_a = float(self.df.iloc[idx]['label'])
        
        url_b = url_a
        attempts = 0
        while url_b == url_a and attempts < 10:
            url_b = random.choice(self.phishing_urls)
            attempts += 1
            
        encoded_a = encode_url(url_a, self.char_to_idx, self.max_len)
        encoded_b = encode_url(url_b, self.char_to_idx, self.max_len)
        
        return torch.tensor(encoded_a, dtype=torch.long), \
               torch.tensor(encoded_b, dtype=torch.long), \
               torch.tensor([label_a], dtype=torch.float32)

def train():
    set_seed(42)
    # FORCING CPU to avoid MPS hangs/OOMs
    device = torch.device("cpu")
    print(f"Using device: {device}", flush=True)
    
    with open(os.path.join(MODELS_DIR, 'tokenizer_config.json'), 'r') as f:
        tokenizer_config = json.load(f)
        
    vocab_size = tokenizer_config['vocab_size']
    max_len = tokenizer_config['max_len']
    char_to_idx = tokenizer_config['char_to_idx']
    
    print("Loading datasets...", flush=True)
    train_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'train.csv'))
    val_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'validation.csv'))
    test_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'test.csv'))
    
    # Very small sample for speed to prove it works
    train_df = train_df.sample(n=10000, random_state=42)
    val_df = val_df.sample(n=1000, random_state=42)
    
    BATCH_SIZE = 256
    train_loader = DataLoader(PhishingPairDataset(train_df, char_to_idx, max_len), batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(PhishingPairDataset(val_df, char_to_idx, max_len), batch_size=BATCH_SIZE, shuffle=False)
    test_loader = DataLoader(PhishingPairDataset(test_df, char_to_idx, max_len), batch_size=BATCH_SIZE, shuffle=False)
    
    model = SiameseLSTMAttention(
        vocab_size=vocab_size,
        embedding_dim=64,
        hidden_dim=128,
        num_layers=2,
        dropout=0.3
    ).to(device)
    
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=0.001)
    
    EPOCHS = 2
    PATIENCE = 3
    
    best_val_f1 = 0.0
    patience_counter = 0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': [], 'val_f1': []}
    
    start_time = time.time()
    
    print("Starting full training...", flush=True)
    for epoch in range(EPOCHS):
        model.train()
        train_loss = 0.0
        train_preds, train_targets = [], []
        
        for batch_idx, (batch_a, batch_b, labels) in enumerate(train_loader):
            batch_a, batch_b, labels = batch_a.to(device), batch_b.to(device), labels.to(device)
            
            optimizer.zero_grad()
            logits, _, _ = model(batch_a, batch_b)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            preds = (torch.sigmoid(logits) > 0.5).float()
            train_preds.extend(preds.cpu().numpy())
            train_targets.extend(labels.cpu().numpy())
            
            if batch_idx % 10 == 0:
                print(f"Epoch {epoch+1} - Batch {batch_idx}/{len(train_loader)}", flush=True)
            
        train_loss /= len(train_loader)
        train_acc = accuracy_score(train_targets, train_preds)
        
        # VALIDATION
        model.eval()
        val_loss = 0.0
        val_preds, val_targets = [], []
        
        with torch.no_grad():
            for batch_a, batch_b, labels in val_loader:
                batch_a, batch_b, labels = batch_a.to(device), batch_b.to(device), labels.to(device)
                logits, _, _ = model(batch_a, batch_b)
                loss = criterion(logits, labels)
                
                val_loss += loss.item()
                preds = (torch.sigmoid(logits) > 0.5).float()
                val_preds.extend(preds.cpu().numpy())
                val_targets.extend(labels.cpu().numpy())
                
        val_loss /= len(val_loader)
        val_acc = accuracy_score(val_targets, val_preds)
        val_f1 = f1_score(val_targets, val_preds, zero_division=0)
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        history['val_f1'].append(val_f1)
        
        print(f"Epoch {epoch+1}/{EPOCHS} | Train Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f}, Acc: {val_acc:.4f}, F1: {val_f1:.4f}", flush=True)
        
        if val_f1 >= best_val_f1:
            best_val_f1 = val_f1
            patience_counter = 0
            torch.save(model.state_dict(), os.path.join(MODELS_DIR, 'phishing_model.pth'))
            
            model_config = {
                "vocab_size": vocab_size,
                "embedding_dim": 64,
                "hidden_dim": 128,
                "num_layers": 2,
                "dropout": 0.3,
                "max_len": max_len
            }
            with open(os.path.join(MODELS_DIR, 'model_config.json'), 'w') as f:
                json.dump(model_config, f, indent=4)
        else:
            patience_counter += 1
            if patience_counter >= PATIENCE:
                print("Early stopping triggered.", flush=True)
                break
                
    total_time = time.time() - start_time
    
    with open(os.path.join(BASE_DIR, 'training', 'training_history.json'), 'w') as f:
        json.dump(history, f, indent=4)
        
    print("\n--- EVALUATING ON UNTOUCHED TEST SET ---", flush=True)
    model.load_state_dict(torch.load(os.path.join(MODELS_DIR, 'phishing_model.pth'), map_location=device, weights_only=True))
    model.eval()
    
    test_preds, test_targets = [], []
    with torch.no_grad():
        for batch_a, batch_b, labels in test_loader:
            batch_a, batch_b, labels = batch_a.to(device), batch_b.to(device), labels.to(device)
            logits, _, _ = model(batch_a, batch_b)
            preds = (torch.sigmoid(logits) > 0.5).float()
            test_preds.extend(preds.cpu().numpy())
            test_targets.extend(labels.cpu().numpy())
            
    t_acc = accuracy_score(test_targets, test_preds)
    t_prec = precision_score(test_targets, test_preds, zero_division=0)
    t_rec = recall_score(test_targets, test_preds, zero_division=0)
    t_f1 = f1_score(test_targets, test_preds, zero_division=0)
    cm = confusion_matrix(test_targets, test_preds)
    cr = classification_report(test_targets, test_preds, target_names=["Legitimate", "Phishing"])
    
    print("\n--- FINAL RESULTS ---", flush=True)
    print(f"Total Training Time: {total_time/60:.2f} minutes", flush=True)
    print(f"Epochs Completed: {len(history['val_f1'])}", flush=True)
    print(f"Best Validation F1: {best_val_f1:.4f}", flush=True)
    print(f"\nTEST ACCURACY: {t_acc:.4f}", flush=True)
    print(f"TEST PRECISION: {t_prec:.4f}", flush=True)
    print(f"TEST RECALL: {t_rec:.4f}", flush=True)
    print(f"TEST F1 SCORE: {t_f1:.4f}", flush=True)
    print(f"\nConfusion Matrix:\n{cm}", flush=True)
    print(f"\nClassification Report:\n{cr}", flush=True)
    print("---------------------\n", flush=True)

if __name__ == "__main__":
    train()
