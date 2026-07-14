import time
import json
import joblib
import logging
import datetime
import uuid
from config import Config
from .feature_extractor import FeatureExtractor

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class PredictorService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PredictorService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        try:
            logger.info("Loading Phishing ML Model...")
            self.model = joblib.load(Config.MODEL_PATH)

            with open(Config.FEATURE_ORDER_PATH, "r") as f:
                self.feature_order = json.load(f)

            self.expected_feature_count = len(self.feature_order)
            self.extractor = FeatureExtractor()
            logger.info(
                f"Model and {self.expected_feature_count} features loaded successfully."
            )
        except Exception as e:
            logger.error(f"Failed to initialize PredictorService: {str(e)}")
            raise

    def predict(self, url: str) -> dict:
        start_time = time.time()

        try:
            # 1. Extract Features
            feature_vector, extracted_dict = self.extractor.extract_features(url)

            if len(feature_vector) != self.expected_feature_count:
                raise ValueError("Feature count mismatch.")

            # 2. Predict Probabilities
            probabilities = self.model.predict_proba([feature_vector])[0]
            phishing_prob = probabilities[0]
            legit_prob = probabilities[1]

            # 3. Calculate True Confidence and Threat Score
            # The confidence of the chosen class
            confidence_raw = max(phishing_prob, legit_prob) * 100
            confidence = round(confidence_raw, 2)

            # Threat score is based purely on the phishing probability [0-100]
            threat_score = int(round(phishing_prob * 100))

            # 4. Decision Layer (Prediction & Risk)
            # Prediction Label Mapping
            if threat_score > 70:
                prediction_label = "Phishing"
            elif threat_score >= 40:
                prediction_label = "Suspicious"
            else:
                prediction_label = "Legitimate"

            # Risk Level Mapping
            if threat_score <= 30:
                risk_level = "Low"
            elif threat_score <= 60:
                risk_level = "Medium"
            elif threat_score <= 80:
                risk_level = "High"
            else:
                risk_level = "Critical"

            # 5. Explainable AI Reasons
            reasons = self._generate_reasons(extracted_dict)

            # 6. Recommendation
            recommendation = self._generate_recommendation(prediction_label)

            # 7. Metadata
            processing_time_ms = int((time.time() - start_time) * 1000)
            scan_time = datetime.datetime.now(datetime.timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
            req_id_suffix = str(uuid.uuid4().int)[:4]
            request_id = (
                f"REQ-{datetime.datetime.now().strftime('%Y%m%d')}-{req_id_suffix}"
            )

            logger.info(
                f"Req: {request_id} | URL: {url} | Predict: {prediction_label} | Threat: {threat_score} | Time: {processing_time_ms}ms"
            )

            return {
                "success": True,
                "request_id": request_id,
                "prediction": prediction_label,
                "confidence": confidence,
                "threat_score": threat_score,
                "risk_level": risk_level,
                "model": "Random Forest",
                "model_version": "v2.0",
                "features_analyzed": self.expected_feature_count,
                "processing_time_ms": processing_time_ms,
                "scan_time": scan_time,
                "reasons": reasons,
                "recommendation": recommendation,
            }

        except Exception as e:
            logger.error(f"Prediction error for URL {url}: {str(e)}")
            raise

    def _generate_reasons(self, features: dict) -> list[str]:
        reasons = []

        # Negative / Suspicious features (-1)
        if features.get("having_IP_Address") == -1:
            reasons.append("IP Address used instead of a standard domain name.")
        if features.get("URL_Length") == -1:
            reasons.append("Excessively long URL detected.")
        if features.get("Shortining_Service") == -1:
            reasons.append("Uses a known URL shortening service.")
        if features.get("having_At_Symbol") == -1:
            reasons.append("Contains '@' symbol, often used to hide the true domain.")
        if features.get("double_slash_redirecting") == -1:
            reasons.append("Suspicious redirect pattern ('//') found in the path.")
        if features.get("Prefix_Suffix") == -1:
            reasons.append(
                "Domain contains hyphens ('-'), which is common in spoofed sites."
            )
        if features.get("having_Sub_Domain") == -1:
            reasons.append(
                "Multiple subdomains detected, which can indicate domain squatting."
            )
        if features.get("SSLfinal_State") == -1:
            reasons.append("Missing or invalid HTTPS protocol.")
        if features.get("port") == -1:
            reasons.append("Non-standard port specified in URL.")
        if features.get("HTTPS_token") == -1:
            reasons.append(
                "The word 'https' is maliciously placed inside the domain name."
            )
        if features.get("Redirect") == -1:
            reasons.append("URL redirects to a different domain immediately.")
        if features.get("DNSRecord") == -1:
            reasons.append("Unable to resolve DNS record for this domain.")

        # Positive / Safe features (1) - to populate reasons for legitimate sites
        if features.get("SSLfinal_State") == 1:
            reasons.append("Valid HTTPS detected.")
        if features.get("Prefix_Suffix") == 1:
            reasons.append("No suspicious symbols or hyphens in domain.")
        if features.get("Shortining_Service") == 1:
            reasons.append("No URL shortener detected.")
        if features.get("URL_Length") == 1:
            reasons.append("Normal URL length.")
        if features.get("having_IP_Address") == 1:
            reasons.append("Standard domain name format.")

        return reasons[:5]

    def _generate_recommendation(self, prediction: str) -> str:
        if prediction == "Legitimate":
            return "Website appears safe. Always verify the domain before entering credentials."
        elif prediction == "Suspicious":
            return "Proceed carefully. This website exhibits unusual patterns that may be risky."
        else:
            return "Do not continue. High risk of phishing detected."
