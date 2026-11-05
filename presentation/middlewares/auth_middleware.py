from functools import wraps
from flask import request, jsonify, g


def token_required(auth_service):
    """
    Decorator to protect routes with JWT Bearer authentication.
    Sets g.current_user on successful validation.
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get("Authorization")

            if not auth_header:
                return jsonify({
                    "message": "Authorization token is missing"
                }), 401

            parts = auth_header.strip().split()

            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
            elif len(parts) == 1:
                token = parts[0]
            else:
                return jsonify({
                    "message": "Invalid Authorization header format. Use 'Bearer <token>'"
                }), 401

            try:
                payload = auth_service.decode_token(token)
            except ValueError as e:
                return jsonify({
                    "message": str(e)
                }), 401

            user_id = payload.get("user_id")
            current_user = auth_service.get_user_by_id(user_id)

            if not current_user:
                return jsonify({
                    "message": "User not found"
                }), 401

            g.current_user = current_user
            return f(*args, **kwargs)

        return decorated
    return decorator
