import os
from pathlib import Path
from datetime import datetime, timezone

import certifi
from pymongo import MongoClient, ReturnDocument
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv

from domain.repositories.user_repository import UserRepository
from domain.entities.user import User


# Load environment variables
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class MongoUserRepository(UserRepository):

    def __init__(self, client=None):

        if client:
            self.client = client
        else:
            mongo_uri = os.getenv("MONGODB_URI")

            if not mongo_uri:
                raise RuntimeError(
                    "MONGODB_URI .env file mein nahi mila"
                )

            self.client = MongoClient(
                mongo_uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            self.client.admin.command("ping")

        self.db = self.client["todo_database"]
        self.collection = self.db["users"]
        self.counters = self.db["counters"]

        # Ensure unique indexes
        try:
            self.collection.create_index("email", unique=True)
            self.collection.create_index("id", unique=True)
        except Exception as e:
            print(f"Warning: Index creation issue: {e}")

    def _next_user_id(self):
        counter = self.counters.find_one_and_update(
            {"_id": "user_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        return counter["seq"]

    # CREATE USER
    def create(self, user):
        user_id = self._next_user_id()
        created_at = user.created_at or datetime.now(timezone.utc)

        user_data = {
            "id": user_id,
            "email": user.email.lower().strip(),
            "password_hash": user.password_hash,
            "created_at": created_at
        }

        try:
            self.collection.insert_one(user_data)
        except DuplicateKeyError:
            raise ValueError("A user with this email already exists")

        user.id = user_id
        user.created_at = created_at
        return user

    # FIND BY EMAIL
    def get_by_email(self, email):
        if not email:
            return None

        document = self.collection.find_one({
            "email": str(email).lower().strip()
        })

        if document is None:
            return None

        return User(
            user_id=document.get("id"),
            email=document.get("email"),
            password_hash=document.get("password_hash"),
            created_at=document.get("created_at")
        )

    # FIND BY ID
    def get_by_id(self, user_id):
        try:
            numeric_id = int(user_id)
        except (TypeError, ValueError):
            return None

        document = self.collection.find_one({"id": numeric_id})

        if document is None:
            return None

        return User(
            user_id=document.get("id"),
            email=document.get("email"),
            password_hash=document.get("password_hash"),
            created_at=document.get("created_at")
        )
