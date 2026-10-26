import logging
from flask import Blueprint, request, jsonify
from utils.validators import validate_url_input
from utils.response import error_response
from services.forensics import run_forensics

forensics_bp = Blueprint("forensics", __name__)
logger = logging.getLogger(__name__)


@forensics_bp.route("/forensics", methods=["POST"])
def forensics():
    try:
        data = request.get_json()
        if data is None:
            return error_response("Invalid JSON payload.", 400)

        is_valid, err_msg = validate_url_input(data)
        if not is_valid:
            return error_response(err_msg, 400)

        url = data["url"].strip()
        result = run_forensics(url)
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Forensics error: {str(e)}")
        return error_response("Forensics analysis failed.", 500)
