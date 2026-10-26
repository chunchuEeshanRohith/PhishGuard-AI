from functools import wraps
from flask import request, jsonify
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from config import Config

serializer = URLSafeTimedSerializer(Config.SECRET_KEY, salt="phishguard-admin-auth")


def generate_admin_token(username):
    """Generate a cryptographically signed token valid for 24 hours."""
    return serializer.dumps({"username": username, "role": "admin"})


def verify_admin_token(token, max_age=86400):
    """Verify signed token with expiry (default 24h)."""
    try:
        data = serializer.loads(token, max_age=max_age)
        return data, None
    except SignatureExpired:
        return None, "Session expired. Please log in again."
    except BadSignature:
        return None, "Invalid authentication token."
    except Exception:
        return None, "Authentication failed."


def admin_required(f):
    """Route decorator to enforce server-side authentication and authorization."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({
                "status": "error",
                "message": "Authorization header missing. Admin authentication required."
            }), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "status": "error",
                "message": "Invalid Authorization format. Expected: Bearer <token>"
            }), 401

        token = parts[1]
        data, err = verify_admin_token(token)
        if err or not data:
            return jsonify({
                "status": "error",
                "message": err or "Unauthorized access."
            }), 401

        request.admin_user = data
        return f(*args, **kwargs)

    return decorated_function
