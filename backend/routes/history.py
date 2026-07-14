from flask import Blueprint, jsonify

history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
def get_history():
    return jsonify({"error": "Not implemented yet"}), 501
