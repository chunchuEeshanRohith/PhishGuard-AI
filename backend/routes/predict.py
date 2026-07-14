import logging
from flask import Blueprint, request, jsonify
from utils.validators import validate_url_input
from utils.response import error_response
from services.predictor import PredictorService

predict_bp = Blueprint("predict", __name__)
logger = logging.getLogger(__name__)

# Initialize singleton service (loads model into memory)
try:
    predictor_service = PredictorService()
except Exception as e:
    logger.critical(f"Failed to initialize predictor service: {e}")
    predictor_service = None


@predict_bp.route("/predict", methods=["POST"])
def predict():
    if predictor_service is None:
        return error_response("Prediction engine is currently offline.", 500)

    try:
        data = request.get_json()
        if data is None:
            return error_response("Invalid JSON payload.", 400)

        # STEP 1: Validate input
        is_valid, err_msg = validate_url_input(data)
        if not is_valid:
            logger.warning(f"Validation failed: {err_msg}")
            return error_response(err_msg, 400)

        url = data["url"].strip()

        # STEP 2-9: Execute Prediction Pipeline
        result = predictor_service.predict(url)

        # STEP 10: Return Response
        return jsonify(result), 200

    except ValueError as ve:
        logger.error(f"Validation/Model Error: {str(ve)}")
        return error_response("Data mismatch error.", 422)
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}")
        return error_response(
            "An internal server error occurred while processing your request.", 500
        )
