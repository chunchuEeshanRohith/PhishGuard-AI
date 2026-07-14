import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-key-please-change"
    # Base directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # Model locations
    MODELS_DIR = os.path.join(BASE_DIR, "models")
    MODEL_PATH = os.path.join(MODELS_DIR, "phishing_model.pkl")
    FEATURE_ORDER_PATH = os.path.join(MODELS_DIR, "feature_order.json")

    # Database
    DATABASE_PATH = os.path.join(BASE_DIR, "database", "app.db")
