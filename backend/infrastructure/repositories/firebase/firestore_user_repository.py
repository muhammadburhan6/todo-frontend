from datetime import datetime, timezone
import hashlib

from google.api_core.exceptions import AlreadyExists

from domain.entities.auth_entities import User
from infrastructure.repositories.firebase.firestore_task_repository import get_firestore_client


class FirestoreUserRepository:
    """Persists app users in Firestore without requiring MongoDB at startup."""

    def __init__(self, client=None):
        self.client = client or get_firestore_client()
        self.collection = self.client.collection("users")

    @staticmethod
    def _document_id(email):
        normalized = str(email).strip().lower()
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    @staticmethod
    def _user(snapshot):
        data = snapshot.to_dict() or {}
        return User(
            user_id=snapshot.id,
            email=data.get("email"),
            password_hash=data.get("password_hash"),
            created_at=data.get("created_at"),
        )

    def create(self, user):
        email = user.email.strip().lower()
        user_id = self._document_id(email)
        created_at = user.created_at or datetime.now(timezone.utc)
        try:
            self.collection.document(user_id).create({
                "email": email,
                "password_hash": user.password_hash,
                "created_at": created_at,
            })
        except AlreadyExists as exc:
            raise ValueError("A user with this email already exists") from exc
        user.id = user_id
        user.email = email
        user.created_at = created_at
        return user

    def get_by_email(self, email):
        if not email:
            return None
        snapshot = self.collection.document(self._document_id(email)).get()
        return self._user(snapshot) if snapshot.exists else None

    def get_by_id(self, user_id):
        if not user_id:
            return None
        snapshot = self.collection.document(str(user_id)).get()
        return self._user(snapshot) if snapshot.exists else None
