import os
from pathlib import Path

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore

from domain.entities.task_entities import Task


PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")


def get_firestore_client():
    key_path = os.getenv("FIREBASE_CREDENTIALS")
    if not key_path:
        raise RuntimeError("FIREBASE_CREDENTIALS is missing from .env")
    key_file = Path(key_path).expanduser()
    if not key_file.is_absolute():
        key_file = PROJECT_ROOT / key_file
    if not key_file.is_file():
        raise RuntimeError("Firebase service account key file was not found")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(str(key_file)))
    return firestore.client()


class FirestoreTaskRepository:
    """Stores tasks in Firestore, isolated by the app's logged-in user ID."""

    def __init__(self, client=None):
        self.collection = (client or get_firestore_client()).collection("tasks")

    @staticmethod
    def _user_key(user_id):
        return str(user_id)

    @staticmethod
    def _task(snapshot):
        data = snapshot.to_dict() or {}
        return Task(
            task_id=snapshot.id,
            title=data.get("title", ""),
            completed=data.get("completed", False),
            user_id=data.get("user_id"),
        )

    def create(self, task):
        if task.user_id is None:
            raise ValueError("Task must be associated with a valid user_id")
        reference = self.collection.document()
        reference.set({
            "title": task.title,
            "completed": task.completed,
            "user_id": self._user_key(task.user_id),
            "created_at": firestore.SERVER_TIMESTAMP,
        })
        task.id = reference.id
        return task

    def get_all(self, user_id=None):
        if user_id is None:
            return []
        snapshots = self.collection.where(
            "user_id", "==", self._user_key(user_id)
        ).stream()
        return [self._task(snapshot) for snapshot in snapshots]

    def get_by_id(self, task_id, user_id=None):
        if user_id is None:
            return None
        snapshot = self.collection.document(str(task_id)).get()
        if not snapshot.exists:
            return None
        task = self._task(snapshot)
        return task if task.user_id == self._user_key(user_id) else None

    def update(self, task_id, task, user_id=None):
        if user_id is None:
            return None
        reference = self.collection.document(str(task_id))
        snapshot = reference.get()
        if not snapshot.exists:
            return None
        if (snapshot.to_dict() or {}).get("user_id") != self._user_key(user_id):
            return None
        reference.update({"title": task.title, "completed": task.completed})
        task.id = str(task_id)
        task.user_id = user_id
        return task

    def delete(self, task_id, user_id=None):
        if user_id is None:
            return False
        reference = self.collection.document(str(task_id))
        snapshot = reference.get()
        if not snapshot.exists:
            return False
        if (snapshot.to_dict() or {}).get("user_id") != self._user_key(user_id):
            return False
        reference.delete()
        return True
