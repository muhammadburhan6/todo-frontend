import os
from pathlib import Path

import certifi
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv

from domain.entities.task_entities import Task


# Load environment variables
load_dotenv(Path(__file__).resolve().parents[3] / ".env")


class MongoTaskRepository:

    def __init__(self, client=None):

        if client:
            self.client = client
        else:
            mongo_uri = os.getenv("MONGODB_URI")

            if not mongo_uri:
                raise RuntimeError(
                    "MONGODB_URI .env file mein nahi mila"
                )

            # certifi supplies an up-to-date CA bundle for MongoDB TLS.
            self.client = MongoClient(
                mongo_uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            self.client.admin.command("ping")

        # Database and collections
        self.db = self.client["todo_database"]
        self.collection = self.db["tasks"]
        self.counters = self.db["counters"]

        # Ensure indexes
        self._setup_numeric_ids()
        try:
            self.collection.create_index("id", unique=True)
            self.collection.create_index("user_id")
        except Exception as e:
            print(f"Warning: Index creation issue: {e}")

    def _setup_numeric_ids(self):
        """Assign 1, 2, 3... to documents created by the old code."""

        counter = self.counters.find_one({"_id": "task_id"}) or {}
        last_id = counter.get("seq", 0)

        highest_task = self.collection.find_one(
            {"id": {"$type": "number"}},
            sort=[("id", -1)]
        )

        if highest_task:
            last_id = max(last_id, highest_task["id"])

        old_documents = self.collection.find(
            {"id": {"$exists": False}},
            {"_id": 1}
        ).sort("_id", 1)

        for document in old_documents:
            last_id += 1
            self.collection.update_one(
                {"_id": document["_id"]},
                {"$set": {"id": last_id}}
            )

        self.counters.update_one(
            {"_id": "task_id"},
            {"$max": {"seq": last_id}},
            upsert=True
        )

    def _next_task_id(self):
        counter = self.counters.find_one_and_update(
            {"_id": "task_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        return counter["seq"]

    @staticmethod
    def _parse_task_id(task_id):
        try:
            numeric_id = int(task_id)
        except (TypeError, ValueError):
            return None

        return numeric_id if numeric_id > 0 else None

    @staticmethod
    def _normalize_user_id(user_id):
        if user_id is None:
            return None
        values = [user_id]
        try:
            values.append(int(user_id))
        except (ValueError, TypeError):
            pass
        values.append(str(user_id))
        return list(set(values))

    # CREATE (Requires user_id)
    def create(self, task):
        if task.user_id is None:
            raise ValueError("Task must be associated with a valid user_id")

        task_id = self._next_task_id()

        task_data = {
            "id": task_id,
            "title": task.title,
            "completed": task.completed,
            "user_id": task.user_id
        }

        self.collection.insert_one(task_data)
        task.id = task_id
        return task

    # READ ALL (STRICTLY SCOPED TO THIS USER ONLY)
    def get_all(self, user_id=None):
        if user_id is None:
            # Strict isolation: Never return any tasks without a valid user_id
            return []

        user_ids = self._normalize_user_id(user_id)
        query = {"user_id": {"$in": user_ids}}

        tasks = []
        documents = self.collection.find(query).sort("id", 1)

        for document in documents:
            task = Task(
                task_id=document["id"],
                title=document["title"],
                completed=document.get("completed", False),
                user_id=document.get("user_id")
            )
            tasks.append(task)

        return tasks

    # READ ONE (STRICTLY SCOPED TO THIS USER ONLY)
    def get_by_id(self, task_id, user_id=None):
        if user_id is None:
            return None

        numeric_id = self._parse_task_id(task_id)
        if numeric_id is None:
            return None

        user_ids = self._normalize_user_id(user_id)
        query = {
            "id": numeric_id,
            "user_id": {"$in": user_ids}
        }

        document = self.collection.find_one(query)
        if document is None:
            return None

        return Task(
            task_id=document["id"],
            title=document["title"],
            completed=document.get("completed", False),
            user_id=document.get("user_id")
        )

    # UPDATE (STRICTLY SCOPED TO THIS USER ONLY)
    def update(self, task_id, task, user_id=None):
        if user_id is None:
            return None

        numeric_id = self._parse_task_id(task_id)
        if numeric_id is None:
            return None

        user_ids = self._normalize_user_id(user_id)
        query = {
            "id": numeric_id,
            "user_id": {"$in": user_ids}
        }

        result = self.collection.update_one(
            query,
            {
                "$set": {
                    "title": task.title,
                    "completed": task.completed
                }
            }
        )

        if result.matched_count == 0:
            return None

        task.id = numeric_id
        task.user_id = user_id
        return task

    # DELETE (STRICTLY SCOPED TO THIS USER ONLY)
    def delete(self, task_id, user_id=None):
        if user_id is None:
            return False

        numeric_id = self._parse_task_id(task_id)
        if numeric_id is None:
            return False

        user_ids = self._normalize_user_id(user_id)
        query = {
            "id": numeric_id,
            "user_id": {"$in": user_ids}
        }

        result = self.collection.delete_one(query)
        return result.deleted_count > 0
