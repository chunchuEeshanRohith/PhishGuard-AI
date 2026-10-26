# Phishing Detection API Backend

This is the Flask backend for the AI-Based Phishing Website Detection project.

## 1. How to Start Flask

To run the server in development mode:

```bash
cd backend
python3 app.py
```

The server will start on `http://0.0.0.0:5005` (or `http://localhost:5005`).
CORS is enabled for all domains by default via `flask_cors`.

## 2. Model Files

The trained PyTorch Siamese model weights and configurations are located in `backend/models/`:
- `phishing_model.pth`: Trained PyTorch weights.
- `model_config.json`: Model architecture parameters (hidden_dim, num_layers, etc.).
- `phishing_reference_embeddings.pt`: The pre-computed phishing anchor representation for the Siamese network.

## 3. Tokenizer

The tokenizer maps characters to integers using a fixed vocabulary built during training.
- Configuration: `backend/models/tokenizer_config.json`
- Max Sequence Length: 200 (Any URL longer than 200 is truncated, shorter URLs are padded with `<PAD>`).
- Normalization: URLs are stripped of `http://`, `https://`, and `www.` and converted to lowercase *before* tokenization.

## 4. API Endpoints

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
    "status": "healthy",
    "model_loaded": true,
    "model": "Siamese-LSTM-Attention",
    "model_version": "1.0"
}
```

### Prediction

**Endpoint:** `POST /api/predict`

**Request Format:**
```json
{
    "url": "https://example.com"
}
```

**Response Format (Success):**
```json
{
    "request_id": "REQ-20261007-1234",
    "scan_time": "2026-10-07T12:00:00Z",
    "url": "https://example.com",
    "prediction": "Legitimate",
    "confidence": 0.992,
    "threat_score": 1,
    "raw_probability": 0.008,
    "model": "Siamese-LSTM-Attention",
    "model_version": "1.0",
    "features_analyzed": [
        "char_sequence_embedding",
        "siamese_similarity",
        "bilstm_attention_context"
    ],
    "processing_time_ms": 42
}
```

## 7. Model Architecture

The core model is a Hybrid Siamese Deep Learning Architecture (`SiameseLSTMAttention`):
1. **Input:** Character sequences of the URL.
2. **Embedding:** Maps characters to dense vectors.
3. **BiLSTM Encoder:** A Bidirectional LSTM processes the sequence.
4. **Attention Mechanism:** Weighs the most important character sequences (e.g., suspicious keywords or odd domains).
5. **Siamese Network:** A single target URL is encoded and compared against a pre-computed "Reference Phishing Embedding" (Cluster Center).
6. **Classification:** Uses the learned representation and similarity features to output a binary logit.

## 8. Inference Process

1. Validates the URL input format.
2. Normalizes and tokenizes the URL precisely as done during training.
3. Converts tokens to a PyTorch tensor on the selected device.
4. Passes the tensor through the model's single-branch forward pass (`repr_a`).
5. Combines `repr_a` with the loaded `phishing_reference_embeddings.pt` (`repr_b`).
6. Passes the combined vector through the classification head to get the raw probability via sigmoid.
7. Computes a threat score (0-100) and maps the label (`Phishing` if probability > 0.5, else `Legitimate`).

## 9. Device Selection

The application automatically selects the best available hardware accelerator upon initialization:
- **MPS (Apple Silicon GPU):** Priority 1
- **CUDA (NVIDIA GPU):** Priority 2
- **CPU:** Fallback

## 10. Important Limitations

- **Experimental Performance:** The previously reported 99.18% accuracy is based on an experimental 10,000 row subset for 2 epochs. The model is highly accurate but should be trained on the full 100k+ dataset for production deployment.
- **Reference Embedding Limit:** The Siamese reference is currently an averaged center of 100 known phishing URLs. Extreme outlier phishing URLs might require multiple reference anchors in a robust production setting.
