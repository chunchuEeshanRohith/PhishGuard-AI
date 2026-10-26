import torch
import torch.nn as nn
import torch.nn.functional as F

class Attention(nn.Module):
    """
    Attention mechanism to weigh the importance of different characters
    in the LSTM sequence output.
    """
    def __init__(self, hidden_dim):
        super(Attention, self).__init__()
        self.attention = nn.Linear(hidden_dim, 1, bias=False)

    def forward(self, lstm_outputs):
        # lstm_outputs shape: (batch_size, seq_len, hidden_dim)
        attn_weights = F.softmax(self.attention(lstm_outputs), dim=1) # (batch_size, seq_len, 1)
        # Context vector is the weighted sum of LSTM outputs
        context = torch.sum(attn_weights * lstm_outputs, dim=1) # (batch_size, hidden_dim)
        return context, attn_weights

class SiameseLSTMAttention(nn.Module):
    """
    Hybrid Siamese Deep Learning Architecture for Phishing Detection.
    Combines Character Embeddings -> LSTM -> Attention -> Siamese Similarity -> Classifier.
    """
    def __init__(self, vocab_size, embedding_dim=64, hidden_dim=128, num_layers=2, dropout=0.3):
        super(SiameseLSTMAttention, self).__init__()
        
        # 1. Embedding Layer
        self.embedding = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embedding_dim, padding_idx=0)
        
        # 2. Shared LSTM Encoder
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # 3. Attention Mechanism (Bidirectional means hidden_dim * 2)
        self.attention = Attention(hidden_dim * 2)
        
        # 4. Classification Head
        # Siamese combination features: [Repr_A, Repr_B, Absolute_Difference(Repr_A, Repr_B), Element-wise_Product(Repr_A, Repr_B)]
        combined_dim = (hidden_dim * 2) * 4
        
        self.classifier = nn.Sequential(
            nn.Linear(combined_dim, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 1) # Binary classification output (Legitimate or Phishing)
        )

    def forward_one_branch(self, x, return_attention=False):
        # x shape: (batch_size, seq_len)
        embedded = self.embedding(x) # (batch_size, seq_len, embedding_dim)
        
        # LSTM outputs
        lstm_out, _ = self.lstm(embedded) # lstm_out: (batch_size, seq_len, hidden_dim * 2)
        
        # Attention context
        context, attn_weights = self.attention(lstm_out) # context: (batch_size, hidden_dim * 2)
        
        if return_attention:
            return context, attn_weights
        return context
        
    def forward(self, url_a, url_b):
        """
        Forward pass for two URLs through the Siamese architecture.
        """
        # Shared weights for both branches
        repr_a = self.forward_one_branch(url_a)
        repr_b = self.forward_one_branch(url_b)
        
        # Similarity Features (L1 distance and Hadamard product)
        abs_diff = torch.abs(repr_a - repr_b)
        element_prod = repr_a * repr_b
        
        # Combine all features for classification
        combined = torch.cat([repr_a, repr_b, abs_diff, element_prod], dim=1)
        
        # Classification Logits
        logits = self.classifier(combined)
        
        return logits, repr_a, repr_b
