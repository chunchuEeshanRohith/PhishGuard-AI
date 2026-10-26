import os
import json
import torch
import pandas as pd
import numpy as np

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.siamese_lstm_attention import SiameseLSTMAttention

BASE_DIR = '/Users/eeshanrohith/Desktop/mini/backend'
MODELS_DIR = os.path.join(BASE_DIR, 'models')
PROCESSED_DIR = os.path.join(BASE_DIR, 'datasets', 'processed')

def encode_url(url, char_to_idx, max_len):
    url = str(url)
    encoded = [char_to_idx.get(c, char_to_idx["<UNK>"]) for c in url]
    encoded = encoded[:max_len]
    encoded = encoded + [char_to_idx["<PAD>"]] * (max_len - len(encoded))
    return encoded

def generate_reference_embeddings():
    print("Loading model configuration...")
    with open(os.path.join(MODELS_DIR, 'tokenizer_config.json'), 'r') as f:
        tokenizer_config = json.load(f)
        
    with open(os.path.join(MODELS_DIR, 'model_config.json'), 'r') as f:
        model_config = json.load(f)
        
    vocab_size = tokenizer_config['vocab_size']
    max_len = tokenizer_config['max_len']
    char_to_idx = tokenizer_config['char_to_idx']
    
    device = torch.device('mps' if torch.backends.mps.is_available() else 'cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    model = SiameseLSTMAttention(
        vocab_size=model_config['vocab_size'],
        embedding_dim=model_config['embedding_dim'],
        hidden_dim=model_config['hidden_dim'],
        num_layers=model_config['num_layers'],
        dropout=model_config['dropout']
    ).to(device)
    
    model.load_state_dict(torch.load(os.path.join(MODELS_DIR, 'phishing_model.pth'), map_location=device))
    model.eval()
    
    print("Loading training dataset to extract reference phishing URLs...")
    train_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'train.csv'))
    
    # Filter only phishing URLs
    phishing_df = train_df[train_df['label'] == 1].copy()
    
    # We will pick a deterministic sample of 100 phishing URLs to form our robust anchor representation
    phishing_df = phishing_df.sample(n=100, random_state=42)
    
    print(f"Generating embeddings for {len(phishing_df)} phishing reference URLs...")
    
    embeddings = []
    with torch.no_grad():
        for url in phishing_df['url']:
            encoded = encode_url(url, char_to_idx, max_len)
            tensor_url = torch.tensor([encoded], dtype=torch.long).to(device)
            # Get the representation for the URL from the shared Siamese encoder
            repr_b = model.forward_one_branch(tensor_url)
            embeddings.append(repr_b.cpu())
            
    # Concatenate all embeddings
    all_embeddings = torch.cat(embeddings, dim=0) # shape: (100, hidden_dim * 2)
    
    # Compute the mean representation (centroid) of the phishing URLs
    mean_phishing_embedding = torch.mean(all_embeddings, dim=0, keepdim=True) # shape: (1, hidden_dim * 2)
    
    out_path = os.path.join(MODELS_DIR, 'phishing_reference_embeddings.pt')
    torch.save(mean_phishing_embedding, out_path)
    
    print(f"Successfully saved mean phishing reference embedding to: {out_path}")
    print(f"Shape of reference embedding: {mean_phishing_embedding.shape}")

if __name__ == "__main__":
    generate_reference_embeddings()
