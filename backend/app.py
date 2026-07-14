from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from utils.response import error_response


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # Max 16KB payloads

    CORS(app)

    @app.errorhandler(400)
    def bad_request(e):
        return error_response("Bad Request.", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response("Unauthorized.", 401)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("Endpoint not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("Method not allowed.", 405)

    @app.errorhandler(413)
    def payload_too_large(e):
        return error_response("Payload too large.", 413)

    @app.errorhandler(422)
    def unprocessable(e):
        return error_response("Unprocessable entity.", 422)

    @app.errorhandler(429)
    def too_many_requests(e):
        return error_response("Too many requests.", 429)

    @app.errorhandler(500)
    def internal_error(e):
        return error_response("Internal server error.", 500)

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({"status": "success", "message": "Backend Running Successfully"})

    from routes.predict import predict_bp
    from routes.history import history_bp

    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5005, debug=False)
