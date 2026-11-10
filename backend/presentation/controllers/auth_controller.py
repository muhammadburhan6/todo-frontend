from flask import jsonify, request, g

from application.dtos.auth_dto import AuthRequestDTO


class AuthController:

    def __init__(self, auth_service):
        self.auth_service = auth_service

    # =========================
    # SIGNUP / REGISTER
    # =========================

    def register(self):
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "message": "JSON data required"
            }), 400

        auth_dto = AuthRequestDTO.from_dict(data)

        if not auth_dto.email or not auth_dto.password:
            return jsonify({
                "message": "Email and password are required"
            }), 400

        try:
            result = self.auth_service.register(auth_dto).to_dict()
            return jsonify({
                "message": "User registered successfully",
                "token": result["token"],
                "user": result["user"]
            }), 201
        except ValueError as e:
            return jsonify({
                "message": str(e)
            }), 400
        except Exception as e:
            return jsonify({
                "message": f"Registration failed: {str(e)}"
            }), 500

    # =========================
    # LOGIN
    # =========================

    def login(self):
        print(f"[LOGIN] Request received: {request.method} {request.path}")
        data = request.get_json(silent=True)

        if not data:
            print("[LOGIN] Response sending: 400 - JSON data required")
            return jsonify({
                "message": "JSON data required"
            }), 400

        auth_dto = AuthRequestDTO.from_dict(data)
        print(f"[LOGIN] Request data: email={auth_dto.email!r}")

        if not auth_dto.email or not auth_dto.password:
            print("[LOGIN] Response sending: 400 - Email and password are required")
            return jsonify({
                "message": "Email and password are required"
            }), 400

        try:
            result = self.auth_service.login(auth_dto).to_dict()
            print(f"[LOGIN] Response sending: 200 - user={result['user']}")
            return jsonify({
                "message": "Login successful",
                "token": result["token"],
                "user": result["user"]
            }), 200
        except ValueError as e:
            print(f"[LOGIN] Response sending: 401 - {e}")
            return jsonify({
                "message": str(e)
            }), 401
        except Exception as e:
            print(f"[LOGIN] Response sending: 500 - {e}")
            return jsonify({
                "message": f"Login failed: {str(e)}"
            }), 500

    # =========================
    # PROFILE / ME (Protected)
    # =========================

    def get_profile(self):
        user = getattr(g, "current_user", None)

        if not user:
            return jsonify({
                "message": "User not authenticated"
            }), 401

        return jsonify({
            "user": user.to_dict()
        }), 200
