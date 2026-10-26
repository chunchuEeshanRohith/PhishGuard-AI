import re
from flask import Blueprint, request, jsonify
from config import Config
from database import (
    insert_enquiry,
    get_all_enquiries,
    get_enquiry_by_id,
    update_enquiry_status,
    get_enquiry_stats,
)
from utils.auth import generate_admin_token, admin_required

enquiries_bp = Blueprint("enquiries", __name__)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


# ─── Public Endpoints ───────────────────────────────────────────────

@enquiries_bp.route("/contact", methods=["POST"])
@enquiries_bp.route("/enquiries", methods=["POST"])
def submit_enquiry():
    """Public submission endpoint for visitors to submit enquiries.
    Does not expose private messages or previous submissions to public users.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"status": "error", "message": "Invalid JSON payload."}), 400

    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not email:
        return jsonify({"status": "error", "message": "Email address is required."}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({"status": "error", "message": "Invalid email address format."}), 400

    if not message:
        return jsonify({"status": "error", "message": "Message content is required."}), 400

    if len(message) < 10:
        return jsonify({"status": "error", "message": "Message must be at least 10 characters."}), 400

    if len(message) > 2000:
        return jsonify({"status": "error", "message": "Message exceeds maximum length of 2000 characters."}), 400

    try:
        new_enquiry = insert_enquiry(email, message)
        return jsonify({
            "status": "success",
            "message": "Enquiry submitted successfully.",
            "enquiry_id": new_enquiry["id"] if new_enquiry else None
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to persist enquiry."}), 500


# ─── Admin Authentication Endpoint ──────────────────────────────────

@enquiries_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """Authenticates administrator and returns a signed time-bound token."""
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or data.get("adminId") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"status": "error", "message": "Admin ID and Password are required."}), 400

    if username == Config.ADMIN_USERNAME and password == Config.ADMIN_PASSWORD:
        token = generate_admin_token(username)
        return jsonify({
            "status": "success",
            "token": token,
            "user": {
                "username": username,
                "role": "administrator"
            }
        }), 200

    return jsonify({"status": "error", "message": "Invalid administrator credentials."}), 401


# ─── Protected Admin Endpoints ──────────────────────────────────────

@enquiries_bp.route("/admin/enquiries", methods=["GET"])
@admin_required
def list_enquiries():
    """Returns persistent enquiries list and live statistics.
    Protected by server-side authorization token.
    """
    status_filter = request.args.get("status", "all")
    enquiries = get_all_enquiries(status_filter=status_filter)
    stats = get_enquiry_stats()
    return jsonify({
        "status": "success",
        "enquiries": enquiries,
        "stats": stats
    }), 200


@enquiries_bp.route("/admin/enquiries/<int:enquiry_id>", methods=["GET"])
@admin_required
def get_single_enquiry(enquiry_id):
    """Retrieve full details for a specific enquiry."""
    enquiry = get_enquiry_by_id(enquiry_id)
    if not enquiry:
        return jsonify({"status": "error", "message": "Enquiry not found."}), 404
    return jsonify({
        "status": "success",
        "enquiry": enquiry
    }), 200


@enquiries_bp.route("/admin/enquiries/<int:enquiry_id>/status", methods=["PATCH", "PUT"])
@admin_required
def update_status(enquiry_id):
    """Allows an authenticated administrator to update status to 'read', 'replied', or 'unread'."""
    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip().lower()

    valid_statuses = ["unread", "read", "replied"]
    if new_status not in valid_statuses:
        return jsonify({
            "status": "error",
            "message": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        }), 400

    existing = get_enquiry_by_id(enquiry_id)
    if not existing:
        return jsonify({"status": "error", "message": "Enquiry not found."}), 404

    updated = update_enquiry_status(enquiry_id, new_status)
    stats = get_enquiry_stats()

    return jsonify({
        "status": "success",
        "message": f"Enquiry status updated to '{new_status}'.",
        "enquiry": updated,
        "stats": stats
    }), 200
