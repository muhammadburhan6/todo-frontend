import os
import re
from datetime import datetime, timedelta, timezone

import jwt
from werkzeug.security import generate_password_hash, check_password_hash

from application.dtos.auth_dto import AuthResponseDTO
from domain.entities.auth_entities import User


EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"
DEFAULT_SECRET = "todo_app_jwt_secret_key_2026_super_secure_32bytes!"


class AuthService:

    def __init__(self, user_repository, secret_key=None, database_mode="MongoDB"):
        self.user_repository = user_repository
        self.secret_key = secret_key or os.getenv("JWT_SECRET_KEY", DEFAULT_SECRET)
        self.database_mode = database_mode

    # =========================
    # TOKEN HELPERS
    # =========================

    def generate_token(self, user):
        payload = {
            "user_id": user.id,
            "email": user.email,
            "database_mode": self.database_mode,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(days=7)
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")

    def decode_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            if payload.get("database_mode") != self.database_mode:
                raise ValueError("Database mode changed; please log in again")
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")

    # =========================
    # SIGNUP / REGISTER
    # =========================

    def register(self, auth_dto):
        email = auth_dto.email
        password = auth_dto.password

        if not email or not isinstance(email, str) or not email.strip():
            raise ValueError("Email is required")

        email = email.strip().lower()

        if not re.match(EMAIL_REGEX, email):
            raise ValueError("Invalid email format")

        if not password or not isinstance(password, str):
            raise ValueError("Password is required")

        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")

        existing_user = self.user_repository.get_by_email(email)
        if existing_user:
            raise ValueError("A user with this email already exists")

        # Hash password securely
        password_hash = generate_password_hash(password)

        new_user = User(
            user_id=None,
            email=email,
            password_hash=password_hash
        )

        saved_user = self.user_repository.create(new_user)
        token = self.generate_token(saved_user)

        return AuthResponseDTO(
            user=saved_user.to_dict(),
            token=token
        )

    # =========================
    # LOGIN
    # =========================

    def login(self, auth_dto):
        email = auth_dto.email
        password = auth_dto.password

        if not email or not isinstance(email, str) or not email.strip():
            raise ValueError("Email is required")

        if not password or not isinstance(password, str):
            raise ValueError("Password is required")

        email = email.strip().lower()

        user = self.user_repository.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")

        if not check_password_hash(user.password_hash, password):
            raise ValueError("Invalid email or password")

        token = self.generate_token(user)

        return AuthResponseDTO(
            user=user.to_dict(),
            token=token
        )

    # =========================
    # GET CURRENT USER
    # =========================

    def get_user_by_id(self, user_id):
        return self.user_repository.get_by_id(user_id)
