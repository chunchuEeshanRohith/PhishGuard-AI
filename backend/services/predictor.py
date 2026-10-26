import time
import json
import logging
import datetime
import uuid
import os
import re
import torch

from models.siamese_lstm_attention import SiameseLSTMAttention

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

class PredictorService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PredictorService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        try:
            logger.info("Loading Siamese-LSTM-Attention ML Model...")
            
            # 1. Select Device
            if torch.backends.mps.is_available():
                self.device = torch.device('mps')
            elif torch.cuda.is_available():
                self.device = torch.device('cuda')
            else:
                self.device = torch.device('cpu')
                
            logger.info(f"Inference Device selected: {self.device}")
            
            # 2. Load Configs
            with open(os.path.join(MODELS_DIR, 'tokenizer_config.json'), 'r') as f:
                self.tokenizer_config = json.load(f)
                
            with open(os.path.join(MODELS_DIR, 'model_config.json'), 'r') as f:
                self.model_config = json.load(f)
                
            self.char_to_idx = self.tokenizer_config['char_to_idx']
            self.max_len = self.tokenizer_config['max_len']
            
            # 3. Initialize PyTorch Model
            self.model = SiameseLSTMAttention(
                vocab_size=self.model_config['vocab_size'],
                embedding_dim=self.model_config['embedding_dim'],
                hidden_dim=self.model_config['hidden_dim'],
                num_layers=self.model_config['num_layers'],
                dropout=self.model_config['dropout']
            ).to(self.device)
            
            model_path = os.path.join(MODELS_DIR, 'phishing_model.pth')
            self.model.load_state_dict(torch.load(model_path, map_location=self.device, weights_only=True))
            self.model.eval()
            
            # 4. Load Phishing Reference Embedding (URL B)
            ref_path = os.path.join(MODELS_DIR, 'phishing_reference_embeddings.pt')
            self.reference_embedding = torch.load(ref_path, map_location=self.device)
            
            logger.info("Model, Tokenizer, and Reference Embeddings loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize PredictorService: {str(e)}")
            raise

    def normalize_url(self, url: str) -> str:
        if not isinstance(url, str):
            return ""
        url = url.strip().lower()
        url = re.sub(r"^https?://", "", url)
        url = re.sub(r"^www\.", "", url)
        return url

    def encode_url(self, url: str) -> list:
        url = str(url)
        encoded = [self.char_to_idx.get(c, self.char_to_idx["<UNK>"]) for c in url]
        encoded = encoded[:self.max_len]
        encoded = encoded + [self.char_to_idx["<PAD>"]] * (self.max_len - len(encoded))
        return encoded

    def predict(self, raw_url: str) -> dict:
        start_time = time.time()

        try:
            # 1. Preprocessing (MUST MATCH TRAINING EXACTLY)
            normalized_url = self.normalize_url(raw_url)
            encoded_url = self.encode_url(normalized_url)
            
            # 2. Inference Pass
            with torch.no_grad():
                tensor_url_a = torch.tensor([encoded_url], dtype=torch.long).to(self.device)
                
                # Get representation for URL A along with character attention weights
                repr_a, attn_weights = self.model.forward_one_branch(tensor_url_a, return_attention=True)
                
                # Use pre-computed phishing cluster center for URL B
                repr_b = self.reference_embedding
                
                # Siamese combination features
                abs_diff = torch.abs(repr_a - repr_b)
                element_prod = repr_a * repr_b
                combined = torch.cat([repr_a, repr_b, abs_diff, element_prod], dim=1)
                
                # Classification Logits
                logits = self.model.classifier(combined)
                
                # Apply sigmoid transformation
                probability = torch.sigmoid(logits).item()

            # 3. Explainable AI: Process Character-Level Attention Weights
            actual_chars = list(normalized_url[:self.max_len])
            actual_len = len(actual_chars)
            
            raw_weights = attn_weights[0, :actual_len, 0].cpu().tolist() if actual_len > 0 else []
            
            if raw_weights:
                min_w = min(raw_weights)
                max_w = max(raw_weights)
                w_range = (max_w - min_w) if (max_w - min_w) > 1e-8 else 1.0
                
                char_tokens = []
                for idx, (ch, w) in enumerate(zip(actual_chars, raw_weights)):
                    norm_intensity = round((w - min_w) / w_range, 4)
                    
                    # Descriptive diagnostic tag for explainability
                    if ch.isdigit():
                        tag = "Numeric / Homoglyph"
                    elif ch in "@!#$%^&*()=+~`[]{}|;:'\",<>?":
                        tag = "Suspicious Symbol"
                    elif ch in "-_.":
                        tag = "Delimiter"
                    elif ch == "/":
                        tag = "Path Separator"
                    elif norm_intensity >= 0.75:
                        tag = "High Saliency Token"
                    elif norm_intensity >= 0.45:
                        tag = "Moderate Focus"
                    else:
                        tag = "Baseline"
                        
                    char_tokens.append({
                        "index": idx,
                        "char": ch,
                        "weight": round(float(w), 6),
                        "intensity": norm_intensity,
                        "tag": tag
                    })
                    
                # Identify prominent multi-character suspicious segments
                suspicious_segments = []
                current_seg = []
                for item in char_tokens:
                    if item["intensity"] >= 0.6:
                        current_seg.append(item["char"])
                    else:
                        if len(current_seg) >= 2:
                            seg_str = "".join(current_seg)
                            if seg_str not in suspicious_segments:
                                suspicious_segments.append(seg_str)
                        current_seg = []
                if len(current_seg) >= 2:
                    seg_str = "".join(current_seg)
                    if seg_str not in suspicious_segments:
                        suspicious_segments.append(seg_str)

                peak_item = max(char_tokens, key=lambda x: x["weight"])
                
                attention_analysis = {
                    "tokens": char_tokens,
                    "peak_char": peak_item["char"],
                    "peak_weight": peak_item["weight"],
                    "peak_intensity": peak_item["intensity"],
                    "peak_index": peak_item["index"],
                    "suspicious_segments": suspicious_segments[:5],
                    "total_characters": actual_len
                }
            else:
                attention_analysis = None
                
            # 4. Calculate Threat Score and Decision
            threat_score = int(round(probability * 100))
            
            # Decision threshold = 0.5 (probability > 0.5 is Phishing, mimicking training criteria)
            if probability > 0.5:
                prediction_label = "Phishing"
                confidence = round(probability, 4)
            else:
                prediction_label = "Legitimate"
                confidence = round(1.0 - probability, 4)

            # 5. Multi-Engine Threat Consensus Scoring
            try:
                from services.threat_consensus import ThreatConsensusEngine
                consensus_engine = ThreatConsensusEngine()
                neural_summary = {
                    "threat_score": threat_score,
                    "prediction": prediction_label,
                    "confidence": confidence,
                    "probability": probability
                }
                consensus_analysis = consensus_engine.compute_consensus(raw_url, neural_summary)
            except Exception as ce:
                logger.warning(f"Consensus engine error: {ce}")
                consensus_analysis = None

            # 6. Metadata
            processing_time_ms = int((time.time() - start_time) * 1000)
            scan_time = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            req_id_suffix = str(uuid.uuid4().int)[:4]
            request_id = f"REQ-{datetime.datetime.now().strftime('%Y%m%d')}-{req_id_suffix}"

            logger.info(
                f"Req: {request_id} | URL: {raw_url} | Predict: {prediction_label} | Prob: {probability:.4f} | Threat: {threat_score} | Time: {processing_time_ms}ms"
            )

            return {
                "request_id": request_id,
                "scan_time": scan_time,
                "url": raw_url,
                "normalized_url": normalized_url,
                "prediction": prediction_label,
                "confidence": confidence,
                "threat_score": threat_score,
                "raw_probability": probability,
                "model": "Siamese-LSTM-Attention",
                "model_version": "1.0",
                "features_analyzed": ["char_sequence_embedding", "siamese_similarity", "bilstm_attention_context"],
                "attention_analysis": attention_analysis,
                "consensus_analysis": consensus_analysis,
                "processing_time_ms": processing_time_ms
            }



        except Exception as e:
            logger.error(f"Prediction error for URL {raw_url}: {str(e)}")
            raise
