import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-key-please-change"
    # Base directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # Model locations
    MODELS_DIR = os.path.join(BASE_DIR, "models")

    # Persistent SQLite Database path
    DATABASE_PATH = os.environ.get("DATABASE_PATH") or os.path.join(BASE_DIR, "data", "phishguard.db")

    # Admin Credentials
    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME") or "admin"
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") or "PhishGuard@2026"
